import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { X, ShoppingBag, Trash2, Package, ArrowRight, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useFotoFacilCart } from '@/contexts/FotoFacilCartContext';

interface FotoFacilFloatingCartProps {
  isOpen: boolean;
  onClose: () => void;
}

const FotoFacilFloatingCart = ({ isOpen, onClose }: FotoFacilFloatingCartProps) => {
  const { items, removeItem, totalCents, itemCount } = useFotoFacilCart();
  const [isAnimating, setIsAnimating] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      setTimeout(() => setIsAnimating(true), 10);
    } else {
      setIsAnimating(false);
      const timer = setTimeout(() => setShouldRender(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const formatPrice = (cents: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(cents / 100);
  };

  // Group items by event
  const groupedItems = items.reduce((acc, item) => {
    const key = item.eventId;
    if (!acc[key]) {
      acc[key] = {
        eventTitle: item.eventTitle,
        items: []
      };
    }
    acc[key].items.push(item);
    return acc;
  }, {} as Record<string, { eventTitle: string; items: typeof items }>);

  if (!shouldRender) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 bg-black/50 z-50 transition-opacity duration-300 ${
          isAnimating ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={onClose}
      />
      
      {/* Cart Panel - Slide from right */}
      <div 
        className={`fixed right-0 top-0 bottom-0 w-full max-w-md bg-white shadow-2xl z-50 flex flex-col transition-transform duration-300 ease-out ${
          isAnimating ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
              <ShoppingCart className="w-5 h-5 text-gray-700" />
            </div>
            <div>
              <h2 className="font-bold text-gray-900">Carrinho</h2>
              <p className="text-sm text-gray-500">{itemCount} {itemCount === 1 ? 'foto' : 'fotos'}</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-900 transition-colors rounded-full hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto p-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center p-6">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <ShoppingBag className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Carrinho vazio</h3>
              <p className="text-gray-500 mb-6">Adicione fotos para continuar</p>
              <Button onClick={onClose} variant="outline" className="rounded-xl">
                Continuar Navegando
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(groupedItems).map(([eventId, group]) => (
                <div key={eventId}>
                  {/* Event Header */}
                  <div className="flex items-center gap-2 mb-3 pb-2 border-b border-gray-100">
                    <Package className="w-4 h-4 text-emerald-600" />
                    <span className="font-semibold text-sm text-gray-800">{group.eventTitle}</span>
                    <span className="text-xs text-gray-400">({group.items.length})</span>
                  </div>
                  
                  {/* Event Items */}
                  <div className="space-y-3">
                    {group.items.map(item => (
                      <div key={item.photoId} className="flex gap-3 p-2 bg-gray-50 rounded-xl">
                        <img 
                          src={item.thumbUrl}
                          alt={item.title}
                          className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm text-gray-900 truncate">{item.title}</p>
                          <p className="text-xs text-gray-400">ID: {item.photoId.slice(0, 8)}</p>
                          <p className="text-sm font-semibold text-emerald-600">{formatPrice(item.priceCents)}</p>
                        </div>
                        <button
                          onClick={() => removeItem(item.photoId)}
                          className="p-1.5 text-gray-400 hover:text-red-500 transition-colors self-start rounded-full"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-gray-100 p-4 bg-gray-50">
            {/* Subtotal */}
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-gray-600">Subtotal</p>
                <p className="text-xs text-gray-400">{itemCount} foto{itemCount > 1 ? 's' : ''}</p>
              </div>
              <p className="text-2xl font-bold text-gray-900">{formatPrice(totalCents)}</p>
            </div>
            
            {/* Actions */}
            <div className="space-y-2">
              <Link to="/fotofacil/carrinho" onClick={onClose} className="block">
                <Button className="w-full bg-gray-900 hover:bg-gray-800 text-white rounded-xl h-12">
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  Ir ao Carrinho
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              <Button 
                variant="ghost" 
                onClick={onClose}
                className="w-full text-gray-600 hover:text-gray-900 rounded-xl"
              >
                Continuar Comprando
              </Button>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default FotoFacilFloatingCart;