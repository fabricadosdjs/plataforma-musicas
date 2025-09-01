"use client";

import React, { useState, useEffect } from 'react';

interface ConsoleLog {
    type: 'log' | 'warn' | 'error' | 'info';
    message: string;
    timestamp: string;
    stack?: string;
}

export const ConsoleLogger: React.FC = () => {
    const [logs, setLogs] = useState<ConsoleLog[]>([]);
    const [isCapturing, setIsCapturing] = useState(false);
    const [filter, setFilter] = useState<'all' | 'error' | 'warn' | 'log'>('all');

    // Capturar logs do console
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

                const newLog: ConsoleLog = {
                    type,
                    message,
                    timestamp: new Date().toISOString(),
                    stack: new Error().stack
                };

                setLogs(prev => [...prev, newLog]);
            };
        };

        // Sobrescrever métodos do console
        console.log = captureLog('log');
        console.warn = captureLog('warn');
        console.error = captureLog('error');
        console.info = captureLog('info');

        // Cleanup
        return () => {
            console.log = originalConsole.log;
            console.warn = originalConsole.warn;
            console.error = originalConsole.error;
            console.info = originalConsole.info;
        };
    }, [isCapturing]);

    // Filtrar logs
    const filteredLogs = logs.filter(log => {
        if (filter === 'all') return true;
        return log.type === filter;
    });

    // Limpar logs
    const clearLogs = () => {
        setLogs([]);
    };

    // Exportar logs como texto
    const exportLogs = () => {
        const logText = filteredLogs.map(log =>
            `[${log.timestamp}] ${log.type.toUpperCase()}: ${log.message}`
        ).join('\n');

        const blob = new Blob([logText], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `console-logs-${new Date().toISOString().slice(0, 19)}.txt`;
        a.click();
        URL.revokeObjectURL(url);
    };

    // Copiar logs para clipboard
    const copyLogs = async () => {
        const logText = filteredLogs.map(log =>
            `[${log.timestamp}] ${log.type.toUpperCase()}: ${log.message}`
        ).join('\n');

        try {
            await navigator.clipboard.writeText(logText);
            alert('Logs copiados para clipboard!');
        } catch (error) {
            console.error('Erro ao copiar logs:', error);
        }
    };

    // Gerar resumo dos erros
    const generateSummary = () => {
        const errorCount = logs.filter(log => log.type === 'error').length;
        const warnCount = logs.filter(log => log.type === 'warn').length;
        const logCount = logs.filter(log => log.type === 'log').length;

        return `📊 RESUMO DOS LOGS:
• Erros: ${errorCount}
• Avisos: ${warnCount}
• Logs: ${logCount}
• Total: ${logs.length}
• Capturados desde: ${logs[0]?.timestamp || 'Nenhum'}`;
    };

    return (
        <div className="p-6 bg-gray-800 rounded-lg border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-4">
                🔍 Capturador de Logs do Console
            </h3>

            {/* Controles */}
            <div className="flex flex-wrap gap-4 mb-6">
                <button
                    onClick={() => setIsCapturing(!isCapturing)}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${isCapturing
                            ? 'bg-red-600 hover:bg-red-700 text-white'
                            : 'bg-green-600 hover:bg-green-700 text-white'
                        }`}
                >
                    {isCapturing ? '🛑 Parar Captura' : '▶️ Iniciar Captura'}
                </button>

                <select
                    value={filter}
                    onChange={(e) => setFilter(e.target.value as 'all' | 'error' | 'warn' | 'log')}
                    className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                >
                    <option value="all">Todos os Logs</option>
                    <option value="error">Apenas Erros</option>
                    <option value="warn">Apenas Avisos</option>
                    <option value="log">Apenas Logs</option>
                </select>

                <button
                    onClick={clearLogs}
                    className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium"
                >
                    🗑️ Limpar
                </button>

                <button
                    onClick={exportLogs}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium"
                >
                    📥 Exportar TXT
                </button>

                <button
                    onClick={copyLogs}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium"
                >
                    📋 Copiar
                </button>
            </div>

            {/* Resumo */}
            <div className="bg-gray-700 p-4 rounded-lg mb-4">
                <pre className="text-sm text-gray-200 whitespace-pre-wrap">
                    {generateSummary()}
                </pre>
            </div>

            {/* Lista de Logs */}
            <div className="max-h-96 overflow-y-auto bg-gray-900 rounded-lg p-4">
                {filteredLogs.length === 0 ? (
                    <p className="text-gray-400 text-center py-8">
                        {isCapturing ? 'Nenhum log capturado ainda...' : 'Clique em "Iniciar Captura" para começar'}
                    </p>
                ) : (
                    <div className="space-y-2">
                        {filteredLogs.map((log, index) => (
                            <div
                                key={index}
                                className={`p-3 rounded-lg text-sm font-mono ${log.type === 'error' ? 'bg-red-900/20 border border-red-500/30' :
                                        log.type === 'warn' ? 'bg-yellow-900/20 border border-yellow-500/30' :
                                            'bg-gray-700/50 border border-gray-600/30'
                                    }`}
                            >
                                <div className="flex items-start gap-2">
                                    <span className={`text-xs px-2 py-1 rounded ${log.type === 'error' ? 'bg-red-600 text-white' :
                                            log.type === 'warn' ? 'bg-yellow-600 text-black' :
                                                'bg-gray-600 text-white'
                                        }`}>
                                        {log.type.toUpperCase()}
                                    </span>
                                    <span className="text-gray-400 text-xs">
                                        {new Date(log.timestamp).toLocaleTimeString()}
                                    </span>
                                </div>
                                <div className="mt-2 text-gray-200 break-words">
                                    {log.message}
                                </div>
                                {log.stack && (
                                    <details className="mt-2">
                                        <summary className="text-gray-400 text-xs cursor-pointer">
                                            Stack Trace
                                        </summary>
                                        <pre className="text-xs text-gray-500 mt-1 whitespace-pre-wrap">
                                            {log.stack}
                                        </pre>
                                    </details>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Instruções */}
            <div className="mt-6 p-4 bg-blue-900/20 border border-blue-500/30 rounded-lg">
                <h4 className="font-medium text-blue-300 mb-2">📋 Como Usar:</h4>
                <ol className="text-sm text-blue-200 space-y-1 list-decimal list-inside">
                    <li>Clique em "▶️ Iniciar Captura"</li>
                    <li>Recarregue a página ou execute ações que gerem erros</li>
                    <li>Use "📥 Exportar TXT" para baixar todos os logs</li>
                    <li>Ou use "📋 Copiar" para colar aqui na mensagem</li>
                </ol>
            </div>
        </div>
    );
};
