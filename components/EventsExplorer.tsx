"use client";

import { useMemo, useState } from "react";
import { CalendarX, Search } from "lucide-react";
import { CATEGORIAS } from "@/lib/categorias";
import type { EventoCard } from "@/lib/eventos-utils";
import EventCardComp from "@/components/EventCard";

// Normaliza para busca sem diferenciar maiusculas/acentos.
function normalizar(texto: string): string {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
}

export default function EventsExplorer({ eventos }: { eventos: EventoCard[] }) {
  const [busca, setBusca] = useState("");
  const [categoria, setCategoria] = useState("");

  const filtrados = useMemo(() => {
    const termo = normalizar(busca.trim());
    return eventos.filter((e) => {
      // Filtro por categoria
      if (categoria && e.categoria !== categoria) return false;
      // Busca por titulo ou local/cidade
      if (termo) {
        const alvo = normalizar(`${e.titulo} ${e.local ?? ""}`);
        if (!alvo.includes(termo)) return false;
      }
      return true;
    });
  }, [eventos, busca, categoria]);

  return (
    <section id="eventos" className="section-container py-12 md:py-16">
      {/* Busca + filtro */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-brand-gray" />
          <input
            type="search"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar evento por nome ou cidade..."
            className="w-full rounded-full border border-brand-blue/15 bg-white py-3 pl-12 pr-4 text-sm text-brand-ink outline-none transition placeholder:text-brand-gray/70 focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20"
            aria-label="Buscar eventos"
          />
        </div>
        <select
          value={categoria}
          onChange={(e) => setCategoria(e.target.value)}
          className="rounded-full border border-brand-blue/15 bg-white px-5 py-3 text-sm font-medium text-brand-ink outline-none transition focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20 sm:w-64"
          aria-label="Filtrar por categoria"
        >
          <option value="">Todas as categorias</option>
          {CATEGORIAS.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      {/* Titulo do grid */}
      <div className="mt-10 flex items-end justify-between gap-4">
        <h2 className="text-2xl font-extrabold tracking-tight text-brand-ink md:text-3xl">
          Eventos em destaque
        </h2>
        {filtrados.length > 0 && (
          <span className="text-sm text-brand-gray">
            {filtrados.length}{" "}
            {filtrados.length === 1 ? "evento" : "eventos"}
          </span>
        )}
      </div>

      {/* Grid ou estado vazio */}
      {filtrados.length === 0 ? (
        <div className="mt-8 flex flex-col items-center justify-center rounded-2xl border border-dashed border-brand-blue/20 bg-brand-light/50 px-6 py-16 text-center">
          <CalendarX className="h-10 w-10 text-brand-blue/40" />
          <p className="mt-4 text-base font-semibold text-brand-ink">
            {eventos.length === 0
              ? "Nenhum evento disponível no momento"
              : "Nenhum evento encontrado"}
          </p>
          <p className="mt-1 text-sm text-brand-gray">
            {eventos.length === 0
              ? "Volte em breve — novos eventos estão a caminho."
              : "Tente outra busca ou categoria."}
          </p>
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtrados.map((evento) => (
            <EventCardComp key={evento.id} evento={evento} />
          ))}
        </div>
      )}
    </section>
  );
}
