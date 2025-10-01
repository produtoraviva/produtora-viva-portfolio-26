-- Fix critical security vulnerability in portfolio_items table
-- Replace temporary unrestricted access with proper RLS policies

-- Remove the dangerous temporary policy
DROP POLICY IF EXISTS "temp_allow_all_operations" ON portfolio_items;

-- Policy 1: Public can only view published items
CREATE POLICY "Public can view published portfolio items"
ON portfolio_items
FOR SELECT
USING (publish_status = 'published');

-- Policy 2: Admins can view all portfolio items
CREATE POLICY "Admins can view all portfolio items"
ON portfolio_items
FOR SELECT
USING (is_admin_session());

-- Policy 3: Admins can insert portfolio items
CREATE POLICY "Admins can insert portfolio items"
ON portfolio_items
FOR INSERT
WITH CHECK (is_admin_session());

-- Policy 4: Admins can update portfolio items
CREATE POLICY "Admins can update portfolio items"
ON portfolio_items
FOR UPDATE
USING (is_admin_session())
WITH CHECK (is_admin_session());

-- Policy 5: Admins can delete portfolio items
CREATE POLICY "Admins can delete portfolio items"
ON portfolio_items
FOR DELETE
USING (is_admin_session());

-- Verify RLS is enabled
ALTER TABLE portfolio_items ENABLE ROW LEVEL SECURITY;

-- Add comments for documentation
COMMENT ON POLICY "Public can view published portfolio items" ON portfolio_items IS 
'Allows public access only to portfolio items with publish_status = published. Protects drafts and unpublished work from competitors and unauthorized access.';

COMMENT ON POLICY "Admins can view all portfolio items" ON portfolio_items IS 
'Allows authenticated admins to view all portfolio items including drafts for management purposes.';