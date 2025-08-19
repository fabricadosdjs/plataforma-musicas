"use client";

import React, { useState, useEffect } from 'react';
import { Download, Pause, Play, CheckCircle, XCircle, RefreshCw, AlertTriangle, Clock } from 'lucide-react';
import DownloadErrorLog from './DownloadErrorLog';

interface InlineDownloadProgressProps {
    isActive: boolean;
    totalTracks: number;
    downloadedCount: number;
    failedCount: number;
    skippedCount?: number; // Nova propriedade
    currentTrackName: string;
    isDownloading: boolean;
    onCancel: () => void;
    onPause: () => void;
    onResume: () => void;
    isPaused: boolean;
    estimatedTimeRemaining: string;
    downloadSpeed: string;
    contextName: string;
    contextType: 'genre' | 'pool';
    retryCount?: number;
    currentAttempt?: number;
    downloadErrors?: Array<{
        trackName: string;
        attempts: number;
        lastError: string;
        timestamp: number;
    }>;
}

export default function InlineDownloadProgress({
    isActive,
    totalTracks,
    downloadedCount,
    failedCount,
    skippedCount = 0,
    currentTrackName,
    isDownloading,
    onCancel,
    onPause,
    onResume,
    isPaused,
    estimatedTimeRemaining,
    downloadSpeed,
    contextName,
    contextType,
    retryCount = 0,
    currentAttempt = 1,
    downloadErrors = []
}: InlineDownloadProgressProps) {
    const [timeElapsed, setTimeElapsed] = useState(0);
    const [showErrorLog, setShowErrorLog] = useState(false);

    const remainingTracks = totalTracks - downloadedCount - failedCount - skippedCount;
    const progressPercentage = totalTracks > 0 ? Math.round(((downloadedCount + skippedCount) / totalTracks) * 100) : 0;
    const isCompleted = downloadedCount + failedCount + skippedCount >= totalTracks;

    // Timer para tempo decorrido
    useEffect(() => {
        if (!isDownloading || isPaused || isCompleted) return;

        const interval = setInterval(() => {
            setTimeElapsed(prev => prev + 1);
        }, 1000);

        return () => clearInterval(interval);
    }, [isDownloading, isPaused, isCompleted]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const getStatusIcon = () => {
        if (isCompleted) return <CheckCircle className="h-5 w-5 text-green-400" />;
        if (isPaused) return <Pause className="h-5 w-5 text-yellow-400" />;
        if (isDownloading) return <Download className="h-5 w-5 text-blue-400 animate-bounce" />;
        return <Clock className="h-5 w-5 text-gray-400" />;
    };

    const getStatusText = () => {
        if (isCompleted) return 'Download Concluído';
        if (isPaused) return 'Download Pausado';
        if (isDownloading) return 'Baixando...';
        return 'Aguardando';
    };

    if (!isActive) return null;

    return (
        <div className="mt-6 bg-gradient-to-br from-gray-900/95 via-gray-800/95 to-black/95 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6 shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
                        {getStatusIcon()}
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-white">
                            Download em Progresso
                        </h3>
                        <p className="text-gray-300 text-sm">
                            {contextType === 'genre' ? '🎵' : '🏷️'} {contextName}
                        </p>
                    </div>
                </div>

                <div className="text-right">
                    <div className="text-2xl font-bold text-white">
                        {progressPercentage}%
                    </div>
                    <div className="text-sm text-gray-400">
                        {getStatusText()}
                    </div>
                </div>
            </div>

            {/* Música atual */}
            {currentTrackName && isDownloading && (
                <div className="mb-4 p-3 bg-gray-800/50 rounded-xl">
                    <div className="flex items-center gap-2 mb-1">
                        <RefreshCw className="h-4 w-4 text-blue-400 animate-spin" />
                        <span className="text-sm text-gray-400">Baixando agora:</span>
                    </div>
                    <div className="text-white font-medium truncate">
                        {currentTrackName}
                        {currentAttempt > 1 && (
                            <span className="text-yellow-400 ml-2 text-sm">
                                (Tentativa {currentAttempt}/3)
                            </span>
                        )}
                    </div>
                </div>
            )}

            {/* Barra de progresso */}
            <div className="mb-4">
                <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
                    <div
                        className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-500 ease-out relative"
                        style={{ width: `${progressPercentage}%` }}
                    >
                        <div className="absolute inset-0 bg-white/20 animate-pulse rounded-full"></div>
                    </div>
                </div>
            </div>

            {/* Estatísticas compactas */}
            <div className={`grid gap-3 mb-4 ${skippedCount > 0 ? 'grid-cols-2 md:grid-cols-5' : 'grid-cols-2 md:grid-cols-4'}`}>
                <div className="text-center p-2 bg-green-900/30 border border-green-500/30 rounded-lg">
                    <div className="text-lg font-bold text-green-400">{downloadedCount}</div>
                    <div className="text-xs text-green-300">Baixadas</div>
                </div>
                {skippedCount > 0 && (
                    <div className="text-center p-2 bg-yellow-900/30 border border-yellow-500/30 rounded-lg">
                        <div className="text-lg font-bold text-yellow-400">{skippedCount}</div>
                        <div className="text-xs text-yellow-300">Puladas</div>
                    </div>
                )}
                <div className="text-center p-2 bg-blue-900/30 border border-blue-500/30 rounded-lg">
                    <div className="text-lg font-bold text-blue-400">{remainingTracks}</div>
                    <div className="text-xs text-blue-300">Restantes</div>
                </div>
                <div className="text-center p-2 bg-red-900/30 border border-red-500/30 rounded-lg">
                    <div className="text-lg font-bold text-red-400">{failedCount}</div>
                    <div className="text-xs text-red-300">Falharam</div>
                </div>
                <div className="text-center p-2 bg-purple-900/30 border border-purple-500/30 rounded-lg">
                    <div className="text-lg font-bold text-purple-400">{totalTracks}</div>
                    <div className="text-xs text-purple-300">Total</div>
                </div>
            </div>

            {/* Informações de tempo - layout compacto */}
            <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
                <div className="bg-gray-800/50 rounded-lg p-2">
                    <div className="text-gray-400">Tempo: {formatTime(timeElapsed)}</div>
                </div>
                <div className="bg-gray-800/50 rounded-lg p-2">
                    <div className="text-gray-400">Restante: {estimatedTimeRemaining || 'Calculando...'}</div>
                </div>
                <div className="bg-gray-800/50 rounded-lg p-2">
                    <div className="text-gray-400">Velocidade: {downloadSpeed || 'N/A'}</div>
                </div>
                {retryCount > 0 && (
                    <div className="bg-yellow-900/30 rounded-lg p-2 border border-yellow-500/30">
                        <div className="text-yellow-300">Tentativas: {retryCount}</div>
                    </div>
                )}
            </div>

            {/* Controles */}
            <div className="flex flex-col sm:flex-row gap-2">
                {!isCompleted && (
                    <>
                        {isDownloading && !isPaused ? (
                            <button
                                onClick={onPause}
                                className="flex-1 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white px-4 py-2 rounded-lg font-medium transition-all duration-300 flex items-center justify-center gap-2"
                            >
                                <Pause className="h-4 w-4" />
                                Pausar
                            </button>
                        ) : (
                            <button
                                onClick={onResume}
                                className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white px-4 py-2 rounded-lg font-medium transition-all duration-300 flex items-center justify-center gap-2"
                            >
                                <Play className="h-4 w-4" />
                                {downloadedCount > 0 ? 'Continuar' : 'Iniciar'}
                            </button>
                        )}

                        <button
                            onClick={onCancel}
                            className="flex-1 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white px-4 py-2 rounded-lg font-medium transition-all duration-300 flex items-center justify-center gap-2"
                        >
                            <XCircle className="h-4 w-4" />
                            Cancelar
                        </button>
                    </>
                )}

                {isCompleted && (
                    <div className="w-full text-center p-3 bg-gradient-to-r from-green-900/30 to-emerald-900/30 border border-green-500/30 rounded-lg">
                        <div className="flex items-center justify-center gap-2 text-green-400">
                            <CheckCircle className="h-5 w-5" />
                            <span className="font-semibold">
                                {skippedCount > 0
                                    ? `Download Concluído! ${downloadedCount} baixadas, ${skippedCount} puladas de ${totalTracks} total`
                                    : `Download Concluído! ${downloadedCount}/${totalTracks} músicas baixadas`
                                }
                            </span>
                        </div>
                    </div>
                )}
            </div>

            {/* Log de Erros */}
            <DownloadErrorLog
                errors={downloadErrors}
                isOpen={showErrorLog}
                onToggle={() => setShowErrorLog(!showErrorLog)}
            />

            {/* Aviso para não fechar */}
            {isDownloading && (
                <div className="mt-4 bg-blue-900/20 border border-blue-500/30 rounded-lg p-3 flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 text-blue-400 mt-0.5 flex-shrink-0" />
                    <div className="text-xs text-blue-300">
                        <p className="font-medium mb-1">Download em andamento</p>
                        <p>Os downloads são processados em lotes de 10 por vez. Mantenha a página aberta.</p>
                    </div>
                </div>
            )}
        </div>
    );
}
