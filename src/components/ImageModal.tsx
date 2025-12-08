import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, X, Share2 } from "lucide-react";
import { useState, useEffect, useCallback, useRef } from "react";

interface ImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  images: Array<{
    id: string | number;
    image: string;
    title: string;
    description: string;
    category: string;
    subcategory: string;
    media_type?: 'photo' | 'video';
  }>;
  currentIndex: number;
  onIndexChange: (index: number) => void;
}

const ImageModal = ({ isOpen, onClose, images, currentIndex, onIndexChange }: ImageModalProps) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const currentImage = images[currentIndex];

  // Handle smooth open/close animation
  useEffect(() => {
    if (isOpen) {
      // Small delay before showing to allow mounting, prevents displacement
      const timeout = setTimeout(() => {
        setIsVisible(true);
      }, 50);
      return () => clearTimeout(timeout);
    } else {
      setIsVisible(false);
    }
  }, [isOpen]);

  useEffect(() => {
    setImageLoaded(false);
  }, [currentIndex]);

  const handlePrevious = useCallback(() => {
    const newIndex = currentIndex > 0 ? currentIndex - 1 : images.length - 1;
    onIndexChange(newIndex);
  }, [currentIndex, images.length, onIndexChange]);

  const handleNext = useCallback(() => {
    const newIndex = currentIndex < images.length - 1 ? currentIndex + 1 : 0;
    onIndexChange(newIndex);
  }, [currentIndex, images.length, onIndexChange]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') handlePrevious();
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, handlePrevious, handleNext, onClose]);

  const handleShare = async () => {
    if (navigator.share && currentImage) {
      try {
        await navigator.share({
          title: currentImage.title,
          text: currentImage.description,
          url: window.location.href
        });
      } catch (err) {
        console.log('Erro ao compartilhar:', err);
      }
    }
  };

  if (!currentImage) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className="max-w-[95vw] w-full max-h-[95vh] h-auto p-0 bg-background border-0 overflow-hidden" 
        hideClose
      >
        <div 
          className={`relative w-full h-full flex flex-col bg-background transition-all duration-300 ease-out ${
            isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
          }`}
        >
          {/* Close Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="absolute top-4 right-4 z-50 bg-background/80 hover:bg-background text-foreground"
          >
            <X className="h-6 w-6" />
          </Button>

          {/* Navigation Buttons */}
          {images.length > 1 && (
            <>
              <Button
                variant="ghost"
                size="icon"
                onClick={handlePrevious}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 z-40 bg-background/80 hover:bg-background text-foreground"
              >
                <ChevronLeft className="h-6 w-6" />
              </Button>
              
              <Button
                variant="ghost"
                size="icon"
                onClick={handleNext}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 z-40 bg-background/80 hover:bg-background text-foreground"
              >
                <ChevronRight className="h-6 w-6" />
              </Button>
            </>
          )}

          {/* Media Content - in foreground with proper z-index */}
          <div className="relative flex-1 flex items-center justify-center p-4 md:p-8 z-30">
            {!imageLoaded && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-foreground"></div>
              </div>
            )}
            
            {currentImage.media_type === 'video' ? (
              <video
                ref={videoRef}
                key={currentImage.id}
                src={currentImage.image}
                className={`max-w-full max-h-[65vh] w-auto h-auto object-contain transition-opacity duration-300 relative z-30 ${
                  imageLoaded ? 'opacity-100' : 'opacity-0'
                }`}
                controls
                controlsList="nodownload"
                onLoadedData={() => setImageLoaded(true)}
                autoPlay={false}
                preload="metadata"
              />
            ) : (
              <img
                key={currentImage.id}
                src={currentImage.image}
                alt={currentImage.title}
                className={`max-w-full max-h-[65vh] w-auto h-auto object-contain transition-opacity duration-300 ${
                  imageLoaded ? 'opacity-100' : 'opacity-0'
                }`}
                onLoad={() => setImageLoaded(true)}
              />
            )}
          </div>

          {/* Image Info - no gradient, simple background */}
          <div className="relative z-20 bg-background p-4 md:p-6 border-t border-border">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-foreground">
              <div>
                <h3 className="text-lg md:text-xl font-semibold mb-1">{currentImage.title}</h3>
                {currentImage.description && (
                  <p className="text-sm text-muted-foreground mb-2">{currentImage.description}</p>
                )}
                <div className="flex flex-wrap gap-2">
                  {currentImage.category && currentImage.category !== currentImage.id?.toString() && currentImage.category.trim() !== '' && (
                    <span className="px-2 py-1 bg-foreground/10 text-xs capitalize">
                      {currentImage.category}
                    </span>
                  )}
                  {currentImage.subcategory && currentImage.subcategory !== currentImage.id?.toString() && currentImage.subcategory.trim() !== '' && (
                    <span className="px-2 py-1 bg-foreground/10 text-xs capitalize">
                      {currentImage.subcategory}
                    </span>
                  )}
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                {navigator.share && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleShare}
                    className="bg-background/80 hover:bg-background text-foreground"
                  >
                    <Share2 className="h-5 w-5" />
                  </Button>
                )}
                
                {images.length > 1 && (
                  <span className="text-muted-foreground text-sm">
                    {currentIndex + 1} de {images.length}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ImageModal;
