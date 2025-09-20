import { useState, useCallback } from 'react';
import { useToast } from './use-toast';

interface UseAsyncOperationOptions {
  onSuccess?: (data: any) => void;
  onError?: (error: Error) => void;
  showSuccessToast?: boolean;
  showErrorToast?: boolean;
  successMessage?: string;
  errorMessage?: string;
}

export const useAsyncOperation = <T = any>(
  asyncFunction: (...args: any[]) => Promise<T>,
  options: UseAsyncOperationOptions = {}
) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [data, setData] = useState<T | null>(null);
  const { toast } = useToast();

  const {
    onSuccess,
    onError,
    showSuccessToast = false,
    showErrorToast = true,
    successMessage = 'Operação realizada com sucesso!',
    errorMessage = 'Ocorreu um erro. Tente novamente.'
  } = options;

  const execute = useCallback(async (...args: any[]) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const result = await asyncFunction(...args);
      setData(result);
      
      if (showSuccessToast) {
        toast({
          title: 'Sucesso',
          description: successMessage,
        });
      }
      
      onSuccess?.(result);
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Erro desconhecido');
      setError(error);
      
      if (showErrorToast) {
        toast({
          title: 'Erro',
          description: errorMessage,
          variant: 'destructive',
        });
      }
      
      onError?.(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [asyncFunction, onSuccess, onError, showSuccessToast, showErrorToast, successMessage, errorMessage, toast]);

  const reset = useCallback(() => {
    setIsLoading(false);
    setError(null);
    setData(null);
  }, []);

  return {
    execute,
    isLoading,
    error,
    data,
    reset
  };
};