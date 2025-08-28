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
    markAsDownloaded: (trackId: number) => Promise<void>;
    markAsLiked: (trackId: number) => void;
    markAsUnliked: (trackId: number) => void;
    isDownloaded: (trackId: number) => boolean;
    isLiked: (trackId: number) => boolean;
    forceSync: () => Promise<void>;
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

            // Primeiro, buscar dados básicos do usuário
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

            // Depois, buscar downloads recentes para sincronização
            let recentDownloads: number[] = [];
            try {
                const downloadsResponse = await fetch('/api/tracks/check-downloads', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        trackIds: data.userData.downloadedTrackIds || []
                    })
                });

                if (downloadsResponse.ok) {
                    const downloadsData = await downloadsResponse.json();
                    // Converter o objeto de downloads para array de IDs
                    recentDownloads = Object.keys(downloadsData.downloadedTrackIds || {})
                        .map(id => parseInt(id))
                        .filter(id => downloadsData.downloadedTrackIds[id]);

                    console.log('🔄 Downloads recentes sincronizados:', recentDownloads.length);
                }
            } catch (downloadsError) {
                console.warn('⚠️ Erro ao sincronizar downloads recentes:', downloadsError);
                // Continuar com os dados básicos se falhar
            }

            const newCacheData: DownloadsCacheData = {
                downloadedTrackIds: recentDownloads.length > 0 ? recentDownloads : (data.userData.downloadedTrackIds || []),
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
    const markAsDownloaded = useCallback(async (trackId: number) => {
        // Atualizar estado local imediatamente
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

        // Sincronizar com o banco de dados (opcional, para garantir consistência)
        if (session?.user?.id) {
            try {
                // Verificar se o download já está registrado no banco
                const checkResponse = await fetch('/api/tracks/check-downloads', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ trackIds: [trackId] })
                });

                if (checkResponse.ok) {
                    const checkData = await checkResponse.json();
                    // Se não está no banco, pode ser um problema de sincronização
                    if (!checkData.downloadedTrackIds[trackId]) {
                        console.warn('⚠️ Download marcado localmente mas não encontrado no banco:', trackId);
                    }
                }
            } catch (error) {
                console.error('❌ Erro ao verificar sincronização com banco:', error);
            }
        }
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

    // Função para forçar sincronização com o banco
    const forceSync = useCallback(async () => {
        if (!session?.user?.id) return;

        console.log('🔄 Forçando sincronização com banco de dados...');
        await refreshCache();
    }, [session?.user?.id, refreshCache]);

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
        isLiked,
        forceSync
    };
};
