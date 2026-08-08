-- Run in Supabase SQL Editor (requires service role for auth.users updates via SECURITY DEFINER).
-- Enables admin manual email confirmation and optional admin user listing with auth status.

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
    'id', u.id,
    'name', u.name,
    'email', au.email,
    'phone', u.phone,
    'role', u.role,
    'province', u.province,
    'city', u.city,
    'bairro', u.bairro,
    'is_active', u.is_active,
    'is_verified', u.is_verified,
    'is_premium', u.is_premium,
    'profile_photo', u.profile_photo,
    'created_at', u.created_at,
    'email_confirmed', (au.email_confirmed_at IS NOT NULL)
  )
  FROM public.users u
  INNER JOIN auth.users au ON au.id = u.id
  ORDER BY u.created_at DESC;
END;
$$;

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

  IF was_confirmed THEN
    RETURN false;
  END IF;

  UPDATE auth.users
  SET
    email_confirmed_at = COALESCE(email_confirmed_at, now()),
    updated_at = now()
  WHERE id = target_user_id;

  RETURN true;
END;
$$;

REVOKE ALL ON FUNCTION public.admin_list_users() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.admin_confirm_user_email(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_list_users() TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_confirm_user_email(uuid) TO authenticated;
