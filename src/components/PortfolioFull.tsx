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

// Define the layout pattern that repeats
// 0 = normal square (1x1)
// 1 = two horizontal stacked vertically (2 items in 1x1 space)
// 2 = two vertical side by side (2 items in 1x1 space) 
// 3 = horizontal wide (1x2 horizontal)
// 4 = vertical tall (2x1 vertical) - desktop/tablet only
const LAYOUT_PATTERN = [
  0, 0, 0,     // Row 1: 3 normal squares
  1, 0, 2,     // Row 2: stacked, normal, side by side
  0, 0, 0,     // Row 3: 3 normal squares
  3, 0,        // Row 4: wide horizontal + normal
  0, 4, 0,     // Row 5: normal, tall vertical (spans 2 rows), normal
  0, 0, 0,     // Row 6: 3 normal (with tall from above)
  0, 0, 0,     // Row 7: 3 normal squares
  2, 0, 1,     // Row 8: side by side, normal, stacked
];

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

  // Get layout type for an item based on its position
  const getLayoutType = (index: number): number => {
    return LAYOUT_PATTERN[index % LAYOUT_PATTERN.length];
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

  // Render a single media item
  const renderMediaItem = (item: PortfolioItem, index: number, isSmall: boolean = false) => {
    const categoryLabel = item.category ? getCategoryLabel(item.category) : '';
    const subcategoryLabel = item.subcategory ? getSubcategoryLabel(item.subcategory) : '';
    const hasCategory = categoryLabel && categoryLabel.trim() !== '';
    const hasSubcategory = subcategoryLabel && subcategoryLabel.trim() !== '';

    return (
      <div 
        key={`${item.id}-${index}`}
        className={`group cursor-pointer animate-fade-in-up relative overflow-hidden ${isSmall ? 'h-full' : ''}`}
        onClick={() => handleImageClick(index)}
      >
        <div className={`relative ${isSmall ? 'h-full' : 'aspect-square'} overflow-hidden`}>
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
              {/* Play icon overlay for videos */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className={`${isSmall ? 'w-10 h-10' : 'w-16 h-16'} bg-foreground/20 backdrop-blur-sm flex items-center justify-center transition-transform duration-300`}>
                  <Play className={`${isSmall ? 'w-4 h-4' : 'w-6 h-6'} text-foreground ml-1`} fill="currentColor" />
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
          {/* Overlay - Bottom info only */}
          <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            {(hasCategory || hasSubcategory) && (
              <span className={`${isSmall ? 'text-[7px]' : 'text-[10px]'} font-light font-mono text-white/80 uppercase tracking-wider mb-1 block`}>
                {categoryLabel}{hasCategory && hasSubcategory ? ' · ' : ''}{subcategoryLabel}
              </span>
            )}
            <h3 className={`font-light ${isSmall ? 'text-xs' : 'text-lg'} text-white uppercase`}>{item.title}</h3>
          </div>
        </div>
      </div>
    );
  };

  // Render items with varied layout pattern
  const renderGridWithPattern = () => {
    const elements: JSX.Element[] = [];
    let itemIndex = 0;

    while (itemIndex < currentItems.length) {
      const layoutType = getLayoutType(itemIndex);
      const item = currentItems[itemIndex];

      switch (layoutType) {
        case 0: // Normal square
          elements.push(
            <div key={`grid-${itemIndex}`} className="col-span-1 row-span-1">
              {renderMediaItem(item, itemIndex)}
            </div>
          );
          itemIndex++;
          break;

        case 1: // Two horizontal stacked vertically
          if (itemIndex + 1 < currentItems.length) {
            elements.push(
              <div key={`grid-${itemIndex}`} className="col-span-1 row-span-1 flex flex-col gap-1">
                <div className="flex-1 min-h-0">
                  {renderMediaItem(currentItems[itemIndex], itemIndex, true)}
                </div>
                <div className="flex-1 min-h-0">
                  {renderMediaItem(currentItems[itemIndex + 1], itemIndex + 1, true)}
                </div>
              </div>
            );
            itemIndex += 2;
          } else {
            elements.push(
              <div key={`grid-${itemIndex}`} className="col-span-1 row-span-1">
                {renderMediaItem(item, itemIndex)}
              </div>
            );
            itemIndex++;
          }
          break;

        case 2: // Two vertical side by side
          if (itemIndex + 1 < currentItems.length) {
            elements.push(
              <div key={`grid-${itemIndex}`} className="col-span-1 row-span-1 flex flex-row gap-1">
                <div className="flex-1 min-w-0">
                  {renderMediaItem(currentItems[itemIndex], itemIndex, true)}
                </div>
                <div className="flex-1 min-w-0">
                  {renderMediaItem(currentItems[itemIndex + 1], itemIndex + 1, true)}
                </div>
              </div>
            );
            itemIndex += 2;
          } else {
            elements.push(
              <div key={`grid-${itemIndex}`} className="col-span-1 row-span-1">
                {renderMediaItem(item, itemIndex)}
              </div>
            );
            itemIndex++;
          }
          break;

        case 3: // Horizontal wide (spans 2 columns)
          elements.push(
            <div key={`grid-${itemIndex}`} className="col-span-2 row-span-1">
              <div className="aspect-[2/1] relative overflow-hidden group cursor-pointer" onClick={() => handleImageClick(itemIndex)}>
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
                      <div className="w-16 h-16 bg-foreground/20 backdrop-blur-sm flex items-center justify-center">
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
                <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  {(item.category || item.subcategory) && (
                    <span className="text-[10px] font-light font-mono text-white/80 uppercase tracking-wider mb-1 block">
                      {item.category ? getCategoryLabel(item.category) : ''}{item.category && item.subcategory ? ' · ' : ''}{item.subcategory ? getSubcategoryLabel(item.subcategory) : ''}
                    </span>
                  )}
                  <h3 className="font-light text-lg text-white uppercase">{item.title}</h3>
                </div>
              </div>
            </div>
          );
          itemIndex++;
          break;

        case 4: // Vertical tall (spans 2 rows) - desktop only
          elements.push(
            <div key={`grid-${itemIndex}`} className="col-span-1 row-span-2 hidden md:block">
              <div className="aspect-[1/2] relative overflow-hidden group cursor-pointer h-full" onClick={() => handleImageClick(itemIndex)}>
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
                      <div className="w-16 h-16 bg-foreground/20 backdrop-blur-sm flex items-center justify-center">
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
                <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  {(item.category || item.subcategory) && (
                    <span className="text-[10px] font-light font-mono text-white/80 uppercase tracking-wider mb-1 block">
                      {item.category ? getCategoryLabel(item.category) : ''}{item.category && item.subcategory ? ' · ' : ''}{item.subcategory ? getSubcategoryLabel(item.subcategory) : ''}
                    </span>
                  )}
                  <h3 className="font-light text-lg text-white uppercase">{item.title}</h3>
                </div>
              </div>
            </div>
          );
          // On mobile, render as normal square
          elements.push(
            <div key={`grid-${itemIndex}-mobile`} className="col-span-1 row-span-1 md:hidden">
              {renderMediaItem(item, itemIndex)}
            </div>
          );
          itemIndex++;
          break;

        default:
          elements.push(
            <div key={`grid-${itemIndex}`} className="col-span-1 row-span-1">
              {renderMediaItem(item, itemIndex)}
            </div>
          );
          itemIndex++;
      }
    }

    return elements;
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12 animate-fade-in-up">
          <h1 className="text-4xl lg:text-6xl font-bold mb-6 text-foreground">
            PORTFOLIO COMPLETO
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
          </div>
        </div>

        {/* Portfolio Grid with Pattern */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-4 auto-rows-fr">
          {renderGridWithPattern()}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center space-x-2 mt-12">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="border-foreground/30 hover:bg-foreground/10"
            >
              Anterior
            </Button>
            
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <Button
                key={page}
                variant={currentPage === page ? "default" : "outline"}
                size="sm"
                onClick={() => handlePageChange(page)}
                className={
                  currentPage === page 
                    ? "bg-foreground text-background"
                    : "border-foreground/30 hover:bg-foreground/10"
                }
              >
                {page}
              </Button>
            ))}
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="border-foreground/30 hover:bg-foreground/10"
            >
              Próxima
            </Button>
          </div>
        )}
      </div>

      {/* Image Modal */}
      <ImageModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        images={filteredItems.map(item => ({
          id: item.id,
          image: item.file_url,
          title: item.title,
          description: item.description || '',
          category: item.category ? getCategoryLabel(item.category) : '',
          subcategory: item.subcategory ? getSubcategoryLabel(item.subcategory) : '',
          media_type: item.media_type
        }))}
        currentIndex={currentImageIndex}
        onIndexChange={setCurrentImageIndex}
      />
    </div>
  );
};

export default PortfolioFull;
