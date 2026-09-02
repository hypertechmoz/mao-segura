-- ======================================================================
-- MIGRATION: Adicionar título do serviço aos contratos e histórico
-- ======================================================================

ALTER TABLE public.contracts ADD COLUMN IF NOT EXISTS service_title text DEFAULT 'Serviço Direto';
