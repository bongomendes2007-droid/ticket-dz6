// Tipos e utilitários puros — sem dependências de servidor (next/headers,
// @supabase/ssr). Pode ser importado por Client Components e Server Components.

export type EventoCard = {
  id: string;
  titulo: string;
  slug: string;
  categoria: string | null;
  data_evento: string | null;
  local: string | null;
  imagem_capa: string | null;
  menorPreco: number | null;
};

const brl = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

const fmtData = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

const fmtHora = new Intl.DateTimeFormat("pt-BR", {
  hour: "2-digit",
  minute: "2-digit",
});

export function formatarData(data: string | null): string {
  if (!data) return "Data a definir";
  return fmtData.format(new Date(data)).replace(".", "");
}

export function formatarHora(data: string | null): string {
  if (!data) return "--:--";
  return fmtHora.format(new Date(data));
}

export function formatarPreco(menorPreco: number | null): string {
  if (menorPreco === null) return "Em breve";
  if (menorPreco <= 0) return "Gratuito";
  return `A partir de ${brl.format(menorPreco)}`;
}
