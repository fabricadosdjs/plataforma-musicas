"use client";

import React, { useState, useEffect, useRef } from 'react';

export const SafeErrorLogger: React.FC = () => {
    const [errors, setErrors] = useState<string[]>([]);
    const [isCapturing, setIsCapturing] = useState(false);
    const isCapturingRef = useRef(false);
    const originalConsoleRef = useRef<{
        log: typeof console.log;
        warn: typeof console.warn;
        error: typeof console.error;
    } | null>(null);

    useEffect(() => {
        isCapturingRef.current = isCapturing;

        if (!isCapturing) {
            // Restaurar console original se não estiver capturando
            if (originalConsoleRef.current) {
                console.log = originalConsoleRef.current.log;
                console.warn = originalConsoleRef.current.warn;
                console.error = originalConsoleRef.current.error;
                originalConsoleRef.current = null;
            }
            return;
        }

        // Salvar console original apenas uma vez
        if (!originalConsoleRef.current) {
            originalConsoleRef.current = {
                log: console.log,
                warn: console.warn,
                error: console.error
            };
        }

        const createSafeHandler = (type: 'log' | 'warn' | 'error', originalFn: Function) => {
            return (...args: any[]) => {
                // Sempre chamar o console original primeiro
                originalFn.apply(console, args);

                // Verificar se ainda estamos capturando (pode ter mudado)
                if (!isCapturingRef.current) return;

                try {
                    const message = args.map(arg => {
                        if (typeof arg === 'object') {
                            try {
                                return JSON.stringify(arg, null, 2);
                            } catch {
                                return '[Objeto Complexo]';
                            }
                        }
                        return String(arg);
                    }).join(' ');

                    // Filtrar mensagens do próprio logger para evitar loops
                    if (message.includes('SafeErrorLogger') ||
                        message.includes('SimpleErrorLogger') ||
                        message.includes('error-logger') ||
                        message.includes('captureError')) {
                        return;
                    }

                    const timestamp = new Date().toLocaleTimeString();
                    const logEntry = `[${timestamp}] ${type.toUpperCase()}: ${message}`;

                    // Usar requestAnimationFrame para evitar problemas de renderização
                    requestAnimationFrame(() => {
                        if (isCapturingRef.current) {
                            setErrors(prev => {
                                const newErrors = [...prev, logEntry];
                                return newErrors.slice(-50); // Manter apenas últimos 50
                            });
                        }
                    });
                } catch (error) {
                    // Ignorar erros do próprio capturador
                }
            };
        };

        // Substituir funções do console
        console.log = createSafeHandler('log', originalConsoleRef.current.log);
        console.warn = createSafeHandler('warn', originalConsoleRef.current.warn);
        console.error = createSafeHandler('error', originalConsoleRef.current.error);

        // Cleanup
        return () => {
            if (originalConsoleRef.current) {
                console.log = originalConsoleRef.current.log;
                console.warn = originalConsoleRef.current.warn;
                console.error = originalConsoleRef.current.error;
            }
        };
    }, [isCapturing]);

    const copyErrors = async () => {
        const allErrors = errors.join('\n');
        try {
            await navigator.clipboard.writeText(allErrors);
            alert('✅ Erros copiados! Cole na mensagem.');
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

    const clearErrors = () => {
        setErrors([]);
    };

    return (
        <div className="p-4 bg-red-900/20 border border-red-500/30 rounded-lg">
            <h3 className="text-lg font-semibold text-red-300 mb-4">
                🚨 Capturador de Erros - MOBILE (Seguro)
            </h3>

            <div className="flex gap-2 mb-4 flex-wrap">
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
                    disabled={errors.length === 0}
                >
                    📋 Copiar ({errors.length})
                </button>

                <button
                    onClick={sendWhatsApp}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium"
                    disabled={errors.length === 0}
                >
                    📱 WhatsApp
                </button>

                <button
                    onClick={clearErrors}
                    className="px-4 py-2 bg-gray-600 text-white rounded-lg font-medium"
                    disabled={errors.length === 0}
                >
                    🗑️ Limpar
                </button>
            </div>

            <div className="max-h-32 overflow-y-auto bg-gray-900 rounded p-2 text-xs">
                {errors.length === 0 ? (
                    <p className="text-gray-400 text-center py-4">
                        {isCapturing ? 'Capturando erros... (sem erros ainda)' : 'Clique em Iniciar para capturar erros'}
                    </p>
                ) : (
                    <div className="space-y-1">
                        {errors.slice(-20).map((error, i) => (
                            <div key={i} className="text-gray-200 break-words border-l-2 border-red-500 pl-2">
                                {error}
                            </div>
                        ))}
                        {errors.length > 20 && (
                            <div className="text-gray-400 text-center py-2">
                                ... e mais {errors.length - 20} erros (use Copiar para ver todos)
                            </div>
                        )}
                    </div>
                )}
            </div>

            <div className="mt-3 text-xs text-blue-300">
                <p><strong>Instruções:</strong></p>
                <p>1. Clique em &quot;▶️ Iniciar&quot; para começar a capturar</p>
                <p>2. Recarregue a página para capturar erros de carregamento</p>
                <p>3. Use &quot;📋 Copiar&quot; ou &quot;📱 WhatsApp&quot; para enviar os erros</p>
                <p>4. Clique em &quot;🛑 Parar&quot; quando terminar</p>
            </div>
        </div>
    );
};
