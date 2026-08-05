import Link from "next/link";
import { redirect } from "next/navigation";
import { cookies, headers } from "next/headers";
import { ArrowLeft, DollarSign, Landmark, TicketCheck, Users } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import Logo from "@/components/Logo";
import FaturamentoCards from "@/components/FaturamentoCards";

export const dynamic = "force-dynamic";

const brl = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

type FaturamentoPlataforma = {
  comissao_total: number;
  total_vendas: number;
  ingressos_vendidos: number;
  organizadores_ativos: number;
};

export default async function AdminPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Guarda de servidor de verdade: sem isso, ninguem chega a ver a tela
  // admin, mesmo se souber a URL. A API route (chamada abaixo) refaz essa
  // MESMA checagem antes de agregar dados — defesa em profundidade.
  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user?.id ?? "")
    .maybeSingle();

  if (!profile?.is_admin) {
    redirect("/painel?erro=acesso_negado");
  }

  // Repassa os cookies de sessao pra rota de API (que roda numa request
  // separada e precisa da mesma sessao pra revalidar que quem pediu e admin).
  const cookieStore = await cookies();
  const cookieHeader = cookieStore
    .getAll()
    .map((c) => `${c.name}=${c.value}`)
    .join("; ");
  const headerStore = await headers();
  const host = headerStore.get("host");
  const protocolo = headerStore.get("x-forwarded-proto") ?? "http";

  let dados: FaturamentoPlataforma | null = null;
  try {
    const resposta = await fetch(`${protocolo}://${host}/api/admin/faturamento`, {
      headers: { cookie: cookieHeader },
      cache: "no-store",
    });
    if (resposta.ok) {
      dados = await resposta.json();
    }
  } catch (e) {
    console.error("[admin] falha ao buscar faturamento:", e);
  }

  return (
    <div className="min-h-screen bg-brand-light">
      <header className="border-b border-brand-blue/10 bg-white">
        <div className="section-container flex h-20 items-center justify-between">
          <Link href="/admin" aria-label="Ticket DZ6 — admin">
            <Logo height={44} />
          </Link>
          <Link
            href="/painel"
            className="flex items-center gap-1.5 text-sm font-medium text-brand-ink/80 transition-colors hover:text-brand-blue"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar ao painel
          </Link>
        </div>
      </header>

      <div className="section-container py-10">
        <h1 className="text-2xl font-bold text-brand-ink">Faturamento da plataforma</h1>
        <p className="mt-1 text-sm text-brand-gray">
          Visão geral de todos os organizadores e eventos da Ticket DZ6.
        </p>

        <div className="mt-6">
          {dados ? (
            <FaturamentoCards
              cards={[
                {
                  label: "Comissão total arrecadada",
                  valor: brl.format(dados.comissao_total),
                  icon: DollarSign,
                },
                {
                  label: "Total de vendas",
                  valor: brl.format(dados.total_vendas),
                  icon: Landmark,
                },
                {
                  label: "Ingressos vendidos",
                  valor: String(dados.ingressos_vendidos),
                  icon: TicketCheck,
                },
                {
                  label: "Organizadores ativos",
                  valor: String(dados.organizadores_ativos),
                  icon: Users,
                },
              ]}
            />
          ) : (
            <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
              Não foi possível carregar o faturamento agora. Tente recarregar a página.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
