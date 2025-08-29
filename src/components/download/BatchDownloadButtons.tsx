'use client';

import React, { useEffect, useMemo } from 'react';
import { Track } from '@/types/track';
import { useGlobalDownload } from '@/context/GlobalDownloadContext';
import { Download, X } from 'lucide-react';
import { usePathname } from 'next/navigation';

interface BatchDownloadButtonsProps {
    tracks: Track[];
    downloadedTrackIds: number[];
    batchName: string;
    sourcePageName: string;
    isGlobal?: boolean;
    className?: string;
    showNewTracksOnly?: boolean;
    showAllTracks?: boolean;

    showStyleDownload?: boolean;
    selectedStyle?: string;
}

export default function BatchDownloadButtons({
    tracks,
    downloadedTrackIds,
    batchName,
    sourcePageName,
    isGlobal = false,
    className = '',
    showNewTracksOnly,
    showAllTracks,
    showStyleDownload,
    selectedStyle
}: BatchDownloadButtonsProps) {

    // Global download context
    const {
        activeDownloads,
        startBatchDownload,
        cancelBatchDownload,
        markTrackAsDownloaded,
        markTrackAsFailed,
        getBatchBySourcePage
    } = useGlobalDownload();

    const pathname = usePathname();

    // Real-time counts
    const realTimeCounts = useMemo(() => {
        const newTracks = tracks.filter(track => !downloadedTrackIds.includes(track.id)).length;
        const allTracks = tracks.length;
        return { newTracks, allTracks };
    }, [tracks, downloadedTrackIds]);

    // Style tracks (if applicable)
    const styleTracks = useMemo(() => {
        if (!showStyleDownload || !selectedStyle) return [];
        return tracks.filter(track => track.style === selectedStyle);
    }, [tracks, showStyleDownload, selectedStyle]);

    // Active batch for this page
    const activeBatch = getBatchBySourcePage ? getBatchBySourcePage(pathname) : undefined;

    // Escutar eventos de download individual para atualizar em tempo real
    useEffect(() => {
        const handleTrackDownloaded = (event: CustomEvent) => {
            const { trackId, status, error } = event.detail;

            // Verificar se a track pertence a esta página
            const trackInCurrentPage = tracks.find(track => track.id === trackId);
            if (!trackInCurrentPage) return;

            // Atualizar o contexto global baseado no status
            if (status === 'completed') {
                markTrackAsDownloaded(trackId);
            } else if (status === 'failed') {
                markTrackAsFailed(trackId, error || 'Erro desconhecido');
            }
        };

        // Adicionar listener para eventos de download
        window.addEventListener('trackDownloaded', handleTrackDownloaded as EventListener);

        // Cleanup
        return () => {
            window.removeEventListener('trackDownloaded', handleTrackDownloaded as EventListener);
        };
    }, [tracks, markTrackAsDownloaded, markTrackAsFailed]);

    const handleDownloadNewTracks = async () => {
        if (realTimeCounts.newTracks === 0) {
            return;
        }
        // Baixar apenas as músicas que faltam
        const tracksToDownload = tracks.filter(track => !downloadedTrackIds.includes(track.id));
        await startBatchDownload(
            tracksToDownload,
            `${batchName} - Novas Músicas`,
            pathname,
            sourcePageName
        );
    };

    const handleDownloadAllTracks = async () => {
        if (realTimeCounts.allTracks === 0) {
            return;
        }
        await startBatchDownload(
            tracks,
            `${batchName} - Todas as Músicas`,
            pathname,
            sourcePageName
        );
    };

    const handleDownloadStyleTracks = async () => {
        if (styleTracks.length === 0) {
            return;
        }

        await startBatchDownload(
            styleTracks,
            `${batchName} - ${selectedStyle}`,
            pathname,
            sourcePageName
        );
    };

    const handleCancelDownload = () => {
        if (activeBatch) {
            console.log('Cancelando download do batch:', activeBatch.id);
            cancelBatchDownload(activeBatch.id);
        }
    };

    if (tracks.length === 0) {
        return null;
    }

    return (
        <div className={`space-y-3 ${className}`}>
            {/* Botões de Download */}
            {!activeBatch && (
                <div className="bg-[#181818]/80 backdrop-blur-sm rounded-xl p-6 border border-[#282828]/50 shadow-2xl">
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        {/* Download de Novas Músicas */}
                        {showNewTracksOnly && (
                            <button
                                onClick={handleDownloadNewTracks}
                                disabled={realTimeCounts.newTracks === 0}
                                className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 disabled:from-gray-400 disabled:to-blue-500 disabled:cursor-not-allowed transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 min-w-[200px]"
                            >
                                <Download className="w-5 h-5" />
                                <span>Baixar Novas ({realTimeCounts.newTracks})</span>
                            </button>
                        )}

                        {/* Download de Todas as Músicas */}
                        {showAllTracks && realTimeCounts.allTracks > 0 && (
                            <button
                                onClick={handleDownloadAllTracks}
                                disabled={realTimeCounts.allTracks === 0}
                                className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 disabled:from-gray-400 disabled:to-green-500 disabled:cursor-not-allowed transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 min-w-[200px]"
                            >
                                <Download className="w-5 h-5" />
                                <span>Baixar Todas ({realTimeCounts.allTracks})</span>
                            </button>
                        )}
                    </div>
                </div>
            )}
            {/* Progresso removido para simplificar igual ao /new */}
        </div>
    );
}
