import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Camera, Video, Heart, Gift, Users, Play, Eye } from "lucide-react";

type CategoryType = "all" | "photo" | "video";
type SubcategoryType = "casamento" | "aniversario" | "corporativo" | "familia";

interface PortfolioItem {
  id: number;
  title: string;
  category: "photo" | "video";
  subcategory: SubcategoryType;
  image: string;
  description: string;
}

const Portfolio = () => {
  const [activeCategory, setActiveCategory] = useState<CategoryType>("all");
  const [activeSubcategory, setActiveSubcategory] = useState<SubcategoryType | "all">("all");

  // Mock data - Em produção, isso viria de uma API
  const portfolioItems: PortfolioItem[] = [
    {
      id: 1,
      title: "Casamento Ana & João",
      category: "photo",
      subcategory: "casamento",
      image: "https://images.unsplash.com/photo-1519741497674-611481863552?w=600&h=400&fit=crop",
      description: "Cerimônia emocionante no campo"
    },
    {
      id: 2,
      title: "Wedding Video - Maria & Carlos",
      category: "video",
      subcategory: "casamento",
      image: "https://images.unsplash.com/photo-1606216794074-735e91aa2c92?w=600&h=400&fit=crop",
      description: "Trailer cinematográfico do grande dia"
    },
    {
      id: 3,
      title: "Aniversário 15 Anos - Sofia",
      category: "photo",
      subcategory: "aniversario",
      image: "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=600&h=400&fit=crop",
      description: "Festa dos sonhos em tons dourados"
    },
    {
      id: 4,
      title: "Evento Corporativo - TechCorp",
      category: "video",
      subcategory: "corporativo",
      image: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=600&h=400&fit=crop",
      description: "Cobertura completa do lançamento"
    },
    {
      id: 5,
      title: "Ensaio Família Santos",
      category: "photo",
      subcategory: "familia",
      image: "https://images.unsplash.com/photo-1511895426328-dc8714aecd2d?w=600&h=400&fit=crop",
      description: "Momentos especiais em família"
    },
    {
      id: 6,
      title: "Festa 50 Anos - Roberto",
      category: "video",
      subcategory: "aniversario",
      image: "https://images.unsplash.com/photo-1464207687429-7505649dae38?w=600&h=400&fit=crop",
      description: "Celebração memorável com amigos"
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

  const filteredItems = portfolioItems.filter((item) => {
    const categoryMatch = activeCategory === "all" || item.category === activeCategory;
    const subcategoryMatch = activeSubcategory === "all" || item.subcategory === activeSubcategory;
    return categoryMatch && subcategoryMatch;
  });

  return (
    <section id="portfolio" className="py-20 lg:py-32 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <Badge variant="outline" className="mb-4 border-primary/30 text-primary">
            Portfolio
          </Badge>
          <h2 className="text-4xl lg:text-6xl font-bold mb-6">
            Nossos <span className="bg-gradient-primary bg-clip-text text-transparent">Trabalhos</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Cada projeto é único. Explore nossa galeria e veja como transformamos 
            momentos especiais em memórias inesquecíveis.
          </p>
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap justify-center gap-4 mb-8">
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

        {/* Subcategory Filters */}
        <div className="flex flex-wrap justify-center gap-2 mb-12">
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
                onClick={() => setActiveSubcategory(subcategory.id)}
              >
                <Icon className="mr-1 h-3 w-3" />
                {subcategory.label}
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
                      <Play className="h-12 w-12 mx-auto mb-2 opacity-80" />
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
                    {item.subcategory}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mt-2">{item.description}</p>
              </div>
            </Card>
          ))}
        </div>

        {/* Load More */}
        <div className="text-center mt-12">
          <Button 
            variant="outline" 
            size="lg"
            className="border-primary/30 hover:bg-primary/10 hover-scale"
          >
            Ver Mais Trabalhos
          </Button>
        </div>
      </div>
    </section>
  );
};

export default Portfolio;