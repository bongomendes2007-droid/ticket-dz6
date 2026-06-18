"use client";

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
import Reveal from "./Reveal";

type Category = {
  icon: LucideIcon;
  label: string;
};

const categories: Category[] = [
  { icon: Presentation, label: "Conferências" },
  { icon: GraduationCap, label: "Educação" },
  { icon: Trophy, label: "Esportes" },
  { icon: PartyPopper, label: "Festivais" },
  { icon: UtensilsCrossed, label: "Gastronomia" },
  { icon: Briefcase, label: "Negócios" },
  { icon: HeartPulse, label: "Saúde e Bem-estar" },
  { icon: BookOpen, label: "Seminários" },
  { icon: Music, label: "Shows" },
  { icon: Drama, label: "Teatro" },
  { icon: Cpu, label: "Tecnologia" },
  { icon: Wrench, label: "Workshops" },
];

export default function Categories() {
  return (
    <section id="categorias" className="bg-white py-20 md:py-28">
      <div className="section-container">
        <Reveal className="mx-auto max-w-2xl text-center">
          <span className="text-sm font-semibold uppercase tracking-wide text-brand-orange">
            Para todo tipo de evento
          </span>
          <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-brand-ink sm:text-4xl">
            Categorias de eventos
          </h2>
          <p className="mt-4 text-lg text-brand-gray">
            Seja qual for o seu evento, a Ticket DZ6 é o lugar certo para
            publicá-lo.
          </p>
        </Reveal>

        <div className="mt-14 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {categories.map((category, i) => {
            const Icon = category.icon;
            return (
              <Reveal key={category.label} delay={(i % 4) * 0.06}>
                <a
                  href="#categorias"
                  className="group flex h-full items-center gap-4 rounded-2xl border border-brand-blue/10 bg-brand-light/50 p-5 transition-all hover:-translate-y-1 hover:border-brand-blue/30 hover:bg-white hover:shadow-card"
                >
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-brand-blue shadow-sm transition-colors group-hover:bg-brand-blue group-hover:text-white">
                    <Icon className="h-5 w-5" />
                  </span>
                  <span className="text-sm font-semibold text-brand-ink">
                    {category.label}
                  </span>
                </a>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
