"use client";

import React, { useState, useEffect } from 'react';

interface ErrorLog {
    type: 'error' | 'warn' | 'log' | 'info';
    message: string;
    timestamp: string;
    url?: string;
    line?: number;
    column?: number;
    stack?: string;
    userAgent?: string;
    platform?: string;
}

export const MobileErrorLogger: React.FC = () => {
    const [errors, setErrors] = useState<ErrorLog[]>([]);
    const [isCapturing, setIsCapturing] = useState(false);
    const [filter, setFilter] = useState<'all' | 'error' | 'warn' | 'log'>('all');
    const [deviceInfo, setDeviceInfo] = useState<Record<string, unknown>>({});

    // Detectar informações do dispositivo
    useEffect(() => {
        const info = {
            userAgent: navigator.userAgent,
            platform: navigator.platform,
            language: navigator.language,
            cookieEnabled: navigator.cookieEnabled,
            onLine: navigator.onLine,
            screen: {
                width: screen.width,
                height: screen.height,
                availWidth: screen.availWidth,
                availHeight: screen.availHeight
            },
            window: {
                innerWidth: window.innerWidth,
                innerHeight: window.innerHeight,
                outerWidth: window.outerWidth,
                outerHeight: window.outerHeight
            },
            location: {
                href: window.location.href,
                origin: window.location.origin,
                pathname: window.location.pathname
            }
        };
        setDeviceInfo(info);
    }, []);

    // Capturar erros do console
    useEffect(() => {
        if (!isCapturing) return;

        const originalConsole = {
            log: console.log,
            warn: console.warn,
            error: console.error,
            info: console.info
        };

        const captureLog = (type: 'log' | 'warn' | 'error' | 'info') => {
            return (...args: unknown[]) => {
                // Chamar console original
                originalConsole[type].apply(console, args);

                // Capturar para nosso estado
                const message = args.map(arg => {
                    if (typeof arg === 'object') {
                        try {
                            return JSON.stringify(arg, null, 2);
                        } catch {
                            return String(arg);
                        }
                    }
                    return String(arg);
                }).join(' ');

                const newLog: ErrorLog = {
                    type,
                    message,
                    timestamp: new Date().toISOString(),
                    userAgent: navigator.userAgent,
                    platform: navigator.platform
                };

                setErrors(prev => [...prev, newLog]);
            };
        };

        // Sobrescrever métodos do console
        console.log = captureLog('log');
        console.warn = captureLog('warn');
        console.error = captureLog('error');
        console.info = captureLog('info');

        // Capturar erros globais
        const handleGlobalError = (event: ErrorEvent) => {
            const errorLog: ErrorLog = {
                type: 'error',
                message: `${event.message} (${event.filename}:${event.lineno}:${event.colno})`,
                timestamp: new Date().toISOString(),
                url: event.filename,
                line: event.lineno,
                column: event.colno,
                stack: event.error?.stack,
                userAgent: navigator.userAgent,
                platform: navigator.platform
            };
            setErrors(prev => [...prev, errorLog]);
        };

        const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
            const errorLog: ErrorLog = {
                type: 'error',
                message: `Unhandled Promise Rejection: ${event.reason}`,
                timestamp: new Date().toISOString(),
                userAgent: navigator.userAgent,
                platform: navigator.platform
            };
            setErrors(prev => [...prev, errorLog]);
        };

        window.addEventListener('error', handleGlobalError);
        window.addEventListener('unhandledrejection', handleUnhandledRejection);

        // Cleanup
        return () => {
            console.log = originalConsole.log;
            console.warn = originalConsole.warn;
            console.error = originalConsole.error;
            console.info = originalConsole.info;
            window.removeEventListener('error', handleGlobalError);
            window.removeEventListener('unhandledrejection', handleUnhandledRejection);
        };
    }, [isCapturing]);

    // Filtrar erros
    const filteredErrors = errors.filter(error => {
        if (filter === 'all') return true;
        return error.type === filter;
    });

    // Limpar erros
    const clearErrors = () => {
        setErrors([]);
    };

    // Gerar relatório completo
    const generateFullReport = () => {

        const screen = deviceInfo.screen as { width?: number; height?: number } | undefined;
        const win = deviceInfo.window as { innerWidth?: number; innerHeight?: number } | undefined;
        const location = deviceInfo.location as { href?: string } | undefined;

        const report = `🚨 RELATÓRIO COMPLETO DE ERROS - MOBILE

📱 INFORMAÇÕES DO DISPOSITIVO:
• User Agent: ${deviceInfo.userAgent || 'N/A'}
• Platform: ${deviceInfo.platform || 'N/A'}
• Language: ${deviceInfo.language || 'N/A'}
• Screen: ${screen?.width || 'N/A'}x${screen?.height || 'N/A'}
• Window: ${win?.innerWidth || 'N/A'}x${win?.innerHeight || 'N/A'}
• URL: ${location?.href || 'N/A'}

📊 ESTATÍSTICAS DOS ERROS:
• Total de Logs: ${errors.length}
• Erros: ${errors.filter(e => e.type === 'error').length}
• Avisos: ${errors.filter(e => e.type === 'warn').length}
• Logs: ${errors.filter(e => e.type === 'log').length}
• Info: ${errors.filter(e => e.type === 'info').length}

🔍 LOGS CAPTURADOS:
${filteredErrors.map((error, index) =>
            `[${index + 1}] [${error.timestamp}] ${error.type.toUpperCase()}: ${error.message}`
        ).join('\n')}

📅 Gerado em: ${new Date().toLocaleString('pt-BR')}`;

        return report;
    };

    // Copiar relatório para clipboard
    const copyReport = async () => {
        const report = generateFullReport();
        try {
            await navigator.clipboard.writeText(report);
            alert('✅ Relatório copiado para clipboard! Cole aqui na mensagem.');
        } catch (error) {
            console.error('Erro ao copiar relatório:', error);
            alert('❌ Erro ao copiar. Use o botão "📱 Enviar via WhatsApp"');
        }
    };

    // Enviar via WhatsApp (mobile)
    const sendViaWhatsApp = () => {
        const report = generateFullReport();
        const encodedReport = encodeURIComponent(report);
        const whatsappUrl = `https://wa.me/?text=${encodedReport}`;
        window.open(whatsappUrl, '_blank');
    };

    // Enviar via email
    const sendViaEmail = () => {
        const report = generateFullReport();
        const subject = encodeURIComponent('🚨 Relatório de Erros - Mobile');
        const body = encodeURIComponent(report);
        const mailtoUrl = `mailto:?subject=${subject}&body=${body}`;
        window.open(mailtoUrl);
    };

    // Download como arquivo
    const downloadReport = () => {
        const report = generateFullReport();
        const blob = new Blob([report], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `erros-mobile-${new Date().toISOString().slice(0, 19)}.txt`;
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="p-4 bg-red-900/20 border border-red-500/30 rounded-lg">
            <h3 className="text-lg font-semibold text-red-300 mb-4">
                🚨 Capturador de Erros - MOBILE
            </h3>

            {/* Status */}
            <div className="mb-4 p-3 bg-gray-800 rounded-lg">
                <div className="flex items-center justify-between">
                    <div>
                        <span className="text-sm text-gray-300">Status:</span>
                        <span className={`ml-2 px-2 py-1 rounded text-xs font-medium ${isCapturing ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
                            }`}>
                            {isCapturing ? '🟢 Capturando' : '🔴 Parado'}
                        </span>
                    </div>
                    <div className="text-sm text-gray-300">
                        <span>Total: </span>
                        <span className="font-bold text-red-400">{errors.length}</span>
                    </div>
                </div>
            </div>

            {/* Controles */}
            <div className="flex flex-wrap gap-2 mb-4">
                <button
                    onClick={() => setIsCapturing(!isCapturing)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium ${isCapturing
                        ? 'bg-red-600 hover:bg-red-700 text-white'
                        : 'bg-green-600 hover:bg-green-700 text-white'
                        }`}
                >
                    {isCapturing ? '🛑 Parar' : '▶️ Iniciar'}
                </button>

                <select
                    value={filter}
                    onChange={(e) => setFilter(e.target.value as 'all' | 'error' | 'warn' | 'log')}
                    className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm"
                >
                    <option value="all">Todos ({errors.length})</option>
                    <option value="error">Erros ({errors.filter(e => e.type === 'error').length})</option>
                    <option value="warn">Avisos ({errors.filter(e => e.type === 'warn').length})</option>
                    <option value="log">Logs ({errors.filter(e => e.type === 'log').length})</option>
                </select>

                <button
                    onClick={clearErrors}
                    className="px-3 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg text-sm font-medium"
                >
                    🗑️ Limpar
                </button>
            </div>

            {/* Ações de Envio */}
            <div className="flex flex-wrap gap-2 mb-4">
                <button
                    onClick={copyReport}
                    className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium"
                >
                    📋 Copiar
                </button>

                <button
                    onClick={sendViaWhatsApp}
                    className="px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium"
                >
                    📱 WhatsApp
                </button>

                <button
                    onClick={sendViaEmail}
                    className="px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium"
                >
                    📧 Email
                </button>

                <button
                    onClick={downloadReport}
                    className="px-3 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg text-sm font-medium"
                >
                    📥 Download
                </button>
            </div>

            {/* Lista de Erros */}
            <div className="max-h-64 overflow-y-auto bg-gray-900 rounded-lg p-3">
                {filteredErrors.length === 0 ? (
                    <p className="text-gray-400 text-center py-8 text-sm">
                        {isCapturing ? 'Nenhum erro capturado ainda...' : 'Clique em "Iniciar" para capturar erros'}
                    </p>
                ) : (
                    <div className="space-y-2">
                        {filteredErrors.slice(-50).map((error, index) => (
                            <div
                                key={index}
                                className={`p-2 rounded text-xs font-mono ${error.type === 'error' ? 'bg-red-900/20 border border-red-500/30' :
                                    error.type === 'warn' ? 'bg-yellow-900/20 border border-yellow-500/30' :
                                        'bg-gray-700/50 border border-gray-600/30'
                                    }`}
                            >
                                <div className="flex items-start gap-2">
                                    <span className={`px-1 py-0.5 rounded text-xs ${error.type === 'error' ? 'bg-red-600 text-white' :
                                        error.type === 'warn' ? 'bg-yellow-600 text-black' :
                                            'bg-gray-600 text-white'
                                        }`}>
                                        {error.type.toUpperCase()}
                                    </span>
                                    <span className="text-gray-400 text-xs">
                                        {new Date(error.timestamp).toLocaleTimeString()}
                                    </span>
                                </div>
                                <div className="mt-1 text-gray-200 break-words">
                                    {error.message.length > 100
                                        ? error.message.substring(0, 100) + '...'
                                        : error.message
                                    }
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Instruções */}
            <div className="mt-4 p-3 bg-blue-900/20 border border-blue-500/30 rounded-lg">
                <h4 className="font-medium text-blue-300 mb-2 text-sm">📋 Como Enviar os Erros:</h4>
                <div className="text-xs text-blue-200 space-y-1">
                    <p>1. <strong>Clique em "▶️ Iniciar"</strong> para capturar</p>
                    <p>2. <strong>Recarregue a página</strong> ou execute ações</p>
                    <p>3. <strong>Use "📋 Copiar"</strong> e cole aqui na mensagem</p>
                    <p>4. <strong>Ou use "📱 WhatsApp"</strong> para enviar direto</p>
                </div>
            </div>
        </div>
    );
};
