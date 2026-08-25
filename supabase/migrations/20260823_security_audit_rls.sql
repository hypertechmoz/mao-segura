-- ======================================================================
-- MIGRATION: Fase 6 - Auditoria de Segurança (RLS e Políticas)
-- ======================================================================

-- 1. Activar RLS nas tabelas principais se ainda não estiver activo
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

-- 2. Políticas para 'users'
DROP POLICY IF EXISTS "Users can view all active users" ON public.users;
CREATE POLICY "Users can view all active users" 
ON public.users FOR SELECT 
USING (is_active = true);

DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
CREATE POLICY "Users can update own profile" 
ON public.users FOR UPDATE 
USING (auth.uid() = id);

-- 3. Políticas para 'jobs' (Vagas)
DROP POLICY IF EXISTS "Anyone can view active jobs" ON public.jobs;
CREATE POLICY "Anyone can view active jobs" 
ON public.jobs FOR SELECT 
USING (status = 'ACTIVE');

DROP POLICY IF EXISTS "Employers can manage own jobs" ON public.jobs;
CREATE POLICY "Employers can manage own jobs" 
ON public.jobs FOR ALL 
USING (auth.uid() = employer_id);

-- 4. Políticas para 'applications' (Candidaturas)
DROP POLICY IF EXISTS "Workers can view own applications" ON public.applications;
CREATE POLICY "Workers can view own applications" 
ON public.applications FOR SELECT 
USING (auth.uid() = worker_id);

DROP POLICY IF EXISTS "Employers can view applications for their jobs" ON public.applications;
CREATE POLICY "Employers can view applications for their jobs" 
ON public.applications FOR SELECT 
USING (
    EXISTS (
        SELECT 1 FROM public.jobs 
        WHERE id = applications.job_id AND employer_id = auth.uid()
    )
);

DROP POLICY IF EXISTS "Workers can insert own applications" ON public.applications;
CREATE POLICY "Workers can insert own applications" 
ON public.applications FOR INSERT 
WITH CHECK (auth.uid() = worker_id);

DROP POLICY IF EXISTS "Users can update own applications" ON public.applications;
CREATE POLICY "Users can update own applications" 
ON public.applications FOR UPDATE 
USING (auth.uid() = worker_id OR EXISTS (
    SELECT 1 FROM public.jobs 
    WHERE id = applications.job_id AND employer_id = auth.uid()
));

-- 5. Políticas para 'posts' (Comunidade)
DROP POLICY IF EXISTS "Anyone can view posts" ON public.posts;
CREATE POLICY "Anyone can view posts" 
ON public.posts FOR SELECT 
USING (true);

DROP POLICY IF EXISTS "Users can manage own posts" ON public.posts;
CREATE POLICY "Users can manage own posts" 
ON public.posts FOR ALL 
USING (auth.uid() = user_id);
