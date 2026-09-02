-- ======================================================================
-- MIGRATION: Adicionar availability à tabela jobs
-- ======================================================================

ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS availability text;
