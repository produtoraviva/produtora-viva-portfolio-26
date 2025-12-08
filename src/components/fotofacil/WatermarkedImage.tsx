import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface WatermarkedImageProps {
  src: string;
  alt: string;
  className?: string;
  watermarkOpacity?: number;
  disableContextMenu?: boolean;
}

const WatermarkedImage = ({ 
  src, 
  alt, 
  className = '',
  watermarkOpacity = 0.4,
  disableContextMenu = true
}: WatermarkedImageProps) => {
  const [watermarkUrl, setWatermarkUrl] = useState<string | null>(null);

  useEffect(() => {
    loadWatermarkUrl();
  }, []);

  const loadWatermarkUrl = async () => {
    try {
      const { data } = await supabase
        .from('fotofacil_footer_settings')
        .select('setting_value')
        .eq('setting_key', 'watermark_url')
        .single();

      if (data?.setting_value) {
        setWatermarkUrl(data.setting_value);
      }
    } catch (error) {
      console.error('Error loading watermark URL:', error);
    }
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    if (disableContextMenu) {
      e.preventDefault();
    }
  };

  const handleDragStart = (e: React.DragEvent) => {
    if (disableContextMenu) {
      e.preventDefault();
    }
  };

  return (
    <div 
      className={`relative overflow-hidden select-none`}
      onContextMenu={handleContextMenu}
      style={{ userSelect: 'none' }}
    >
      <img 
        src={src}
        alt={alt}
        className={`${className} pointer-events-none`}
        style={{ userSelect: 'none' }}
        draggable={false}
        onDragStart={handleDragStart}
      />
      
      {/* Watermark overlay - tiled pattern */}
      {watermarkUrl && (
        <div 
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `url(${watermarkUrl})`,
            backgroundRepeat: 'repeat',
            backgroundSize: '120px auto',
            opacity: watermarkOpacity,
          }}
        />
      )}
    </div>
  );
};

export default WatermarkedImage;
