-- Allow admin users to update their own last_login_at
CREATE POLICY "Admin users can update their own last_login_at"
ON admin_users
FOR UPDATE
USING (id = auth.uid())
WITH CHECK (
  id = auth.uid() AND
  -- Only allow updating last_login_at field, no other fields
  email = (SELECT email FROM admin_users WHERE id = auth.uid()) AND
  password_hash = (SELECT password_hash FROM admin_users WHERE id = auth.uid()) AND
  full_name = (SELECT full_name FROM admin_users WHERE id = auth.uid()) AND
  user_type = (SELECT user_type FROM admin_users WHERE id = auth.uid())
);