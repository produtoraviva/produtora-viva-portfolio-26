-- Delete profiles for users that are not admin@exemplo.com
DELETE FROM public.profiles 
WHERE id NOT IN (SELECT id FROM auth.users WHERE email = 'admin@exemplo.com');

-- Delete user_roles for users that are not admin@exemplo.com  
DELETE FROM public.user_roles 
WHERE user_id NOT IN (SELECT id FROM auth.users WHERE email = 'admin@exemplo.com');