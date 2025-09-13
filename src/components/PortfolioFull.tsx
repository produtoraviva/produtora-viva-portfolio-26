import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Camera, Video, Heart, Gift, Users, Play, Eye, Grid, List } from "lucide-react";
import ImageModal from "./ImageModal";
import { supabase } from "@/integrations/supabase/client";

type CategoryType = "all" | "photo" | "video";
type SubcategoryType = "all" | "casamento" | "aniversario" | "corporativo" | "familia";
type ViewType = "grid" | "masonry";

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
  const [activeSubcategory, setActiveSubcategory] = useState<SubcategoryType>("all");
  const [viewType, setViewType] = useState<ViewType>("grid");
  const [modalOpen, setModalOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [portfolioItems, setPortfolioItems] = useState<PortfolioItem[]>([]);
  const [loading, setLoading] = useState(true);
  const itemsPerPage = 12;

  useEffect(() => {
    loadPortfolioItems();
  }, []);

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

  const categories = [
    { id: "all", label: "Todos", icon: Eye },
    { id: "photo", label: "Fotografia", icon: Camera },
    { id: "video", label: "Videografia", icon: Video },
  ] as const;

  const subcategories = [
    { id: "all", label: "Todos", icon: Eye },
    { id: "casamento", label: "Casamentos", icon: Heart },
    { id: "aniversario", label: "Aniversários", icon: Gift },
    { id: "corporativo", label: "Corporativo", icon: Users },
    { id: "familia", label: "Família", icon: Users },
  ] as const;

  const filteredItems = portfolioItems.filter((item) => {
    const categoryMatch = activeCategory === "all" || item.media_type === activeCategory;
    const subcategoryMatch = activeSubcategory === "all" || item.category === activeSubcategory;
    return categoryMatch && subcategoryMatch;
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
  const handleCategoryChange = (category: CategoryType) => {
    setActiveCategory(category);
    setCurrentPage(1);
  };

  const handleSubcategoryChange = (subcategory: SubcategoryType) => {
    setActiveSubcategory(subcategory);
    setCurrentPage(1);
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'casamento': return 'Casamento';
      case 'aniversario': return 'Aniversário';
      case 'corporativo': return 'Corporativo';
      case 'familia': return 'Família';
      default: return category;
    }
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
          {/* Category Filters */}
          <div className="flex flex-wrap justify-center gap-4">
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
                  onClick={() => handleCategoryChange(category.id)}
                >
                  <Icon className="mr-2 h-4 w-4" />
                  {category.label}
                </Button>
              );
            })}
          </div>

          {/* Subcategory Filters */}
          <div className="flex flex-wrap justify-center gap-2">
            {subcategories.map((subcategory) => {
              const Icon = subcategory.icon;
              return (
                <Button
                  key={subcategory.id}
                  variant="ghost"
                  size="sm"
                  className={`${
                    activeSubcategory === subcategory.id
                      ? "bg-primary/20 text-primary"
                      : "text-muted-foreground hover:text-foreground"
                  } transition-all`}
                  onClick={() => handleSubcategoryChange(subcategory.id)}
                >
                  <Icon className="mr-1 h-3 w-3" />
                  {subcategory.label}
                </Button>
              );
            })}
          </div>

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
            <Card 
              key={item.id} 
              className="portfolio-item bg-card border-border overflow-hidden group cursor-pointer animate-fade-in-up"
              onClick={() => handleImageClick(index)}
            >
              <div className="relative aspect-[4/3] overflow-hidden">
                {item.media_type === 'video' ? (
                  <video
                    src={item.file_url}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    poster={item.thumbnail_url}
                  />
                ) : (
                  <img
                    src={item.thumbnail_url || item.file_url}
                    alt={item.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                )}
                <div className="portfolio-overlay">
                  <div className="text-center text-white space-y-2">
                    {item.media_type === "video" ? (
                      <Play className="h-8 w-8 mx-auto mb-2 opacity-80" />
                    ) : (
                      <Camera className="h-8 w-8 mx-auto mb-2 opacity-80" />
                    )}
                    <h3 className="font-semibold text-lg">{item.title}</h3>
                    <p className="text-sm opacity-80">{item.description}</p>
                  </div>
                </div>
              </div>
              
              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                    {item.title}
                  </h3>
                  {item.category && (
                    <Badge 
                      variant="secondary" 
                      className="capitalize bg-primary/10 text-primary border-0 flex-shrink-0 ml-2"
                    >
                      {getCategoryLabel(item.category)}
                    </Badge>
                  )}
                </div>
                {item.description && (
                  <p className="text-sm text-muted-foreground mb-2">{item.description}</p>
                )}
                <div className="text-xs text-muted-foreground space-y-1">
                  {item.date_taken && <div>{new Date(item.date_taken).toLocaleDateString('pt-BR')}</div>}
                  {item.location && <div>{item.location}</div>}
                </div>
              </div>
            </Card>
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
          category: item.media_type,
          subcategory: item.category as any,
          image: item.thumbnail_url || item.file_url,
          description: item.description || '',
          date: item.date_taken ? new Date(item.date_taken).toLocaleDateString('pt-BR') : '',
          location: item.location || ''
        }))}
        currentIndex={currentImageIndex}
        onIndexChange={setCurrentImageIndex}
      />
    </div>
  );
};

export default PortfolioFull;