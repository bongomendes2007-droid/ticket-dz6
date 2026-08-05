import { CheckCircle2, CreditCard } from "lucide-react";

// Card de status/onboarding do Mercado Pago no painel do organizador.
// - Nao conectado: botao que inicia o OAuth (GET /api/mercadopago/connect).
// - Conectado: status "Conectado" + opcoes de reconectar/desconectar.
export default function ConectarMercadoPago({
  conectado,
}: {
  conectado: boolean;
}) {
  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-brand-blue/10 bg-white p-5 shadow-card sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        <span
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
            conectado
              ? "bg-green-100 text-green-700"
              : "bg-brand-light text-brand-blue"
          }`}
        >
          {conectado ? (
            <CheckCircle2 className="h-6 w-6" />
          ) : (
            <CreditCard className="h-6 w-6" />
          )}
        </span>
        <div>
          <h2 className="font-bold text-brand-ink">Mercado Pago</h2>
          <p className="text-sm text-brand-gray">
            {conectado
              ? "Conta conectada — você já pode receber pelos seus eventos."
              : "Conecte sua conta para receber pelos ingressos vendidos."}
          </p>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        {conectado ? (
          <>
            <a
              href="/api/mercadopago/connect"
              className="rounded-full border border-brand-blue/15 px-4 py-2 text-sm font-semibold text-brand-ink transition hover:bg-brand-light"
            >
              Reconectar
            </a>
            <form action="/api/mercadopago/disconnect" method="post">
              <button
                type="submit"
                className="rounded-full border border-red-200 px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50"
              >
                Desconectar
              </button>
            </form>
          </>
        ) : (
          <a
            href="/api/mercadopago/connect"
            className="inline-flex items-center gap-2 rounded-full bg-brand-blue px-5 py-2.5 text-sm font-semibold text-white shadow-soft transition hover:bg-brand-blue-dark"
          >
            <CreditCard className="h-4 w-4" />
            Conectar Mercado Pago
          </a>
        )}
      </div>
    </div>
  );
}
