import { Button } from "@/components/ui/button";
import { Phone, Mail, MapPin, Instagram, Heart, Camera, Youtube, Linkedin } from "lucide-react";
import { Logo } from "@/components/Logo";
import { useSiteSettings } from "@/hooks/useSiteSettings";

const Footer = () => {
  const { settings, loading } = useSiteSettings();

  if (loading) {
    return (
      <footer className="bg-white border-t border-border">
        <div className="container mx-auto px-6 py-16">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded w-48 mb-4"></div>
            <div className="h-4 bg-muted rounded w-full mb-2"></div>
            <div className="h-4 bg-muted rounded w-3/4"></div>
          </div>
        </div>
      </footer>
    );
  }

  return (
    <footer className="bg-white border-t border-border">
      <div className="container mx-auto px-6 sm:px-8 lg:px-16 py-16 lg:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-16">
          {/* Logo and Description */}
          <div className="lg:col-span-2">
            <div className="mb-6">
              <Logo size="lg" className="mb-6" />
            </div>
            <p className="text-muted-foreground mb-8 max-w-md text-base leading-relaxed font-light">
              Capturamos os momentos mais especiais da sua vida com arte, 
              paixão e tecnologia de ponta. Transformamos memórias em 
              obras de arte que durarão para sempre.
            </p>
            <div className="flex space-x-3">
              {settings.instagram_url && (
                <a href={settings.instagram_url} target="_blank" rel="noopener noreferrer">
                  <Button 
                    variant="outline" 
                    size="icon" 
                    className="border-2 hover:bg-accent rounded-full w-12 h-12 hover-scale"
                  >
                    <Instagram className="h-5 w-5" />
                  </Button>
                </a>
              )}
              {settings.facebook_url && (
                <a href={settings.facebook_url} target="_blank" rel="noopener noreferrer">
                  <Button 
                    variant="outline" 
                    size="icon" 
                    className="border-2 hover:bg-accent rounded-full w-12 h-12 hover-scale"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                    </svg>
                  </Button>
                </a>
              )}
              {settings.youtube_url && (
                <a href={settings.youtube_url} target="_blank" rel="noopener noreferrer">
                  <Button 
                    variant="outline" 
                    size="icon" 
                    className="border-2 hover:bg-accent rounded-full w-12 h-12 hover-scale"
                  >
                    <Youtube className="h-5 w-5" />
                  </Button>
                </a>
              )}
              {settings.linkedin_url && (
                <a href={settings.linkedin_url} target="_blank" rel="noopener noreferrer">
                  <Button 
                    variant="outline" 
                    size="icon" 
                    className="border-2 hover:bg-accent rounded-full w-12 h-12 hover-scale"
                  >
                    <Linkedin className="h-5 w-5" />
                  </Button>
                </a>
              )}
            </div>
          </div>

          {/* Services */}
          <div>
            <h3 className="font-semibold text-foreground mb-6 flex items-center gap-2 text-lg tracking-tight">
              <Camera className="h-5 w-5" />
              Serviços
            </h3>
            <ul className="space-y-3 text-muted-foreground">
              <li className="text-base font-light">Fotografia de Casamento</li>
              <li className="text-base font-light">Filmagem de Eventos</li>
              <li className="text-base font-light">Fotos Corporativas</li>
              <li className="text-base font-light">Ensaios Familiares</li>
              <li className="text-base font-light">Aniversários</li>
              <li>
                <a href="/depoimento" className="text-primary hover:underline text-base font-medium">
                  Deixe seu depoimento
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="font-semibold text-foreground mb-6 text-lg tracking-tight">Contato</h3>
            <div className="space-y-4 text-muted-foreground">
              <div className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-primary flex-shrink-0" />
                <div className="flex flex-col">
                  <span className="text-base font-light">{settings.contact_phone}</span>
                  {settings.contact_phone_secondary && (
                    <span className="text-base font-light">{settings.contact_phone_secondary}</span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-primary flex-shrink-0" />
                <span className="text-base font-light">{settings.contact_email}</span>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <span className="text-base font-light leading-relaxed">
                  Foz do Iguaçu e Ciudad del Este<br />Atendemos toda a região
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-border mt-16 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-muted-foreground text-sm font-light">
            © 2024 Rubens Photofilm. Todos os direitos reservados.
          </p>
          <p className="text-muted-foreground text-sm flex items-center gap-1 font-light">
            Feito com <Heart className="h-4 w-4 text-red-500 fill-current" /> para capturar seus momentos especiais
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
