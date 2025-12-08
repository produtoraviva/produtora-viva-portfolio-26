import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useSiteConfig } from "@/hooks/useSiteConfig";

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const isHomePage = location.pathname === '/';
  const { config } = useSiteConfig();
  
  const navItems = [
    { label: "Portfolio", href: "/portfolio", route: "/portfolio", highlight: true },
    { label: "Trabalhos", href: "#portfolio", route: "/" },
    { label: "Sobre", href: "#sobre", route: "/" },
    { label: "Serviços", href: "#servicos", route: "/" },
    { label: "Depoimentos", href: "#depoimentos", route: "/" },
    { label: "Contato", href: "#contact", route: "/" },
  ];

  // Track scroll for blur effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavClick = (item: typeof navItems[0]) => {
    if (item.route === "/portfolio") {
      navigate("/portfolio");
      handleClose();
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
        handleClose();
      }
    }
  };

  const handleOpen = () => {
    setIsAnimating(true);
    setIsOpen(true);
  };

  const handleClose = () => {
    setIsAnimating(false);
    setTimeout(() => setIsOpen(false), 300);
  };

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  return (
    <nav className="fixed top-0 w-full z-50 transition-all duration-300 mix-blend-difference text-foreground">
      {/* Regular header for desktop */}
      <div className="hidden lg:flex justify-between items-center p-6 md:p-10">
        {/* Logo */}
        <Link 
          to="/" 
          className="text-sm tracking-[0.2em] uppercase font-bold text-foreground flex items-center gap-2"
        >
          {config.logo_url ? (
            <img src={config.logo_url} alt={config.company_name} className="h-9 w-auto" style={{ height: '2.26rem' }} />
          ) : (
            <span>{config.company_name || 'Rubens Photofilm'}.</span>
          )}
        </Link>

        {/* Desktop Menu */}
        <div className="flex items-center space-x-8">
          {navItems.map((item) => (
            <button
              key={item.label}
              onClick={() => handleNavClick(item)}
              className={`text-xs uppercase tracking-[0.15em] text-foreground transition-all duration-300 ${
                item.highlight 
                  ? 'border border-foreground/50 px-3 py-1.5 hover:bg-foreground hover:text-background' 
                  : 'hover:line-through'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Two-line header for tablets */}
      <div className="hidden md:flex lg:hidden flex-col items-center p-4">
        {/* Logo line */}
        <Link 
          to="/" 
          className="text-sm tracking-[0.2em] uppercase font-bold text-foreground flex items-center gap-2 mb-3"
        >
          {config.logo_url ? (
            <img src={config.logo_url} alt={config.company_name} className="h-9 w-auto" style={{ height: '2.26rem' }} />
          ) : (
            <span>{config.company_name || 'Rubens Photofilm'}.</span>
          )}
        </Link>
        
        {/* Navigation line */}
        <div className="flex items-center space-x-4 flex-wrap justify-center gap-y-2">
          {navItems.map((item) => (
            <button
              key={item.label}
              onClick={() => handleNavClick(item)}
              className={`text-xs uppercase tracking-[0.15em] text-foreground transition-all duration-300 ${
                item.highlight 
                  ? 'border border-foreground/50 px-3 py-1.5 hover:bg-foreground hover:text-background' 
                  : 'hover:line-through'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Mobile header */}
      <div className="md:hidden flex justify-between items-center p-6">
        {/* Logo */}
        <Link 
          to="/" 
          className="text-sm tracking-[0.2em] uppercase font-bold text-foreground flex items-center gap-2"
        >
          {config.logo_url ? (
            <img src={config.logo_url} alt={config.company_name} className="h-9 w-auto" style={{ height: '2.26rem' }} />
          ) : (
            <span>{config.company_name || 'Rubens Photofilm'}.</span>
          )}
        </Link>

        {/* Mobile Menu Button - Hamburger Icon */}
        <button
          onClick={isOpen ? handleClose : handleOpen}
          className="text-foreground p-2"
          aria-label={isOpen ? "Fechar menu" : "Abrir menu"}
        >
          {isOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </button>
      </div>

      {/* Mobile Menu with animated blur background - fixed position with proper centering */}
      {isOpen && (
        <>
          {/* Blurred background layer - covers everything behind using backdrop-filter */}
          <div 
            className={`md:hidden fixed inset-0 z-40 transition-all duration-300 ${
              isAnimating ? 'backdrop-blur-sm bg-black/70' : 'bg-transparent'
            }`}
            onClick={handleClose}
          />
          
          {/* Menu content layer - NOT blurred, white text */}
          <div 
            className={`md:hidden fixed inset-0 z-50 flex flex-col items-center justify-center transition-opacity duration-300 ${
              isAnimating ? 'opacity-100' : 'opacity-0'
            }`}
            onClick={(e) => {
              // Close if clicking on the background (not on menu items)
              if (e.target === e.currentTarget) {
                handleClose();
              }
            }}
          >
            <div className="flex flex-col items-center space-y-8">
              {navItems.map((item, index) => (
                <button
                  key={item.label}
                  onClick={() => handleNavClick(item)}
                  className="text-2xl uppercase tracking-[0.2em] text-white hover:line-through transition-all duration-300"
                  style={{ 
                    opacity: isAnimating ? 1 : 0,
                    transform: isAnimating ? 'translateY(0)' : 'translateY(20px)',
                    transition: `opacity 0.3s ease ${index * 50}ms, transform 0.3s ease ${index * 50}ms`
                  }}
                >
                  {item.label}
                </button>
              ))}
            </div>
            <button
              onClick={handleClose}
              className="absolute top-6 right-6 p-2"
              aria-label="Fechar menu"
            >
              <X className="h-6 w-6 text-white" />
            </button>
          </div>
        </>
      )}
    </nav>
  );
};

export default Navigation;
