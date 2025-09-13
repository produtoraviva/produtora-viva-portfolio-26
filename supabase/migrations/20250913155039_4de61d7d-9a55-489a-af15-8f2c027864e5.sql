-- Syncronize item_status and publish_status across all portfolio items
UPDATE portfolio_items 
SET item_status = CASE 
  WHEN publish_status = 'published' THEN 'published'
  ELSE 'uploaded'
END
WHERE item_status != CASE 
  WHEN publish_status = 'published' THEN 'published'
  ELSE 'uploaded'
END;