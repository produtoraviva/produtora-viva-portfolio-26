import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Camera, Video, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import ImageModal from "./ImageModal";
import { LazyImage } from "./LazyImage";

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
  const [categories, setCategories] = useState<any[]>([]);

  useEffect(() => {
    loadFeaturedItems();
    loadCategories();
  }, []);

  const loadFeaturedItems = async () => {
    try {
      const { data: items, error: itemsError } = await supabase
        .from('portfolio_items')
        .select('*')
        .eq('homepage_featured', true)
        .eq('publish_status', 'published')
        .order('display_order');

      if (itemsError) throw itemsError;

      const { data: categories, error: categoriesError } = await supabase
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
        const category = categories?.find(cat => cat.id === item.category);
        const subcategory = subcategories?.find(sub => sub.id === item.subcategory);
        
        return {
          id: item.id,
          title: item.title,
          category: category?.name || 'Sem categoria',
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

  const loadCategories = async () => {
    const categoryFilters = [
      { id: "all", label: "Todos" },
      { id: "photo", label: "Fotos" },
      { id: "video", label: "Vídeos" },
    ];

    setCategories(categoryFilters);
  };

  const getRandomSelection = (items: PortfolioItem[], type: "photo" | "video", count: number) => {
    const filtered = items.filter(item => item.media_type === type);
    const shuffled = [...filtered].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
  };

  const filteredItems = (() => {
    if (activeCategory === "all") {
      const randomPhotos = getRandomSelection(featuredItems, "photo", 3);
      const randomVideos = getRandomSelection(featuredItems, "video", 3);
      return [...randomPhotos, ...randomVideos].sort(() => Math.random() - 0.5);
    }
    
    return featuredItems.filter((item) => item.media_type === activeCategory);
  })();

  const handleImageClick = (index: number) => {
    setCurrentImageIndex(index);
    setModalOpen(true);
  };

  return (
    <section id="portfolio" className="py-32 lg:py-40 bg-gradient-to-b from-white to-secondary/20">
      <div className="container mx-auto px-6 sm:px-8 lg:px-16">
        {/* Header */}
        <div className="text-center mb-24 max-w-3xl mx-auto">
          <div className="inline-flex items-center space-x-2 bg-white rounded-full px-6 py-3 mb-8 elegant-shadow">
            <span className="text-sm font-semibold text-foreground tracking-wide uppercase">
              Portfolio
            </span>
          </div>
          <h2 className="text-6xl lg:text-8xl font-display font-bold mb-8 tracking-tighter leading-none">
            Nossos <span className="gradient-text">Trabalhos</span>
          </h2>
          <p className="text-xl lg:text-2xl text-muted-foreground leading-relaxed font-light">
            Uma seleção dos nossos melhores projetos. Cada momento capturado com dedicação e arte.
          </p>
        </div>

        {/* Category Filters */}
        <div className="flex justify-center gap-4 mb-20">
          {categories.map((category) => (
            <Button
              key={category.id}
              variant={activeCategory === category.id ? "default" : "outline"}
              className={`${
                activeCategory === category.id
                  ? "bg-primary text-primary-foreground shadow-lg"
                  : "border-2 hover:bg-accent hover:border-primary/40"
              } rounded-full px-8 py-6 text-base font-semibold transition-all`}
              onClick={() => setActiveCategory(category.id)}
            >
              {category.label}
            </Button>
          ))}
        </div>

        {/* Portfolio Grid - 3 columns with complete images */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12">
          {filteredItems.map((item, index) => (
            <div 
              key={item.id} 
              className="portfolio-item group cursor-pointer"
              style={{ animationDelay: `${index * 0.1}s` }}
              onClick={() => handleImageClick(index)}
            >
              <div className="relative aspect-[4/3] overflow-hidden rounded-3xl">
                <LazyImage
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 flex items-end justify-center p-10 backdrop-blur-sm">
                  <div className="text-center text-white space-y-3 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                    {item.media_type === "video" ? (
                      <Video className="h-10 w-10 mx-auto mb-3" />
                    ) : (
                      <Camera className="h-10 w-10 mx-auto mb-3" />
                    )}
                    <h3 className="font-display font-semibold text-2xl">{item.title}</h3>
                    <p className="text-sm font-medium opacity-90">
                      {item.subcategory || item.category}
                    </p>
                    {item.description && (
                      <p className="text-sm opacity-80 max-w-xs mx-auto line-clamp-2">{item.description}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA to Full Portfolio */}
        <div className="text-center mt-28">
          <div className="bg-gradient-to-br from-secondary/80 to-accent/60 backdrop-blur-sm rounded-3xl p-16 max-w-3xl mx-auto elegant-shadow">
            <h3 className="text-4xl font-display font-bold text-foreground mb-6">
              Explore Mais
            </h3>
            <p className="text-muted-foreground mb-10 text-xl font-light leading-relaxed">
              Descubra nossa galeria completa com mais de 500 projetos realizados.
            </p>
            <Link to="/portfolio">
              <Button 
                size="lg"
                className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full px-12 py-8 hover-lift group shadow-lg text-base"
              >
                Ver Portfolio Completo
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Image Modal */}
      <ImageModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        images={filteredItems.map(item => ({
          id: item.id,
          image: item.image,
          title: item.title,
          description: item.description || '',
          category: item.category,
          subcategory: item.subcategory || ''
        }))}
        currentIndex={currentImageIndex}
        onIndexChange={setCurrentImageIndex}
      />
    </section>
  );
};

export default PortfolioPreview;
