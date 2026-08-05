-- ============================================================================
-- Ticket DZ6 — Migration 006: coluna `is_admin` em profiles
-- ----------------------------------------------------------------------------
-- Marca o(s) perfil(is) dono(s) da plataforma Ticket DZ6, com acesso ao
-- dashboard /admin (faturamento agregado de todos os organizadores).
--
-- Como usar: cole este arquivo inteiro no SQL Editor do Supabase e clique RUN.
-- Depois, promova seu proprio usuario manualmente com algo como:
--   update public.profiles set is_admin = true where id = '<seu-uuid>';
-- ============================================================================

alter table public.profiles
  add column if not exists is_admin boolean not null default false;

comment on column public.profiles.is_admin is
  'Se true, esse perfil e o dono da plataforma Ticket DZ6 e tem acesso ao
   dashboard /admin com faturamento de todos os eventos.';

-- ============================================================================
-- FIM da migration 006.
-- ============================================================================
