-- Remover a função com CASCADE para remover o trigger também
DROP FUNCTION IF EXISTS log_portfolio_change() CASCADE;

-- Limpar registros órfãos no histórico
DELETE FROM portfolio_edit_history 
WHERE portfolio_item_id NOT IN (SELECT id FROM portfolio_items);

-- Deletar dados de teste
DELETE FROM portfolio_items WHERE title LIKE '%Teste%' OR file_url LIKE '%picsum%' OR file_url LIKE '%BigBuckBunny%';