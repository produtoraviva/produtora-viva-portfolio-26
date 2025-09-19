import logo from '@/assets/logo.svg';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  style?: React.CSSProperties;
}

export function Logo({ className = '', size = 'md', style }: LogoProps) {
  const sizeClasses = {
    sm: 'h-48 w-auto',
    md: 'h-72 w-auto', 
    lg: 'h-96 w-auto'
  };

  return (
    <img
      src={logo}
      alt="Produtora Viva"
      className={`${sizeClasses[size]} ${className}`}
      style={style}
    />
  );
}