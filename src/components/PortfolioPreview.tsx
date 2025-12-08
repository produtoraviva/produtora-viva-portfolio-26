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

  // Randomly select 6 items when featuredItems changes
  useEffect(() => {
    if (featuredItems.length <= 6) {
      setDisplayItems(featuredItems);
    } else {
      // Shuffle and pick 6 random items - use a seeded approach based on session
      const sessionSeed = sessionStorage.getItem('portfolio_seed') || String(Date.now());
      if (!sessionStorage.getItem('portfolio_seed')) {
        sessionStorage.setItem('portfolio_seed', sessionSeed);
      }
      
      // Simple shuffle using the seed
      const shuffled = [...featuredItems].sort(() => {
        const random = Math.sin(parseInt(sessionSeed) * featuredItems.length) * 10000;
        return random - Math.floor(random);
      });
      
      setDisplayItems(shuffled.slice(0, 6));
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

  // Dynamic grid based on item count
  const getGridClass = () => {
    const count = filteredItems.length;
    if (count === 1) return 'grid-cols-1';
    if (count === 2) return 'grid-cols-1 md:grid-cols-2';
    if (count === 3) return 'grid-cols-1 md:grid-cols-3';
    if (count === 4) return 'grid-cols-2 md:grid-cols-2 lg:grid-cols-4';
    if (count === 5) return 'grid-cols-2 md:grid-cols-3 lg:grid-cols-3';
    return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3';
  };

  const handleImageClick = (index: number) => {
    setCurrentImageIndex(index);
    setModalOpen(true);
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

      {/* Portfolio Grid - Dynamic based on count */}
      <div className={`grid gap-4 ${getGridClass()}`}>
        {filteredItems.map((item, index) => (
          <div 
            key={item.id} 
            className="image-card group relative aspect-[3/4] overflow-hidden bg-secondary cursor-pointer"
            onClick={() => handleImageClick(index)}
          >
            {/* Use thumbnail for videos if available */}
            {item.media_type === "video" && item.thumbnail_url ? (
              <img
                src={item.thumbnail_url}
                alt={item.title}
                className="w-full h-full object-cover transition-all duration-700 opacity-80 group-hover:opacity-100"
              />
            ) : (
              <LazyImage
                src={item.image}
                alt={item.title}
                className="w-full h-full object-cover transition-all duration-700 opacity-80 group-hover:opacity-100"
              />
            )}
            
            {/* Play Icon for Video */}
            {item.media_type === "video" && (
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-foreground/20 backdrop-blur-sm flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Play className="w-6 h-6 text-foreground ml-1" fill="currentColor" />
              </div>
            )}
            
            {/* Overlay - Only show category if it exists and is not empty */}
            <div className="portfolio-overlay">
              {(item.subcategory || (item.category && item.category.trim() !== '')) && (
                <span className="text-[10px] font-mono border border-foreground/30 w-fit px-2 py-0.5 mb-2">
                  {item.subcategory || item.category}
                </span>
              )}
              <h3 className="text-xl font-bold uppercase">{item.title}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* CTA */}
      <div className="text-center mt-20">
        <Link 
          to="/portfolio"
          className="text-sm uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground transition-colors duration-300 border-b border-muted-foreground hover:border-foreground pb-1 font-bold"
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