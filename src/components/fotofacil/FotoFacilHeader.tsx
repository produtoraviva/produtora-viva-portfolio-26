import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Search, ArrowLeft, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useFotoFacilCart } from '@/contexts/FotoFacilCartContext';
import FotoFacilFloatingCart from './FotoFacilFloatingCart';
import { useSearchParams } from 'react-router-dom';

interface FotoFacilHeaderProps {
  onSearch?: (term: string) => void;
  searchPlaceholder?: string;
  showBack?: boolean;
  onBack?: () => void;
  categoryName?: string;
}

const FotoFacilHeader = ({ onSearch, searchPlaceholder, showBack, onBack, categoryName }: FotoFacilHeaderProps) => {
  const { itemCount, totalCents } = useFotoFacilCart();
  const [showFloatingCart, setShowFloatingCart] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Reset search when navigating to different pages
  useEffect(() => {
    setSearchTerm('');
    onSearch?.('');
  }, [searchParams.get('categoria'), searchParams.get('evento')]);

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

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // If on photos page and searching, navigate back to events
    const evento = searchParams.get('evento');
    const categoria = searchParams.get('categoria');
    if (evento && categoria) {
      navigate(`/fotofacil?categoria=${categoria}`);
    }
  };

  // Determine placeholder based on context
  const getPlaceholder = () => {
    if (searchPlaceholder) return searchPlaceholder;
    if (categoryName) return `Buscar eventos na categoria ${categoryName}...`;
    return "Buscar categorias...";
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
                  className="p-2 -ml-2 text-gray-500 hover:text-gray-900 transition-colors rounded-lg"
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
            <form onSubmit={handleSearchSubmit} className="hidden md:flex flex-1 max-w-md mx-4">
              <div className="relative w-full flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    type="text"
                    placeholder={getPlaceholder()}
                    value={searchTerm}
                    onChange={handleSearchChange}
                    className="pl-10 bg-gray-50 border-gray-200 focus:bg-white text-gray-900 placeholder:text-gray-400 transition-colors rounded-lg"
                  />
                </div>
                <Button 
                  type="submit" 
                  size="sm" 
                  className="bg-gray-800 hover:bg-gray-900 text-white rounded-lg px-4"
                >
                  <Search className="w-4 h-4" />
                </Button>
              </div>
            </form>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <Link to="/fotofacil/minhas-fotos">
                <Button variant="ghost" size="sm" className="hidden sm:flex text-gray-600 hover:text-gray-900 rounded-lg">
                  <Download className="w-4 h-4 mr-2" />
                  <span className="hidden lg:inline">Baixar Fotos</span>
                </Button>
              </Link>
              
              <Button 
                onClick={() => setShowFloatingCart(true)}
                className="relative bg-gray-800 hover:bg-gray-900 text-white rounded-lg"
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
          <form onSubmit={handleSearchSubmit} className="mt-3 md:hidden">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder={getPlaceholder()}
                  value={searchTerm}
                  onChange={handleSearchChange}
                  className="pl-10 bg-gray-50 border-gray-200 focus:bg-white text-gray-900 placeholder:text-gray-400 transition-colors rounded-lg"
                />
              </div>
              <Button 
                type="submit" 
                size="sm" 
                className="bg-gray-800 hover:bg-gray-900 text-white rounded-lg px-3"
              >
                <Search className="w-4 h-4" />
              </Button>
            </div>
          </form>
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