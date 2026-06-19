import { type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

export async function middleware(request: NextRequest) {
  return await updateSession(request)
}

export const config = {
  matcher: [
    /*
     * Aplica o middleware a todas as rotas, exceto:
     * - _next/static (arquivos estaticos)
     * - _next/image (otimizacao de imagens)
     * - favicon.ico
     * - arquivos de imagem comuns
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
