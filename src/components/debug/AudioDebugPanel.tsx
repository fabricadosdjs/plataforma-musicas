"use client";

import React, { useState } from 'react';
import { Track } from '@/types/track';

interface AudioDebugPanelProps {
    track?: Track;
    className?: string;
}

export default function AudioDebugPanel({ track, className = '' }: AudioDebugPanelProps) {
    const [isTesting, setIsTesting] = useState(false);
    const [testResults, setTestResults] = useState<string[]>([]);

    const testAudioSource = async (url: string, label: string) => {
        setIsTesting(true);
        setTestResults(prev => [...prev, `🔍 Testando ${label}...`]);

        try {
            const response = await fetch(url, { method: 'HEAD' });
            if (response.ok) {
                const contentType = response.headers.get('content-type');
                const contentLength = response.headers.get('content-length');

                setTestResults(prev => [
                    ...prev,
                    `✅ ${label}: OK`,
                    `   Tipo: ${contentType || 'N/A'}`,
                    `   Tamanho: ${contentLength ? `${Math.round(parseInt(contentLength) / 1024 / 1024 * 100) / 100} MB` : 'N/A'}`
                ]);
            } else {
                setTestResults(prev => [...prev, `❌ ${label}: HTTP ${response.status}`]);
            }
        } catch (error) {
            setTestResults(prev => [...prev, `❌ ${label}: ${error instanceof Error ? error.message : 'Erro desconhecido'}`]);
        }
    };

    const runFullTest = async () => {
        if (!track) {
            setTestResults(['❌ Nenhuma música selecionada para teste']);
            return;
        }

        setTestResults(['🚀 Iniciando teste completo de áudio...']);

        // Testar diferentes fontes de áudio
        if (track.audioUrl) {
            await testAudioSource(track.audioUrl, 'URL Principal');
        }

        if (track.previewUrl) {
            await testAudioSource(track.previewUrl, 'URL Preview');
        }

        // Testar metadados
        setTestResults(prev => [
            ...prev,
            `📊 Metadados:`,
            `   Nome: ${track.songName || 'N/A'}`,
            `   Artista: ${track.artist || 'N/A'}`,
            `   Estilo: ${track.style || 'N/A'}`,
            `   Pool: ${track.pool || 'N/A'}`,
            `   Bitrate: ${track.bitrate || '320'} kbps`
        ]);

        setIsTesting(false);
        setTestResults(prev => [...prev, '✨ Teste concluído!']);
    };

    const clearResults = () => {
        setTestResults([]);
    };

    return (
        <div className={`p-4 rounded-lg ${className}`}>
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">🔊 Debug de Áudio</h3>
                <div className="flex gap-2">
                    <button
                        onClick={runFullTest}
                        disabled={isTesting || !track}
                        className="px-3 py-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white text-sm rounded transition-colors"
                    >
                        {isTesting ? 'Testando...' : 'Testar Tudo'}
                    </button>
                    <button
                        onClick={clearResults}
                        className="px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white text-sm rounded transition-colors"
                    >
                        Limpar
                    </button>
                </div>
            </div>

            {track ? (
                <div className="mb-4 p-3 bg-gray-700/50 rounded">
                    <p className="text-sm text-gray-300">
                        <strong>Música:</strong> {track.songName} - {track.artist}
                    </p>
                </div>
            ) : (
                <div className="mb-4 p-3 bg-yellow-900/50 rounded">
                    <p className="text-sm text-yellow-300">
                        Nenhuma música selecionada para teste
                    </p>
                </div>
            )}

            <div className="bg-black/50 rounded p-3 max-h-64 overflow-y-auto">
                {testResults.length === 0 ? (
                    <p className="text-gray-400 text-sm">Clique em &quot;Testar Tudo&quot; para verificar as fontes de áudio</p>
                ) : (
                    <div className="space-y-1">
                        {testResults.map((result, index) => (
                            <div key={index} className="text-xs font-mono text-gray-300">
                                {result}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
