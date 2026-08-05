"use client";

import { useMemo, useState } from "react";
import { X, Ticket, QrCode, Copy, Check } from "lucide-react";
import { initMercadoPago, Payment } from "@mercadopago/sdk-react";
import { calcularValoresCheckout } from "@/lib/checkout-taxas";

const brl = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

let sdkIniciado = false;
function garantirSdkIniciado() {
  if (sdkIniciado) return;
  const publicKey = process.env.NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY;
  if (!publicKey) {
    console.error(
      "[checkout] NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY ausente — o Payment Brick não vai inicializar."
    );
    return;
  }
  initMercadoPago(publicKey, { locale: "pt-BR" });
  sdkIniciado = true;
}

export type LoteDisponivel = {
  id: string;
  nome: string;
  preco: number;
  disponivel: number;
};

type Etapa = "formulario" | "pagamento" | "sucesso";

type RespostaCheckout = {
  order_id: string;
  qr_code: string | null;
  qr_code_base64: string | null;
  erro?: string;
};

export default function CheckoutModal({
  eventoId,
  eventoTitulo,
  lotes,
}: {
  eventoId: string;
  eventoTitulo: string;
  lotes: LoteDisponivel[];
}) {
  const [aberto, setAberto] = useState(false);
  const [etapa, setEtapa] = useState<Etapa>("formulario");

  const [loteId, setLoteId] = useState(lotes[0]?.id ?? "");
  const [quantidade, setQuantidade] = useState(1);
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [cpf, setCpf] = useState("");

  const [erro, setErro] = useState<string | null>(null);
  const [pix, setPix] = useState<RespostaCheckout | null>(null);

  const lote = lotes.find((l) => l.id === loteId) ?? lotes[0];
  const valores = useMemo(
    () => (lote ? calcularValoresCheckout(lote.preco, quantidade) : null),
    [lote, quantidade]
  );

  function abrir() {
    setAberto(true);
    setEtapa("formulario");
    setErro(null);
    setPix(null);
    garantirSdkIniciado();
  }

  function fechar() {
    setAberto(false);
  }

  function validarFormulario(): string | null {
    if (!lote) return "Selecione um lote.";
    if (quantidade < 1 || quantidade > lote.disponivel)
      return `Quantidade deve ser entre 1 e ${lote.disponivel}.`;
    if (nome.trim().length < 3) return "Informe o nome completo.";
    if (!/^\S+@\S+\.\S+$/.test(email)) return "Informe um e-mail válido.";
    return null;
  }

  function continuarParaPagamento() {
    const msg = validarFormulario();
    if (msg) {
      setErro(msg);
      return;
    }
    setErro(null);
    setEtapa("pagamento");
  }

  // Chamado pelo Payment Brick quando o comprador confirma. Cria o pagamento
  // Pix no backend (que usa o mp_access_token do ORGANIZADOR) e guarda o
  // QR code retornado pra exibirmos na tela — o Brick em si nao mostra nada
  // depois disso, quem renderiza o resultado somos nos (abaixo).
  async function aoSubmeterPagamento() {
    if (!lote) return;
    try {
      const resposta = await fetch("/api/checkout/criar-pagamento", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          event_id: eventoId,
          ticket_batch_id: lote.id,
          quantidade,
          buyer_name: nome,
          buyer_email: email,
          buyer_document: cpf || null,
        }),
      });
      const dados: RespostaCheckout = await resposta.json();

      if (!resposta.ok) {
        setErro(dados.erro ?? "Não foi possível gerar o Pix. Tente novamente.");
        throw new Error(dados.erro ?? "erro checkout");
      }

      setPix(dados);
      setEtapa("sucesso");
    } catch (e) {
      // Repropaga pro Brick saber que a submissao falhou (ele mantem o
      // formulario habilitado pra tentar de novo).
      throw e;
    }
  }

  if (!aberto) {
    return (
      <button
        type="button"
        onClick={abrir}
        disabled={lotes.length === 0}
        className="mt-5 w-full rounded-full bg-brand-orange px-5 py-3 text-sm font-semibold text-white shadow-soft transition hover:brightness-95 disabled:cursor-not-allowed disabled:bg-brand-gray/20 disabled:text-brand-gray"
      >
        {lotes.length === 0 ? "Ingressos esgotados" : "Comprar ingresso"}
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center bg-brand-ink/60 p-0 sm:items-center sm:p-4">
      <div className="flex max-h-[92vh] w-full flex-col overflow-hidden rounded-t-3xl bg-white shadow-card sm:max-w-md sm:rounded-3xl">
        <div className="flex items-center justify-between border-b border-brand-blue/10 px-5 py-4">
          <h2 className="font-bold text-brand-ink">{eventoTitulo}</h2>
          <button
            type="button"
            onClick={fechar}
            aria-label="Fechar"
            className="flex h-8 w-8 items-center justify-center rounded-full text-brand-gray transition hover:bg-brand-light"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="overflow-y-auto px-5 py-5">
          {etapa === "formulario" && (
            <FormularioIngresso
              lotes={lotes}
              loteId={loteId}
              setLoteId={setLoteId}
              quantidade={quantidade}
              setQuantidade={setQuantidade}
              nome={nome}
              setNome={setNome}
              email={email}
              setEmail={setEmail}
              cpf={cpf}
              setCpf={setCpf}
              erro={erro}
              valores={valores}
              onContinuar={continuarParaPagamento}
            />
          )}

          {etapa === "pagamento" && valores && (
            <div>
              <ResumoValores valores={valores} />
              {erro && (
                <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
                  {erro}
                </p>
              )}
              <div className="mt-4">
                <Payment
                  initialization={{
                    amount: valores.valorTotal,
                    payer: { email: email || undefined },
                  }}
                  customization={{
                    paymentMethods: {
                      // "pix" vive dentro da categoria bankTransfer no
                      // Payment Brick. Ao declarar `paymentMethods`, o Brick
                      // so mostra o que for listado aqui — nao precisa
                      // excluir explicitamente creditCard/debitCard/etc.
                      bankTransfer: ["pix"],
                    },
                  }}
                  onSubmit={aoSubmeterPagamento}
                  onReady={() => {}}
                  onError={(e) => {
                    console.error("[checkout] Payment Brick erro:", e);
                    setErro("Erro ao carregar o pagamento. Tente novamente.");
                  }}
                />
              </div>
              <button
                type="button"
                onClick={() => setEtapa("formulario")}
                className="mt-3 text-sm font-medium text-brand-gray hover:text-brand-ink"
              >
                ← Voltar
              </button>
            </div>
          )}

          {etapa === "sucesso" && pix && <ResultadoPix pix={pix} />}
        </div>
      </div>
    </div>
  );
}

