-- Check and fix the RLS policies for portfolio_items
-- Make sure admins can see uploaded items
DROP POLICY IF EXISTS "Anyone can view published portfolio items" ON public.portfolio_items;
DROP POLICY IF EXISTS "Admins can view all portfolio items" ON public.portfolio_items;

-- Create a single policy for admins to see all items
CREATE POLICY "Admins can view all portfolio items including uploaded" ON public.portfolio_items
FOR SELECT USING (
  auth.uid() IN (SELECT id FROM public.admin_users) OR 
  publish_status = 'published'
);