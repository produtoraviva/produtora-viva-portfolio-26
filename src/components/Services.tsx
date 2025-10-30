import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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
      <section id="servicos" className="py-24 bg-white">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </div>
      </section>
    );
  }

  if (services.length === 0) {
    return null;
  }

  return (
    <section id="servicos" className="py-24 lg:py-32 bg-white">
      <div className="container mx-auto px-6 sm:px-8 lg:px-16">
        <div className="text-center mb-20 max-w-3xl mx-auto">
          <div className="inline-flex items-center space-x-2 bg-secondary rounded-full px-5 py-2.5 mb-6">
            <span className="text-sm font-medium text-foreground tracking-wide">
              Serviços
            </span>
          </div>
          <h2 className="text-5xl lg:text-7xl font-bold mb-6 tracking-tighter">
            Nossos <span className="text-primary">Serviços</span>
          </h2>
          <p className="text-xl text-muted-foreground leading-relaxed font-light">
            Serviços personalizados para capturar seus momentos especiais com qualidade excepcional.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10 mb-20">
          {services.map((service, index) => {
            const IconComponent = getIconComponent(service.icon);
            return (
              <Card 
                key={service.id} 
                className={`relative p-10 bg-white border-0 elegant-shadow hover-lift group ${
                  service.is_highlighted ? 'ring-2 ring-primary/20' : ''
                }`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {service.is_highlighted && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <div className="bg-primary text-primary-foreground px-4 py-1.5 rounded-full text-xs font-medium">
                      Mais Popular
                    </div>
                  </div>
                )}
                
                <div className="space-y-6">
                  <div className="flex flex-col items-center text-center">
                    <div className="w-20 h-20 bg-secondary rounded-2xl flex items-center justify-center mb-6 group-hover:bg-primary/10 transition-all duration-500">
                      <IconComponent className="h-10 w-10 text-primary" />
                    </div>
                    <h3 className="font-bold text-2xl text-foreground mb-2 tracking-tight">
                      {service.title}
                    </h3>
                    {service.subtitle && (
                      <p className="text-sm text-primary font-medium mb-3">
                        {service.subtitle}
                      </p>
                    )}
                    <p className="text-base text-muted-foreground leading-relaxed">
                      {service.description}
                    </p>
                  </div>

                  <div className="space-y-3 py-4">
                    {service.features.map((feature, featureIndex) => (
                      <div key={featureIndex} className="flex items-start gap-3">
                        <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0" />
                        <span className="text-sm text-muted-foreground leading-relaxed">{feature}</span>
                      </div>
                    ))}
                  </div>

                  <div className="text-center pt-6 border-t border-border">
                    {service.price && (
                      <div className="text-2xl font-bold text-primary mb-6 tracking-tight">
                        {service.price}
                      </div>
                    )}
                    <Button 
                      onClick={scrollToContact}
                      variant={service.is_highlighted ? "default" : "outline"}
                      className={`w-full rounded-full py-6 ${
                        service.is_highlighted 
                          ? "bg-primary hover:bg-primary/90 text-primary-foreground" 
                          : "border-2 hover:bg-accent"
                      }`}
                    >
                      Solicitar Orçamento
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        <div className="text-center bg-secondary/50 rounded-3xl p-12 max-w-2xl mx-auto">
          <p className="text-lg text-muted-foreground mb-8">
            Precisa de algo personalizado? Criamos pacotes sob medida para suas necessidades.
          </p>
          <Button 
            onClick={scrollToContact} 
            size="lg" 
            className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full px-10 py-7 hover-lift"
          >
            Falar com Especialista
          </Button>
        </div>
      </div>
    </section>
  );
}
