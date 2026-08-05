import { createClient as createSupabaseClient } from "@supabase/supabase-js";

// Cliente com a SERVICE ROLE KEY — ignora RLS por completo.
// Uso restrito a Route Handlers de servidor que precisam ler/escrever dados
// que atravessam usuarios (ex.: checkout publico lendo o mp_access_token do
// ORGANIZADOR, que nao e o comprador logado). NUNCA importar em Client
// Components nem expor essa chave ao navegador.
export function createServiceClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}
