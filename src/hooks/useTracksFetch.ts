import { useState, useEffect, useRef } from 'react';

interface UseTracksFetchOptions {
  endpoint: string;
  onSuccess?: (data: any) => void;
  onError?: (error: Error) => void;
  onLoadingChange?: (loading: boolean) => void;
}

export const useTracksFetch = (options: UseTracksFetchOptions) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const isMountedRef = useRef(true);

  const fetchData = async () => {
    // Cancelar requisição anterior se existir
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Criar novo controller
    abortControllerRef.current = new AbortController();
    
    setLoading(true);
    setError(null);

    try {
      console.log(`🚀 Fazendo requisição para: ${options.endpoint}`);
      
      const response = await fetch(options.endpoint, {
        signal: abortControllerRef.current.signal
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (!isMountedRef.current) return;

      setData(result);
      options.onSuccess?.(result);
      console.log(`✅ Requisição bem-sucedida para: ${options.endpoint}`);
      
    } catch (err) {
      if (!isMountedRef.current) return;
      
      if (err instanceof Error && err.name === 'AbortError') {
        console.log('🔄 Requisição cancelada');
        return;
      }

      const error = err instanceof Error ? err : new Error('Erro desconhecido');
      setError(error);
      options.onError?.(error);
      console.error(`❌ Erro na requisição para ${options.endpoint}:`, error);
      
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
        options.onLoadingChange?.(false);
      }
    }
  };

  useEffect(() => {
    isMountedRef.current = true;
    fetchData();

    return () => {
      isMountedRef.current = false;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [options.endpoint]); // Só re-executa se o endpoint mudar

  const refetch = () => {
    fetchData();
  };

  return {
    data,
    loading,
    error,
    refetch
  };
};


