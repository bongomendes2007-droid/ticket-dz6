import { createClient } from '@/lib/supabase/server'

// Pagina temporaria para validar a conexao com o Supabase ANTES de
// criar tabelas. Pode ser removida depois que a conexao for confirmada.
export const dynamic = 'force-dynamic'

export default async function TesteSupabasePage() {
  let status: 'ok' | 'erro' = 'ok'
  let mensagem = ''
  let detalhe = ''

  // Checagem basica: as variaveis de ambiente foram preenchidas?
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !anonKey || anonKey.startsWith('COLAR_AQUI')) {
    status = 'erro'
    mensagem = 'Variaveis de ambiente nao configuradas.'
    detalhe =
      'Preencha NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY no arquivo .env.local e reinicie o servidor (npm run dev).'
  } else {
    try {
      const supabase = await createClient()
      const { data, error } = await supabase.auth.getSession()

      if (error) {
        status = 'erro'
        mensagem = 'A chamada ao Supabase retornou um erro.'
        detalhe = error.message
      } else {
        status = 'ok'
        mensagem = 'Conexao com o Supabase funcionando!'
        detalhe = data.session
          ? 'Existe uma sessao ativa.'
          : 'Conexao OK. Nenhuma sessao ativa (esperado, ainda nao ha login).'
      }
    } catch (e) {
      status = 'erro'
      mensagem = 'Falha ao conectar com o Supabase.'
      detalhe = e instanceof Error ? e.message : String(e)
    }
  }

  const ok = status === 'ok'

  return (
    <main className="flex min-h-screen items-center justify-center bg-neutral-950 p-6 text-neutral-100">
      <div className="w-full max-w-lg rounded-2xl border border-neutral-800 bg-neutral-900 p-8 shadow-xl">
        <h1 className="mb-6 text-2xl font-bold">Teste de conexao — Supabase</h1>

        <div
          className={`mb-4 flex items-center gap-3 rounded-xl border p-4 ${
            ok
              ? 'border-green-700 bg-green-950/50'
              : 'border-red-700 bg-red-950/50'
          }`}
        >
          <span className="text-2xl">{ok ? '✅' : '❌'}</span>
          <span className="font-semibold">{mensagem}</span>
        </div>

        <p className="text-sm leading-relaxed text-neutral-400">{detalhe}</p>

        <p className="mt-6 text-xs text-neutral-600">
          Esta pagina e temporaria e pode ser removida apos validar a conexao.
        </p>
      </div>
    </main>
  )
}