function FormularioIngresso({
  lotes,
  loteId,
  setLoteId,
  quantidade,
  setQuantidade,
  nome,
  setNome,
  email,
  setEmail,
  cpf,
  setCpf,
  erro,
  valores,
  onContinuar,
}: {
  lotes: LoteDisponivel[];
  loteId: string;
  setLoteId: (v: string) => void;
  quantidade: number;
  setQuantidade: (v: number) => void;
  nome: string;
  setNome: (v: string) => void;
  email: string;
  setEmail: (v: string) => void;
  cpf: string;
  setCpf: (v: string) => void;
  erro: string | null;
  valores: ReturnType<typeof calcularValoresCheckout> | null;
  onContinuar: () => void;
}) {
  const inputClass =
    "w-full rounded-xl border border-brand-blue/15 bg-white px-4 py-2.5 text-sm text-brand-ink outline-none transition focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20";
  const labelClass = "mb-1.5 block text-sm font-medium text-brand-ink";
  const lote = lotes.find((l) => l.id === loteId);

  return (
    <div className="flex flex-col gap-4">
      {lotes.length > 1 && (
        <div>
          <label className={labelClass}>Lote</label>
          <select
            className={inputClass}
            value={loteId}
            onChange={(e) => setLoteId(e.target.value)}
          >
            {lotes.map((l) => (
              <option key={l.id} value={l.id}>
                {l.nome} — {brl.format(l.preco)} ({l.disponivel} disponíveis)
              </option>
            ))}
          </select>
        </div>
      )}

      <div>
        <label className={labelClass}>Quantidade</label>
        <input
          type="number"
          min={1}
          max={lote?.disponivel ?? 1}
          className={inputClass}
          value={quantidade}
          onChange={(e) => setQuantidade(Number(e.target.value))}
        />
        {lote && (
          <p className="mt-1 text-xs text-brand-gray">
            {lote.disponivel} ingresso(s) disponível(is) neste lote.
          </p>
        )}
      </div>

      <div>
        <label className={labelClass}>Nome completo</label>
        <input
          type="text"
          className={inputClass}
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          placeholder="Como está no documento"
        />
      </div>

      <div>
        <label className={labelClass}>E-mail</label>
        <input
          type="email"
          className={inputClass}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="voce@email.com"
        />
      </div>

      <div>
        <label className={labelClass}>CPF (opcional)</label>
        <input
          type="text"
          className={inputClass}
          value={cpf}
          onChange={(e) => setCpf(e.target.value)}
          placeholder="000.000.000-00"
        />
      </div>

      {valores && (
        <div className="rounded-xl bg-brand-light/60 p-4 text-sm text-brand-ink">
          <div className="flex justify-between">
            <span>Ingresso{quantidade > 1 ? "s" : ""}</span>
            <span>{brl.format(valores.precoIngresso)}</span>
          </div>
          <div className="mt-1 flex justify-between text-brand-gray">
            <span>Taxa de pagamento (Pix)</span>
            <span>{brl.format(valores.valorTaxaGateway)}</span>
          </div>
          <div className="mt-2 flex justify-between border-t border-brand-blue/10 pt-2 font-bold">
            <span>Total</span>
            <span>{brl.format(valores.valorTotal)}</span>
          </div>
        </div>
      )}

      {erro && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{erro}</p>
      )}

      <button
        type="button"
        onClick={onContinuar}
        className="mt-1 w-full rounded-full bg-brand-blue px-5 py-3 text-sm font-semibold text-white shadow-soft transition hover:bg-brand-blue-dark"
      >
        Continuar para pagamento
      </button>
    </div>
  );
}

