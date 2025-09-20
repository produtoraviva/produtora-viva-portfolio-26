import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Camera, Video, Play, Eye, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import ImageModal from "./ImageModal";
import { LazyImage } from "./LazyImage";
import { LoadingSpinner } from "./LoadingSpinner";

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
      // Primeiro buscar os itens da homepage
      const { data: items, error: itemsError } = await supabase
        .from('portfolio_items')
        .select('*')
        .eq('homepage_featured', true)
        .eq('publish_status', 'published')
        .order('display_order');

      if (itemsError) throw itemsError;

      // Buscar categorias separadamente
      const { data: categories, error: categoriesError } = await supabase
        .from('portfolio_categories')
        .select('*')
        .eq('is_active', true);

      if (categoriesError) throw categoriesError;

      // Buscar subcategorias separadamente  
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
    try {
      const { data, error } = await supabase
        .from('portfolio_categories')
        .select('*')
        .eq('is_active', true)
        .order('display_order');

      if (error) throw error;

      const categoryFilters = [
        { id: "all", label: "Todos", icon: Eye },
        { id: "photo", label: "Fotografia", icon: Camera },
        { id: "video", label: "Videografia", icon: Video },
      ];

      setCategories(categoryFilters);
    } catch (error) {
      console.error('Error loading categories:', error);
      // Fallback para categorias padrão
      setCategories([
        { id: "all", label: "Todos", icon: Eye },
        { id: "photo", label: "Fotografia", icon: Camera },
        { id: "video", label: "Videografia", icon: Video },
      ]);
    }
  };

  const getRandomSelection = (items: PortfolioItem[], type: "photo" | "video", count: number) => {
    const filtered = items.filter(item => item.media_type === type);
    const shuffled = [...filtered].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
  };

  const filteredItems = (() => {
    if (activeCategory === "all") {
      // Seleciona aleatoriamente 3 fotos + 3 vídeos dos itens da homepage
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
    <section id="portfolio" className="py-20 lg:py-32 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <Badge variant="outline" className="mb-4 border-primary/30 text-primary">
            Portfolio
          </Badge>
          <h2 className="text-4xl lg:text-6xl font-bold mb-6">
            Nossos <span className="bg-gradient-primary bg-clip-text text-transparent">Destaques</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Uma seleção dos nossos melhores trabalhos. Cada projeto é único e 
            recebe toda nossa dedicação para criar memórias inesquecíveis.
          </p>
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          {categories.map((category) => {
            const Icon = category.icon;
            return (
              <Button
                key={category.id}
                variant={activeCategory === category.id ? "default" : "outline"}
                className={`${
                  activeCategory === category.id
                    ? "bg-gradient-primary"
                    : "border-primary/30 hover:bg-primary/10"
                } transition-all hover-scale`}
                onClick={() => setActiveCategory(category.id)}
              >
                <Icon className="mr-2 h-4 w-4" />
                {category.label}
              </Button>
            );
          })}
        </div>

        {/* Portfolio Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {filteredItems.map((item, index) => (
            <Card 
              key={item.id} 
              className="portfolio-item bg-card border-border overflow-hidden group cursor-pointer"
              style={{ animationDelay: `${index * 100}ms` }}
              onClick={() => handleImageClick(index)}
            >
              <div className="relative aspect-[4/3] overflow-hidden">
                <LazyImage
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full transition-transform duration-500 group-hover:scale-110"
                />
                <div className="portfolio-overlay">
                  <div className="text-center text-white space-y-2">
                 {item.media_type === "video" ? (
                      <Video className="h-12 w-12 mx-auto mb-2 opacity-80" />
                    ) : (
                      <Camera className="h-12 w-12 mx-auto mb-2 opacity-80" />
                    )}
                    <h3 className="font-semibold text-lg">{item.title}</h3>
                    <p className="text-sm opacity-80">{item.description}</p>
                  </div>
                </div>
              </div>
              <div className="p-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                    {item.title}
                  </h3>
                  <Badge 
                    variant="secondary" 
                    className="capitalize bg-primary/10 text-primary border-0"
                  >
                    {item.subcategory || item.category}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mt-2">{item.description}</p>
              </div>
            </Card>
          ))}
        </div>

        {/* CTA to Full Portfolio */}
        <div className="text-center mt-16">
          <div className="bg-muted/30 rounded-2xl p-8 max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold text-foreground mb-4">
              Gostou do que viu?
            </h3>
            <p className="text-muted-foreground mb-6">
              Explore nossa galeria completa com mais de 500 projetos realizados 
              e descubra a qualidade que pode ser sua também.
            </p>
            <Link to="/portfolio">
              <Button 
                size="lg"
                className="bg-gradient-primary text-lg px-8 py-6 hover-scale group"
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