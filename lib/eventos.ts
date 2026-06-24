// Funções de busca de dados — APENAS para Server Components.
// Usa next/headers via lib/supabase/server.ts.
// Nunca importe este arquivo em Client Components ('use client').
import { createClient } from "@/lib/supabase/server";
import type { EventoCard } from "@/lib/eventos-utils";

export type { EventoCard } from "@/lib/eventos-utils";
export { formatarData, formatarHora, formatarPreco } from "@/lib/eventos-utils";

type EventoRow = {
  id: string;
  titulo: string;
  slug: string;
  categoria: string | null;
  data_evento: string | null;
  local: string | null;
  imagem_capa: string | null;
  ticket_batches: { preco: number; ativo: boolean }[] | null;
};

function menorPrecoAtivo(
  lotes: EventoRow["ticket_batches"]
): number | null {
  const ativos = (lotes ?? [])
    .filter((l) => l.ativo)
    .map((l) => Number(l.preco));
  if (ativos.length === 0) return null;
  return Math.min(...ativos);
}

export async function buscarEventosPublicados(): Promise<EventoCard[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("events")
    .select(
      "id, titulo, slug, categoria, data_evento, local, imagem_capa, ticket_batches(preco, ativo)"
    )
    .eq("status", "publicado")
    .order("data_evento", { ascending: true });

  if (error) {
    console.error("[marketplace] erro ao buscar eventos:", error.message);
    return [];
  }

  return (data as EventoRow[]).map((e) => ({
    id: e.id,
    titulo: e.titulo,
    slug: e.slug,
    categoria: e.categoria,
    data_evento: e.data_evento,
    local: e.local,
    imagem_capa: e.imagem_capa,
    menorPreco: menorPrecoAtivo(e.ticket_batches),
  }));
}
