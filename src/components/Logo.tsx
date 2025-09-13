import logo from '@/assets/logo.svg';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function Logo({ className = '', size = 'md' }: LogoProps) {
  const sizeClasses = {
    sm: 'h-8 w-auto',
    md: 'h-12 w-auto',
    lg: 'h-16 w-auto'
  };

  return (
    <img
      src={logo}
      alt="Produtora Viva"
      className={`${sizeClasses[size]} ${className}`}
      style={{ filter: 'invert(1) brightness(2)' }} // Make it white for better visibility
    />
  );
}