function ResumoValores({ valores }: { valores: ReturnType<typeof calcularValoresCheckout> }) {
  return (
    <div className="rounded-xl bg-brand-light/60 p-4 text-sm text-brand-ink">
      <div className="flex items-center gap-2 font-bold text-brand-blue">
        <Ticket className="h-4 w-4" />
        Pagamento via Pix
      </div>
      <div className="mt-2 flex justify-between border-t border-brand-blue/10 pt-2 font-bold">
        <span>Total a pagar</span>
        <span>{brl.format(valores.valorTotal)}</span>
      </div>
    </div>
  );
}

function ResultadoPix({ pix }: { pix: RespostaCheckout }) {
  const [copiado, setCopiado] = useState(false);

  async function copiar() {
    if (!pix.qr_code) return;
    await navigator.clipboard.writeText(pix.qr_code);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  }

  return (
    <div className="flex flex-col items-center gap-4 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-green-700">
        <QrCode className="h-6 w-6" />
      </span>
      <h3 className="text-lg font-bold text-brand-ink">Pix gerado!</h3>
      <p className="text-sm text-brand-gray">
        Escaneie o QR code ou copie o código abaixo no app do seu banco. Assim
        que o pagamento for confirmado, seu ingresso é liberado.
      </p>

      {pix.qr_code_base64 && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={`data:image/png;base64,${pix.qr_code_base64}`}
          alt="QR code Pix"
          className="h-56 w-56 rounded-xl border border-brand-blue/10"
        />
      )}

      {pix.qr_code && (
        <button
          type="button"
          onClick={copiar}
          className="flex w-full items-center justify-center gap-2 rounded-full border border-brand-blue/15 px-5 py-3 text-sm font-semibold text-brand-ink transition hover:bg-brand-light"
        >
          {copiado ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
          {copiado ? "Código copiado!" : "Copiar código Pix"}
        </button>
      )}
    </div>
  );
}
