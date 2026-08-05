-- ============================================================================
-- Ticket DZ6 — Migration 003: coluna `cidade` em events
-- ----------------------------------------------------------------------------
-- Ate aqui, "cidade" era derivada em tempo real no codigo a partir do campo
-- livre `local` (endereco/nome do espaco). Isso e fragil (parsing de texto).
-- Esta migration cria uma coluna `cidade` propria, separada de `local`.
--
-- Como usar: cole este arquivo inteiro no SQL Editor do Supabase e clique RUN.
-- ============================================================================

-- 1) Cria a coluna, inicialmente aceitando NULL (para nao quebrar linhas
--    existentes antes do backfill).
alter table public.events
  add column if not exists cidade text;

-- 2) Backfill: para eventos que ja tem `local` preenchido, tenta extrair a
--    cidade pegando o ultimo segmento apos virgula e removendo um sufixo
--    " - UF" no final (mesma heuristica que existia no codigo). Eventos sem
--    `local` ou sem virgula ficam com "A definir".
update public.events
set cidade = coalesce(
  nullif(
    regexp_replace(
      trim(split_part(local, ',', array_length(string_to_array(local, ','), 1))),
      '\s*-\s*[A-Za-z]{2}\s*$',
      ''
    ),
    ''
  ),
  'A definir'
)
where cidade is null;

-- 2b) O evento de teste "rec league" tem `local` = "arena sinapse" (sem
--     cidade no texto), entao o backfill acima nao consegue extrair uma
--     cidade real. Popula manualmente para teste.
update public.events
set cidade = 'Teresina'
where slug = 'rec-league' and (cidade is null or cidade = 'A definir');

-- 3) Agora que toda linha tem valor, torna a coluna obrigatoria.
alter table public.events
  alter column cidade set not null;

comment on column public.events.cidade is 'Municipio do evento (separado do campo `local`, que e o endereco/nome do espaco).';

-- ============================================================================
-- FIM da migration 003.
-- ============================================================================
