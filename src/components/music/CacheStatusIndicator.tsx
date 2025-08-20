import React from 'react';
import { RefreshCw, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import { useDownloadsCache } from '@/hooks/useDownloadsCache';

interface CacheStatusIndicatorProps {
    className?: string;
}

export const CacheStatusIndicator: React.FC<CacheStatusIndicatorProps> = ({ className = '' }) => {
    const { isLoading, error, lastUpdated } = useDownloadsCache();

    if (isLoading) {
        return (
            <div className={`flex items-center gap-2 text-xs text-blue-400 ${className}`}>
                <RefreshCw size={14} className="animate-spin" />
                <span>Sincronizando...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className={`flex items-center gap-2 text-xs text-red-400 ${className}`}>
                <AlertCircle size={14} />
                <span>Erro no cache</span>
            </div>
        );
    }

    if (lastUpdated) {
        const lastUpdate = new Date(lastUpdated);
        const now = new Date();
        const diffMinutes = Math.floor((now.getTime() - lastUpdate.getTime()) / (1000 * 60));

        let statusColor = 'text-green-400';
        let statusIcon = <CheckCircle size={14} />;
        let statusText = 'Sincronizado';

        if (diffMinutes > 5) {
            statusColor = 'text-yellow-400';
            statusIcon = <Clock size={14} />;
            statusText = `Atualizado há ${diffMinutes}min`;
        }

        return (
            <div className={`flex items-center gap-2 text-xs ${statusColor} ${className}`}>
                {statusIcon}
                <span>{statusText}</span>
            </div>
        );
    }

    return null;
};


