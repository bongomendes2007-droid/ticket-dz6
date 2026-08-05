// Cria uma order + um pagamento Pix no Mercado Pago para essa order.
//
// ATENCAO: usa o mp_access_token DO ORGANIZADOR (obtido no onboarding OAuth,
// Fase 3.1) pra criar o pagamento — nao o access token da plataforma. Isso
// faz o dinheiro cair direto na conta MP do organizador, com a comissao da
// Ticket DZ6 retida via `application_fee`. Credenciais em uso sao de
// PRODUCAO: qualquer chamada aqui gera um Pix real.
import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";
import { calcularValoresCheckout } from "@/lib/checkout-taxas";

export const dynamic = "force-dynamic";

type BodyRecebido = {
  event_id?: string;
  ticket_batch_id?: string;
  quantidade?: number;
  buyer_name?: string;
  buyer_email?: string;
  buyer_document?: string | null;
};

function erro(mensagem: string, status = 400) {
  return NextResponse.json({ erro: mensagem }, { status });
}

export async function POST(request: Request) {
  let body: BodyRecebido;
  try {
    body = await request.json();
  } catch {
    return erro("JSON inválido no corpo da requisição.");
  }

  const {
    event_id,
    ticket_batch_id,
    quantidade,
    buyer_name,
    buyer_email,
    buyer_document,
  } = body;

  // --- Validacao basica de input ---
  if (!event_id || !ticket_batch_id) {
    return erro("event_id e ticket_batch_id são obrigatórios.");
  }
  if (!Number.isInteger(quantidade) || (quantidade as number) < 1) {
    return erro("Quantidade inválida.");
  }
  if (!buyer_name || buyer_name.trim().length < 3) {
    return erro("Informe o nome completo.");
  }
  if (!buyer_email || !/^\S+@\S+\.\S+$/.test(buyer_email)) {
    return erro("Informe um e-mail válido.");
  }

  // DIAGNOSTICO temporario (bug do "Evento não encontrado" inesperado) —
  // confirma exatamente o que a rota recebeu antes de consultar o banco.
  console.error("[checkout] payload recebido:", {
    event_id,
    ticket_batch_id,
    quantidade,
  });

  let supabase;
  try {
    supabase = createServiceClient();
  } catch (e) {
    console.error("[checkout] createServiceClient falhou:", e);
    return erro(
      "Erro de configuração no servidor. Tente novamente mais tarde.",
      500
    );
  }

  // --- 1) Evento precisa existir e estar publicado ---
  const { data: evento, error: erroEvento } = await supabase
    .from("events")
    .select("id, titulo, status, organizer_id")
    .eq("id", event_id)
    .maybeSingle();

  // IMPORTANTE: nao confundir "a query falhou" (erroEvento — infra, chave
  // invalida, RLS, etc.) com "a linha nao existe" (evento null sem erro).
  // Antes os dois casos caiam na mesma mensagem "Evento não encontrado.",
  // o que escondia problemas reais de configuracao atras de uma mensagem
  // de 404 enganosa.
  if (erroEvento) {
    console.error("[checkout] falha na query de events:", erroEvento);
    return erro("Erro ao verificar o evento. Tente novamente.", 500);
  }
  if (!evento) {
    console.error("[checkout] evento não encontrado para id:", event_id);
    return erro("Evento não encontrado.", 404);
  }
  if (evento.status !== "publicado") {
    return erro("Este evento não está disponível para venda.", 400);
  }

  // --- 2) Lote precisa existir, pertencer ao evento, estar ativo e ter
  //     quantidade disponivel suficiente ---
  const { data: lote, error: erroLote } = await supabase
    .from("ticket_batches")
    .select("id, event_id, nome, preco, quantidade_total, quantidade_vendida, ativo")
    .eq("id", ticket_batch_id)
    .maybeSingle();

  if (erroLote) {
    console.error("[checkout] falha na query de ticket_batches:", erroLote);
    return erro("Erro ao verificar o lote de ingresso. Tente novamente.", 500);
  }
  if (!lote || lote.event_id !== event_id) {
    return erro("Lote de ingresso não encontrado.", 404);
  }
  if (!lote.ativo) {
    return erro("Este lote não está mais disponível.", 400);
  }
  const disponivel = lote.quantidade_total - lote.quantidade_vendida;
  if ((quantidade as number) > disponivel) {
    return erro(
      disponivel > 0
        ? `Apenas ${disponivel} ingresso(s) disponível(is) neste lote.`
        : "Este lote está esgotado.",
      400
    );
  }

  // --- 3) Organizador precisa ter conectado o Mercado Pago ---
  const { data: perfilOrganizador, error: erroPerfil } = await supabase
    .from("profiles")
    .select("mp_access_token, mp_user_id")
    .eq("id", evento.organizer_id)
    .maybeSingle();

  if (erroPerfil) {
    console.error("[checkout] falha na query de profiles:", erroPerfil);
    return erro("Erro ao verificar o organizador. Tente novamente.", 500);
  }
  if (!perfilOrganizador?.mp_access_token) {
    return erro(
      "Organizador ainda não conectou Mercado Pago. Não é possível processar o pagamento.",
      422
    );
  }

  // --- 4) Calcula o split financeiro (ver lib/checkout-taxas.ts) ---
  const qtd = quantidade as number;
  const valores = calcularValoresCheckout(Number(lote.preco), qtd);

  // --- 5) Cria a order como 'pendente' ---
  const { data: order, error: erroOrder } = await supabase
    .from("orders")
    .insert({
      event_id,
      buyer_email: buyer_email.trim(),
      buyer_name: buyer_name.trim(),
      buyer_document: buyer_document?.trim() || null,
      valor_total: valores.valorTotal,
      valor_taxa_gateway: valores.valorTaxaGateway,
      valor_taxa_plataforma: valores.valorTaxaPlataforma,
      valor_organizador: valores.valorOrganizador,
      metodo_pagamento: "pix",
      status: "pendente",
    })
    .select("id")
    .single();

  if (erroOrder || !order) {
    console.error("[checkout] falha ao criar order:", erroOrder);
    return erro("Falha ao registrar o pedido. Tente novamente.", 500);
  }

  // --- 6) Cria o pagamento Pix na conta do ORGANIZADOR via OAuth ---
  const cpfDigitos = buyer_document?.replace(/\D/g, "") || undefined;
  const [primeiroNome, ...resto] = buyer_name.trim().split(/\s+/);

  let pagamentoMp: {
    id?: number;
    status?: string;
    point_of_interaction?: {
      transaction_data?: { qr_code?: string; qr_code_base64?: string };
    };
    message?: string;
  };

  try {
    const respostaMp = await fetch("https://api.mercadopago.com/v1/payments", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${perfilOrganizador.mp_access_token}`,
        "X-Idempotency-Key": order.id,
      },
      body: JSON.stringify({
        transaction_amount: valores.valorTotal,
        payment_method_id: "pix",
        description: `${evento.titulo} — ${lote.nome} x${qtd}`,
        external_reference: order.id,
        application_fee: valores.valorTaxaPlataforma,
        payer: {
          email: buyer_email.trim(),
          first_name: primeiroNome,
          last_name: resto.join(" ") || undefined,
          ...(cpfDigitos
            ? { identification: { type: "CPF", number: cpfDigitos } }
            : {}),
        },
      }),
    });

    pagamentoMp = await respostaMp.json();

    if (!respostaMp.ok || !pagamentoMp.id) {
      console.error("[checkout] MP recusou a criação do pagamento:", pagamentoMp);
      await supabase
        .from("orders")
        .update({ status: "recusado" })
        .eq("id", order.id);
      return erro(
        pagamentoMp.message ?? "O Mercado Pago recusou a criação do pagamento.",
        502
      );
    }
  } catch (e) {
    console.error("[checkout] erro de rede ao criar pagamento MP:", e);
    await supabase.from("orders").update({ status: "recusado" }).eq("id", order.id);
    return erro("Falha de comunicação com o Mercado Pago. Tente novamente.", 502);
  }

  // --- 7) Salva o mp_payment_id na order ---
  const { error: erroSalvarPayment } = await supabase
    .from("orders")
    .update({ mp_payment_id: String(pagamentoMp.id) })
    .eq("id", order.id);

  if (erroSalvarPayment) {
    console.error("[checkout] falha ao salvar mp_payment_id:", erroSalvarPayment);
    // Nao bloqueia a resposta: o pagamento ja foi criado no MP, o comprador
    // precisa ver o QR code. O webhook (Fase 3.3) casa pelo external_reference.
  }

  // --- 8) Retorna os dados do Pix pro frontend exibir ---
  return NextResponse.json({
    order_id: order.id,
    mp_payment_id: pagamentoMp.id,
    status: pagamentoMp.status,
    valor_total: valores.valorTotal,
    qr_code: pagamentoMp.point_of_interaction?.transaction_data?.qr_code ?? null,
    qr_code_base64:
      pagamentoMp.point_of_interaction?.transaction_data?.qr_code_base64 ?? null,
  });
}
