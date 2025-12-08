import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect, useRef } from "react";
import { ChevronDown } from "lucide-react";
import { useSiteConfig } from "@/hooks/useSiteConfig";

const Hero = () => {
  const [heroImage, setHeroImage] = useState<string>("");
  const [heroOpacity, setHeroOpacity] = useState<number>(100);
  const [isLoading, setIsLoading] = useState(true);
  const [scrollY, setScrollY] = useState(0);
  const heroRef = useRef<HTMLElement>(null);
  const { config } = useSiteConfig();

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
          setHeroImage(data[0].file_url);
          // Opacity from DB is 0-1 (decimal), convert to percentage
          // If opacity is 0 or null, default to 100% (fully visible)
          const dbOpacity = data[0].opacity;
          const finalOpacity = dbOpacity === 0 || dbOpacity === null ? 100 : 
                               (dbOpacity <= 1 ? dbOpacity * 100 : dbOpacity);
          console.log('Homepage background loaded:', data[0].file_url, 'raw opacity:', dbOpacity, 'final:', finalOpacity);
          setHeroOpacity(finalOpacity);
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
      {/* Background Image with Parallax - Full opacity by default */}
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
          />
        </div>
      )}
      
      {/* Subtle overlay only for text readability - not blocking image */}
      <div 
        className="absolute inset-0 pointer-events-none" 
        style={{ 
          zIndex: 2,
          background: 'linear-gradient(to bottom, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.1) 50%, rgba(0,0,0,0.3) 100%)'
        }} 
      />

      {/* Main Content */}
      <div className="relative text-center space-y-4 px-4" style={{ zIndex: 10 }}>
        <p className="text-xs md:text-sm font-mono text-muted-foreground uppercase tracking-[0.3em] mb-2">
          Fotografia & Cinema
        </p>
        {config.logo_url ? (
          <img 
            src={config.logo_url} 
            alt={config.company_name} 
            className="h-24 md:h-32 lg:h-40 mx-auto"
          />
        ) : (
          <h1 className="text-6xl md:text-8xl lg:text-9xl font-bold tracking-tighter uppercase leading-none">
            {config.company_name ? (
              <>
                <span className="block">{config.company_name.split(' ')[0]}</span>
                <span className="text-muted-foreground block">{config.company_name.split(' ').slice(1).join(' ')}</span>
              </>
            ) : (
              <>
                <span className="block">Rubens</span>
                <span className="text-muted-foreground block">Photofilm</span>
              </>
            )}
          </h1>
        )}
      </div>

      {/* Bottom Left Text */}
      <div className="absolute bottom-10 left-6 md:left-10 hidden md:block" style={{ zIndex: 10 }}>
        <p className="text-xs text-muted-foreground max-w-xs leading-relaxed">
          Capturando a essência através de lentes. 
          <br />Especializado em casamentos, eventos e ensaios.
        </p>
      </div>

      {/* Scroll Indicator with bouncing arrow */}
      <button 
        onClick={scrollToContent}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 group cursor-pointer"
        style={{ zIndex: 10 }}
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
