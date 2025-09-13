import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Camera, Video, Heart, Gift, Users, Play, Eye, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import ImageModal from "./ImageModal";

type CategoryType = "all" | "photo" | "video";

interface PortfolioItem {
  id: number;
  title: string;
  category: "photo" | "video";
  subcategory: "casamento" | "aniversario" | "corporativo" | "familia";
  image: string;
  description: string;
}

const PortfolioPreview = () => {
  const [activeCategory, setActiveCategory] = useState<CategoryType>("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Apenas os 6 melhores trabalhos para preview
  const featuredItems: PortfolioItem[] = [
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

  const filteredItems = featuredItems.filter((item) => {
    return activeCategory === "all" || item.category === activeCategory;
  });

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
        images={filteredItems}
        currentIndex={currentImageIndex}
        onIndexChange={setCurrentImageIndex}
      />
    </section>
  );
};

export default PortfolioPreview;