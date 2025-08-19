"use client";

import React, { useState, useEffect } from 'react';
import { AudioDiagnostics } from '@/components/audio/AudioDiagnostics';
import { useAudioCompatibility } from '@/hooks/useAudioCompatibility';
import { NativeAudioTester } from '@/components/audio/NativeAudioTester';
import { SafeErrorLogger } from '@/components/debug/SafeErrorLogger';

export default function TestAudioPage() {
    const { checkCompatibility, isChecking, lastResult } = useAudioCompatibility();
    const [databaseTracks, setDatabaseTracks] = useState<any[]>([]);
    const [isLoadingTracks, setIsLoadingTracks] = useState(false);

    // Buscar tracks reais do banco de dados
    const fetchDatabaseTracks = async () => {
        setIsLoadingTracks(true);
        try {
            const response = await fetch('/api/tracks/test-samples');
            const data = await response.json();

            if (data.success) {
                setDatabaseTracks(data.tracks);
                console.log('✅ Tracks do banco carregadas:', data.tracks);
            } else {
                console.error('❌ Erro ao carregar tracks:', data.message);
            }
        } catch (error) {
            console.error('❌ Erro na requisição:', error);
        } finally {
            setIsLoadingTracks(false);
        }
    };

    // Carregar tracks ao montar o componente
    useEffect(() => {
        fetchDatabaseTracks();
    }, []);

    // URLs de teste (fallback se não houver tracks no banco)
    const fallbackUrls = [
        'https://contabostorage.com/your-bucket/test-audio.mp3',
        'https://contabostorage.com/your-bucket/sample.wav',
        'https://contabostorage.com/your-bucket/audio-test.mp3'
    ];

    // Usar tracks do banco se disponíveis, senão usar fallback
    const testUrls = databaseTracks.length > 0
        ? databaseTracks.map(track => track.previewUrl)
        : fallbackUrls;

    return (
        <div className="min-h-screen bg-gray-900 text-white p-4">
            <div className="max-w-6xl mx-auto space-y-8">
                {/* Header */}
                <div className="text-center">
                    <h1 className="text-4xl font-bold text-white mb-4">
                        🔍 Teste de Compatibilidade de Áudio
                    </h1>
                    <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                        Ferramenta para diagnosticar problemas de reprodução de áudio em dispositivos móveis.
                        Teste URLs, verifique formatos e receba recomendações específicas.
                    </p>
                </div>

                {/* URLs de Teste Rápido */}
                <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-2xl font-semibold text-white">
                            🧪 Testes Rápidos
                        </h2>
                        <button
                            onClick={fetchDatabaseTracks}
                            disabled={isLoadingTracks}
                            className="px-3 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white rounded-lg text-sm font-medium"
                        >
                            {isLoadingTracks ? '🔄 Carregando...' : '🔄 Atualizar'}
                        </button>
                    </div>

                    {isLoadingTracks ? (
                        <div className="text-center py-8">
                            <div className="text-gray-400">Carregando tracks do banco...</div>
                        </div>
                    ) : databaseTracks.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {databaseTracks.map((track, index) => (
                                <button
                                    key={track.id}
                                    onClick={() => checkCompatibility(track.previewUrl)}
                                    disabled={isChecking}
                                    className="p-4 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-600 rounded-lg text-left transition-colors"
                                >
                                    <div className="font-medium text-white mb-2">
                                        {track.songName}
                                    </div>
                                    <div className="text-sm text-gray-300 mb-1">
                                        {track.artist}
                                    </div>
                                    <div className="text-xs text-gray-400 mb-2">
                                        {track.style} • {track.bitrate}kbps
                                    </div>
                                    <div className="text-xs text-blue-400">
                                        🎵 Track #{track.id} do banco
                                    </div>
                                </button>
                            ))}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {fallbackUrls.map((url, index) => (
                                <button
                                    key={index}
                                    onClick={() => checkCompatibility(url)}
                                    disabled={isChecking}
                                    className="p-4 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-600 rounded-lg text-left transition-colors"
                                >
                                    <div className="font-medium text-white mb-2">
                                        Teste {index + 1}
                                    </div>
                                    <div className="text-sm text-gray-300 truncate">
                                        {url.split('/').pop()}
                                    </div>
                                    <div className="text-xs text-gray-400 mt-2">
                                        {url.includes('.mp3') ? 'MP3' : url.includes('.wav') ? 'WAV' : 'Desconhecido'}
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Resultado do Teste */}
                {lastResult && (
                    <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
                        <h2 className="text-2xl font-semibold text-white mb-4">
                            📊 Resultado do Teste
                        </h2>

                        {/* Status Geral */}
                        <div className={`p-4 rounded-lg mb-6 ${lastResult.isCompatible
                            ? 'bg-green-900/20 border border-green-500/30'
                            : 'bg-red-900/20 border border-red-500/30'
                            }`}>
                            <div className="flex items-center gap-3">
                                <span className={`text-2xl ${lastResult.isCompatible ? 'text-green-400' : 'text-red-400'}`}>
                                    {lastResult.isCompatible ? '✅' : '❌'}
                                </span>
                                <div>
                                    <h3 className={`font-semibold ${lastResult.isCompatible ? 'text-green-400' : 'text-red-400'}`}>
                                        {lastResult.isCompatible ? 'Arquivo Compatível' : 'Arquivo com Problemas'}
                                    </h3>
                                    <p className="text-sm text-gray-300">
                                        {lastResult.isCompatible
                                            ? 'Este arquivo deve funcionar em dispositivos móveis'
                                            : 'Este arquivo pode ter problemas de compatibilidade'
                                        }
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Informações Técnicas */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                            <div className="bg-gray-700 p-4 rounded-lg">
                                <h4 className="font-medium text-gray-300 mb-3">📁 Informações do Arquivo</h4>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-gray-400">Formato:</span>
                                        <span className={`font-medium ${lastResult.format === 'MP3' ? 'text-green-400' :
                                            lastResult.format === 'AAC' || lastResult.format === 'M4A' ? 'text-yellow-400' :
                                                'text-red-400'
                                            }`}>
                                            {lastResult.format}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-400">Codec:</span>
                                        <span className="text-white">{lastResult.codec}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-400">Content-Type:</span>
                                        <span className={`font-medium ${lastResult.contentType.includes('audio/') ? 'text-green-400' : 'text-red-400'
                                            }`}>
                                            {lastResult.contentType}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-gray-700 p-4 rounded-lg">
                                <h4 className="font-medium text-gray-300 mb-3">📱 Compatibilidade Mobile</h4>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-gray-400">Status:</span>
                                        <span className={`font-medium ${lastResult.isCompatible ? 'text-green-400' : 'text-red-400'
                                            }`}>
                                            {lastResult.isCompatible ? '✅ Funcionando' : '❌ Problemas'}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-400">iOS:</span>
                                        <span className={`font-medium ${lastResult.format === 'MP3' || lastResult.format === 'AAC' ? 'text-green-400' : 'text-yellow-400'
                                            }`}>
                                            {lastResult.format === 'MP3' || lastResult.format === 'AAC' ? '✅ Suportado' : '⚠️ Limitado'}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-400">Android:</span>
                                        <span className={`font-medium ${lastResult.format === 'MP3' ? 'text-green-400' : 'text-yellow-400'
                                            }`}>
                                            {lastResult.format === 'MP3' ? '✅ Suportado' : '⚠️ Limitado'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Recomendações */}
                        {lastResult.recommendations.length > 0 && (
                            <div className="bg-blue-900/20 border border-blue-500/30 p-4 rounded-lg mb-6">
                                <h4 className="font-medium text-blue-300 mb-3">💡 Recomendações</h4>
                                <ul className="space-y-2 text-sm text-blue-200">
                                    {lastResult.recommendations.map((rec, index) => (
                                        <li key={index} className="flex items-start gap-2">
                                            <span className="text-blue-400 mt-0.5">•</span>
                                            <span>{rec}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* Avisos */}
                        {lastResult.warnings.length > 0 && (
                            <div className="bg-yellow-900/20 border border-yellow-500/30 p-4 rounded-lg">
                                <h4 className="font-medium text-yellow-300 mb-3">⚠️ Avisos</h4>
                                <ul className="space-y-2 text-sm text-yellow-200">
                                    {lastResult.warnings.map((warning, index) => (
                                        <li key={index} className="flex items-start gap-2">
                                            <span className="text-yellow-400 mt-0.5">•</span>
                                            <span>{warning}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                )}

                {/* Ferramenta de Diagnóstico Avançado */}
                <AudioDiagnostics />

                {/* Testador de APIs Nativas */}
                <NativeAudioTester />

                {/* Capturador de Erros para Mobile - VERSÃO SEGURA */}
                <SafeErrorLogger />

                {/* Informações sobre Problemas Comuns */}
                <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
                    <h2 className="text-2xl font-semibold text-white mb-4">
                        🚨 Problemas Comuns e Soluções
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <h3 className="text-lg font-medium text-red-400 mb-3">❌ Problemas Frequentes</h3>
                            <ul className="space-y-2 text-sm text-gray-300">
                                <li>• <strong>Autoplay bloqueado:</strong> Navegadores móveis bloqueiam reprodução automática</li>
                                <li>• <strong>Formato não suportado:</strong> FLAC, WAV podem não funcionar em todos os dispositivos</li>
                                <li>• <strong>Content-Type incorreto:</strong> Servidor enviando tipo MIME errado</li>
                                <li>• <strong>Codec incompatível:</strong> Codecs proprietários ou muito novos</li>
                                <li>• <strong>Problemas de rede:</strong> CORS, certificados SSL, etc.</li>
                            </ul>
                        </div>

                        <div>
                            <h3 className="text-lg font-medium text-green-400 mb-3">✅ Soluções Recomendadas</h3>
                            <ul className="space-y-2 text-sm text-gray-300">
                                <li>• <strong>Use MP3:</strong> Formato mais universalmente compatível</li>
                                <li>• <strong>Bitrate 128-320 kbps:</strong> Equilibra qualidade e compatibilidade</li>
                                <li>• <strong>Interação do usuário:</strong> Áudio só toca após toque/clique</li>
                                <li>• <strong>Content-Type correto:</strong> Configure servidor para enviar audio/mpeg</li>
                                <li>• <strong>Teste em múltiplos dispositivos:</strong> iOS, Android, diferentes navegadores</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
