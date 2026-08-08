-- ======================================================================
-- FIX: Update admin_confirm_user_email() to also ensure public.users row exists
-- Run in Supabase SQL Editor.
-- ======================================================================

CREATE OR REPLACE FUNCTION public.admin_confirm_user_email(target_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  was_confirmed boolean;
BEGIN
  -- 1. Check admin authorization
  IF NOT EXISTS (
    SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.role = 'ADMIN'
  ) THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  -- 2. Check if target user exists in auth.users
  SELECT (email_confirmed_at IS NOT NULL) INTO was_confirmed
  FROM auth.users WHERE id = target_user_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Utilizador não encontrado';
  END IF;

  -- 3. Update auth.users email_confirmed_at
  UPDATE auth.users
  SET
    email_confirmed_at = COALESCE(email_confirmed_at, now()),
    updated_at = now()
  WHERE id = target_user_id;

  -- 4. Ensure public.users record exists using metadata from auth.users
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
  )
  SELECT
    target_user_id,
    COALESCE(au.raw_user_meta_data->>'name', au.raw_user_meta_data->>'full_name', split_part(au.email, '@', 1)),
    au.email,
    COALESCE(au.raw_user_meta_data->>'role', 'WORKER'),
    NULLIF(TRIM(COALESCE(au.raw_user_meta_data->>'phone', '')), ''),
    NULLIF(TRIM(COALESCE(au.raw_user_meta_data->>'province', '')), ''),
    NULLIF(TRIM(COALESCE(au.raw_user_meta_data->>'city', '')), ''),
    NULLIF(TRIM(COALESCE(au.raw_user_meta_data->>'bairro', '')), ''),
    COALESCE(au.raw_user_meta_data->>'avatar_url', NULL),
    true,
    false,
    false,
    now()
  FROM auth.users au
  WHERE au.id = target_user_id
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email;

  RETURN true;
END;
$$;

REVOKE ALL ON FUNCTION public.admin_confirm_user_email(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_confirm_user_email(uuid) TO authenticated;
