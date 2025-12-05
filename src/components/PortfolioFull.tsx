import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Camera, Video, Heart, Gift, Users, Play, Eye, Grid, List } from "lucide-react";
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
type ViewType = "grid" | "masonry";

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
  const [viewType, setViewType] = useState<ViewType>("grid");
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
    
    // Listen for realtime updates to categories and subcategories
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
      
      // Create category map (UUID -> name)
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
      
      // Create subcategory map (UUID -> name)
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

  // Media type categories (first filter)
  const mediaTypeCategories = [
    { id: "all", label: "Tudo", icon: Eye },
    { id: "photo", label: "Fotos", icon: Camera },
    { id: "video", label: "Vídeos", icon: Video },
  ];

  // Get unique category names and filter by media type
  const getAvailableCategories = () => {
    if (activeCategory === "all") {
      // Show only categories that have items
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
      // Filter categories by media type and show only categories that have items of that type
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

  // Get available subcategories for selected category (only those with items)
  const getAvailableSubcategories = () => {
    if (activePortfolioCategory === "all") return [];
    
    const categoryId = categories.find(cat => cat.name === activePortfolioCategory)?.id;
    if (!categoryId) return [];
    
    // Get all subcategories for this category
    const categorySubcategories = subcategories.filter(sub => sub.category_id === categoryId);
    
    // Filter to only show subcategories that have items
    const subcategoriesWithItems = categorySubcategories.filter(sub => {
      return portfolioItems.some(item => {
        // Check if item matches current media type filter
        const mediaTypeMatch = activeCategory === "all" || item.media_type === activeCategory;
        
        // Check if item belongs to the selected category and this subcategory
        const categoryName = item.category ? categoryMap.get(item.category) : '';
        const categoryMatch = categoryName === activePortfolioCategory;
        const subcategoryMatch = item.subcategory === sub.id;
        
        return mediaTypeMatch && categoryMatch && subcategoryMatch;
      });
    });
    
    return subcategoriesWithItems;
  };

  // Check if there are any items with subcategories in the filtered results
  const hasItemsWithSubcategories = () => {
    return filteredItems.some(item => item.subcategory);
  };

  const filteredItems = portfolioItems.filter((item) => {
    // Filter by media type
    const mediaTypeMatch = activeCategory === "all" || item.media_type === activeCategory;
    
    // Filter by category name
    let categoryMatch = true;
    if (activePortfolioCategory !== "all") {
      const categoryName = item.category ? categoryMap.get(item.category) : '';
      categoryMatch = categoryName === activePortfolioCategory;
    }
    
    // Filter by subcategory
    let subcategoryMatch = true;
    if (selectedSubcategory) {
      subcategoryMatch = item.subcategory === selectedSubcategory;
    }
    
    return mediaTypeMatch && categoryMatch && subcategoryMatch;
  });

  // Paginação
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

  // Reset page when filters change
  const handleMediaTypeChange = (mediaType: string) => {
    setActiveCategory(mediaType as CategoryType);
    setActivePortfolioCategory("all"); // Reset category when media type changes
    setCurrentPage(1);
  };

  const handlePortfolioCategoryChange = (category: string) => {
    setActivePortfolioCategory(category);
    setSelectedSubcategory(undefined); // Reset subcategory when category changes
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

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12 animate-fade-in-up">
          <h1 className="text-4xl lg:text-6xl font-bold mb-6">
            Portfolio <span className="bg-gradient-primary bg-clip-text text-transparent">Completo</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto animate-fade-in-delayed">
            Explore nossa galeria completa com mais de {portfolioItems.length} projetos realizados. 
            Cada imagem conta uma história única e especial.
          </p>
        </div>

        {/* Filters and View Controls */}
        <div className="space-y-6 mb-8 animate-fade-in-delayed">
          {/* Media Type Filters */}
          <div className="flex flex-wrap justify-center gap-4">
            {mediaTypeCategories.map((mediaType) => {
              const Icon = mediaType.icon;
              return (
                <Button
                  key={mediaType.id}
                  variant={activeCategory === mediaType.id ? "default" : "outline"}
                  className={`${
                    activeCategory === mediaType.id
                      ? "bg-foreground text-background hover:bg-foreground/90"
                      : "border-foreground/30 text-foreground hover:bg-foreground/10"
                  } transition-all`}
                  onClick={() => handleMediaTypeChange(mediaType.id)}
                >
                  <Icon className="mr-2 h-4 w-4" />
                  {mediaType.label}
                </Button>
              );
            })}
          </div>

          {/* Portfolio Category Filters */}
          <div className="flex flex-wrap justify-center gap-2">
            {availableCategories.map((category) => {
              const Icon = category.icon;
              return (
                <Button
                  key={category.id}
                  variant="ghost"
                  size="sm"
                  className={`${
                    activePortfolioCategory === category.id
                      ? "bg-foreground/20 text-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-foreground/10"
                  } transition-all`}
                  onClick={() => handlePortfolioCategoryChange(category.id)}
                >
                  <Icon className="mr-1 h-3 w-3" />
                  {category.label}
                </Button>
              );
            })}
          </div>

          {/* Subcategory Filters - Show when there are items with subcategories */}
          {hasItemsWithSubcategories() && (
            <div className="flex flex-wrap justify-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                className={`transition-all text-xs ${
                  !selectedSubcategory
                    ? "bg-secondary/20 text-secondary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                onClick={() => setSelectedSubcategory(undefined)}
              >
                Todas as Subcategorias
              </Button>
              {/* Show all subcategories that have items, regardless of selected category */}
              {subcategories.filter(sub => {
                return portfolioItems.some(item => {
                  const mediaTypeMatch = activeCategory === "all" || item.media_type === activeCategory;
                  const categoryMatch = activePortfolioCategory === "all" || 
                    (item.category && categoryMap.get(item.category) === activePortfolioCategory);
                  const subcategoryMatch = item.subcategory === sub.id;
                  return mediaTypeMatch && categoryMatch && subcategoryMatch;
                });
              }).map((subcategory) => (
                <Button
                  key={subcategory.id}
                  variant="ghost"
                  size="sm"
                  className={`${
                    selectedSubcategory === subcategory.id
                      ? "bg-secondary/20 text-secondary-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  } transition-all text-xs`}
                  onClick={() => setSelectedSubcategory(subcategory.id)}
                >
                  {subcategory.name}
                </Button>
              ))}
            </div>
          )}

          {/* View Controls and Results */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="text-muted-foreground">
              {filteredItems.length} trabalhos encontrados
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Visualização:</span>
              <Button
                variant={viewType === "grid" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewType("grid")}
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewType === "masonry" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewType("masonry")}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Portfolio Grid */}
        <div className={`grid gap-6 lg:gap-8 ${
          viewType === "grid" 
            ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
        }`}>
          {currentItems.map((item, index) => (
            <div 
              key={item.id} 
              className="portfolio-item group cursor-pointer animate-fade-in-up"
              onClick={() => handleImageClick(index)}
            >
              <div className="relative aspect-[4/3] overflow-hidden">
                {item.media_type === 'video' ? (
                  <video
                    src={item.file_url}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    poster={item.thumbnail_url}
                  />
                ) : (
                  <img
                    src={item.thumbnail_url || item.file_url}
                    alt={item.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                )}
                <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-all duration-700 flex items-center justify-center p-8 backdrop-blur-sm">
                  <div className="text-center text-white space-y-3">
                    {item.media_type === "video" ? (
                      <Video className="h-10 w-10 mx-auto mb-3" />
                    ) : (
                      <Camera className="h-10 w-10 mx-auto mb-3" />
                    )}
                    <h3 className="font-semibold text-xl">{item.title}</h3>
                    <div className="flex flex-wrap gap-2 justify-center">
                      {item.category && (
                        <span className="px-3 py-1 bg-white/20 text-xs font-medium">
                          {getCategoryLabel(item.category)}
                        </span>
                      )}
                      {item.subcategory && (
                        <span className="px-3 py-1 bg-white/20 text-xs font-medium">
                          {getSubcategoryLabel(item.subcategory)}
                        </span>
                      )}
                    </div>
                    {item.description && (
                      <p className="text-sm opacity-90 max-w-xs mx-auto">{item.description}</p>
                    )}
                    {(item.date_taken || item.location) && (
                      <div className="text-xs opacity-80 space-y-1">
                        {item.date_taken && <div>{new Date(item.date_taken).toLocaleDateString('pt-BR')}</div>}
                        {item.location && <div>{item.location}</div>}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-12">
            <div className="flex space-x-2">
              {[...Array(totalPages)].map((_, index) => (
                <Button
                  key={index}
                  variant={currentPage === index + 1 ? "default" : "outline"}
                  size="sm"
                  className={currentPage === index + 1 ? "bg-gradient-primary" : "border-primary/30 hover:bg-primary/10"}
                  onClick={() => handlePageChange(index + 1)}
                >
                  {index + 1}
                </Button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Image Modal */}
      <ImageModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        images={filteredItems.map(item => ({
          id: parseInt(item.id),
          title: item.title,
          category: item.category ? getCategoryLabel(item.category) : '',
          subcategory: item.subcategory ? getSubcategoryLabel(item.subcategory) : '',
          image: item.thumbnail_url || item.file_url,
          description: item.description || '',
          date: item.date_taken ? new Date(item.date_taken).toLocaleDateString('pt-BR') : '',
          location: item.location || '',
          media_type: item.media_type
        }))}
        currentIndex={currentImageIndex}
        onIndexChange={setCurrentImageIndex}
      />
    </div>
  );
};

export default PortfolioFull;