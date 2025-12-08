import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface Banner {
  id: string;
  title: string;
  image_url: string;
  slide_duration: number | null;
  opacity: number | null;
}

const FotoFacilBanner = () => {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [slideDuration, setSlideDuration] = useState(5000);

  useEffect(() => {
    loadBanners();
  }, []);

  useEffect(() => {
    if (banners.length > 1) {
      const interval = setInterval(() => {
        setCurrentIndex(prev => (prev + 1) % banners.length);
      }, slideDuration);
      return () => clearInterval(interval);
    }
  }, [banners.length, slideDuration]);

  const loadBanners = async () => {
    const { data } = await supabase
      .from('fotofacil_banners')
      .select('*')
      .eq('is_active', true)
      .order('display_order');
    
    if (data && data.length > 0) {
      setBanners(data);
      // Get slide duration from first banner or default to 5 seconds
      const duration = data[0]?.slide_duration || 5;
      setSlideDuration(duration * 1000);
    }
  };

  if (banners.length === 0) {
    // Default gradient banner if no banners configured
    return (
      <div className="relative h-80 md:h-[450px] lg:h-[500px] bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 overflow-hidden">
        <div className="absolute inset-0 bg-black/20" />
        {/* Zoom animation on default banner */}
        <div className="absolute inset-0 animate-[zoomIn_20s_ease-in-out_infinite_alternate]">
          <div className="w-full h-full bg-gradient-to-br from-emerald-500/30 to-teal-600/30" />
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white px-4">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-black tracking-tight mb-4 drop-shadow-lg">FOTOFÁCIL</h1>
            <p className="text-lg md:text-xl lg:text-2xl opacity-90 drop-shadow-md">Encontre e compre suas fotos de eventos</p>
          </div>
        </div>
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full blur-3xl transform -translate-x-1/2 translate-y-1/2" />
      </div>
    );
  }

  return (
    <div className="relative h-80 md:h-[450px] lg:h-[500px] overflow-hidden">
      {banners.map((banner, index) => {
        const opacity = banner.opacity ?? 1;
        return (
          <div
            key={banner.id}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === currentIndex ? 'opacity-100' : 'opacity-0'
            }`}
          >
            {/* Zoom effect on image */}
            <div 
              className="absolute inset-0 animate-[zoomIn_20s_ease-in-out_infinite_alternate]"
              style={{ opacity }}
            >
              <img
                src={banner.image_url}
                alt={banner.title}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center text-white px-4">
                <h1 className="text-4xl md:text-6xl lg:text-7xl font-black tracking-tight mb-4 drop-shadow-lg">FOTOFÁCIL</h1>
                <p className="text-lg md:text-xl lg:text-2xl opacity-90 drop-shadow-md">{banner.title}</p>
              </div>
            </div>
          </div>
        );
      })}
      
      {/* Navigation Dots */}
      {banners.length > 1 && (
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex gap-2">
          {banners.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`h-2 rounded-full transition-all duration-300 ${
                index === currentIndex ? 'bg-white w-8' : 'bg-white/50 w-2 hover:bg-white/70'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default FotoFacilBanner;