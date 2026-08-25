-- ======================================================================
-- MIGRATION: Simplificação do Perfil de Empregador (Cliente)
-- ======================================================================

ALTER TABLE public.employer_profiles 
DROP COLUMN IF EXISTS company_name,
DROP COLUMN IF EXISTS address_details,
DROP COLUMN IF EXISTS description;

ALTER TABLE public.employer_profiles
ADD COLUMN IF NOT EXISTS interests text;
