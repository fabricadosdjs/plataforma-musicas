import { useState, useEffect, useRef, useCallback } from 'react';

interface Style {
    name: string;
    trackCount: number;
    downloadCount: number;
}

interface Folder {
    name: string;
    trackCount: number;
    imageUrl: string;
    lastUpdated: string;
    downloadCount: number;
}

interface UseOptimizedDataFetchOptions {
    tracks: any[];
    onStylesSuccess?: (styles: Style[]) => void;
    onFoldersSuccess?: (folders: Folder[]) => void;
    onError?: (error: Error) => void;
}

export const useOptimizedDataFetch = (options: UseOptimizedDataFetchOptions) => {
    const [styles, setStyles] = useState<Style[]>([]);
    const [recentFolders, setRecentFolders] = useState<Folder[]>([]);
    const [stylesLoading, setStylesLoading] = useState(true);
    const [foldersLoading, setFoldersLoading] = useState(true);
    const abortControllerRef = useRef<AbortController | null>(null);
    const isMountedRef = useRef(true);

    // Função otimizada para buscar estilos
    const fetchStyles = useCallback(async () => {
        if (options.tracks.length === 0) return;

        try {
            console.log('🎭 Buscando estilos mais baixados...');
            setStylesLoading(true);

            const controller = new AbortController();
            abortControllerRef.current = controller;

            const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 segundos

            const response = await fetch('/api/tracks/styles/most-downloaded', {
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            if (response.ok) {
                const data = await response.json();
                if (data.success && data.styles.length > 0) {
                    console.log('✅ Estilos carregados com sucesso:', data.styles.length);
                    setStyles(data.styles.slice(0, 9));
                    options.onStylesSuccess?.(data.styles.slice(0, 9));
                } else {
                    // Fallback otimizado
                    generateStylesFallback();
                }
            } else {
                generateStylesFallback();
            }
        } catch (error) {
            console.error('❌ Erro ao buscar estilos:', error);
            generateStylesFallback();
        } finally {
            if (isMountedRef.current) {
                setStylesLoading(false);
            }
        }
    }, [options.tracks]);

    // Função otimizada para buscar folders
    const fetchRecentFolders = useCallback(async () => {
        if (options.tracks.length === 0) return;

        try {
            console.log('📁 Buscando folders recentes...');
            setFoldersLoading(true);

            const controller = new AbortController();
            abortControllerRef.current = controller;

            const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 segundos

            const response = await fetch('/api/tracks/folders/recent', {
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            if (response.ok) {
                const data = await response.json();
                if (data.success && data.folders.length > 0) {
                    console.log('✅ Folders recentes carregados com sucesso:', data.folders.length);
                    setRecentFolders(data.folders);
                    options.onFoldersSuccess?.(data.folders);
                } else {
                    generateFoldersFallback();
                }
            } else {
                generateFoldersFallback();
            }
        } catch (error) {
            console.error('❌ Erro ao buscar folders recentes:', error);
            generateFoldersFallback();
        } finally {
            if (isMountedRef.current) {
                setFoldersLoading(false);
            }
        }
    }, [options.tracks]);

    // Fallback otimizado para estilos
    const generateStylesFallback = useCallback(() => {
        if (options.tracks.length === 0) return;

        const styleCounts = new Map<string, { name: string; trackCount: number; downloadCount: number }>();

        // Processar apenas as primeiras 100 tracks para performance
        const tracksToProcess = options.tracks.slice(0, 100);

        tracksToProcess.forEach(track => {
            const style = track.style;
            if (!style) return;

            if (!styleCounts.has(style)) {
                styleCounts.set(style, { name: style, trackCount: 0, downloadCount: 0 });
            }

            const styleData = styleCounts.get(style)!;
            styleData.trackCount++;
            styleData.downloadCount = Math.floor(Math.random() * 100) + 10;
        });

        const fallbackStyles = Array.from(styleCounts.values())
            .sort((a, b) => b.downloadCount - a.downloadCount)
            .slice(0, 8);

        console.log('🔄 Usando estilos fallback:', fallbackStyles.length);
        setStyles(fallbackStyles);
        options.onStylesSuccess?.(fallbackStyles);
    }, [options.tracks]);

    // Fallback otimizado para folders
    const generateFoldersFallback = useCallback(() => {
        if (options.tracks.length === 0) return;

        const folderCounts = new Map<string, {
            name: string;
            trackCount: number;
            imageUrl: string;
            lastUpdated: string;
            downloadCount: number;
        }>();

        // Processar apenas as primeiras 100 tracks para performance
        const tracksToProcess = options.tracks.slice(0, 100);

        tracksToProcess.forEach(track => {
            const folder = track.folder;
            if (!folder) return;

            if (!folderCounts.has(folder)) {
                folderCounts.set(folder, {
                    name: folder,
                    trackCount: 0,
                    imageUrl: track.imageUrl || '/images/default-folder.jpg',
                    lastUpdated: track.updatedAt || track.createdAt,
                    downloadCount: 0
                });
            }

            const folderData = folderCounts.get(folder)!;
            folderData.trackCount++;
            folderData.downloadCount = Math.floor(Math.random() * 50) + 5;
        });

        const fallbackFolders = Array.from(folderCounts.values())
            .sort((a, b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime())
            .slice(0, 7);

        console.log('🔄 Usando folders fallback:', fallbackFolders.length);
        setRecentFolders(fallbackFolders);
        options.onFoldersSuccess?.(fallbackFolders);
    }, [options.tracks]);

    // Carregar dados quando as tracks estiverem disponíveis
    useEffect(() => {
        if (options.tracks.length > 0) {
            fetchStyles();
            fetchRecentFolders();
        }
    }, [fetchStyles, fetchRecentFolders]);

    useEffect(() => {
        isMountedRef.current = true;

        return () => {
            isMountedRef.current = false;
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
        };
    }, []);

    return {
        styles,
        recentFolders,
        stylesLoading,
        foldersLoading,
        refetchStyles: fetchStyles,
        refetchFolders: fetchRecentFolders
    };
};

