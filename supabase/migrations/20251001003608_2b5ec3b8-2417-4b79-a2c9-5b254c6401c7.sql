-- Fix critical security vulnerability in is_admin_session function
-- This function was returning true for everyone, exposing admin credentials
-- Using CREATE OR REPLACE to avoid breaking dependent policies

CREATE OR REPLACE FUNCTION public.is_admin_session()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  -- Check if the current authenticated user exists in admin_users table
  -- This ensures only actual admins can access admin-protected resources
  SELECT EXISTS (
    SELECT 1
    FROM admin_users
    WHERE id = auth.uid()
  );
$$;

-- Verify RLS is enabled on admin_users
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Add a comment explaining the security model
COMMENT ON FUNCTION public.is_admin_session() IS 
'Returns true only if the current authenticated user (auth.uid()) exists in the admin_users table. Uses SECURITY DEFINER to bypass RLS when checking admin status. This prevents unauthorized access to admin resources.';