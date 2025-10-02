import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Star } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface Testimonial {
  id: string;
  name: string;
  event: string;
  text: string;
  rating: number;
  image?: string;
}

export function TestimonialsInfiniteCarousel() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);

  useEffect(() => {
    loadTestimonials();
  }, []);

  const loadTestimonials = async () => {
    try {
      const { data, error } = await supabase
        .from('testimonials')
        .select('*')
        .eq('is_active', true)
        .eq('status', 'approved')
        .order('display_order', { ascending: true });

      if (error) throw error;
      
      // Duplicate testimonials for seamless loop
      const duplicated = data ? [...data, ...data, ...data] : [];
      setTestimonials(duplicated);
    } catch (error) {
      console.error('Error loading testimonials:', error);
    }
  };

  if (testimonials.length === 0) return null;

  return (
    <div className="relative w-full overflow-hidden py-12 bg-gradient-to-b from-background via-primary/5 to-background">
      <div className="absolute inset-0 bg-gradient-to-r from-background via-transparent to-background z-10 pointer-events-none" />
      
      <div className="flex animate-infinite-scroll hover:[animation-play-state:paused]">
        {testimonials.map((testimonial, index) => (
          <Card 
            key={`${testimonial.id}-${index}`}
            className="flex-shrink-0 w-[400px] mx-4 p-6 bg-card/80 backdrop-blur-sm border-primary/20 hover:border-primary/40 transition-all duration-300 hover:scale-105"
          >
            <div className="flex items-start gap-4">
              {testimonial.image && (
                <img
                  src={testimonial.image}
                  alt={testimonial.name}
                  className="w-16 h-16 rounded-full object-cover border-2 border-primary/30"
                />
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1 mb-2">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-sm text-foreground/90 line-clamp-3 mb-3">
                  "{testimonial.text}"
                </p>
                <div>
                  <p className="font-semibold text-foreground">{testimonial.name}</p>
                  {testimonial.event && (
                    <p className="text-xs text-muted-foreground">{testimonial.event}</p>
                  )}
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
