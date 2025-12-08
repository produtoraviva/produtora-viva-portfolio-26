import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Search, ArrowLeft, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useFotoFacilCart } from '@/contexts/FotoFacilCartContext';
import FotoFacilFloatingCart from './FotoFacilFloatingCart';

interface FotoFacilHeaderProps {
  onSearch?: (term: string) => void;
  searchPlaceholder?: string;
  showBack?: boolean;
  onBack?: () => void;
}

const FotoFacilHeader = ({ onSearch, searchPlaceholder = "Buscar eventos...", showBack, onBack }: FotoFacilHeaderProps) => {
  const { itemCount, totalCents } = useFotoFacilCart();
  const [showFloatingCart, setShowFloatingCart] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const formatPrice = (cents: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(cents / 100);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    onSearch?.(value);
  };

  return (
    <>
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3">
          {/* Top Row */}
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              {showBack && (
                <button 
                  onClick={onBack}
                  className="p-2 -ml-2 text-gray-500 hover:text-gray-900 transition-colors"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
              )}
              <Link to="/fotofacil" className="flex items-center gap-2">
                <span className="text-xl md:text-2xl font-black tracking-tight bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                  FOTOFÁCIL
                </span>
              </Link>
            </div>
            
            {/* Search Bar - Desktop */}
            <div className="hidden md:flex flex-1 max-w-md mx-4">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder={searchPlaceholder}
                  value={searchTerm}
                  onChange={handleSearchChange}
                  className="pl-10 bg-gray-50 border-gray-200 focus:bg-white transition-colors"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <Link to="/fotofacil/minhas-fotos">
                <Button variant="ghost" size="sm" className="hidden sm:flex text-gray-600 hover:text-gray-900">
                  <Download className="w-4 h-4 mr-2" />
                  <span className="hidden lg:inline">Baixar Fotos</span>
                </Button>
              </Link>
              
              <Button 
                onClick={() => setShowFloatingCart(true)}
                className="relative bg-gray-800 hover:bg-gray-900 text-white"
                size="sm"
              >
                <ShoppingCart className="w-4 h-4 mr-2" />
                <span className="text-white">Carrinho</span>
                {itemCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-emerald-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {itemCount}
                  </span>
                )}
              </Button>
            </div>
          </div>
          
          {/* Search Bar - Mobile */}
          <div className="mt-3 md:hidden">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                type="text"
                placeholder={searchPlaceholder}
                value={searchTerm}
                onChange={handleSearchChange}
                className="pl-10 bg-gray-50 border-gray-200 focus:bg-white transition-colors"
              />
            </div>
          </div>
        </div>
      </header>

      {/* Floating Cart */}
      <FotoFacilFloatingCart 
        isOpen={showFloatingCart} 
        onClose={() => setShowFloatingCart(false)} 
      />
    </>
  );
};

export default FotoFacilHeader;
