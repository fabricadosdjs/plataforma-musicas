import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';

interface DownloadsCacheData {
    downloadedTrackIds: number[];
    likedTrackIds: number[];
    isVip: boolean;
    downloadsLeft: number | string;
    dailyDownloadCount: number;
    lastUpdated: string;
}

interface UseDownloadsCacheReturn {
    downloadedTrackIds: number[];
    likedTrackIds: number[];
    isVip: boolean;
    downloadsLeft: number | string;
    dailyDownloadCount: number;
    isLoading: boolean;
    error: string | null;
    refreshCache: () => Promise<void>;
    markAsDownloaded: (trackId: number) => void;
    markAsLiked: (trackId: number) => void;
    markAsUnliked: (trackId: number) => void;
    isDownloaded: (trackId: number) => boolean;
    isLiked: (trackId: number) => boolean;
}

export const useDownloadsCache = (): UseDownloadsCacheReturn => {
    const { data: session } = useSession();
    const [cacheData, setCacheData] = useState<DownloadsCacheData>({
        downloadedTrackIds: [],
        likedTrackIds: [],
        isVip: false,
        downloadsLeft: 15,
        dailyDownloadCount: 0,
        lastUpdated: ''
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Carregar cache do localStorage na inicialização
    useEffect(() => {
        if (!session?.user?.id) return;

        try {
            const savedCache = localStorage.getItem(`downloads_cache_${session.user.id}`);
            if (savedCache) {
                const parsed = JSON.parse(savedCache);
                const cacheAge = Date.now() - new Date(parsed.lastUpdated).getTime();

                // Cache válido por 5 minutos
                if (cacheAge < 5 * 60 * 1000) {
                    setCacheData(parsed);
                    console.log('✅ Cache de downloads carregado do localStorage');
                    return;
                }
            }
        } catch (error) {
            console.error('❌ Erro ao carregar cache do localStorage:', error);
        }

        // Se não há cache válido, carregar da API
        refreshCache();
    }, [session?.user?.id]);

    // Função para atualizar cache da API
    const refreshCache = useCallback(async () => {
        if (!session?.user?.id) return;

        setIsLoading(true);
        setError(null);

        try {
            console.log('🔄 Atualizando cache de downloads...');
            const response = await fetch('/api/tracks');

            console.log('🔄 Resposta da API:', response.status, response.statusText);

            if (!response.ok) {
                const errorText = await response.text();
                console.error('❌ Erro na resposta da API:', errorText);
                throw new Error(`Erro ${response.status}: ${errorText}`);
            }

            const data = await response.json();
            console.log('🔄 Dados recebidos da API:', data);

            // Validar estrutura dos dados
            if (!data.userData) {
                throw new Error('Estrutura de dados inválida: userData não encontrado');
            }

            const newCacheData: DownloadsCacheData = {
                downloadedTrackIds: data.userData.downloadedTrackIds || [],
                likedTrackIds: data.userData.likedTrackIds || [],
                isVip: data.userData.isVip || false,
                downloadsLeft: data.userData.downloadsLeft || 15,
                dailyDownloadCount: data.userData.dailyDownloadCount || 0,
                lastUpdated: new Date().toISOString()
            };

            console.log('🔄 Cache data preparado:', newCacheData);

            setCacheData(newCacheData);

            // Salvar no localStorage
            try {
                localStorage.setItem(`downloads_cache_${session.user.id}`, JSON.stringify(newCacheData));
                console.log('💾 Cache salvo no localStorage');
            } catch (error) {
                console.error('❌ Erro ao salvar cache no localStorage:', error);
            }

            console.log('✅ Cache atualizado com sucesso');
        } catch (error) {
            console.error('❌ Erro ao atualizar cache:', error);
            setError(error instanceof Error ? error.message : 'Erro desconhecido');
        } finally {
            setIsLoading(false);
        }
    }, [session?.user?.id]);

    // Função para marcar música como baixada
    const markAsDownloaded = useCallback((trackId: number) => {
        setCacheData(prev => {
            if (prev.downloadedTrackIds.includes(trackId)) return prev;

            const newData = {
                ...prev,
                downloadedTrackIds: [...prev.downloadedTrackIds, trackId],
                dailyDownloadCount: prev.dailyDownloadCount + 1
            };

            // Atualizar localStorage
            if (session?.user?.id) {
                try {
                    localStorage.setItem(`downloads_cache_${session.user.id}`, JSON.stringify(newData));
                } catch (error) {
                    console.error('❌ Erro ao salvar cache no localStorage:', error);
                }
            }

            return newData;
        });
    }, [session?.user?.id]);

    // Função para marcar música como curtida
    const markAsLiked = useCallback((trackId: number) => {
        setCacheData(prev => {
            if (prev.likedTrackIds.includes(trackId)) return prev;

            const newData = {
                ...prev,
                likedTrackIds: [...prev.likedTrackIds, trackId]
            };

            // Atualizar localStorage
            if (session?.user?.id) {
                try {
                    localStorage.setItem(`downloads_cache_${session.user.id}`, JSON.stringify(newData));
                } catch (error) {
                    console.error('❌ Erro ao salvar cache no localStorage:', error);
                }
            }

            return newData;
        });
    }, [session?.user?.id]);

    // Função para marcar música como descurtida
    const markAsUnliked = useCallback((trackId: number) => {
        setCacheData(prev => {
            if (!prev.likedTrackIds.includes(trackId)) return prev;

            const newData = {
                ...prev,
                likedTrackIds: prev.likedTrackIds.filter(id => id !== trackId)
            };

            // Atualizar localStorage
            if (session?.user?.id) {
                try {
                    localStorage.setItem(`downloads_cache_${session.user.id}`, JSON.stringify(newData));
                } catch (error) {
                    console.error('❌ Erro ao salvar cache no localStorage:', error);
                }
            }

            return newData;
        });
    }, [session?.user?.id]);

    // Funções de verificação
    const isDownloaded = useCallback((trackId: number) => {
        return cacheData.downloadedTrackIds.includes(trackId);
    }, [cacheData.downloadedTrackIds]);

    const isLiked = useCallback((trackId: number) => {
        return cacheData.likedTrackIds.includes(trackId);
    }, [cacheData.likedTrackIds]);

    return {
        downloadedTrackIds: cacheData.downloadedTrackIds,
        likedTrackIds: cacheData.likedTrackIds,
        isVip: cacheData.isVip,
        downloadsLeft: cacheData.downloadsLeft,
        dailyDownloadCount: cacheData.dailyDownloadCount,
        isLoading,
        error,
        refreshCache,
        markAsDownloaded,
        markAsLiked,
        markAsUnliked,
        isDownloaded,
        isLiked
    };
};
