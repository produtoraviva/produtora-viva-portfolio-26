-- Primeiro remove a política existente
DROP POLICY IF EXISTS "temp_allow_all_portfolio_items" ON public.portfolio_items;

-- Agora cria política simples que permite ler todos os items
CREATE POLICY "allow_read_all_portfolio_items" ON public.portfolio_items
FOR SELECT USING (true);