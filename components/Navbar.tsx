"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import Logo from "./Logo";

const navLinks = [
  { label: "Eventos", href: "#categorias" },
  { label: "Planos e Preços", href: "#planos" },
  { label: "Perguntas Frequentes", href: "#faq" },
  { label: "Contato", href: "#contato" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "border-b border-brand-blue/10 bg-white/80 shadow-sm backdrop-blur-md"
          : "bg-white/60 backdrop-blur-sm"
      }`}
    >
      <nav className="section-container flex h-20 items-center justify-between md:h-24">
        <a href="#top" aria-label="Ticket DZ6 — início">
          <Logo height={56} />
        </a>

        {/* Desktop links */}
        <ul className="hidden items-center gap-8 lg:flex">
          {navLinks.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                className="text-sm font-medium text-brand-ink/80 transition-colors hover:text-brand-blue"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        {/* Desktop actions */}
        <div className="hidden items-center gap-3 lg:flex">
          <Link
            href="/login"
            className="text-sm font-semibold text-brand-ink transition-colors hover:text-brand-blue"
          >
            Fazer Login
          </Link>
          <Link
            href="/cadastro"
            className="rounded-full bg-brand-blue px-5 py-2.5 text-sm font-semibold text-white shadow-soft transition-all hover:bg-brand-blue-dark hover:shadow-md"
          >
            Criar Evento
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
        className={`overflow-hidden border-t border-brand-blue/10 bg-white/95 backdrop-blur-md transition-[max-height] duration-300 lg:hidden ${
          open ? "max-h-96" : "max-h-0"
        }`}
      >
        <ul className="section-container flex flex-col gap-1 py-4">
          {navLinks.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                onClick={() => setOpen(false)}
                className="block rounded-lg px-2 py-3 text-base font-medium text-brand-ink/80 transition-colors hover:bg-brand-light hover:text-brand-blue"
              >
                {link.label}
              </a>
            </li>
          ))}
          <li className="mt-2 flex flex-col gap-3 px-2">
            <Link
              href="/login"
              onClick={() => setOpen(false)}
              className="rounded-full border border-brand-blue/20 px-5 py-2.5 text-center text-sm font-semibold text-brand-ink"
            >
              Fazer Login
            </Link>
            <Link
              href="/cadastro"
              onClick={() => setOpen(false)}
              className="rounded-full bg-brand-blue px-5 py-2.5 text-center text-sm font-semibold text-white shadow-soft"
            >
              Criar Evento
            </Link>
          </li>
        </ul>
      </div>
    </header>
  );
}
