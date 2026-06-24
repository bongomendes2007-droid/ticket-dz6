"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CalendarDays, ChevronLeft, ChevronRight, MapPin } from "lucide-react";
import {
  type EventoCard,
  formatarData,
  formatarPreco,
} from "@/lib/eventos-utils";

export default function FeaturedCarousel({
  eventos,
}: {
  eventos: EventoCard[];
}) {
  const [atual, setAtual] = useState(0);
  const total = eventos.length;

  // Auto-avanca a cada 5s (so quando ha mais de um destaque).
  useEffect(() => {
    if (total <= 1) return;
    const id = setInterval(() => setAtual((i) => (i + 1) % total), 5000);
    return () => clearInterval(id);
  }, [total]);

  if (total === 0) return null;

  const ir = (i: number) => setAtual((i + total) % total);

  return (
    <section className="section-container pt-8">
      <div className="relative overflow-hidden rounded-3xl shadow-card">
        {/* Slides */}
        <div
          className="flex transition-transform duration-500 ease-out"
          style={{ transform: `translateX(-${atual * 100}%)` }}
        >
          {eventos.map((evento) => (
            <Link
              key={evento.id}
              href={`/evento/${evento.slug}`}
              className="relative block h-64 w-full shrink-0 bg-brand-ink md:h-96"
            >
              {evento.imagem_capa ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={evento.imagem_capa}
                  alt={evento.titulo}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="h-full w-full bg-hero-gradient" />
              )}

              {/* Gradiente para legibilidade do texto */}
              <div className="absolute inset-0 bg-gradient-to-t from-brand-ink/90 via-brand-ink/30 to-transparent" />

              <div className="absolute inset-x-0 bottom-0 p-6 md:p-10">
                {evento.categoria && (
                  <span className="inline-block rounded-full bg-brand-orange px-3 py-1 text-xs font-semibold text-white">
                    {evento.categoria}
                  </span>
                )}
                <h2 className="mt-3 max-w-2xl text-2xl font-extrabold tracking-tight text-white md:text-4xl">
                  {evento.titulo}
                </h2>
                <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-white/85">
                  <span className="flex items-center gap-2">
                    <CalendarDays className="h-4 w-4" />
                    <span className="capitalize">
                      {formatarData(evento.data_evento)}
                    </span>
                  </span>
                  {evento.local && (
                    <span className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      <span className="line-clamp-1">{evento.local}</span>
                    </span>
                  )}
                  <span className="font-semibold text-white">
                    {formatarPreco(evento.menorPreco)}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Controles (so com mais de um) */}
        {total > 1 && (
          <>
            <button
              type="button"
              onClick={() => ir(atual - 1)}
              aria-label="Anterior"
              className="absolute left-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/80 text-brand-ink shadow-soft backdrop-blur transition hover:bg-white"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={() => ir(atual + 1)}
              aria-label="Próximo"
              className="absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/80 text-brand-ink shadow-soft backdrop-blur transition hover:bg-white"
            >
              <ChevronRight className="h-5 w-5" />
            </button>

            <div className="absolute bottom-4 right-6 flex gap-2">
              {eventos.map((e, i) => (
                <button
                  key={e.id}
                  type="button"
                  onClick={() => ir(i)}
                  aria-label={`Ir para o destaque ${i + 1}`}
                  className={`h-2 rounded-full transition-all ${
                    i === atual ? "w-6 bg-white" : "w-2 bg-white/50"
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
