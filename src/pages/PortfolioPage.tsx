import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Home } from "lucide-react";
import PortfolioFull from "@/components/PortfolioFull";
import Navigation from "@/components/Navigation";
import WhatsAppButton from "@/components/WhatsAppButton";
import ScrollToTop from "@/components/ScrollToTop";
import { SEOHead } from "@/components/SEOHead";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import Footer from "@/components/Footer";

const PortfolioPage = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <SEOHead 
        title="Portfolio Completo | Rubens Photofilm - Fotografia e Videografia"
        description="Explore nossa galeria completa com mais de 500 projetos realizados em Foz do Iguaçu e Ciudad del Este. Casamentos, aniversários, eventos corporativos e ensaios únicos."
        keywords="portfolio fotografia foz iguaçu, galeria casamentos, trabalhos realizados, projetos fotografia, videografia profissional, eventos foz iguaçu"
        canonical={window.location.href}
      />
      <Navigation />
      
      {/* Breadcrumb - with proper top spacing for tablets */}
      <div className="bg-muted/20 border-b border-border mt-24 md:mt-28 lg:mt-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-sm">
              <Link to="/" className="text-muted-foreground hover:text-primary transition-colors flex items-center">
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
      
      {/* Footer - Same as Homepage */}
      <Footer />

      <WhatsAppButton />
      <ScrollToTop />
    </div>
  );
};

export default PortfolioPage;
