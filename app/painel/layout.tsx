import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import Logo from "@/components/Logo";
import LogoutButton from "@/components/LogoutButton";

export default async function PainelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Busca o nome na tabela profiles; se algo falhar, usa o metadado do
  // proprio usuario como fallback para nunca exibir vazio.
  const { data: profile } = await supabase
    .from("profiles")
    .select("nome_completo, is_admin")
    .eq("id", user?.id ?? "")
    .maybeSingle();

  const nome =
    profile?.nome_completo ??
    (user?.user_metadata?.nome_completo as string | undefined) ??
    user?.email ??
    "Organizador";

  // O link so ajuda na navegacao — quem protege /admin de verdade e a
  // checagem no servidor em app/admin/page.tsx (e de novo na API route).
  const ehAdmin = profile?.is_admin === true;

  return (
    <div className="min-h-screen bg-brand-light">
      <header className="border-b border-brand-blue/10 bg-white">
        <div className="section-container flex h-20 items-center justify-between">
          <Link href="/painel" aria-label="Ticket DZ6 — painel">
            <Logo height={44} />
          </Link>
          <div className="flex items-center gap-4">
            {ehAdmin && (
              <Link
                href="/admin"
                className="hidden items-center gap-1.5 text-sm font-medium text-brand-ink/80 transition-colors hover:text-brand-blue sm:flex"
              >
                <ShieldCheck className="h-4 w-4" />
                Admin
              </Link>
            )}
            <span className="hidden text-sm text-brand-gray sm:block">
              Olá, <span className="font-semibold text-brand-ink">{nome}</span>
            </span>
            <LogoutButton />
          </div>
        </div>
      </header>

      <div className="section-container py-10">{children}</div>
    </div>
  );
}
