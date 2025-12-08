import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface Banner {
  id: string;
  title: string;
  image_url: string;
}

const FotoFacilBanner = () => {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    loadBanners();
  }, []);

  useEffect(() => {
    if (banners.length > 1) {
      const interval = setInterval(() => {
        setCurrentIndex(prev => (prev + 1) % banners.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [banners.length]);

  const loadBanners = async () => {
    const { data } = await supabase
      .from('fotofacil_banners')
      .select('*')
      .eq('is_active', true)
      .order('display_order');
    
    if (data && data.length > 0) {
      setBanners(data);
    }
  };

  if (banners.length === 0) {
    // Default gradient banner if no banners configured
    return (
      <div className="relative h-64 md:h-80 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 overflow-hidden">
        <div className="absolute inset-0 bg-black/20" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white px-4">
            <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-4">FOTOFÁCIL</h1>
            <p className="text-lg md:text-xl opacity-90">Encontre e compre suas fotos de eventos</p>
          </div>
        </div>
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full blur-3xl transform -translate-x-1/2 translate-y-1/2" />
      </div>
    );
  }

  return (
    <div className="relative h-64 md:h-80 overflow-hidden">
      {banners.map((banner, index) => (
        <div
          key={banner.id}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            index === currentIndex ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <img
            src={banner.image_url}
            alt={banner.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center text-white px-4">
              <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-4">FOTOFÁCIL</h1>
              <p className="text-lg md:text-xl opacity-90">{banner.title}</p>
            </div>
          </div>
        </div>
      ))}
      
      {/* Dots */}
      {banners.length > 1 && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
          {banners.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-2 h-2 rounded-full transition-all ${
                index === currentIndex ? 'bg-white w-6' : 'bg-white/50'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default FotoFacilBanner;