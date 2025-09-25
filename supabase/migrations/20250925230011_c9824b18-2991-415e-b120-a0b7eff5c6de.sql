-- Criar tabela para armazenar serviços personalizáveis
CREATE TABLE public.services (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  subtitle TEXT,
  description TEXT NOT NULL,
  features TEXT[] NOT NULL DEFAULT '{}',
  price TEXT NOT NULL,
  icon TEXT NOT NULL DEFAULT 'Camera',
  is_highlighted boolean NOT NULL DEFAULT false,
  is_active boolean NOT NULL DEFAULT true,
  display_order integer NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;

-- Criar políticas RLS
CREATE POLICY "Anyone can view active services" 
ON public.services 
FOR SELECT 
USING (is_active = true);

CREATE POLICY "Allow admin operations on services" 
ON public.services 
FOR ALL 
USING (is_admin_session())
WITH CHECK (is_admin_session());

-- Criar trigger para updated_at
CREATE TRIGGER update_services_updated_at
BEFORE UPDATE ON public.services
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Inserir os serviços atuais do código
INSERT INTO public.services (title, subtitle, description, features, price, icon, is_highlighted, display_order) VALUES
('Fotografia de Casamento', 'Momentos únicos e inesquecíveis', 'Capturamos cada emoção, cada sorriso e cada lágrima de alegria do seu dia mais especial. Nossa abordagem discreta e profissional garante que todos os momentos preciosos sejam eternizados com a mais alta qualidade.', 
ARRAY['Cobertura completa da cerimônia', 'Ensaio pré-wedding incluso', 'Álbum premium personalizado', 'Galeria online privada', 'Entrega em até 30 dias'], 
'A partir de R$ 2.500', 'Camera', true, 1),

('Fotografia de Eventos', 'Celebrações memoráveis', 'Especializados em capturar a essência e energia dos seus eventos corporativos, aniversários, formaturas e celebrações especiais. Cada momento é documentado com criatividade e técnica profissional.',
ARRAY['Cobertura de eventos corporativos', 'Aniversários e comemorações', 'Formaturas e cerimônias', 'Fotos em alta resolução', 'Edição profissional inclusa'],
'A partir de R$ 800', 'Users', false, 2),

('Ensaio Fotográfico', 'Sua personalidade em foco', 'Sessões personalizadas que revelam sua verdadeira essência. Trabalhamos em locações deslumbrantes ou em estúdio, sempre buscando o melhor ângulo e iluminação para destacar sua beleza natural.',
ARRAY['Ensaios individuais ou em casal', 'Múltiplas locações disponíveis', 'Looks e cenários variados', 'Tratamento digital incluso', 'Fotos impressas opcionais'],
'A partir de R$ 400', 'Heart', false, 3),

('Fotografia Corporativa', 'Profissionalismo em imagem', 'Fortalecemos a identidade visual da sua empresa com fotografias corporativas de alto padrão. Desde headshots executivos até cobertura de eventos empresariais.',
ARRAY['Headshots profissionais', 'Fotos para LinkedIn e sites', 'Cobertura de eventos empresariais', 'Imagens para marketing', 'Pacotes personalizados'],
'A partir de R$ 600', 'Briefcase', false, 4);