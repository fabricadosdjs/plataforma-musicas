// src/components/ui/Alert.tsx
"use client";

import { Crown, Info, Loader2, Shield, X } from 'lucide-react'; // Certifique-se de que todos os ícones usados estão importados
import { memo, useEffect, useState } from 'react';

interface AlertProps {
    message: string;
    onClose: () => void;
    type?: 'default' | 'success' | 'info' | 'warning' | 'error' | 'vip' | 'access-check';
}

const Alert = memo(function Alert({ message, onClose, type = 'default' }: AlertProps) {
    const [progress, setProgress] = useState(100);
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        if (!message) return;

        const duration = type === 'vip' || type === 'access-check' ? 15000 : 5000; // 15s para VIP, 5s para normal
        const interval = 100; // Atualizar a cada 100ms
        const steps = duration / interval;
        const progressStep = 100 / steps;

        let currentStep = 0;
        const timer = setInterval(() => {
            currentStep++;
            const newProgress = Math.max(0, 100 - (progressStep * currentStep));
            setProgress(newProgress);

            if (currentStep >= steps) {
                clearInterval(timer);
                setIsVisible(false);
                setTimeout(onClose, 300); // Delay para animação de saída
            }
        }, interval);

        return () => clearInterval(timer);
    }, [message, onClose, type]);

    if (!message || !isVisible) return null;

    const getAlertConfig = () => {
        switch (type) {
            case 'vip':
                return {
                    bgClass: 'bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600',
                    icon: <Crown className="w-6 h-6" />,
                    borderClass: 'border-purple-400/30',
                    progressClass: 'bg-gradient-to-r from-yellow-400 to-orange-400'
                };
            case 'access-check':
                return {
                    bgClass: 'bg-gradient-to-r from-emerald-600 via-green-600 to-teal-600',
                    icon: <Shield className="w-6 h-6" />,
                    borderClass: 'border-emerald-400/30',
                    progressClass: 'bg-gradient-to-r from-green-300 to-emerald-300'
                };
            default:
                return {
                    bgClass: 'bg-blue-600',
                    icon: <Info className="w-6 h-6" />,
                    borderClass: 'border-blue-400/30',
                    progressClass: 'bg-blue-300'
                };
        }
    };

    const config = getAlertConfig();

    return (
        <div className={`fixed top-24 right-6 ${config.bgClass} text-white rounded-xl shadow-2xl border ${config.borderClass} z-50 animate-fade-in-down max-w-sm`}>
            {/* Barra de progresso */}
            <div className="absolute top-0 left-0 h-1 bg-white/20 rounded-t-xl w-full overflow-hidden">
                <div
                    className={`h-full ${config.progressClass} transition-all duration-100 ease-linear`}
                    style={{ width: `${progress}%` }}
                />
            </div>

            {/* Conteúdo principal */}
            <div className="p-5">
                <div className="flex items-start gap-4">
                    {/* Ícone animado */}
                    <div className="flex-shrink-0 animate-pulse">
                        {type === 'access-check' ? (
                            <div className="relative">
                                <Loader2 className="w-6 h-6 animate-spin" />
                                <Shield className="w-4 h-4 absolute top-1 left-1" />
                            </div>
                        ) : (
                            config.icon
                        )}
                    </div>

                    {/* Conteúdo */}
                    <div className="flex-1 min-w-0">
                        {type === 'vip' && (
                            <div className="flex items-center gap-2 mb-1">
                                <span className="text-yellow-300 text-xs font-bold tracking-wider">
                                    ✨ VIP ACCESS
                                </span>
                                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                            </div>
                        )}

                        {type === 'access-check' && (
                            <div className="flex items-center gap-2 mb-1">
                                <span className="text-green-300 text-xs font-bold tracking-wider">
                                    🔐 VERIFICANDO PERFIL
                                </span>
                                <div className="flex gap-1">
                                    <div className="w-1 h-1 bg-white rounded-full animate-pulse" style={{ animationDelay: '0ms' }} />
                                    <div className="w-1 h-1 bg-white rounded-full animate-pulse" style={{ animationDelay: '200ms' }} />
                                    <div className="w-1 h-1 bg-white rounded-full animate-pulse" style={{ animationDelay: '400ms' }} />
                                </div>
                            </div>
                        )}

                        <p className="text-sm font-medium leading-relaxed">
                            {message}
                        </p>

                        {type === 'access-check' && (
                            <div className="mt-2 text-xs text-white/80">
                                Validando permissões e benefícios...
                            </div>
                        )}
                    </div>

                    {/* Botão fechar */}
                    <button
                        onClick={() => {
                            setIsVisible(false);
                            setTimeout(onClose, 300);
                        }}
                        className="flex-shrink-0 p-1 rounded-full hover:bg-white/20 transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Efeito de brilho */}
            <div className="absolute inset-0 rounded-xl opacity-30 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />
        </div>
    );
});

export default Alert;