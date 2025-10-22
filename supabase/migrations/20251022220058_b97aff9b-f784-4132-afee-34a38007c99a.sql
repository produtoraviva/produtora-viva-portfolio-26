-- Remove the overly permissive policy that allows all admins to read all admin data
DROP POLICY IF EXISTS "Authenticated admin read access" ON public.admin_users;

-- Create a secure function to get admin users list (without password hashes)
-- This function can only be called by authenticated admins
CREATE OR REPLACE FUNCTION public.get_admin_users_list()
RETURNS TABLE (
  id uuid,
  email text,
  full_name text,
  user_type text,
  created_at timestamp with time zone,
  last_login_at timestamp with time zone
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  -- Only return data if the caller is an admin
  SELECT 
    id,
    email,
    full_name,
    user_type,
    created_at,
    last_login_at
  FROM admin_users
  WHERE is_admin_session();
$$;