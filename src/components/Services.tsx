import React, { useState, useEffect } from 'react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === services.length - 1 ? 0 : prevIndex + 1
    );
  };

  const prevSlide = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? services.length - 1 : prevIndex - 1
    );
  };

  if (loading) {
    return (
      <section id="servicos" className="py-20 bg-background">
        <div className="container mx-auto px-4">
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
    <section id="servicos" className="py-20 lg:py-32 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <Badge variant="outline" className="mb-4 border-primary/30 text-primary">
            Serviços
          </Badge>
          <h2 className="text-4xl lg:text-6xl font-bold mb-6">
            Nossos <span className="bg-gradient-primary bg-clip-text text-transparent">Serviços</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Oferecemos serviços especializados para capturar seus momentos especiais 
            com a qualidade e profissionalismo que você merece.
          </p>
        </div>

        {/* Desktop: Grid Layout */}
        <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8 mb-16">
          {services.map((service) => {
            const IconComponent = getIconComponent(service.icon);
            return (
              <Card key={service.id} className={`relative p-6 bg-card border-border hover:bg-primary/5 transition-all duration-300 group ${service.is_highlighted ? 'ring-2 ring-primary/20 bg-primary/5' : ''}`}>
                {service.is_highlighted && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-gradient-primary text-dark">
                      Mais Popular
                    </Badge>
                  </div>
                )}
                
                <div className="space-y-4">
                  <div className="flex flex-col items-center text-center">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                      <IconComponent className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="font-bold text-xl text-foreground mb-1">
                      {service.title}
                    </h3>
                    {service.subtitle && (
                      <p className="text-sm text-primary font-medium mb-2">
                        {service.subtitle}
                      </p>
                    )}
                    <p className="text-sm text-muted-foreground text-center leading-relaxed">
                      {service.description}
                    </p>
                  </div>

                  <div className="space-y-2">
                    {service.features.map((feature, featureIndex) => (
                      <div key={featureIndex} className="flex items-center text-sm">
                        <div className="w-2 h-2 bg-primary rounded-full mr-3 flex-shrink-0" />
                        <span className="text-muted-foreground">{feature}</span>
                      </div>
                    ))}
                  </div>

                  <div className="text-center pt-4 border-t border-border">
                    <div className="text-lg font-bold text-primary mb-4">
                      {service.price || "Realizar orçamento"}
                    </div>
                    <Button 
                      onClick={scrollToContact}
                      variant={service.is_highlighted ? "default" : "outline"}
                      className={`w-full ${service.is_highlighted ? "bg-gradient-primary hover:opacity-90" : "border-primary/30 hover:bg-primary/10"}`}
                    >
                      Solicitar Orçamento
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Mobile: Carousel Layout */}
        <div className="md:hidden mb-16">
          <div className="relative">
            <div className="overflow-hidden">
              <div 
                className="flex transition-transform duration-300 ease-in-out"
                style={{ transform: `translateX(-${currentIndex * 100}%)` }}
              >
                {services.map((service) => {
                  const IconComponent = getIconComponent(service.icon);
                  return (
                    <div key={service.id} className="w-full flex-shrink-0 px-2">
                      <Card className={`relative p-6 bg-card border-border hover:bg-primary/5 transition-all duration-300 group ${service.is_highlighted ? 'ring-2 ring-primary/20 bg-primary/5' : ''}`}>
                        {service.is_highlighted && (
                          <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                            <Badge className="bg-gradient-primary text-dark">
                              Mais Popular
                            </Badge>
                          </div>
                        )}
                        
                        <div className="space-y-4">
                          <div className="flex flex-col items-center text-center">
                            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                              <IconComponent className="h-8 w-8 text-primary" />
                            </div>
                            <h3 className="font-bold text-xl text-foreground mb-1">
                              {service.title}
                            </h3>
                            {service.subtitle && (
                              <p className="text-sm text-primary font-medium mb-2">
                                {service.subtitle}
                              </p>
                            )}
                            <p className="text-sm text-muted-foreground text-center leading-relaxed">
                              {service.description}
                            </p>
                          </div>

                          <div className="space-y-2">
                            {service.features.map((feature, featureIndex) => (
                              <div key={featureIndex} className="flex items-center text-sm">
                                <div className="w-2 h-2 bg-primary rounded-full mr-3 flex-shrink-0" />
                                <span className="text-muted-foreground">{feature}</span>
                              </div>
                            ))}
                          </div>

                          <div className="text-center pt-4 border-t border-border">
                            <div className="text-lg font-bold text-primary mb-4">
                              {service.price}
                            </div>
                            <Button 
                              onClick={scrollToContact}
                              variant={service.is_highlighted ? "default" : "outline"}
                              className={`w-full ${service.is_highlighted ? "bg-gradient-primary hover:opacity-90" : "border-primary/30 hover:bg-primary/10"}`}
                            >
                              Solicitar Orçamento
                            </Button>
                          </div>
                        </div>
                      </Card>
                    </div>
                  );
                })}
              </div>
            </div>
            
            {services.length > 1 && (
              <>
                <Button
                  variant="outline"
                  size="icon"
                  className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-background/80 backdrop-blur-sm"
                  onClick={prevSlide}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                
                <Button
                  variant="outline"
                  size="icon"
                  className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-background/80 backdrop-blur-sm"
                  onClick={nextSlide}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>
          
          {services.length > 1 && (
            <div className="flex justify-center mt-4 gap-2">
              {services.map((_, index) => (
                <button
                  key={index}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index === currentIndex ? 'bg-primary' : 'bg-muted'
                  }`}
                  onClick={() => setCurrentIndex(index)}
                />
              ))}
            </div>
          )}
        </div>

        <div className="text-center">
          <p className="text-lg text-muted-foreground mb-6">
            Precisa de algo personalizado? Criamos pacotes sob medida para suas necessidades.
          </p>
          <Button onClick={scrollToContact} size="lg" className="bg-gradient-primary text-lg px-8 py-6 hover-scale">
            Falar com Especialista
          </Button>
        </div>
      </div>
    </section>
  );
}