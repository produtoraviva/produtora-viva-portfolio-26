import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Phone, Mail, MapPin, Instagram, MessageCircle, Clock, Send, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useSiteSettings } from "@/hooks/useSiteSettings";
const Contact = () => {
  const { settings } = useSiteSettings();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    eventType: "",
    clientType: "",
    country: "",
    message: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.country) {
      toast({
        title: "Campo obrigatório",
        description: "Por favor, selecione seu país antes de enviar.",
        variant: "destructive"
      });
      return;
    }
    
    setIsSubmitting(true);

    // Determine which phone number to use based on country selection
    const phoneNumber = (formData.country === "Brasil") 
      ? settings.whatsapp_number 
      : settings.whatsapp_international || settings.whatsapp_number;
    
    const whatsappMessage = `🎥 *ORÇAMENTO - RUBENS PHOTOFILM* 📸

*Nome:* ${formData.name}
*Email:* ${formData.email}
*País:* ${formData.country}
*Tipo de Cliente:* ${formData.clientType || 'Não informado'}
*Tipo de Evento:* ${formData.eventType || 'Não especificado'}
*Mensagem:* ${formData.message}

Aguardo retorno. Obrigado!`;
    
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(whatsappMessage)}`;
    
    setTimeout(() => {
      toast({
        title: "Redirecionando para WhatsApp!",
        description: "Você será direcionado para o WhatsApp com sua mensagem."
      });
      window.open(whatsappUrl, '_blank');
      setFormData({
        name: "",
        email: "",
        eventType: "",
        clientType: "",
        country: "",
        message: ""
      });
      setIsSubmitting(false);
    }, 1000);
  };
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };
  return <section id="contact" className="py-20 lg:py-32 bg-gradient-dark">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <Badge variant="outline" className="mb-4 border-primary/30 text-primary">
            Contato
          </Badge>
          <h2 className="text-4xl lg:text-6xl font-bold mb-6">
            Vamos <span className="bg-gradient-primary bg-clip-text text-transparent">Conversar</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Pronto para capturar seus momentos especiais? Entre em contato e vamos 
            planejar juntos o seu evento inesquecível.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
          {/* Contact Info */}
          <div className="space-y-8">
            <div>
              <h3 className="text-2xl font-bold mb-6 text-foreground">
                Entre em Contato
              </h3>
              <p className="text-muted-foreground mb-8">
                Estamos sempre disponíveis para discutir seu projeto. 
                Escolha a forma de contato que preferir.
              </p>
            </div>

            <div className="space-y-6">
              {/* Phone */}
              <Card className="p-4 bg-card/50 border-border hover:bg-card/70 transition-all hover-scale group">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <Phone className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground">Telefone / WhatsApp</h4>
                    <p className="text-muted-foreground">{settings.contact_phone}</p>
                  </div>
                </div>
              </Card>

              {/* Email */}
              <Card className="p-4 bg-card/50 border-border hover:bg-card/70 transition-all hover-scale group">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <Mail className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground">Email</h4>
                    <p className="text-muted-foreground">{settings.contact_email}</p>
                  </div>
                </div>
              </Card>

              {/* Location */}
              <Card className="p-4 bg-card/50 border-border hover:bg-card/70 transition-all hover-scale group">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <MapPin className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground">Localização</h4>
                    <p className="text-muted-foreground">Foz do Iguaçu e Ciudad del Este - Atendemos toda a região</p>
                  </div>
                </div>
              </Card>

              {/* Hours */}
              <Card className="p-4 bg-card/50 border-border hover:bg-card/70 transition-all hover-scale group">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <Clock className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground">Horário de Atendimento</h4>
                    <p className="text-muted-foreground">Seg - Sex: 9h às 18h | Sáb: 9h às 15h</p>
                  </div>
                </div>
              </Card>
            </div>

            {/* Social Links - Desktop only */}
            <div className="pt-8 hidden lg:block">
              <h4 className="font-semibold text-foreground mb-4">Siga-nos nas Redes</h4>
              <div className="flex space-x-4">
                {settings.instagram_url && (
                  <a href={settings.instagram_url} target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" size="icon" className="border-primary/30 hover:bg-primary/10 hover-scale">
                      <Instagram className="h-5 w-5" />
                    </Button>
                  </a>
                )}
                {settings.facebook_url && (
                  <a href={settings.facebook_url} target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" size="icon" className="border-primary/30 hover:bg-primary/10 hover-scale">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                      </svg>
                    </Button>
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <Card className="p-8 bg-card/50 border-border elegant-shadow">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <h3 className="text-2xl font-bold mb-2 text-foreground">
                  Solicite seu Orçamento
                </h3>
                <p className="text-muted-foreground mb-6">
                  Preencha o formulário e receba uma proposta personalizada.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    Nome Completo
                  </label>
                  <Input name="name" value={formData.name} onChange={handleChange} placeholder="Seu nome" required className="bg-background/50 border-border focus:border-primary text-base" autoComplete="name" />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    Email
                  </label>
                  <Input name="email" type="email" value={formData.email} onChange={handleChange} placeholder="seu@email.com" required className="bg-background/50 border-border focus:border-primary text-base" autoComplete="email" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    Tipo de Evento
                  </label>
                  <Input name="eventType" value={formData.eventType} onChange={handleChange} placeholder="Ex: Casamento, Aniversário..." className="bg-background/50 border-border focus:border-primary text-base" />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    Tipo de Cliente
                  </label>
                  <div>
                    <Select value={formData.clientType} onValueChange={value => setFormData(prev => ({
                    ...prev,
                    clientType: value
                  }))}>
                      <SelectTrigger className="w-full bg-background/50 border-border focus:border-primary">
                        <SelectValue placeholder="Selecione o tipo de cliente" />
                      </SelectTrigger>
                      <SelectContent className="bg-popover text-foreground border border-border z-50">
                        <SelectItem value="Pessoa Física">Pessoa Física</SelectItem>
                        <SelectItem value="Empresa">Empresa</SelectItem>
                        <SelectItem value="Não sei">Não sei</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  País <span className="text-destructive">*</span>
                </label>
                <Select value={formData.country} onValueChange={value => setFormData(prev => ({
                  ...prev,
                  country: value
                }))} required>
                  <SelectTrigger className="w-full bg-background/50 border-border focus:border-primary">
                    <SelectValue placeholder="Selecione seu país" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover text-foreground border border-border z-50">
                    <SelectItem value="Brasil">Brasil</SelectItem>
                    <SelectItem value="Paraguay">Paraguay</SelectItem>
                    <SelectItem value="Outro país">Outro país</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Mensagem
                </label>
                <Textarea name="message" value={formData.message} onChange={handleChange} placeholder="Conte-nos mais sobre seu evento, data, local e o que você tem em mente..." rows={4} required className="bg-background/50 border-border focus:border-primary text-base" />
              </div>

              <Button type="submit" disabled={isSubmitting} className="w-full bg-gradient-primary hover-scale text-lg py-6">
                {isSubmitting ? <>
                    <div className="animate-spin mr-2 h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
                    Enviando...
                  </> : <>
                    <Send className="mr-2 h-5 w-5" />
                    Enviar Solicitação
                  </>}
              </Button>

              <div className="flex items-center justify-center text-sm text-muted-foreground">
                <CheckCircle className="h-4 w-4 mr-2 text-primary" />
                Resposta garantida em até 24 horas
              </div>
            </form>
          </Card>
        </div>

        {/* Social Links - Mobile only, positioned after form */}
        <div className="lg:hidden mt-12 text-center mobile-safe-area">
          <h4 className="font-semibold text-foreground mb-6">Siga-nos nas Redes</h4>
          <div className="flex justify-center space-x-6">
            {settings.instagram_url && (
              <a href={settings.instagram_url} target="_blank" rel="noopener noreferrer">
                <Button variant="outline" size="icon" className="border-primary/30 hover:bg-primary/10 hover-scale h-12 w-12">
                  <Instagram className="h-6 w-6" />
                </Button>
              </a>
            )}
            {settings.facebook_url && (
              <a href={settings.facebook_url} target="_blank" rel="noopener noreferrer">
                <Button variant="outline" size="icon" className="border-primary/30 hover:bg-primary/10 hover-scale h-12 w-12">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                </Button>
              </a>
            )}
          </div>
        </div>
      </div>
    </section>;
};
export default Contact;