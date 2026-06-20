import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Recebe o retorno do login com Google (OAuth) e dos links enviados por
// email (confirmacao de conta / recuperacao de senha). Troca o `code` por
// uma sessao e redireciona o usuario.
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/painel";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // Sem code valido: volta para o login sinalizando erro.
  return NextResponse.redirect(`${origin}/login`);
}
