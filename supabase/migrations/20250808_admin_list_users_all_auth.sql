-- ======================================================================
-- FIX: Update admin_list_users() to include ALL users from auth.users
-- even if public.users row is not yet created or email is unconfirmed.
-- Run in Supabase SQL Editor.
-- ======================================================================

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

REVOKE ALL ON FUNCTION public.admin_list_users() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_list_users() TO authenticated;
