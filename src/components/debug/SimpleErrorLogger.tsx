"use client";

import React, { useState, useEffect } from 'react';

export const SimpleErrorLogger: React.FC = () => {
    const [errors, setErrors] = useState<string[]>([]);
    const [isCapturing, setIsCapturing] = useState(false);

    useEffect(() => {
        if (!isCapturing) return;

        const originalConsole = {
            log: console.log,
            warn: console.warn,
            error: console.error
        };

        const captureError = (type: string) => (...args: any[]) => {
            // Aplicar console original primeiro
            originalConsole[type as keyof typeof originalConsole].apply(console, args);

            // Evitar loops infinitos - não capturar erros do próprio capturador
            const message = args.map(arg =>
                typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
            ).join(' ');

            if (message.includes('SimpleErrorLogger') || message.includes('captureError')) {
                return; // Ignorar erros do próprio componente
            }

            const timestamp = new Date().toLocaleTimeString();
            const logEntry = `[${timestamp}] ${type.toUpperCase()}: ${message}`;

            // Usar setTimeout para evitar setState durante renderização
            setTimeout(() => {
                setErrors(prev => [...prev.slice(-19), logEntry]); // Manter apenas últimos 20
            }, 0);
        };

        console.log = captureError('log');
        console.warn = captureError('warn');
        console.error = captureError('error');

        return () => {
            console.log = originalConsole.log;
            console.warn = originalConsole.warn;
            console.error = originalConsole.error;
        };
    }, [isCapturing]);

    const copyErrors = async () => {
        const allErrors = errors.join('\n');
        try {
            await navigator.clipboard.writeText(allErrors);
            alert('✅ Erros copiados! Cole aqui na mensagem.');
        } catch {
            alert('❌ Erro ao copiar. Use o botão WhatsApp.');
        }
    };

    const sendWhatsApp = () => {
        const allErrors = errors.join('\n');
        const encoded = encodeURIComponent(allErrors);
        const url = `https://wa.me/?text=${encoded}`;
        window.open(url, '_blank');
    };

    return (
        <div className="p-4 bg-red-900/20 border border-red-500/30 rounded-lg">
            <h3 className="text-lg font-semibold text-red-300 mb-4">
                🚨 Capturador de Erros - MOBILE
            </h3>

            <div className="flex gap-2 mb-4">
                <button
                    onClick={() => setIsCapturing(!isCapturing)}
                    className={`px-4 py-2 rounded-lg font-medium ${isCapturing ? 'bg-red-600 text-white' : 'bg-green-600 text-white'
                        }`}
                >
                    {isCapturing ? '🛑 Parar' : '▶️ Iniciar'}
                </button>

                <button
                    onClick={copyErrors}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium"
                >
                    📋 Copiar ({errors.length})
                </button>

                <button
                    onClick={sendWhatsApp}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium"
                >
                    📱 WhatsApp
                </button>
            </div>

            <div className="max-h-32 overflow-y-auto bg-gray-900 rounded p-2 text-xs">
                {errors.length === 0 ? (
                    <p className="text-gray-400 text-center py-4">
                        {isCapturing ? 'Capturando erros...' : 'Clique em Iniciar'}
                    </p>
                ) : (
                    <div className="space-y-1">
                        {errors.slice(-20).map((error, i) => (
                            <div key={i} className="text-gray-200 break-words">
                                {error}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="mt-3 text-xs text-blue-300">
                <p>1. Clique em "▶️ Iniciar"</p>
                <p>2. Recarregue a página</p>
                <p>3. Use "📋 Copiar" ou "📱 WhatsApp"</p>
            </div>
        </div>
    );
};
