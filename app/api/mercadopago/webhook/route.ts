// Webhook do Mercado Pago — evento "Pagamentos (legacy)". Confirma pagamentos
// Pix e gera os tickets quando aprovados.
//
// ATENCAO (produção, credenciais reais): qualquer notificação processada aqui
// mexe em dados reais de order/tickets. NÃO chamar manualmente — só o
// simulador de notificações do painel do MP ou um pagamento real batem aqui.
//
// Formato da notificação (legacy): o MP faz POST com `?data.id=<payment_id>`
// na query string e um corpo tipo { type: "payment", data: { id: "..." } }.
import { createHmac, timingSafeEqual, randomUUID, randomBytes } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";

export const dynamic = "force-dynamic";

// Resposta padrao "recebido" — o MP so precisa de um 200 rapido. Erros
// internos são logados, nunca viram status de erro HTTP (senão o MP fica
// reenviando a mesma notificação indefinidamente).
function recebido() {
  return NextResponse.json({ received: true }, { status: 200 });
}

// --- 1) Validação de assinatura (HMAC-SHA256) ------------------------------
// Template oficial do MP: "id:[data.id];request-id:[x-request-id];ts:[ts];"
// `data.id` vem da QUERY STRING da notificação (não do body — o MP é
// explícito sobre isso: usar o id do corpo quebra a validação). `ts` e `v1`
// vêm do header x-signature no formato "ts=169...,v1=abcdef...".
function validarAssinatura(request: NextRequest): boolean {
  const secret = process.env.MERCADOPAGO_WEBHOOK_SECRET;
  const xSignature = request.headers.get("x-signature");
  const xRequestId = request.headers.get("x-request-id");
  const dataId = request.nextUrl.searchParams.get("data.id");

  if (!secret || !xSignature || !xRequestId || !dataId) {
    console.error("[mp-webhook] faltando secret/headers/query pra validar assinatura", {
      temSecret: Boolean(secret),
      temXSignature: Boolean(xSignature),
      temXRequestId: Boolean(xRequestId),
      temDataId: Boolean(dataId),
    });
    return false;
  }

  const partes = Object.fromEntries(
    xSignature.split(",").map((p) => {
      const [k, v] = p.split("=");
      return [k?.trim(), v?.trim()];
    })
  );
  const ts = partes.ts;
  const v1 = partes.v1;
  if (!ts || !v1) {
    console.error("[mp-webhook] x-signature em formato inesperado:", xSignature);
    return false;
  }

  // MP recomenda lowercase no data.id (payment id é numérico, mas seguimos
  // a recomendação oficial por segurança).
  const manifest = `id:${dataId.toLowerCase()};request-id:${xRequestId};ts:${ts};`;
  const hashCalculado = createHmac("sha256", secret).update(manifest).digest("hex");

  const esperado = Buffer.from(hashCalculado, "hex");
  const recebidoBuf = Buffer.from(v1, "hex");

  // Tamanhos diferentes = timingSafeEqual lançaria — trata como invalido
  // sem chamar a comparação (nao vaza nada, so nega).
  if (esperado.length !== recebidoBuf.length) return false;
  return timingSafeEqual(esperado, recebidoBuf);
}

// Codigo do QR: opaco e nao-sequencial (uuid + bytes aleatorios extras),
// pra nao dar pra adivinhar o proximo ingresso a partir de um valido.
function gerarCodigoQr(): string {
  return `${randomUUID()}-${randomBytes(16).toString("hex")}`;
}

