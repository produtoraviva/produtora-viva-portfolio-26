import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect, useRef } from "react";
import { useSiteConfig } from "@/hooks/useSiteConfig";

const Hero = () => {
  const [heroImage, setHeroImage] = useState<string>("");
  const [heroOpacity, setHeroOpacity] = useState<number>(100);
  const [isLoading, setIsLoading] = useState(true);
  const [scrollY, setScrollY] = useState(0);
  const heroRef = useRef<HTMLElement>(null);
  const { config, loading: configLoading } = useSiteConfig();

  // Zoom effect on scroll
  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Fetch homepage backgrounds from database
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
          // Opacity from DB: if 0-1 scale, convert to percentage. If already 0-100, use as is.
          const dbOpacity = data[0].opacity;
          let finalOpacity = 100;
          
          if (dbOpacity !== null && dbOpacity !== undefined) {
            if (dbOpacity <= 1) {
              // 0-1 scale, convert to 0-100
              finalOpacity = dbOpacity * 100;
            } else {
              // Already 0-100 scale
              finalOpacity = dbOpacity;
            }
          }
          
          // Ensure we have at least some visibility
          if (finalOpacity === 0) finalOpacity = 100;
          
          console.log('Homepage background loaded:', data[0].file_url, 'opacity:', finalOpacity);
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

  // Zoom effect - stronger on mobile for better visibility
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
  const zoomMultiplier = isMobile ? 0.0008 : 0.0003; // Stronger zoom on mobile
  const maxZoom = isMobile ? 0.4 : 0.2;
  const zoomScale = 1 + Math.min(scrollY * zoomMultiplier, maxZoom);

  return (
    <header 
      ref={heroRef}
      id="hero" 
      className="relative h-screen w-full flex flex-col justify-center items-center overflow-hidden bg-background"
    >
      {/* Background Image with Zoom Effect */}
      {heroImage && (
        <div 
          className="absolute inset-0 z-0 will-change-transform"
          style={{ 
            transform: `scale(${zoomScale})`,
            transformOrigin: 'center center',
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
      
      {/* Subtle overlay for text readability */}
      <div 
        className="absolute inset-0 pointer-events-none z-[1]" 
        style={{ 
          background: 'linear-gradient(to bottom, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.1) 50%, rgba(0,0,0,0.3) 100%)'
        }} 
      />

      {/* Main Content */}
      <div className="relative text-center space-y-4 px-4 z-10">
        <p className="text-xs md:text-sm font-mono text-white/80 uppercase tracking-[0.3em] mb-2">
          Fotografia & Cinema
        </p>
        {/* Show logo or company name - never show text when logo is loading */}
        {configLoading ? (
          <div className="h-24 md:h-32 lg:h-40" /> // Placeholder height to prevent layout shift
        ) : config.logo_url ? (
          <img 
            src={config.logo_url} 
            alt={config.company_name} 
            className="h-24 md:h-32 lg:h-40 mx-auto"
          />
        ) : (
          <h1 className="text-6xl md:text-8xl lg:text-9xl font-bold tracking-tighter uppercase leading-none text-white">
            {config.company_name ? (
              <>
                <span className="block">{config.company_name.split(' ')[0]}</span>
                <span className="text-white/70 block">{config.company_name.split(' ').slice(1).join(' ')}</span>
              </>
            ) : (
              <>
                <span className="block">Rubens</span>
                <span className="text-white/70 block">Photofilm</span>
              </>
            )}
          </h1>
        )}
      </div>

      {/* Bottom Left Text */}
      <div className="absolute bottom-10 left-6 md:left-10 hidden md:block z-10">
        <p className="text-xs text-white/60 max-w-xs leading-relaxed">
          Capturando a essência através de lentes. 
          <br />Especializado em casamentos, eventos e ensaios.
        </p>
      </div>

      {/* Mouse Scroll Indicator */}
      <button 
        onClick={scrollToContent}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 group cursor-pointer z-10"
        aria-label="Scroll para baixo"
      >
        <div className="relative w-6 h-10 border-2 border-white/40 rounded-full flex items-start justify-center p-1 group-hover:border-white/70 transition-colors">
          <div className="w-1 h-2 bg-white/60 rounded-full animate-scroll-mouse group-hover:bg-white transition-colors" />
        </div>
        <span className="text-[10px] uppercase tracking-[0.2em] text-white/50 group-hover:text-white/80 transition-colors">
          Scroll
        </span>
      </button>
    </header>
  );
};

export default Hero;
