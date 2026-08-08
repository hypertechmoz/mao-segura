-- ======================================================================
-- FIX: handle_new_user() trigger to support Google OAuth signups
-- Run this in Supabase Dashboard → SQL Editor
-- ======================================================================

-- Step 1: Check the current trigger
-- SELECT prosrc FROM pg_proc WHERE proname = 'handle_new_user';

-- Step 2: Also check table constraints
-- SELECT column_name, is_nullable, column_default 
-- FROM information_schema.columns 
-- WHERE table_schema = 'public' AND table_name = 'users';

-- Step 3: Make nullable the fields that Google OAuth won't provide
ALTER TABLE public.users ALTER COLUMN role SET DEFAULT 'WORKER';
ALTER TABLE public.users ALTER COLUMN province DROP NOT NULL;
ALTER TABLE public.users ALTER COLUMN city DROP NOT NULL;
ALTER TABLE public.users ALTER COLUMN bairro DROP NOT NULL;
ALTER TABLE public.users ALTER COLUMN phone DROP NOT NULL;

-- Step 4: Replace the trigger function with one that handles OAuth gracefully
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
    email,
    role,
    phone,
    province,
    city,
    bairro,
    profile_photo,
    is_active,
    is_verified,
    is_premium,
    created_at
  ) VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'role', 'WORKER'),
    NULLIF(TRIM(COALESCE(NEW.raw_user_meta_data->>'phone', '')), ''),
    NULLIF(TRIM(COALESCE(NEW.raw_user_meta_data->>'province', '')), ''),
    NULLIF(TRIM(COALESCE(NEW.raw_user_meta_data->>'city', '')), ''),
    NULLIF(TRIM(COALESCE(NEW.raw_user_meta_data->>'bairro', '')), ''),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', NULL),
    true,
    false,
    false,
    now()
  );
  RETURN NEW;
EXCEPTION
  WHEN unique_violation THEN
    -- User already exists in public.users (e.g. re-login via OAuth)
    RETURN NEW;
  WHEN OTHERS THEN
    RAISE LOG 'handle_new_user error for %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$;

-- Step 5: Ensure the trigger exists on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
