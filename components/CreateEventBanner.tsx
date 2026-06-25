import Link from "next/link";
import { ArrowRight, Ticket } from "lucide-react";

// Faixa de chamada para organizadores criarem eventos.
export default function CreateEventBanner() {
  return (
    <section className="section-container py-10 md:py-14">
      <div className="relative overflow-hidden rounded-3xl bg-brand-blue px-6 py-10 shadow-soft md:px-12 md:py-14">
        {/* Brilho decorativo */}
        <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-brand-orange/30 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -left-10 h-64 w-64 rounded-full bg-white/10 blur-3xl" />

        <div className="relative flex flex-col items-start gap-6 md:flex-row md:items-center md:justify-between">
          <div className="max-w-xl">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold text-white">
              <Ticket className="h-4 w-4" />
              Para organizadores
            </span>
            <h2 className="mt-4 text-2xl font-extrabold tracking-tight text-white md:text-3xl">
              Crie eventos e venda ingressos com facilidade
            </h2>
            <p className="mt-3 text-white/85">
              Publique seu evento em minutos, gerencie lotes e acompanhe as
              vendas em tempo real na Ticket DZ6.
            </p>
          </div>

          <Link
            href="/cadastro"
            className="inline-flex shrink-0 items-center gap-2 rounded-full bg-brand-orange px-6 py-3 text-sm font-bold text-white shadow-soft transition hover:brightness-95"
          >
            Criar meu evento
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
