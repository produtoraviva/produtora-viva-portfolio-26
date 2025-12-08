import { useState } from 'react';
import { ShoppingCart } from 'lucide-react';
import { useFotoFacilCart } from '@/contexts/FotoFacilCartContext';
import FotoFacilFloatingCart from './FotoFacilFloatingCart';

const FotoFacilFloatingCartButton = () => {
  const { itemCount, totalCents } = useFotoFacilCart();
  const [showCart, setShowCart] = useState(false);

  const formatPrice = (cents: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(cents / 100);
  };

  if (itemCount === 0) return null;

  return (
    <>
      <button
        onClick={() => setShowCart(true)}
        className="fixed bottom-6 right-6 z-40 flex items-center gap-3 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 group"
      >
        <div className="relative">
          <ShoppingCart className="w-5 h-5" />
          <span className="absolute -top-2 -right-2 bg-white text-emerald-600 text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
            {itemCount}
          </span>
        </div>
        <span className="font-semibold">{formatPrice(totalCents)}</span>
      </button>

      <FotoFacilFloatingCart isOpen={showCart} onClose={() => setShowCart(false)} />
    </>
  );
};

export default FotoFacilFloatingCartButton;