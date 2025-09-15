-- Create testimonials table
CREATE TABLE public.testimonials (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  event TEXT NOT NULL,
  rating INTEGER NOT NULL DEFAULT 5 CHECK (rating >= 1 AND rating <= 5),
  text TEXT NOT NULL,
  image TEXT,
  background_image TEXT,
  background_opacity NUMERIC NOT NULL DEFAULT 0.3,
  is_active BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can view active testimonials" 
ON public.testimonials 
FOR SELECT 
USING (is_active = true);

CREATE POLICY "Allow admin operations on testimonials" 
ON public.testimonials 
FOR ALL 
USING (is_admin_session())
WITH CHECK (is_admin_session());

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_testimonials_updated_at
BEFORE UPDATE ON public.testimonials
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default testimonials
INSERT INTO public.testimonials (name, event, rating, text, image, display_order) VALUES
('Ana & João Silva', 'Casamento - Dezembro 2023', 5, 'A nossa fotógrafa superou todas nossas expectativas! As fotos ficaram incríveis e o vídeo do nosso casamento parece um filme. Profissionais extremamente atenciosos e talentosos. Recomendamos de olhos fechados!', 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=100&h=100&fit=crop&crop=face', 0),
('Maria Santos', '15 Anos da Sofia - Outubro 2023', 5, 'O trabalho foi impecável! Captaram todos os momentos especiais da festa de 15 anos da minha filha. As fotos estão lindas e o vídeo emocionante. Toda a família ficou encantada com o resultado final.', 'https://images.unsplash.com/photo-1494790108755-2616b612b11c?w=100&h=100&fit=crop&crop=face', 1),
('Carlos Oliveira', 'Evento Corporativo - Setembro 2023', 5, 'Contratamos para o lançamento da nossa empresa e foi a melhor escolha! Profissionais pontuais, discretos e com um olhar artístico incrível. O material produzido foi fundamental para nossa estratégia de marketing.', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face', 2),
('Família Rodrigues', 'Ensaio Familiar - Novembro 2023', 5, 'Fazer o ensaio com vocês foi uma experiência maravilhosa! Conseguiram deixar todos à vontade, desde as crianças até os avós. As fotos ficaram naturais e cheias de amor. Já agendamos o próximo ensaio!', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face', 3);

-- Create testimonial_backgrounds table for background image management
CREATE TABLE public.testimonial_backgrounds (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  thumbnail_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for testimonial backgrounds
ALTER TABLE public.testimonial_backgrounds ENABLE ROW LEVEL SECURITY;

-- Create policies for testimonial backgrounds
CREATE POLICY "Anyone can view active testimonial backgrounds" 
ON public.testimonial_backgrounds 
FOR SELECT 
USING (is_active = true);

CREATE POLICY "Allow admin operations on testimonial backgrounds" 
ON public.testimonial_backgrounds 
FOR ALL 
USING (is_admin_session())
WITH CHECK (is_admin_session());

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_testimonial_backgrounds_updated_at
BEFORE UPDATE ON public.testimonial_backgrounds
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();