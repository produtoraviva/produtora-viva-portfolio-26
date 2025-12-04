import { useEffect, useState, useRef } from 'react';
import { Star, Quote } from 'lucide-react';
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
    const diff = startX - e.clientX;
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
    const diff = startX - e.touches[0].clientX;
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
      <section id="depoimentos" className="max-w-[1600px] mx-auto px-4 py-24 border-t border-border">
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-6 w-6 border-b border-foreground"></div>
        </div>
      </section>
    );
  }

  const currentData = testimonials[currentTestimonial];

  return (
    <section id="depoimentos" className="max-w-[1600px] mx-auto px-4 py-24 border-t border-border">
      {/* Header */}
      <div className="mb-16">
        <p className="text-xs font-mono text-muted-foreground uppercase tracking-[0.3em] mb-4">
          Depoimentos
        </p>
        <h2 className="text-3xl md:text-5xl font-light uppercase tracking-tighter">
          O que dizem
          <br />
          <span className="text-muted-foreground">nossos clientes</span>
        </h2>
      </div>

      {/* Main Testimonial */}
      <div className="max-w-4xl">
        <div 
          ref={cardRef}
          className={`relative cursor-grab active:cursor-grabbing select-none transition-all duration-500 ${
            isTransitioning ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'
          }`}
          style={{ transform: `translateX(${-dragOffset}px)` }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {/* Quote Icon */}
          <Quote className="h-12 w-12 text-muted-foreground/20 mb-8" />

          {/* Stars */}
          <div className="flex gap-1 mb-6">
            {[...Array(currentData.rating)].map((_, i) => (
              <Star key={i} className="h-4 w-4 text-foreground fill-current" />
            ))}
          </div>

          {/* Text */}
          <blockquote className="text-2xl md:text-4xl font-light leading-relaxed mb-8 tracking-tight">
            "{currentData.text}"
          </blockquote>

          {/* Author */}
          <div className="flex items-center gap-4 pt-8 border-t border-border">
            {currentData.image && (
              <div className="w-12 h-12 rounded-full overflow-hidden grayscale">
                <img
                  src={currentData.image}
                  alt={currentData.name}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <div>
              <div className="font-bold uppercase tracking-wide text-sm">
                {currentData.name}
              </div>
              <div className="text-xs text-muted-foreground uppercase tracking-wider">
                {currentData.event}
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex items-center gap-4 mt-12">
          <span className="text-xs text-muted-foreground font-mono">
            {String(currentTestimonial + 1).padStart(2, '0')} / {String(testimonials.length).padStart(2, '0')}
          </span>
          <div className="flex gap-2">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => handleTestimonialChange(index)}
                className={`w-8 h-px transition-all duration-300 ${
                  index === currentTestimonial ? "bg-foreground" : "bg-muted-foreground/30 hover:bg-muted-foreground"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
