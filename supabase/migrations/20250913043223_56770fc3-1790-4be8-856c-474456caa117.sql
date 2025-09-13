-- Remove constraint que está causando problemas
ALTER TABLE portfolio_items DROP CONSTRAINT IF EXISTS portfolio_items_category_check;