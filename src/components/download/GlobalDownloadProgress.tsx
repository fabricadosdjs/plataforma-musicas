'use client';

import React from 'react';
import { useGlobalDownload } from '@/context/GlobalDownloadContext';
import { Download } from 'lucide-react';

interface GlobalDownloadProgressProps {
    className?: string;
}

export default function GlobalDownloadProgress({ className = '' }: GlobalDownloadProgressProps) {
    const { activeDownloads, isAnyDownloadActive } = useGlobalDownload();

    // Se não há downloads ativos, não renderiza nada
    if (!isAnyDownloadActive || activeDownloads.length === 0) {
        return null;
    }

    return (
        <div className={`fixed bottom-4 right-4 w-80 bg-white dark:bg-gray-900 rounded-lg shadow-xl border z-50 overflow-hidden ${className}`}>
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2">
                    <Download className="w-5 h-5 text-blue-500" />
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                        Downloads em Massa
                    </h3>
                    <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                        {activeDownloads.length}
                    </span>
                </div>
            </div>

            {/* Downloads Ativos */}
            <div className="max-h-64 overflow-y-auto">
                {activeDownloads.map((batch) => (
                    <div
                        key={batch.id}
                        className="border-l-4 border-blue-500 bg-blue-50 dark:bg-blue-900/20 p-4"
                    >
                        <div className="mb-3">
                            <h4 className="font-medium text-sm text-gray-900 dark:text-white mb-2">
                                {batch.name}
                            </h4>
                            <div className="text-xs text-gray-500 mb-2">
                                {batch.sourcePageName}
                            </div>

                            {/* Progresso */}
                            <div className="mb-3">
                                <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mb-1">
                                    <span>Progresso</span>
                                    <span>{Math.round((batch.progress.completed / batch.progress.total) * 100)}%</span>
                                </div>
                                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                    <div
                                        className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                                        style={{ width: `${Math.round((batch.progress.completed / batch.progress.total) * 100)}%` }}
                                    />
                                </div>
                            </div>

                            {/* Estatísticas */}
                            <div className="flex items-center gap-4 text-xs text-gray-600 dark:text-gray-400">
                                <span>✓ {batch.progress.completed}</span>
                                <span>⏳ {batch.progress.pending}</span>
                                {batch.progress.failed > 0 && (
                                    <span className="text-red-500">⚠ {batch.progress.failed}</span>
                                )}
                                <span>{batch.progress.completed}/{batch.progress.total}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
