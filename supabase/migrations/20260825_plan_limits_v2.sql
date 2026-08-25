-- ======================================================================
-- MIGRATION: Fase 5 - Validação Backend (Limites Mensais e Expiração)
-- ======================================================================

-- 1. Função e Trigger para limitar a criação de Jobs (Vagas) por mês
CREATE OR REPLACE FUNCTION check_employer_job_limit()
RETURNS trigger AS $$
DECLARE
    user_plan text;
    user_expires_at timestamp with time zone;
    active_jobs_count int;
    plan_limit int;
BEGIN
    -- Obter o plano e expiração do utilizador a partir da tabela subscriptions
    SELECT plan, expires_at INTO user_plan, user_expires_at FROM public.subscriptions WHERE user_id = NEW.employer_id;
    
    -- Tratar expiração e predefinição
    IF user_plan IN ('PLUS', 'PREMIUM') AND user_expires_at < now() THEN
        user_plan := 'FREE';
    ELSIF user_plan IS NULL THEN
        -- Fallback para verificar no utilizador caso a subscription não exista
        SELECT subscription_plan INTO user_plan FROM public.users WHERE id = NEW.employer_id;
        IF user_plan IS NULL THEN user_plan := 'FREE'; END IF;
    END IF;

    -- Definir limites baseados no plano
    IF user_plan = 'MAX' THEN
        RETURN NEW; -- Ilimitado
    ELSIF user_plan IN ('PLUS', 'PREMIUM') THEN
        plan_limit := 5;
    ELSE
        plan_limit := 1; -- FREE
    END IF;

    -- Contar as vagas criadas nos ultimos 30 dias
    SELECT count(*) INTO active_jobs_count 
    FROM public.jobs 
    WHERE employer_id = NEW.employer_id AND created_at >= (now() - interval '30 days');

    -- Lançar erro se o limite for atingido
    IF active_jobs_count >= plan_limit THEN
        RAISE EXCEPTION 'Limite mensal de vagas atingido. O seu plano (%) permite um máximo de % vagas a cada 30 dias.', user_plan, plan_limit;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 2. Função e Trigger para limitar candidaturas por Trabalhadores por mês
CREATE OR REPLACE FUNCTION check_worker_application_limit()
RETURNS trigger AS $$
DECLARE
    user_plan text;
    user_expires_at timestamp with time zone;
    active_apps_count int;
    plan_limit int;
BEGIN
    -- Obter o plano e expiração
    SELECT plan, expires_at INTO user_plan, user_expires_at FROM public.subscriptions WHERE user_id = NEW.worker_id;
    
    -- Tratar expiração
    IF user_plan IN ('PLUS', 'PREMIUM') AND user_expires_at < now() THEN
        user_plan := 'FREE';
    ELSIF user_plan IS NULL THEN
        SELECT subscription_plan INTO user_plan FROM public.users WHERE id = NEW.worker_id;
        IF user_plan IS NULL THEN user_plan := 'FREE'; END IF;
    END IF;

    -- Definir limites baseados no plano
    IF user_plan = 'MAX' THEN
        RETURN NEW; -- Ilimitado
    ELSIF user_plan IN ('PLUS', 'PREMIUM') THEN
        plan_limit := 10;
    ELSE
        plan_limit := 3; -- FREE
    END IF;

    -- Contar as candidaturas nos últimos 30 dias
    SELECT count(*) INTO active_apps_count 
    FROM public.applications 
    WHERE worker_id = NEW.worker_id AND created_at >= (now() - interval '30 days');

    -- Lançar erro se o limite for atingido
    IF active_apps_count >= plan_limit THEN
        RAISE EXCEPTION 'Limite mensal de candidaturas atingido. O seu plano (%) permite um máximo de % candidaturas a cada 30 dias.', user_plan, plan_limit;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. Função e Trigger para limitar Posts por mês (Apenas para utilizadores)
CREATE OR REPLACE FUNCTION check_user_post_limit()
RETURNS trigger AS $$
DECLARE
    user_plan text;
    user_expires_at timestamp with time zone;
    posts_count int;
    plan_limit int;
BEGIN
    -- Ignorar posts do sistema
    IF NEW.user_id = '00000000-0000-0000-0000-000000000000' THEN RETURN NEW; END IF;

    -- Obter o plano e expiração
    SELECT plan, expires_at INTO user_plan, user_expires_at FROM public.subscriptions WHERE user_id = NEW.user_id;
    
    -- Tratar expiração
    IF user_plan IN ('PLUS', 'PREMIUM') AND user_expires_at < now() THEN
        user_plan := 'FREE';
    ELSIF user_plan IS NULL THEN
        SELECT subscription_plan INTO user_plan FROM public.users WHERE id = NEW.user_id;
        IF user_plan IS NULL THEN user_plan := 'FREE'; END IF;
    END IF;

    -- Definir limites baseados no plano
    IF user_plan = 'MAX' THEN
        RETURN NEW; -- Ilimitado
    ELSIF user_plan IN ('PLUS', 'PREMIUM') THEN
        plan_limit := 10;
    ELSE
        plan_limit := 1; -- FREE
    END IF;

    -- Contar posts nos últimos 30 dias
    SELECT count(*) INTO posts_count 
    FROM public.posts 
    WHERE user_id = NEW.user_id AND created_at >= (now() - interval '30 days');

    -- Lançar erro se o limite for atingido
    IF posts_count >= plan_limit THEN
        RAISE EXCEPTION 'Limite mensal de publicações atingido. O seu plano (%) permite um máximo de % publicações a cada 30 dias.', user_plan, plan_limit;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS check_post_limit_trigger ON public.posts;
CREATE TRIGGER check_post_limit_trigger
BEFORE INSERT ON public.posts
FOR EACH ROW
EXECUTE FUNCTION check_user_post_limit();

-- 4. Função auxiliar para validar/revogar planos
CREATE OR REPLACE FUNCTION sync_user_premium_status()
RETURNS void AS $$
BEGIN
    -- Atualizar utilizadores que estão expirados para FREE
    UPDATE public.users u
    SET is_premium = false, subscription_plan = 'FREE'
    FROM public.subscriptions s
    WHERE u.id = s.user_id 
      AND s.plan IN ('PLUS', 'PREMIUM')
      AND s.expires_at < now()
      AND u.is_premium = true;
END;
$$ LANGUAGE plpgsql;
