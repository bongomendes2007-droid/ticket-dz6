import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

// Cliente para uso em Server Components, Route Handlers e Server Actions.
// Le e escreve a sessao via cookies da request.
export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // O metodo `setAll` foi chamado a partir de um Server Component.
            // Isso pode ser ignorado se houver um middleware fazendo o
            // refresh da sessao do usuario.
          }
        },
      },
    }
  )
}
