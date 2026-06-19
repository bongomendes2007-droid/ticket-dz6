import { Mail, MapPin, Instagram, Facebook, Linkedin } from "lucide-react";
import Logo from "./Logo";

const linksUteis = [
  { label: "Home", href: "#top" },
  { label: "Planos e Preços", href: "#planos" },
  { label: "Eventos", href: "#categorias" },
  { label: "Perguntas Frequentes", href: "#faq" },
  { label: "Contato", href: "#contato" },
  { label: "Cadastro", href: "#criar-evento" },
  { label: "Políticas de Privacidade", href: "#privacidade" },
  { label: "Termos de Uso", href: "#termos" },
];

const socials = [
  { icon: Instagram, label: "Instagram", href: "#" },
  { icon: Facebook, label: "Facebook", href: "#" },
  { icon: Linkedin, label: "LinkedIn", href: "#" },
];

export default function Footer() {
  return (
    <footer id="contato" className="bg-brand-ink text-white">
      <div className="section-container py-16">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1.2fr]">
          {/* Brand */}
          <div>
            <Logo variant="light" height={64} />
            <p className="mt-5 max-w-xs text-sm leading-relaxed text-white/70">
              Sua nova plataforma de criação e gerenciamento de eventos.
            </p>
            <div className="mt-6 flex gap-3">
              {socials.map((social) => {
                const Icon = social.icon;
                return (
                  <a
                    key={social.label}
                    href={social.href}
                    aria-label={social.label}
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-brand-blue"
                  >
                    <Icon className="h-5 w-5" />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Links úteis */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wide text-white/90">
              Links úteis
            </h3>
            <ul className="mt-5 grid grid-cols-2 gap-x-6 gap-y-3">
              {linksUteis.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-sm text-white/70 transition-colors hover:text-brand-orange"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contato */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wide text-white/90">
              Contato
            </h3>
            <ul className="mt-5 space-y-4 text-sm text-white/70">
              <li className="flex gap-3">
                <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-brand-orange" />
                <span>
                  Avenida Zequinha Freire, 201, Santa Isabel
                  <br />
                  CEP 64053-400, Teresina - PI
                </span>
              </li>
              <li className="flex gap-3">
                <Mail className="mt-0.5 h-5 w-5 shrink-0 text-brand-orange" />
                <a
                  href="mailto:ticketdz6@hotmail.com"
                  className="transition-colors hover:text-brand-orange"
                >
                  ticketdz6@hotmail.com
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="section-container flex flex-col items-center justify-between gap-2 py-6 text-center text-xs text-white/60 sm:flex-row sm:text-left">
          <p>© Ticket DZ6. Todos os direitos reservados.</p>
          <p>Designed by Amadeu Bruno</p>
        </div>
      </div>
    </footer>
  );
}
