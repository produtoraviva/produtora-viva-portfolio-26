import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Camera, Video, Users, Heart, CheckCircle, ArrowRight } from "lucide-react";

const Services = () => {
  const services = [
    {
      icon: Heart,
      title: "Casamentos",
      subtitle: "Seu grande dia merece ser eterno",
      description: "Cobertura completa do seu casamento com fotografia e filmagem cinematográfica",
      features: [
        "Ensaio pré-wedding",
        "Cerimônia e festa",
        "Making of da noiva",
        "Trailer cinematográfico",
        "Álbum premium incluído"
      ],
      price: "A partir de R$ 2.500",
      highlight: true
    },
    {
      icon: Camera,
      title: "Fotografia",
      subtitle: "Momentos congelados no tempo",
      description: "Sessões fotográficas profissionais para todos os tipos de eventos",
      features: [
        "Ensaios familiares",
        "Book de 15 anos",
        "Eventos corporativos",
        "Retratos profissionais",
        "Fotos editadas incluídas"
      ],
      price: "A partir de R$ 800",
      highlight: false
    },
    {
      icon: Video,
      title: "Videografia",
      subtitle: "Histórias em movimento",
      description: "Produção de vídeos cinematográficos com qualidade profissional",
      features: [
        "Filmagem 4K",
        "Edição cinematográfica",
        "Trilha sonora original",
        "Drone (quando permitido)",
        "Entrega em múltiplos formatos"
      ],
      price: "A partir de R$ 1.200",
      highlight: false
    },
    {
      icon: Users,
      title: "Corporativo",
      subtitle: "Sua marca em evidência",
      description: "Cobertura completa de eventos corporativos e institucionais",
      features: [
        "Eventos e congressos",
        "Fotos corporativas",
        "Vídeos institucionais",
        "Livestream",
        "Relatório fotográfico"
      ],
      price: "Sob consulta",
      highlight: false
    }
  ];

  const scrollToContact = () => {
    const element = document.querySelector("#contact");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section id="servicos" className="py-20 lg:py-32 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <Badge variant="outline" className="mb-4 border-primary/30 text-primary">
            Serviços
          </Badge>
          <h2 className="text-4xl lg:text-6xl font-bold mb-6">
            Nossos <span className="bg-gradient-primary bg-clip-text text-transparent">Serviços</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Oferecemos serviços especializados para capturar seus momentos especiais 
            com a qualidade e profissionalismo que você merece.
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {services.map((service, index) => {
            const Icon = service.icon;
            return (
              <Card
                key={index}
                className={`relative p-6 bg-card border-border hover:bg-primary/5 transition-all duration-300 group ${
                  service.highlight ? 'ring-2 ring-primary/20 bg-primary/5' : ''
                }`}
              >
                {service.highlight && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-gradient-primary text-dark">
                      Mais Popular
                    </Badge>
                  </div>
                )}
                
                <div className="space-y-4">
                  <div className="flex flex-col items-center text-center">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                      <Icon className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="font-bold text-xl text-foreground mb-1">
                      {service.title}
                    </h3>
                    <p className="text-sm text-primary font-medium mb-2">
                      {service.subtitle}
                    </p>
                    <p className="text-sm text-muted-foreground text-center leading-relaxed">
                      {service.description}
                    </p>
                  </div>

                  {/* Features */}
                  <div className="space-y-2">
                    {service.features.map((feature, featureIndex) => (
                      <div key={featureIndex} className="flex items-center text-sm">
                        <CheckCircle className="h-4 w-4 text-primary mr-2 flex-shrink-0" />
                        <span className="text-muted-foreground">{feature}</span>
                      </div>
                    ))}
                  </div>

                  {/* Price */}
                  <div className="text-center pt-4 border-t border-border">
                    <div className="text-lg font-bold text-foreground mb-4">
                      {service.price}
                    </div>
                    <Button
                      onClick={scrollToContact}
                      variant={service.highlight ? "default" : "outline"}
                      className={`w-full ${
                        service.highlight
                          ? "bg-gradient-primary hover:opacity-90"
                          : "border-primary/30 hover:bg-primary/10"
                      } group`}
                    >
                      Solicitar Orçamento
                      <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* CTA */}
        <div className="text-center mt-16">
          <p className="text-lg text-muted-foreground mb-6">
            Precisa de algo personalizado? Criamos pacotes sob medida para suas necessidades.
          </p>
          <Button
            onClick={scrollToContact}
            size="lg"
            className="bg-gradient-primary text-lg px-8 py-6 hover-scale"
          >
            Falar com Especialista
          </Button>
        </div>
      </div>
    </section>
  );
};

export default Services;