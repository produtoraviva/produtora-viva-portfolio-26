import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Camera, Heart, Award, Users } from "lucide-react";

const About = () => {
  const values = [
    {
      icon: Heart,
      title: "Paixão",
      description: "Cada projeto é tratado com amor e dedicação únicos"
    },
    {
      icon: Camera,
      title: "Qualidade",
      description: "Equipamentos profissionais e técnicas cinematográficas"
    },
    {
      icon: Award,
      title: "Excelência",
      description: "Mais de 500 eventos realizados com perfeição"
    },
    {
      icon: Users,
      title: "Confiança",
      description: "98% de satisfação dos nossos clientes"
    }
  ];

  return (
    <section id="sobre" className="py-20 lg:py-32 bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Content */}
          <div className="space-y-8">
            <div>
              <Badge variant="outline" className="mb-4 border-primary/30 text-primary">
                Sobre Nós
              </Badge>
              <h2 className="text-4xl lg:text-6xl font-bold mb-6">
                Nossa <span className="bg-gradient-primary bg-clip-text text-transparent">História</span>
              </h2>
              <div className="space-y-4 text-lg text-muted-foreground">
                <p>
                  A <strong className="text-foreground">Produtora Viva</strong> nasceu da paixão por capturar 
                  momentos únicos e transformá-los em memórias eternas. Há mais de 5 anos no mercado, 
                  especializamo-nos em fotografia e videografia de alta qualidade.
                </p>
                <p>
                  Nossa missão é contar histórias através de imagens, criando um registro 
                  cinematográfico dos seus momentos mais preciosos. Cada projeto é único 
                  e recebe nossa atenção total e dedicação.
                </p>
                <p>
                  Com mais de <strong className="text-primary">500 eventos realizados</strong> e 
                  uma taxa de satisfação de <strong className="text-primary">98%</strong>, 
                  somos referência em São Paulo para casamentos, aniversários e eventos corporativos.
                </p>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-6">
              <div className="text-center p-4">
                <div className="text-3xl font-bold text-primary mb-2">500+</div>
                <div className="text-sm text-muted-foreground">Eventos Realizados</div>
              </div>
              <div className="text-center p-4">
                <div className="text-3xl font-bold text-primary mb-2">5</div>
                <div className="text-sm text-muted-foreground">Anos de Experiência</div>
              </div>
            </div>
          </div>

          {/* Values Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {values.map((value, index) => {
              const Icon = value.icon;
              return (
                <Card 
                  key={index}
                  className="p-6 bg-card border-border hover:bg-primary/5 transition-all duration-300 group"
                >
                  <div className="flex flex-col items-center text-center space-y-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg text-foreground mb-2">
                        {value.title}
                      </h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {value.description}
                      </p>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;