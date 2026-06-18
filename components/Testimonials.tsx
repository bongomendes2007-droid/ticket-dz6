"use client";

import { Star, Quote } from "lucide-react";
import Reveal from "./Reveal";

type Testimonial = {
  name: string;
  role: string;
  initials: string;
  text: string;
};

const testimonials: Testimonial[] = [
  {
    name: "Mariana Albuquerque",
    role: "Produtora · Festival Sertão Vivo",
    initials: "MA",
    text: "Migramos para a Ticket DZ6 e dobramos a velocidade das vendas. O check-in por QR Code acabou com as filas na entrada do nosso festival.",
  },
  {
    name: "Rafael Mendes",
    role: "Organizador · TechConf Teresina",
    initials: "RM",
    text: "A página personalizada do evento ficou linda e os relatórios em tempo real me deram total controle sobre o faturamento. Recomendo demais.",
  },
  {
    name: "Carla Nogueira",
    role: "Coordenadora · Workshops Criativos",
    initials: "CN",
    text: "Criar lotes e cupons de desconto é muito simples. Em poucos minutos meu evento estava no ar vendendo por Pix e cartão. Plataforma profissional.",
  },
];

export default function Testimonials() {
  return (
    <section id="depoimentos" className="bg-white py-20 md:py-28">
      <div className="section-container">
        <Reveal className="mx-auto max-w-2xl text-center">
          <span className="text-sm font-semibold uppercase tracking-wide text-brand-orange">
            Quem usa, aprova
          </span>
          <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-brand-ink sm:text-4xl">
            O que dizem nossos clientes
          </h2>
          <p className="mt-4 text-lg text-brand-gray">
            Produtores de todo o Brasil confiam na Ticket DZ6 para seus eventos.
          </p>
        </Reveal>

        <div className="mt-14 grid gap-6 lg:grid-cols-3">
          {testimonials.map((t, i) => (
            <Reveal key={t.name} delay={i * 0.1}>
              <figure className="relative flex h-full flex-col rounded-2xl border border-brand-blue/10 bg-brand-light/50 p-7 transition-all hover:-translate-y-1 hover:bg-white hover:shadow-soft">
                <Quote className="h-8 w-8 text-brand-blue/20" />
                <div className="mt-3 flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, s) => (
                    <Star
                      key={s}
                      className="h-4 w-4 fill-brand-orange text-brand-orange"
                    />
                  ))}
                </div>
                <blockquote className="mt-4 flex-1 text-sm leading-relaxed text-brand-ink/80">
                  “{t.text}”
                </blockquote>
                <figcaption className="mt-6 flex items-center gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-full bg-brand-blue text-sm font-bold text-white">
                    {t.initials}
                  </span>
                  <span>
                    <span className="block text-sm font-bold text-brand-ink">
                      {t.name}
                    </span>
                    <span className="block text-xs text-brand-gray">
                      {t.role}
                    </span>
                  </span>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
