import { useState, useEffect } from 'react';
import { ChevronUp } from 'lucide-react';

const ScrollToTop = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.pageYOffset > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  if (!isVisible) {
    return null;
  }

  return (
    <button
      onClick={scrollToTop}
      className="fixed bottom-[calc(6rem+env(safe-area-inset-bottom))] right-4 sm:right-6 z-40 bg-foreground hover:bg-foreground/90 text-background w-14 h-14 flex items-center justify-center transition-all duration-300"
      aria-label="Voltar ao topo"
    >
      <ChevronUp className="h-6 w-6" />
    </button>
  );
};

export default ScrollToTop;