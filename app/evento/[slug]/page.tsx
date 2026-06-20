import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CalendarDays, MapPin, Tag } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import Logo from "@/components/Logo";

type Lote = {
  id: string;
  nome: string;
  preco: number;
  ativo: boolean;
};

type Evento = {
  titulo: string;
  descricao: string | null;
  categoria: string | null;
  data_evento: string | null;
  local: string | null;
  imagem_capa: string | null;
  ticket_batches: Lote[];
};

const brl = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

function formatarDataCompleta(data: string | null): string {
  if (!data) return "Data a definir";
  return new Intl.DateTimeFormat("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(data));
}

// Busca o evento publicado pelo slug. A RLS publica garante que so eventos
// com status = 'publicado' sejam retornados ao visitante anonimo.
async function buscarEvento(slug: string): Promise<Evento | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("events")
    .select(
      "titulo, descricao, categoria, data_evento, local, imagem_capa, status, ticket_batches(id, nome, preco, ativo)"
    )
    .eq("slug", slug)
    .eq("status", "publicado")
    .maybeSingle();

  return (data as Evento | null) ?? null;
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const evento = await buscarEvento(params.slug);
  if (!evento) return { title: "Evento não encontrado — Ticket DZ6" };

  return {
    title: `${evento.titulo} — Ticket DZ6`,
    description:
      evento.descricao?.slice(0, 160) ??
      `Garanta seu ingresso para ${evento.titulo} na Ticket DZ6.`,
    openGraph: {
      title: evento.titulo,
      description: evento.descricao?.slice(0, 160) ?? undefined,
      images: evento.imagem_capa ? [evento.imagem_capa] : undefined,
    },
  };
}

export default async function EventoPublicoPage({
  params,
}: {
  params: { slug: string };
}) {
  const evento = await buscarEvento(params.slug);
  if (!evento) notFound();

  const lotes = (evento.ticket_batches ?? []).filter((l) => l.ativo);

  return (
    <main className="min-h-screen bg-white">
      {/* Topo */}
      <header className="border-b border-brand-blue/10 bg-white">
        <div className="section-container flex h-20 items-center">
          <Link href="/" aria-label="Ticket DZ6 — início">
            <Logo height={44} />
          </Link>
        </div>
      </header>

      {/* Capa */}
      <div className="bg-brand-light">
        <div className="section-container py-8">
          <div className="overflow-hidden rounded-3xl bg-white shadow-card">
            {evento.imagem_capa ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={evento.imagem_capa}
                alt={evento.titulo}
                className="h-64 w-full object-cover md:h-96"
              />
            ) : (
              <div className="h-64 w-full bg-hero-gradient md:h-96" />
            )}
          </div>
        </div>
      </div>

      {/* Conteudo */}
      <div className="section-container grid gap-10 py-10 lg:grid-cols-[1fr_360px]">
        <div>
          {evento.categoria && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-orange/10 px-3 py-1 text-sm font-semibold text-brand-orange">
              <Tag className="h-4 w-4" />
              {evento.categoria}
            </span>
          )}

          <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-brand-ink md:text-4xl">
            {evento.titulo}
          </h1>

          <div className="mt-5 flex flex-col gap-3 text-brand-gray">
            <span className="flex items-center gap-3">
              <CalendarDays className="h-5 w-5 shrink-0 text-brand-blue" />
              <span className="capitalize">
                {formatarDataCompleta(evento.data_evento)}
              </span>
            </span>
            {evento.local && (
              <span className="flex items-center gap-3">
                <MapPin className="h-5 w-5 shrink-0 text-brand-blue" />
                {evento.local}
              </span>
            )}
          </div>

          {evento.descricao && (
            <div className="mt-8">
              <h2 className="text-lg font-bold text-brand-ink">
                Sobre o evento
              </h2>
              <p className="mt-3 whitespace-pre-line leading-relaxed text-brand-gray">
                {evento.descricao}
              </p>
            </div>
          )}
        </div>

        {/* Ingressos */}
        <aside className="lg:sticky lg:top-8 lg:self-start">
          <div className="rounded-2xl border border-brand-blue/10 bg-white p-6 shadow-card">
            <h2 className="font-bold text-brand-ink">Ingressos</h2>

            {lotes.length === 0 ? (
              <p className="mt-3 text-sm text-brand-gray">
                Nenhum lote disponível no momento.
              </p>
            ) : (
              <ul className="mt-4 flex flex-col gap-3">
                {lotes.map((lote) => (
                  <li
                    key={lote.id}
                    className="flex items-center justify-between rounded-xl border border-brand-blue/10 bg-brand-light/40 px-4 py-3"
                  >
                    <span className="text-sm font-semibold text-brand-ink">
                      {lote.nome}
                    </span>
                    <span className="text-sm font-bold text-brand-blue">
                      {brl.format(Number(lote.preco))}
                    </span>
                  </li>
                ))}
              </ul>
            )}

            <button
              type="button"
              disabled
              className="mt-5 w-full cursor-not-allowed rounded-full bg-brand-gray/20 px-5 py-3 text-sm font-semibold text-brand-gray"
              title="A venda de ingressos estará disponível em breve"
            >
              Comprar ingresso — Em breve
            </button>
            <p className="mt-2 text-center text-xs text-brand-gray">
              A venda de ingressos será liberada em breve.
            </p>
          </div>
        </aside>
      </div>
    </main>
  );
}
