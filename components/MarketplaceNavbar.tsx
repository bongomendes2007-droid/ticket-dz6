"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Menu, X, Search, MapPin, CalendarPlus, LayoutDashboard, Ticket, User } from "lucide-react";
import Logo from "./Logo";

const navLinks = [
  { label: "Criar evento", href: "/cadastro", icon: CalendarPlus },
  { label: "Meus eventos", href: "/painel", icon: LayoutDashboard },
  { label: "Meus ingressos", href: "/login", icon: Ticket },
];

export default function MarketplaceNavbar({
  cidades = [],
}: {
  cidades?: string[];
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [busca, setBusca] = useState("");

  function submeterBusca(e: React.FormEvent) {
    e.preventDefault();
    const termo = busca.trim();
    router.push(termo ? `/?q=${encodeURIComponent(termo)}` : "/");
    setOpen(false);
  }

  function escolherCidade(valor: string) {
    router.push(valor ? `/?cidade=${encodeURIComponent(valor)}` : "/");
    setOpen(false);
  }

  return (
    <header className="sticky top-0 z-50 border-b border-brand-blue/10 bg-white/95 shadow-[0_1px_0_rgba(13,27,62,0.04)] backdrop-blur-md">
      <div className="section-container">
        <div className="flex h-16 items-center gap-3 md:h-20 md:gap-6">
          <Link href="/" aria-label="Ticket DZ6 — início" className="shrink-0">
            <Logo height={44} />
          </Link>

          {/* Busca central (desktop) */}
          <form
            onSubmit={submeterBusca}
            className="relative hidden flex-1 md:block"
          >
            <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-brand-gray" />
            <input
              type="search"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar eventos..."
              aria-label="Buscar eventos"
              className="w-full rounded-full border border-brand-blue/15 bg-brand-light/60 py-2.5 pl-12 pr-4 text-sm text-brand-ink outline-none transition placeholder:text-brand-gray/70 focus:border-brand-blue focus:bg-white focus:ring-2 focus:ring-brand-blue/20"
            />
          </form>

          {/* Filtro de localizacao (desktop) */}
          <div className="relative hidden lg:block">
            <MapPin className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-blue" />
            <select
              onChange={(e) => escolherCidade(e.target.value)}
              defaultValue=""
              aria-label="Filtrar por localização"
              className="cursor-pointer rounded-full border border-brand-blue/15 bg-white py-2.5 pl-9 pr-8 text-sm font-medium text-brand-ink outline-none transition focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20"
            >
              <option value="">Qualquer lugar</option>
              {cidades.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Links (desktop) */}
          <nav className="hidden items-center gap-5 lg:flex">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-brand-ink/80 transition-colors hover:text-brand-blue"
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/login"
              aria-label="Perfil"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-brand-blue/15 text-brand-blue transition hover:border-brand-blue hover:bg-brand-light"
            >
              <User className="h-5 w-5" />
            </Link>
          </nav>

          {/* Toggle mobile */}
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="ml-auto flex h-10 w-10 items-center justify-center rounded-lg text-brand-ink lg:hidden"
            aria-label={open ? "Fechar menu" : "Abrir menu"}
            aria-expanded={open}
          >
            {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Busca mobile (sempre visivel abaixo do logo) */}
        <form onSubmit={submeterBusca} className="relative pb-3 md:hidden">
          <Search className="pointer-events-none absolute left-4 top-[1.05rem] h-5 w-5 -translate-y-1/2 text-brand-gray" />
          <input
            type="search"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar eventos..."
            aria-label="Buscar eventos"
            className="w-full rounded-full border border-brand-blue/15 bg-brand-light/60 py-2.5 pl-12 pr-4 text-sm text-brand-ink outline-none transition placeholder:text-brand-gray/70 focus:border-brand-blue focus:bg-white focus:ring-2 focus:ring-brand-blue/20"
          />
        </form>
      </div>

      {/* Painel mobile */}
      <div
        className={`overflow-hidden border-t border-brand-blue/10 bg-white transition-[max-height] duration-300 lg:hidden ${
          open ? "max-h-[28rem]" : "max-h-0"
        }`}
      >
        <div className="section-container flex flex-col gap-1 py-4">
          {cidades.length > 0 && (
            <div className="relative mb-2">
              <MapPin className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-blue" />
              <select
                onChange={(e) => escolherCidade(e.target.value)}
                defaultValue=""
                aria-label="Filtrar por localização"
                className="w-full cursor-pointer rounded-full border border-brand-blue/15 bg-white py-3 pl-9 pr-8 text-sm font-medium text-brand-ink outline-none"
              >
                <option value="">Qualquer lugar</option>
                {cidades.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          )}

          {navLinks.map((link) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 rounded-lg px-2 py-3 text-base font-medium text-brand-ink/80 transition-colors hover:bg-brand-light hover:text-brand-blue"
              >
                <Icon className="h-5 w-5 text-brand-blue" />
                {link.label}
              </Link>
            );
          })}
          <Link
            href="/login"
            onClick={() => setOpen(false)}
            className="flex items-center gap-3 rounded-lg px-2 py-3 text-base font-medium text-brand-ink/80 transition-colors hover:bg-brand-light hover:text-brand-blue"
          >
            <User className="h-5 w-5 text-brand-blue" />
            Perfil
          </Link>
          <Link
            href="/cadastro"
            onClick={() => setOpen(false)}
            className="mt-2 rounded-full bg-brand-orange px-5 py-3 text-center text-sm font-semibold text-white shadow-soft"
          >
            Crie seu Evento
          </Link>
        </div>
      </div>
    </header>
  );
}
