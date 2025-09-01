import { useState, useEffect, useCallback, useRef } from 'react';
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
    lastUpdated: string;
    refreshCache: () => Promise<void>;
    markAsDownloaded: (trackId: number) => Promise<void>;
    markAsLiked: (trackId: number) => void;
    markAsUnliked: (trackId: number) => void;
    isDownloaded: (trackId: number) => boolean;
    isLiked: (trackId: number) => boolean;
    forceSync: () => Promise<void>;
}

// Cache em memória para melhor performance
const memoryCache = new Map<string, { data: DownloadsCacheData; timestamp: number }>();
const CACHE_TTL = 2 * 60 * 1000; // 2 minutos

// Função auxiliar para criar fetch com timeout otimizado e retry
const fetchWithTimeout = async (url: string, options: RequestInit, timeout = 15000, retries = 1) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
        const response = await fetch(url, {
            ...options,
            signal: controller.signal,
            // Adicionar headers para melhorar performance
            headers: {
                'Cache-Control': 'no-cache',
                'Pragma': 'no-cache',
                ...options.headers,
            }
        });
        clearTimeout(timeoutId);
        return response;
    } catch (error) {
        clearTimeout(timeoutId);

        if (error instanceof Error && error.name === 'AbortError') {
            // Se ainda há tentativas, tentar novamente com timeout maior
            if (retries > 0) {
                console.log(`⏰ Timeout detectado, tentando novamente (${retries} tentativa(s) restante(s))`);
                return fetchWithTimeout(url, options, timeout * 1.5, retries - 1);
            }
            throw new Error(`Request timeout após ${retries + 1} tentativa(s)`);
        }
        throw error;
    }
};

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

    // Ref para evitar múltiplas chamadas simultâneas
    const refreshPromiseRef = useRef<Promise<void> | null>(null);

    // Carregar cache do localStorage na inicialização
    useEffect(() => {
        if (!session?.user?.id) return;

        try {
            // Primeiro verificar cache em memória
            const memoryKey = `memory_${session.user.id}`;
            const memoryData = memoryCache.get(memoryKey);

            if (memoryData && (Date.now() - memoryData.timestamp) < CACHE_TTL) {
                setCacheData(memoryData.data);
                console.log('✅ Cache de downloads carregado da memória');
                return;
            }

            // Se não há cache em memória, verificar localStorage
            const savedCache = localStorage.getItem(`downloads_cache_${session.user.id}`);
            if (savedCache) {
                const parsed = JSON.parse(savedCache);
                const cacheAge = Date.now() - new Date(parsed.lastUpdated).getTime();

                // Cache válido por 2 minutos (reduzido de 5 para 2)
                if (cacheAge < CACHE_TTL) {
                    setCacheData(parsed);
                    // Salvar na memória também
                    memoryCache.set(memoryKey, { data: parsed, timestamp: Date.now() });
                    console.log('✅ Cache de downloads carregado do localStorage');
                    return;
                }
            }
        } catch (error) {
            console.error('❌ Erro ao carregar cache:', error);
        }

        // Se não há cache válido, carregar da API
        refreshCache();
    }, [session?.user?.id]);

    // Função para atualizar cache da API com debounce e retry automático
    const refreshCache: (retryCount?: number) => Promise<void> = useCallback(async (retryCount = 0) => {
        if (!session?.user?.id) return;

        // Evitar múltiplas chamadas simultâneas
        if (refreshPromiseRef.current) {
            return refreshPromiseRef.current;
        }

        setIsLoading(true);
        setError(null);

        const refreshPromise = (async () => {
            try {
                console.log('🔄 Atualizando cache de downloads...');

                // Primeiro, buscar dados básicos do usuário com timeout otimizado
                const response = await fetchWithTimeout('/api/tracks', {}, 20000); // 20 segundos para API principal

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
                    const downloadsResponse = await fetchWithTimeout('/api/tracks/check-downloads', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            trackIds: data.userData.downloadedTrackIds || []
                        })
                    }, 15000); // 15 segundos para verificação de downloads

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
                if (session?.user?.id) {
                    try {
                        localStorage.setItem(`downloads_cache_${session.user.id}`, JSON.stringify(newCacheData));
                        // Salvar na memória também
                        memoryCache.set(`memory_${session.user.id}`, { data: newCacheData, timestamp: Date.now() });
                        console.log('💾 Cache salvo no localStorage');
                    } catch (error) {
                        console.error('❌ Erro ao salvar cache no localStorage:', error);
                    }
                }

                console.log('✅ Cache atualizado com sucesso');
            } catch (error) {
                console.error('❌ Erro ao atualizar cache:', error);

                // Tratamento específico para timeouts com retry automático
                if (error instanceof Error && error.message.includes('timeout')) {
                    if (retryCount < 2) { // Máximo 3 tentativas (0, 1, 2)
                        console.warn(`⏰ Timeout detectado, tentando novamente (${retryCount + 1}/3)...`);
                        // Aguardar um pouco antes de tentar novamente
                        await new Promise(resolve => setTimeout(resolve, 2000));
                        // Tentar novamente com timeout maior
                        return refreshCache(retryCount + 1);
                    } else {
                        setError(`Timeout persistente: A API não respondeu após 3 tentativas. Verifique sua conexão.`);
                        console.error('❌ Timeout persistente após 3 tentativas');
                    }
                } else {
                    if (error instanceof Error) {
                        setError(error.message || 'Erro desconhecido');
                    } else {
                        setError(String(error) || 'Erro desconhecido');
                    }
                }
            } finally {
                setIsLoading(false);
                refreshPromiseRef.current = null; // Limpar o ref após a conclusão
            }
        })();

        refreshPromiseRef.current = refreshPromise; // Armazenar a promessa
        return refreshPromise; // Retornar a promessa para o componente que chamou
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
                    // Salvar na memória também
                    memoryCache.set(`memory_${session.user.id}`, { data: newData, timestamp: Date.now() });
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
                const checkResponse = await fetchWithTimeout('/api/tracks/check-downloads', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ trackIds: [trackId] })
                }, 15000); // 15 segundos para verificação individual

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
                    // Salvar na memória também
                    memoryCache.set(`memory_${session.user.id}`, { data: newData, timestamp: Date.now() });
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
                    // Salvar na memória também
                    memoryCache.set(`memory_${session.user.id}`, { data: newData, timestamp: Date.now() });
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
        await refreshCache(0); // Resetar contador de tentativas
    }, [session?.user?.id, refreshCache]);

    return {
        downloadedTrackIds: cacheData.downloadedTrackIds,
        likedTrackIds: cacheData.likedTrackIds,
        isVip: cacheData.isVip,
        downloadsLeft: cacheData.downloadsLeft,
        dailyDownloadCount: cacheData.dailyDownloadCount,
        lastUpdated: cacheData.lastUpdated,
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
