-- Insert test media directly into portfolio_items with 'uploaded' status
INSERT INTO public.portfolio_items (title, media_type, file_url, item_status, publish_status, display_order, file_size) 
VALUES 
  ('Foto de Teste 1', 'photo', 'https://picsum.photos/800/600', 'uploaded', 'draft', 0, 102400),
  ('Foto de Teste 2', 'photo', 'https://picsum.photos/900/700', 'uploaded', 'draft', 1, 150000),
  ('Vídeo de Teste', 'video', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4', 'uploaded', 'draft', 2, 5242880);