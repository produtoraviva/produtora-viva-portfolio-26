import logo from '@/assets/logo.svg';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  style?: React.CSSProperties;
}

export function Logo({ className = '', size = 'md', style }: LogoProps) {
  const sizeClasses = {
    sm: 'h-8 w-auto',
    md: 'h-12 w-auto',
    lg: 'h-16 w-auto',
    xl: 'h-96 w-auto'
  };

  return (
    <img
      src={logo}
      alt="Produtora Viva"
      className={`${sizeClasses[size]} ${className} object-cover`}
      style={{ 
        ...style,
        objectPosition: 'center -35%'
      }}
    />
  );
}