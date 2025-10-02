import { useEffect, useState, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Star, Quote } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { Badge } from '@/components/ui/badge';
import { Logo } from '@/components/Logo';
import { TestimonialsInfiniteCarousel } from '@/components/TestimonialsInfiniteCarousel';

interface Testimonial {
  id: string;
  name: string;
  event: string;
  rating: number;
  text: string;
  image?: string;
  background_image?: string;
  background_opacity: number;
  display_order: number;
  is_active: boolean;
}

const Testimonials = () => {
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [dragOffset, setDragOffset] = useState(0);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadTestimonials();
  }, []);

  const loadTestimonials = async () => {
    try {
      const { data, error } = await supabase
        .from('testimonials')
        .select('*')
        .eq('is_active', true)
        .eq('status', 'approved')
        .eq('show_on_homepage', true)
        .order('display_order');

      if (error) throw error;
      setTestimonials(data || []);
    } catch (error) {
      console.error('Error loading testimonials:', error);
      // Fallback to default testimonials if database fails
      setTestimonials([
        {
          id: '1',
          name: "Ana & João Silva",
          event: "Casamento - Dezembro 2023",
          rating: 5,
          text: "A nossa fotógrafa superou todas nossas expectativas! As fotos ficaram incríveis e o vídeo do nosso casamento parece um filme. Profissionais extremamente atenciosos e talentosos. Recomendamos de olhos fechados!",
          image: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=100&h=100&fit=crop&crop=face",
          background_opacity: 0.3,
          display_order: 0,
          is_active: true
        },
        {
          id: '2',
          name: "Maria Santos",
          event: "15 Anos da Sofia - Outubro 2023",
          rating: 5,
          text: "O trabalho foi impecável! Captaram todos os momentos especiais da festa de 15 anos da minha filha. As fotos estão lindas e o vídeo emocionante. Toda a família ficou encantada com o resultado final.",
          image: "https://images.unsplash.com/photo-1494790108755-2616b612b11c?w=100&h=100&fit=crop&crop=face",
          background_opacity: 0.3,
          display_order: 1,
          is_active: true
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!isDragging && testimonials.length > 0 && !isTransitioning) {
      const interval = setInterval(() => {
        handleTestimonialChange((prev) => (prev + 1) % testimonials.length);
      }, 6000);
      return () => clearInterval(interval);
    }
  }, [testimonials.length, isDragging, isTransitioning]);

  const handleTestimonialChange = (newIndex: number | ((prev: number) => number)) => {
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentTestimonial(newIndex);
      setTimeout(() => {
        setIsTransitioning(false);
      }, 50);
    }, 200);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setStartX(e.clientX);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    
    const currentX = e.clientX;
    const diff = startX - currentX;
    
    setDragOffset(diff * 0.3);
    
    if (Math.abs(diff) > 80) {
      if (diff > 0) {
        handleTestimonialChange((prev) => (prev + 1) % testimonials.length);
      } else {
        handleTestimonialChange((prev) => (prev - 1 + testimonials.length) % testimonials.length);
      }
      setIsDragging(false);
      setDragOffset(0);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setDragOffset(0);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    setStartX(e.touches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    
    const currentX = e.touches[0].clientX;
    const diff = startX - currentX;
    
    setDragOffset(diff * 0.3);
    
    if (Math.abs(diff) > 80) {
      if (diff > 0) {
        handleTestimonialChange((prev) => (prev + 1) % testimonials.length);
      } else {
        handleTestimonialChange((prev) => (prev - 1 + testimonials.length) % testimonials.length);
      }
      setIsDragging(false);
      setDragOffset(0);
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    setDragOffset(0);
  };

  if (isLoading || testimonials.length === 0) {
    return (
      <section id="depoimentos" className="py-20 lg:py-32 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <LoadingSpinner />
          </div>
        </div>
      </section>
    );
  }

  const currentData = testimonials[currentTestimonial];

  return (
    <>
      {/* Hero Section with Logo */}
      <section className="relative py-20 overflow-hidden bg-gradient-to-br from-background via-primary/5 to-background">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background" />
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex justify-center mb-8 animate-fade-in">
            <Logo size="xl" className="drop-shadow-2xl" />
          </div>
          
          <Badge variant="outline" className="mb-6 animate-fade-in-delayed border-primary/30">
            Depoimentos
          </Badge>
          
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-primary via-primary to-primary/70 bg-clip-text text-transparent animate-fade-in-delayed">
            Histórias de Sucesso
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto animate-fade-in-delayed">
            Veja o que nossos clientes têm a dizer sobre suas experiências conosco
          </p>
        </div>
      </section>

      {/* Infinite Carousel */}
      <TestimonialsInfiniteCarousel />

      {/* Featured Testimonials Section */}
      <section 
        id="depoimentos" 
        className="relative py-24 bg-cover bg-center bg-no-repeat overflow-hidden"
        style={{
          backgroundImage: currentData?.background_image 
            ? `url(${currentData.background_image})` 
            : 'none',
        }}
      >
        {/* Overlay with dynamic opacity */}
        <div 
          className="absolute inset-0 bg-gradient-to-b from-background via-background/80 to-background"
          style={{
            opacity: currentData?.background_image 
              ? Number(currentData.background_opacity) || 0.7 
              : 1,
          }}
        />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4 border-primary/30">
              Depoimentos em Destaque
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary via-primary to-primary/70 bg-clip-text text-transparent">
              O que nossos clientes dizem
            </h2>
          </div>

          {/* Main Testimonial */}
          <div className="max-w-4xl mx-auto">
            <Card 
              ref={cardRef}
              className={`p-8 lg:p-12 bg-card/80 backdrop-blur-sm border-border relative overflow-hidden cursor-grab active:cursor-grabbing select-none transition-all duration-500 ease-out ${
                isTransitioning ? 'opacity-0 translate-y-4 scale-95' : 'opacity-100 translate-y-0 scale-100'
              }`}
              style={{
                transform: `translateX(${-dragOffset}px) ${isDragging ? 'scale(0.98)' : ''}`,
                boxShadow: isDragging ? '0 20px 40px -12px hsl(45 93% 61% / 0.2)' : '0 10px 30px -10px hsl(45 93% 61% / 0.1)'
              }}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              {/* Quote Icon */}
              <div className={`absolute top-6 right-6 transition-all duration-500 ${
                isTransitioning ? 'opacity-0 rotate-12' : 'opacity-10 rotate-0'
              }`}>
                <Quote className="h-16 w-16 text-primary" />
              </div>

              <div className={`relative z-10 transition-all duration-500 ${
                isTransitioning ? 'opacity-0 translate-y-2' : 'opacity-100 translate-y-0'
              }`}>
                {/* Stars */}
                <div className="flex justify-center mb-6">
                  {[...Array(currentData.rating)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-6 w-6 text-primary fill-current transition-all duration-300 ${
                        isTransitioning ? 'scale-75 opacity-50' : 'scale-100 opacity-100'
                      }`}
                      style={{ transitionDelay: `${i * 100}ms` }}
                    />
                  ))}
                </div>

                {/* Testimonial Text */}
                <blockquote className={`text-xl lg:text-2xl text-center text-foreground leading-relaxed mb-8 font-medium transition-all duration-500 ${
                  isTransitioning ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'
                }`} style={{ transitionDelay: '100ms' }}>
                  "{currentData.text}"
                </blockquote>

                {/* Author Info */}
                <div className={`flex items-center justify-center space-x-4 transition-all duration-500 ${
                  isTransitioning ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'
                }`} style={{ transitionDelay: '200ms' }}>
                  {currentData.image && (
                    <div className={`w-16 h-16 rounded-full overflow-hidden transition-all duration-500 ${
                      isTransitioning ? 'scale-75 opacity-50' : 'scale-100 opacity-100'
                    }`} style={{ transitionDelay: '250ms' }}>
                      <img
                        src={currentData.image}
                        alt={currentData.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div className="text-center">
                    <div className="font-semibold text-lg text-foreground">
                      {currentData.name}
                    </div>
                    <div className="text-sm text-primary">
                      {currentData.event}
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Navigation Dots */}
            <div className="flex justify-center mt-8 space-x-3">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => handleTestimonialChange(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-500 ease-out hover:scale-110 ${
                    index === currentTestimonial
                      ? "bg-primary scale-125 shadow-lg shadow-primary/30"
                      : "bg-primary/30 hover:bg-primary/60 scale-100"
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16 max-w-2xl mx-auto">
            <div className={`text-center transition-all duration-700 ${
              isTransitioning ? 'opacity-50 translate-y-2' : 'opacity-100 translate-y-0'
            }`} style={{ transitionDelay: '300ms' }}>
              <div className="text-4xl font-bold text-primary mb-2">98%</div>
              <div className="text-sm text-muted-foreground">Satisfação dos Clientes</div>
            </div>
            <div className={`text-center transition-all duration-700 ${
              isTransitioning ? 'opacity-50 translate-y-2' : 'opacity-100 translate-y-0'
            }`} style={{ transitionDelay: '400ms' }}>
              <div className="text-4xl font-bold text-primary mb-2">500+</div>
              <div className="text-sm text-muted-foreground">Eventos Realizados</div>
            </div>
            <div className={`text-center transition-all duration-700 ${
              isTransitioning ? 'opacity-50 translate-y-2' : 'opacity-100 translate-y-0'
            }`} style={{ transitionDelay: '500ms' }}>
              <div className="text-4xl font-bold text-primary mb-2">24h</div>
              <div className="text-sm text-muted-foreground">Tempo de Resposta</div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Testimonials;
