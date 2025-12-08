import { useEffect, useState, useRef, useCallback } from 'react';
import { Star, Quote, ChevronRight } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

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
  const [currentIndex, setCurrentIndex] = useState(0);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [dragOffset, setDragOffset] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);

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
      setTestimonials([
        {
          id: '1',
          name: "Ana & João Silva",
          event: "Casamento - Dezembro 2023",
          rating: 5,
          text: "A nossa fotógrafa superou todas nossas expectativas! As fotos ficaram incríveis e o vídeo do nosso casamento parece um filme.",
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
          text: "O trabalho foi impecável! Captaram todos os momentos especiais da festa de 15 anos da minha filha.",
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

  const maxIndex = Math.max(0, testimonials.length - 1);

  const handlePrev = useCallback(() => {
    setCurrentIndex(prev => prev > 0 ? prev - 1 : testimonials.length - 1);
  }, [testimonials.length]);

  const handleNext = useCallback(() => {
    setCurrentIndex(prev => prev < testimonials.length - 1 ? prev + 1 : 0);
  }, [testimonials.length]);

  // Auto-advance
  useEffect(() => {
    if (!isDragging && testimonials.length > 1) {
      const interval = setInterval(() => {
        handleNext();
      }, 6000);
      return () => clearInterval(interval);
    }
  }, [testimonials.length, isDragging, handleNext]);

  // Drag handlers
  const handleDragStart = (clientX: number) => {
    setIsDragging(true);
    setStartX(clientX);
  };

  const handleDragMove = (clientX: number) => {
    if (!isDragging) return;
    const diff = startX - clientX;
    setDragOffset(diff);
  };

  const handleDragEnd = () => {
    if (!isDragging) return;
    
    if (Math.abs(dragOffset) > 80) {
      if (dragOffset > 0) {
        handleNext();
      } else {
        handlePrev();
      }
    }
    
    setIsDragging(false);
    setDragOffset(0);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    handleDragStart(e.clientX);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    handleDragMove(e.clientX);
  };

  const handleMouseUp = () => {
    handleDragEnd();
  };

  const handleMouseLeave = () => {
    if (isDragging) handleDragEnd();
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    handleDragStart(e.touches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    handleDragMove(e.touches[0].clientX);
  };

  const handleTouchEnd = () => {
    handleDragEnd();
  };

  if (isLoading || testimonials.length === 0) {
    return (
      <section id="depoimentos" className="max-w-[1600px] mx-auto px-4 py-16 border-t border-border">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-6 w-6 border-b border-foreground"></div>
        </div>
      </section>
    );
  }

  const translateValue = `translateX(calc(-${currentIndex * 100}% - ${isDragging ? dragOffset : 0}px))`;

  return (
    <section 
      id="depoimentos" 
      className="py-16 border-t border-border bg-background"
    >
      <div className="max-w-[1200px] mx-auto px-4">
        {/* Header - More compact */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10">
          <div>
            <p className="text-xs font-mono text-muted-foreground uppercase tracking-[0.3em] mb-2">
              Depoimentos
            </p>
            <h2 className="text-2xl md:text-4xl font-bold uppercase tracking-tighter">
              O que dizem nossos clientes
            </h2>
          </div>
          {testimonials.length > 1 && (
            <div className="flex items-center gap-2 mt-4 md:mt-0">
              <span className="text-xs text-muted-foreground font-mono">
                {String(currentIndex + 1).padStart(2, '0')} / {String(testimonials.length).padStart(2, '0')}
              </span>
            </div>
          )}
        </div>

        {/* Testimonial Card with gray background */}
        <div className="relative bg-secondary/50 p-6 md:p-10">
          {/* Scroll Hint Arrow */}
          {testimonials.length > 1 && currentIndex < maxIndex && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2 z-10 pointer-events-none flex flex-col items-center">
              <span className="text-[8px] uppercase tracking-wider text-muted-foreground mb-1 hidden md:block">Scroll</span>
              <ChevronRight className="h-5 w-5 text-muted-foreground/60 animate-bounce-horizontal" />
            </div>
          )}

          <div 
            className="overflow-hidden cursor-grab active:cursor-grabbing"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseLeave}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <div 
              ref={carouselRef}
              className={`flex ${isDragging ? '' : 'transition-transform duration-500 ease-out'}`}
              style={{ transform: translateValue }}
            >
              {testimonials.map((testimonial) => (
                <div 
                  key={testimonial.id}
                  className="w-full flex-shrink-0"
                >
                  <div className="max-w-3xl mx-auto select-none py-4">
                    {/* Stars */}
                    <div className="flex gap-0.5 mb-4">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 text-foreground fill-current" />
                      ))}
                    </div>

                    {/* Text - More compact */}
                    <blockquote className="text-lg md:text-xl lg:text-2xl font-light leading-relaxed mb-6 tracking-tight">
                      "{testimonial.text}"
                    </blockquote>

                    {/* Author - More compact */}
                    <div className="flex items-center gap-3 pt-4 border-t border-border/50">
                      {testimonial.image && (
                        <div className="w-10 h-10 overflow-hidden grayscale">
                          <img
                            src={testimonial.image}
                            alt={testimonial.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <div>
                        <div className="font-bold uppercase tracking-wide text-sm">
                          {testimonial.name}
                        </div>
                        <div className="text-xs text-muted-foreground uppercase tracking-wider">
                          {testimonial.event}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Indicators - Minimal */}
          {testimonials.length > 1 && (
            <div className="flex justify-center gap-1 mt-4">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`h-px transition-all duration-300 ${
                    index === currentIndex ? "bg-foreground w-6" : "bg-muted-foreground/30 w-3"
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;