import React, { useState, useEffect } from 'react';
import { Camera, Users, Heart, Briefcase, Star } from 'lucide-react';
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
        <p className="text-muted-foreground max-w-md mt-4 md:mt-0 text-right">
          Serviços personalizados para capturar seus momentos especiais.
        </p>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-border">
        {services.map((service) => {
          const IconComponent = getIconComponent(service.icon);
          return (
            <div 
              key={service.id} 
              className={`bg-background p-8 md:p-12 group hover:bg-secondary/50 transition-colors duration-500 ${
                service.is_highlighted ? 'relative' : ''
              }`}
            >
              {service.is_highlighted && (
                <div className="absolute top-4 right-4">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground border border-border px-2 py-1">
                    Popular
                  </span>
                </div>
              )}
              
              <div className="space-y-6">
                {/* Icon */}
                <div className="w-12 h-12 border border-border flex items-center justify-center group-hover:border-foreground transition-colors duration-300">
                  <IconComponent className="h-6 w-6 text-foreground" />
                </div>

                {/* Title & Description */}
                <div>
                  <h3 className="text-xl font-bold uppercase tracking-tight mb-2">
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
                      <span className="text-muted-foreground text-xs">—</span>
                      <span className="text-xs text-muted-foreground">{feature}</span>
                    </div>
                  ))}
                </div>

                {/* Price & CTA */}
                <div className="pt-6">
                  {service.price && (
                    <div className="text-2xl font-bold tracking-tight mb-4">
                      {service.price}
                    </div>
                  )}
                  <button 
                    onClick={scrollToContact}
                    className="text-xs uppercase tracking-[0.15em] text-muted-foreground hover:text-foreground transition-colors duration-300 border-b border-muted-foreground hover:border-foreground pb-1"
                  >
                    Solicitar Orçamento
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

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
