import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error?: Error; retry: () => void }>;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  retry = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback;
        return <FallbackComponent error={this.state.error} retry={this.retry} />;
      }

      return <DefaultErrorFallback error={this.state.error} retry={this.retry} />;
    }

    return this.props.children;
  }
}

const DefaultErrorFallback: React.FC<{ error?: Error; retry: () => void }> = ({ error, retry }) => (
  <div className="min-h-screen flex items-center justify-center p-4 bg-background">
    <Card className="max-w-md w-full p-8 text-center">
      <div className="mb-6">
        <AlertTriangle className="h-16 w-16 text-destructive mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-foreground mb-2">
          Ops! Algo deu errado
        </h2>
        <p className="text-muted-foreground">
          Ocorreu um erro inesperado. Nossa equipe foi notificada.
        </p>
      </div>
      
      {process.env.NODE_ENV === 'development' && error && (
        <div className="mb-6 p-4 bg-destructive/10 rounded-lg">
          <p className="text-sm text-destructive font-mono">
            {error.message}
          </p>
        </div>
      )}
      
      <div className="space-y-3">
        <Button onClick={retry} className="w-full" variant="default">
          <RefreshCw className="mr-2 h-4 w-4" />
          Tentar novamente
        </Button>
        <Button 
          onClick={() => window.location.href = '/'} 
          className="w-full" 
          variant="outline"
        >
          Voltar ao início
        </Button>
      </div>
    </Card>
  </div>
);