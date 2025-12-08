import { useEffect, useState, useRef, useCallback } from 'react';
import { Star, ChevronLeft, ChevronRight, Quote } from 'lucide-react';
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
      }, 6000);
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

  const currentTestimonial = testimonials[currentIndex];

  return (
    <section 
      id="depoimentos" 
      className="py-24 md:py-32 border-t border-border bg-background relative overflow-hidden"
    >
      {/* Large decorative quote */}
      <div className="absolute top-12 left-8 md:left-16 opacity-[0.03] pointer-events-none">
        <Quote className="w-32 h-32 md:w-64 md:h-64" />
      </div>

      <div className="max-w-[1200px] mx-auto px-4 relative">
        {/* Header */}
        <div className="text-center mb-16 md:mb-20">
          <p className="text-xs font-mono text-muted-foreground uppercase tracking-[0.3em] mb-4">
            Depoimentos
          </p>
          <h2 className="text-3xl md:text-5xl lg:text-6xl font-light uppercase tracking-tighter">
            O que nossos
            <br />
            <span className="text-muted-foreground">clientes dizem</span>
          </h2>
        </div>

        {/* Main Testimonial Card */}
        <div 
          className="relative cursor-grab active:cursor-grabbing"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div className="bg-secondary/50 border border-border p-8 md:p-12 lg:p-16 select-none">
            <div className="max-w-4xl mx-auto">
              {/* Quote Icon */}
              <div className="mb-8">
                <Quote className="w-8 h-8 md:w-10 md:h-10 text-muted-foreground/30" />
              </div>

              {/* Testimonial Text */}
              <blockquote className="text-xl md:text-2xl lg:text-3xl font-light leading-relaxed tracking-tight mb-10 md:mb-12">
                "{currentTestimonial.text}"
              </blockquote>

              {/* Author Info */}
              <div className="flex items-center gap-4 md:gap-6">
                {currentTestimonial.image && (
                  <div className="w-14 h-14 md:w-16 md:h-16 overflow-hidden border border-border flex-shrink-0">
                    <img
                      src={currentTestimonial.image}
                      alt={currentTestimonial.name}
                      className="w-full h-full object-cover grayscale"
                    />
                  </div>
                )}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <span className="font-bold uppercase tracking-[0.1em] text-sm md:text-base">
                      {currentTestimonial.name}
                    </span>
                    <div className="flex gap-0.5">
                      {[...Array(currentTestimonial.rating)].map((_, i) => (
                        <Star key={i} className="h-3 w-3 text-foreground fill-current" />
                      ))}
                    </div>
                  </div>
                  <span className="text-xs md:text-sm text-muted-foreground uppercase tracking-wider">
                    {currentTestimonial.event}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation */}
          {testimonials.length > 1 && (
            <div className="flex items-center justify-between mt-8">
              {/* Prev/Next Buttons */}
              <div className="flex items-center gap-3">
                <button 
                  onClick={handlePrev}
                  className="p-3 border border-border hover:border-foreground hover:bg-foreground hover:text-background transition-all duration-300"
                  aria-label="Anterior"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button 
                  onClick={handleNext}
                  className="p-3 border border-border hover:border-foreground hover:bg-foreground hover:text-background transition-all duration-300"
                  aria-label="Próximo"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {/* Counter */}
              <span className="text-sm font-mono text-muted-foreground">
                {String(currentIndex + 1).padStart(2, '0')} / {String(testimonials.length).padStart(2, '0')}
              </span>

              {/* Progress Dots */}
              <div className="flex gap-2">
                {testimonials.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentIndex(index)}
                    className={`h-1 transition-all duration-300 ${
                      index === currentIndex ? "bg-foreground w-8" : "bg-muted-foreground/30 w-4 hover:bg-muted-foreground/50"
                    }`}
                    aria-label={`Ir para depoimento ${index + 1}`}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
