-- Primeiro, limpar registros órfãos no histórico
DELETE FROM portfolio_edit_history 
WHERE portfolio_item_id NOT IN (SELECT id FROM portfolio_items);

-- Deletar dados de teste restantes
DELETE FROM portfolio_items WHERE title LIKE '%Teste%' OR file_url LIKE '%picsum%' OR file_url LIKE '%BigBuckBunny%';

-- Agora remover e recriar a constraint com cascade
ALTER TABLE portfolio_edit_history 
DROP CONSTRAINT IF EXISTS portfolio_edit_history_portfolio_item_id_fkey;

ALTER TABLE portfolio_edit_history
ADD CONSTRAINT portfolio_edit_history_portfolio_item_id_fkey 
FOREIGN KEY (portfolio_item_id) 
REFERENCES portfolio_items(id) 
ON DELETE CASCADE;