import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect } from "react";

const Hero = () => {
  const [heroImage, setHeroImage] = useState<string>("");
  const [heroOpacity, setHeroOpacity] = useState<number>(40);
  const [isLoading, setIsLoading] = useState(true);

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
          console.log('Homepage background loaded:', data[0].file_url);
          setHeroImage(data[0].file_url);
          setHeroOpacity(data[0].opacity || 40);
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

  return (
    <header id="hero" className="relative h-screen w-full flex flex-col justify-center items-center overflow-hidden">
      {/* Background Image */}
      {heroImage && (
        <div 
          className="absolute inset-0 z-0"
          style={{ opacity: heroOpacity / 100 }}
        >
          <img 
            src={heroImage}
            className="w-full h-full object-cover" 
            alt="Hero Background"
          />
        </div>
      )}

      {/* Main Content */}
      <div className="z-10 text-center space-y-4 px-4 reveal-text">
        <p className="text-xs md:text-sm font-mono text-muted-foreground uppercase tracking-[0.3em] mb-2">
          Fotografia & Cinema
        </p>
        <h1 className="text-6xl md:text-8xl lg:text-9xl font-bold tracking-tighter uppercase leading-none">
          Rubens
          <br />
          <span className="text-muted-foreground">Photofilm</span>
        </h1>
      </div>

      {/* Bottom Left Text */}
      <div className="absolute bottom-10 left-6 md:left-10 z-10 hidden md:block">
        <p className="text-xs text-muted-foreground max-w-xs leading-relaxed">
          Capturando a essência através de lentes. 
          <br />Especializado em casamentos, eventos e ensaios.
        </p>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-10 right-6 md:right-10 z-10">
        <div className="flex flex-col items-center space-y-2">
          <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground rotate-90 origin-center translate-y-4">
            Scroll
          </span>
        </div>
      </div>
    </header>
  );
};

export default Hero;
