'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { Track } from '@/types/track';
import { useSession } from 'next-auth/react';
import { useDownloadsCache } from '@/hooks/useDownloadsCache';
import { useToastContext } from '@/context/ToastContext';

interface DownloadItem {
    id: string;
    track: Track;
    status: 'pending' | 'downloading' | 'completed' | 'failed';
    error?: string;
    progress: number;
}

interface DownloadBatch {
    id: string;
    name: string;
    tracks: Track[];
    sourcePage: string;
    sourcePageName: string;
    status: 'active' | 'completed' | 'cancelled';
    progress: {
        total: number;
        completed: number;
        failed: number;
        pending: number;
        downloading: number;
    };
    startedAt: Date;
}

interface GlobalDownloadContextType {
    activeDownloads: DownloadBatch[];
    downloadQueue: DownloadItem[];
    startBatchDownload: (tracks: Track[], batchName: string, sourcePage: string, sourcePageName: string) => Promise<void>;
    cancelBatchDownload: (batchId: string) => void;
    isAnyDownloadActive: boolean;
    getBatchBySourcePage: (sourcePage: string) => DownloadBatch | undefined;
    markTrackAsDownloaded: (trackId: number) => void;
    markTrackAsFailed: (trackId: number, error: string) => void;
}

const GlobalDownloadContext = createContext<GlobalDownloadContextType | undefined>(undefined);

