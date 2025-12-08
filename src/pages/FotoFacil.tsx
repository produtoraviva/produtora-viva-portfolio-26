import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Calendar, MapPin, ArrowLeft, Images } from 'lucide-react';
import { Button } from '@/components/ui/button';
import FotoFacilPhotoGrid from '@/components/fotofacil/FotoFacilPhotoGrid';
import FotoFacilHeader from '@/components/fotofacil/FotoFacilHeader';
import FotoFacilFooter from '@/components/fotofacil/FotoFacilFooter';
import FotoFacilBanner from '@/components/fotofacil/FotoFacilBanner';
import FotoFacilFloatingCartButton from '@/components/fotofacil/FotoFacilFloatingCartButton';

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

  const selectedCategory = searchParams.get('categoria');
  const selectedEvent = searchParams.get('evento');

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    if (selectedCategory) {
      loadEvents(selectedCategory);
    }
  }, [selectedCategory, categories]);

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

  const handleSearch = (term: string) => {
    setSearchTerm(term);
  };

  // Filter based on search
  const filteredCategories = categories.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredEvents = events.filter(e => 
    e.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.location?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const currentEvent = events.find(e => e.slug === selectedEvent);
  const currentCategory = categories.find(c => c.slug === selectedCategory);

  // Determine search placeholder
  const getSearchPlaceholder = () => {
    if (selectedEvent) return `Buscar eventos na categoria ${currentCategory?.name || ''}...`;
    if (selectedCategory) return `Buscar eventos na categoria ${currentCategory?.name || ''}...`;
    return "Buscar categorias...";
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white font-sans flex flex-col">
      <FotoFacilHeader 
        onSearch={handleSearch}
        searchPlaceholder={getSearchPlaceholder()}
        showBack={!!(selectedCategory || selectedEvent)}
        onBack={handleBack}
        categoryName={currentCategory?.name}
      />

      {/* Breadcrumb */}
      {(selectedCategory || selectedEvent) && (
        <div className="bg-white border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-4 py-3">
            <div className="flex items-center gap-2 text-sm">
              <button onClick={() => setSearchParams({})} className="text-gray-500 hover:text-gray-900 transition-colors">
                Início
              </button>
              {selectedCategory && (
                <>
                  <span className="text-gray-300">/</span>
                  <button 
                    onClick={() => setSearchParams({ categoria: selectedCategory })}
                    className={`transition-colors ${selectedEvent ? "text-gray-500 hover:text-gray-900" : "text-gray-900 font-medium"}`}
                  >
                    {currentCategory?.name}
                  </button>
                </>
              )}
              {selectedEvent && currentEvent && (
                <>
                  <span className="text-gray-300">/</span>
                  <span className="text-gray-900 font-medium">{currentEvent.title}</span>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Banner - only on home */}
      {!selectedCategory && !selectedEvent && <FotoFacilBanner />}

      <main className="max-w-7xl mx-auto px-4 py-8 flex-1">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-2 border-gray-300 border-t-gray-900"></div>
          </div>
        ) : selectedEvent && currentEvent ? (
          /* Photos Grid */
          <div>
            <div className="mb-8">
              <Button 
                variant="ghost" 
                onClick={handleBack} 
                className="mb-4 -ml-3 text-gray-600 hover:text-gray-900 rounded-lg"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar aos eventos
              </Button>
              
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
                <h2 className="text-2xl md:text-3xl font-bold mb-3 text-gray-900">{currentEvent.title}</h2>
                <div className="flex flex-wrap gap-4 text-gray-600 text-sm mb-4">
                  {currentEvent.event_date && (
                    <span className="flex items-center gap-1.5 bg-gray-100 px-3 py-1 rounded-full">
                      <Calendar className="w-4 h-4" />
                      {new Date(currentEvent.event_date).toLocaleDateString('pt-BR', {
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </span>
                  )}
                  {currentEvent.location && (
                    <span className="flex items-center gap-1.5 bg-gray-100 px-3 py-1 rounded-full">
                      <MapPin className="w-4 h-4" />
                      {currentEvent.location}
                    </span>
                  )}
                </div>
                {currentEvent.description && (
                  <p className="text-gray-600">{currentEvent.description}</p>
                )}
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <span className="text-lg font-semibold text-gray-900">
                    Preço por foto: <span className="text-emerald-600">{formatPrice(currentEvent.default_price_cents)}</span>
                  </span>
                </div>
              </div>
            </div>

            <FotoFacilPhotoGrid 
              eventId={currentEvent.id} 
              defaultPriceCents={currentEvent.default_price_cents}
            />
          </div>
        ) : selectedCategory ? (
          /* Events List */
          <div>
            <div className="mb-8">
              <h2 className="text-2xl md:text-3xl font-bold mb-2 text-gray-900">
                {currentCategory?.name}
              </h2>
              {currentCategory?.description && (
                <p className="text-gray-600">{currentCategory.description}</p>
              )}
            </div>

            {filteredEvents.length === 0 ? (
              <div className="text-center py-20">
                <Images className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                <p className="text-lg text-gray-500">
                  {searchTerm ? 'Nenhum evento encontrado.' : 'Nenhum evento disponível nesta categoria.'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredEvents.map(event => (
                  <button
                    key={event.id}
                    onClick={() => handleEventClick(event.slug)}
                    className="group text-left bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg hover:border-gray-200 transition-all duration-300"
                  >
                    <div className="aspect-[16/10] bg-gray-100 overflow-hidden">
                      {event.cover_url ? (
                        <img 
                          src={event.cover_url} 
                          alt={event.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                          <Calendar className="w-12 h-12 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <div className="p-5">
                      <h3 className="font-semibold text-lg mb-2 text-gray-900 group-hover:text-gray-700 transition-colors">
                        {event.title}
                      </h3>
                      <div className="flex flex-wrap gap-2 text-sm text-gray-500 mb-3">
                        {event.event_date && (
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5" />
                            {new Date(event.event_date).toLocaleDateString('pt-BR')}
                          </span>
                        )}
                        {event.location && (
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5" />
                            {event.location}
                          </span>
                        )}
                      </div>
                      <p className="text-emerald-600 font-semibold">
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
              <h2 className="text-2xl md:text-3xl font-bold mb-2 text-gray-900">Escolha uma categoria</h2>
              <p className="text-gray-600">Navegue pelas categorias para encontrar suas fotos</p>
            </div>

            {filteredCategories.length === 0 ? (
              <div className="text-center py-20">
                <Images className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                <p className="text-lg text-gray-500">
                  {searchTerm ? 'Nenhuma categoria encontrada.' : 'Nenhuma categoria disponível no momento.'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCategories.map(category => (
                  <button
                    key={category.id}
                    onClick={() => handleCategoryClick(category.slug)}
                    className="group text-left bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg hover:border-gray-200 transition-all duration-300"
                  >
                    <div className="aspect-[16/10] bg-gray-100 overflow-hidden">
                      {category.image_url ? (
                        <img 
                          src={category.image_url} 
                          alt={category.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                          <Images className="w-12 h-12 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <div className="p-5">
                      <h3 className="font-semibold text-lg text-gray-900 group-hover:text-gray-700 transition-colors">
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

      <FotoFacilFloatingCartButton />
      <FotoFacilFooter />
    </div>
  );
};

export default FotoFacil;