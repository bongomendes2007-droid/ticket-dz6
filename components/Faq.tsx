"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import Reveal from "./Reveal";

type FaqItem = {
  question: string;
  answer: string;
};

const faqs: FaqItem[] = [
  {
    question: "Como funciona a criação de eventos na plataforma?",
    answer:
      "Você cria sua conta gratuitamente, configura os dados do evento (data, local e descrição), define os lotes de ingressos e publica. Em poucos minutos seu evento já está disponível para venda online.",
  },
  {
    question: "Quais formas de pagamento são aceitas?",
    answer:
      "Aceitamos cartão de crédito em até 12x, Pix e boleto bancário. O comprador escolhe a melhor opção no momento da inscrição.",
  },
  {
    question: "Existe algum custo para usar a plataforma?",
    answer:
      "O cadastro e a criação de eventos são gratuitos. Cobramos apenas uma taxa por ingresso vendido, sem mensalidades nem custos escondidos.",
  },
  {
    question: "Como funciona o sistema de check-in com QR Code?",
    answer:
      "Cada ingresso recebe um QR Code único. Na entrada do evento, sua equipe valida os ingressos pelo celular de forma rápida e segura, evitando filas e fraudes.",
  },
  {
    question: "Posso criar cupons de desconto para meu evento?",
    answer:
      "Sim. Você pode criar cupons de desconto por valor ou porcentagem, definir validade e limite de uso, ideal para campanhas promocionais.",
  },
  {
    question: "Posso acompanhar as vendas em tempo real?",
    answer:
      "Sim. O painel de controle mostra vendas, faturamento, lotes e público atualizados em tempo real, com relatórios completos para download.",
  },
  {
    question: "Meu evento terá uma página própria?",
    answer:
      "Sim. Cada evento ganha uma página personalizada com sua marca, imagens e informações, pronta para ser compartilhada nas redes sociais.",
  },
];

function FaqRow({ item, index }: { item: FaqItem; index: number }) {
  const [open, setOpen] = useState(false);

  return (
    <Reveal delay={index * 0.04}>
      <div
        className={`overflow-hidden rounded-2xl border bg-white transition-colors ${
          open ? "border-brand-blue/30 shadow-card" : "border-brand-blue/10"
        }`}
      >
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
          aria-expanded={open}
        >
          <span className="text-base font-semibold text-brand-ink">
            {item.question}
          </span>
          <ChevronDown
            className={`h-5 w-5 shrink-0 text-brand-blue transition-transform duration-300 ${
              open ? "rotate-180" : ""
            }`}
          />
        </button>
        <AnimatePresence initial={false}>
          {open && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
            >
              <p className="px-6 pb-5 text-sm leading-relaxed text-brand-gray">
                {item.answer}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Reveal>
  );
}

export default function Faq() {
  return (
    <section id="faq" className="bg-brand-light py-20 md:py-28">
      <div className="section-container">
        <Reveal className="mx-auto max-w-2xl text-center">
          <span className="text-sm font-semibold uppercase tracking-wide text-brand-orange">
            Tire suas dúvidas
          </span>
          <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-brand-ink sm:text-4xl">
            Dúvidas comuns
          </h2>
          <p className="mt-4 text-lg text-brand-gray">
            Reunimos as perguntas mais frequentes de quem cria eventos na
            Ticket DZ6.
          </p>
        </Reveal>

        <div className="mx-auto mt-12 flex max-w-3xl flex-col gap-3">
          {faqs.map((item, i) => (
            <FaqRow key={item.question} item={item} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
