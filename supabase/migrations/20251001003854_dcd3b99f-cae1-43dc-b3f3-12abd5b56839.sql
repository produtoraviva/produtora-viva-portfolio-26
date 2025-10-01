-- Fix critical security vulnerability in portfolio_items table
-- Remove ALL existing policies and create proper secure ones

-- Drop all existing policies
DROP POLICY IF EXISTS "temp_allow_all_operations" ON portfolio_items;
DROP POLICY IF EXISTS "Public can view published portfolio items" ON portfolio_items;
DROP POLICY IF EXISTS "Admins can view all portfolio items" ON portfolio_items;
DROP POLICY IF EXISTS "Admins can insert portfolio items" ON portfolio_items;
DROP POLICY IF EXISTS "Admins can update portfolio items" ON portfolio_items;
DROP POLICY IF EXISTS "Admins can delete portfolio items" ON portfolio_items;

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