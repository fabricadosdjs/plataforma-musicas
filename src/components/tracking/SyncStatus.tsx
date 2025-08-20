"use client";

import React from 'react';
import { useBatchTracking } from '@/hooks/useBatchTracking';
import { RefreshCw, CheckCircle, Clock, AlertCircle, Database } from 'lucide-react';

interface SyncStatusProps {
    className?: string;
    showDetails?: boolean;
}

export const SyncStatus: React.FC<SyncStatusProps> = ({
    className = '',
    showDetails = false
}) => {
    const {
        pendingCount,
        isProcessing,
        lastSent,
        forceSend,
        clearEvents
    } = useBatchTracking({
        maxBatchSize: 10,
        maxWaitTime: 24 * 60 * 60 * 1000, // 24 horas
        endpoint: '/api/tracking/batch'
    });

    const getStatusIcon = () => {
        if (isProcessing) return <RefreshCw className="h-4 w-4 animate-spin text-blue-500" />;
        if (pendingCount === 0) return <CheckCircle className="h-4 w-4 text-green-500" />;
        if (pendingCount > 0) return <Clock className="h-4 w-4 text-yellow-500" />;
        return <AlertCircle className="h-4 w-4 text-red-500" />;
    };

    const getStatusText = () => {
        if (isProcessing) return 'Sincronizando...';
        if (pendingCount === 0) return 'Sincronizado';
        if (pendingCount === 1) return '1 evento pendente';
        return `${pendingCount} eventos pendentes`;
    };

    const getLastSyncText = () => {
        if (!lastSent) return 'Nunca sincronizado';

        const now = Date.now();
        const diff = now - lastSent;
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

        if (hours > 0) return `Última sincronização: ${hours}h atrás`;
        if (minutes > 0) return `Última sincronização: ${minutes}min atrás`;
        return 'Sincronizado agora';
    };

    return (
        <div className={`flex items-center gap-2 ${className}`}>
            {/* Ícone de Status */}
            <div className="flex items-center gap-2">
                {getStatusIcon()}
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {getStatusText()}
                </span>
            </div>

            {/* Contador de Eventos Pendentes */}
            {pendingCount > 0 && (
                <div className="flex items-center gap-1">
                    <Database className="h-3 w-3 text-gray-500" />
                    <span className="text-xs text-gray-500">
                        {pendingCount} pendente{pendingCount !== 1 ? 's' : ''}
                    </span>
                </div>
            )}

            {/* Última Sincronização */}
            {showDetails && (
                <div className="text-xs text-gray-500">
                    {getLastSyncText()}
                </div>
            )}

            {/* Botões de Ação */}
            {showDetails && (
                <div className="flex items-center gap-1 ml-2">
                    {pendingCount > 0 && (
                        <button
                            onClick={forceSend}
                            disabled={isProcessing}
                            className="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Forçar sincronização"
                        >
                            Sincronizar
                        </button>
                    )}

                    {pendingCount > 0 && (
                        <button
                            onClick={clearEvents}
                            className="px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600"
                            title="Limpar eventos pendentes"
                        >
                            Limpar
                        </button>
                    )}
                </div>
            )}
        </div>
    );
};

export default SyncStatus;
