-- Create FAQ management table
CREATE TABLE public.faq_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.faq_items ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can view active FAQ items" 
ON public.faq_items 
FOR SELECT 
USING (is_active = true);

CREATE POLICY "Allow admin operations on FAQ items" 
ON public.faq_items 
FOR ALL 
USING (is_admin_session())
WITH CHECK (is_admin_session());

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_faq_items_updated_at
BEFORE UPDATE ON public.faq_items
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default FAQ items
INSERT INTO public.faq_items (question, answer, display_order) VALUES
('Qual é o prazo de entrega das fotos e vídeos?', 'As fotos são entregues em até 15 dias úteis após o evento, com prévia no mesmo dia. Os vídeos cinematográficos ficam prontos em até 30 dias úteis. Casos urgentes podem ser negociados com taxa adicional.', 1),
('Vocês atendem eventos fora de Foz do Iguaçu?', 'Sim! Atendemos toda a região tríplice fronteira. Para eventos fora de Foz do Iguaçu e Ciudad del Este, cobramos taxa de deslocamento que varia conforme a distância. Entre em contato para orçamento personalizado.', 2),
('É possível fazer alterações no pacote contratado?', 'Claro! Nossos pacotes são flexíveis. Você pode adicionar serviços como drone, making of, ensaio extra, álbuns adicionais, etc. Também criamos pacotes personalizados conforme sua necessidade.', 3),
('Quantos profissionais estarão no meu evento?', 'Depende do pacote escolhido e do porte do evento. Geralmente: 1-2 fotógrafos para eventos pequenos, 2-3 para médios e até 4 profissionais para grandes eventos. Sempre garantimos cobertura completa.', 4),
('As fotos são editadas? Como recebo o material?', 'Sim! Todas as fotos passam por tratamento profissional (cor, luz, contraste). Você recebe via galeria online para download, com opção de pendrive/HD adicional. Vídeos são entregues em HD/4K.', 5),
('Vocês fazem ensaio pré-wedding?', 'Sim! O ensaio pré-wedding está incluso na maioria dos pacotes de casamento. É uma ótima oportunidade para nos conhecermos melhor e você se acostumar com a câmera.', 6),
('E se chover no dia do evento ao ar livre?', 'Temos experiência com eventos em qualquer clima! Levamos equipamentos de proteção e sabemos aproveitar até mesmo a chuva para criar fotos únicas e românticas. O show não pode parar!', 7),
('Vocês têm seguro dos equipamentos?', 'Sim, todos nossos equipamentos são segurados. Além disso, sempre levamos equipamentos reserva para garantir que nada comprometa a cobertura do seu evento especial.', 8);