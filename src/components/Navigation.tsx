import { useState, useEffect } from "react";
import { Menu, X, Camera, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Logo } from "./Logo";

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const isHomePage = location.pathname === '/';

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navItems = [
    { label: "Início", href: "#hero", route: "/" },
    { label: "Portfolio", href: "#portfolio", route: "/portfolio" },
    { label: "Sobre", href: "#sobre", route: "/" },
    { label: "Serviços", href: "#servicos", route: "/" },
    { label: "Depoimentos", href: "#depoimentos", route: "/" },
    { label: "FAQ", href: "#faq", route: "/" },
    { label: "Contato", href: "#contact", route: "/" },
  ];

  const handleNavClick = (item: typeof navItems[0]) => {
    if (item.route === "/portfolio") {
      navigate("/portfolio");
    } else if (item.route === "/" && !isHomePage) {
      navigate("/");
      setTimeout(() => {
        const element = document.querySelector(item.href);
        if (element) {
          element.scrollIntoView({ behavior: "smooth" });
        }
      }, 100);
    } else if (isHomePage) {
      const element = document.querySelector(item.href);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
        setIsOpen(false);
      }
    }
    setIsOpen(false);
  };

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled ? "bg-background/95 backdrop-blur-md border-b border-border" : "bg-transparent"
    }`}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 lg:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 group cursor-pointer">
            <Logo size="sm" />
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <button
                key={item.label}
                onClick={() => handleNavClick(item)}
                className="text-foreground/80 hover:text-primary transition-colors font-medium"
              >
                {item.label}
              </button>
            ))}
            <Button 
              onClick={() => handleNavClick({ label: "Orçamento", href: "#contact", route: "/" })}
              className="bg-gradient-primary hover:scale-105 transition-transform"
            >
              Orçamento
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(!isOpen)}
              className="text-foreground hover:text-primary"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Menu - fixed panel with proper viewport handling */}
      {isOpen && (
        <div className="md:hidden fixed inset-0 z-40">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Menu Panel */}
          <div className="absolute left-0 right-0 top-16 max-h-[calc(100vh-4rem)] bg-card border-t border-border rounded-t-2xl shadow-2xl animate-enter overflow-hidden">
            <div className="max-h-[calc(100vh-6rem)] overflow-y-auto p-6">
              <div className="flex flex-col space-y-1">
                {navItems.map((item, index) => (
                  <button
                    key={item.label}
                    onClick={() => handleNavClick(item)}
                    className="text-left text-foreground/80 hover:text-primary hover:bg-primary/5 transition-all duration-150 font-medium py-4 px-4 rounded-lg transform hover:translate-x-1 border-b border-border/30 last:border-b-0"
                    style={{ animationDelay: `${index * 40}ms` }}
                  >
                    {item.label}
                  </button>
                ))}
                <div className="pt-6 mt-4 border-t border-border/50">
                  <Button 
                    onClick={() => handleNavClick({ label: "Orçamento", href: "#contact", route: "/" })}
                    className="bg-gradient-primary w-full py-4 hover:scale-[1.02] transition-transform font-medium"
                  >
                    Solicitar Orçamento
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navigation;
