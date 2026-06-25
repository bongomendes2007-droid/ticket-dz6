import Link from "next/link";
import { CalendarDays, MapPin } from "lucide-react";
import {
  type EventoCard as Evento,
  formatarData,
  formatarPreco,
} from "@/lib/eventos-utils";

// Card no formato Sympla para uso dentro dos carrosseis horizontais.
// Largura fixa, card inteiro clicavel, hover sutil.
export default function EventCarouselCard({ evento }: { evento: Evento }) {
  return (
    <Link
      href={`/evento/${evento.slug}`}
      className="group flex w-[230px] shrink-0 snap-start flex-col overflow-hidden rounded-2xl border border-brand-blue/10 bg-white shadow-card transition hover:-translate-y-1 hover:shadow-soft sm:w-[260px]"
    >
      {/* Capa */}
      <div className="relative aspect-[16/10] overflow-hidden bg-brand-light">
        {evento.imagem_capa ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={evento.imagem_capa}
            alt={evento.titulo}
            loading="lazy"
            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="h-full w-full bg-hero-gradient" />
        )}
        {evento.categoria && (
          <span className="absolute left-3 top-3 rounded-full bg-brand-orange px-2.5 py-1 text-[11px] font-semibold text-white shadow-sm">
            {evento.categoria}
          </span>
        )}
      </div>

      {/* Conteudo */}
      <div className="flex flex-1 flex-col p-4">
        <h3 className="line-clamp-2 min-h-[2.5rem] text-sm font-bold leading-snug text-brand-ink transition-colors group-hover:text-brand-blue">
          {evento.titulo}
        </h3>

        <div className="mt-2 flex flex-col gap-1.5 text-xs text-brand-gray">
          <span className="flex items-center gap-1.5">
            <CalendarDays className="h-3.5 w-3.5 shrink-0 text-brand-blue" />
            <span className="capitalize">{formatarData(evento.data_evento)}</span>
          </span>
          {evento.local && (
            <span className="flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 shrink-0 text-brand-blue" />
              <span className="line-clamp-1">{evento.local}</span>
            </span>
          )}
        </div>

        <span className="mt-auto pt-3 text-sm font-bold text-brand-blue">
          {formatarPreco(evento.menorPreco)}
        </span>
      </div>
    </Link>
  );
}
