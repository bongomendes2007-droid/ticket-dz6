import Link from "next/link";
import { MapPin } from "lucide-react";

export type CidadeCard = {
  nome: string;
  imagem: string | null;
  total: number;
};

// "Descubra na sua cidade" — cards de cidade clicaveis que filtram a home
// por localizacao (?cidade=...). So renderiza se houver cidades.
export default function CitiesSection({ cidades }: { cidades: CidadeCard[] }) {
  if (!cidades.length) return null;

  return (
    <section className="section-container py-8 md:py-10">
      <h2 className="mb-5 text-xl font-extrabold tracking-tight text-brand-ink md:text-2xl">
        Descubra na sua cidade
      </h2>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {cidades.slice(0, 8).map((cidade) => (
          <Link
            key={cidade.nome}
            href={`/?cidade=${encodeURIComponent(cidade.nome)}`}
            className="group relative block aspect-[16/9] overflow-hidden rounded-2xl bg-brand-ink shadow-card"
          >
            {cidade.imagem ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={cidade.imagem}
                alt={cidade.nome}
                loading="lazy"
                className="h-full w-full object-cover opacity-80 transition duration-300 group-hover:scale-105 group-hover:opacity-90"
              />
            ) : (
              <div className="h-full w-full bg-hero-gradient" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-brand-ink/85 via-brand-ink/20 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-4">
              <span className="flex items-center gap-1.5 text-base font-bold text-white">
                <MapPin className="h-4 w-4 text-brand-orange" />
                {cidade.nome}
              </span>
              <span className="text-xs text-white/80">
                {cidade.total} {cidade.total === 1 ? "evento" : "eventos"}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
