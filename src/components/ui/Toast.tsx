import React, { useEffect, useState } from 'react';
import {
    X,
    CheckCircle,
    AlertCircle,
    Info,
    AlertTriangle,
    Heart,
    Download,
    Play,
    Music,
    Star,
    Zap,
    Shield,
    Clock,
    User
} from 'lucide-react';

interface ToastProps {
    message: string;
    type: 'success' | 'error' | 'info' | 'warning';
    onClose: () => void;
    duration?: number;
}

const Toast: React.FC<ToastProps> = ({ message, type, onClose, duration = 4000 }) => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        setIsVisible(true);
        const timer = setTimeout(() => {
            setIsVisible(false);
            setTimeout(onClose, 300); // Wait for fade out animation
        }, duration);

        return () => clearTimeout(timer);
    }, [duration, onClose]);

    const getIcon = () => {
        // Detectar tipo de ação baseado na mensagem
        const messageLower = message.toLowerCase();

        if (messageLower.includes('curtida') || messageLower.includes('favoritos') || messageLower.includes('like')) {
            return <Heart className="h-5 w-5 text-pink-400" />;
        }

        if (messageLower.includes('baixada') || messageLower.includes('download')) {
            return <Download className="h-5 w-5 text-blue-400" />;
        }

        if (messageLower.includes('tocando') || messageLower.includes('play') || messageLower.includes('ouvir')) {
            return <Play className="h-5 w-5 text-green-400" />;
        }

        if (messageLower.includes('música') || messageLower.includes('track')) {
            return <Music className="h-5 w-5 text-purple-400" />;
        }

        if (messageLower.includes('login') || messageLower.includes('usuário')) {
            return <User className="h-5 w-5 text-orange-400" />;
        }

        if (messageLower.includes('vip') || messageLower.includes('premium')) {
            return <Star className="h-5 w-5 text-yellow-400" />;
        }

        if (messageLower.includes('tempo') || messageLower.includes('aguarde') || messageLower.includes('24h')) {
            return <Clock className="h-5 w-5 text-cyan-400" />;
        }

        if (messageLower.includes('erro') || messageLower.includes('falha')) {
            return <AlertCircle className="h-5 w-5 text-red-400" />;
        }

        if (messageLower.includes('sucesso') || messageLower.includes('concluído')) {
            return <CheckCircle className="h-5 w-5 text-green-400" />;
        }

        if (messageLower.includes('atenção') || messageLower.includes('cuidado')) {
            return <AlertTriangle className="h-5 w-5 text-yellow-400" />;
        }

        if (messageLower.includes('live') || messageLower.includes('tempo real')) {
            return <Zap className="h-5 w-5 text-yellow-400" />;
        }

        if (messageLower.includes('segurança') || messageLower.includes('proteção')) {
            return <Shield className="h-5 w-5 text-blue-400" />;
        }

        // Fallback para tipos padrão
        switch (type) {
            case 'success':
                return <CheckCircle className="h-5 w-5 text-green-400" />;
            case 'error':
                return <AlertCircle className="h-5 w-5 text-red-400" />;
            case 'warning':
                return <AlertTriangle className="h-5 w-5 text-yellow-400" />;
            case 'info':
                return <Info className="h-5 w-5 text-blue-400" />;
            default:
                return <Info className="h-5 w-5 text-blue-400" />;
        }
    };

    const getBgColor = () => {
        // Detectar cor baseada na mensagem
        const messageLower = message.toLowerCase();

        if (messageLower.includes('curtida') || messageLower.includes('favoritos') || messageLower.includes('like')) {
            return 'bg-gradient-to-r from-pink-900/95 to-rose-900/95 border-pink-500/50';
        }

        if (messageLower.includes('baixada') || messageLower.includes('download')) {
            return 'bg-gradient-to-r from-blue-900/95 to-indigo-900/95 border-blue-500/50';
        }

        if (messageLower.includes('tocando') || messageLower.includes('play') || messageLower.includes('ouvir')) {
            return 'bg-gradient-to-r from-green-900/95 to-emerald-900/95 border-green-500/50';
        }

        if (messageLower.includes('música') || messageLower.includes('track')) {
            return 'bg-gradient-to-r from-purple-900/95 to-violet-900/95 border-purple-500/50';
        }

        if (messageLower.includes('login') || messageLower.includes('usuário')) {
            return 'bg-gradient-to-r from-orange-900/95 to-amber-900/95 border-orange-500/50';
        }

        if (messageLower.includes('vip') || messageLower.includes('premium')) {
            return 'bg-gradient-to-r from-yellow-900/95 to-orange-900/95 border-yellow-500/50';
        }

        if (messageLower.includes('tempo') || messageLower.includes('aguarde') || messageLower.includes('24h')) {
            return 'bg-gradient-to-r from-cyan-900/95 to-blue-900/95 border-cyan-500/50';
        }

        if (messageLower.includes('erro') || messageLower.includes('falha')) {
            return 'bg-gradient-to-r from-red-900/95 to-pink-900/95 border-red-500/50';
        }

        if (messageLower.includes('live') || messageLower.includes('tempo real')) {
            return 'bg-gradient-to-r from-yellow-900/95 to-orange-900/95 border-yellow-500/50';
        }

        // Fallback para tipos padrão
        switch (type) {
            case 'success':
                return 'bg-gradient-to-r from-green-900/95 to-emerald-900/95 border-green-500/50';
            case 'error':
                return 'bg-gradient-to-r from-red-900/95 to-pink-900/95 border-red-500/50';
            case 'warning':
                return 'bg-gradient-to-r from-yellow-900/95 to-orange-900/95 border-yellow-500/50';
            case 'info':
                return 'bg-gradient-to-r from-blue-900/95 to-indigo-900/95 border-blue-500/50';
            default:
                return 'bg-gradient-to-r from-blue-900/95 to-indigo-900/95 border-blue-500/50';
        }
    };

    return (
        <div
            className={`w-full transform transition-all duration-500 ease-out ${isVisible ? 'translate-y-0 opacity-100 scale-100' : '-translate-y-full opacity-0 scale-95'
                }`}
            style={{
                position: 'relative',
                zIndex: 9999999,
                pointerEvents: 'auto'
            }}
        >
            <div className={`${getBgColor()} backdrop-blur-xl border rounded-xl p-4 shadow-2xl shadow-black/20 hover:shadow-black/30 transition-all duration-300`}>
                <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 mt-0.5">
                        {getIcon()}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white leading-relaxed">
                            {message}
                        </p>
                    </div>
                    <div className="flex-shrink-0">
                        <button
                            onClick={() => {
                                setIsVisible(false);
                                setTimeout(onClose, 300);
                            }}
                            className="inline-flex text-gray-400 hover:text-white transition-colors duration-200 hover:scale-110"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Toast; 