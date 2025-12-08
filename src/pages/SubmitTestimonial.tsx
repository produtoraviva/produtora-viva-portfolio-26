import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Star, Upload, Image as ImageIcon, Home, ArrowLeft } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { SEOHead } from '@/components/SEOHead';
import WhatsAppButton from '@/components/WhatsAppButton';

export default function SubmitTestimonial() {
  const [name, setName] = useState('');
  const [event, setEvent] = useState('');
  const [text, setText] = useState('');
  const [rating, setRating] = useState(5);
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);
  const [backgroundImage, setBackgroundImage] = useState<string>('');
  const { toast } = useToast();
  const navigate = useNavigate();

  // Load homepage background
  useEffect(() => {
    const loadBackground = async () => {
      try {
        const { data, error } = await supabase
          .from('homepage_backgrounds')
          .select('*')
          .eq('is_active', true)
          .order('display_order', { ascending: true })
          .limit(1);
        
        if (!error && data && data.length > 0) {
          setBackgroundImage(data[0].file_url);
        }
      } catch (error) {
        console.error('Error loading background:', error);
      }
    };

    loadBackground();
  }, []);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadImage = async (file: File): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `testimonials/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('portfolio-media')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('portfolio-media')
        .getPublicUrl(filePath);

      return data.publicUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      return null;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim() && !text.trim()) {
      toast({
        title: 'Erro',
        description: 'Por favor, preencha pelo menos seu nome e depoimento.',
        variant: 'destructive',
      });
      return;
    }

    setSubmitting(true);

    try {
      let imageUrl = null;
      if (image) {
        imageUrl = await uploadImage(image);
      }

      const { error } = await supabase
        .from('testimonials')
        .insert({
          name: name.trim() || 'Anônimo',
          event: event.trim() || '',
          text: text.trim() || '',
          rating,
          image: imageUrl,
          status: 'pending',
          submitted_by: 'client',
          is_active: true,
        });

      if (error) throw error;

      toast({
        title: 'Depoimento enviado!',
        description: 'Obrigado! Seu depoimento está aguardando aprovação.',
      });

      setName('');
      setEvent('');
      setText('');
      setRating(5);
      setImage(null);
      setImagePreview('');

      setTimeout(() => {
        navigate('/');
      }, 2000);
    } catch (error) {
      console.error('Error submitting testimonial:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível enviar seu depoimento. Tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <SEOHead
        title="Enviar Depoimento"
        description="Compartilhe sua experiência conosco. Envie seu depoimento e nos conte como foi trabalhar em seu evento especial."
      />
      
      <div className="min-h-screen relative">
        {/* Background Image */}
        {backgroundImage && (
          <div className="fixed inset-0 z-0">
            <img 
              src={backgroundImage} 
              alt="" 
              className="w-full h-full object-cover opacity-30"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/90 to-background" />
          </div>
        )}

        {/* Content */}
        <div className="relative z-10 py-12 px-4">
          {/* Back to home button */}
          <div className="max-w-2xl mx-auto mb-8">
            <Link 
              to="/" 
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar ao início
            </Link>
          </div>

          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-10">
              <p className="text-xs font-mono text-muted-foreground uppercase tracking-[0.3em] mb-4">
                Feedback
              </p>
              <h1 className="text-3xl md:text-5xl font-bold uppercase tracking-tighter mb-4">
                Compartilhe sua
                <br />
                <span className="text-muted-foreground font-light">Experiência</span>
              </h1>
              <p className="text-muted-foreground max-w-md mx-auto">
                Seu feedback é muito importante para nós! Conte como foi sua experiência.
              </p>
            </div>

            <Card className="p-8 bg-background/80 backdrop-blur-sm border-border">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <Label htmlFor="name" className="text-sm uppercase tracking-wider">
                    Seu Nome
                  </Label>
                  <p className="text-xs text-muted-foreground mb-2">
                    Como você gostaria de ser identificado(a)
                  </p>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="João Silva"
                    className="bg-background/50"
                  />
                </div>

                <div>
                  <Label htmlFor="event" className="text-sm uppercase tracking-wider">
                    Tipo de Evento
                  </Label>
                  <p className="text-xs text-muted-foreground mb-2">
                    Qual foi o tipo de evento que fotografamos/filmamos
                  </p>
                  <Input
                    id="event"
                    value={event}
                    onChange={(e) => setEvent(e.target.value)}
                    placeholder="Casamento, Aniversário, Formatura..."
                    className="bg-background/50"
                  />
                </div>

                <div>
                  <Label htmlFor="rating" className="text-sm uppercase tracking-wider">
                    Avaliação
                  </Label>
                  <p className="text-xs text-muted-foreground mb-2">
                    De 1 a 5 estrelas, como avalia nosso trabalho
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        className="transition-transform hover:scale-110"
                      >
                        <Star
                          className={`w-8 h-8 ${
                            star <= rating
                              ? 'fill-foreground text-foreground'
                              : 'text-muted-foreground/30'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <Label htmlFor="text" className="text-sm uppercase tracking-wider">
                    Seu Depoimento
                  </Label>
                  <p className="text-xs text-muted-foreground mb-2">
                    Conte sua experiência e como foi trabalhar conosco
                  </p>
                  <Textarea
                    id="text"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Conte sua experiência..."
                    className="min-h-[150px] bg-background/50"
                  />
                </div>

                <div>
                  <Label htmlFor="image" className="text-sm uppercase tracking-wider">
                    Foto (opcional)
                  </Label>
                  <p className="text-xs text-muted-foreground mb-2">
                    Uma foto sua ou do evento para ilustrar o depoimento
                  </p>
                  <div className="mt-2">
                    {imagePreview ? (
                      <div className="relative">
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="w-full h-48 object-cover"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="absolute top-2 right-2"
                          onClick={() => {
                            setImage(null);
                            setImagePreview('');
                          }}
                        >
                          Remover
                        </Button>
                      </div>
                    ) : (
                      <label
                        htmlFor="image"
                        className="flex flex-col items-center justify-center w-full h-40 border border-dashed border-border cursor-pointer hover:border-foreground/50 transition-colors bg-background/30"
                      >
                        <div className="flex flex-col items-center justify-center py-6">
                          <ImageIcon className="w-10 h-10 mb-3 text-muted-foreground" />
                          <p className="text-sm text-muted-foreground">
                            <span className="font-medium">Clique para enviar</span>
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">PNG, JPG (MAX. 10MB)</p>
                        </div>
                        <input
                          id="image"
                          type="file"
                          className="hidden"
                          accept="image/*"
                          onChange={handleImageChange}
                        />
                      </label>
                    )}
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={() => navigate('/')}
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 bg-foreground text-background hover:bg-foreground/90"
                    disabled={submitting}
                  >
                    {submitting ? (
                      <>
                        <Upload className="w-4 h-4 mr-2 animate-spin" />
                        Enviando...
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4 mr-2" />
                        Enviar Depoimento
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </Card>

            {/* Home link at bottom */}
            <div className="text-center mt-8">
              <Link 
                to="/" 
                className="inline-flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors"
              >
                <Home className="h-4 w-4" />
                Página Inicial
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* WhatsApp Button */}
      <WhatsAppButton />
    </>
  );
}