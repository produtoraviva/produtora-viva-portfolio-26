const About = () => {
  return (
    <section id="sobre" className="max-w-[1600px] mx-auto px-4 py-24 border-t border-border">
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
            <div className="text-5xl md:text-7xl font-bold tracking-tighter mb-2">500+</div>
            <div className="text-xs text-muted-foreground uppercase tracking-[0.2em]">Eventos</div>
          </div>
          <div className="border-l border-border pl-6 py-4">
            <div className="text-5xl md:text-7xl font-bold tracking-tighter mb-2">5</div>
            <div className="text-xs text-muted-foreground uppercase tracking-[0.2em]">Anos</div>
          </div>
          <div className="border-l border-border pl-6 py-4">
            <div className="text-5xl md:text-7xl font-bold tracking-tighter mb-2">98%</div>
            <div className="text-xs text-muted-foreground uppercase tracking-[0.2em]">Satisfação</div>
          </div>
          <div className="border-l border-border pl-6 py-4">
            <div className="text-5xl md:text-7xl font-bold tracking-tighter mb-2">24h</div>
            <div className="text-xs text-muted-foreground uppercase tracking-[0.2em]">Resposta</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
