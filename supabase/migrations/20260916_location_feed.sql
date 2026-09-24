-- ======================================================================
-- MIGRATION: RPCs para Feeds Baseados em Localização GPS (Proximidade)
-- ======================================================================

-- 1. Obter Profissionais (WORKERS) próximos
CREATE OR REPLACE FUNCTION get_nearby_workers_feed(p_lat float, p_lon float, p_limit int DEFAULT 20, p_offset int DEFAULT 0)
RETURNS TABLE (
    id uuid,
    name text,
    city text,
    bairro text,
    province text,
    profile_photo text,
    role text,
    distance_km float,
    worker_profiles jsonb
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        u.id, u.name, u.city, u.bairro, u.province, u.profile_photo, u.role,
        (ST_Distance(u.location, ST_MakePoint(p_lon, p_lat)::geography) / 1000.0)::float AS distance_km,
        COALESCE(
            (SELECT jsonb_agg(wp.*) FROM public.worker_profiles wp WHERE wp.user_id = u.id),
            '[]'::jsonb
        ) AS worker_profiles
    FROM public.users u
    WHERE u.role = 'WORKER' AND u.is_active = true
    -- Ordenação por distância ascendente, nulls no fim (se alguém não tiver localização)
    ORDER BY u.location <-> ST_MakePoint(p_lon, p_lat)::geography ASC NULLS LAST
    LIMIT p_limit OFFSET p_offset;
END;
$$ LANGUAGE plpgsql;

-- 2. Obter Vagas (JOBS) próximas (baseado no employer_id)
CREATE OR REPLACE FUNCTION get_nearby_jobs_feed(p_lat float, p_lon float, p_limit int DEFAULT 20, p_offset int DEFAULT 0)
RETURNS TABLE (
    id uuid,
    employer_id uuid,
    title text,
    description text,
    type text,
    contract_type text,
    availability text,
    province text,
    city text,
    bairro text,
    status text,
    image_url text,
    created_at timestamptz,
    applications_count int,
    distance_km float,
    employer jsonb
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        j.id, j.employer_id, j.title, j.description, j.type, j.contract_type, j.availability, j.province, j.city, j.bairro, j.status, j.image_url, j.created_at, j.applications_count,
        (ST_Distance(u.location, ST_MakePoint(p_lon, p_lat)::geography) / 1000.0)::float AS distance_km,
        jsonb_build_object(
            'id', u.id,
            'name', u.name,
            'city', u.city,
            'province', u.province,
            'is_verified', u.is_verified,
            'is_premium', u.is_premium
        ) AS employer
    FROM public.jobs j
    JOIN public.users u ON j.employer_id = u.id
    WHERE j.status = 'ACTIVE'
    ORDER BY u.location <-> ST_MakePoint(p_lon, p_lat)::geography ASC NULLS LAST
    LIMIT p_limit OFFSET p_offset;
END;
$$ LANGUAGE plpgsql;

-- 3. Obter Publicações (POSTS) próximas (baseado no autor)
CREATE OR REPLACE FUNCTION get_nearby_posts_feed(p_lat float, p_lon float, p_limit int DEFAULT 20, p_offset int DEFAULT 0)
RETURNS TABLE (
    id uuid,
    user_id uuid,
    content text,
    likes_count int,
    comments_count int,
    created_at timestamptz,
    distance_km float,
    author jsonb
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id, p.user_id, p.content, p.likes_count, p.comments_count, p.created_at,
        (ST_Distance(u.location, ST_MakePoint(p_lon, p_lat)::geography) / 1000.0)::float AS distance_km,
        jsonb_build_object(
            'name', u.name,
            'profile_photo', u.profile_photo,
            'role', u.role,
            'province', u.province,
            'city', u.city,
            'is_verified', u.is_verified,
            'is_premium', u.is_premium
        ) AS author
    FROM public.posts p
    JOIN public.users u ON p.user_id = u.id
    ORDER BY u.location <-> ST_MakePoint(p_lon, p_lat)::geography ASC NULLS LAST
    LIMIT p_limit OFFSET p_offset;
END;
$$ LANGUAGE plpgsql;
