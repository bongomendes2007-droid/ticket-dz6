-- ============================================================================
-- Ticket DZ6 — FASE 2 — Migration 001: estrutura inicial
-- ----------------------------------------------------------------------------
-- Cria as tabelas: profiles, events, ticket_batches
-- Configura o trigger de criacao automatica de profile
-- Habilita RLS (Row Level Security) e cria todas as politicas de acesso
--
-- Como usar: cole este arquivo inteiro no SQL Editor do Supabase e clique RUN.
-- O script e idempotente o suficiente para rodar em um projeto novo/limpo.
-- ============================================================================


-- ============================================================================
-- 1) TABELA: profiles
-- ----------------------------------------------------------------------------
-- Guarda os dados de cada usuario. O `id` referencia auth.users (tabela de
-- autenticacao do Supabase). Quando o usuario do auth e deletado, o profile
-- tambem e removido (ON DELETE CASCADE).
-- ============================================================================
create table public.profiles (
  id            uuid        primary key references auth.users (id) on delete cascade,
  nome_completo text        not null,
  empresa       text,
  telefone      text,
  criado_em     timestamptz not null default now()
);

comment on table public.profiles is 'Dados de perfil dos usuarios (1:1 com auth.users).';


-- ============================================================================
-- 2) TRIGGER: criar profile automaticamente ao registrar um usuario
-- ----------------------------------------------------------------------------
-- Sempre que um novo registro entra em auth.users, esta funcao insere a linha
-- correspondente em public.profiles. O `nome_completo` e lido dos metadados do
-- cadastro (raw_user_meta_data->>'nome_completo'); se nao vier, usa o e-mail
-- como fallback para nao violar o NOT NULL.
--
-- SECURITY DEFINER: a funcao roda com os privilegios do dono (postgres),
-- necessario porque o trigger dispara durante o signup, antes de existir
-- sessao do usuario.
-- ============================================================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, nome_completo)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'nome_completo', new.email)
  );
  return new;
end;
$$;

-- O trigger em si: dispara depois de cada INSERT em auth.users.
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();


-- ============================================================================
-- 3) TABELA: events
-- ----------------------------------------------------------------------------
-- Eventos criados pelos organizadores. `organizer_id` aponta para profiles.id.
-- `slug` e unico (usado na URL publica). `status` controla a visibilidade.
-- ============================================================================
create table public.events (
  id           uuid        primary key default gen_random_uuid(),
  organizer_id uuid        not null references public.profiles (id) on delete cascade,
  titulo       text        not null,
  descricao    text,
  categoria    text,
  data_evento  timestamptz,
  local        text,
  imagem_capa  text,
  slug         text        not null unique,
  status       text        not null default 'rascunho'
                 check (status in ('rascunho', 'publicado', 'encerrado')),
  criado_em    timestamptz not null default now()
);

comment on table public.events is 'Eventos criados pelos organizadores.';

-- Indice para acelerar a busca dos eventos de um organizador.
create index events_organizer_id_idx on public.events (organizer_id);


-- ============================================================================
-- 4) TABELA: ticket_batches (lotes de ingressos)
-- ----------------------------------------------------------------------------
-- Cada evento pode ter varios lotes (ex: "1o lote", "VIP"). Guarda preco,
-- quantidade total e quantidade ja vendida.
-- ============================================================================
create table public.ticket_batches (
  id                 uuid          primary key default gen_random_uuid(),
  event_id           uuid          not null references public.events (id) on delete cascade,
  nome               text          not null,
  preco              numeric(10,2) not null check (preco >= 0),
  quantidade_total   int           not null check (quantidade_total > 0),
  quantidade_vendida int           not null default 0,
  ativo              boolean       not null default true
);

comment on table public.ticket_batches is 'Lotes de ingressos de cada evento.';

-- Indice para acelerar a busca dos lotes de um evento.
create index ticket_batches_event_id_idx on public.ticket_batches (event_id);


