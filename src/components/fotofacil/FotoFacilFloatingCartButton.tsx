import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';
import { useFotoFacilCart } from '@/contexts/FotoFacilCartContext';
import FotoFacilFloatingCart from './FotoFacilFloatingCart';

interface FotoFacilFloatingCartButtonProps {
  lightMode?: boolean;
}

const FotoFacilFloatingCartButton = ({ lightMode = false }: FotoFacilFloatingCartButtonProps) => {
  const { itemCount, totalCents } = useFotoFacilCart();
  const [showCart, setShowCart] = useState(false);
  const location = useLocation();

  const formatPrice = (cents: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(cents / 100);
  };

  // Hide on cart page
  if (location.pathname === '/fotofacil/carrinho') return null;
  
  // Hide if cart is empty
  if (itemCount === 0) return null;

  return (
    <>
      <button
        onClick={(e) => {
          e.stopPropagation();
          setShowCart(true);
        }}
        className={`fixed bottom-4 right-4 md:bottom-6 md:right-6 z-50 flex items-center gap-2 md:gap-3 px-4 md:px-5 py-2.5 md:py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 ${
          lightMode 
            ? 'bg-white hover:bg-gray-50 text-gray-800' 
            : 'bg-gray-800 hover:bg-gray-900 text-white'
        }`}
      >
        <div className="relative">
          <ShoppingCart className="w-5 h-5" />
          <span className={`absolute -top-2 -right-2 text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center ${
            lightMode ? 'bg-emerald-500 text-white' : 'bg-emerald-500 text-white'
          }`}>
            {itemCount}
          </span>
        </div>
        <span className={`font-semibold text-sm md:text-base ${lightMode ? 'text-gray-800' : 'text-white'}`}>
          {formatPrice(totalCents)}
        </span>
      </button>

      <FotoFacilFloatingCart isOpen={showCart} onClose={() => setShowCart(false)} />
    </>
  );
};

export default FotoFacilFloatingCartButton;