-- ============================================================================
-- Ticket DZ6 — FASE 2 — Migration 002: corrige policies de INSERT (RLS)
-- ----------------------------------------------------------------------------
-- Sintoma: POST /rest/v1/events retornava 403 Forbidden ao criar evento.
-- Causa: faltava (ou nao estava aplicada) a policy de INSERT. Com RLS ligado
-- e SEM policy de INSERT que de match, o Postgres NEGA todo insert por padrao.
--
-- O Postgres NAO suporta "create policy if not exists", entao usamos o padrao
-- idempotente: drop policy if exists  ->  create policy.
--
-- Como usar: cole tudo no SQL Editor do Supabase e clique RUN.
-- ============================================================================


-- ----------------------------------------------------------------------------
-- (Opcional) DIAGNOSTICO: rode isto para ver as policies que existem hoje.
-- Verifique se ha uma linha com cmd = 'INSERT' para cada tabela.
-- ----------------------------------------------------------------------------
-- select tablename, policyname, cmd, roles
-- from pg_policies
-- where tablename in ('events', 'ticket_batches')
-- order by tablename, cmd;


-- ============================================================================
-- EVENTS — policy de INSERT
-- ----------------------------------------------------------------------------
-- O organizador so pode inserir eventos em seu proprio nome.
-- Removemos qualquer versao anterior (com nome novo OU antigo) antes de criar.
-- ============================================================================
drop policy if exists "Organizador cria proprios eventos" on public.events;
drop policy if exists "Organizador cria os proprios eventos" on public.events;

create policy "Organizador cria proprios eventos"
  on public.events
  for insert
  to authenticated
  with check (auth.uid() = organizer_id);


-- ============================================================================
-- TICKET_BATCHES — policy de INSERT
-- ----------------------------------------------------------------------------
-- O organizador so pode inserir lotes em eventos que pertencem a ele.
-- ============================================================================
drop policy if exists "Organizador cria lotes dos proprios eventos" on public.ticket_batches;

create policy "Organizador cria lotes dos proprios eventos"
  on public.ticket_batches
  for insert
  to authenticated
  with check (
    exists (
      select 1 from public.events
      where events.id = ticket_batches.event_id
        and events.organizer_id = auth.uid()
    )
  );


-- ----------------------------------------------------------------------------
-- CONFERENCIA: rode de novo o diagnostico — agora deve aparecer cmd = 'INSERT'
-- para events e para ticket_batches, com roles = {authenticated}.
-- ----------------------------------------------------------------------------
-- select tablename, policyname, cmd, roles
-- from pg_policies
-- where tablename in ('events', 'ticket_batches')
-- order by tablename, cmd;

-- ============================================================================
-- FIM da migration 002.
-- ============================================================================
