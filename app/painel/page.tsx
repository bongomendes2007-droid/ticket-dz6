import Link from "next/link";
import { Plus, CalendarDays, MapPin, Ticket } from "lucide-react";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type EventoComLotes = {
  id: string;
  titulo: string;
  data_evento: string | null;
  local: string | null;
  status: string;
  imagem_capa: string | null;
  slug: string;
  ticket_batches: { count: number }[];
};

const STATUS_INFO: Record<string, { label: string; classe: string }> = {
  rascunho: { label: "Rascunho", classe: "bg-brand-gray/15 text-brand-gray" },
  publicado: { label: "Publicado", classe: "bg-green-100 text-green-700" },
  encerrado: { label: "Encerrado", classe: "bg-red-100 text-red-700" },
};

function formatarData(data: string | null): string {
  if (!data) return "Data a definir";
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(data));
}

export default async function PainelPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Filtra explicitamente pelos eventos do organizador. (A policy publica
  // de RLS tambem deixaria ver eventos publicados de terceiros, por isso o
  // .eq aqui e necessario para listar apenas os proprios.)
  const { data: eventos } = await supabase
    .from("events")
    .select(
      "id, titulo, data_evento, local, status, imagem_capa, slug, ticket_batches(count)"
    )
    .eq("organizer_id", user?.id ?? "")
    .order("criado_em", { ascending: false });

  const lista = (eventos ?? []) as EventoComLotes[];

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-brand-ink">Meus eventos</h1>
          <p className="mt-1 text-sm text-brand-gray">
            Gerencie seus eventos e ingressos.
          </p>
        </div>
        <Link
          href="/painel/eventos/novo"
          className="inline-flex items-center justify-center gap-2 rounded-full bg-brand-blue px-5 py-3 text-sm font-semibold text-white shadow-soft transition hover:bg-brand-blue-dark"
        >
          <Plus className="h-4 w-4" />
          Criar novo evento
        </Link>
      </div>

      {lista.length === 0 ? (
        <EstadoVazio />
      ) : (
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {lista.map((evento) => (
            <CardEvento key={evento.id} evento={evento} />
          ))}
        </div>
      )}
    </div>
  );
}

function EstadoVazio() {
  return (
    <div className="mt-10 flex flex-col items-center justify-center rounded-2xl border border-dashed border-brand-blue/20 bg-white p-12 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-light text-brand-blue">
        <Ticket className="h-7 w-7" />
      </span>
      <h2 className="mt-4 text-lg font-bold text-brand-ink">
        Você ainda não criou eventos
      </h2>
      <p className="mt-1 max-w-sm text-sm text-brand-gray">
        Crie seu primeiro evento, configure os lotes de ingressos e publique
        para começar a vender.
      </p>
      <Link
        href="/painel/eventos/novo"
        className="mt-6 inline-flex items-center gap-2 rounded-full bg-brand-blue px-5 py-3 text-sm font-semibold text-white shadow-soft transition hover:bg-brand-blue-dark"
      >
        <Plus className="h-4 w-4" />
        Criar evento
      </Link>
    </div>
  );
}

function CardEvento({ evento }: { evento: EventoComLotes }) {
  const status = STATUS_INFO[evento.status] ?? STATUS_INFO.rascunho;
  const qtdLotes = evento.ticket_batches?.[0]?.count ?? 0;

  return (
    <div className="overflow-hidden rounded-2xl border border-brand-blue/10 bg-white shadow-card transition hover:-translate-y-1 hover:shadow-soft">
      <div className="relative h-40 w-full bg-brand-light">
        {evento.imagem_capa ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={evento.imagem_capa}
            alt={evento.titulo}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-brand-blue/30">
            <Ticket className="h-10 w-10" />
          </div>
        )}
        <span
          className={`absolute right-3 top-3 rounded-full px-3 py-1 text-xs font-semibold ${status.classe}`}
        >
          {status.label}
        </span>
      </div>

      <div className="p-5">
        <h3 className="line-clamp-2 font-bold text-brand-ink">
          {evento.titulo}
        </h3>
        <div className="mt-3 flex flex-col gap-1.5 text-sm text-brand-gray">
          <span className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4 shrink-0 text-brand-blue" />
            {formatarData(evento.data_evento)}
          </span>
          {evento.local && (
            <span className="flex items-center gap-2">
              <MapPin className="h-4 w-4 shrink-0 text-brand-blue" />
              <span className="line-clamp-1">{evento.local}</span>
            </span>
          )}
          <span className="flex items-center gap-2">
            <Ticket className="h-4 w-4 shrink-0 text-brand-blue" />
            {qtdLotes} {qtdLotes === 1 ? "lote" : "lotes"}
          </span>
        </div>

        {evento.status === "publicado" && (
          <Link
            href={`/evento/${evento.slug}`}
            className="mt-4 inline-block text-sm font-semibold text-brand-blue hover:underline"
          >
            Ver página pública →
          </Link>
        )}
      </div>
    </div>
  );
}
