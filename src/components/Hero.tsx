import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Play, Camera, Award } from "lucide-react";
import { Logo } from './Logo';
import { supabase } from "@/integrations/supabase/client";

const Hero = () => {
  const [currentBackground, setCurrentBackground] = useState<string | null>(null);
  const [backgroundOpacity, setBackgroundOpacity] = useState(0.6);

  useEffect(() => {
    loadHomepageBackground();
  }, []);

  const loadHomepageBackground = async () => {
    try {
      const { data, error } = await supabase
        .from('homepage_backgrounds')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true })
        .limit(1);

      if (error) {
        console.error('Error loading homepage background:', error);
        return;
      }

      if (data && data.length > 0) {
        setCurrentBackground(data[0].file_url);
        setBackgroundOpacity(data[0].opacity || 0.6);
      } else {
        // Use a default gradient background if no images are set
        setCurrentBackground(null);
      }
    } catch (error) {
      console.error('Error loading homepage background:', error);
    }
  };

  const scrollToPortfolio = () => {
    const element = document.querySelector("#portfolio");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  const scrollToContact = () => {
    const element = document.querySelector("#contact");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section id="hero" className="min-h-screen relative flex items-center justify-center overflow-hidden">
      {/* Background Image or Gradient */}
      <div className="absolute inset-0">
        {currentBackground ? (
          <img
            src={currentBackground}
            alt="Fotografia profissional de eventos"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-background via-secondary/30 to-primary/20" />
        )}
        <div className="absolute inset-0" style={{ backgroundColor: `rgba(0, 0, 0, ${backgroundOpacity})` }}></div>
      </div>
      
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 25% 25%, hsl(var(--gold)) 1px, transparent 1px)`,
          backgroundSize: '50px 50px'
        }} />
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 pt-32 sm:pt-36 md:pt-0">
        <div className="text-center max-w-4xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center space-x-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-2 mb-8 animate-fade-in-up">
            <Award className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-primary">
              Fotografia & Videografia Profissional
            </span>
          </div>

          {/* Main Heading */}
          <h1 className="text-3xl sm:text-5xl lg:text-7xl font-bold mb-6 animate-fade-in-up leading-tight">
            <span className="text-foreground">Capturamos </span>
            <span className="bg-gradient-primary bg-clip-text text-transparent">
              Momentos
            </span>
            <br />
            <span className="text-foreground">Criamos </span>
            <span className="bg-gradient-primary bg-clip-text text-transparent">
              Memórias
            </span>
          </h1>
          
          {/* Logo under title */}
          <div className="mb-2 mt-2 animate-fade-in-delayed flex justify-center">
            <Logo size="xl" className="opacity-90 brightness-0 invert" />
          </div>

          {/* Subtitle */}
          <p className="text-lg sm:text-xl lg:text-2xl text-muted-foreground mb-10 sm:mb-12 max-w-3xl mx-auto leading-relaxed animate-fade-in-delayed px-4 sm:px-0">
            Especializados em casamentos, aniversários e eventos únicos em Foz do Iguaçu e Ciudad del Este. 
            Transformamos seus momentos especiais em obras de arte cinematográficas.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16 animate-slide-in-right">
            <Button 
              onClick={scrollToPortfolio}
              size="lg"
              className="bg-gradient-primary text-lg px-8 py-6 hover-scale group"
            >
              <Camera className="mr-2 h-5 w-5 group-hover:rotate-12 transition-transform" />
              Ver Portfolio
            </Button>
            <Button 
              onClick={scrollToContact}
              variant="outline"
              size="lg"
              className="text-lg px-8 py-6 border-primary/30 hover:bg-primary/10 hover-scale group"
            >
              <Play className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" />
              Solicitar Orçamento
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-8 max-w-2xl mx-auto animate-fade-in-delayed">
            <div className="text-center p-3">
              <div className="text-2xl sm:text-3xl font-bold text-primary mb-1">500+</div>
              <div className="text-xs sm:text-sm text-muted-foreground">Eventos</div>
            </div>
            <div className="text-center p-3">
              <div className="text-2xl sm:text-3xl font-bold text-primary mb-1">5</div>
              <div className="text-xs sm:text-sm text-muted-foreground">Anos</div>
            </div>
            <div className="text-center p-3">
              <div className="text-2xl sm:text-3xl font-bold text-primary mb-1">98%</div>
              <div className="text-xs sm:text-sm text-muted-foreground">Satisfação</div>
            </div>
            <div className="text-center p-3">
              <div className="text-2xl sm:text-3xl font-bold text-primary mb-1">24h</div>
              <div className="text-xs sm:text-sm text-muted-foreground">Resposta</div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-primary/30 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-primary rounded-full mt-2 animate-pulse"></div>
        </div>
      </div>
    </section>
  );
};

export default Hero;