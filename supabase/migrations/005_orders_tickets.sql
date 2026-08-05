-- ============================================================================
-- Ticket DZ6 — Migration 005: tabelas `orders` e `tickets` (Fase 3.2)
-- ----------------------------------------------------------------------------
-- orders  = um pedido de compra (pode conter varios ingressos do mesmo
--           evento). Criado no checkout, ANTES do pagamento ser confirmado.
-- tickets = cada ingresso individual, gerado DEPOIS do pagamento aprovado
--           (via webhook do Mercado Pago, Fase 3.3), com QR code proprio.
--
-- Como usar: cole este arquivo inteiro no SQL Editor do Supabase e clique RUN.
-- ============================================================================


-- ============================================================================
-- 1) TABELA: orders
-- ----------------------------------------------------------------------------
-- Os quatro campos de valor (`valor_total`, `valor_taxa_gateway`,
-- `valor_taxa_plataforma`, `valor_organizador`) sao guardados separados —
-- e mais barato somar depois do que reconstruir o split a partir so do
-- valor_total, e serve de trilha de auditoria caso a taxa do MP mude.
-- ============================================================================
create table public.orders (
  id                     uuid          primary key default gen_random_uuid(),
  event_id               uuid          not null references public.events (id) on delete cascade,
  buyer_email            text          not null,
  buyer_name             text          not null,
  buyer_document         text,
  valor_total            numeric(10,2) not null check (valor_total >= 0),
  valor_taxa_gateway     numeric(10,2) not null check (valor_taxa_gateway >= 0),
  valor_taxa_plataforma  numeric(10,2) not null check (valor_taxa_plataforma >= 0),
  valor_organizador      numeric(10,2) not null check (valor_organizador >= 0),
  metodo_pagamento       text          check (metodo_pagamento in ('pix', 'cartao', 'boleto')),
  status                 text          not null default 'pendente'
                           check (status in ('pendente', 'aprovado', 'recusado', 'cancelado', 'estornado')),
  mp_payment_id          text,
  created_at             timestamptz   not null default now(),
  updated_at             timestamptz   not null default now()
);

comment on table public.orders is 'Pedidos de compra de ingressos (1 order pode gerar varios tickets).';
comment on column public.orders.valor_total is 'Total pago pelo comprador, incluindo taxa do gateway.';
comment on column public.orders.valor_taxa_gateway is 'Parte do valor_total retida pelo Mercado Pago.';
comment on column public.orders.valor_taxa_plataforma is 'Parte do valor_total que fica de comissao para a Ticket DZ6.';
comment on column public.orders.valor_organizador is 'Parte do valor_total repassada ao organizador do evento.';
comment on column public.orders.mp_payment_id is 'ID do pagamento no Mercado Pago (preenchido pelo webhook).';

create index orders_event_id_idx on public.orders (event_id);
create index orders_status_idx on public.orders (status);
create index orders_mp_payment_id_idx on public.orders (mp_payment_id);

-- Mantem `updated_at` sempre atualizado a cada UPDATE, sem depender do
-- codigo da aplicacao lembrar de setar o campo manualmente.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger orders_set_updated_at
  before update on public.orders
  for each row execute function public.set_updated_at();


-- ============================================================================
-- 2) TABELA: tickets
-- ----------------------------------------------------------------------------
-- `event_id` e redundante com `order_id -> orders.event_id`, mas evita um
-- JOIN extra nas queries mais comuns (ex.: "todos os tickets de um evento").
-- `codigo_qr` NAO e sequencial: e um valor unico e opaco (uuid + hash),
-- gerado na aplicacao no momento da criacao do ticket, para nao dar pra
-- adivinhar/forjar um QR code de outro ingresso.
-- ============================================================================
create table public.tickets (
  id              uuid        primary key default gen_random_uuid(),
  order_id        uuid        not null references public.orders (id) on delete cascade,
  event_id        uuid        not null references public.events (id) on delete cascade,
  ticket_batch_id uuid        not null references public.ticket_batches (id) on delete restrict,
  codigo_qr       text        not null unique,
  status          text        not null default 'valido'
                    check (status in ('valido', 'usado', 'cancelado')),
  usado_em        timestamptz,
  created_at      timestamptz not null default now()
);

