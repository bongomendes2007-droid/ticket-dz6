// Desconecta a conta Mercado Pago do organizador: limpa os campos mp_* do
// profile. POST (nao GET) para nao ser disparavel por um link/prefetch.
import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const { error } = await supabase
    .from("profiles")
    .update({
      mp_access_token: null,
      mp_refresh_token: null,
      mp_user_id: null,
      mp_token_expires_at: null,
    })
    .eq("id", user.id);

  if (error) {
    console.error("[mercadopago/disconnect] falha ao limpar profile:", error);
    return NextResponse.redirect(
      new URL("/painel?mp=erro_desconectar", request.url)
    );
  }

  return NextResponse.redirect(new URL("/painel?mp=desconectado", request.url));
}
