import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect, useRef } from "react";
import { ChevronDown } from "lucide-react";

const Hero = () => {
  const [heroImage, setHeroImage] = useState<string>("");
  const [heroOpacity, setHeroOpacity] = useState<number>(100);
  const [isLoading, setIsLoading] = useState(true);
  const [scrollY, setScrollY] = useState(0);
  const heroRef = useRef<HTMLElement>(null);

  // Parallax effect on scroll
  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Fetch homepage backgrounds from database with direct query for reliability
  useEffect(() => {
    const loadBackground = async () => {
      try {
        setIsLoading(true);
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
          console.log('Homepage background loaded:', data[0].file_url, 'opacity:', data[0].opacity);
          setHeroImage(data[0].file_url);
          // Opacity from DB is 0-100, convert to 0-1 for CSS
          setHeroOpacity(data[0].opacity ?? 100);
        } else {
          console.log('No active homepage background found');
          setHeroImage("");
        }
      } catch (error) {
        console.error('Error loading homepage background:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadBackground();
  }, []);

  const scrollToContent = () => {
    const portfolioSection = document.getElementById('portfolio');
    if (portfolioSection) {
      portfolioSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Parallax transform - image moves slower than scroll
  const parallaxOffset = scrollY * 0.4;

  return (
    <header 
      ref={heroRef}
      id="hero" 
      className="relative h-screen w-full flex flex-col justify-center items-center overflow-hidden bg-background"
    >
      {/* Background Image with Parallax */}
      {heroImage && (
        <div 
          className="absolute inset-0"
          style={{ 
            transform: `translateY(${parallaxOffset}px) scale(1.1)`,
            transition: 'transform 0.1s ease-out',
            zIndex: 1
          }}
        >
          <img 
            src={heroImage}
            className="w-full h-full object-cover" 
            alt="Hero Background"
            style={{ opacity: heroOpacity / 100 }}
            onLoad={() => console.log('Hero image loaded, opacity:', heroOpacity)}
          />
        </div>
      )}
      
      {/* Dark overlay to ensure text readability if needed */}
      <div className="absolute inset-0 bg-background/30" style={{ zIndex: 2 }} />

      {/* Main Content */}
      <div className="relative text-center space-y-4 px-4 reveal-text" style={{ zIndex: 10 }}>
        <p className="text-xs md:text-sm font-mono text-muted-foreground uppercase tracking-[0.3em] mb-2 animate-fade-in-delayed">
          Fotografia & Cinema
        </p>
        <h1 className="text-6xl md:text-8xl lg:text-9xl font-bold tracking-tighter uppercase leading-none">
          <span className="block animate-fade-in" style={{ animationDelay: '0.2s' }}>Rubens</span>
          <span className="text-muted-foreground block animate-fade-in" style={{ animationDelay: '0.4s' }}>Photofilm</span>
        </h1>
      </div>

      {/* Bottom Left Text */}
      <div className="absolute bottom-10 left-6 md:left-10 hidden md:block animate-fade-in" style={{ animationDelay: '0.6s', zIndex: 10 }}>
        <p className="text-xs text-muted-foreground max-w-xs leading-relaxed">
          Capturando a essência através de lentes. 
          <br />Especializado em casamentos, eventos e ensaios.
        </p>
      </div>

      {/* Scroll Indicator with bouncing arrow */}
      <button 
        onClick={scrollToContent}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 group cursor-pointer animate-fade-in"
        style={{ animationDelay: '0.8s', zIndex: 10 }}
        aria-label="Scroll para baixo"
      >
        <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground group-hover:text-foreground transition-colors">
          Scroll
        </span>
        <ChevronDown className="h-6 w-6 text-muted-foreground group-hover:text-foreground animate-bounce transition-colors" />
      </button>
    </header>
  );
};

export default Hero;
