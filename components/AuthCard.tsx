import Link from "next/link";
import Logo from "./Logo";

type AuthCardProps = {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  /** Conteudo do rodape (ex: links para login/cadastro) */
  footer?: React.ReactNode;
};

/** Casca visual compartilhada pelas telas de autenticacao. */
export default function AuthCard({
  title,
  subtitle,
  children,
  footer,
}: AuthCardProps) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-hero-gradient px-6 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 flex justify-center">
          <Link href="/" aria-label="Ticket DZ6 — início">
            <Logo height={52} />
          </Link>
        </div>

        <div className="rounded-2xl border border-brand-blue/10 bg-white p-8 shadow-card">
          <h1 className="text-2xl font-bold text-brand-ink">{title}</h1>
          {subtitle && (
            <p className="mt-2 text-sm leading-relaxed text-brand-gray">
              {subtitle}
            </p>
          )}
          <div className="mt-6">{children}</div>
        </div>

        {footer && (
          <div className="mt-6 text-center text-sm text-brand-gray">{footer}</div>
        )}
      </div>
    </main>
  );
}
