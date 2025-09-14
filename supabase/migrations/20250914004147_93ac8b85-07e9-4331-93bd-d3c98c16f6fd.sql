-- Add user_type column to admin_users table to support collaborator accounts
ALTER TABLE public.admin_users 
ADD COLUMN user_type text NOT NULL DEFAULT 'admin';

-- Add constraint to ensure only valid user types
ALTER TABLE public.admin_users 
ADD CONSTRAINT admin_users_user_type_check 
CHECK (user_type IN ('admin', 'collaborator'));