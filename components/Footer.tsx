import Link from "next/link";
import { Mail, MapPin, Instagram, Facebook, Linkedin } from "lucide-react";
import Logo from "./Logo";
import { CATEGORIAS } from "@/lib/categorias";

const sejaProdutor = [
  { label: "Criar evento", href: "/cadastro" },
  { label: "Painel do organizador", href: "/painel" },
  { label: "Publicar ingressos", href: "/painel" },
];

const aTicket = [
  { label: "Início", href: "/" },
  { label: "Área do Usuário", href: "/login" },
  { label: "Área do Organizador", href: "/painel" },
];

const ajuda = [
  { label: "Dúvidas frequentes", href: "/#faq" },
  { label: "Fale conosco", href: "mailto:ticketdz6@hotmail.com" },
  { label: "Termos de serviço", href: "/#termos" },
];

const socials = [
  { icon: Instagram, label: "Instagram", href: "#" },
  { icon: Facebook, label: "Facebook", href: "#" },
  { icon: Linkedin, label: "LinkedIn", href: "#" },
];

function Coluna({
  titulo,
  links,
}: {
  titulo: string;
  links: { label: string; href: string }[];
}) {
  return (
    <div>
      <h3 className="text-sm font-bold uppercase tracking-wide text-white/90">
        {titulo}
      </h3>
      <ul className="mt-4 space-y-2.5">
        {links.map((link) => {
          const classe =
            "text-sm text-white/65 transition-colors hover:text-brand-orange";
          return (
            <li key={link.label}>
              {link.href.startsWith("/") ? (
                <Link href={link.href} className={classe}>
                  {link.label}
                </Link>
              ) : (
                <a href={link.href} className={classe}>
                  {link.label}
                </a>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default function Footer({ cidades = [] }: { cidades?: string[] }) {
  const colunaCidades = (cidades.length ? cidades : ["Teresina"]).slice(0, 6).map(
    (c) => ({ label: c, href: `/?cidade=${encodeURIComponent(c)}` })
  );
  const colunaCategorias = CATEGORIAS.slice(0, 6).map((c) => ({
    label: c,
    href: `/?categoria=${encodeURIComponent(c)}`,
  }));

  return (
    <footer id="contato" className="bg-brand-ink text-white">
      <div className="section-container py-14">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.4fr_repeat(5,1fr)]">
          {/* Marca */}
          <div className="sm:col-span-2 lg:col-span-1">
            <Logo variant="light" height={56} />
            <p className="mt-5 flex items-start gap-2 text-sm text-white/65">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-brand-orange" />
              Teresina - PI
            </p>
            <a
              href="mailto:ticketdz6@hotmail.com"
              className="mt-2 flex items-center gap-2 text-sm text-white/65 transition-colors hover:text-brand-orange"
            >
              <Mail className="h-4 w-4 shrink-0 text-brand-orange" />
              ticketdz6@hotmail.com
            </a>
            <div className="mt-5 flex gap-3">
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

          <Coluna titulo="Cidades" links={colunaCidades} />
          <Coluna titulo="Categorias" links={colunaCategorias} />
          <Coluna titulo="Seja Produtor" links={sejaProdutor} />
          <Coluna titulo="A Ticket DZ6" links={aTicket} />
          <Coluna titulo="Ajuda" links={ajuda} />
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
