-- ======================================================================
-- MIGRATION: Fase 2 - Generalização de Serviços, Habilidades e Planos
-- ======================================================================

-- 1. Criação do tipo de Plano de Subscrição
DO $$ BEGIN
    CREATE TYPE subscription_plan_type AS ENUM ('FREE', 'PLUS', 'MAX');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Atualizar a tabela users com planos e permissões base
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS subscription_plan subscription_plan_type DEFAULT 'FREE';

-- 3. Alterar a role predefinida para 'PENDING' para não forçar 'WORKER' no Google Auth
ALTER TABLE public.users ALTER COLUMN role SET DEFAULT 'PENDING';

-- 4. Atualizar o Trigger handle_new_user para o novo comportamento do Google Auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.users (
    id,
    name,
    role,
    phone,
    province,
    city,
    bairro,
    profile_photo,
    is_active,
    is_verified,
    is_premium,
    subscription_plan,
    created_at
  ) VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'role', 'PENDING'),
    NULLIF(TRIM(COALESCE(NEW.raw_user_meta_data->>'phone', '')), ''),
    NULLIF(TRIM(COALESCE(NEW.raw_user_meta_data->>'province', '')), ''),
    NULLIF(TRIM(COALESCE(NEW.raw_user_meta_data->>'city', '')), ''),
    NULLIF(TRIM(COALESCE(NEW.raw_user_meta_data->>'bairro', '')), ''),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', NULL),
    true,
    false,
    false,
    'FREE',
    now()
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE LOG 'handle_new_user error for %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$;

-- 5. Tabelas de Taxonomia (Categorias -> Especialidades -> Serviços) e Habilidades
CREATE TABLE IF NOT EXISTS public.categories (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    name text NOT NULL UNIQUE,
    icon text,
    is_active boolean DEFAULT true,
    created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.specialties (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    category_id uuid REFERENCES public.categories(id) ON DELETE CASCADE,
    name text NOT NULL,
    is_active boolean DEFAULT true,
    created_at timestamptz DEFAULT now(),
    UNIQUE(category_id, name)
);

CREATE TABLE IF NOT EXISTS public.services (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    specialty_id uuid REFERENCES public.specialties(id) ON DELETE CASCADE,
    name text NOT NULL,
    is_active boolean DEFAULT true,
    created_at timestamptz DEFAULT now(),
    UNIQUE(specialty_id, name)
);

-- Habilidades (separadas das especialidades)
CREATE TABLE IF NOT EXISTS public.skills (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    name text NOT NULL UNIQUE,
    is_active boolean DEFAULT true,
    created_at timestamptz DEFAULT now()
);

-- 6. Tabelas de Relação (Profissionais)
CREATE TABLE IF NOT EXISTS public.professional_specialties (
    professional_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
    specialty_id uuid REFERENCES public.specialties(id) ON DELETE CASCADE,
    created_at timestamptz DEFAULT now(),
    PRIMARY KEY (professional_id, specialty_id)
);

CREATE TABLE IF NOT EXISTS public.professional_services (
    professional_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
    service_id uuid REFERENCES public.services(id) ON DELETE CASCADE,
    created_at timestamptz DEFAULT now(),
    PRIMARY KEY (professional_id, service_id)
);

CREATE TABLE IF NOT EXISTS public.professional_skills (
    professional_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
    skill_id uuid REFERENCES public.skills(id) ON DELETE CASCADE,
    created_at timestamptz DEFAULT now(),
    PRIMARY KEY (professional_id, skill_id)
);

-- 7. Inserção de Dados Iniciais da Taxonomia
DO $$
DECLARE
    cat_tech uuid;
    cat_home uuid;
    cat_const uuid;
    cat_maint uuid;
    cat_design uuid;
BEGIN
    -- Categorias Base
    INSERT INTO public.categories (name) VALUES 
        ('Tecnologia'), 
        ('Casa'), 
        ('Construção'), 
        ('Manutenção'), 
        ('Design'), 
        ('Educação'), 
        ('Beleza'), 
        ('Transporte'), 
        ('Eventos'), 
        ('Fotografia'), 
        ('Serviços empresariais'), 
        ('Assistência'), 
        ('Agricultura'), 
        ('Consultoria'), 
        ('Serviços digitais')
    ON CONFLICT (name) DO NOTHING;

    -- Obter IDs
    SELECT id INTO cat_tech FROM public.categories WHERE name = 'Tecnologia';
    SELECT id INTO cat_home FROM public.categories WHERE name = 'Casa';
    SELECT id INTO cat_const FROM public.categories WHERE name = 'Construção';

    -- Especialidades: Tecnologia
    IF cat_tech IS NOT NULL THEN
        INSERT INTO public.specialties (category_id, name) VALUES 
            (cat_tech, 'Programador'),
            (cat_tech, 'Tester / QA'),
            (cat_tech, 'Designer UI/UX'),
            (cat_tech, 'Técnico de informática'),
            (cat_tech, 'Suporte técnico'),
            (cat_tech, 'Gestor de redes')
        ON CONFLICT (category_id, name) DO NOTHING;
    END IF;

    -- Especialidades: Casa
    IF cat_home IS NOT NULL THEN
        INSERT INTO public.specialties (category_id, name) VALUES 
            (cat_home, 'Empregada doméstica'),
            (cat_home, 'Diarista'),
            (cat_home, 'Babá'),
            (cat_home, 'Cozinheiro'),
            (cat_home, 'Jardineiro'),
            (cat_home, 'Limpeza')
        ON CONFLICT (category_id, name) DO NOTHING;
    END IF;

    -- Especialidades: Construção
    IF cat_const IS NOT NULL THEN
        INSERT INTO public.specialties (category_id, name) VALUES 
            (cat_const, 'Pedreiro'),
            (cat_const, 'Eletricista'),
            (cat_const, 'Canalizador'),
            (cat_const, 'Pintor'),
            (cat_const, 'Carpinteiro')
        ON CONFLICT (category_id, name) DO NOTHING;
    END IF;
END $$;

-- 8. Ativar Row Level Security (RLS)
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.specialties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.professional_specialties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.professional_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.professional_skills ENABLE ROW LEVEL SECURITY;

-- Políticas de Leitura Pública (Qualquer um pode ler a taxonomia)
CREATE POLICY "Public read categories" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Public read specialties" ON public.specialties FOR SELECT USING (true);
CREATE POLICY "Public read services" ON public.services FOR SELECT USING (true);
CREATE POLICY "Public read skills" ON public.skills FOR SELECT USING (true);
CREATE POLICY "Public read prof_specialties" ON public.professional_specialties FOR SELECT USING (true);
CREATE POLICY "Public read prof_services" ON public.professional_services FOR SELECT USING (true);
CREATE POLICY "Public read prof_skills" ON public.professional_skills FOR SELECT USING (true);

-- Políticas de Modificação (Apenas o próprio profissional pode gerir as suas ligações)
CREATE POLICY "Profissionais gerem as próprias especialidades" 
ON public.professional_specialties FOR ALL 
USING (auth.uid() = professional_id);

CREATE POLICY "Profissionais gerem os próprios serviços" 
ON public.professional_services FOR ALL 
USING (auth.uid() = professional_id);

CREATE POLICY "Profissionais gerem as próprias habilidades" 
ON public.professional_skills FOR ALL 
USING (auth.uid() = professional_id);
