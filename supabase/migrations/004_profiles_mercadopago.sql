-- ============================================================================
-- Ticket DZ6 — Migration 004: colunas de OAuth do Mercado Pago em profiles
-- ----------------------------------------------------------------------------
-- Fase 3.1: onboarding do organizador via OAuth do Mercado Pago. Guarda o
-- resultado do fluxo de autorizacao (code -> token) no profile do organizador,
-- para depois usar o access_token na hora de criar cobrancas/split de cada
-- evento.
--
-- Como usar: cole este arquivo inteiro no SQL Editor do Supabase e clique RUN.
-- ============================================================================

alter table public.profiles
  add column if not exists mp_access_token    text,
  add column if not exists mp_refresh_token   text,
  add column if not exists mp_user_id         text,
  add column if not exists mp_token_expires_at timestamptz;

comment on column public.profiles.mp_access_token is 'Access token OAuth do Mercado Pago do organizador (retornado no callback).';
comment on column public.profiles.mp_refresh_token is 'Refresh token OAuth do Mercado Pago, usado para renovar o access_token expirado.';
comment on column public.profiles.mp_user_id is 'ID da conta Mercado Pago conectada (user_id retornado pelo OAuth). Null = nao conectado.';
comment on column public.profiles.mp_token_expires_at is 'Momento em que o mp_access_token expira (agora + expires_in do OAuth).';

-- ============================================================================
-- FIM da migration 004.
-- ============================================================================
