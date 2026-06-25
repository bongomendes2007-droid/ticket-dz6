"use client";

import { useRef } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { EventoCard } from "@/lib/eventos-utils";
import EventCarouselCard from "./EventCarouselCard";

type Props = {
  title: string;
  subtitle?: string;
  eventos: EventoCard[];
  /** link opcional "ver todos" (ex: /?categoria=Shows) */
  verTodosHref?: string;
  id?: string;
};

// Carrossel horizontal estilo Sympla: setas no desktop, swipe no mobile.
// Recebe os dados via props (nunca importa lib de servidor).
export default function EventCarousel({
  title,
  subtitle,
  eventos,
  verTodosHref,
  id,
}: Props) {
  const ref = useRef<HTMLDivElement>(null);

  // Nao renderiza secao vazia — evita "buracos" na home.
  if (!eventos.length) return null;

  const scroll = (dir: 1 | -1) => {
    const el = ref.current;
    if (!el) return;
    el.scrollBy({ left: dir * el.clientWidth * 0.85, behavior: "smooth" });
  };

  return (
    <section id={id} className="section-container py-5 md:py-6">
      <div className="mb-4 flex items-end justify-between gap-4">
        <div className="min-w-0">
          <h2 className="text-xl font-extrabold tracking-tight text-brand-ink md:text-2xl">
            {title}
          </h2>
          {subtitle && (
            <p className="mt-0.5 text-sm text-brand-gray">{subtitle}</p>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {verTodosHref && (
            <Link
              href={verTodosHref}
              className="text-sm font-semibold text-brand-blue transition-colors hover:text-brand-blue-dark"
            >
              Ver todos
            </Link>
          )}
          <div className="hidden gap-2 md:flex">
            <button
              type="button"
              onClick={() => scroll(-1)}
              aria-label="Anterior"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-brand-blue/15 bg-white text-brand-ink shadow-sm transition hover:border-brand-blue hover:text-brand-blue"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={() => scroll(1)}
              aria-label="Próximo"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-brand-blue/15 bg-white text-brand-ink shadow-sm transition hover:border-brand-blue hover:text-brand-blue"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      <div
        ref={ref}
        className="flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {eventos.map((evento) => (
          <EventCarouselCard key={evento.id} evento={evento} />
        ))}
      </div>
    </section>
  );
}
