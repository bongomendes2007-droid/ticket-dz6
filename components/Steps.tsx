"use client";

import {
  UserPlus,
  Settings2,
  Layers,
  Megaphone,
  BarChart3,
  type LucideIcon,
} from "lucide-react";
import Reveal from "./Reveal";

type Step = {
  icon: LucideIcon;
  title: string;
  description: string;
};

const steps: Step[] = [
  {
    icon: UserPlus,
    title: "Cadastre-se gratuitamente",
    description: "Crie sua conta em segundos, sem custo e sem complicação.",
  },
  {
    icon: Settings2,
    title: "Configure seu evento",
    description: "Adicione data, local, descrição e a identidade do seu evento.",
  },
  {
    icon: Layers,
    title: "Crie seus lotes",
    description: "Defina tipos de ingresso, preços e quantidades por lote.",
  },
  {
    icon: Megaphone,
    title: "Publique e divulgue",
    description: "Compartilhe a página do evento e comece a vender online.",
  },
  {
    icon: BarChart3,
    title: "Gerencie e fature",
    description: "Acompanhe vendas em tempo real e receba seus repasses.",
  },
];

export default function Steps() {
  return (
    <section className="bg-white py-20 md:py-28">
      <div className="section-container">
        <Reveal className="mx-auto max-w-2xl text-center">
          <span className="text-sm font-semibold uppercase tracking-wide text-brand-orange">
            Rápido e fácil
          </span>
          <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-brand-ink sm:text-4xl">
            Comece a vender em 5 minutos
          </h2>
          <p className="mt-4 text-lg text-brand-gray">
            Do cadastro à primeira venda em poucos passos. Sem burocracia.
          </p>
        </Reveal>

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
          {steps.map((step, i) => {
            const Icon = step.icon;
            return (
              <Reveal key={step.title} delay={i * 0.08}>
                <div className="group relative h-full rounded-2xl border border-brand-blue/10 bg-brand-light/60 p-6 transition-all hover:-translate-y-1 hover:border-brand-blue/30 hover:bg-white hover:shadow-card">
                  <span className="absolute right-5 top-5 text-4xl font-extrabold text-brand-blue/10">
                    {i + 1}
                  </span>
                  <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-blue text-white shadow-soft transition-transform group-hover:scale-105">
                    <Icon className="h-6 w-6" />
                  </span>
                  <h3 className="mt-5 text-base font-bold text-brand-ink">
                    {step.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-brand-gray">
                    {step.description}
                  </p>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
