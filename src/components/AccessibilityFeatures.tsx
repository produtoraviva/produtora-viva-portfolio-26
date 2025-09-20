import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Keyboard, SkipForward } from 'lucide-react';

export const AccessibilityFeatures = () => {
  const [isKeyboardUser, setIsKeyboardUser] = useState(false);
  const [showSkipLink, setShowSkipLink] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        setIsKeyboardUser(true);
      }
    };

    const handleMouseDown = () => {
      setIsKeyboardUser(false);
    };

    const handleFocus = () => {
      if (isKeyboardUser) {
        setShowSkipLink(true);
      }
    };

    const handleBlur = () => {
      setShowSkipLink(false);
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('focusin', handleFocus);
    document.addEventListener('focusout', handleBlur);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('focusin', handleFocus);
      document.removeEventListener('focusout', handleBlur);
    };
  }, [isKeyboardUser]);

  const skipToMain = () => {
    const mainContent = document.querySelector('main') || document.querySelector('#main-content');
    if (mainContent) {
      (mainContent as HTMLElement).focus();
      mainContent.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <>
      {/* Skip to main content link */}
      <Button
        onClick={skipToMain}
        className={`fixed top-4 left-4 z-[60] transition-all duration-200 ${
          showSkipLink && isKeyboardUser 
            ? 'translate-y-0 opacity-100' 
            : '-translate-y-16 opacity-0 pointer-events-none'
        }`}
        variant="default"
        size="sm"
      >
        <SkipForward className="mr-2 h-4 w-4" />
        Pular para o conteúdo principal
      </Button>

      {/* Keyboard navigation indicator */}
      {isKeyboardUser && (
        <div className="fixed bottom-4 left-4 z-50 bg-card/90 backdrop-blur-sm border border-border rounded-lg p-2 text-xs text-muted-foreground">
          <Keyboard className="inline h-3 w-3 mr-1" />
          Navegação por teclado ativa
        </div>
      )}

      {/* Add focus indicators via CSS */}
      <style>{`
        body.keyboard-user *:focus {
          outline: 2px solid hsl(var(--primary)) !important;
          outline-offset: 2px !important;
        }
        
        body.keyboard-user button:focus,
        body.keyboard-user a:focus,
        body.keyboard-user input:focus,
        body.keyboard-user textarea:focus,
        body.keyboard-user select:focus {
          box-shadow: 0 0 0 2px hsl(var(--primary)) !important;
        }
      `}</style>
    </>
  );
};

// Apply keyboard user class to body
export const useKeyboardAccessibility = () => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        document.body.classList.add('keyboard-user');
      }
    };

    const handleMouseDown = () => {
      document.body.classList.remove('keyboard-user');
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleMouseDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleMouseDown);
    };
  }, []);
};