import { useState, useRef, useEffect } from 'react';
import { LoadingSpinner } from './LoadingSpinner';

interface LazyImageProps {
  src: string;
  alt: string;
  className?: string;
  placeholder?: string;
  fallback?: string;
  onLoad?: () => void;
  onError?: () => void;
}

export const LazyImage = ({
  src,
  alt,
  className = '',
  placeholder,
  fallback = '/placeholder.svg',
  onLoad,
  onError
}: LazyImageProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const handleLoad = () => {
    setIsLoading(false);
    onLoad?.();
  };

  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
    onError?.();
  };

  return (
    <div className={`relative overflow-hidden ${className}`} ref={imgRef}>
      {/* Placeholder while loading */}
      {(isLoading || !isInView) && (
        <div className="absolute inset-0 bg-muted/30 flex items-center justify-center">
          {isLoading && isInView ? (
            <LoadingSpinner size="sm" />
          ) : (
            placeholder && (
              <img
                src={placeholder}
                alt=""
                className="w-full h-full object-cover opacity-30"
              />
            )
          )}
        </div>
      )}
      
      {/* Main image */}
      {isInView && (
        <img
          src={hasError ? fallback : src}
          alt={alt}
          className={`w-full h-full object-cover transition-opacity duration-300 ${
            isLoading ? 'opacity-0' : 'opacity-100'
          }`}
          onLoad={handleLoad}
          onError={handleError}
          loading="lazy"
        />
      )}
    </div>
  );
};