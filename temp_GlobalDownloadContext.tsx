'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { Track } from '@/types/track';
import { useSession } from 'next-auth/react';
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
    };
}

interface GlobalDownloadContextType {
    activeDownloads: DownloadBatch[];
    downloadQueue: DownloadItem[];
    startBatchDownload: (tracks: Track[], batchName: string, sourcePage: string, sourcePageName: string) => Promise<void>;
    isAnyDownloadActive: boolean;
}

const GlobalDownloadContext = createContext<GlobalDownloadContextType | undefined>(undefined);

export const GlobalDownloadProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { data: session } = useSession();
    const { showToast } = useToastContext();

    const [activeDownloads, setActiveDownloads] = useState<DownloadBatch[]>([]);
    const [downloadQueue, setDownloadQueue] = useState<DownloadItem[]>([]);

    const isAnyDownloadActive = activeDownloads.some(d => d.status === 'active');

    const downloadSingleTrack = useCallback(async (track: Track, batchId: string) => {
        try {
            console.log('Iniciando download da track:', track.songName);
            console.log('URL de download da track:', track.downloadUrl);

            setDownloadQueue(prev => prev.map(item =>
                item.track.id === track.id
                    ? { ...item, status: 'downloading', progress: 0 }
                    : item
            ));

            console.log('Autorizando download via API...');
            const response = await fetch('/api/downloads', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    trackId: track.id,
                    confirmReDownload: true
                })
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

            const fileResponse = await fetch(downloadData.downloadUrl);

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

            setDownloadQueue(prev => prev.map(item =>
                item.track.id === track.id
                    ? { ...item, status: 'completed', progress: 100 }
                    : item
            ));

            showToast(`${track.songName} baixada com sucesso!`, 'success');
        } catch (error) {
            console.error('Erro ao baixar track:', error);

            setDownloadQueue(prev => prev.map(item =>
                item.track.id === track.id
                    ? {
                        ...item,
                        status: 'failed',
                        error: error instanceof Error ? error.message : 'Erro desconhecido',
                        progress: 0
                    }
                    : item
            ));

            showToast(`Erro ao baixar ${track.songName}: ${error instanceof Error ? error.message : 'Erro desconhecido'}`, 'error');
        }
    }, [showToast]);

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
                pending: tracks.length
            }
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

        for (let i = 0; i < tracks.length; i++) {
            const track = tracks[i];
            await downloadSingleTrack(track, batchId);

            if (i < tracks.length - 1) {
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        }

        setActiveDownloads(prev => prev.map(b =>
            b.id === batchId
                ? { ...b, status: 'completed' }
                : b
        ));

        showToast('Download em lote concluido!', 'success');
    }, [session, downloadSingleTrack, showToast]);

    const contextValue: GlobalDownloadContextType = {
        activeDownloads,
        downloadQueue,
        startBatchDownload,
        isAnyDownloadActive
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