comment on table public.tickets is 'Ingressos individuais gerados apos pagamento aprovado, um por lugar/entrada.';
comment on column public.tickets.codigo_qr is 'Codigo unico e opaco (uuid + hash) impresso no QR code — nao e sequencial.';
comment on column public.tickets.usado_em is 'Preenchido no check-in (Fase 4). Null = ainda nao foi usado.';

create index tickets_order_id_idx on public.tickets (order_id);
create index tickets_event_id_idx on public.tickets (event_id);
create index tickets_ticket_batch_id_idx on public.tickets (ticket_batch_id);
-- codigo_qr ja tem indice implicito por causa do UNIQUE.


-- ============================================================================
-- 3) RLS — habilitar em ambas as tabelas
-- ============================================================================
alter table public.orders  enable row level security;
alter table public.tickets enable row level security;


-- ============================================================================
-- 4) POLICIES — orders
-- ----------------------------------------------------------------------------
-- (a) Organizador ve APENAS as orders dos PROPRIOS eventos (join com
--     events.organizer_id).
-- (b) Checkout publico: qualquer pessoa (inclusive sem login) pode CRIAR uma
--     order — mas so para um evento publicado, e sem conseguir LER orders de
--     ninguem (nao ha policy de SELECT publica).
-- (c) Nao ha policy de UPDATE/DELETE para anon/authenticated: a confirmacao
--     de pagamento (mudar status para 'aprovado' etc.) e feita pelo webhook
--     do Mercado Pago via service_role, que ignora RLS por definicao no
--     Supabase — nao precisa de policy dedicada aqui.
-- ============================================================================
drop policy if exists "Organizador ve orders dos proprios eventos" on public.orders;
create policy "Organizador ve orders dos proprios eventos"
  on public.orders for select
  to authenticated
  using (
    exists (
      select 1 from public.events e
      where e.id = orders.event_id
        and e.organizer_id = auth.uid()
    )
  );

drop policy if exists "Qualquer um cria order em evento publicado" on public.orders;
create policy "Qualquer um cria order em evento publicado"
  on public.orders for insert
  to anon, authenticated
  with check (
    exists (
      select 1 from public.events e
      where e.id = orders.event_id
        and e.status = 'publicado'
    )
  );


-- ============================================================================
-- 5) POLICIES — tickets
-- ----------------------------------------------------------------------------
-- Fase 3.2 so cria a tabela; a EMISSAO dos tickets (INSERT) acontece na
-- Fase 3.3 via webhook, usando service_role (que ignora RLS). Por isso aqui
-- so existe policy de SELECT para o organizador — nenhuma policy publica de
-- INSERT/UPDATE/DELETE.
-- ============================================================================
drop policy if exists "Organizador ve tickets dos proprios eventos" on public.tickets;
create policy "Organizador ve tickets dos proprios eventos"
  on public.tickets for select
  to authenticated
  using (
    exists (
      select 1 from public.events e
      where e.id = tickets.event_id
        and e.organizer_id = auth.uid()
    )
  );


-- ============================================================================
-- 6) GRANTS — privilegios de tabela (separados das policies de RLS)
-- ----------------------------------------------------------------------------
-- RLS decide QUAIS LINHAS cada role enxerga; GRANT decide se a role pode
-- executar aquele COMANDO na tabela. Sem o GRANT, a policy nunca chega a
-- ser avaliada — o Postgres barra antes, com "permission denied for table".
-- ============================================================================

-- orders: anon precisa de INSERT (checkout sem login); authenticated precisa
-- de SELECT e INSERT (organizador logado tambem pode comprar/ver).
grant insert                 on public.orders  to anon;
grant select, insert         on public.orders  to authenticated;

-- tickets: so leitura por enquanto (emissao e via service_role, que ja tem
-- acesso total por padrao e nao passa por GRANT).
grant select on public.tickets to authenticated;

-- ============================================================================
-- FIM da migration 005.
-- ============================================================================
