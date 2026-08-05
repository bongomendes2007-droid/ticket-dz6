// Callback do OAuth do Mercado Pago. O MP redireciona pra ca com `code` e
// `state` apos o organizador autorizar. Aqui a gente:
//   1) confere o `state` contra o cookie setado em /api/mercadopago/connect
//      (protecao CSRF — sem isso, um state forjado poderia trocar tokens
//      de outra pessoa pela sessao de quem clicar num link malicioso);
//   2) troca o `code` pelo access_token/refresh_token na API do MP;
//   3) salva os tokens no profile do organizador logado;
//   4) redireciona de volta pro painel com um status na querystring.
//
// ATENCAO: as credenciais em .env.local sao de PRODUCAO (APP_USR-...). Toda
// chamada real aqui bate na API de verdade do Mercado Pago.
import { NextResponse, type NextRequest } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const url = request.nextUrl;
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const erroRecebido = url.searchParams.get("error");

  const cookieStore = await cookies();
  const stateEsperado = cookieStore.get("mp_oauth_state")?.value;
  // Cookie e de uso unico: apaga assim que lido, independente do resultado.
  cookieStore.delete("mp_oauth_state");

  if (erroRecebido) {
    console.error("[mercadopago/callback] MP retornou erro:", erroRecebido);
    return NextResponse.redirect(
      new URL("/painel?mp=erro_autorizacao", request.url)
    );
  }

  if (!code || !state || !stateEsperado || state !== stateEsperado) {
    console.error("[mercadopago/callback] state invalido ou ausente", {
      recebido: state,
      esperado: Boolean(stateEsperado),
    });
    return NextResponse.redirect(new URL("/painel?mp=erro_state", request.url));
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const clientId = process.env.MERCADOPAGO_CLIENT_ID;
  const clientSecret = process.env.MERCADOPAGO_CLIENT_SECRET;
  const redirectUri = process.env.MERCADOPAGO_REDIRECT_URI;
  if (!clientId || !clientSecret || !redirectUri) {
    console.error("[mercadopago/callback] variaveis de ambiente ausentes");
    return NextResponse.redirect(
      new URL("/painel?mp=erro_config", request.url)
    );
  }

  let tokenData: {
    access_token?: string;
    refresh_token?: string;
    user_id?: number | string;
    expires_in?: number;
  };

  try {
    const resposta = await fetch("https://api.mercadopago.com/oauth/token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        code,
        grant_type: "authorization_code",
        redirect_uri: redirectUri,
      }),
    });

    tokenData = await resposta.json();

    if (!resposta.ok || !tokenData.access_token) {
      console.error(
        "[mercadopago/callback] troca de code por token falhou:",
        tokenData
      );
      return NextResponse.redirect(
        new URL("/painel?mp=erro_token", request.url)
      );
    }
  } catch (erro) {
    console.error("[mercadopago/callback] erro de rede no /oauth/token:", erro);
    return NextResponse.redirect(new URL("/painel?mp=erro_token", request.url));
  }

  const expiresAt = tokenData.expires_in
    ? new Date(Date.now() + tokenData.expires_in * 1000).toISOString()
    : null;

  const { error: updateErro } = await supabase
    .from("profiles")
    .update({
      mp_access_token: tokenData.access_token,
      mp_refresh_token: tokenData.refresh_token ?? null,
      mp_user_id: tokenData.user_id != null ? String(tokenData.user_id) : null,
      mp_token_expires_at: expiresAt,
    })
    .eq("id", user.id);

  if (updateErro) {
    console.error("[mercadopago/callback] falha ao salvar no profile:", updateErro);
    return NextResponse.redirect(
      new URL("/painel?mp=erro_salvar", request.url)
    );
  }

  return NextResponse.redirect(new URL("/painel?mp=sucesso", request.url));
}
