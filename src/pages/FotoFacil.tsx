import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { ShoppingCart, ArrowLeft, Calendar, MapPin, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useFotoFacilCart } from '@/contexts/FotoFacilCartContext';
import FotoFacilPhotoGrid from '@/components/fotofacil/FotoFacilPhotoGrid';

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
}

interface Event {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  event_date: string | null;
  location: string | null;
  cover_url: string | null;
  default_price_cents: number;
  category_id: string | null;
}

const FotoFacil = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [categories, setCategories] = useState<Category[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { itemCount, totalCents } = useFotoFacilCart();

  const selectedCategory = searchParams.get('categoria');
  const selectedEvent = searchParams.get('evento');

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    if (selectedCategory) {
      loadEvents(selectedCategory);
    }
  }, [selectedCategory]);

  const loadCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('fotofacil_categories')
        .select('*')
        .eq('is_active', true)
        .order('display_order');

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Error loading categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadEvents = async (categorySlug: string) => {
    try {
      setLoading(true);
      const category = categories.find(c => c.slug === categorySlug);
      if (!category) return;

      const { data, error } = await supabase
        .from('fotofacil_events')
        .select('*')
        .eq('category_id', category.id)
        .eq('is_active', true)
        .eq('status', 'published')
        .order('event_date', { ascending: false });

      if (error) throw error;
      setEvents(data || []);
    } catch (error) {
      console.error('Error loading events:', error);
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

  const handleCategoryClick = (slug: string) => {
    setSearchParams({ categoria: slug });
  };

  const handleEventClick = (slug: string) => {
    setSearchParams({ categoria: selectedCategory!, evento: slug });
  };

  const handleBack = () => {
    if (selectedEvent) {
      setSearchParams({ categoria: selectedCategory! });
    } else if (selectedCategory) {
      setSearchParams({});
    }
  };

  // Find selected event object
  const currentEvent = events.find(e => e.slug === selectedEvent);

  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/" className="text-gray-500 hover:text-gray-900 transition-colors">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <h1 className="text-2xl font-bold tracking-tight">FOTOFÁCIL</h1>
            </div>
            
            <Link to="/fotofacil/carrinho">
              <Button variant="outline" className="relative border-gray-300 hover:border-gray-900">
                <ShoppingCart className="w-5 h-5 mr-2" />
                <span>Carrinho</span>
                {itemCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-gray-900 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {itemCount}
                  </span>
                )}
              </Button>
            </Link>
          </div>
          
          {itemCount > 0 && (
            <div className="mt-2 text-sm text-gray-600">
              Total: {formatPrice(totalCents)}
            </div>
          )}
        </div>
      </header>

      {/* Breadcrumb */}
      {(selectedCategory || selectedEvent) && (
        <div className="bg-gray-50 border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 py-3">
            <div className="flex items-center gap-2 text-sm">
              <button onClick={() => setSearchParams({})} className="text-gray-500 hover:text-gray-900">
                Categorias
              </button>
              {selectedCategory && (
                <>
                  <span className="text-gray-400">/</span>
                  <button 
                    onClick={() => setSearchParams({ categoria: selectedCategory })}
                    className={selectedEvent ? "text-gray-500 hover:text-gray-900" : "text-gray-900 font-medium"}
                  >
                    {categories.find(c => c.slug === selectedCategory)?.name}
                  </button>
                </>
              )}
              {selectedEvent && currentEvent && (
                <>
                  <span className="text-gray-400">/</span>
                  <span className="text-gray-900 font-medium">{currentEvent.title}</span>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      <main className="max-w-7xl mx-auto px-4 py-8">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
          </div>
        ) : selectedEvent && currentEvent ? (
          /* Photos Grid */
          <div>
            <div className="mb-8">
              <Button variant="ghost" onClick={handleBack} className="mb-4 text-gray-600 hover:text-gray-900">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar aos eventos
              </Button>
              <h2 className="text-3xl font-bold mb-2">{currentEvent.title}</h2>
              <div className="flex flex-wrap gap-4 text-gray-600 text-sm">
                {currentEvent.event_date && (
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {new Date(currentEvent.event_date).toLocaleDateString('pt-BR')}
                  </span>
                )}
                {currentEvent.location && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {currentEvent.location}
                  </span>
                )}
              </div>
              {currentEvent.description && (
                <p className="mt-4 text-gray-600">{currentEvent.description}</p>
              )}
              <p className="mt-2 text-lg font-semibold">
                Preço por foto: {formatPrice(currentEvent.default_price_cents)}
              </p>
            </div>

            <FotoFacilPhotoGrid 
              eventId={currentEvent.id} 
              defaultPriceCents={currentEvent.default_price_cents}
            />
          </div>
        ) : selectedCategory ? (
          /* Events List */
          <div>
            <Button variant="ghost" onClick={handleBack} className="mb-6 text-gray-600 hover:text-gray-900">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar às categorias
            </Button>
            
            <h2 className="text-3xl font-bold mb-8">
              {categories.find(c => c.slug === selectedCategory)?.name}
            </h2>

            {events.length === 0 ? (
              <div className="text-center py-20 text-gray-500">
                <p className="text-lg">Nenhum evento disponível nesta categoria.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {events.map(event => (
                  <button
                    key={event.id}
                    onClick={() => handleEventClick(event.slug)}
                    className="group text-left bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
                  >
                    <div className="aspect-[16/10] bg-gray-100 overflow-hidden">
                      {event.cover_url ? (
                        <img 
                          src={event.cover_url} 
                          alt={event.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <Calendar className="w-12 h-12" />
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-lg mb-1 group-hover:text-gray-600 transition-colors">
                        {event.title}
                      </h3>
                      <div className="flex flex-wrap gap-3 text-sm text-gray-500">
                        {event.event_date && (
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(event.event_date).toLocaleDateString('pt-BR')}
                          </span>
                        )}
                        {event.location && (
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {event.location}
                          </span>
                        )}
                      </div>
                      <p className="mt-2 text-gray-900 font-medium">
                        A partir de {formatPrice(event.default_price_cents)}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          /* Categories List */
          <div>
            <div className="mb-8">
              <h2 className="text-3xl font-bold mb-2">Escolha uma categoria</h2>
              <p className="text-gray-600">Navegue pelas categorias para encontrar suas fotos</p>
            </div>

            {categories.length === 0 ? (
              <div className="text-center py-20 text-gray-500">
                <p className="text-lg">Nenhuma categoria disponível no momento.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {categories.map(category => (
                  <button
                    key={category.id}
                    onClick={() => handleCategoryClick(category.slug)}
                    className="group text-left bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
                  >
                    <div className="aspect-[16/10] bg-gray-100 overflow-hidden">
                      {category.image_url ? (
                        <img 
                          src={category.image_url} 
                          alt={category.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <Search className="w-12 h-12" />
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-lg group-hover:text-gray-600 transition-colors">
                        {category.name}
                      </h3>
                      {category.description && (
                        <p className="mt-1 text-sm text-gray-500 line-clamp-2">
                          {category.description}
                        </p>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default FotoFacil;