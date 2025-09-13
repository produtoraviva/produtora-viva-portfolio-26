import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Camera, Video, Heart, Gift, Users, Play, Eye, Grid, List } from "lucide-react";
import ImageModal from "./ImageModal";

type CategoryType = "all" | "photo" | "video";
type SubcategoryType = "all" | "casamento" | "aniversario" | "corporativo" | "familia";
type ViewType = "grid" | "masonry";

interface PortfolioItem {
  id: number;
  title: string;
  category: "photo" | "video";
  subcategory: "casamento" | "aniversario" | "corporativo" | "familia";
  image: string;
  description: string;
  date: string;
  location: string;
}

const PortfolioFull = () => {
  const [activeCategory, setActiveCategory] = useState<CategoryType>("all");
  const [activeSubcategory, setActiveSubcategory] = useState<SubcategoryType>("all");
  const [viewType, setViewType] = useState<ViewType>("grid");
  const [modalOpen, setModalOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  // Portfolio completo com mais itens
  const allPortfolioItems: PortfolioItem[] = [
    {
      id: 1,
      title: "Casamento Ana & João",
      category: "photo",
      subcategory: "casamento",
      image: "https://images.unsplash.com/photo-1519741497674-611481863552?w=600&h=400&fit=crop",
      description: "Cerimônia emocionante no campo",
      date: "15 de Dezembro, 2023",
      location: "Fazenda Villa Bianca, Atibaia"
    },
    {
      id: 2,
      title: "Wedding Video - Maria & Carlos",
      category: "video",
      subcategory: "casamento",
      image: "https://images.unsplash.com/photo-1606216794074-735e91aa2c92?w=600&h=400&fit=crop",
      description: "Trailer cinematográfico do grande dia",
      date: "22 de Outubro, 2023",
      location: "Igreja São Pedro, São Paulo"
    },
    {
      id: 3,
      title: "Aniversário 15 Anos - Sofia",
      category: "photo",
      subcategory: "aniversario",
      image: "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=600&h=400&fit=crop",
      description: "Festa dos sonhos em tons dourados",
      date: "08 de Setembro, 2023",
      location: "Buffet Espação Gardens, São Paulo"
    },
    // Adicionar mais itens...
    {
      id: 4,
      title: "Evento Corporativo - TechCorp",
      category: "video",
      subcategory: "corporativo",
      image: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=600&h=400&fit=crop",
      description: "Cobertura completa do lançamento",
      date: "12 de Novembro, 2023",
      location: "Centro de Convenções Frei Caneca"
    },
    {
      id: 5,
      title: "Ensaio Família Santos",
      category: "photo",
      subcategory: "familia",
      image: "https://images.unsplash.com/photo-1511895426328-dc8714aecd2d?w=600&h=400&fit=crop",
      description: "Momentos especiais em família",
      date: "30 de Agosto, 2023",
      location: "Parque Ibirapuera, São Paulo"
    },
    {
      id: 6,
      title: "Festa 50 Anos - Roberto",
      category: "video",
      subcategory: "aniversario",
      image: "https://images.unsplash.com/photo-1464207687429-7505649dae38?w=600&h=400&fit=crop",
      description: "Celebração memorável com amigos",
      date: "18 de Julho, 2023",
      location: "Clube Hípico, São Paulo"
    },
    // Adicionar mais itens para demonstrar paginação...
    {
      id: 7,
      title: "Casamento Patricia & Ricardo",
      category: "photo",
      subcategory: "casamento",
      image: "https://images.unsplash.com/photo-1525258406671-a05ad04ce693?w=600&h=400&fit=crop",
      description: "Cerimônia na praia ao pôr do sol",
      date: "05 de Junho, 2023",
      location: "Riviera de São Lourenço, Bertioga"
    },
    {
      id: 8,
      title: "Aniversário 60 Anos - Dona Helena",
      category: "photo",
      subcategory: "aniversario",
      image: "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=600&h=400&fit=crop",
      description: "Festa em família com muito amor",
      date: "20 de Maio, 2023",
      location: "Residência Familiar, Morumbi"
    },
  ];

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

  const filteredItems = allPortfolioItems.filter((item) => {
    const categoryMatch = activeCategory === "all" || item.category === activeCategory;
    const subcategoryMatch = activeSubcategory === "all" || item.subcategory === activeSubcategory;
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

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12 animate-fade-in-up">
          <h1 className="text-4xl lg:text-6xl font-bold mb-6">
            Portfolio <span className="bg-gradient-primary bg-clip-text text-transparent">Completo</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto animate-fade-in-delayed">
            Explore nossa galeria completa com mais de 500 projetos realizados. 
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
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="portfolio-overlay">
                  <div className="text-center text-white space-y-2">
                    {item.category === "video" ? (
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
                  <Badge 
                    variant="secondary" 
                    className="capitalize bg-primary/10 text-primary border-0 flex-shrink-0 ml-2"
                  >
                    {item.subcategory}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-2">{item.description}</p>
                <div className="text-xs text-muted-foreground space-y-1">
                  <div>{item.date}</div>
                  <div>{item.location}</div>
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
        images={filteredItems}
        currentIndex={currentImageIndex}
        onIndexChange={setCurrentImageIndex}
      />
    </div>
  );
};

export default PortfolioFull;