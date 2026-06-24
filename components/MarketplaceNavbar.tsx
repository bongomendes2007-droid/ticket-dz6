"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import Logo from "./Logo";

// As 4 rotas reais do marketplace.
const navLinks = [
  { label: "Cadastro", href: "/cadastro" },
  { label: "Área do Usuário", href: "/login" },
  { label: "Área do Organizador", href: "/painel" },
];

export default function MarketplaceNavbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-brand-blue/10 bg-white/90 backdrop-blur-md">
      <nav className="section-container flex h-20 items-center justify-between">
        <Link href="/" aria-label="Ticket DZ6 — início">
          <Logo height={52} />
        </Link>

        {/* Desktop links */}
        <ul className="hidden items-center gap-7 lg:flex">
          {navLinks.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="text-sm font-medium text-brand-ink/80 transition-colors hover:text-brand-blue"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        {/* Desktop CTA */}
        <div className="hidden lg:block">
          <Link
            href="/cadastro"
            className="rounded-full bg-brand-orange px-5 py-2.5 text-sm font-semibold text-white shadow-soft transition-all hover:brightness-95 hover:shadow-md"
          >
            Crie seu Evento
          </Link>
        </div>

        {/* Mobile toggle */}
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="flex h-10 w-10 items-center justify-center rounded-lg text-brand-ink lg:hidden"
          aria-label={open ? "Fechar menu" : "Abrir menu"}
          aria-expanded={open}
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </nav>

      {/* Mobile panel */}
      <div
        className={`overflow-hidden border-t border-brand-blue/10 bg-white transition-[max-height] duration-300 lg:hidden ${
          open ? "max-h-96" : "max-h-0"
        }`}
      >
        <ul className="section-container flex flex-col gap-1 py-4">
          {navLinks.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                onClick={() => setOpen(false)}
                className="block rounded-lg px-2 py-3 text-base font-medium text-brand-ink/80 transition-colors hover:bg-brand-light hover:text-brand-blue"
              >
                {link.label}
              </Link>
            </li>
          ))}
          <li className="mt-2 px-2">
            <Link
              href="/cadastro"
              onClick={() => setOpen(false)}
              className="block rounded-full bg-brand-orange px-5 py-2.5 text-center text-sm font-semibold text-white shadow-soft"
            >
              Crie seu Evento
            </Link>
          </li>
        </ul>
      </div>
    </header>
  );
}
