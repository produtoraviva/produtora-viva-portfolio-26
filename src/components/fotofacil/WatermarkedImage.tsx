import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface WatermarkedImageProps {
  src: string;
  alt: string;
  className?: string;
  watermarkOpacity?: number;
  onClick?: () => void;
  loading?: 'lazy' | 'eager';
}

const WatermarkedImage = ({ 
  src, 
  alt, 
  className = '', 
  watermarkOpacity = 0.4,
  onClick,
  loading = 'lazy'
}: WatermarkedImageProps) => {
  const [watermarkUrl, setWatermarkUrl] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadWatermark();
  }, []);

  const loadWatermark = async () => {
    try {
      const { data } = await supabase
        .from('fotofacil_footer_settings')
        .select('setting_value')
        .eq('setting_key', 'watermark_url')
        .maybeSingle();
      
      if (data?.setting_value) {
        setWatermarkUrl(data.setting_value);
      }
    } catch (error) {
      console.error('Error loading watermark:', error);
    }
  };

  // Prevent right-click and drag
  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    return false;
  };

  const handleDragStart = (e: React.DragEvent) => {
    e.preventDefault();
    return false;
  };

  return (
    <div 
      ref={containerRef}
      className={`relative overflow-hidden select-none ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick}
      onContextMenu={handleContextMenu}
      style={{ userSelect: 'none', WebkitUserSelect: 'none' }}
    >
      {/* Main Image */}
      <img 
        src={src}
        alt={alt}
        className={`${className} pointer-events-none`}
        loading={loading}
        draggable={false}
        onDragStart={handleDragStart}
        onContextMenu={handleContextMenu}
        style={{ 
          userSelect: 'none', 
          WebkitUserSelect: 'none',
          pointerEvents: 'none'
        }}
      />
      
      {/* Watermark Overlay - Multiple tiled watermarks */}
      {watermarkUrl && (
        <div 
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `url(${watermarkUrl})`,
            backgroundRepeat: 'repeat',
            backgroundSize: '30% auto',
            backgroundPosition: 'center center',
            opacity: watermarkOpacity,
            mixBlendMode: 'multiply',
            userSelect: 'none',
            WebkitUserSelect: 'none'
          }}
          onContextMenu={handleContextMenu}
          onDragStart={handleDragStart}
        />
      )}

      {/* Additional protection layer - transparent overlay */}
      <div 
        className="absolute inset-0 pointer-events-auto"
        onContextMenu={handleContextMenu}
        onDragStart={handleDragStart}
        style={{ 
          userSelect: 'none', 
          WebkitUserSelect: 'none',
          background: 'transparent'
        }}
      />
    </div>
  );
};

export default WatermarkedImage;