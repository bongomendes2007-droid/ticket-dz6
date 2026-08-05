-- ============================================================================
-- Ticket DZ6 — Migration 007: GRANTs para service_role
-- ----------------------------------------------------------------------------
-- BUG CONFIRMADO em producao: o checkout (app/api/checkout/criar-pagamento)
-- usa lib/supabase/service.ts (service_role key) pra ler o evento do
-- ORGANIZADOR — mas a query falhava com "permission denied for table events"
-- (code 42501). Causa: service_role SO ignora RLS, mas ainda precisa de
-- GRANT de tabela como qualquer outra role (mesma licao da migration 005,
-- que na epoca so cobriu anon/authenticated). Como events/ticket_batches/
-- profiles foram criadas na migration 001 sem GRANT nenhum pra service_role,
-- toda query do checkout (e da rota /api/admin/faturamento) falhava — e o
-- codigo da rota mascarava isso como "Evento não encontrado.".
--
-- Como usar: cole este arquivo inteiro no SQL Editor do Supabase e clique RUN.
-- ============================================================================

-- Leitura: o checkout e o /api/admin/faturamento so PRECISAM ler estas.
grant select on public.events         to service_role;
grant select on public.ticket_batches to service_role;
grant select on public.profiles       to service_role;

-- orders/tickets: o checkout cria e atualiza orders (status, mp_payment_id);
-- o webhook do Mercado Pago (Fase 3.3) vai atualizar orders.status e criar
-- tickets — concedendo ja agora pra nao repetir esse mesmo bug na Fase 3.3.
grant select, insert, update on public.orders  to service_role;
grant select, insert, update on public.tickets to service_role;

-- ============================================================================
-- FIM da migration 007.
-- ============================================================================
