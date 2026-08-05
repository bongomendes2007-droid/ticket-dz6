// Agrega o faturamento de TODA a plataforma (todos os organizadores/eventos).
// So pode ser chamada por um usuario com profiles.is_admin = true — a
// checagem roda com o cliente normal (RLS, só vê o próprio profile) ANTES
// de sacar o createServiceClient() pra agregar sem restrição de RLS.
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";

export const dynamic = "force-dynamic";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ erro: "Não autenticado." }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile?.is_admin) {
    return NextResponse.json({ erro: "Acesso negado." }, { status: 403 });
  }

  // --- So a partir daqui usamos o service role, e so porque ja confirmamos
  //     que quem pediu e admin. ---
  const service = createServiceClient();

  const { data: ordersAprovadas, error: erroOrders } = await service
    .from("orders")
    .select("valor_total, valor_taxa_plataforma")
    .eq("status", "aprovado");

  if (erroOrders) {
    console.error("[admin/faturamento] erro ao buscar orders:", erroOrders);
    return NextResponse.json({ erro: "Falha ao buscar faturamento." }, { status: 500 });
  }

  const comissaoTotal = (ordersAprovadas ?? []).reduce(
    (soma, o) => soma + Number(o.valor_taxa_plataforma),
    0
  );
  const totalVendas = (ordersAprovadas ?? []).reduce(
    (soma, o) => soma + Number(o.valor_total),
    0
  );

  const { count: ingressosVendidos } = await service
    .from("tickets")
    .select("id", { count: "exact", head: true })
    .neq("status", "cancelado");

  const { data: eventosPublicados } = await service
    .from("events")
    .select("organizer_id")
    .eq("status", "publicado");

  const organizadoresAtivos = new Set(
    (eventosPublicados ?? []).map((e) => e.organizer_id)
  ).size;

  return NextResponse.json({
    comissao_total: comissaoTotal,
    total_vendas: totalVendas,
    ingressos_vendidos: ingressosVendidos ?? 0,
    organizadores_ativos: organizadoresAtivos,
  });
}
