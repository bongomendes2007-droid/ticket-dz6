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

// Normaliza texto para busca/comparacao (sem maiusculas nem acentos).
export function normalizar(texto: string): string {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
}

// Tenta extrair o nome da cidade a partir do campo `local` (texto livre).
// Estrategia: ultimo segmento separado por virgula, removendo " - UF" no fim.
export function cidadeDe(local: string | null): string | null {
  if (!local) return null;
  const partes = local
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  let cidade = partes.length ? partes[partes.length - 1] : local.trim();
  cidade = cidade.replace(/\s*-\s*[A-Za-z]{2}\s*$/, "").trim();
  return cidade || null;
}
