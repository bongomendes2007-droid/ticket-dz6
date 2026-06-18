"use client";

import {
  Globe,
  QrCode,
  TicketPercent,
  CreditCard,
  LineChart,
  Users,
  type LucideIcon,
} from "lucide-react";
import Reveal from "./Reveal";

type Feature = {
  icon: LucideIcon;
  title: string;
  description: string;
};

const features: Feature[] = [
  {
    icon: Globe,
    title: "Site personalizado do evento",
    description:
      "Cada evento ganha uma página própria, com sua marca, imagens e informações.",
  },
  {
    icon: QrCode,
    title: "Check-in com QR Code",
    description:
      "Valide ingressos na entrada de forma rápida e segura pelo celular.",
  },
  {
    icon: TicketPercent,
    title: "Cupons de desconto",
    description:
      "Crie campanhas promocionais e cupons para impulsionar suas vendas.",
  },
  {
    icon: CreditCard,
    title: "Inscrições online",
    description:
      "Receba por cartão em até 12x, Pix e boleto, com repasse simplificado.",
  },
  {
    icon: LineChart,
    title: "Relatórios e análises",
    description:
      "Acompanhe vendas, faturamento e público em painéis claros e em tempo real.",
  },
  {
    icon: Users,
    title: "Gestão de participantes",
    description:
      "Controle a lista de participantes, lotes e cortesias em um só painel.",
  },
];

export default function Features() {
  return (
    <section id="recursos" className="bg-brand-light py-20 md:py-28">
      <div className="section-container">
        <Reveal className="mx-auto max-w-2xl text-center">
          <span className="text-sm font-semibold uppercase tracking-wide text-brand-orange">
            Tudo em um só lugar
          </span>
          <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-brand-ink sm:text-4xl">
            Recursos da plataforma
          </h2>
          <p className="mt-4 text-lg text-brand-gray">
            Ferramentas completas para criar, vender e gerenciar do início ao
            fim.
          </p>
        </Reveal>

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, i) => {
            const Icon = feature.icon;
            return (
              <Reveal key={feature.title} delay={(i % 3) * 0.08}>
                <div className="group h-full rounded-2xl border border-brand-blue/10 bg-white p-7 transition-all hover:-translate-y-1 hover:shadow-soft">
                  <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-blue/10 text-brand-blue transition-colors group-hover:bg-brand-blue group-hover:text-white">
                    <Icon className="h-6 w-6" />
                  </span>
                  <h3 className="mt-5 text-lg font-bold text-brand-ink">
                    {feature.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-brand-gray">
                    {feature.description}
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
