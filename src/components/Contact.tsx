import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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

    const isBrazil = formData.country.toLowerCase() === 'brasil' || formData.country.toLowerCase() === 'brazil';
    const phoneNumber = isBrazil 
      ? (settings.whatsapp_number || '5545999887766')
      : (settings.whatsapp_international || settings.whatsapp_number || '5545999887766');
    
    const whatsappMessage = `🎥 *ORÇAMENTO - RUBENS PHOTOFILM* 📸

*Nome:* ${formData.name}
*Email:* ${formData.email}
*País:* ${formData.country}
*Tipo de Cliente:* ${formData.clientType || 'Não informado'}
*Tipo de Evento:* ${formData.eventType || 'Não especificado'}
*Mensagem:* ${formData.message}

Aguardo retorno. Obrigado!`;
    
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(whatsappMessage)}`;
    
    const whatsappWindow = window.open(whatsappUrl, '_blank');
    
    toast({
      title: "Abrindo WhatsApp!",
      description: "Você será direcionado para o WhatsApp com sua mensagem."
    });
    
    if (!whatsappWindow || whatsappWindow.closed || typeof whatsappWindow.closed == 'undefined') {
      window.location.href = whatsappUrl;
    }
    
    setTimeout(() => {
      setFormData({
        name: "",
        email: "",
        eventType: "",
        clientType: "",
        country: "",
        message: ""
      });
      setIsSubmitting(false);
    }, 500);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <section className="max-w-[1600px] mx-auto px-4 py-24 border-t border-border">
      <div className="grid lg:grid-cols-2 gap-16 lg:gap-24">
        {/* Left Side - Info */}
        <div className="space-y-8">
          <div>
            <p className="text-xs font-mono text-muted-foreground uppercase tracking-[0.3em] mb-4">
              Contato
            </p>
            <h2 className="text-4xl md:text-6xl font-bold uppercase tracking-tighter mb-8">
              Vamos
              <br />
              <span className="text-muted-foreground">Conversar</span>
            </h2>
          </div>
          
          <p className="text-muted-foreground leading-relaxed max-w-md">
            Pronto para capturar seus momentos especiais? Entre em contato e vamos 
            planejar juntos o seu evento inesquecível.
          </p>

          {/* Contact Info */}
          <div className="space-y-4 pt-8 border-t border-border">
            <div className="flex items-center gap-4">
              <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground w-24">Telefone</span>
              <span className="text-foreground">{settings.contact_phone}</span>
            </div>
            {settings.contact_phone_secondary && (
              <div className="flex items-center gap-4">
                <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground w-24"></span>
                <span className="text-foreground">{settings.contact_phone_secondary}</span>
              </div>
            )}
            <div className="flex items-center gap-4">
              <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground w-24">Email</span>
              <span className="text-foreground">{settings.contact_email}</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground w-24">Local</span>
              <span className="text-foreground">Foz do Iguaçu & Ciudad del Este</span>
            </div>
          </div>

          {/* Social */}
          <div className="flex gap-6 pt-8 text-xs uppercase tracking-[0.2em] text-muted-foreground">
            {settings.instagram_url && (
              <a 
                href={settings.instagram_url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:text-foreground transition-colors duration-300"
              >
                Instagram
              </a>
            )}
            {settings.youtube_url && (
              <a 
                href={settings.youtube_url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:text-foreground transition-colors duration-300"
              >
                YouTube
              </a>
            )}
            {settings.facebook_url && (
              <a 
                href={settings.facebook_url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:text-foreground transition-colors duration-300"
              >
                Facebook
              </a>
            )}
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="bg-secondary/50 p-8 md:p-12">
          <form onSubmit={handleSubmit} className="space-y-6">
            <h3 className="text-xl font-bold uppercase tracking-tight mb-8">
              Solicite seu Orçamento
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs uppercase tracking-[0.15em] text-muted-foreground mb-2 block">
                  Nome
                </label>
                <Input 
                  name="name" 
                  value={formData.name} 
                  onChange={handleChange} 
                  placeholder="Seu nome" 
                  required 
                  className="bg-background border-border focus:border-foreground rounded-none text-base" 
                />
              </div>
              <div>
                <label className="text-xs uppercase tracking-[0.15em] text-muted-foreground mb-2 block">
                  Email
                </label>
                <Input 
                  name="email" 
                  type="email" 
                  value={formData.email} 
                  onChange={handleChange} 
                  placeholder="seu@email.com" 
                  required 
                  className="bg-background border-border focus:border-foreground rounded-none text-base" 
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs uppercase tracking-[0.15em] text-muted-foreground mb-2 block">
                  Tipo de Evento
                </label>
                <Input 
                  name="eventType" 
                  value={formData.eventType} 
                  onChange={handleChange} 
                  placeholder="Ex: Casamento" 
                  className="bg-background border-border focus:border-foreground rounded-none text-base" 
                />
              </div>
              <div>
                <label className="text-xs uppercase tracking-[0.15em] text-muted-foreground mb-2 block">
                  Tipo de Cliente
                </label>
                <Select 
                  value={formData.clientType} 
                  onValueChange={value => setFormData(prev => ({ ...prev, clientType: value }))}
                >
                  <SelectTrigger className="bg-background border-border focus:border-foreground rounded-none">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-border rounded-none">
                    <SelectItem value="Pessoa Física">Pessoa Física</SelectItem>
                    <SelectItem value="Empresa">Empresa</SelectItem>
                    <SelectItem value="Não sei">Não sei</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <label className="text-xs uppercase tracking-[0.15em] text-muted-foreground mb-2 block">
                País <span className="text-destructive">*</span>
              </label>
              <Select 
                value={formData.country} 
                onValueChange={value => setFormData(prev => ({ ...prev, country: value }))}
              >
                <SelectTrigger className="bg-background border-border focus:border-foreground rounded-none">
                  <SelectValue placeholder="Selecione seu país" />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border rounded-none">
                  <SelectItem value="Brasil">Brasil</SelectItem>
                  <SelectItem value="Paraguay">Paraguay</SelectItem>
                  <SelectItem value="Outro país">Outro país</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-xs uppercase tracking-[0.15em] text-muted-foreground mb-2 block">
                Mensagem
              </label>
              <Textarea 
                name="message" 
                value={formData.message} 
                onChange={handleChange} 
                placeholder="Conte-nos sobre seu evento..." 
                rows={4} 
                required 
                className="bg-background border-border focus:border-foreground rounded-none text-base resize-none" 
              />
            </div>

            <button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full bg-foreground text-background py-4 text-xs uppercase tracking-[0.2em] font-bold hover:bg-foreground/90 transition-colors duration-300 disabled:opacity-50"
            >
              {isSubmitting ? "Enviando..." : "Enviar Solicitação"}
            </button>

            <p className="text-[10px] text-muted-foreground text-center uppercase tracking-wider">
              Resposta garantida em até 24 horas
            </p>
          </form>
        </div>
      </div>
    </section>
  );
};

export default Contact;
