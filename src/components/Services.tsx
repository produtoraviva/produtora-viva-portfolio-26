import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Camera, Users, Heart, Briefcase, Star, ChevronRight } from 'lucide-react';
import { supabase } from "@/integrations/supabase/client";

interface Service {
  id: string;
  title: string;
  subtitle?: string;
  description: string;
  features: string[];
  price: string;
  icon: string;
  is_highlighted: boolean;
  is_active: boolean;
  display_order: number;
}

const getIconComponent = (iconName: string) => {
  switch (iconName) {
    case 'Camera': return Camera;
    case 'Users': return Users;
    case 'Heart': return Heart;
    case 'Briefcase': return Briefcase;
    case 'Star': return Star;
    default: return Camera;
  }
};

const scrollToContact = () => {
  const contactElement = document.getElementById('contact');
  if (contactElement) {
    contactElement.scrollIntoView({ behavior: 'smooth' });
  }
};

export default function Services() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [dragOffset, setDragOffset] = useState(0);
  const [visibleCount, setVisibleCount] = useState(3);
  const carouselRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadServices();
  }, []);

  // Calculate visible items based on screen width
  useEffect(() => {
    const updateVisibleCount = () => {
      const width = window.innerWidth;
      if (width < 640) {
        setVisibleCount(1);
      } else if (width < 1024) {
        setVisibleCount(2);
      } else {
        setVisibleCount(3);
      }
    };

    updateVisibleCount();
    window.addEventListener('resize', updateVisibleCount);
    return () => window.removeEventListener('resize', updateVisibleCount);
  }, []);

  const loadServices = async () => {
    try {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (error) throw error;
      setServices(data || []);
    } catch (error) {
      console.error('Erro ao carregar serviços:', error);
    } finally {
      setLoading(false);
    }
  };

  const useCarousel = services.length > visibleCount;
  const maxIndex = Math.max(0, services.length - visibleCount);

  const handlePrev = useCallback(() => {
    setCurrentIndex(prev => Math.max(0, prev - 1));
  }, []);

  const handleNext = useCallback(() => {
    setCurrentIndex(prev => Math.min(maxIndex, prev + 1));
  }, [maxIndex]);

  // Reset currentIndex when visibleCount changes
  useEffect(() => {
    if (currentIndex > maxIndex) {
      setCurrentIndex(maxIndex);
    }
  }, [maxIndex, currentIndex]);

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
    
    if (Math.abs(dragOffset) > 100) {
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

  if (loading) {
    return (
      <section id="servicos" className="max-w-[1600px] mx-auto px-4 py-24 border-t border-border">
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-6 w-6 border-b border-foreground"></div>
        </div>
      </section>
    );
  }

  if (services.length === 0) {
    return null;
  }

  const ServiceCard = ({ service }: { service: Service }) => {
    const IconComponent = getIconComponent(service.icon);
    const cardWidth = visibleCount === 1 ? 'w-full' : visibleCount === 2 ? 'w-[calc(50%-0.5rem)]' : 'w-[calc(33.333%-0.67rem)]';
    
    return (
      <div 
        className={`bg-background p-6 md:p-8 lg:p-12 group transition-all duration-500 border border-border relative flex-shrink-0 ${cardWidth} ${
          service.is_highlighted 
            ? 'bg-foreground/5 scale-[1.02] shadow-lg' 
            : 'hover:bg-secondary/50'
        }`}
      >
        {/* Icon and Popular Badge on the same line */}
        <div className="flex items-center justify-between mb-6">
          <div className={`w-12 h-12 border flex items-center justify-center transition-colors duration-300 ${
            service.is_highlighted 
              ? 'border-foreground bg-foreground text-background' 
              : 'border-border group-hover:border-foreground'
          }`}>
            <IconComponent className="h-6 w-6" />
          </div>
          
          {service.is_highlighted && (
            <span className="bg-foreground text-background text-[10px] font-mono uppercase tracking-wider px-3 py-1 font-bold whitespace-nowrap">
              ★ Popular
            </span>
          )}
        </div>
        
        <div className="space-y-6">
          {/* Title & Description */}
          <div>
            <h3 className={`text-xl font-bold uppercase tracking-tight mb-2 ${
              service.is_highlighted ? 'text-foreground' : ''
            }`}>
              {service.title}
            </h3>
            {service.subtitle && (
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-3">
                {service.subtitle}
              </p>
            )}
            <p className="text-sm text-muted-foreground leading-relaxed">
              {service.description}
            </p>
          </div>

          {/* Features */}
          <div className="space-y-2 pt-4 border-t border-border">
            {service.features.slice(0, 4).map((feature, featureIndex) => (
              <div key={featureIndex} className="flex items-start gap-2">
                <span className={`text-xs ${service.is_highlighted ? 'text-foreground' : 'text-muted-foreground'}`}>
                  {service.is_highlighted ? '★' : '—'}
                </span>
                <span className="text-xs text-muted-foreground">{feature}</span>
              </div>
            ))}
          </div>

          {/* Price & CTA */}
          <div className="pt-6">
            {service.price && (
              <div className={`text-2xl font-bold tracking-tight mb-4 ${
                service.is_highlighted ? 'text-foreground' : ''
              }`}>
                {service.price}
              </div>
            )}
            <button 
              onClick={scrollToContact}
              className={`text-xs uppercase tracking-[0.15em] transition-colors duration-300 border-b pb-1 ${
                service.is_highlighted 
                  ? 'text-foreground border-foreground hover:opacity-70' 
                  : 'text-muted-foreground hover:text-foreground border-muted-foreground hover:border-foreground'
              }`}
            >
              Solicitar Orçamento
            </button>
          </div>
        </div>
      </div>
    );
  };

  const translateValue = useCarousel 
    ? `translateX(calc(-${currentIndex * (100 / visibleCount)}% - ${isDragging ? dragOffset : 0}px))`
    : 'translateX(0)';

  return (
    <section id="servicos" className="max-w-[1600px] mx-auto px-4 py-24 border-t border-border" ref={containerRef}>
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 pb-4">
        <div>
          <p className="text-xs font-mono text-muted-foreground uppercase tracking-[0.3em] mb-4">
            Serviços
          </p>
          <h2 className="text-3xl md:text-5xl font-light uppercase tracking-tighter">
            Nossos Serviços
          </h2>
          <p className="text-muted-foreground max-w-md mt-4">
            Serviços personalizados para capturar seus momentos especiais.
          </p>
        </div>
      </div>

      {/* Services Grid/Carousel */}
      {useCarousel ? (
        <div className="relative">
          {/* Scroll Hint Arrow Animation - Right side */}
          {currentIndex < maxIndex && (
            <div className="absolute -right-2 md:right-0 top-1/2 -translate-y-1/2 z-10 pointer-events-none">
              <div className="flex items-center gap-1 text-muted-foreground animate-pulse">
                <span className="text-[10px] uppercase tracking-wider hidden md:block">Scroll</span>
                <ChevronRight className="h-5 w-5 animate-bounce-horizontal" />
              </div>
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
              className={`flex gap-4 ${isDragging ? '' : 'transition-transform duration-500 ease-out'}`}
              style={{ transform: translateValue }}
            >
              {services.map((service) => (
                <ServiceCard key={service.id} service={service} />
              ))}
            </div>
          </div>
          
          {/* Carousel Indicators - smaller on mobile */}
          <div className="flex justify-center gap-1.5 md:gap-2 mt-6 md:mt-8">
            {Array.from({ length: maxIndex + 1 }).map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`h-1.5 md:h-2 transition-all duration-300 ${
                  currentIndex === index ? 'bg-foreground w-4 md:w-6' : 'bg-border w-1.5 md:w-2'
                }`}
              />
            ))}
          </div>
        </div>
      ) : (
        <div className={`grid gap-4 ${
          services.length === 1 ? 'grid-cols-1' : 
          services.length === 2 ? 'grid-cols-1 md:grid-cols-2' : 
          'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
        }`}>
          {services.map((service) => (
            <ServiceCard key={service.id} service={service} />
          ))}
        </div>
      )}

      {/* CTA */}
      <div className="text-center mt-16 pt-16 border-t border-border">
        <p className="text-muted-foreground mb-6 max-w-md mx-auto">
          Precisa de algo personalizado? Criamos pacotes sob medida para suas necessidades.
        </p>
        <button 
          onClick={scrollToContact}
          className="bg-foreground text-background px-8 py-4 text-xs uppercase tracking-[0.2em] font-bold hover:bg-foreground/90 transition-colors duration-300"
        >
          Falar com Especialista
        </button>
      </div>
    </section>
  );
}
