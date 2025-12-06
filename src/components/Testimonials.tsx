import { useEffect, useState, useRef, useCallback } from 'react';
import { Star, Quote, ChevronLeft, ChevronRight } from 'lucide-react';
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
      <section id="depoimentos" className="max-w-[1600px] mx-auto px-4 py-24 border-t border-border">
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-6 w-6 border-b border-foreground"></div>
        </div>
      </section>
    );
  }

  const translateValue = `translateX(calc(-${currentIndex * 100}% - ${isDragging ? dragOffset : 0}px))`;

  return (
    <section id="depoimentos" className="max-w-[1600px] mx-auto px-4 py-24 border-t border-border">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 pb-4">
        <div>
          <p className="text-xs font-mono text-muted-foreground uppercase tracking-[0.3em] mb-4">
            Depoimentos
          </p>
          <h2 className="text-3xl md:text-5xl font-light uppercase tracking-tighter">
            O que dizem
            <br />
            <span className="text-muted-foreground">nossos clientes</span>
          </h2>
        </div>
        <p className="text-muted-foreground max-w-md text-right mt-4 md:mt-0">
          Histórias reais de quem confiou em nosso trabalho.
        </p>
      </div>

      {/* Carousel */}
      <div className="relative">
        {/* Navigation Arrows */}
        {testimonials.length > 1 && (
          <>
            <button 
              onClick={handlePrev}
              className="absolute -left-4 md:-left-12 top-1/2 -translate-y-1/2 z-10 w-10 h-10 border border-border bg-background flex items-center justify-center hover:bg-foreground hover:text-background transition-colors"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button 
              onClick={handleNext}
              className="absolute -right-4 md:-right-12 top-1/2 -translate-y-1/2 z-10 w-10 h-10 border border-border bg-background flex items-center justify-center hover:bg-foreground hover:text-background transition-colors"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </>
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
                className="w-full flex-shrink-0 px-4 md:px-8"
              >
                <div className="max-w-4xl mx-auto select-none">
                  {/* Quote Icon */}
                  <Quote className="h-12 w-12 text-muted-foreground/20 mb-8" />

                  {/* Stars */}
                  <div className="flex gap-1 mb-6">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 text-foreground fill-current" />
                    ))}
                  </div>

                  {/* Text */}
                  <blockquote className="text-2xl md:text-4xl font-light leading-relaxed mb-8 tracking-tight">
                    "{testimonial.text}"
                  </blockquote>

                  {/* Author */}
                  <div className="flex items-center gap-4 pt-8 border-t border-border">
                    {testimonial.image && (
                      <div className="w-12 h-12 overflow-hidden grayscale">
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

        {/* Indicators */}
        {testimonials.length > 1 && (
          <div className="flex items-center justify-center gap-4 mt-12">
            <span className="text-xs text-muted-foreground font-mono">
              {String(currentIndex + 1).padStart(2, '0')} / {String(testimonials.length).padStart(2, '0')}
            </span>
            <div className="flex gap-2">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`w-8 h-px transition-all duration-300 ${
                    index === currentIndex ? "bg-foreground" : "bg-muted-foreground/30 hover:bg-muted-foreground"
                  }`}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default Testimonials;