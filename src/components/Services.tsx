import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Camera, Users, Heart, Briefcase, Star, ChevronRight, ArrowRight } from 'lucide-react';
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
      <section id="servicos" className="py-24 border-t border-border bg-secondary/30">
        <div className="max-w-[1600px] mx-auto px-4">
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-6 w-6 border-b border-foreground"></div>
          </div>
        </div>
      </section>
    );
  }

  if (services.length === 0) {
    return null;
  }

  const ServiceCard = ({ service }: { service: Service }) => {
    const IconComponent = getIconComponent(service.icon);
    const cardWidth = visibleCount === 1 ? 'w-full' : visibleCount === 2 ? 'w-[calc(50%-0.75rem)]' : 'w-[calc(33.333%-1rem)]';
    
    return (
      <div 
        className={`group relative flex-shrink-0 ${cardWidth} ${
          service.is_highlighted 
            ? 'bg-foreground text-background' 
            : 'bg-background hover:bg-secondary/50'
        } transition-all duration-500`}
      >
        {/* Card Content */}
        <div className="p-8 lg:p-10 h-full flex flex-col">
          {/* Header */}
          <div className="flex items-start justify-between mb-8">
            <div className={`w-14 h-14 flex items-center justify-center transition-all duration-300 ${
              service.is_highlighted 
                ? 'bg-background text-foreground' 
                : 'bg-foreground/5 group-hover:bg-foreground group-hover:text-background'
            }`}>
              <IconComponent className="h-7 w-7" />
            </div>
            
            {service.is_highlighted && (
              <span className="bg-background text-foreground text-[10px] font-mono uppercase tracking-wider px-3 py-1.5 font-bold">
                Popular
              </span>
            )}
          </div>

          {/* Title & Description */}
          <div className="mb-8 flex-grow">
            <h3 className="text-2xl font-bold uppercase tracking-tight mb-3">
              {service.title}
            </h3>
            {service.subtitle && (
              <p className={`text-xs uppercase tracking-wider mb-4 ${
                service.is_highlighted ? 'text-background/70' : 'text-muted-foreground'
              }`}>
                {service.subtitle}
              </p>
            )}
            <p className={`text-sm leading-relaxed ${
              service.is_highlighted ? 'text-background/80' : 'text-muted-foreground'
            }`}>
              {service.description}
            </p>
          </div>

          {/* Features */}
          <div className={`space-y-3 py-6 border-y mb-8 ${
            service.is_highlighted ? 'border-background/20' : 'border-border'
          }`}>
            {service.features.slice(0, 4).map((feature, featureIndex) => (
              <div key={featureIndex} className="flex items-start gap-3">
                <span className={`text-xs mt-0.5 ${
                  service.is_highlighted ? 'text-background' : 'text-foreground'
                }`}>
                  ✓
                </span>
                <span className={`text-sm ${
                  service.is_highlighted ? 'text-background/80' : 'text-muted-foreground'
                }`}>
                  {feature}
                </span>
              </div>
            ))}
          </div>

          {/* Price & CTA */}
          <div className="mt-auto">
            {service.price && (
              <div className="text-3xl font-bold tracking-tight mb-6">
                {service.price}
              </div>
            )}
            <button 
              onClick={scrollToContact}
              className={`w-full py-4 text-xs uppercase tracking-[0.2em] font-bold flex items-center justify-center gap-2 transition-all duration-300 ${
                service.is_highlighted 
                  ? 'bg-background text-foreground hover:bg-background/90' 
                  : 'bg-foreground text-background hover:bg-foreground/90'
              }`}
            >
              Solicitar Orçamento
              <ArrowRight className="h-4 w-4" />
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
    <section id="servicos" className="py-24 border-t border-border bg-secondary/30" ref={containerRef}>
      <div className="max-w-[1600px] mx-auto px-4">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16">
          <div>
            <p className="text-xs font-mono text-muted-foreground uppercase tracking-[0.3em] mb-4">
              Serviços
            </p>
            <h2 className="text-4xl md:text-6xl font-bold uppercase tracking-tighter">
              Nossos
              <br />
              <span className="text-muted-foreground font-light">Serviços</span>
            </h2>
          </div>
          <p className="text-muted-foreground max-w-sm mt-6 md:mt-0 text-right hidden md:block">
            Serviços personalizados para<br />capturar seus momentos especiais.
          </p>
        </div>

        {/* Services Grid/Carousel */}
        {useCarousel ? (
          <div className="relative">
            {/* Scroll Hint Arrow Animation - Right side */}
            {currentIndex < maxIndex && (
              <div className="absolute -right-2 md:right-4 top-1/2 -translate-y-1/2 z-10 pointer-events-none">
                <div className="flex items-center gap-1 text-muted-foreground">
                  <span className="text-[10px] uppercase tracking-wider hidden md:block opacity-60">Scroll</span>
                  <ChevronRight className="h-5 w-5 animate-bounce-horizontal opacity-60" />
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
                className={`flex gap-6 ${isDragging ? '' : 'transition-transform duration-500 ease-out'}`}
                style={{ transform: translateValue }}
              >
                {services.map((service) => (
                  <ServiceCard key={service.id} service={service} />
                ))}
              </div>
            </div>
            
            {/* Carousel Indicators - smaller on mobile */}
            <div className="flex justify-center gap-1.5 md:gap-2 mt-8">
              {Array.from({ length: maxIndex + 1 }).map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`h-1 transition-all duration-300 ${
                    currentIndex === index ? 'bg-foreground w-6' : 'bg-border w-2'
                  }`}
                />
              ))}
            </div>
          </div>
        ) : (
          <div className={`grid gap-6 ${
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
        <div className="text-center mt-20 pt-16 border-t border-border">
          <p className="text-muted-foreground mb-8 max-w-md mx-auto">
            Precisa de algo personalizado? Criamos pacotes sob medida para suas necessidades.
          </p>
          <button 
            onClick={scrollToContact}
            className="bg-foreground text-background px-10 py-5 text-xs uppercase tracking-[0.2em] font-bold hover:bg-foreground/90 transition-all duration-300 inline-flex items-center gap-3"
          >
            Falar com Especialista
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </section>
  );
}