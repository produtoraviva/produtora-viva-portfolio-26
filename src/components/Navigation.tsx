import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useSiteConfig } from "@/hooks/useSiteConfig";

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const location = useLocation();
  const navigate = useNavigate();
  const isHomePage = location.pathname === '/';
  const { config, loading: configLoading } = useSiteConfig();
  
  const navItems = [
    { label: "Portfolio", href: "/portfolio", route: "/portfolio", highlight: true },
    { label: "Trabalhos", href: "#portfolio", route: "/" },
    { label: "Sobre", href: "#sobre", route: "/" },
    { label: "Serviços", href: "#servicos", route: "/" },
    { label: "Depoimentos", href: "#depoimentos", route: "/" },
    { label: "Contato", href: "#contact", route: "/" },
  ];

  // Track scroll for blend effect transition
  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
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

  // Calculate transition progress (0 at top, 1 after scrolling 100px)
  const scrollProgress = Math.min(scrollY / 100, 1);
  
  // Mix blend only activates after scroll
  const headerStyle = {
    mixBlendMode: scrollProgress > 0 ? 'difference' as const : 'normal' as const,
    opacity: 1,
  };

  // Logo component - shows nothing while loading if logo_url exists
  const LogoContent = () => {
    // If still loading, show nothing to prevent flash
    if (configLoading) {
      return <span className="opacity-0">Loading...</span>;
    }
    
    if (config.logo_url) {
      return (
        <img 
          src={config.logo_url} 
          alt={config.company_name} 
          className="h-9 w-auto" 
          style={{ height: '2.26rem' }} 
        />
      );
    }
    
    return <span>{config.company_name || 'Rubens Photofilm'}.</span>;
  };

  return (
    <nav 
      className="fixed top-0 w-full z-50 transition-all duration-500"
      style={headerStyle}
    >
      {/* Regular header for desktop */}
      <div className="hidden lg:flex justify-between items-center p-6 md:p-10">
        {/* Logo */}
        <Link 
          to="/" 
          className="text-sm tracking-[0.2em] uppercase font-bold text-white flex items-center gap-2"
        >
          <LogoContent />
        </Link>

        {/* Desktop Menu */}
        <div className="flex items-center space-x-8">
          {navItems.map((item) => (
            <button
              key={item.label}
              onClick={() => handleNavClick(item)}
              className={`text-xs uppercase tracking-[0.15em] text-white transition-all duration-300 ${
                item.highlight 
                  ? 'border border-white/50 px-3 py-1.5 hover:bg-white hover:text-black' 
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
          className="text-sm tracking-[0.2em] uppercase font-bold text-white flex items-center gap-2 mb-3"
        >
          <LogoContent />
        </Link>
        
        {/* Navigation line */}
        <div className="flex items-center space-x-4 flex-wrap justify-center gap-y-2">
          {navItems.map((item) => (
            <button
              key={item.label}
              onClick={() => handleNavClick(item)}
              className={`text-xs uppercase tracking-[0.15em] text-white transition-all duration-300 ${
                item.highlight 
                  ? 'border border-white/50 px-3 py-1.5 hover:bg-white hover:text-black' 
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
          className="text-sm tracking-[0.2em] uppercase font-bold text-white flex items-center gap-2"
        >
          <LogoContent />
        </Link>

        {/* Mobile Menu Button - Hamburger Icon */}
        <button
          onClick={isOpen ? handleClose : handleOpen}
          className="text-white p-2"
          aria-label={isOpen ? "Fechar menu" : "Abrir menu"}
        >
          {isOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </button>
      </div>

      {/* Mobile Menu - black 30% opacity background */}
      {isOpen && (
        <>
          {/* Background overlay - black 30% opacity, no blur */}
          <div 
            className={`md:hidden fixed inset-0 z-40 transition-opacity duration-300 ${
              isAnimating ? 'bg-black/30' : 'bg-transparent'
            }`}
            onClick={handleClose}
          />
          
          {/* Menu content layer - white text, no effects */}
          <div 
            className={`md:hidden fixed inset-0 z-50 flex flex-col items-center justify-center transition-opacity duration-300 ${
              isAnimating ? 'opacity-100' : 'opacity-0'
            }`}
            onClick={(e) => {
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
