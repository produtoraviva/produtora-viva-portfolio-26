import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Camera, Video, Heart, Gift, Users, Play, Eye } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Category {
  id: string;
  name: string;
  type?: string;
  custom_type?: string;
}

interface Subcategory {
  id: string;
  name: string;
  category_id: string;
}

interface PortfolioItem {
  id: string;
  title: string;
  description?: string;
  media_type: "photo" | "video";
  file_url: string;
  thumbnail_url?: string;
  category: string;
  subcategory?: string;
  publish_status: string;
  is_featured: boolean;
}

const Portfolio = () => {
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [activeSubcategory, setActiveSubcategory] = useState<string>("all");
  const [portfolioItems, setPortfolioItems] = useState<PortfolioItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      
      const [itemsResponse, categoriesResponse, subcategoriesResponse] = await Promise.all([
        supabase
          .from('portfolio_items')
          .select('*')
          .eq('publish_status', 'published')
          .order('display_order'),
        supabase
          .from('portfolio_categories')
          .select('*')
          .eq('is_active', true)
          .order('display_order'),
        supabase
          .from('portfolio_subcategories')
          .select('*')
          .eq('is_active', true)
          .order('display_order')
      ]);

      if (itemsResponse.error) throw itemsResponse.error;
      if (categoriesResponse.error) throw categoriesResponse.error;
      if (subcategoriesResponse.error) throw subcategoriesResponse.error;

      setPortfolioItems((itemsResponse.data || []).map(item => ({
        ...item,
        media_type: item.media_type as "photo" | "video"
      })));
      setCategories(categoriesResponse.data || []);
      setSubcategories(subcategoriesResponse.data || []);
    } catch (error) {
      console.error('Error loading portfolio data:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao carregar dados do portfólio.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getCategoryDisplayName = (category: Category) => {
    if (category.type) {
      return category.type === 'photo' ? 'Foto' : category.type === 'video' ? 'Vídeo' : category.type;
    }
    return category.custom_type || category.name;
  };

  const getCategoryIcon = (category: Category) => {
    if (category.type === 'photo') return Camera;
    if (category.type === 'video') return Video;
    return Camera; // Default icon for custom types
  };

  const getSubcategoryIcon = () => {
    return Heart; // Default icon for subcategories
  };

  const filteredItems = portfolioItems.filter(item => {
    const categoryMatch = activeCategory === "all" || item.category === activeCategory;
    const subcategoryMatch = activeSubcategory === "all" || item.subcategory === activeSubcategory;
    return categoryMatch && subcategoryMatch;
  });

  const openImageModal = (index: number) => {
    // This function would open an image modal - implementation depends on your modal component
    console.log('Opening image modal for item', index);
  };

  if (isLoading) {
    return (
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">Nosso Portfólio</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Explore nossa coleção de momentos especiais capturados com paixão e dedicação
          </p>
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap justify-center gap-4 mb-8">
          <Button
            variant={activeCategory === "all" ? "default" : "outline"}
            onClick={() => {
              setActiveCategory("all");
              setActiveSubcategory("all");
            }}
            className="flex items-center gap-2"
          >
            <Gift className="w-4 h-4" />
            Todos
          </Button>
          {categories.map((category) => {
            const IconComponent = getCategoryIcon(category);
            return (
              <Button
                key={category.id}
                variant={activeCategory === category.id ? "default" : "outline"}
                onClick={() => {
                  setActiveCategory(category.id);
                  setActiveSubcategory("all");
                }}
                className="flex items-center gap-2"
              >
                <IconComponent className="w-4 h-4" />
                {getCategoryDisplayName(category)}
              </Button>
            );
          })}
        </div>

        {/* Subcategory Filters */}
        {activeCategory !== "all" && (
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            <Button
              variant={activeSubcategory === "all" ? "secondary" : "ghost"}
              onClick={() => setActiveSubcategory("all")}
              size="sm"
            >
              Todas
            </Button>
            {subcategories
              .filter(sub => sub.category_id === activeCategory)
              .map((subcategory) => {
                const IconComponent = getSubcategoryIcon();
                return (
                  <Button
                    key={subcategory.id}
                    variant={activeSubcategory === subcategory.id ? "secondary" : "ghost"}
                    onClick={() => setActiveSubcategory(subcategory.id)}
                    size="sm"
                    className="flex items-center gap-1"
                  >
                    <IconComponent className="w-3 h-3" />
                    {subcategory.name}
                  </Button>
                );
              })}
          </div>
        )}

        {/* Portfolio Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredItems.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <p className="text-muted-foreground text-lg">
                Nenhum item encontrado para os filtros selecionados.
              </p>
            </div>
          ) : (
            filteredItems.map((item, index) => (
              <Card key={item.id} className="group overflow-hidden hover:shadow-lg transition-all duration-300">
                <div className="relative aspect-[4/3] overflow-hidden">
                  {item.media_type === "video" ? (
                    <div className="relative w-full h-full">
                      <img
                        src={item.thumbnail_url || item.file_url}
                        alt={item.title}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                        <Play className="w-12 h-12 text-white opacity-80" />
                      </div>
                    </div>
                  ) : (
                    <img
                      src={item.file_url}
                      alt={item.title}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                    />
                  )}
                  
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => openImageModal(index)}
                      className="flex items-center gap-2"
                    >
                      <Eye className="w-4 h-4" />
                      Ver Detalhes
                    </Button>
                  </div>
                  
                  {item.is_featured && (
                    <Badge className="absolute top-4 left-4 bg-primary">
                      Destaque
                    </Badge>
                  )}
                </div>
                
                <div className="p-6">
                  <h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">
                    {item.title}
                  </h3>
                  {item.description && (
                    <p className="text-muted-foreground mb-4 line-clamp-2">
                      {item.description}
                    </p>
                  )}
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">
                      {item.media_type === "photo" ? "Foto" : "Vídeo"}
                    </Badge>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
    </section>
  );
};

export default Portfolio;