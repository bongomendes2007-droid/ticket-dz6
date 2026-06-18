"use client";

import { motion } from "framer-motion";
import {
  ArrowRight,
  CalendarDays,
  QrCode,
  Ticket,
  TrendingUp,
} from "lucide-react";

export default function Hero() {
  return (
    <section
      id="top"
      className="relative overflow-hidden bg-hero-gradient pt-28 md:pt-36"
    >
      {/* decorative blobs */}
      <div className="pointer-events-none absolute -left-24 top-24 h-72 w-72 rounded-full bg-brand-blue/10 blur-3xl" />
      <div className="pointer-events-none absolute -right-16 top-48 h-80 w-80 rounded-full bg-brand-orange/10 blur-3xl" />

      <div className="section-container relative grid items-center gap-12 pb-20 md:pb-28 lg:grid-cols-2">
        {/* Copy */}
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.21, 0.47, 0.32, 0.98] }}
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-brand-blue/15 bg-white px-4 py-1.5 text-xs font-semibold text-brand-blue shadow-sm">
            <span className="h-2 w-2 rounded-full bg-brand-orange" />
            Plataforma de ingressos e eventos
          </span>

          <h1 className="mt-6 text-4xl font-extrabold leading-[1.1] tracking-tight text-brand-ink sm:text-5xl lg:text-6xl">
            Plataforma completa para{" "}
            <span className="relative whitespace-nowrap text-brand-blue">
              criar e gerenciar
            </span>{" "}
            seus eventos
          </h1>

          <p className="mt-6 max-w-xl text-lg leading-relaxed text-brand-gray">
            Crie seu evento, venda ingressos online e gerencie tudo em um só
            lugar. Simples, rápido e profissional.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
            <a
              href="#criar-evento"
              className="group inline-flex items-center justify-center gap-2 rounded-full bg-brand-blue px-7 py-3.5 text-base font-semibold text-white shadow-soft transition-all hover:bg-brand-blue-dark hover:shadow-lg"
            >
              Começar agora
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </a>
            <a
              href="#categorias"
              className="inline-flex items-center justify-center rounded-full border border-brand-blue/20 bg-white px-7 py-3.5 text-base font-semibold text-brand-ink transition-colors hover:border-brand-blue/40 hover:text-brand-blue"
            >
              Explorar eventos
            </a>
          </div>

          <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-3 text-sm text-brand-gray">
            <span className="flex items-center gap-2">
              <QrCode className="h-4 w-4 text-brand-blue" /> Check-in com QR Code
            </span>
            <span className="flex items-center gap-2">
              <Ticket className="h-4 w-4 text-brand-blue" /> Pix, cartão e boleto
            </span>
            <span className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-brand-blue" /> Relatórios em
              tempo real
            </span>
          </div>
        </motion.div>

        {/* Mockup */}
        <motion.div
          className="relative"
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.15, ease: [0.21, 0.47, 0.32, 0.98] }}
        >
          <div className="relative mx-auto max-w-md rounded-3xl border border-brand-blue/10 bg-white p-5 shadow-soft">
            <div className="rounded-2xl bg-gradient-to-br from-brand-blue to-brand-blue-dark p-6 text-white">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium opacity-80">
                  Seu próximo evento
                </span>
                <CalendarDays className="h-5 w-5 opacity-80" />
              </div>
              <p className="mt-4 text-2xl font-bold">Festival de Verão 2026</p>
              <p className="mt-1 text-sm opacity-80">
                Teresina - PI · 24 Jan, 18h
              </p>
              <div className="mt-6 flex items-end justify-between">
                <div>
                  <p className="text-xs opacity-70">Ingressos vendidos</p>
                  <p className="text-3xl font-extrabold">1.248</p>
                </div>
                <div className="rounded-xl bg-white/15 px-3 py-2 text-center">
                  <QrCode className="mx-auto h-8 w-8" />
                  <p className="mt-1 text-[10px] uppercase tracking-wide">
                    Check-in
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-3 gap-3">
              {[
                { label: "Faturamento", value: "R$ 87k" },
                { label: "Lotes ativos", value: "3" },
                { label: "Taxa check-in", value: "92%" },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-xl bg-brand-light p-3 text-center"
                >
                  <p className="text-base font-bold text-brand-ink">
                    {stat.value}
                  </p>
                  <p className="text-[11px] text-brand-gray">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* floating badge */}
          <motion.div
            className="absolute -bottom-4 -left-4 hidden items-center gap-2 rounded-2xl border border-brand-blue/10 bg-white px-4 py-3 shadow-card sm:flex"
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-orange/15 text-brand-orange">
              <TrendingUp className="h-5 w-5" />
            </span>
            <div>
              <p className="text-xs text-brand-gray">Vendas hoje</p>
              <p className="text-sm font-bold text-brand-ink">+ R$ 4.320</p>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
