import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Check, ShoppingCart, Share2, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useFotoFacilCart } from '@/contexts/FotoFacilCartContext';
import { toast } from 'sonner';
import FotoFacilFloatingCartButton from './FotoFacilFloatingCartButton';

interface Photo {
  id: string;
  title: string | null;
  url: string;
  thumb_url: string | null;
  price_cents: number | null;
}

interface FotoFacilPhotoGridProps {
  eventId: string;
  eventTitle?: string;
  defaultPriceCents: number;
}

const FotoFacilPhotoGrid = ({ eventId, eventTitle, defaultPriceCents }: FotoFacilPhotoGridProps) => {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number | null>(null);
  const { addItem, removeItem, isInCart } = useFotoFacilCart();

  useEffect(() => {
    loadPhotos();
  }, [eventId]);

  const loadPhotos = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('fotofacil_photos')
        .select('*')
        .eq('event_id', eventId)
        .eq('is_active', true)
        .order('display_order');

      if (error) throw error;
      setPhotos(data || []);
    } catch (error) {
      console.error('Error loading photos:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (cents: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(cents / 100);
  };

  const getPhotoPrice = (photo: Photo) => {
    return photo.price_cents ?? defaultPriceCents;
  };

  const handleToggleCart = (photo: Photo, e?: React.MouseEvent) => {
    e?.stopPropagation();
    const priceCents = getPhotoPrice(photo);
    
    if (isInCart(photo.id)) {
      removeItem(photo.id);
      toast.success('Foto removida do carrinho');
    } else {
      addItem({
        photoId: photo.id,
        eventId,
        eventTitle: eventTitle || 'Evento',
        title: photo.title || 'Foto',
        thumbUrl: photo.thumb_url || photo.url,
        priceCents
      });
      toast.success('Foto adicionada ao carrinho!');
    }
  };

  const handleShare = async (photo: Photo, e?: React.MouseEvent) => {
    e?.stopPropagation();
    const shareUrl = window.location.href;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: photo.title || 'Confira esta foto!',
          text: 'Veja esta foto incrível no FOTOFÁCIL',
          url: shareUrl
        });
      } catch (err) {
        // User cancelled or error
      }
    } else {
      await navigator.clipboard.writeText(shareUrl);
      toast.success('Link copiado!');
    }
  };

  const navigatePhoto = (direction: 'prev' | 'next') => {
    if (selectedPhotoIndex === null) return;
    
    if (direction === 'prev' && selectedPhotoIndex > 0) {
      setSelectedPhotoIndex(selectedPhotoIndex - 1);
    } else if (direction === 'next' && selectedPhotoIndex < photos.length - 1) {
      setSelectedPhotoIndex(selectedPhotoIndex + 1);
    }
  };

  const selectedPhoto = selectedPhotoIndex !== null ? photos[selectedPhotoIndex] : null;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-gray-300 border-t-gray-900"></div>
      </div>
    );
  }

  if (photos.length === 0) {
    return (
      <div className="text-center py-20 text-gray-500">
        <p className="text-lg">Nenhuma foto disponível neste evento.</p>
      </div>
    );
  }

  return (
    <div>
      {/* Photos Grid - Closer spacing */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-1.5 md:gap-2">
        {photos.map((photo, index) => {
          const inCart = isInCart(photo.id);
          const price = getPhotoPrice(photo);

          return (
            <div 
              key={photo.id}
              className="group relative bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all duration-300"
            >
              {/* Photo */}
              <div 
                className="aspect-square bg-gray-100 overflow-hidden cursor-pointer"
                onClick={() => setSelectedPhotoIndex(index)}
              >
                <img 
                  src={photo.thumb_url || photo.url}
                  alt={photo.title || 'Foto'}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>

              {/* Add/Remove Button Overlay */}
              <button
                onClick={(e) => handleToggleCart(photo, e)}
                className={`absolute top-2 right-2 w-9 h-9 rounded-full flex items-center justify-center transition-all shadow-md ${
                  inCart 
                    ? 'bg-emerald-500 text-white' 
                    : 'bg-white/95 text-gray-700 hover:bg-gray-900 hover:text-white'
                }`}
              >
                {inCart ? <Check className="w-4 h-4" /> : <ShoppingCart className="w-4 h-4" />}
              </button>

              {/* Price & Info */}
              <div className="p-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900">
                      {formatPrice(price)}
                    </p>
                    <p className="text-xs text-gray-400">ID: {photo.id.slice(0, 8)}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e) => handleToggleCart(photo, e)}
                      className={`p-2 rounded-lg transition-all ${
                        inCart 
                          ? 'bg-emerald-500 text-white' 
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-900 hover:text-white'
                      }`}
                    >
                      {inCart ? <Check className="w-4 h-4" /> : <ShoppingCart className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={(e) => handleShare(photo, e)}
                      className="p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-lg bg-gray-50"
                    >
                      <Share2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                {photo.title && (
                  <p className="text-xs text-gray-500 truncate mt-1">{photo.title}</p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Photo Modal */}
      {selectedPhoto && (
        <div 
          className="fixed inset-0 z-50 bg-black/95 flex flex-col"
          onClick={() => setSelectedPhotoIndex(null)}
        >
          {/* Floating Cart Button - Light mode when modal is open */}
          <FotoFacilFloatingCartButton lightMode />

          {/* Close Button */}
          <button
            onClick={() => setSelectedPhotoIndex(null)}
            className="absolute top-4 right-4 z-10 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 rounded-full w-10 h-10 flex items-center justify-center transition-all"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Navigation Arrows */}
          {selectedPhotoIndex > 0 && (
            <button
              onClick={(e) => { e.stopPropagation(); navigatePhoto('prev'); }}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-10 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 rounded-full w-12 h-12 flex items-center justify-center transition-all"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
          )}
          {selectedPhotoIndex < photos.length - 1 && (
            <button
              onClick={(e) => { e.stopPropagation(); navigatePhoto('next'); }}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-10 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 rounded-full w-12 h-12 flex items-center justify-center transition-all"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          )}

          {/* Image Container - with space for bottom bar */}
          <div 
            className="flex-1 flex items-center justify-center p-4" 
            onClick={e => e.stopPropagation()}
          >
            <div className="relative max-w-full max-h-[calc(100vh-120px)] flex flex-col items-center">
              <img 
                src={selectedPhoto.url}
                alt={selectedPhoto.title || 'Foto'}
                className="max-w-full max-h-[calc(100vh-180px)] object-contain rounded-t-xl"
              />
              
              {/* Bottom Info Bar - Attached to image */}
              <div className="w-full bg-white rounded-b-xl p-4 md:p-5">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-4 text-center sm:text-left">
                    <div>
                      <p className="font-semibold text-gray-900">{selectedPhoto.title || 'Foto'}</p>
                      <p className="text-xs text-gray-500">ID: {selectedPhoto.id.slice(0, 8)}</p>
                      <p className="text-xl font-bold text-emerald-600">{formatPrice(getPhotoPrice(selectedPhoto))}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleShare(selectedPhoto)}
                      className="border-gray-300 text-gray-700 hover:text-gray-900 rounded-xl"
                    >
                      <Share2 className="w-4 h-4 mr-2" />
                      <span className="text-gray-700">Compartilhar</span>
                    </Button>
                    
                    <Button
                      onClick={() => handleToggleCart(selectedPhoto)}
                      className={`rounded-xl ${isInCart(selectedPhoto.id) 
                        ? 'bg-emerald-500 hover:bg-emerald-600' 
                        : 'bg-gray-900 hover:bg-gray-800'
                      } text-white`}
                    >
                      {isInCart(selectedPhoto.id) ? (
                        <>
                          <Check className="w-4 h-4 mr-2" />
                          No carrinho
                        </>
                      ) : (
                        <>
                          <ShoppingCart className="w-4 h-4 mr-2" />
                          Adicionar
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Photo Counter */}
          <div className="absolute top-4 left-4 text-white/80 text-sm bg-white/10 px-3 py-1 rounded-full">
            {selectedPhotoIndex + 1} / {photos.length}
          </div>
        </div>
      )}
    </div>
  );
};

export default FotoFacilPhotoGrid;
