import { Link } from 'react-router-dom';
import { X, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useFotoFacilCart } from '@/contexts/FotoFacilCartContext';

interface FotoFacilFloatingCartProps {
  isOpen: boolean;
  onClose: () => void;
}

const FotoFacilFloatingCart = ({ isOpen, onClose }: FotoFacilFloatingCartProps) => {
  const { items, removeItem, totalCents, itemCount } = useFotoFacilCart();

  const formatPrice = (cents: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(cents / 100);
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 z-50 transition-opacity"
        onClick={onClose}
      />
      
      {/* Cart Panel */}
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white z-50 shadow-2xl transform transition-transform animate-slide-in-right">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-gray-700" />
              <h2 className="text-lg font-bold text-gray-900">Seu Carrinho</h2>
              {itemCount > 0 && (
                <span className="bg-emerald-100 text-emerald-700 text-xs font-semibold px-2 py-0.5 rounded-full">
                  {itemCount} {itemCount === 1 ? 'item' : 'itens'}
                </span>
              )}
            </div>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Items */}
          <div className="flex-1 overflow-y-auto p-4">
            {items.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center py-12">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <ShoppingBag className="w-10 h-10 text-gray-300" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Carrinho vazio</h3>
                <p className="text-gray-500 mb-6">Adicione algumas fotos para continuar</p>
                <Button onClick={onClose} variant="outline">
                  Continuar comprando
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {items.map(item => (
                  <div 
                    key={item.photoId}
                    className="flex items-center gap-3 bg-gray-50 rounded-lg p-3 group"
                  >
                    <img 
                      src={item.thumbUrl}
                      alt={item.title}
                      className="w-16 h-16 object-cover rounded-md"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">{item.title}</p>
                      <p className="text-emerald-600 font-semibold">{formatPrice(item.priceCents)}</p>
                    </div>
                    <button
                      onClick={() => removeItem(item.photoId)}
                      className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {items.length > 0 && (
            <div className="border-t border-gray-100 p-4 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Subtotal</span>
                <span className="text-xl font-bold text-gray-900">{formatPrice(totalCents)}</span>
              </div>
              
              <Link to="/fotofacil/carrinho" onClick={onClose}>
                <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white" size="lg">
                  Ir ao Carrinho
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              
              <button 
                onClick={onClose}
                className="w-full text-center text-gray-500 hover:text-gray-700 text-sm transition-colors"
              >
                Continuar comprando
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default FotoFacilFloatingCart;