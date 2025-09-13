-- Add security enhancements to admin_users table

-- Remove the overly permissive policy
DROP POLICY IF EXISTS "Allow read access to admin_users" ON public.admin_users;

-- Create more restrictive policies for admin_users
CREATE POLICY "Admin users can read their own data"
ON public.admin_users
FOR SELECT
USING (id = auth.uid());

-- Only allow authenticated admin users to read from admin_users
CREATE POLICY "Authenticated admin read access"
ON public.admin_users
FOR SELECT
USING (is_admin_session());

-- Ensure no one can insert, update or delete admin users without proper authorization
-- This prevents unauthorized account creation
CREATE POLICY "Prevent unauthorized admin creation"
ON public.admin_users
FOR INSERT
WITH CHECK (false); -- Completely block insertions through RLS

CREATE POLICY "Prevent unauthorized admin updates"
ON public.admin_users
FOR UPDATE
USING (false); -- Completely block updates through RLS

CREATE POLICY "Prevent unauthorized admin deletion"
ON public.admin_users
FOR DELETE
USING (false); -- Completely block deletions through RLS