-- Remover trigger que está causando o problema ao deletar
DROP TRIGGER IF EXISTS portfolio_items_audit_trigger ON portfolio_items;

-- Deletar dados de teste restantes
DELETE FROM portfolio_items WHERE title LIKE '%Teste%' OR file_url LIKE '%picsum%' OR file_url LIKE '%BigBuckBunny%';

-- Recriar a constraint com cascade
ALTER TABLE portfolio_edit_history 
DROP CONSTRAINT IF EXISTS portfolio_edit_history_portfolio_item_id_fkey;

ALTER TABLE portfolio_edit_history
ADD CONSTRAINT portfolio_edit_history_portfolio_item_id_fkey 
FOREIGN KEY (portfolio_item_id) 
REFERENCES portfolio_items(id) 
ON DELETE CASCADE;