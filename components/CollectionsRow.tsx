import Link from "next/link";
import {
  Presentation,
  GraduationCap,
  Trophy,
  PartyPopper,
  UtensilsCrossed,
  Briefcase,
  HeartPulse,
  BookOpen,
  Music,
  Drama,
  Cpu,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import { CATEGORIAS } from "@/lib/categorias";

// Icone de cada categoria (mesma identidade da landing).
const ICONES: Record<string, LucideIcon> = {
  Conferências: Presentation,
  Educação: GraduationCap,
  Esportes: Trophy,
  Festivais: PartyPopper,
  Gastronomia: UtensilsCrossed,
  Negócios: Briefcase,
  "Saúde e Bem-estar": HeartPulse,
  Seminários: BookOpen,
  Shows: Music,
  Teatro: Drama,
  Tecnologia: Cpu,
  Workshops: Wrench,
};

// Linha horizontal de categorias clicaveis. Cada item filtra a home por
// categoria via query param (?categoria=...). Scroll lateral no mobile.
export default function CollectionsRow() {
  return (
    <section className="section-container py-6 md:py-8">
      <h2 className="mb-5 text-xl font-extrabold tracking-tight text-brand-ink md:text-2xl">
        Explore nossas coleções
      </h2>
      <div className="flex gap-3 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] sm:gap-4 [&::-webkit-scrollbar]:hidden">
        {CATEGORIAS.map((cat) => {
          const Icon = ICONES[cat] ?? PartyPopper;
          return (
            <Link
              key={cat}
              href={`/?categoria=${encodeURIComponent(cat)}`}
              className="group flex w-20 shrink-0 flex-col items-center gap-2 text-center sm:w-24"
            >
              <span className="flex h-14 w-14 items-center justify-center rounded-2xl border border-brand-blue/10 bg-brand-light text-brand-blue shadow-sm transition-all group-hover:-translate-y-1 group-hover:border-brand-blue group-hover:bg-brand-blue group-hover:text-white sm:h-16 sm:w-16">
                <Icon className="h-6 w-6" />
              </span>
              <span className="text-[11px] font-semibold leading-tight text-brand-ink sm:text-xs">
                {cat}
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
