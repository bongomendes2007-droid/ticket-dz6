import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// Faz o refresh da sessao (tokens) em cada request e repassa os cookies
// atualizados tanto para o navegador quanto para os Server Components.
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // IMPORTANTE: nao insira codigo entre createServerClient e getUser().
  // Um erro aqui pode dificultar a depuracao de problemas de sessao.
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const path = request.nextUrl.pathname

  // Rotas que exigem login.
  const rotaProtegida = path.startsWith("/painel")
  // Telas de auth: usuario ja logado nao deve ver.
  const rotaDeAuth =
    path === "/login" ||
    path === "/cadastro" ||
    path === "/recuperar-senha";

  // Nao logado tentando acessar area protegida -> manda para o login.
  if (!user && rotaProtegida) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return redirecionarPreservandoCookies(url, supabaseResponse);
  }

  // Ja logado tentando acessar telas de auth -> manda para o painel.
  if (user && rotaDeAuth) {
    const url = request.nextUrl.clone();
    url.pathname = "/painel";
    return redirecionarPreservandoCookies(url, supabaseResponse);
  }

  return supabaseResponse;
}

// Ao redirecionar, precisamos copiar os cookies de sessao ja atualizados
// para a nova resposta — senao o refresh feito pelo getUser() seria perdido.
function redirecionarPreservandoCookies(
  url: URL,
  from: NextResponse
): NextResponse {
  const redirect = NextResponse.redirect(url);
  from.cookies.getAll().forEach((cookie) => {
    redirect.cookies.set(cookie);
  });
  return redirect;
}
