-- Fix critical security vulnerability in portfolio_items table
-- Remove the dangerous temporary policy and ensure proper policies exist

-- Remove the dangerous temporary policy that allows unrestricted access
DROP POLICY IF EXISTS "temp_allow_all_operations" ON portfolio_items;

-- Create policies only if they don't exist
DO $$ 
BEGIN
  -- Policy 1: Public can only view published items
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'portfolio_items' 
    AND policyname = 'Public can view published portfolio items'
  ) THEN
    CREATE POLICY "Public can view published portfolio items"
    ON portfolio_items
    FOR SELECT
    USING (publish_status = 'published');
  END IF;

  -- Policy 2: Admins can view all portfolio items
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'portfolio_items' 
    AND policyname = 'Admins can view all portfolio items'
  ) THEN
    CREATE POLICY "Admins can view all portfolio items"
    ON portfolio_items
    FOR SELECT
    USING (is_admin_session());
  END IF;

  -- Policy 3: Admins can insert portfolio items
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'portfolio_items' 
    AND policyname = 'Admins can insert portfolio items'
  ) THEN
    CREATE POLICY "Admins can insert portfolio items"
    ON portfolio_items
    FOR INSERT
    WITH CHECK (is_admin_session());
  END IF;

  -- Policy 4: Admins can update portfolio items
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'portfolio_items' 
    AND policyname = 'Admins can update portfolio items'
  ) THEN
    CREATE POLICY "Admins can update portfolio items"
    ON portfolio_items
    FOR UPDATE
    USING (is_admin_session())
    WITH CHECK (is_admin_session());
  END IF;

  -- Policy 5: Admins can delete portfolio items
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'portfolio_items' 
    AND policyname = 'Admins can delete portfolio items'
  ) THEN
    CREATE POLICY "Admins can delete portfolio items"
    ON portfolio_items
    FOR DELETE
    USING (is_admin_session());
  END IF;
END $$;

-- Verify RLS is enabled
ALTER TABLE portfolio_items ENABLE ROW LEVEL SECURITY;