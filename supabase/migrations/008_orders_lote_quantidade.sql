-- ============================================================================
-- Ticket DZ6 — Migration 008: `ticket_batch_id` e `quantidade` em orders
-- ----------------------------------------------------------------------------
-- Fase 3.3 (webhook do Mercado Pago): pra gerar os tickets quando um
-- pagamento e aprovado, o webhook precisa saber DE QUAL LOTE e QUANTOS
-- ingressos essa order comprou. Isso era calculado em
-- app/api/checkout/criar-pagamento mas nunca persistido na order — so
-- usado em memoria pra calcular os valores (valor_total etc.) e depois
-- descartado. Sem essas colunas o webhook nao tem como saber o que gerar.
--
-- Tabela esta vazia (0 linhas) no momento desta migration, entao da pra
-- criar direto como NOT NULL, sem precisar de backfill.
--
-- Como usar: cole este arquivo inteiro no SQL Editor do Supabase e clique RUN.
-- ============================================================================

alter table public.orders
  add column ticket_batch_id uuid not null references public.ticket_batches (id),
  add column quantidade      int  not null check (quantidade > 0);

comment on column public.orders.ticket_batch_id is 'Lote de ingresso comprado nessa order.';
comment on column public.orders.quantidade is 'Quantidade de ingressos comprados nessa order (= quantos tickets gerar quando aprovada).';

create index orders_ticket_batch_id_idx on public.orders (ticket_batch_id);

-- ============================================================================
-- FIM da migration 008.
-- ============================================================================
