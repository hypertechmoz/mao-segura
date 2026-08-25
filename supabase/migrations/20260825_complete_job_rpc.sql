-- ======================================================================
-- MIGRATION: RPC para concluir contrato e avaliar profissional
-- ======================================================================

-- Primeiro garantimos que a coluna 'completed_contracts' existe
ALTER TABLE public.worker_profiles ADD COLUMN IF NOT EXISTS completed_contracts integer DEFAULT 0;
ALTER TABLE public.worker_profiles ADD COLUMN IF NOT EXISTS rating numeric DEFAULT 0;
ALTER TABLE public.worker_profiles ADD COLUMN IF NOT EXISTS reviews_count integer DEFAULT 0;

CREATE OR REPLACE FUNCTION public.complete_job_and_review(
    p_contract_id uuid,
    p_receiver_id uuid,
    p_rating integer,
    p_comment text,
    p_conversation_id uuid
) RETURNS void AS $$
DECLARE
    v_employer_id uuid;
    v_existing_review_id uuid;
    v_existing_rating integer;
    v_completed integer;
    v_rating_avg numeric;
    v_rating_count integer;
    v_worker_profile_exists boolean;
BEGIN
    v_employer_id := auth.uid();
    
    IF v_employer_id IS NULL THEN
        RAISE EXCEPTION 'Not authenticated';
    END IF;

    -- 1. Atualizar o estado do contrato
    UPDATE public.contracts 
    SET status = 'completed', completed_at = now() 
    WHERE id = p_contract_id AND employer_id = v_employer_id;

    -- 2. Verificar se já existe uma avaliação
    SELECT id, rating INTO v_existing_review_id, v_existing_rating 
    FROM public.reviews 
    WHERE contract_id = p_contract_id AND from_id = v_employer_id 
    LIMIT 1;
    
    -- 3. Obter os dados atuais do perfil do trabalhador
    SELECT EXISTS (SELECT 1 FROM public.worker_profiles WHERE user_id = p_receiver_id) INTO v_worker_profile_exists;
    
    IF NOT v_worker_profile_exists THEN
        INSERT INTO public.worker_profiles (user_id, completed_contracts, rating, reviews_count) 
        VALUES (p_receiver_id, 0, 0, 0);
    END IF;

    SELECT COALESCE(completed_contracts, 0), COALESCE(rating, 0), COALESCE(reviews_count, 0)
    INTO v_completed, v_rating_avg, v_rating_count
    FROM public.worker_profiles WHERE user_id = p_receiver_id;

    -- 4. Atualizar ou inserir avaliação
    IF v_existing_review_id IS NOT NULL THEN
        UPDATE public.reviews 
        SET rating = p_rating, comment = p_comment, created_at = now() 
        WHERE id = v_existing_review_id;
        
        IF v_rating_count > 0 THEN
            UPDATE public.worker_profiles 
            SET rating = ((v_rating_avg * v_rating_count) - v_existing_rating + p_rating) / v_rating_count 
            WHERE user_id = p_receiver_id;
        END IF;
    ELSE
        INSERT INTO public.reviews (contract_id, from_id, to_id, rating, comment) 
        VALUES (p_contract_id, v_employer_id, p_receiver_id, p_rating, p_comment);
        
        UPDATE public.worker_profiles 
        SET completed_contracts = v_completed + 1,
            reviews_count = v_rating_count + 1,
            rating = ((v_rating_avg * v_rating_count) + p_rating) / (v_rating_count + 1)
        WHERE user_id = p_receiver_id;
    END IF;

    -- 5. Inserir mensagem de sistema
    INSERT INTO public.messages (conversation_id, sender_id, receiver_id, content) 
    VALUES (p_conversation_id, v_employer_id, p_receiver_id, '✨ Trabalho concluído e recomendado com ' || p_rating || ' estrelas!');
    
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
