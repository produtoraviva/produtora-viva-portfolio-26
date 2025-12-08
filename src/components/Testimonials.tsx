import { useEffect, useState, useRef, useCallback } from 'react';
import { Star, Quote, ChevronLeft, ChevronRight, Mouse } from 'lucide-react';
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
  const autoPlayRef = useRef<NodeJS.Timeout | null>(null);

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
      setTestimonials([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrev = useCallback(() => {
    setCurrentIndex(prev => prev > 0 ? prev - 1 : testimonials.length - 1);
  }, [testimonials.length]);

  const handleNext = useCallback(() => {
    setCurrentIndex(prev => prev < testimonials.length - 1 ? prev + 1 : 0);
  }, [testimonials.length]);

  // Auto-advance with reset on interaction
  useEffect(() => {
    if (!isDragging && testimonials.length > 1) {
      autoPlayRef.current = setInterval(() => {
        handleNext();
      }, 5000);
      return () => {
        if (autoPlayRef.current) clearInterval(autoPlayRef.current);
      };
    }
  }, [testimonials.length, isDragging, handleNext]);

  // Drag handlers
  const handleDragStart = (clientX: number) => {
    setIsDragging(true);
    setStartX(clientX);
    if (autoPlayRef.current) clearInterval(autoPlayRef.current);
  };

  const handleDragMove = (clientX: number) => {
    if (!isDragging) return;
    const diff = startX - clientX;
    setDragOffset(diff);
  };

  const handleDragEnd = () => {
    if (!isDragging) return;
    
    if (Math.abs(dragOffset) > 60) {
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
    return null;
  }

  const translateValue = `translateX(calc(-${currentIndex * 100}% - ${isDragging ? dragOffset : 0}px))`;

  return (
    <section 
      id="depoimentos" 
      className="py-20 border-t border-border bg-background"
    >
      <div className="max-w-[1400px] mx-auto px-4">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12">
          <div>
            <p className="text-xs font-mono text-muted-foreground uppercase tracking-[0.3em] mb-3">
              Depoimentos
            </p>
            <h2 className="text-3xl md:text-5xl font-bold uppercase tracking-tighter">
              O que dizem
            </h2>
          </div>
          
          {/* Navigation arrows - desktop */}
          {testimonials.length > 1 && (
            <div className="hidden md:flex items-center gap-4 mt-4 md:mt-0">
              <button 
                onClick={handlePrev}
                className="p-3 border border-border hover:border-foreground hover:bg-foreground hover:text-background transition-all duration-300"
                aria-label="Anterior"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <span className="text-sm font-mono text-muted-foreground min-w-[60px] text-center">
                {String(currentIndex + 1).padStart(2, '0')} / {String(testimonials.length).padStart(2, '0')}
              </span>
              <button 
                onClick={handleNext}
                className="p-3 border border-border hover:border-foreground hover:bg-foreground hover:text-background transition-all duration-300"
                aria-label="Próximo"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>

        {/* Testimonial Content Area with Gray Background */}
        <div className="relative bg-secondary py-12 px-6 md:px-12">
          {/* Quote icon */}
          <Quote className="absolute top-6 left-6 w-8 h-8 text-muted-foreground/20" />
          
          {/* Carousel */}
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
              className={`flex ${isDragging ? '' : 'transition-transform duration-700 ease-out'}`}
              style={{ transform: translateValue }}
            >
              {testimonials.map((testimonial) => (
                <div 
                  key={testimonial.id}
                  className="w-full flex-shrink-0"
                >
                  <div className="max-w-4xl mx-auto select-none text-center py-8">
                    {/* Stars */}
                    <div className="flex justify-center gap-1 mb-8">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 text-foreground fill-current" />
                      ))}
                    </div>

                    {/* Text */}
                    <blockquote className="text-xl md:text-2xl lg:text-3xl font-light leading-relaxed mb-10 tracking-tight italic">
                      "{testimonial.text}"
                    </blockquote>

                    {/* Author */}
                    <div className="flex flex-col items-center">
                      {testimonial.image && (
                        <div className="w-14 h-14 mb-4 overflow-hidden border border-border">
                          <img
                            src={testimonial.image}
                            alt={testimonial.name}
                            className="w-full h-full object-cover grayscale"
                          />
                        </div>
                      )}
                      <div className="font-bold uppercase tracking-[0.15em] text-sm mb-1">
                        {testimonial.name}
                      </div>
                      <div className="text-xs text-muted-foreground uppercase tracking-wider">
                        {testimonial.event}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Scroll indicator - mobile */}
          {testimonials.length > 1 && (
            <div className="flex flex-col items-center mt-8 md:hidden">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Mouse className="w-5 h-5 animate-pulse" />
                <span className="text-[10px] uppercase tracking-[0.2em]">Deslize</span>
              </div>
            </div>
          )}
          
          {/* Progress dots */}
          {testimonials.length > 1 && (
            <div className="flex justify-center gap-2 mt-6">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`h-1 transition-all duration-300 ${
                    index === currentIndex ? "bg-foreground w-8" : "bg-muted-foreground/30 w-4"
                  }`}
                  aria-label={`Ir para depoimento ${index + 1}`}
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