export async function POST(request: NextRequest) {
  // --- Passo a) validação de assinatura ANTES de qualquer outra coisa ---
  if (!validarAssinatura(request)) {
    console.error("[mp-webhook] assinatura inválida — requisição rejeitada.");
    return NextResponse.json({ erro: "Assinatura inválida." }, { status: 401 });
  }

  // --- Passo b) id do pagamento (mesma fonte usada na assinatura: query) ---
  const paymentId = request.nextUrl.searchParams.get("data.id");
  if (!paymentId) {
    console.error("[mp-webhook] assinatura válida mas sem data.id na query.");
    return recebido();
  }

  try {
    // --- Passo c) detalhes do pagamento na API do MP ---
    //
    // ATENÇÃO — ponto não testável sem uma notificação real (não simulei):
    // o pagamento foi CRIADO com o access_token do ORGANIZADOR (OAuth,
    // Fase 3.1), não com o token da plataforma. Estou consultando aqui com
    // MERCADOPAGO_ACCESS_TOKEN (plataforma) porque, no modelo de
    // marketplace do MP, a aplicação dona da conexão OAuth (client_id) tem
    // permissão de leitura sobre pagamentos criados através dela — mas não
    // tenho como confirmar isso sem testar contra a API real. Se o teste
    // supervisionado (simulador do MP) retornar 401/403 nessa chamada, o
    // fix é trocar para o mp_access_token do organizador — só que pra isso
    // precisamos saber QUAL organizador antes de ter os dados do pagamento
    // (não dá pra descobrir sem já ter consultado o pagamento), então
    // teríamos que resolver isso com um lookup adicional (ex.: extrair o
    // organizador a partir de alguma outra pista da notificação, se houver).
    const respostaMp = await fetch(
      `https://api.mercadopago.com/v1/payments/${paymentId}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.MERCADOPAGO_ACCESS_TOKEN}`,
        },
      }
    );

    if (!respostaMp.ok) {
      console.error(
        "[mp-webhook] falha ao buscar pagamento na API do MP:",
        respostaMp.status,
        await respostaMp.text()
      );
      return recebido();
    }

    const pagamento: {
      id: number;
      status: string;
      external_reference?: string;
    } = await respostaMp.json();

    if (!pagamento.external_reference) {
      console.error(
        "[mp-webhook] pagamento sem external_reference — não dá pra casar com uma order:",
        pagamento.id
      );
      return recebido();
    }

    const supabase = createServiceClient();

    // --- Passo d) busca a order pelo external_reference (= orders.id) ---
    const { data: order, error: erroOrder } = await supabase
      .from("orders")
      .select("id, status, event_id, ticket_batch_id, quantidade")
      .eq("id", pagamento.external_reference)
      .maybeSingle();

    if (erroOrder) {
      console.error("[mp-webhook] falha ao buscar order:", erroOrder);
      return recebido();
    }
    if (!order) {
      console.error(
        "[mp-webhook] nenhuma order encontrada pra external_reference:",
        pagamento.external_reference
      );
      return recebido();
    }

    // --- Passo e) idempotência — o MP pode reenviar a mesma notificação ---
    if (order.status === "aprovado") {
      const { count: ticketsExistentes } = await supabase
        .from("tickets")
        .select("id", { count: "exact", head: true })
        .eq("order_id", order.id);

      if ((ticketsExistentes ?? 0) > 0) {
        console.log("[mp-webhook] order já processada, ignorando reenvio:", order.id);
        return recebido();
      }
      // status='aprovado' mas SEM tickets: processamento anterior deve ter
      // falhado no meio do caminho. Deixa cair pro bloco de aprovado abaixo
      // pra gerar os tickets que faltaram (idempotente por design: gerar de
      // novo só quando realmente faltam).
    }

    if (pagamento.status === "approved") {
      // --- Passo f) aprova a order + gera os tickets ---
      const { error: erroUpdateOrder } = await supabase
        .from("orders")
        .update({ status: "aprovado", mp_payment_id: String(pagamento.id) })
        .eq("id", order.id);

      if (erroUpdateOrder) {
        console.error("[mp-webhook] falha ao aprovar order:", erroUpdateOrder);
        return recebido();
      }

      // Incrementa quantidade_vendida do lote. Le o valor atual e escreve de
      // volta — sujeito a race condition sob concorrência alta (duas
      // notificações de LOTES DIFERENTES no mesmo instante), aceitável pro
      // volume atual; revisitar com um `rpc` atômico se o volume crescer.
      const { data: lote, error: erroLote } = await supabase
        .from("ticket_batches")
        .select("quantidade_vendida")
        .eq("id", order.ticket_batch_id)
        .maybeSingle();

      if (erroLote || !lote) {
        console.error("[mp-webhook] falha ao ler ticket_batches:", erroLote);
      } else {
        const { error: erroIncrementar } = await supabase
          .from("ticket_batches")
          .update({ quantidade_vendida: lote.quantidade_vendida + order.quantidade })
          .eq("id", order.ticket_batch_id);
        if (erroIncrementar) {
          console.error("[mp-webhook] falha ao incrementar quantidade_vendida:", erroIncrementar);
        }
      }

      const novosTickets = Array.from({ length: order.quantidade }, () => ({
        order_id: order.id,
        event_id: order.event_id,
        ticket_batch_id: order.ticket_batch_id,
        codigo_qr: gerarCodigoQr(),
        status: "valido" as const,
      }));

      const { error: erroTickets } = await supabase.from("tickets").insert(novosTickets);
      if (erroTickets) {
        console.error("[mp-webhook] falha ao criar tickets:", erroTickets);
      } else {
        console.log(
          `[mp-webhook] order ${order.id} aprovada — ${novosTickets.length} ticket(s) gerado(s).`
        );
      }
    } else if (["rejected", "cancelled"].includes(pagamento.status)) {
      // --- Passo g) pagamento recusado/cancelado ---
      const { error: erroRecusar } = await supabase
        .from("orders")
        .update({ status: "recusado" })
        .eq("id", order.id);
      if (erroRecusar) {
        console.error("[mp-webhook] falha ao marcar order como recusada:", erroRecusar);
      }
    } else {
      // pending, in_process, etc. — nada a fazer ainda, só um log.
      console.log(
        `[mp-webhook] pagamento ${pagamento.id} com status '${pagamento.status}', order ${order.id} inalterada.`
      );
    }
  } catch (e) {
    // --- Passo h) qualquer erro interno: loga, mas SEMPRE responde 200 ---
    console.error("[mp-webhook] erro inesperado no processamento:", e);
  }

  return recebido();
}
