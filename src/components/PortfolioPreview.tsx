import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import ImageModal from "./ImageModal";
import { LazyImage } from "./LazyImage";
import { Play } from "lucide-react";

type CategoryType = "all" | "photo" | "video";

interface PortfolioItem {
  id: string;
  title: string;
  category: string;
  subcategory?: string;
  image: string;
  description?: string;
  media_type: "photo" | "video";
  file_url: string;
  thumbnail_url?: string;
}

const PortfolioPreview = () => {
  const [activeCategory, setActiveCategory] = useState<CategoryType>("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [featuredItems, setFeaturedItems] = useState<PortfolioItem[]>([]);
  const [displayItems, setDisplayItems] = useState<PortfolioItem[]>([]);

  const categories = [
    { id: "all", label: "Todos" },
    { id: "photo", label: "Foto" },
    { id: "video", label: "Vídeo" },
  ];

  useEffect(() => {
    loadFeaturedItems();
  }, []);

  // Randomly select items when featuredItems changes
  useEffect(() => {
    // Desktop: 6 items, Mobile: 5 items
    const isMobile = window.innerWidth < 768;
    const targetCount = isMobile ? 5 : 6;
    
    if (featuredItems.length <= targetCount) {
      setDisplayItems(featuredItems);
    } else {
      // Shuffle and pick random items
      const sessionSeed = sessionStorage.getItem('portfolio_seed') || String(Date.now());
      if (!sessionStorage.getItem('portfolio_seed')) {
        sessionStorage.setItem('portfolio_seed', sessionSeed);
      }
      
      const shuffled = [...featuredItems].sort(() => {
        const random = Math.sin(parseInt(sessionSeed) * featuredItems.length) * 10000;
        return random - Math.floor(random);
      });
      
      setDisplayItems(shuffled.slice(0, targetCount));
    }
  }, [featuredItems]);

  const loadFeaturedItems = async () => {
    try {
      const { data: items, error: itemsError } = await supabase
        .from('portfolio_items')
        .select('*')
        .eq('homepage_featured', true)
        .eq('publish_status', 'published')
        .order('display_order');

      if (itemsError) throw itemsError;

      const { data: categoriesData, error: categoriesError } = await supabase
        .from('portfolio_categories')
        .select('*')
        .eq('is_active', true);

      if (categoriesError) throw categoriesError;

      const { data: subcategories, error: subcategoriesError } = await supabase
        .from('portfolio_subcategories')
        .select('*')
        .eq('is_active', true);

      if (subcategoriesError) throw subcategoriesError;

      const processedItems = items?.map(item => {
        const category = categoriesData?.find(cat => cat.id === item.category);
        const subcategory = subcategories?.find(sub => sub.id === item.subcategory);
        
        return {
          id: item.id,
          title: item.title,
          category: category?.name || '',
          subcategory: subcategory?.name,
          image: item.thumbnail_url || item.file_url,
          description: item.description,
          media_type: item.media_type as "photo" | "video",
          file_url: item.file_url,
          thumbnail_url: item.thumbnail_url
        };
      }) || [];

      setFeaturedItems(processedItems);
    } catch (error) {
      console.error('Error loading featured items:', error);
    }
  };

  const filteredItems = (() => {
    const itemsToFilter = displayItems;
    if (activeCategory === "all") {
      return itemsToFilter;
    }
    return itemsToFilter.filter((item) => item.media_type === activeCategory);
  })();

  const handleImageClick = (index: number) => {
    setCurrentImageIndex(index);
    setModalOpen(true);
  };

  // Render item with category/subcategory above title
  const renderItem = (item: PortfolioItem, index: number, aspectClass: string, extraClass: string = '') => {
    const hasCategory = item.category && item.category.trim() !== '';
    const hasSubcategory = item.subcategory && item.subcategory.trim() !== '';

    return (
      <div 
        key={item.id} 
        className={`image-card group relative overflow-hidden bg-secondary cursor-pointer ${aspectClass} ${extraClass}`}
        onClick={() => handleImageClick(index)}
      >
        {/* Use thumbnail for videos if available */}
        {item.media_type === "video" && item.thumbnail_url ? (
          <img
            src={item.thumbnail_url}
            alt={item.title}
            className="w-full h-full object-cover transition-all duration-700"
          />
        ) : (
          <LazyImage
            src={item.image}
            alt={item.title}
            className="w-full h-full object-cover transition-all duration-700"
          />
        )}
        
        {/* Play Icon for Video */}
        {item.media_type === "video" && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-foreground/20 backdrop-blur-sm flex items-center justify-center transition-transform duration-300">
            <Play className="w-6 h-6 text-foreground ml-1" fill="currentColor" />
          </div>
        )}
        
        {/* Overlay - Category above, then title */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          {(hasCategory || hasSubcategory) && (
            <span className="text-[8px] md:text-[10px] font-light font-mono text-white/80 uppercase tracking-wider mb-1 block">
              {item.category}{hasCategory && hasSubcategory ? ' · ' : ''}{item.subcategory || ''}
            </span>
          )}
          <h3 className="text-sm md:text-lg font-light uppercase text-white">{item.title}</h3>
        </div>
      </div>
    );
  };

  // Desktop grid (6 items)
  const renderDesktopGrid = () => {
    const count = filteredItems.length;
    
    if (count === 0) return null;
    
    if (count === 1) {
      return (
        <div className="grid grid-cols-1">
          {renderItem(filteredItems[0], 0, 'aspect-video')}
        </div>
      );
    }
    
    if (count === 2) {
      return (
        <div className="grid grid-cols-2 gap-4">
          {filteredItems.map((item, index) => renderItem(item, index, 'aspect-square'))}
        </div>
      );
    }
    
    if (count === 3) {
      return (
        <div className="grid grid-cols-3 gap-4">
          {filteredItems.map((item, index) => renderItem(item, index, 'aspect-[3/4]'))}
        </div>
      );
    }
    
    if (count === 4) {
      return (
        <>
          <div className="grid grid-cols-3 gap-4">
            {filteredItems.slice(0, 3).map((item, index) => renderItem(item, index, 'aspect-[3/4]'))}
          </div>
          <div className="grid grid-cols-1 gap-4 mt-4">
            {renderItem(filteredItems[3], 3, 'aspect-video')}
          </div>
        </>
      );
    }
    
    if (count === 5) {
      return (
        <>
          <div className="grid grid-cols-3 gap-4">
            {filteredItems.slice(0, 3).map((item, index) => renderItem(item, index, 'aspect-[3/4]'))}
          </div>
          <div className="grid grid-cols-2 gap-4 mt-4">
            {filteredItems.slice(3).map((item, index) => renderItem(item, index + 3, 'aspect-square'))}
          </div>
        </>
      );
    }
    
    // 6 items: 2 rows of 3
    return (
      <div className="grid grid-cols-3 gap-4">
        {filteredItems.map((item, index) => renderItem(item, index, 'aspect-[3/4]'))}
      </div>
    );
  };

  // Mobile grid (5 items): 2 squares, 1 horizontal, 2 squares
  const renderMobileGrid = () => {
    const count = filteredItems.length;
    
    if (count === 0) return null;
    
    if (count === 1) {
      return (
        <div className="grid grid-cols-1">
          {renderItem(filteredItems[0], 0, 'aspect-video')}
        </div>
      );
    }
    
    if (count === 2) {
      return (
        <div className="grid grid-cols-2 gap-2">
          {filteredItems.map((item, index) => renderItem(item, index, 'aspect-square'))}
        </div>
      );
    }
    
    if (count === 3) {
      return (
        <>
          <div className="grid grid-cols-2 gap-2">
            {filteredItems.slice(0, 2).map((item, index) => renderItem(item, index, 'aspect-square'))}
          </div>
          <div className="grid grid-cols-1 gap-2 mt-2">
            {renderItem(filteredItems[2], 2, 'aspect-video')}
          </div>
        </>
      );
    }
    
    if (count === 4) {
      return (
        <>
          <div className="grid grid-cols-2 gap-2">
            {filteredItems.slice(0, 2).map((item, index) => renderItem(item, index, 'aspect-square'))}
          </div>
          <div className="grid grid-cols-1 gap-2 mt-2">
            {renderItem(filteredItems[2], 2, 'aspect-video')}
          </div>
          <div className="grid grid-cols-2 gap-2 mt-2">
            {renderItem(filteredItems[3], 3, 'aspect-square')}
          </div>
        </>
      );
    }
    
    // 5 items: Row 1: 2 squares, Row 2: 1 horizontal, Row 3: 2 squares
    return (
      <>
        <div className="grid grid-cols-2 gap-2">
          {filteredItems.slice(0, 2).map((item, index) => renderItem(item, index, 'aspect-square'))}
        </div>
        <div className="grid grid-cols-1 gap-2 mt-2">
          {renderItem(filteredItems[2], 2, 'aspect-video')}
        </div>
        <div className="grid grid-cols-2 gap-2 mt-2">
          {filteredItems.slice(3, 5).map((item, index) => renderItem(item, index + 3, 'aspect-square'))}
        </div>
      </>
    );
  };

  return (
    <section id="portfolio" className="max-w-[1600px] mx-auto px-4 py-24">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 border-b border-border pb-4">
        <h2 className="text-3xl md:text-5xl font-light uppercase tracking-tighter mb-4 md:mb-0">
          Projetos Recentes
        </h2>
        
        {/* Category Filters */}
        <div className="flex gap-4 text-xs uppercase text-muted-foreground">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id as CategoryType)}
              className={`transition-colors duration-300 ${
                activeCategory === category.id 
                  ? "text-foreground underline" 
                  : "hover:text-foreground"
              }`}
            >
              {category.label}
            </button>
          ))}
        </div>
      </div>

      {/* Portfolio Grid - Different for mobile and desktop */}
      <div className="hidden md:block">
        {renderDesktopGrid()}
      </div>
      <div className="block md:hidden">
        {renderMobileGrid()}
      </div>

      {/* CTA */}
      <div className="text-center mt-20">
        <Link 
          to="/portfolio"
          className="text-sm uppercase tracking-[0.15em] bg-foreground text-background hover:bg-foreground/90 transition-colors duration-300 px-8 py-4 font-bold inline-block"
        >
          Ver Portfolio Completo
        </Link>
      </div>

      {/* Image Modal */}
      <ImageModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        images={filteredItems.map(item => ({
          id: item.id,
          image: item.media_type === 'video' ? item.file_url : item.image,
          title: item.title,
          description: item.description || '',
          category: item.category,
          subcategory: item.subcategory || '',
          media_type: item.media_type
        }))}
        currentIndex={currentImageIndex}
        onIndexChange={setCurrentImageIndex}
      />
    </section>
  );
};

export default PortfolioPreview;
