import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Camera, Video, Heart, Gift, Users, Play, Eye } from "lucide-react";
import ImageModal from "./ImageModal";
import { supabase } from "@/integrations/supabase/client";

const getCategoryIcon = (categoryName: string) => {
  const name = categoryName.toLowerCase();
  if (name.includes('casamento')) return Heart;
  if (name.includes('aniversario')) return Gift;
  if (name.includes('corporativo')) return Users;
  if (name.includes('familia')) return Users;
  return Eye;
};

type CategoryType = "all" | "photo" | "video";

interface Category {
  id: string;
  name: string;
  type?: string;
  is_active: boolean;
}

interface Subcategory {
  id: string;
  name: string;
  category_id: string;
  is_active: boolean;
}

interface PortfolioItem {
  id: string;
  title: string;
  media_type: "photo" | "video";
  category?: string;
  subcategory?: string;
  file_url: string;
  thumbnail_url?: string;
  description?: string;
  date_taken?: string;
  location?: string;
  publish_status: string;
  created_at: string;
}

const PortfolioFull = () => {
  const [activeCategory, setActiveCategory] = useState<CategoryType>("all");
  const [activePortfolioCategory, setActivePortfolioCategory] = useState<string>("all");
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | undefined>(undefined);
  const [modalOpen, setModalOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [portfolioItems, setPortfolioItems] = useState<PortfolioItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [categoryMap, setCategoryMap] = useState<Map<string, string>>(new Map());
  const [subcategoryMap, setSubcategoryMap] = useState<Map<string, string>>(new Map());
  const [loading, setLoading] = useState(true);
  const itemsPerPage = 12;

  useEffect(() => {
    Promise.all([
      loadPortfolioItems(),
      loadCategories(),
      loadSubcategories()
    ]);
    
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'portfolio_categories'
        },
        () => {
          loadCategories();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'portfolio_subcategories'
        },
        () => {
          loadSubcategories();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const loadCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('portfolio_categories')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (error) throw error;

      setCategories(data || []);
      
      const catMap = new Map();
      (data || []).forEach(cat => {
        catMap.set(cat.id, cat.name);
      });
      setCategoryMap(catMap);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const loadSubcategories = async () => {
    try {
      const { data, error } = await supabase
        .from('portfolio_subcategories')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (error) throw error;

      setSubcategories(data || []);
      
      const subMap = new Map();
      (data || []).forEach(sub => {
        subMap.set(sub.id, sub.name);
      });
      setSubcategoryMap(subMap);
    } catch (error) {
      console.error('Error loading subcategories:', error);
    }
  };

  const loadPortfolioItems = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('portfolio_items')
        .select('*')
        .eq('publish_status', 'published')
        .order('display_order', { ascending: true });

      if (error) throw error;

      setPortfolioItems((data || []).map(item => ({
        ...item,
        media_type: item.media_type as 'photo' | 'video'
      })));
    } catch (error) {
      console.error('Error loading portfolio items:', error);
    } finally {
      setLoading(false);
    }
  };

  const mediaTypeCategories = [
    { id: "all", label: "Tudo", icon: Eye },
    { id: "photo", label: "Fotos", icon: Camera },
    { id: "video", label: "Vídeos", icon: Video },
  ];

  const getAvailableCategories = () => {
    if (activeCategory === "all") {
      const categoriesWithItems = new Set<string>();
      
      portfolioItems.forEach(item => {
        if (item.category) {
          const categoryName = categoryMap.get(item.category);
          if (categoryName) {
            categoriesWithItems.add(categoryName);
          }
        }
      });
      
      const uniqueCategories: Array<{ id: string, label: string, icon: any }> = [];
      categoriesWithItems.forEach(categoryName => {
        uniqueCategories.push({
          id: categoryName,
          label: categoryName,
          icon: getCategoryIcon(categoryName)
        });
      });
      
      return [
        { id: "all", label: "Todas", icon: Eye },
        ...uniqueCategories
      ];
    } else {
      const categoriesWithItems = new Set<string>();
      
      portfolioItems.forEach(item => {
        if (item.media_type === activeCategory && item.category) {
          const categoryName = categoryMap.get(item.category);
          if (categoryName) {
            categoriesWithItems.add(categoryName);
          }
        }
      });
      
      const uniqueCategories: Array<{ id: string, label: string, icon: any }> = [];
      categoriesWithItems.forEach(categoryName => {
        uniqueCategories.push({
          id: categoryName,
          label: categoryName,
          icon: getCategoryIcon(categoryName)
        });
      });
      
      return [
        { id: "all", label: "Todas", icon: Eye },
        ...uniqueCategories
      ];
    }
  };

  const availableCategories = getAvailableCategories();

  const getAvailableSubcategories = () => {
    if (activePortfolioCategory === "all") return [];
    
    const categoryId = categories.find(cat => cat.name === activePortfolioCategory)?.id;
    if (!categoryId) return [];
    
    const categorySubcategories = subcategories.filter(sub => sub.category_id === categoryId);
    
    const subcategoriesWithItems = categorySubcategories.filter(sub => {
      return portfolioItems.some(item => {
        const mediaTypeMatch = activeCategory === "all" || item.media_type === activeCategory;
        const categoryName = item.category ? categoryMap.get(item.category) : '';
        const categoryMatch = categoryName === activePortfolioCategory;
        const subcategoryMatch = item.subcategory === sub.id;
        
        return mediaTypeMatch && categoryMatch && subcategoryMatch;
      });
    });
    
    return subcategoriesWithItems;
  };

  const filteredItems = portfolioItems.filter((item) => {
    const mediaTypeMatch = activeCategory === "all" || item.media_type === activeCategory;
    
    let categoryMatch = true;
    if (activePortfolioCategory !== "all") {
      const categoryName = item.category ? categoryMap.get(item.category) : '';
      categoryMatch = categoryName === activePortfolioCategory;
    }
    
    let subcategoryMatch = true;
    if (selectedSubcategory) {
      subcategoryMatch = item.subcategory === selectedSubcategory;
    }
    
    return mediaTypeMatch && categoryMatch && subcategoryMatch;
  });

  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentItems = filteredItems.slice(startIndex, startIndex + itemsPerPage);

  const handleImageClick = (index: number) => {
    const globalIndex = startIndex + index;
    setCurrentImageIndex(globalIndex);
    setModalOpen(true);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleMediaTypeChange = (mediaType: string) => {
    setActiveCategory(mediaType as CategoryType);
    setActivePortfolioCategory("all");
    setCurrentPage(1);
  };

  const handlePortfolioCategoryChange = (category: string) => {
    setActivePortfolioCategory(category);
    setSelectedSubcategory(undefined);
    setCurrentPage(1);
  };

  const getCategoryLabel = (categoryId: string) => {
    return categoryMap.get(categoryId) || categoryId;
  };

  const getSubcategoryLabel = (subcategoryId: string) => {
    return subcategoryMap.get(subcategoryId) || subcategoryId;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando portfólio...</p>
        </div>
      </div>
    );
  }

  const renderMediaItem = (item: PortfolioItem, index: number) => {
    const categoryLabel = item.category ? getCategoryLabel(item.category) : '';
    const subcategoryLabel = item.subcategory ? getSubcategoryLabel(item.subcategory) : '';
    const hasCategory = categoryLabel && categoryLabel.trim() !== '';
    const hasSubcategory = subcategoryLabel && subcategoryLabel.trim() !== '';

    return (
      <div 
        key={item.id}
        className="group cursor-pointer animate-fade-in-up relative overflow-hidden"
        onClick={() => handleImageClick(index)}
      >
        <div className="relative aspect-square overflow-hidden">
          {item.media_type === 'video' ? (
            <>
              {item.thumbnail_url ? (
                <img
                  src={item.thumbnail_url}
                  alt={item.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              ) : (
                <video
                  src={item.file_url}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  muted
                  playsInline
                />
              )}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-16 h-16 bg-foreground/20 backdrop-blur-sm flex items-center justify-center transition-transform duration-300">
                  <Play className="w-6 h-6 text-foreground ml-1" fill="currentColor" />
                </div>
              </div>
            </>
          ) : (
            <img
              src={item.thumbnail_url || item.file_url}
              alt={item.title}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
          )}
          {/* Overlay with category above title */}
          <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            {(hasCategory || hasSubcategory) && (
              <span className="text-[10px] font-light font-mono text-white/80 uppercase tracking-wider mb-1 block">
                {categoryLabel}{hasCategory && hasSubcategory ? ' · ' : ''}{subcategoryLabel}
              </span>
            )}
            <h3 className="font-light text-lg text-white uppercase">{item.title}</h3>
          </div>
        </div>
      </div>
    );
  };

  return (
    <section className="py-16 md:py-24 px-4">
      <div className="max-w-[1400px] mx-auto">
        {/* Media Type Filters */}
        <div className="flex flex-wrap gap-2 mb-6 justify-center">
          {mediaTypeCategories.map((cat) => (
            <Button
              key={cat.id}
              variant={activeCategory === cat.id ? "default" : "outline"}
              size="sm"
              onClick={() => handleMediaTypeChange(cat.id)}
              className="flex items-center gap-2 text-xs uppercase tracking-wider"
            >
              <cat.icon className="w-4 h-4" />
              {cat.label}
            </Button>
          ))}
        </div>

        {/* Category Filters */}
        {availableCategories.length > 1 && (
          <div className="flex flex-wrap gap-2 mb-6 justify-center">
            {availableCategories.map((cat) => (
              <Button
                key={cat.id}
                variant={activePortfolioCategory === cat.id ? "default" : "outline"}
                size="sm"
                onClick={() => handlePortfolioCategoryChange(cat.id)}
                className="flex items-center gap-2 text-xs uppercase tracking-wider"
              >
                <cat.icon className="w-4 h-4" />
                {cat.label}
              </Button>
            ))}
          </div>
        )}

        {/* Subcategory Filters */}
        {getAvailableSubcategories().length > 0 && (
          <div className="flex flex-wrap gap-2 mb-8 justify-center">
            <Button
              variant={!selectedSubcategory ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedSubcategory(undefined)}
              className="text-xs uppercase tracking-wider"
            >
              Todas
            </Button>
            {getAvailableSubcategories().map((sub) => (
              <Button
                key={sub.id}
                variant={selectedSubcategory === sub.id ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedSubcategory(sub.id)}
                className="text-xs uppercase tracking-wider"
              >
                {sub.name}
              </Button>
            ))}
          </div>
        )}

        {/* Simple Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-1">
          {currentItems.map((item, index) => renderMediaItem(item, index))}
        </div>

        {/* Empty State */}
        {currentItems.length === 0 && (
          <div className="text-center py-16">
            <p className="text-muted-foreground text-lg">
              Nenhum item encontrado para os filtros selecionados.
            </p>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-12">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              Anterior
            </Button>
            
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <Button
                key={page}
                variant={currentPage === page ? "default" : "outline"}
                size="sm"
                onClick={() => handlePageChange(page)}
                className="w-10"
              >
                {page}
              </Button>
            ))}
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Próximo
            </Button>
          </div>
        )}
      </div>

      {/* Modal */}
      <ImageModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        images={filteredItems.map(item => ({
          id: item.id,
          image: item.file_url,
          title: item.title,
          category: item.category ? getCategoryLabel(item.category) : '',
          subcategory: item.subcategory ? getSubcategoryLabel(item.subcategory) : '',
          description: item.description || '',
          media_type: item.media_type
        }))}
        currentIndex={currentImageIndex}
        onIndexChange={setCurrentImageIndex}
      />
    </section>
  );
};

export default PortfolioFull;