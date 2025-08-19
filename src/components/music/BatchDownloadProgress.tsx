"use client";

import React, { useState, useEffect } from 'react';
import { X, Download, Pause, Play, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import DownloadErrorLog from './DownloadErrorLog';

interface BatchDownloadProgressProps {
  isOpen: boolean;
  onClose: () => void;
  totalTracks: number;
  downloadedCount: number;
  failedCount: number;
  currentTrackName: string;
  isDownloading: boolean;
  onCancel: () => void;
  onPause: () => void;
  onResume: () => void;
  isPaused: boolean;
  estimatedTimeRemaining: string;
  downloadSpeed: string;
  contextName: string; // "Progressive House", "Protocol Recordings", etc.
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

export default function BatchDownloadProgress({
  isOpen,
  onClose,
  totalTracks,
  downloadedCount,
  failedCount,
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
}: BatchDownloadProgressProps) {
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [showErrorLog, setShowErrorLog] = useState(false);

    const remainingTracks = totalTracks - downloadedCount - failedCount;
    const progressPercentage = totalTracks > 0 ? Math.round((downloadedCount / totalTracks) * 100) : 0;
    const isCompleted = downloadedCount + failedCount >= totalTracks;

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
        if (isCompleted) return <CheckCircle className="h-6 w-6 text-green-400" />;
        if (isPaused) return <Pause className="h-6 w-6 text-yellow-400" />;
        if (isDownloading) return <Download className="h-6 w-6 text-blue-400 animate-bounce" />;
        return <Clock className="h-6 w-6 text-gray-400" />;
    };

    const getStatusText = () => {
        if (isCompleted) return 'Download Concluído';
        if (isPaused) return 'Download Pausado';
        if (isDownloading) return 'Baixando...';
        return 'Aguardando';
    };

    const getContextIcon = () => {
        return contextType === 'genre' ? '🎵' : '🏷️';
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            {/* Overlay */}
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />

            {/* Modal */}
            <div className="relative bg-gradient-to-br from-gray-900/95 via-gray-800/95 to-black/95 backdrop-blur-xl border border-gray-700/50 rounded-3xl shadow-2xl max-w-2xl w-full overflow-hidden">
                {/* Header */}
                <div className="relative p-6 border-b border-gray-700/50 bg-gradient-to-r from-blue-900/30 via-purple-900/30 to-pink-900/30">
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 p-2 rounded-xl text-gray-400 hover:bg-gray-700/50 hover:text-white transition-all duration-300"
                        disabled={isDownloading && !isCompleted}
                    >
                        <X className="h-6 w-6" />
                    </button>

                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center">
                            {getStatusIcon()}
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-white mb-1">
                                Download em Lote
                            </h2>
                            <div className="flex items-center gap-2">
                                <span className="text-2xl">{getContextIcon()}</span>
                                <p className="text-gray-300 font-medium">{contextName}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Progress Section */}
                <div className="p-6 space-y-6">
                    {/* Status atual */}
                    <div className="text-center">
                        <div className="text-lg font-semibold text-white mb-2">
                            {getStatusText()}
                        </div>
                                    {currentTrackName && isDownloading && (
              <div className="text-sm text-gray-400 truncate">
                Baixando: {currentTrackName}
                {currentAttempt > 1 && (
                  <span className="text-yellow-400 ml-2">
                    (Tentativa {currentAttempt}/3)
                  </span>
                )}
              </div>
            )}
                    </div>

                    {/* Barra de progresso */}
                    <div className="space-y-3">
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-300">Progresso</span>
                            <span className="text-white font-semibold">{progressPercentage}%</span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-500 ease-out"
                                style={{ width: `${progressPercentage}%` }}
                            >
                                <div className="h-full bg-white/20 animate-pulse rounded-full"></div>
                            </div>
                        </div>
                    </div>

                    {/* Estatísticas */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-green-900/30 border border-green-500/30 rounded-xl p-4 text-center">
                            <div className="text-2xl font-bold text-green-400">{downloadedCount}</div>
                            <div className="text-sm text-green-300">Baixadas</div>
                        </div>
                        <div className="bg-blue-900/30 border border-blue-500/30 rounded-xl p-4 text-center">
                            <div className="text-2xl font-bold text-blue-400">{remainingTracks}</div>
                            <div className="text-sm text-blue-300">Restantes</div>
                        </div>
                        <div className="bg-red-900/30 border border-red-500/30 rounded-xl p-4 text-center">
                            <div className="text-2xl font-bold text-red-400">{failedCount}</div>
                            <div className="text-sm text-red-300">Falharam</div>
                        </div>
                        <div className="bg-purple-900/30 border border-purple-500/30 rounded-xl p-4 text-center">
                            <div className="text-2xl font-bold text-purple-400">{totalTracks}</div>
                            <div className="text-sm text-purple-300">Total</div>
                        </div>
                    </div>

                    {/* Informações adicionais */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div className="bg-gray-800/50 rounded-xl p-4">
                            <div className="text-gray-400 mb-1">Tempo Decorrido</div>
                            <div className="text-white font-semibold">{formatTime(timeElapsed)}</div>
                        </div>
                        <div className="bg-gray-800/50 rounded-xl p-4">
                            <div className="text-gray-400 mb-1">Tempo Restante</div>
                            <div className="text-white font-semibold">{estimatedTimeRemaining || 'Calculando...'}</div>
                        </div>
                        <div className="bg-gray-800/50 rounded-xl p-4">
                            <div className="text-gray-400 mb-1">Velocidade</div>
                            <div className="text-white font-semibold">{downloadSpeed || 'N/A'}</div>
                        </div>
                                    <div className="bg-gray-800/50 rounded-xl p-4">
              <div className="text-gray-400 mb-1">Status</div>
              <div className="text-white font-semibold">
                {isCompleted ? 'Finalizado' : isDownloading ? 'Ativo' : 'Pausado'}
              </div>
            </div>
            {retryCount > 0 && (
              <div className="bg-yellow-900/30 rounded-xl p-4 border border-yellow-500/30">
                <div className="text-yellow-400 mb-1">Tentativas</div>
                <div className="text-white font-semibold">{retryCount}</div>
              </div>
            )}
                    </div>

                    {/* Controles */}
                    <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-700/50">
                        {!isCompleted && (
                            <>
                                {isDownloading && !isPaused ? (
                                    <button
                                        onClick={onPause}
                                        className="flex-1 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2"
                                    >
                                        <Pause className="h-5 w-5" />
                                        Pausar
                                    </button>
                                ) : (
                                    <button
                                        onClick={onResume}
                                        className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2"
                                    >
                                        <Play className="h-5 w-5" />
                                        {downloadedCount > 0 ? 'Continuar' : 'Iniciar'}
                                    </button>
                                )}

                                <button
                                    onClick={onCancel}
                                    className="flex-1 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2"
                                >
                                    <X className="h-5 w-5" />
                                    Cancelar
                                </button>
                            </>
                        )}

                        {isCompleted && (
                            <button
                                onClick={onClose}
                                className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2"
                            >
                                <CheckCircle className="h-5 w-5" />
                                Concluído - Fechar
                            </button>
                        )}
                    </div>

                    {/* Log de Erros */}
                    <DownloadErrorLog 
                        errors={downloadErrors}
                        isOpen={showErrorLog}
                        onToggle={() => setShowErrorLog(!showErrorLog)}
                    />

                    {/* Aviso */}
                    {isDownloading && (
                        <div className="bg-blue-900/20 border border-blue-500/30 rounded-xl p-4 flex items-start gap-3">
                            <AlertCircle className="h-5 w-5 text-blue-400 mt-0.5 flex-shrink-0" />
                            <div className="text-sm text-blue-300">
                                <p className="font-semibold mb-1">Download em andamento</p>
                                <p>Os downloads são processados em lotes de 10 por vez para melhor performance. Não feche esta janela durante o processo.</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
