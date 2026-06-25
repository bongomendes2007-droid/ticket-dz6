import Link from "next/link";
import { CalendarX, X } from "lucide-react";
import EventCard from "./EventCard";
import type { EventoCard } from "@/lib/eventos-utils";

// Visao de resultados quando ha um filtro ativo (busca, categoria ou cidade).
// Renderizada no servidor — recebe a lista ja filtrada.
export default function FilteredResults({
  eventos,
  descricao,
}: {
  eventos: EventoCard[];
  descricao: string;
}) {
  return (
    <section className="section-container py-10 md:py-14">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-brand-orange">
            Resultados
          </p>
          <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-brand-ink md:text-3xl">
            {descricao}
          </h1>
          <p className="mt-1 text-sm text-brand-gray">
            {eventos.length} {eventos.length === 1 ? "evento" : "eventos"}{" "}
            encontrado{eventos.length === 1 ? "" : "s"}
          </p>
        </div>
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-full border border-brand-blue/15 bg-white px-4 py-2 text-sm font-semibold text-brand-ink transition hover:border-brand-blue hover:text-brand-blue"
        >
          <X className="h-4 w-4" />
          Limpar filtros
        </Link>
      </div>

      {eventos.length === 0 ? (
        <div className="mt-10 flex flex-col items-center justify-center rounded-2xl border border-dashed border-brand-blue/20 bg-brand-light/50 px-6 py-16 text-center">
          <CalendarX className="h-10 w-10 text-brand-blue/40" />
          <p className="mt-4 text-base font-semibold text-brand-ink">
            Nenhum evento encontrado
          </p>
          <p className="mt-1 text-sm text-brand-gray">
            Tente outra busca, categoria ou cidade.
          </p>
          <Link
            href="/"
            className="mt-6 rounded-full bg-brand-blue px-5 py-2.5 text-sm font-semibold text-white shadow-soft transition hover:bg-brand-blue-dark"
          >
            Ver todos os eventos
          </Link>
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {eventos.map((evento) => (
            <EventCard key={evento.id} evento={evento} />
          ))}
        </div>
      )}
    </section>
  );
}
