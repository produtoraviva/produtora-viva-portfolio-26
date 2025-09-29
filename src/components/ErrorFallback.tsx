import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";

interface ErrorFallbackProps {
  error: Error;
  resetErrorBoundary: () => void;
}

const ErrorFallback = ({ error, resetErrorBoundary }: ErrorFallbackProps) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="max-w-md w-full p-8 text-center">
        <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertTriangle className="h-8 w-8 text-destructive" />
        </div>
        
        <h1 className="text-2xl font-bold text-foreground mb-4">
          Oops! Algo deu errado
        </h1>
        
        <p className="text-muted-foreground mb-6">
          Encontramos um problema inesperado. Nossa equipe foi notificada e está trabalhando para resolver.
        </p>
        
        <Button 
          onClick={resetErrorBoundary}
          className="w-full bg-gradient-primary"
        >
          Tentar Novamente
        </Button>
        
        {process.env.NODE_ENV === 'development' && (
          <details className="mt-6 text-left">
            <summary className="cursor-pointer text-sm text-muted-foreground hover:text-foreground">
              Detalhes do erro
            </summary>
            <pre className="mt-2 text-xs bg-muted p-3 rounded overflow-auto text-muted-foreground">
              {error.message}
              {error.stack && '\n' + error.stack}
            </pre>
          </details>
        )}
      </Card>
    </div>
  );
};

export default ErrorFallback;