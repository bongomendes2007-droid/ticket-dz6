import { createClient as createSupabaseClient } from "@supabase/supabase-js";

// Cliente com a SERVICE ROLE KEY — ignora RLS por completo.
// Uso restrito a Route Handlers de servidor que precisam ler/escrever dados
// que atravessam usuarios (ex.: checkout publico lendo o mp_access_token do
// ORGANIZADOR, que nao e o comprador logado). NUNCA importar em Client
// Components nem expor essa chave ao navegador.
export function createServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  // Falha alto e cedo, com mensagem clara, em vez de deixar o supabase-js
  // criar um client com `undefined` e falhar mais tarde na query com um
  // erro generico de auth — que ai vira facilmente uma mensagem enganosa
  // tipo "nao encontrado" pra quem trata o erro rio abaixo.
  if (!url || !serviceKey) {
    throw new Error(
      "[supabase/service] NEXT_PUBLIC_SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY " +
        "ausentes nas env vars do servidor. Confira as Environment Variables do projeto na Vercel."
    );
  }

  return createSupabaseClient(url, serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
