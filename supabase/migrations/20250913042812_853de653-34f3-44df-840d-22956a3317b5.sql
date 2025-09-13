-- Criar política que permite INSERT também
DROP POLICY IF EXISTS "allow_read_all_portfolio_items" ON public.portfolio_items;

-- Política aberta para todas as operações (temporária para resolver o problema)
CREATE POLICY "temp_allow_all_operations" ON public.portfolio_items
FOR ALL USING (true) WITH CHECK (true);