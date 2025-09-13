import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, X, Share2 } from "lucide-react";
import { useState, useEffect } from "react";

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

  const currentImage = images[currentIndex];

  useEffect(() => {
    setImageLoaded(false);
  }, [currentIndex]);

  const handlePrevious = () => {
    const newIndex = currentIndex > 0 ? currentIndex - 1 : images.length - 1;
    onIndexChange(newIndex);
  };

  const handleNext = () => {
    const newIndex = currentIndex < images.length - 1 ? currentIndex + 1 : 0;
    onIndexChange(newIndex);
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'ArrowLeft') handlePrevious();
    if (e.key === 'ArrowRight') handleNext();
    if (e.key === 'Escape') onClose();
  };

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, currentIndex]);


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
      <DialogContent className="max-w-7xl w-full h-[90vh] p-0 bg-dark border-0" hideClose>
        <div className="relative w-full h-full flex items-center justify-center bg-dark">
          {/* Close Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="absolute top-4 right-4 z-50 bg-black/50 hover:bg-black/70 text-white rounded-full"
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
                className="absolute left-4 top-1/2 transform -translate-y-1/2 z-40 bg-black/50 hover:bg-black/70 text-white rounded-full"
              >
                <ChevronLeft className="h-6 w-6" />
              </Button>
              
              <Button
                variant="ghost"
                size="icon"
                onClick={handleNext}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 z-40 bg-black/50 hover:bg-black/70 text-white rounded-full"
              >
                <ChevronRight className="h-6 w-6" />
              </Button>
            </>
          )}

          {/* Media Content */}
          <div className="relative w-full h-full flex items-center justify-center p-4">
            {!imageLoaded && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              </div>
            )}
            
            {currentImage.media_type === 'video' ? (
              <video
                src={currentImage.image}
                className={`w-full h-full object-contain transition-opacity duration-300 ${
                  imageLoaded ? 'opacity-100' : 'opacity-0'
                }`}
                controls
                autoPlay
                onLoadedData={() => setImageLoaded(true)}
                style={{ minHeight: '60vh', maxHeight: '85vh' }}
              />
            ) : (
              <img
                src={currentImage.image}
                alt={currentImage.title}
                className={`max-w-full max-h-full object-contain transition-opacity duration-300 ${
                  imageLoaded ? 'opacity-100' : 'opacity-0'
                }`}
                onLoad={() => setImageLoaded(true)}
              />
            )}
          </div>

          {/* Image Info */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
            <div className="flex items-center justify-between text-white">
              <div>
                <h3 className="text-xl font-semibold mb-1">{currentImage.title}</h3>
                <p className="text-sm text-white/80 mb-2">{currentImage.description}</p>
                <div className="flex space-x-2">
                  {currentImage.category && currentImage.category !== currentImage.id?.toString() && (
                    <span className="px-2 py-1 bg-primary/20 rounded text-xs capitalize">
                      {currentImage.category}
                    </span>
                  )}
                  {currentImage.subcategory && currentImage.subcategory !== currentImage.id?.toString() && (
                    <span className="px-2 py-1 bg-white/20 rounded text-xs capitalize">
                      {currentImage.subcategory}
                    </span>
                  )}
                </div>
              </div>
              
              {navigator.share && (
                <div className="flex space-x-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleShare}
                    className="bg-black/50 hover:bg-black/70 text-white rounded-full"
                  >
                    <Share2 className="h-5 w-5" />
                  </Button>
                </div>
              )}
            </div>
            
            {images.length > 1 && (
              <div className="flex justify-center mt-4">
                <span className="text-white/60 text-sm">
                  {currentIndex + 1} de {images.length}
                </span>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ImageModal;