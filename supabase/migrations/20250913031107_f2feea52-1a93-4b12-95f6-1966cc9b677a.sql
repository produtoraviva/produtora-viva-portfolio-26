-- Fix admin authentication by allowing public access to admin_users table for login
-- Remove existing restrictive policies
DROP POLICY IF EXISTS "Admin users can view all admin users" ON public.admin_users;
DROP POLICY IF EXISTS "Admin users can update their own data" ON public.admin_users;

-- Create new policies that allow login functionality
CREATE POLICY "Allow read for authentication" ON public.admin_users
  FOR SELECT USING (true);

CREATE POLICY "Allow admin updates" ON public.admin_users
  FOR UPDATE USING (auth.uid() = id OR auth.uid() IN (SELECT id FROM public.admin_users));

-- Also ensure the password hash is correct for admin@portfolio.com
UPDATE public.admin_users 
SET password_hash = '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/cIFJlwtlO0zQQZXLG'
WHERE email = 'admin@portfolio.com';

-- Make sure there's at least one admin user for testing
INSERT INTO public.admin_users (email, password_hash, full_name)
VALUES ('admin@portfolio.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/cIFJlwtlO0zQQZXLG', 'Administrador')
ON CONFLICT (email) DO UPDATE SET 
  password_hash = EXCLUDED.password_hash,
  full_name = EXCLUDED.full_name;