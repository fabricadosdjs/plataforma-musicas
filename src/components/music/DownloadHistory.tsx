"use client";

import React from 'react';
import { Calendar, Download, CheckCircle, XCircle, AlertTriangle, Music, Tag } from 'lucide-react';

interface DownloadHistoryEntry {
    id: string;
    contextName: string;
    contextType: 'genre' | 'pool';
    totalTracks: number;
    downloadedCount: number;
    failedCount: number;
    startTime: number;
    endTime?: number;
    status: 'completed' | 'cancelled' | 'failed';
}

interface DownloadHistoryProps {
    history: DownloadHistoryEntry[];
}

export default function DownloadHistory({ history }: DownloadHistoryProps) {
    const formatDate = (timestamp: number) => {
        return new Date(timestamp).toLocaleString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatDuration = (startTime: number, endTime?: number) => {
        if (!endTime) return 'Em andamento...';

        const duration = Math.round((endTime - startTime) / 1000);
        const minutes = Math.floor(duration / 60);
        const seconds = duration % 60;

        if (minutes > 0) {
            return `${minutes}m ${seconds}s`;
        }
        return `${seconds}s`;
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'completed':
                return <CheckCircle className="h-5 w-5 text-green-400" />;
            case 'cancelled':
                return <XCircle className="h-5 w-5 text-yellow-400" />;
            case 'failed':
                return <AlertTriangle className="h-5 w-5 text-red-400" />;
            default:
                return <Download className="h-5 w-5 text-blue-400" />;
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'completed':
                return 'Concluído';
            case 'cancelled':
                return 'Cancelado';
            case 'failed':
                return 'Falharam';
            default:
                return 'Desconhecido';
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'completed':
                return 'from-green-900/30 to-emerald-900/30 border-green-500/30';
            case 'cancelled':
                return 'from-yellow-900/30 to-orange-900/30 border-yellow-500/30';
            case 'failed':
                return 'from-red-900/30 to-rose-900/30 border-red-500/30';
            default:
                return 'from-gray-900/30 to-slate-900/30 border-gray-500/30';
        }
    };

    if (history.length === 0) {
        return (
            <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Download className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">
                    Nenhum histórico de download
                </h3>
                <p className="text-gray-400">
                    Seus downloads em lote aparecerão aqui
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {history.map((entry) => {
                const successRate = entry.totalTracks > 0
                    ? Math.round((entry.downloadedCount / entry.totalTracks) * 100)
                    : 0;

                return (
                    <div
                        key={entry.id}
                        className={`bg-gradient-to-r ${getStatusColor(entry.status)} backdrop-blur-sm border rounded-2xl p-6 hover:scale-[1.02] transition-all duration-300`}
                    >
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-gray-800 rounded-xl flex items-center justify-center">
                                    {entry.contextType === 'genre' ? (
                                        <Music className="h-6 w-6 text-purple-400" />
                                    ) : (
                                        <Tag className="h-6 w-6 text-amber-400" />
                                    )}
                                </div>
                                <div>
                                    <h3 className="font-bold text-white text-lg">
                                        {entry.contextName}
                                    </h3>
                                    <p className="text-gray-400 text-sm">
                                        {entry.contextType === 'genre' ? 'Gênero Musical' : 'Pool/Label'}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                {getStatusIcon(entry.status)}
                                <span className="text-sm font-medium text-white">
                                    {getStatusText(entry.status)}
                                </span>
                            </div>
                        </div>

                        {/* Estatísticas */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                            <div className="text-center">
                                <div className="text-2xl font-bold text-green-400">
                                    {entry.downloadedCount}
                                </div>
                                <div className="text-xs text-green-300">Baixadas</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-red-400">
                                    {entry.failedCount}
                                </div>
                                <div className="text-xs text-red-300">Falharam</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-blue-400">
                                    {entry.totalTracks}
                                </div>
                                <div className="text-xs text-blue-300">Total</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-purple-400">
                                    {successRate}%
                                </div>
                                <div className="text-xs text-purple-300">Sucesso</div>
                            </div>
                        </div>

                        {/* Barra de progresso */}
                        <div className="mb-4">
                            <div className="flex justify-between text-sm mb-2">
                                <span className="text-gray-300">Progresso</span>
                                <span className="text-white">{successRate}%</span>
                            </div>
                            <div className="w-full bg-gray-700 rounded-full h-2">
                                <div
                                    className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full"
                                    style={{ width: `${successRate}%` }}
                                />
                            </div>
                        </div>

                        {/* Informações de tempo */}
                        <div className="flex items-center justify-between text-sm text-gray-400">
                            <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4" />
                                <span>{formatDate(entry.startTime)}</span>
                            </div>
                            <div>
                                Duração: {formatDuration(entry.startTime, entry.endTime)}
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
