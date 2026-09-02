-- ======================================================================
-- MIGRATION: Activar PostGIS e adicionar localização aos utilizadores
-- ======================================================================

-- 1. Ativar a extensão PostGIS se não existir
CREATE EXTENSION IF NOT EXISTS postgis;

-- 2. Adicionar coluna 'location' (Point, 4326 - WGS 84) à tabela users, se não existir
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name='users' AND column_name='location'
    ) THEN
        ALTER TABLE public.users ADD COLUMN location geography(POINT, 4326);
    END IF;
END $$;

-- 3. Função para calcular distância entre dois utilizadores (em KM)
CREATE OR REPLACE FUNCTION get_distance_km(lat1 float, lon1 float, lat2 float, lon2 float)
RETURNS float AS $$
BEGIN
    RETURN ST_Distance(
        ST_MakePoint(lon1, lat1)::geography, 
        ST_MakePoint(lon2, lat2)::geography
    ) / 1000.0;
END;
$$ LANGUAGE plpgsql;

-- 4. Função para obter utilizadores ordenados por proximidade
CREATE OR REPLACE FUNCTION get_nearby_users(p_lat float, p_lon float, p_radius_km float DEFAULT 50, p_role text DEFAULT 'WORKER')
RETURNS TABLE (
    id uuid,
    name text,
    distance_km float
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        u.id, 
        u.name, 
        ST_Distance(u.location, ST_MakePoint(p_lon, p_lat)::geography) / 1000.0 AS distance_km
    FROM public.users u
    WHERE u.role = p_role
      AND u.location IS NOT NULL
      AND ST_DWithin(u.location, ST_MakePoint(p_lon, p_lat)::geography, p_radius_km * 1000)
    ORDER BY distance_km ASC;
END;
$$ LANGUAGE plpgsql;

-- 5. Função para atualizar localização do utilizador
CREATE OR REPLACE FUNCTION update_user_location(user_id uuid, lat float, lon float)
RETURNS void AS $$
BEGIN
    UPDATE public.users
    SET location = ST_MakePoint(lon, lat)::geography
    WHERE id = user_id;
END;
$$ LANGUAGE plpgsql;
