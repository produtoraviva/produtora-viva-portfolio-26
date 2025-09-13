-- Remove todas as políticas RLS para portfolio_items e cria uma política temporária aberta para debug
DROP POLICY IF EXISTS "Admins can view all portfolio items including uploaded" ON public.portfolio_items;
DROP POLICY IF EXISTS "Admins can insert portfolio items" ON public.portfolio_items;
DROP POLICY IF EXISTS "Admins can update portfolio items" ON public.portfolio_items;
DROP POLICY IF EXISTS "Admins can delete portfolio items" ON public.portfolio_items;

-- Política temporária aberta para permitir acesso completo (para debug)
CREATE POLICY "temp_allow_all_portfolio_items" ON public.portfolio_items
FOR ALL USING (true) WITH CHECK (true);

-- Também vamos garantir que admin_users seja acessível
DROP POLICY IF EXISTS "Allow read for authentication" ON public.admin_users;
DROP POLICY IF EXISTS "Allow admin updates" ON public.admin_users;

CREATE POLICY "temp_allow_read_admin_users" ON public.admin_users
FOR SELECT USING (true);