import MarketplaceNavbar from "@/components/MarketplaceNavbar";
import FeaturedCarousel from "@/components/FeaturedCarousel";
import EventsExplorer from "@/components/EventsExplorer";
import Footer from "@/components/Footer";
import { buscarEventosPublicados } from "@/lib/eventos";

// Renderizacao dinamica: sempre busca os eventos atuais do banco (SSR).
export const dynamic = "force-dynamic";

export default async function Home() {
  const eventos = await buscarEventosPublicados();

  // Destaques do carrossel: os 3 eventos mais recentes (criados por ultimo).
  // Como `eventos` vem ordenado por data do evento, pegamos os com data mais
  // proxima para o banner; usamos ate 3.
  const destaques = eventos.slice(0, 3);

  return (
    <>
      <MarketplaceNavbar />
      <main className="overflow-x-clip bg-white">
        <FeaturedCarousel eventos={destaques} />
        <EventsExplorer eventos={eventos} />
      </main>
      <Footer />
    </>
  );
}
