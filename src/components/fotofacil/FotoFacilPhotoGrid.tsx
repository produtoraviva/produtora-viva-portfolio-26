import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Check, Plus, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useFotoFacilCart } from '@/contexts/FotoFacilCartContext';
import { Link } from 'react-router-dom';

interface Photo {
  id: string;
  title: string | null;
  url: string;
  thumb_url: string | null;
  price_cents: number | null;
}

interface FotoFacilPhotoGridProps {
  eventId: string;
  defaultPriceCents: number;
}

const FotoFacilPhotoGrid = ({ eventId, defaultPriceCents }: FotoFacilPhotoGridProps) => {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const { addItem, removeItem, isInCart, itemCount } = useFotoFacilCart();

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

  const handleToggleCart = (photo: Photo) => {
    const priceCents = getPhotoPrice(photo);
    
    if (isInCart(photo.id)) {
      removeItem(photo.id);
    } else {
      addItem({
        photoId: photo.id,
        eventId,
        title: photo.title || 'Foto',
        thumbUrl: photo.thumb_url || photo.url,
        priceCents
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
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
      {/* Cart Floating Button */}
      {itemCount > 0 && (
        <div className="fixed bottom-6 right-6 z-50">
          <Link to="/fotofacil/carrinho">
            <Button size="lg" className="bg-gray-900 hover:bg-gray-800 text-white shadow-lg">
              <ShoppingCart className="w-5 h-5 mr-2" />
              Ver Carrinho ({itemCount})
            </Button>
          </Link>
        </div>
      )}

      {/* Photos Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {photos.map(photo => {
          const inCart = isInCart(photo.id);
          const price = getPhotoPrice(photo);

          return (
            <div 
              key={photo.id}
              className="group relative bg-white border border-gray-200 rounded-lg overflow-hidden"
            >
              {/* Photo */}
              <div 
                className="aspect-square bg-gray-100 cursor-pointer overflow-hidden"
                onClick={() => setSelectedPhoto(photo)}
              >
                <img 
                  src={photo.thumb_url || photo.url}
                  alt={photo.title || 'Foto'}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>

              {/* Add/Remove Button Overlay */}
              <button
                onClick={() => handleToggleCart(photo)}
                className={`absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                  inCart 
                    ? 'bg-green-500 text-white' 
                    : 'bg-white/90 text-gray-700 hover:bg-gray-900 hover:text-white'
                }`}
              >
                {inCart ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              </button>

              {/* Price */}
              <div className="p-3">
                <p className="text-sm font-semibold text-gray-900">
                  {formatPrice(price)}
                </p>
                {photo.title && (
                  <p className="text-xs text-gray-500 truncate">{photo.title}</p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Photo Modal */}
      {selectedPhoto && (
        <div 
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setSelectedPhoto(null)}
        >
          <div className="relative max-w-4xl w-full" onClick={e => e.stopPropagation()}>
            <img 
              src={selectedPhoto.url}
              alt={selectedPhoto.title || 'Foto'}
              className="w-full h-auto max-h-[80vh] object-contain rounded-lg"
            />
            <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between bg-white/95 rounded-lg p-4">
              <div>
                <p className="font-semibold">{selectedPhoto.title || 'Foto'}</p>
                <p className="text-lg font-bold">{formatPrice(getPhotoPrice(selectedPhoto))}</p>
              </div>
              <Button
                onClick={() => handleToggleCart(selectedPhoto)}
                className={isInCart(selectedPhoto.id) ? 'bg-green-500 hover:bg-green-600' : 'bg-gray-900 hover:bg-gray-800'}
              >
                {isInCart(selectedPhoto.id) ? (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    No carrinho
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 mr-2" />
                    Adicionar
                  </>
                )}
              </Button>
            </div>
            <button
              onClick={() => setSelectedPhoto(null)}
              className="absolute top-4 right-4 text-white bg-black/50 rounded-full w-10 h-10 flex items-center justify-center hover:bg-black/70"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FotoFacilPhotoGrid;