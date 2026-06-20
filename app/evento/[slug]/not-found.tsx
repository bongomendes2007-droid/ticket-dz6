import Link from "next/link";
import Logo from "@/components/Logo";

export default function EventoNaoEncontrado() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-hero-gradient px-6 text-center">
      <Logo height={52} />
      <h1 className="mt-8 text-5xl font-extrabold text-brand-ink">404</h1>
      <h2 className="mt-2 text-xl font-bold text-brand-ink">
        Evento não encontrado
      </h2>
      <p className="mt-2 max-w-sm text-brand-gray">
        Este evento não existe, ainda não foi publicado ou o endereço está
        incorreto.
      </p>
      <Link
        href="/"
        className="mt-6 inline-flex items-center rounded-full bg-brand-blue px-6 py-3 text-sm font-semibold text-white shadow-soft transition hover:bg-brand-blue-dark"
      >
        Voltar para a página inicial
      </Link>
    </main>
  );
}
