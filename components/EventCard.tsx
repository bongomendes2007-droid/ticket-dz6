import Link from "next/link";
import { CalendarDays, Clock, MapPin } from "lucide-react";
import {
  type EventoCard as Evento,
  formatarData,
  formatarHora,
  formatarPreco,
} from "@/lib/eventos-utils";

export default function EventCard({ evento }: { evento: Evento }) {
  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-brand-blue/10 bg-white shadow-card transition hover:-translate-y-1 hover:shadow-soft">
      {/* Capa */}
      <Link
        href={`/evento/${evento.slug}`}
        className="relative block aspect-[16/10] overflow-hidden bg-brand-light"
      >
        {evento.imagem_capa ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={evento.imagem_capa}
            alt={evento.titulo}
            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="h-full w-full bg-hero-gradient" />
        )}

        {evento.categoria && (
          <span className="absolute left-3 top-3 rounded-full bg-brand-orange px-3 py-1 text-xs font-semibold text-white shadow-sm">
            {evento.categoria}
          </span>
        )}
      </Link>

      {/* Conteudo */}
      <div className="flex flex-1 flex-col p-5">
        <h3 className="line-clamp-2 text-base font-bold text-brand-ink">
          <Link href={`/evento/${evento.slug}`} className="hover:text-brand-blue">
            {evento.titulo}
          </Link>
        </h3>

        <div className="mt-3 flex flex-col gap-2 text-sm text-brand-gray">
          <span className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4 shrink-0 text-brand-blue" />
            <span className="capitalize">{formatarData(evento.data_evento)}</span>
          </span>
          <span className="flex items-center gap-2">
            <Clock className="h-4 w-4 shrink-0 text-brand-blue" />
            {formatarHora(evento.data_evento)}
          </span>
          {evento.local && (
            <span className="flex items-center gap-2">
              <MapPin className="h-4 w-4 shrink-0 text-brand-blue" />
              <span className="line-clamp-1">{evento.local}</span>
            </span>
          )}
        </div>

        {/* Preco + acao */}
        <div className="mt-5 flex items-center justify-between gap-3 border-t border-brand-blue/10 pt-4">
          <span className="text-sm font-bold text-brand-ink">
            {formatarPreco(evento.menorPreco)}
          </span>
          <Link
            href={`/evento/${evento.slug}`}
            className="rounded-full bg-brand-blue px-4 py-2 text-sm font-semibold text-white shadow-soft transition hover:bg-brand-blue-dark"
          >
            Comprar
          </Link>
        </div>
      </div>
    </article>
  );
}
