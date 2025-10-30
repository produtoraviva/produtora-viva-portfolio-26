import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";

const Hero = () => {
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
    <section id="hero" className="relative min-h-[90vh] flex items-center justify-center bg-white overflow-hidden">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 opacity-[0.015]">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, hsl(var(--dark)) 1px, transparent 1px)`,
          backgroundSize: '40px 40px'
        }} />
      </div>

      {/* Content */}
      <div className="container mx-auto px-6 sm:px-8 lg:px-16 relative z-10 py-32 md:py-40">
        <div className="max-w-5xl mx-auto text-center space-y-12">
          {/* Badge */}
          <div className="inline-flex items-center space-x-2 bg-secondary rounded-full px-5 py-2.5 animate-fade-in-up">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-foreground tracking-wide">
              Fotografia & Videografia Profissional
            </span>
          </div>

          {/* Main Heading */}
          <div className="space-y-6 animate-fade-in-up">
            <h1 className="text-5xl sm:text-6xl lg:text-8xl font-bold tracking-tighter">
              <span className="text-foreground">Capturamos</span>
              <br />
              <span className="text-primary">Momentos Únicos</span>
            </h1>
            
            <p className="text-xl sm:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed font-light">
              Transformamos seus eventos especiais em memórias cinematográficas 
              que duram para sempre
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-slide-in-right">
            <Button 
              onClick={scrollToPortfolio}
              size="lg"
              className="bg-primary hover:bg-primary/90 text-primary-foreground text-base px-10 py-7 rounded-full hover-lift group transition-all"
            >
              Ver Portfolio
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button 
              onClick={scrollToContact}
              variant="outline"
              size="lg"
              className="text-base px-10 py-7 rounded-full border-2 hover:bg-accent transition-all"
            >
              Solicitar Orçamento
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 sm:gap-12 max-w-3xl mx-auto pt-8 animate-fade-in-delayed">
            <div className="text-center space-y-2">
              <div className="text-4xl sm:text-5xl font-bold text-primary tracking-tight">500+</div>
              <div className="text-sm text-muted-foreground font-medium">Eventos</div>
            </div>
            <div className="text-center space-y-2">
              <div className="text-4xl sm:text-5xl font-bold text-primary tracking-tight">5</div>
              <div className="text-sm text-muted-foreground font-medium">Anos</div>
            </div>
            <div className="text-center space-y-2">
              <div className="text-4xl sm:text-5xl font-bold text-primary tracking-tight">98%</div>
              <div className="text-sm text-muted-foreground font-medium">Satisfação</div>
            </div>
            <div className="text-center space-y-2">
              <div className="text-4xl sm:text-5xl font-bold text-primary tracking-tight">24h</div>
              <div className="text-sm text-muted-foreground font-medium">Resposta</div>
            </div>
          </div>
        </div>
      </div>

      {/* Subtle scroll indicator */}
      <div className="absolute bottom-12 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border border-border rounded-full flex justify-center p-1">
          <div className="w-1 h-2 bg-primary rounded-full animate-pulse"></div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
