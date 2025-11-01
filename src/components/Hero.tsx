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
    <section id="hero" className="relative min-h-screen flex items-center justify-center bg-gradient-to-b from-white to-secondary/30 overflow-hidden">
      {/* Elegant background pattern */}
      <div className="absolute inset-0 opacity-[0.02]">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, hsl(var(--dark)) 1.5px, transparent 1.5px)`,
          backgroundSize: '48px 48px'
        }} />
      </div>

      {/* Content */}
      <div className="container mx-auto px-6 sm:px-8 lg:px-16 relative z-10 py-32 md:py-40">
        <div className="max-w-5xl mx-auto text-center space-y-12">
          {/* Badge */}
          <div className="inline-flex items-center space-x-2 bg-white/80 backdrop-blur-sm rounded-full px-6 py-3 elegant-shadow animate-fade-in-up">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-sm font-semibold text-foreground tracking-wide">
              Fotografia & Videografia Profissional
            </span>
          </div>

          {/* Main Heading with elegant typography */}
          <div className="space-y-8 animate-fade-in-up">
            <h1 className="text-6xl sm:text-7xl lg:text-8xl xl:text-9xl font-display font-bold tracking-tighter leading-none">
              <span className="text-foreground">Capturamos</span>
              <br />
              <span className="gradient-text">Momentos Únicos</span>
            </h1>
            
            <p className="text-xl sm:text-2xl lg:text-3xl text-muted-foreground max-w-3xl mx-auto leading-relaxed font-light">
              Transformamos seus eventos especiais em memórias cinematográficas 
              que duram para sempre
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-5 justify-center items-center animate-slide-in-right">
            <Button 
              onClick={scrollToPortfolio}
              size="lg"
              className="bg-primary hover:bg-primary/90 text-primary-foreground text-base px-12 py-8 rounded-full hover-lift group transition-all shadow-lg"
            >
              Ver Portfolio
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button 
              onClick={scrollToContact}
              variant="outline"
              size="lg"
              className="text-base px-12 py-8 rounded-full border-2 hover:bg-accent transition-all shadow-sm"
            >
              Solicitar Orçamento
            </Button>
          </div>

          {/* Stats with refined styling */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 sm:gap-12 max-w-4xl mx-auto pt-12 animate-fade-in-delayed">
            <div className="text-center space-y-3">
              <div className="text-5xl sm:text-6xl font-display font-bold text-primary tracking-tighter">500+</div>
              <div className="text-sm text-muted-foreground font-semibold uppercase tracking-wider">Eventos</div>
            </div>
            <div className="text-center space-y-3">
              <div className="text-5xl sm:text-6xl font-display font-bold text-primary tracking-tighter">5</div>
              <div className="text-sm text-muted-foreground font-semibold uppercase tracking-wider">Anos</div>
            </div>
            <div className="text-center space-y-3">
              <div className="text-5xl sm:text-6xl font-display font-bold text-primary tracking-tighter">98%</div>
              <div className="text-sm text-muted-foreground font-semibold uppercase tracking-wider">Satisfação</div>
            </div>
            <div className="text-center space-y-3">
              <div className="text-5xl sm:text-6xl font-display font-bold text-primary tracking-tighter">24h</div>
              <div className="text-sm text-muted-foreground font-semibold uppercase tracking-wider">Resposta</div>
            </div>
          </div>
        </div>
      </div>

      {/* Elegant scroll indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-primary/30 rounded-full flex justify-center p-1">
          <div className="w-1.5 h-3 bg-primary rounded-full animate-pulse"></div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
