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
    showNewTracksOnly = true,
    showAllTracks = true,
    showStyleDownload = false,
    selectedStyle
}: BatchDownloadButtonsProps) {
    const { startBatchDownload, cancelBatchDownload, getBatchBySourcePage, markTrackAsDownloaded, markTrackAsFailed } = useGlobalDownload();
    const pathname = usePathname();

    // Obter o batch ativo para esta página
    const activeBatch = getBatchBySourcePage(pathname);

    // Calcular contadores em tempo real usando useMemo para performance
    const realTimeCounts = useMemo(() => {
        if (activeBatch) {
            // Se há um batch ativo, calcular baseado no progresso atual
            const completedInBatch = activeBatch.progress.completed;
            const failedInBatch = activeBatch.progress.failed;
            const downloadingInBatch = activeBatch.progress.downloading;

            // Tracks que já foram processadas no batch atual (incluindo as que estão baixando)
            const processedInBatch = completedInBatch + failedInBatch + downloadingInBatch;

            // Filtrar tracks que já foram baixadas OU estão sendo processadas no batch atual
            const downloadedTracks = tracks.filter(track =>
                downloadedTrackIds.includes(track.id) ||
                activeBatch.tracks.some(batchTrack =>
                    batchTrack.id === track.id &&
                    (completedInBatch > 0 || failedInBatch > 0 || downloadingInBatch > 0)
                )
            );

            // Tracks disponíveis para download (excluindo as já baixadas E as em processamento)
            const availableTracks = tracks.filter(track =>
                !downloadedTrackIds.includes(track.id) &&
                !activeBatch.tracks.some(batchTrack =>
                    batchTrack.id === track.id &&
                    (completedInBatch > 0 || failedInBatch > 0 || downloadingInBatch > 0)
                )
            );

            return {
                newTracks: availableTracks.length,
                allTracks: tracks.length,
                downloaded: downloadedTracks.length,
                completedInBatch,
                failedInBatch,
                downloadingInBatch
            };
        } else {
            // Se não há batch ativo, usar o estado normal
            const availableTracks = tracks.filter(track => !downloadedTrackIds.includes(track.id));
            return {
                newTracks: availableTracks.length,
                allTracks: tracks.length,
                downloaded: downloadedTrackIds.length,
                completedInBatch: 0,
                failedInBatch: 0,
                downloadingInBatch: 0
            };
        }
    }, [tracks, downloadedTrackIds, activeBatch]);

    // Tracks por estilo (se aplicável)
    const styleTracks = useMemo(() => {
        if (!selectedStyle) return [];
        return tracks.filter(track => track.style === selectedStyle);
    }, [tracks, selectedStyle]);

    // Calcular progresso em tempo real
    const progressPercentage = useMemo(() => {
        return Math.min(Math.round((realTimeCounts.downloaded / realTimeCounts.allTracks) * 100), 100);
    }, [realTimeCounts.downloaded, realTimeCounts.allTracks]);

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

        await startBatchDownload(
            tracks.filter(track => !downloadedTrackIds.includes(track.id)),
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
            {/* Status do Download Ativo */}
            {activeBatch && (
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                            <h3 className="font-medium text-blue-900 dark:text-blue-100">
                                Download em Andamento: {activeBatch.name}
                            </h3>
                        </div>
                        <button
                            onClick={handleCancelDownload}
                            className="flex items-center gap-2 px-3 py-1 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg transition-colors"
                        >
                            <X className="w-4 h-4" />
                            Cancelar
                        </button>
                    </div>

                    {/* Barra de Progresso */}
                    <div className="mb-3">
                        <div className="flex justify-between text-sm text-blue-700 dark:text-blue-300 mb-1">
                            <span>Progresso</span>
                            <span>{Math.min(Math.round((activeBatch.progress.completed / activeBatch.progress.total) * 100), 100)}%</span>
                        </div>
                        <div className="w-full bg-blue-200 dark:bg-blue-800 rounded-full h-2">
                            <div
                                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${Math.min(Math.round((activeBatch.progress.completed / activeBatch.progress.total) * 100), 100)}%` }}
                            />
                        </div>
                    </div>

                    {/* Estatísticas em Tempo Real */}
                    <div className="grid grid-cols-4 gap-3 text-center">
                        <div className="bg-white dark:bg-blue-800 rounded-lg p-2">
                            <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
                                {Math.max(0, activeBatch.progress.downloading)}
                            </div>
                            <div className="text-xs text-blue-700 dark:text-blue-300">
                                Baixando
                            </div>
                        </div>
                        <div className="bg-white dark:bg-blue-800 rounded-lg p-2">
                            <div className="text-lg font-bold text-green-600 dark:text-green-400">
                                {Math.max(0, activeBatch.progress.completed)}
                            </div>
                            <div className="text-xs text-green-700 dark:text-green-300">
                                Concluídas
                            </div>
                        </div>
                        <div className="bg-white dark:bg-blue-800 rounded-lg p-2">
                            <div className="text-lg font-bold text-yellow-600 dark:text-yellow-400">
                                {Math.max(0, activeBatch.progress.pending)}
                            </div>
                            <div className="text-xs text-yellow-700 dark:text-yellow-300">
                                Pendentes
                            </div>
                        </div>
                        <div className="bg-white dark:bg-blue-800 rounded-lg p-2">
                            <div className="text-lg font-bold text-red-600 dark:text-red-400">
                                {Math.max(0, activeBatch.progress.failed)}
                            </div>
                            <div className="text-xs text-red-700 dark:text-red-300">
                                Falharam
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Botões de Download */}
            {!activeBatch && (
                <div className="flex flex-col sm:flex-row gap-3">
                    {/* Download de Novas Músicas */}
                    {showNewTracksOnly && realTimeCounts.newTracks > 0 && (
                        <button
                            onClick={handleDownloadNewTracks}
                            disabled={realTimeCounts.newTracks === 0}
                            className="flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
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
                            className="flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                        >
                            <Download className="w-5 h-5" />
                            <span>Baixar Todas ({realTimeCounts.allTracks})</span>
                        </button>
                    )}
                </div>
            )}

            {/* Download por Estilo */}
            {showStyleDownload && selectedStyle && styleTracks.length > 0 && !activeBatch && (
                <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-200 dark:border-purple-800 rounded-xl p-4 backdrop-blur-sm">
                    <div className="flex items-center justify-between mb-3">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                Estilo: {selectedStyle}
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                {styleTracks.length} músicas disponíveis para download
                            </p>
                        </div>

                        <div className="text-right">
                            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                                {styleTracks.length}
                            </div>
                            <div className="text-xs text-gray-500">músicas</div>
                        </div>
                    </div>

                    <button
                        onClick={handleDownloadStyleTracks}
                        disabled={styleTracks.length === 0}
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                    >
                        <Download className="w-5 h-5" />
                        <span>Baixar Todas do Estilo</span>
                    </button>
                </div>
            )}

            {/* Estatísticas */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                        {realTimeCounts.allTracks}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                        Total
                    </div>
                </div>

                <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                        {realTimeCounts.newTracks}
                    </div>
                    <div className="text-xs text-green-700 dark:text-green-300">
                        Novas
                    </div>
                </div>

                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                        {realTimeCounts.downloaded}
                    </div>
                    <div className="text-xs text-blue-700 dark:text-blue-300">
                        Baixadas
                    </div>
                </div>

                <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                        {progressPercentage}%
                    </div>
                    <div className="text-xs text-purple-700 dark:text-purple-300">
                        Progresso
                    </div>
                </div>
            </div>
        </div>
    );
}
