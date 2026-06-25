import MarketplaceNavbar from "@/components/MarketplaceNavbar";
import FeaturedCarousel from "@/components/FeaturedCarousel";
import CollectionsRow from "@/components/CollectionsRow";
import EventCarousel from "@/components/EventCarousel";
import CitiesSection, { type CidadeCard } from "@/components/CitiesSection";
import CreateEventBanner from "@/components/CreateEventBanner";
import FilteredResults from "@/components/FilteredResults";
import Faq from "@/components/Faq";
import Footer from "@/components/Footer";
import { CalendarX } from "lucide-react";
import { buscarEventosPublicados } from "@/lib/eventos";
import { CATEGORIAS } from "@/lib/categorias";
import { cidadeDe, normalizar } from "@/lib/eventos-utils";

// SSR: sempre busca os eventos atuais do banco (bom para SEO e dados frescos).
export const dynamic = "force-dynamic";

type Search = { q?: string; categoria?: string; cidade?: string };

export default async function Home({
  searchParams,
}: {
  searchParams: Search;
}) {
  const eventos = await buscarEventosPublicados();

  // Cidades distintas (para navbar, footer e secao "na sua cidade").
  const cidadesMap = new Map<string, CidadeCard>();
  for (const e of eventos) {
    const nome = cidadeDe(e.local);
    if (!nome) continue;
    const chave = normalizar(nome);
    const atual = cidadesMap.get(chave);
    if (atual) {
      atual.total += 1;
      if (!atual.imagem) atual.imagem = e.imagem_capa;
    } else {
      cidadesMap.set(chave, { nome, imagem: e.imagem_capa, total: 1 });
    }
  }
  const cidades = Array.from(cidadesMap.values()).sort(
    (a, b) => b.total - a.total
  );
  const nomesCidades = cidades.map((c) => c.nome);

  const q = (searchParams?.q ?? "").trim();
  const categoria = (searchParams?.categoria ?? "").trim();
  const cidade = (searchParams?.cidade ?? "").trim();
  const filtroAtivo = Boolean(q || categoria || cidade);

  // ── Visao filtrada (busca / categoria / cidade) ───────────────────────────
  if (filtroAtivo) {
    const termo = normalizar(q);
    const cidadeNorm = normalizar(cidade);
    const filtrados = eventos.filter((e) => {
      if (categoria && e.categoria !== categoria) return false;
      if (cidade) {
        const c = cidadeDe(e.local);
        if (!c || normalizar(c) !== cidadeNorm) return false;
      }
      if (termo) {
        const alvo = normalizar(
          `${e.titulo} ${e.local ?? ""} ${e.categoria ?? ""}`
        );
        if (!alvo.includes(termo)) return false;
      }
      return true;
    });

    const descricao = categoria
      ? `Eventos de ${categoria}`
      : cidade
      ? `Eventos em ${cidade}`
      : `Resultados para “${q}”`;

    return (
      <>
        <MarketplaceNavbar cidades={nomesCidades} />
        <main className="min-h-screen overflow-x-clip bg-white">
          <FilteredResults eventos={filtrados} descricao={descricao} />
          <CreateEventBanner />
        </main>
        <Footer cidades={nomesCidades} />
      </>
    );
  }

  // ── Home padrao (marketplace estilo Sympla) ───────────────────────────────
  const destaques = eventos.slice(0, 5);

  const agora = Date.now();
  const futuros = eventos.filter(
    (e) => e.data_evento && new Date(e.data_evento).getTime() >= agora
  );
  const emBreve = (futuros.length ? futuros : eventos).slice(0, 12);

  // Uma secao por categoria que tenha pelo menos 1 evento.
  const porCategoria = CATEGORIAS.map((cat) => ({
    cat,
    lista: eventos.filter((e) => e.categoria === cat),
  })).filter((g) => g.lista.length > 0);

  return (
    <>
      <MarketplaceNavbar cidades={nomesCidades} />
      <main className="overflow-x-clip bg-white">
        <FeaturedCarousel eventos={destaques} />
        <CollectionsRow />

        {eventos.length === 0 ? (
          <section className="section-container py-16">
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-brand-blue/20 bg-brand-light/50 px-6 py-20 text-center">
              <CalendarX className="h-12 w-12 text-brand-blue/40" />
              <p className="mt-4 text-lg font-bold text-brand-ink">
                Nenhum evento disponível no momento
              </p>
              <p className="mt-1 text-sm text-brand-gray">
                Volte em breve — novos eventos estão a caminho.
              </p>
            </div>
          </section>
        ) : (
          <>
            <EventCarousel
              id="eventos"
              title="Eventos em destaque"
              subtitle="Os eventos mais quentes da Ticket DZ6"
              eventos={eventos.slice(0, 12)}
            />
            <EventCarousel
              title="Acontecendo em breve"
              subtitle="Garanta seu ingresso antes que esgote"
              eventos={emBreve}
            />
            {porCategoria.map((g) => (
              <EventCarousel
                key={g.cat}
                title={g.cat}
                eventos={g.lista}
                verTodosHref={`/?categoria=${encodeURIComponent(g.cat)}`}
              />
            ))}
            <CitiesSection cidades={cidades} />
          </>
        )}

        <CreateEventBanner />
        <Faq />
      </main>
      <Footer cidades={nomesCidades} />
    </>
  );
}
