import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Home } from "lucide-react";
import PortfolioFull from "@/components/PortfolioFull";
import Navigation from "@/components/Navigation";
import WhatsAppButton from "@/components/WhatsAppButton";

const PortfolioPage = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navigation />
      
      {/* Breadcrumb */}
      <div className="bg-muted/20 border-b border-border mt-16 lg:mt-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-sm">
              <Link 
                to="/" 
                className="text-muted-foreground hover:text-primary transition-colors flex items-center"
              >
                <Home className="h-4 w-4 mr-1" />
                Início
              </Link>
              <span className="text-muted-foreground">/</span>
              <span className="text-foreground font-medium">Portfolio</span>
            </div>
            
            <Link to="/">
              <Button variant="outline" size="sm" className="border-primary/30 hover:bg-primary/10">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar ao Início
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Portfolio Content */}
      <PortfolioFull />
      
      {/* Footer */}
      <footer className="bg-dark border-t border-border py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            {/* Logo & Description */}
            <div className="md:col-span-2">
              <div className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-4">
                PRODUTORA VIVA
              </div>
              <p className="text-muted-foreground text-sm mb-4 max-w-md">
                Especializada em fotografia e videografia de alta qualidade para casamentos, 
                eventos corporativos e momentos especiais. Capturamos suas memórias com arte e emoção.
              </p>
              <div className="flex space-x-4">
                <a 
                  href="https://instagram.com/produtoraviva" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </a>
                <a 
                  href="https://facebook.com/produtoraviva" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </a>
              </div>
            </div>

            {/* Services */}
            <div>
              <h4 className="font-semibold text-foreground mb-4">Serviços</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>Casamentos</li>
                <li>Eventos Corporativos</li>
                <li>Ensaios Familiares</li>
                <li>Book 15 Anos</li>
                <li>Videografia</li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="font-semibold text-foreground mb-4">Contato</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>(11) 99999-9999</li>
                <li>contato@produtoraviva.com</li>
                <li>Foz do Iguaçu, PR</li>
                <li>Seg - Sex: 9h às 18h</li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-border pt-8 text-center">
            <p className="text-muted-foreground text-sm">
              © 2024 Produtora Viva. Todos os direitos reservados.
            </p>
            <p className="text-muted-foreground text-xs mt-2">
              Fotografia e Videografia Profissional | Foz do Iguaçu, PR
            </p>
          </div>
        </div>
      </footer>

      <WhatsAppButton />
    </div>
  );
};

export default PortfolioPage;