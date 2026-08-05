// Inicia o fluxo OAuth do Mercado Pago: gera um `state` aleatorio (protecao
// CSRF), guarda em cookie httpOnly de curta duracao e redireciona o
// organizador para a tela de autorizacao do Mercado Pago. O callback
// (app/api/mercadopago/callback/route.ts) confere esse cookie contra o
// `state` que voltar na URL.
import { NextResponse, type NextRequest } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const clientId = process.env.MERCADOPAGO_CLIENT_ID;
  const redirectUri = process.env.MERCADOPAGO_REDIRECT_URI;
  if (!clientId || !redirectUri) {
    console.error("[mercadopago/connect] variaveis de ambiente ausentes");
    return NextResponse.redirect(
      new URL("/painel?mp=erro_config", request.url)
    );
  }

  const state = crypto.randomUUID();
  const cookieStore = await cookies();
  cookieStore.set("mp_oauth_state", state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 10, // 10 minutos — tempo de sobra pra completar o fluxo.
    path: "/",
  });

  const authUrl = new URL("https://auth.mercadopago.com/authorization");
  authUrl.searchParams.set("client_id", clientId);
  authUrl.searchParams.set("response_type", "code");
  authUrl.searchParams.set("platform_id", "mp");
  authUrl.searchParams.set("state", state);
  authUrl.searchParams.set("redirect_uri", redirectUri);

  return NextResponse.redirect(authUrl);
}
