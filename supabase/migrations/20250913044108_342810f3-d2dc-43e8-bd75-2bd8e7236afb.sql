-- Remover o trigger que está causando o problema
DROP TRIGGER IF EXISTS portfolio_items_audit_trigger ON portfolio_items;

-- Remover a função também para evitar conflitos  
DROP FUNCTION IF EXISTS log_portfolio_change();

-- Limpar registros órfãos no histórico
DELETE FROM portfolio_edit_history 
WHERE portfolio_item_id NOT IN (SELECT id FROM portfolio_items);

-- Deletar dados de teste
DELETE FROM portfolio_items WHERE title LIKE '%Teste%' OR file_url LIKE '%picsum%' OR file_url LIKE '%BigBuckBunny%';