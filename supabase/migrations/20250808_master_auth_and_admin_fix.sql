-- ======================================================================
-- MASTER FIX FOR AUTH & ADMIN FUNCTIONS
-- Fixes "column 'email' of relation 'users' does not exist" error.
-- Note: 'email' is stored in auth.users, NOT in public.users.
-- Run in Supabase SQL Editor.
-- ======================================================================

-- 1. Trigger for new user signup (Google OAuth or email/pass)
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
    created_at
  ) VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
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
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE LOG 'handle_new_user error for %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- 2. Admin function to list all users (joining auth.users and public.users)
CREATE OR REPLACE FUNCTION public.admin_list_users()
RETURNS SETOF json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.role = 'ADMIN'
  ) THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  RETURN QUERY
  SELECT json_build_object(
    'id', au.id,
    'name', COALESCE(u.name, au.raw_user_meta_data->>'name', au.raw_user_meta_data->>'full_name', split_part(au.email, '@', 1)),
    'email', au.email,
    'phone', COALESCE(u.phone, au.raw_user_meta_data->>'phone'),
    'role', COALESCE(u.role, au.raw_user_meta_data->>'role', 'WORKER'),
    'province', COALESCE(u.province, au.raw_user_meta_data->>'province'),
    'city', COALESCE(u.city, au.raw_user_meta_data->>'city'),
    'bairro', COALESCE(u.bairro, au.raw_user_meta_data->>'bairro'),
    'is_active', COALESCE(u.is_active, true),
    'is_verified', COALESCE(u.is_verified, false),
    'is_premium', COALESCE(u.is_premium, false),
    'profile_photo', COALESCE(u.profile_photo, au.raw_user_meta_data->>'avatar_url'),
    'created_at', au.created_at,
    'email_confirmed', (au.email_confirmed_at IS NOT NULL)
  )
  FROM auth.users au
  LEFT JOIN public.users u ON u.id = au.id
  ORDER BY au.created_at DESC;
END;
$$;

-- 3. Admin function to confirm a user's email manually
CREATE OR REPLACE FUNCTION public.admin_confirm_user_email(target_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  was_confirmed boolean;
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.role = 'ADMIN'
  ) THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  SELECT (email_confirmed_at IS NOT NULL) INTO was_confirmed
  FROM auth.users WHERE id = target_user_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Utilizador não encontrado';
  END IF;

  -- Confirm email in auth.users
  UPDATE auth.users
  SET
    email_confirmed_at = COALESCE(email_confirmed_at, now()),
    updated_at = now()
  WHERE id = target_user_id;

  -- Ensure public.users profile row exists without querying non-existent email column
  INSERT INTO public.users (
    id, name, role, phone, province, city, bairro, profile_photo,
    is_active, is_verified, is_premium, created_at
  )
  SELECT
    target_user_id,
    COALESCE(au.raw_user_meta_data->>'name', au.raw_user_meta_data->>'full_name', split_part(au.email, '@', 1)),
    COALESCE(au.raw_user_meta_data->>'role', 'WORKER'),
    NULLIF(TRIM(COALESCE(au.raw_user_meta_data->>'phone', '')), ''),
    NULLIF(TRIM(COALESCE(au.raw_user_meta_data->>'province', '')), ''),
    NULLIF(TRIM(COALESCE(au.raw_user_meta_data->>'city', '')), ''),
    NULLIF(TRIM(COALESCE(au.raw_user_meta_data->>'bairro', '')), ''),
    COALESCE(au.raw_user_meta_data->>'avatar_url', NULL),
    true, false, false, now()
  FROM auth.users au
  WHERE au.id = target_user_id
  ON CONFLICT (id) DO NOTHING;

  RETURN true;
END;
$$;

-- 4. Check if email is confirmed in auth.users (for frontend checkEmailVerification)
CREATE OR REPLACE FUNCTION public.is_email_confirmed(check_email text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  confirmed boolean;
BEGIN
  SELECT (email_confirmed_at IS NOT NULL) INTO confirmed
  FROM auth.users
  WHERE lower(email) = lower(check_email);

  RETURN COALESCE(confirmed, false);
END;
$$;

-- Grant permissions
REVOKE ALL ON FUNCTION public.admin_list_users() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.admin_confirm_user_email(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_list_users() TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_confirm_user_email(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_email_confirmed(text) TO anon, authenticated;
