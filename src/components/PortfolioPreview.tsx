import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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
    <section id="portfolio" className="py-24 lg:py-32 bg-white">
      <div className="container mx-auto px-6 sm:px-8 lg:px-16">
        {/* Header */}
        <div className="text-center mb-20 max-w-3xl mx-auto">
          <div className="inline-flex items-center space-x-2 bg-secondary rounded-full px-5 py-2.5 mb-6">
            <span className="text-sm font-medium text-foreground tracking-wide">
              Portfolio
            </span>
          </div>
          <h2 className="text-5xl lg:text-7xl font-bold mb-6 tracking-tighter">
            Nossos <span className="text-primary">Trabalhos</span>
          </h2>
          <p className="text-xl text-muted-foreground leading-relaxed font-light">
            Uma seleção dos nossos melhores projetos. Cada momento capturado com dedicação e arte.
          </p>
        </div>

        {/* Category Filters */}
        <div className="flex justify-center gap-3 mb-16">
          {categories.map((category) => (
            <Button
              key={category.id}
              variant={activeCategory === category.id ? "default" : "outline"}
              className={`${
                activeCategory === category.id
                  ? "bg-primary text-primary-foreground"
                  : "border-2 hover:bg-accent"
              } rounded-full px-8 py-6 text-base transition-all`}
              onClick={() => setActiveCategory(category.id)}
            >
              {category.label}
            </Button>
          ))}
        </div>

        {/* Portfolio Grid - 3 columns with complete images */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10">
          {filteredItems.map((item, index) => (
            <Card 
              key={item.id} 
              className="portfolio-item group cursor-pointer border-0"
              style={{ animationDelay: `${index * 0.1}s` }}
              onClick={() => handleImageClick(index)}
            >
              <div className="relative aspect-[4/3] overflow-hidden rounded-2xl image-hover">
                <LazyImage
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover"
                />
                <div className="portfolio-overlay">
                  <div className="text-center text-foreground space-y-3">
                    {item.media_type === "video" ? (
                      <Video className="h-10 w-10 mx-auto mb-3 text-primary" />
                    ) : (
                      <Camera className="h-10 w-10 mx-auto mb-3 text-primary" />
                    )}
                    <h3 className="font-semibold text-xl">{item.title}</h3>
                    {item.description && (
                      <p className="text-sm text-muted-foreground max-w-xs mx-auto">{item.description}</p>
                    )}
                  </div>
                </div>
              </div>
              <div className="p-6 space-y-2">
                <h3 className="font-semibold text-lg text-foreground group-hover:text-primary transition-colors">
                  {item.title}
                </h3>
                <p className="text-sm text-muted-foreground font-medium">
                  {item.subcategory || item.category}
                </p>
              </div>
            </Card>
          ))}
        </div>

        {/* CTA to Full Portfolio */}
        <div className="text-center mt-24">
          <div className="bg-secondary/50 rounded-3xl p-12 max-w-2xl mx-auto">
            <h3 className="text-3xl font-bold text-foreground mb-4">
              Explore Mais
            </h3>
            <p className="text-muted-foreground mb-8 text-lg">
              Descubra nossa galeria completa com mais de 500 projetos realizados.
            </p>
            <Link to="/portfolio">
              <Button 
                size="lg"
                className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full px-10 py-7 hover-lift group"
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
