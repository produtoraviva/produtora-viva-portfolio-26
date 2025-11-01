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
    <section id="sobre" className="py-32 lg:py-40 bg-gradient-to-br from-secondary/40 to-accent/30">
      <div className="container mx-auto px-6 sm:px-8 lg:px-16">
        <div className="grid lg:grid-cols-2 gap-20 lg:gap-24 items-center">
          {/* Content */}
          <div className="space-y-12">
            <div>
              <div className="inline-flex items-center space-x-2 bg-white rounded-full px-6 py-3 mb-10 elegant-shadow">
                <span className="text-sm font-semibold text-foreground tracking-wide uppercase">
                  Sobre Nós
                </span>
              </div>
              <h2 className="text-6xl lg:text-8xl font-display font-bold mb-10 tracking-tighter leading-none">
                Nossa <span className="gradient-text">História</span>
              </h2>
              <div className="space-y-6 text-lg lg:text-xl text-muted-foreground leading-relaxed font-light">
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
            <div className="grid grid-cols-2 gap-6 pt-6">
              <div className="text-center p-8 bg-white/80 backdrop-blur-sm rounded-3xl elegant-shadow">
                <div className="text-6xl font-display font-bold text-primary mb-3 tracking-tighter">500+</div>
                <div className="text-sm text-muted-foreground font-semibold uppercase tracking-wider">Eventos Realizados</div>
              </div>
              <div className="text-center p-8 bg-white/80 backdrop-blur-sm rounded-3xl elegant-shadow">
                <div className="text-6xl font-display font-bold text-primary mb-3 tracking-tighter">5</div>
                <div className="text-sm text-muted-foreground font-semibold uppercase tracking-wider">Anos de Experiência</div>
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
                  className="p-10 bg-white/90 backdrop-blur-sm border-0 elegant-shadow hover-lift group rounded-3xl"
                >
                  <div className="flex flex-col items-center text-center space-y-5">
                    <div className="w-20 h-20 bg-gradient-to-br from-secondary to-accent rounded-2xl flex items-center justify-center group-hover:from-primary/10 group-hover:to-primary/5 transition-all duration-500 shadow-sm">
                      <Icon className="h-10 w-10 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-display font-semibold text-2xl text-foreground mb-3 tracking-tight">
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
