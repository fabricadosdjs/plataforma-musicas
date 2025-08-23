import React from 'react';
import { AlertCircle, CheckCircle, X, Info, Bell, Crown, Shield, Download, Star, Zap } from 'lucide-react';
import Link from 'next/link';
import { Notification } from '@/hooks/useNotifications';

interface NotificationItemProps {
    notification: Notification;
    onMarkAsRead: (id: string) => void;
    onRemove: (id: string) => void;
}

const getIconForType = (type: Notification['type'], category: Notification['category']) => {
    if (category === 'plan') return <Crown className="h-4 w-4" />;
    if (category === 'security') return <Shield className="h-4 w-4" />;
    if (category === 'download') return <Download className="h-4 w-4" />;
    if (category === 'feature') return <Star className="h-4 w-4" />;
    if (category === 'system') return <Zap className="h-4 w-4" />;

    switch (type) {
        case 'error': return <X className="h-4 w-4" />;
        case 'warning': return <AlertCircle className="h-4 w-4" />;
        case 'success': return <CheckCircle className="h-4 w-4" />;
        case 'info': return <Info className="h-4 w-4" />;
        default: return <Bell className="h-4 w-4" />;
    }
};

const getTypeStyles = (type: Notification['type']) => {
    switch (type) {
        case 'error':
            return 'bg-red-500/20 text-red-400 border-red-500/30';
        case 'warning':
            return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
        case 'success':
            return 'bg-green-500/20 text-green-400 border-green-500/30';
        case 'info':
            return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
        default:
            return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
};

const getCategoryColor = (category: Notification['category']) => {
    switch (category) {
        case 'plan': return 'border-l-yellow-500 bg-yellow-500/5';
        case 'security': return 'border-l-red-500 bg-red-500/5';
        case 'download': return 'border-l-green-500 bg-green-500/5';
        case 'feature': return 'border-l-purple-500 bg-purple-500/5';
        case 'system': return 'border-l-blue-500 bg-blue-500/5';
        default: return 'border-l-gray-500 bg-gray-500/5';
    }
};

const getCategoryLabel = (category: Notification['category']) => {
    switch (category) {
        case 'plan': return 'Plano';
        case 'security': return 'Segurança';
        case 'download': return 'Download';
        case 'feature': return 'Recurso';
        case 'system': return 'Sistema';
        default: return 'Geral';
    }
};

export const NotificationItem: React.FC<NotificationItemProps> = ({
    notification,
    onMarkAsRead,
    onRemove
}) => {
    const handleMarkAsRead = () => {
        onMarkAsRead(notification.id);
    };

    const handleRemove = (e: React.MouseEvent) => {
        e.stopPropagation();
        onRemove(notification.id);
    };

    const formatTimeAgo = (timestamp: Date) => {
        const now = new Date();
        const diffMs = now.getTime() - timestamp.getTime();
        const diffMins = Math.floor(diffMs / (1000 * 60));
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        if (diffMins < 1) return 'Agora';
        if (diffMins < 60) return `${diffMins}m atrás`;
        if (diffHours < 24) return `${diffHours}h atrás`;
        if (diffDays < 7) return `${diffDays}d atrás`;

        return timestamp.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    return (
        <div
            className={`p-4 border-b border-gray-800 hover:bg-gray-800/50 cursor-pointer transition-all duration-200 ${!notification.read
                    ? `border-l-4 ${getCategoryColor(notification.category)}`
                    : 'border-l-4 border-l-transparent'
                }`}
            onClick={handleMarkAsRead}
        >
            <div className="flex items-start gap-3">
                {/* Ícone da notificação */}
                <div className={`p-2 rounded-lg border ${getTypeStyles(notification.type)}`}>
                    {getIconForType(notification.type, notification.category)}
                </div>

                {/* Conteúdo da notificação */}
                <div className="flex-1 min-w-0">
                    {/* Cabeçalho com categoria e tempo */}
                    <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-medium text-gray-400 bg-gray-800/50 px-2 py-1 rounded-full">
                                {getCategoryLabel(notification.category)}
                            </span>
                            {!notification.read && (
                                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                            )}
                        </div>
                        <span className="text-xs text-gray-500">
                            {formatTimeAgo(notification.timestamp)}
                        </span>
                    </div>

                    {/* Título e mensagem */}
                    <h4 className="font-semibold text-white text-sm mb-1">
                        {notification.title}
                    </h4>
                    <p className="text-gray-300 text-xs leading-relaxed mb-3">
                        {notification.message}
                    </p>

                    {/* Botão de ação se disponível */}
                    {notification.actionUrl && notification.actionText && (
                        <Link
                            href={notification.actionUrl}
                            className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 text-xs font-medium rounded-lg border border-blue-500/30 transition-all duration-200 hover:scale-105"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {notification.actionText}
                        </Link>
                    )}
                </div>

                {/* Botão de remover */}
                <button
                    onClick={handleRemove}
                    className="p-1 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all duration-200 opacity-0 group-hover:opacity-100"
                    title="Remover notificação"
                >
                    <X className="h-3 w-3" />
                </button>
            </div>
        </div>
    );
};
