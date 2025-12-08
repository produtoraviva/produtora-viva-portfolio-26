import { useState, useEffect, useRef } from 'react';

const useCountUp = (end: number, duration: number = 2000, startCounting: boolean = false) => {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    if (!startCounting) return;
    
    let startTime: number | null = null;
    const animate = (currentTime: number) => {
      if (startTime === null) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      // Ease out cubic
      const easeOut = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(easeOut * end));
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    requestAnimationFrame(animate);
  }, [end, duration, startCounting]);
  
  return count;
};

const About = () => {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.3 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const eventsCount = useCountUp(500, 2000, isVisible);
  const yearsCount = useCountUp(5, 1500, isVisible);
  const satisfactionCount = useCountUp(98, 1800, isVisible);
  const responseCount = useCountUp(24, 1200, isVisible);

  return (
    <section ref={sectionRef} id="sobre" className="max-w-[1600px] mx-auto px-4 py-24 border-t border-border">
      <div className="grid lg:grid-cols-2 gap-16 lg:gap-24">
        {/* Content */}
        <div className="space-y-8">
          <div>
            <p className="text-xs font-mono text-muted-foreground uppercase tracking-[0.3em] mb-4">
              Sobre Nós
            </p>
            <h2 className="text-4xl md:text-6xl font-bold uppercase tracking-tighter mb-8">
              Nossa
              <br />
              <span className="text-muted-foreground">História</span>
            </h2>
          </div>
          
          <div className="space-y-6 text-muted-foreground leading-relaxed">
            <p>
              Nossa empresa nasceu da paixão por capturar momentos únicos e transformá-los 
              em memórias eternas. Há mais de 5 anos no mercado, especializamo-nos em 
              fotografia e videografia de alta qualidade.
            </p>
            <p>
              Nossa missão é contar histórias através de imagens, criando um registro 
              cinematográfico dos seus momentos mais preciosos. Cada projeto é único 
              e recebe nossa atenção total e dedicação.
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-8">
          <div className="border-l border-border pl-6 py-4">
            <div className="text-5xl md:text-7xl font-bold tracking-tighter mb-2">{eventsCount}+</div>
            <div className="text-xs text-muted-foreground uppercase tracking-[0.2em]">Eventos</div>
          </div>
          <div className="border-l border-border pl-6 py-4">
            <div className="text-5xl md:text-7xl font-bold tracking-tighter mb-2">{yearsCount}</div>
            <div className="text-xs text-muted-foreground uppercase tracking-[0.2em]">Anos</div>
          </div>
          <div className="border-l border-border pl-6 py-4">
            <div className="text-5xl md:text-7xl font-bold tracking-tighter mb-2">{satisfactionCount}%</div>
            <div className="text-xs text-muted-foreground uppercase tracking-[0.2em]">Satisfação</div>
          </div>
          <div className="border-l border-border pl-6 py-4">
            <div className="text-5xl md:text-7xl font-bold tracking-tighter mb-2">{responseCount}h</div>
            <div className="text-xs text-muted-foreground uppercase tracking-[0.2em]">Resposta</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
