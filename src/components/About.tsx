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
    <section id="sobre" className="py-24 lg:py-32 bg-secondary/30">
      <div className="container mx-auto px-6 sm:px-8 lg:px-16">
        <div className="grid lg:grid-cols-2 gap-20 items-center">
          {/* Content */}
          <div className="space-y-10">
            <div>
              <div className="inline-flex items-center space-x-2 bg-white rounded-full px-5 py-2.5 mb-8">
                <span className="text-sm font-medium text-foreground tracking-wide">
                  Sobre Nós
                </span>
              </div>
              <h2 className="text-5xl lg:text-7xl font-bold mb-8 tracking-tighter">
                Nossa <span className="text-primary">História</span>
              </h2>
              <div className="space-y-6 text-lg text-muted-foreground leading-relaxed font-light">
                <p>
                  Nossa empresa nasceu da paixão por capturar 
                  momentos únicos e transformá-los em memórias eternas. Há mais de 5 anos no mercado, 
                  especializamo-nos em fotografia e videografia de alta qualidade.
                </p>
                <p>
                  Nossa missão é contar histórias através de imagens, criando um registro 
                  cinematográfico dos seus momentos mais preciosos. Cada projeto é único 
                  e recebe nossa atenção total e dedicação.
                </p>
                <p>
                  Com mais de <strong className="text-primary font-semibold">500 eventos realizados</strong> e 
                  uma taxa de satisfação de <strong className="text-primary font-semibold">98%</strong>, 
                  somos referência em Foz do Iguaçu e Ciudad del Este.
                </p>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-8 pt-4">
              <div className="text-center p-6 bg-white rounded-2xl elegant-shadow">
                <div className="text-5xl font-bold text-primary mb-2 tracking-tight">500+</div>
                <div className="text-sm text-muted-foreground font-medium">Eventos Realizados</div>
              </div>
              <div className="text-center p-6 bg-white rounded-2xl elegant-shadow">
                <div className="text-5xl font-bold text-primary mb-2 tracking-tight">5</div>
                <div className="text-sm text-muted-foreground font-medium">Anos de Experiência</div>
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
                  className="p-8 bg-white border-0 elegant-shadow hover-lift group"
                >
                  <div className="flex flex-col items-center text-center space-y-4">
                    <div className="w-16 h-16 bg-secondary rounded-2xl flex items-center justify-center group-hover:bg-primary/10 transition-all duration-500">
                      <Icon className="h-8 w-8 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-xl text-foreground mb-3 tracking-tight">
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
