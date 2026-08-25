-- ======================================================================
-- MIGRATION: Fase 4 - Validação Backend (Limites por Plano)
-- ======================================================================

-- 1. Função e Trigger para limitar a criação de Jobs (Vagas) por Empregadores
CREATE OR REPLACE FUNCTION check_employer_job_limit()
RETURNS trigger AS $$
DECLARE
    user_plan text;
    active_jobs_count int;
    plan_limit int;
BEGIN
    -- Obter o plano do utilizador
    SELECT subscription_plan INTO user_plan FROM public.users WHERE id = NEW.employer_id;
    
    -- Definir limites baseados no plano
    IF user_plan = 'MAX' THEN
        RETURN NEW; -- Ilimitado
    ELSIF user_plan = 'PLUS' THEN
        plan_limit := 5;
    ELSE
        plan_limit := 1; -- FREE
    END IF;

    -- Contar as vagas activas actuais do utilizador
    SELECT count(*) INTO active_jobs_count 
    FROM public.jobs 
    WHERE employer_id = NEW.employer_id AND status = 'ACTIVE';

    -- Lançar erro se o limite for atingido
    IF active_jobs_count >= plan_limit THEN
        RAISE EXCEPTION 'Limite de vagas atingido. O seu plano (%) permite um máximo de % vagas activas.', user_plan, plan_limit;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS check_job_limit_trigger ON public.jobs;
CREATE TRIGGER check_job_limit_trigger
BEFORE INSERT ON public.jobs
FOR EACH ROW
EXECUTE FUNCTION check_employer_job_limit();

-- 2. Função e Trigger para limitar candidaturas por Trabalhadores
CREATE OR REPLACE FUNCTION check_worker_application_limit()
RETURNS trigger AS $$
DECLARE
    user_plan text;
    active_apps_count int;
    plan_limit int;
BEGIN
    -- Obter o plano do utilizador
    SELECT subscription_plan INTO user_plan FROM public.users WHERE id = NEW.worker_id;
    
    -- Definir limites baseados no plano
    IF user_plan = 'MAX' THEN
        RETURN NEW; -- Ilimitado
    ELSIF user_plan = 'PLUS' THEN
        plan_limit := 10;
    ELSE
        plan_limit := 3; -- FREE
    END IF;

    -- Contar as candidaturas pendentes/aceites actuais do utilizador
    SELECT count(*) INTO active_apps_count 
    FROM public.applications 
    WHERE worker_id = NEW.worker_id AND status IN ('PENDING', 'ACCEPTED');

    -- Lançar erro se o limite for atingido
    IF active_apps_count >= plan_limit THEN
        RAISE EXCEPTION 'Limite de candidaturas atingido. O seu plano (%) permite um máximo de % candidaturas activas.', user_plan, plan_limit;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS check_application_limit_trigger ON public.applications;
CREATE TRIGGER check_application_limit_trigger
BEFORE INSERT ON public.applications
FOR EACH ROW
EXECUTE FUNCTION check_worker_application_limit();