-- ============================================================================
-- 5) HABILITAR RLS (Row Level Security)
-- ----------------------------------------------------------------------------
-- Com RLS habilitado, NENHUMA linha e acessivel ate existir uma policy que
-- permita. Isso garante que cada usuario so veja/altere o que tem direito.
-- ============================================================================
alter table public.profiles       enable row level security;
alter table public.events         enable row level security;
alter table public.ticket_batches enable row level security;


-- ============================================================================
-- 6) POLITICAS — profiles
-- ----------------------------------------------------------------------------
-- O usuario logado so pode ver e editar o PROPRIO profile (auth.uid() = id).
-- (Nao criamos policy de INSERT/DELETE: o INSERT e feito pelo trigger acima,
--  e o DELETE acontece em cascata quando o auth.users e removido.)
-- ============================================================================
create policy "Usuario ve o proprio profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Usuario edita o proprio profile"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);


-- ============================================================================
-- 7) POLITICAS — events
-- ----------------------------------------------------------------------------
-- (a) Organizador tem controle total (CRUD) apenas dos PROPRIOS eventos.
-- (b) QUALQUER pessoa (inclusive nao logada) pode VER eventos publicados,
--     para a pagina publica funcionar.
-- ============================================================================

-- (a) Organizador: ver os proprios eventos
create policy "Organizador ve os proprios eventos"
  on public.events for select
  using (auth.uid() = organizer_id);

-- (a) Organizador: criar evento (so consegue criar em seu proprio nome)
create policy "Organizador cria os proprios eventos"
  on public.events for insert
  with check (auth.uid() = organizer_id);

-- (a) Organizador: editar os proprios eventos
create policy "Organizador edita os proprios eventos"
  on public.events for update
  using (auth.uid() = organizer_id)
  with check (auth.uid() = organizer_id);

-- (a) Organizador: deletar os proprios eventos
create policy "Organizador deleta os proprios eventos"
  on public.events for delete
  using (auth.uid() = organizer_id);

-- (b) Publico: qualquer um ve eventos publicados
create policy "Qualquer um ve eventos publicados"
  on public.events for select
  using (status = 'publicado');


-- ============================================================================
-- 8) POLITICAS — ticket_batches
-- ----------------------------------------------------------------------------
-- (a) Organizador gerencia (CRUD) apenas os lotes de eventos QUE LHE PERTENCEM.
--     Verificamos via subconsulta: existe um event cujo organizer_id = auth.uid()
--     e cujo id = ticket_batches.event_id.
-- (b) Qualquer pessoa pode VER lotes de eventos publicados.
-- ============================================================================

-- (a) Organizador: ver lotes dos proprios eventos
create policy "Organizador ve lotes dos proprios eventos"
  on public.ticket_batches for select
  using (
    exists (
      select 1 from public.events e
      where e.id = ticket_batches.event_id
        and e.organizer_id = auth.uid()
    )
  );

-- (a) Organizador: criar lotes nos proprios eventos
create policy "Organizador cria lotes dos proprios eventos"
  on public.ticket_batches for insert
  with check (
    exists (
      select 1 from public.events e
      where e.id = ticket_batches.event_id
        and e.organizer_id = auth.uid()
    )
  );

-- (a) Organizador: editar lotes dos proprios eventos
create policy "Organizador edita lotes dos proprios eventos"
  on public.ticket_batches for update
  using (
    exists (
      select 1 from public.events e
      where e.id = ticket_batches.event_id
        and e.organizer_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.events e
      where e.id = ticket_batches.event_id
        and e.organizer_id = auth.uid()
    )
  );

-- (a) Organizador: deletar lotes dos proprios eventos
create policy "Organizador deleta lotes dos proprios eventos"
  on public.ticket_batches for delete
  using (
    exists (
      select 1 from public.events e
      where e.id = ticket_batches.event_id
        and e.organizer_id = auth.uid()
    )
  );

-- (b) Publico: qualquer um ve lotes de eventos publicados
create policy "Qualquer um ve lotes de eventos publicados"
  on public.ticket_batches for select
  using (
    exists (
      select 1 from public.events e
      where e.id = ticket_batches.event_id
        and e.status = 'publicado'
    )
  );


-- ============================================================================
-- FIM da migration 001.
-- ============================================================================
