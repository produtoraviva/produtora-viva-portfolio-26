import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useSiteConfig } from "@/hooks/useSiteConfig";

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
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

  const handleNavClick = (item: typeof navItems[0]) => {
    if (item.route === "/portfolio") {
      navigate("/portfolio");
      setIsOpen(false);
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
    <nav className="fixed top-0 w-full z-50 flex justify-between items-center p-6 md:p-10 mix-blend-difference text-foreground">
      {/* Logo */}
      <Link 
        to="/" 
        className="text-sm tracking-[0.2em] uppercase font-bold text-foreground flex items-center gap-2"
      >
        {config.logo_url ? (
          <img src={config.logo_url} alt={config.company_name} className="h-8 w-auto" />
        ) : (
          <span>{config.company_name || 'Rubens Photofilm'}.</span>
        )}
      </Link>

      {/* Desktop Menu */}
      <div className="hidden md:flex items-center space-x-8">
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

      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden text-xs uppercase tracking-wide text-foreground"
      >
        {isOpen ? "Fechar" : "Menu"}
      </button>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-background">
          <div className="flex flex-col items-center justify-center h-full space-y-8">
            {navItems.map((item) => (
              <button
                key={item.label}
                onClick={() => handleNavClick(item)}
                className="text-2xl uppercase tracking-[0.2em] text-foreground hover:line-through transition-all duration-300"
              >
                {item.label}
              </button>
            ))}
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="absolute top-6 right-6 text-xs uppercase tracking-wide text-foreground"
          >
            Fechar
          </button>
        </div>
      )}
    </nav>
  );
};

export default Navigation;
