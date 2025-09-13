-- Enable realtime for categories and subcategories tables
ALTER TABLE portfolio_categories REPLICA IDENTITY FULL;
ALTER TABLE portfolio_subcategories REPLICA IDENTITY FULL;

-- Add tables to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE portfolio_categories;
ALTER PUBLICATION supabase_realtime ADD TABLE portfolio_subcategories;