-- Remove constraint that prevents deletion of items that have edit history
-- and remove test data
DELETE FROM portfolio_edit_history WHERE portfolio_item_id IN (
  SELECT id FROM portfolio_items WHERE title LIKE '%Teste%'
);

DELETE FROM portfolio_items WHERE title LIKE '%Teste%';

-- Make the foreign key constraint on edit history cascade on delete
ALTER TABLE portfolio_edit_history 
DROP CONSTRAINT IF EXISTS portfolio_edit_history_portfolio_item_id_fkey;

ALTER TABLE portfolio_edit_history
ADD CONSTRAINT portfolio_edit_history_portfolio_item_id_fkey 
FOREIGN KEY (portfolio_item_id) 
REFERENCES portfolio_items(id) 
ON DELETE CASCADE;