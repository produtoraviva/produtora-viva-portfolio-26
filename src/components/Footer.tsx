import { Button } from "@/components/ui/button";
import { Phone, Mail, MapPin, Instagram, Heart, Camera } from "lucide-react";
import { Logo } from "@/components/Logo";
const Footer = () => {
  return <footer className="bg-background border-t border-border">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Logo and Description */}
          <div className="lg:col-span-2">
            <div className="mb-4">
              <Logo size="lg" className="mb-4" />
            </div>
            <p className="text-muted-foreground mb-6 max-w-md">
              Capturamos os momentos mais especiais da sua vida com arte, 
              paixão e tecnologia de ponta. Transformamos memórias em 
              obras de arte que durarão para sempre.
            </p>
            <div className="flex space-x-4">
              <a href="https://instagram.com/produtoraviva" target="_blank" rel="noopener noreferrer">
                <Button variant="outline" size="icon" className="border-primary/30 hover:bg-primary/10 hover-scale">
                  <Instagram className="h-5 w-5" />
                </Button>
              </a>
              <a href="https://facebook.com/produtoraviva" target="_blank" rel="noopener noreferrer">
                <Button variant="outline" size="icon" className="border-primary/30 hover:bg-primary/10 hover-scale">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                </Button>
              </a>
            </div>
          </div>

          {/* Services */}
          <div>
            <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
              <Camera className="h-4 w-4" />
              Serviços
            </h3>
            <ul className="space-y-2 text-muted-foreground">
              <li>Fotografia de Casamento</li>
              <li>Filmagem de Eventos</li>
              <li>Fotos Corporativas</li>
              <li>Ensaios Familiares</li>
              <li>Aniversários</li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Contato</h3>
            <div className="space-y-3 text-muted-foreground">
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-primary" />
                <span>(45) 99988-7766</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-primary" />
                <span>info@produtoraviva.com</span>
              </div>
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-primary mt-0.5" />
                <span>Foz do Iguaçu e Ciudad del Este<br />Atendemos toda a região</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-border mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-muted-foreground text-sm mb-4 md:mb-0">
            © 2024 Produtora Viva. Todos os direitos reservados.
          </p>
          <p className="text-muted-foreground text-sm flex items-center gap-1">
            Feito com <Heart className="h-4 w-4 text-red-500 fill-current" /> para capturar seus momentos especiais
          </p>
        </div>
      </div>
    </footer>;
};
export default Footer;