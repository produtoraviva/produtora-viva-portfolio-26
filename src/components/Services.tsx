import React, { useState, useEffect, useRef } from 'react';
import { Camera, Users, Heart, Briefcase, Star, ChevronLeft, ChevronRight } from 'lucide-react';
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
  const carouselRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadServices();
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

  const useCarousel = services.length > 3;
  const visibleServices = useCarousel ? 3 : services.length;
  const maxIndex = Math.max(0, services.length - visibleServices);

  const handlePrev = () => {
    setCurrentIndex(prev => Math.max(0, prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex(prev => Math.min(maxIndex, prev + 1));
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
    return (
      <div 
        className={`bg-background p-8 md:p-12 group transition-all duration-500 border border-border relative flex-shrink-0 ${
          useCarousel ? 'w-[calc(33.333%-1rem)]' : ''
        } ${
          service.is_highlighted 
            ? 'border-foreground bg-foreground/5 scale-[1.02] shadow-lg' 
            : 'hover:bg-secondary/50'
        }`}
      >
        {service.is_highlighted && (
          <div className="absolute -top-3 left-1/2 -translate-x-1/2">
            <span className="bg-foreground text-background text-[10px] font-mono uppercase tracking-wider px-4 py-1.5 font-bold">
              ★ Popular
            </span>
          </div>
        )}
        
        <div className="space-y-6">
          {/* Icon */}
          <div className={`w-12 h-12 border flex items-center justify-center transition-colors duration-300 ${
            service.is_highlighted 
              ? 'border-foreground bg-foreground text-background' 
              : 'border-border group-hover:border-foreground'
          }`}>
            <IconComponent className="h-6 w-6" />
          </div>

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

  return (
    <section id="servicos" className="max-w-[1600px] mx-auto px-4 py-24 border-t border-border">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 pb-4">
        <div>
          <p className="text-xs font-mono text-muted-foreground uppercase tracking-[0.3em] mb-4">
            Serviços
          </p>
          <h2 className="text-3xl md:text-5xl font-light uppercase tracking-tighter">
            Nossos Serviços
          </h2>
        </div>
        <div className="flex items-center gap-4 mt-4 md:mt-0">
          <p className="text-muted-foreground max-w-md text-right">
            Serviços personalizados para capturar seus momentos especiais.
          </p>
          {useCarousel && (
            <div className="flex gap-2">
              <button 
                onClick={handlePrev}
                disabled={currentIndex === 0}
                className="w-10 h-10 border border-border flex items-center justify-center hover:bg-foreground hover:text-background transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button 
                onClick={handleNext}
                disabled={currentIndex >= maxIndex}
                className="w-10 h-10 border border-border flex items-center justify-center hover:bg-foreground hover:text-background transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Services Grid/Carousel */}
      {useCarousel ? (
        <div className="overflow-hidden">
          <div 
            ref={carouselRef}
            className="flex gap-4 transition-transform duration-500 ease-out"
            style={{ transform: `translateX(-${currentIndex * (100 / visibleServices)}%)` }}
          >
            {services.map((service) => (
              <ServiceCard key={service.id} service={service} />
            ))}
          </div>
          {/* Carousel Indicators */}
          <div className="flex justify-center gap-2 mt-8">
            {Array.from({ length: maxIndex + 1 }).map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-2 h-2 transition-all duration-300 ${
                  currentIndex === index ? 'bg-foreground w-6' : 'bg-border'
                }`}
              />
            ))}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-border">
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
