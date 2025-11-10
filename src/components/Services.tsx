import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Camera, Users, Heart, Briefcase, Star } from 'lucide-react';
import { supabase } from "@/integrations/supabase/client";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

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
    <section id="servicos" className="py-32 lg:py-40 bg-gradient-to-b from-white to-secondary/20">
      <div className="container mx-auto px-6 sm:px-8 lg:px-16">
        <div className="text-center mb-24 max-w-3xl mx-auto">
          <div className="inline-flex items-center space-x-2 bg-white rounded-full px-6 py-3 mb-8 elegant-shadow">
            <span className="text-sm font-semibold text-foreground tracking-wide uppercase">
              Serviços
            </span>
          </div>
          <h2 className="text-6xl lg:text-8xl font-display font-bold mb-8 tracking-tighter leading-none">
            Nossos <span className="gradient-text">Serviços</span>
          </h2>
          <p className="text-xl lg:text-2xl text-muted-foreground leading-relaxed font-light">
            Serviços personalizados para capturar seus momentos especiais com qualidade excepcional.
          </p>
        </div>

        {services.length <= 3 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 lg:gap-12 mb-24">
            {services.map((service, index) => {
              const IconComponent = getIconComponent(service.icon);
              return (
                <Card 
                  key={service.id} 
                  className={`relative p-12 bg-white/90 backdrop-blur-sm border-0 elegant-shadow hover-lift group rounded-3xl ${
                    service.is_highlighted ? 'ring-2 ring-primary/30' : ''
                  }`}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  {service.is_highlighted && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <div className="bg-primary text-primary-foreground px-5 py-2 rounded-full text-xs font-bold uppercase tracking-wider shadow-lg">
                        Mais Popular
                      </div>
                    </div>
                  )}
                  
                  <div className="space-y-7">
                    <div className="flex flex-col items-center text-center">
                      <div className="w-24 h-24 bg-gradient-to-br from-secondary to-accent rounded-2xl flex items-center justify-center mb-8 group-hover:from-primary/10 group-hover:to-primary/5 transition-all duration-500 shadow-sm">
                        <IconComponent className="h-12 w-12 text-primary" />
                      </div>
                      <h3 className="font-display font-bold text-3xl text-foreground mb-3 tracking-tight">
                        {service.title}
                      </h3>
                      {service.subtitle && (
                        <p className="text-sm text-primary font-semibold mb-4 uppercase tracking-wide">
                          {service.subtitle}
                        </p>
                      )}
                      <p className="text-base text-muted-foreground leading-relaxed font-light">
                        {service.description}
                      </p>
                    </div>

                    <div className="space-y-4 py-6">
                      {service.features.map((feature, featureIndex) => (
                        <div key={featureIndex} className="flex items-start gap-3">
                          <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0 shadow-sm" />
                          <span className="text-sm text-muted-foreground leading-relaxed">{feature}</span>
                        </div>
                      ))}
                    </div>

                    <div className="text-center pt-6 border-t border-border/50">
                      {service.price && (
                        <div className="text-3xl font-display font-bold text-primary mb-8 tracking-tight">
                          {service.price}
                        </div>
                      )}
                      <Button 
                        onClick={scrollToContact}
                        variant={service.is_highlighted ? "default" : "outline"}
                        className={`w-full rounded-full py-7 text-base font-semibold ${
                          service.is_highlighted 
                            ? "bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg" 
                            : "border-2 hover:bg-accent hover:border-primary/40"
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
        ) : (
          <div className="mb-24 px-4 sm:px-8">
            <Carousel
              opts={{
                align: "start",
                loop: true,
              }}
              className="w-full"
            >
              <CarouselContent className="-ml-4">
                {services.map((service, index) => {
                  const IconComponent = getIconComponent(service.icon);
                  return (
                    <CarouselItem key={service.id} className="pl-4 md:basis-1/2 lg:basis-1/3">
                      <Card 
                        className={`relative p-12 bg-white/90 backdrop-blur-sm border-0 elegant-shadow hover-lift group rounded-3xl h-full ${
                          service.is_highlighted ? 'ring-2 ring-primary/30' : ''
                        }`}
                      >
                        {service.is_highlighted && (
                          <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                            <div className="bg-primary text-primary-foreground px-5 py-2 rounded-full text-xs font-bold uppercase tracking-wider shadow-lg">
                              Mais Popular
                            </div>
                          </div>
                        )}
                        
                        <div className="space-y-7">
                          <div className="flex flex-col items-center text-center">
                            <div className="w-24 h-24 bg-gradient-to-br from-secondary to-accent rounded-2xl flex items-center justify-center mb-8 group-hover:from-primary/10 group-hover:to-primary/5 transition-all duration-500 shadow-sm">
                              <IconComponent className="h-12 w-12 text-primary" />
                            </div>
                            <h3 className="font-display font-bold text-3xl text-foreground mb-3 tracking-tight">
                              {service.title}
                            </h3>
                            {service.subtitle && (
                              <p className="text-sm text-primary font-semibold mb-4 uppercase tracking-wide">
                                {service.subtitle}
                              </p>
                            )}
                            <p className="text-base text-muted-foreground leading-relaxed font-light">
                              {service.description}
                            </p>
                          </div>

                          <div className="space-y-4 py-6">
                            {service.features.map((feature, featureIndex) => (
                              <div key={featureIndex} className="flex items-start gap-3">
                                <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0 shadow-sm" />
                                <span className="text-sm text-muted-foreground leading-relaxed">{feature}</span>
                              </div>
                            ))}
                          </div>

                          <div className="text-center pt-6 border-t border-border/50">
                            {service.price && (
                              <div className="text-3xl font-display font-bold text-primary mb-8 tracking-tight">
                                {service.price}
                              </div>
                            )}
                            <Button 
                              onClick={scrollToContact}
                              variant={service.is_highlighted ? "default" : "outline"}
                              className={`w-full rounded-full py-7 text-base font-semibold ${
                                service.is_highlighted 
                                  ? "bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg" 
                                  : "border-2 hover:bg-accent hover:border-primary/40"
                              }`}
                            >
                              Solicitar Orçamento
                            </Button>
                          </div>
                        </div>
                      </Card>
                    </CarouselItem>
                  );
                })}
              </CarouselContent>
              <CarouselPrevious className="hidden lg:flex -left-12" />
              <CarouselNext className="hidden lg:flex -right-12" />
            </Carousel>
          </div>
        )}

        <div className="text-center bg-gradient-to-br from-secondary/80 to-accent/60 backdrop-blur-sm rounded-3xl p-16 max-w-3xl mx-auto elegant-shadow">
          <p className="text-xl text-muted-foreground mb-10 leading-relaxed font-light">
            Precisa de algo personalizado? Criamos pacotes sob medida para suas necessidades.
          </p>
          <Button 
            onClick={scrollToContact} 
            size="lg" 
            className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full px-12 py-8 hover-lift shadow-lg text-base"
          >
            Falar com Especialista
          </Button>
        </div>
      </div>
    </section>
  );
}
