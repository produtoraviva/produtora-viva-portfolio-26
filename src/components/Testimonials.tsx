import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Star, Quote } from "lucide-react";
import { useState, useEffect, useRef } from "react";

const Testimonials = () => {
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [dragOffset, setDragOffset] = useState(0);
  const cardRef = useRef<HTMLDivElement>(null);

  const testimonials = [
    {
      name: "Ana & João Silva",
      event: "Casamento - Dezembro 2023",
      rating: 5,
      text: "A Produtora Viva superou todas nossas expectativas! As fotos ficaram incríveis e o vídeo do nosso casamento parece um filme. Profissionais extremamente atenciosos e talentosos. Recomendamos de olhos fechados!",
      image: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=100&h=100&fit=crop&crop=face"
    },
    {
      name: "Maria Santos",
      event: "15 Anos da Sofia - Outubro 2023",
      rating: 5,
      text: "O trabalho foi impecável! Captaram todos os momentos especiais da festa de 15 anos da minha filha. As fotos estão lindas e o vídeo emocionante. Toda a família ficou encantada com o resultado final.",
      image: "https://images.unsplash.com/photo-1494790108755-2616b612b11c?w=100&h=100&fit=crop&crop=face"
    },
    {
      name: "Carlos Oliveira",
      event: "Evento Corporativo - Setembro 2023",
      rating: 5,
      text: "Contratamos para o lançamento da nossa empresa e foi a melhor escolha! Profissionais pontuais, discretos e com um olhar artístico incrível. O material produzido foi fundamental para nossa estratégia de marketing.",
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face"
    },
    {
      name: "Família Rodrigues",
      event: "Ensaio Familiar - Novembro 2023",
      rating: 5,
      text: "Fazer o ensaio com vocês foi uma experiência maravilhosa! Conseguiram deixar todos à vontade, desde as crianças até os avós. As fotos ficaram naturais e cheias de amor. Já agendamos o próximo ensaio!",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face"
    }
  ];

  useEffect(() => {
    if (!isDragging) {
      const interval = setInterval(() => {
        setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [testimonials.length, isDragging]);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setStartX(e.clientX);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    
    const currentX = e.clientX;
    const diff = startX - currentX;
    
    // Update drag offset for visual feedback
    setDragOffset(diff * 0.3); // Damped movement
    
    if (Math.abs(diff) > 80) { // Minimum drag distance
      if (diff > 0) {
        // Drag left - next testimonial
        setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
      } else {
        // Drag right - previous testimonial
        setCurrentTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length);
      }
      setIsDragging(false);
      setDragOffset(0);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setDragOffset(0);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    setStartX(e.touches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    
    const currentX = e.touches[0].clientX;
    const diff = startX - currentX;
    
    // Update drag offset for visual feedback
    setDragOffset(diff * 0.3);
    
    if (Math.abs(diff) > 80) {
      if (diff > 0) {
        setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
      } else {
        setCurrentTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length);
      }
      setIsDragging(false);
      setDragOffset(0);
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    setDragOffset(0);
  };

  const currentData = testimonials[currentTestimonial];

  return (
    <section id="depoimentos" className="py-20 lg:py-32 bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <Badge variant="outline" className="mb-4 border-primary/30 text-primary">
            Depoimentos
          </Badge>
          <h2 className="text-4xl lg:text-6xl font-bold mb-6">
            Nossos <span className="bg-gradient-primary bg-clip-text text-transparent">Clientes</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            A satisfação dos nossos clientes é nossa maior recompensa. 
            Veja o que eles falam sobre nosso trabalho.
          </p>
        </div>

        {/* Main Testimonial */}
        <div className="max-w-4xl mx-auto">
          <Card 
            ref={cardRef}
            className="p-8 lg:p-12 bg-card border-border relative overflow-hidden cursor-grab active:cursor-grabbing select-none transition-transform duration-200"
            style={{
              transform: `translateX(${-dragOffset}px) ${isDragging ? 'scale(0.98)' : 'scale(1)'}`,
              boxShadow: isDragging ? '0 20px 40px -12px hsl(45 93% 61% / 0.2)' : undefined
            }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {/* Quote Icon */}
            <div className="absolute top-6 right-6 opacity-10">
              <Quote className="h-16 w-16 text-primary" />
            </div>

            <div className="relative z-10">
              {/* Stars */}
              <div className="flex justify-center mb-6">
                {[...Array(currentData.rating)].map((_, i) => (
                  <Star
                    key={i}
                    className="h-6 w-6 text-primary fill-current"
                  />
                ))}
              </div>

              {/* Testimonial Text */}
              <blockquote className="text-xl lg:text-2xl text-center text-foreground leading-relaxed mb-8 font-medium">
                "{currentData.text}"
              </blockquote>

              {/* Author Info */}
              <div className="flex items-center justify-center space-x-4">
                <div className="w-16 h-16 rounded-full overflow-hidden">
                  <img
                    src={currentData.image}
                    alt={currentData.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="text-center">
                  <div className="font-semibold text-lg text-foreground">
                    {currentData.name}
                  </div>
                  <div className="text-sm text-primary">
                    {currentData.event}
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Navigation Dots */}
          <div className="flex justify-center mt-8 space-x-3">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentTestimonial(index)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index === currentTestimonial
                    ? "bg-primary scale-125"
                    : "bg-primary/30 hover:bg-primary/50"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16 max-w-2xl mx-auto">
          <div className="text-center">
            <div className="text-4xl font-bold text-primary mb-2">98%</div>
            <div className="text-sm text-muted-foreground">Satisfação dos Clientes</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-primary mb-2">500+</div>
            <div className="text-sm text-muted-foreground">Eventos Realizados</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-primary mb-2">24h</div>
            <div className="text-sm text-muted-foreground">Tempo de Resposta</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;