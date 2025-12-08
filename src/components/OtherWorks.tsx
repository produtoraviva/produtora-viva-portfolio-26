import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import ImageModal from "./ImageModal";
import { LazyImage } from "./LazyImage";
import { Play } from "lucide-react";

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

const OtherWorks = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [otherWorksItems, setOtherWorksItems] = useState<PortfolioItem[]>([]);
  const [displayItems, setDisplayItems] = useState<PortfolioItem[]>([]);

  useEffect(() => {
    loadOtherWorksItems();
  }, []);

  // Randomly select 2 items when otherWorksItems changes
  useEffect(() => {
    if (otherWorksItems.length <= 2) {
      setDisplayItems(otherWorksItems);
    } else {
      // Use session-based seed for consistency during session
      const sessionSeed = sessionStorage.getItem('other_works_seed') || String(Date.now());
      if (!sessionStorage.getItem('other_works_seed')) {
        sessionStorage.setItem('other_works_seed', sessionSeed);
      }
      
      // Simple shuffle
      const shuffled = [...otherWorksItems].sort(() => {
        const random = Math.sin(parseInt(sessionSeed) * otherWorksItems.length) * 10000;
        return random - Math.floor(random);
      });
      
      setDisplayItems(shuffled.slice(0, 2));
    }
  }, [otherWorksItems]);

  const loadOtherWorksItems = async () => {
    try {
      const { data: items, error: itemsError } = await supabase
        .from('portfolio_items')
        .select('*')
        .eq('other_works_featured', true)
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

      setOtherWorksItems(processedItems);
    } catch (error) {
      console.error('Error loading other works items:', error);
    }
  };

  const handleImageClick = (index: number) => {
    setCurrentImageIndex(index);
    setModalOpen(true);
  };

  if (displayItems.length === 0) {
    return null;
  }

  return (
    <section className="max-w-[1600px] mx-auto px-4 py-24 border-t border-border">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 pb-4">
        <div>
          <p className="text-xs font-mono text-muted-foreground uppercase tracking-[0.3em] mb-4">
            Explore
          </p>
          <h2 className="text-3xl md:text-5xl font-light uppercase tracking-tighter">
            Alguns Outros
            <br />
            <span className="text-muted-foreground">Trabalhos</span>
          </h2>
        </div>
        
        <Link 
          to="/portfolio"
          className="mt-4 md:mt-0 text-sm uppercase tracking-[0.15em] text-foreground hover:text-foreground/80 transition-colors duration-300 border border-foreground hover:bg-foreground hover:text-background px-6 py-3 font-bold"
        >
          Ver Portfolio Completo
        </Link>
      </div>

      {/* Grid - Max 2 items, 1 item takes full width */}
      <div className={`grid gap-6 ${displayItems.length === 1 ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2'}`}>
        {displayItems.map((item, index) => (
          <div 
            key={item.id} 
            className="image-card group relative aspect-[4/3] overflow-hidden bg-secondary cursor-pointer"
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
            
            {/* Overlay */}
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

      {/* Image Modal */}
      <ImageModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        images={displayItems.map(item => ({
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

export default OtherWorks;
