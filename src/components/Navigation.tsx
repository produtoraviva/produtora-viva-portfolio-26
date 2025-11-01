import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
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
      setScrolled(window.scrollY > 20);
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
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
      scrolled ? "bg-white/95 backdrop-blur-lg shadow-elegant" : "bg-white/80 backdrop-blur-sm"
    }`}>
      <div className="container mx-auto px-6 sm:px-8 lg:px-16">
        <div className="flex justify-between items-center h-20 lg:h-24">
          {/* Logo */}
          <Link to="/" className="flex items-center group cursor-pointer">
            <Logo size="lg" className="scale-[1.4] sm:scale-[1.5] hover:scale-[1.55] transition-transform duration-300" />
          </Link>

          {/* Desktop Menu */}
          <div className="hidden lg:flex items-center space-x-10">
            {navItems.map((item) => (
              <button
                key={item.label}
                onClick={() => handleNavClick(item)}
                className="text-foreground/70 hover:text-primary transition-colors text-[15px] font-semibold tracking-wide"
              >
                {item.label}
              </button>
            ))}
            <Button 
              onClick={() => handleNavClick({ label: "Orçamento", href: "#contact", route: "/" })}
              className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full px-8 py-6 hover-scale shadow-md hover:shadow-lg"
            >
              Orçamento
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <div className="lg:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(!isOpen)}
              className="text-foreground hover:bg-accent"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="lg:hidden fixed inset-0 z-40 top-20">
          <div 
            className="absolute inset-0 bg-black/30 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />
          
          <div className="absolute left-0 right-0 top-0 bg-white border-t border-border shadow-xl animate-slide-in-down">
            <div className="p-6 space-y-2">
              {navItems.map((item) => (
                <button
                  key={item.label}
                  onClick={() => handleNavClick(item)}
                  className="w-full text-left text-foreground/80 hover:text-primary hover:bg-accent transition-all py-4 px-5 rounded-xl text-base font-semibold tracking-wide"
                >
                  {item.label}
                </button>
              ))}
              <div className="pt-4">
                <Button 
                  onClick={() => handleNavClick({ label: "Orçamento", href: "#contact", route: "/" })}
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground rounded-full py-5 shadow-md"
                >
                  Solicitar Orçamento
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navigation;