export const GlobalDownloadProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { data: session } = useSession();
    const { showToast } = useToastContext();
    const downloadsCache = useDownloadsCache();

    const [activeDownloads, setActiveDownloads] = useState<DownloadBatch[]>([]);
    const [downloadQueue, setDownloadQueue] = useState<DownloadItem[]>([]);
    const [cancelledBatches, setCancelledBatches] = useState<Set<string>>(new Set());
        // Map to store AbortControllers for each batch
        const batchAbortControllers = React.useRef<{ [batchId: string]: AbortController[] }>({});

    const isAnyDownloadActive = activeDownloads.some(d => d.status === 'active');

    const getBatchBySourcePage = useCallback((sourcePage: string) => {
        const batch = activeDownloads.find(batch => batch.sourcePage === sourcePage && batch.status === 'active');
        console.log('🔍 getBatchBySourcePage:', { sourcePage, batch: batch?.id, status: batch?.status });
        return batch;
    }, [activeDownloads]);

    const cancelBatchDownload = useCallback((batchId: string) => {
        console.log('🔄 GlobalDownloadContext: Cancelando batch:', batchId);
        console.log('🔄 GlobalDownloadContext: Batches ativos antes:', activeDownloads);

        setCancelledBatches(prev => new Set([...prev, batchId]));
        setActiveDownloads(prev => prev.map(batch =>
            batch.id === batchId
                ? { ...batch, status: 'cancelled' }
                : batch
        ));

        console.log('🔄 GlobalDownloadContext: Batch cancelado com sucesso');
            // Abort all ongoing downloads for this batch
            if (batchAbortControllers.current[batchId]) {
                batchAbortControllers.current[batchId].forEach(controller => controller.abort());
                delete batchAbortControllers.current[batchId];
            }
        showToast('Download cancelado com sucesso', 'info');
    }, [showToast, activeDownloads]);

    // Função para marcar uma track como baixada (usada pelos botões individuais)
    const markTrackAsDownloaded = useCallback((trackId: number) => {
        // Atualizar todos os batches ativos que contenham esta track
        setActiveDownloads(prev => prev.map(batch => {
            const trackInBatch = batch.tracks.find(track => track.id === trackId);
            if (trackInBatch && batch.status === 'active') {
                const newCompleted = batch.progress.completed + 1;
                const newPending = Math.max(0, batch.progress.pending - 1);

                return {
                    ...batch,
                    progress: {
                        ...batch.progress,
                        completed: newCompleted,
                        pending: newPending,
                        // Garantir que o total seja sempre a soma correta
                        total: batch.tracks.length
                    }
                };
            }
            return batch;
        }));

        // Atualizar a fila de downloads
        setDownloadQueue(prev => prev.map(item =>
            item.track.id === trackId
                ? { ...item, status: 'completed', progress: 100 }
                : item
        ));

        // Disparar evento customizado para notificar outros componentes
        window.dispatchEvent(new CustomEvent('trackDownloaded', {
            detail: { trackId, status: 'completed' }
        }));
    }, []);

    // Função para marcar uma track como falhada (usada pelos botões individuais)
    const markTrackAsFailed = useCallback((trackId: number, error: string) => {
        // Atualizar todos os batches ativos que contenham esta track
        setActiveDownloads(prev => prev.map(batch => {
            const trackInBatch = batch.tracks.find(track => track.id === trackId);
            if (trackInBatch && batch.status === 'active') {
                const newFailed = batch.progress.failed + 1;
                const newPending = Math.max(0, batch.progress.pending - 1);

                return {
                    ...batch,
                    progress: {
                        ...batch.progress,
                        failed: newFailed,
                        pending: newPending,
                        // Garantir que o total seja sempre a soma correta
                        total: batch.tracks.length
                    }
                };
            }
            return batch;
        }));

        // Atualizar a fila de downloads
        setDownloadQueue(prev => prev.map(item =>
            item.track.id === trackId
                ? { ...item, status: 'failed', error, progress: 0 }
                : item
        ));

        // Disparar evento customizado para notificar outros componentes
        window.dispatchEvent(new CustomEvent('trackDownloaded', {
            detail: { trackId, status: 'failed', error }
        }));
    }, []);

    const downloadSingleTrack = useCallback(async (track: Track, batchId: string) => {
        // Verificar se o batch foi cancelado
        if (cancelledBatches.has(batchId)) {
            console.log('Download cancelado para:', track.songName);
            return;
        }

        // Criar um AbortController para este download
        const controller = new AbortController();
        if (!batchAbortControllers.current[batchId]) {
            batchAbortControllers.current[batchId] = [];
        }
        batchAbortControllers.current[batchId].push(controller);

        try {
            console.log('Iniciando download da track:', track.songName);
            console.log('URL de download da track:', track.downloadUrl);

            // Atualizar status para downloading
            setDownloadQueue(prev => prev.map(item =>
                item.track.id === track.id
                    ? { ...item, status: 'downloading', progress: 0 }
                    : item
            ));

            // Atualizar contador de downloads em andamento
            setActiveDownloads(prev => prev.map(batch =>
                batch.id === batchId
                    ? {
                        ...batch,
                        progress: {
                            ...batch.progress,
                            downloading: batch.progress.downloading + 1,
                            pending: Math.max(0, batch.progress.pending - 1)
                        }
                    }
                    : batch
            ));

            console.log('Autorizando download via API...');
            const response = await fetch('/api/downloads', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    trackId: track.id,
                    confirmReDownload: true
                }),
                signal: controller.signal
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Erro na autorizacao do download');
            }

            const downloadData = await response.json();
            console.log('Download autorizado, dados recebidos:', downloadData);

            if (!downloadData.downloadUrl) {
                throw new Error('URL de download nao disponivel');
            }

            console.log('Fazendo download do arquivo de:', downloadData.downloadUrl);

            const fileResponse = await fetch(downloadData.downloadUrl, { signal: controller.signal });

            if (!fileResponse.ok) {
                throw new Error(`Erro ao baixar arquivo: ${fileResponse.status}`);
            }

            console.log('Arquivo baixado com sucesso, criando blob...');

            const blob = await fileResponse.blob();
            console.log('Blob criado, tamanho:', blob.size, 'bytes');

            const url = window.URL.createObjectURL(blob);
            console.log('URL do blob criada:', url);

            const a = document.createElement('a');
            a.href = url;
            a.download = `${track.artist} - ${track.songName}.mp3`;
            console.log('Iniciando download com nome:', a.download);
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
            console.log('Download concluido e limpeza feita');

            // Atualizar status para completed
            setDownloadQueue(prev => prev.map(item =>
                item.track.id === track.id
                    ? { ...item, status: 'completed', progress: 100 }
                    : item
            ));

            // Atualizar contadores do batch
            setActiveDownloads(prev => prev.map(batch =>
                batch.id === batchId
                    ? {
                        ...batch,
                        progress: {
                            ...batch.progress,
                            completed: batch.progress.completed + 1,
                            downloading: Math.max(0, batch.progress.downloading - 1)
                        }
                    }
                    : batch
            ));

            // Atualizar cache local para refletir em tempo real
            if (downloadsCache && typeof downloadsCache.markAsDownloaded === 'function') {
                downloadsCache.markAsDownloaded(track.id);
            }
        } catch (error) {
            if (controller.signal.aborted || (error instanceof DOMException && error.name === 'AbortError')) {
                console.log('Download abortado para:', track.songName);
                // Atualizar status para failed/cancelled
                setDownloadQueue(prev => prev.map(item =>
                    item.track.id === track.id
                        ? { ...item, status: 'failed', error: 'Cancelado pelo usuário', progress: 0 }
                        : item
                ));
                window.dispatchEvent(new CustomEvent('trackDownloaded', {
                    detail: { trackId: track.id, status: 'failed', error: 'Cancelado pelo usuário' }
                }));
            } else {
                console.error('Erro ao baixar track:', error);
                // Atualizar status para failed
                setDownloadQueue(prev => prev.map(item =>
                    item.track.id === track.id
                        ? {
                            ...item,
                            status: 'failed',
                            error: error instanceof Error ? (error as Error).message : 'Erro desconhecido',
                            progress: 0
                        }
                        : item
                ));
                setActiveDownloads(prev => prev.map(batch =>
                    batch.id === batchId
                        ? {
                            ...batch,
                            progress: {
                                ...batch.progress,
                                failed: batch.progress.failed + 1,
                                downloading: Math.max(0, batch.progress.downloading - 1)
                            }
                        }
                        : batch
                ));
                showToast(`Erro ao baixar ${track.songName}: ${error instanceof Error ? (error as Error).message : 'Erro desconhecido'}`, 'error');
            }
        } finally {
            // Remover o controller deste batch
            if (batchAbortControllers.current[batchId]) {
                batchAbortControllers.current[batchId] = batchAbortControllers.current[batchId].filter(c => c !== controller);
                if (batchAbortControllers.current[batchId].length === 0) {
                    delete batchAbortControllers.current[batchId];
                }
            }
        }
    }, [showToast, cancelledBatches, downloadsCache]);

    const startBatchDownload = useCallback(async (
        tracks: Track[],
        batchName: string,
        sourcePage: string,
        sourcePageName: string
    ) => {
        if (!session?.user) {
            showToast('Voce precisa estar logado para baixar musicas em lote', 'warning');
            return;
        }

        if (tracks.length === 0) {
            showToast('Nenhuma musica selecionada para download', 'warning');
            return;
        }

        const batchId = `batch_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        console.log('🚀 GlobalDownloadContext: Iniciando batch:', { batchId, batchName, sourcePage, tracksCount: tracks.length });

        const batch: DownloadBatch = {
            id: batchId,
            name: batchName,
            tracks,
            sourcePage,
            sourcePageName,
            status: 'active',
            progress: {
                total: tracks.length,
                completed: 0,
                failed: 0,
                pending: tracks.length,
                downloading: 0
            },
            startedAt: new Date()
        };

        setActiveDownloads(prev => [...prev, batch]);

        const downloadItems: DownloadItem[] = tracks.map(track => ({
            id: `item_${track.id}_${Date.now()}`,
            track,
            status: 'pending',
            progress: 0
        }));

        setDownloadQueue(prev => [...prev, ...downloadItems]);

        showToast(`Iniciando download de ${tracks.length} musicas...`, 'info');

        // Baixar em lotes de 10 em paralelo
        const batchSize = 10;
        for (let i = 0; i < tracks.length; i += batchSize) {
            if (cancelledBatches.has(batchId)) {
                console.log('Batch cancelado, parando downloads');
                break;
            }
            const batchTracks = tracks.slice(i, i + batchSize);
            await Promise.all(
                batchTracks.map(track => downloadSingleTrack(track, batchId))
            );
        }

        // Marcar como concluído apenas se não foi cancelado
        if (!cancelledBatches.has(batchId)) {
            setActiveDownloads(prev => prev.map(b =>
                b.id === batchId
                    ? { ...b, status: 'completed' }
                    : b
            ));

            showToast('Download em lote concluido!', 'success');
        }
    }, [session, downloadSingleTrack, showToast, cancelledBatches]);

    const contextValue: GlobalDownloadContextType = {
        activeDownloads,
        downloadQueue,
        startBatchDownload,
        cancelBatchDownload,
        isAnyDownloadActive,
        getBatchBySourcePage,
        markTrackAsDownloaded,
        markTrackAsFailed
    };

    return (
        <GlobalDownloadContext.Provider value={contextValue}>
            {children}
        </GlobalDownloadContext.Provider>
    );
};

export const useGlobalDownload = () => {
    const context = useContext(GlobalDownloadContext);
    if (context === undefined) {
        throw new Error('useGlobalDownload must be used within a GlobalDownloadProvider');
    }
    return context;
};
