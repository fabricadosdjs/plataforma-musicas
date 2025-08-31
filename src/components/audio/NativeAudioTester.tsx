"use client";

import React, { useState, useEffect } from 'react';
import { useNativeAudio } from '@/hooks/useNativeAudio';
import type { Track } from '@/types/track';

export const NativeAudioTester: React.FC = () => {
    const { capabilities, playWithWebAudio, playWithMediaSession, requestMicrophoneAccess, isSupported } = useNativeAudio();
    const [testResults, setTestResults] = useState<{ [key: string]: boolean | string }>({});
    const [isTesting, setIsTesting] = useState(false);
    const [databaseTracks, setDatabaseTracks] = useState<Track[]>([]);
    const [selectedTrack, setSelectedTrack] = useState<Track | null>(null);

    // Buscar tracks do banco para testes
    useEffect(() => {
        const fetchTracks = async () => {
            try {
                const response = await fetch('/api/tracks/test-samples');
                const data = await response.json();
                if (data.success && data.tracks.length > 0) {
                    setDatabaseTracks(data.tracks);
                    setSelectedTrack(data.tracks[0]); // Selecionar primeira track
                }
            } catch (error) {
                console.error('Erro ao carregar tracks:', error);
            }
        };
        fetchTracks();
    }, []);

    // URL de teste (track do banco ou fallback)
    const testAudioUrl = selectedTrack?.previewUrl || 'https://contabostorage.com/your-bucket/test-audio.mp3';
    const testMetadata = {
        title: selectedTrack?.songName || 'Teste de Áudio',
        artist: selectedTrack?.artist || 'Sistema de Teste',
        album: selectedTrack?.style || 'Testes de Compatibilidade'
    };

    // Testar Web Audio API
    const testWebAudioAPI = async () => {
        setTestResults(prev => ({ ...prev, webAudio: 'testando...' }));

        try {
            const success = await playWithWebAudio(testAudioUrl);
            setTestResults(prev => ({ ...prev, webAudio: success }));

            if (success) {
                console.log('✅ Web Audio API funcionando');
            } else {
                console.log('❌ Web Audio API falhou');
            }
        } catch (error) {
            setTestResults(prev => ({ ...prev, webAudio: `erro: ${error}` }));
            console.error('Erro no teste Web Audio API:', error);
        }
    };

    // Testar Media Session API
    const testMediaSessionAPI = async () => {
        setTestResults(prev => ({ ...prev, mediaSession: 'testando...' }));

        try {
            const success = await playWithMediaSession(testAudioUrl, testMetadata);
            setTestResults(prev => ({ ...prev, mediaSession: success }));

            if (success) {
                console.log('✅ Media Session API funcionando');
            } else {
                console.log('❌ Media Session API falhou');
            }
        } catch (error) {
            setTestResults(prev => ({ ...prev, mediaSession: `erro: ${error}` }));
            console.error('Erro no teste Media Session API:', error);
        }
    };

    // Testar acesso ao microfone
    const testMicrophoneAccess = async () => {
        setTestResults(prev => ({ ...prev, microphone: 'testando...' }));

        try {
            const stream = await requestMicrophoneAccess();
            const success = !!stream;
            setTestResults(prev => ({ ...prev, microphone: success }));

            if (success) {
                console.log('✅ Acesso ao microfone concedido');
                // Parar o stream
                stream?.getTracks().forEach(track => track.stop());
            } else {
                console.log('❌ Acesso ao microfone negado');
            }
        } catch (error) {
            setTestResults(prev => ({ ...prev, microphone: `erro: ${error}` }));
            console.error('Erro no teste de microfone:', error);
        }
    };

    // Testar todas as APIs
    const testAllAPIs = async () => {
        setIsTesting(true);
        setTestResults({});

        // Testar em sequência
        await testWebAudioAPI();
        await new Promise(resolve => setTimeout(resolve, 1000));

        await testMediaSessionAPI();
        await new Promise(resolve => setTimeout(resolve, 1000));

        await testMicrophoneAccess();

        setIsTesting(false);
    };

    // Gerar relatório de compatibilidade
    const generateCompatibilityReport = () => {
        const report = `📱 RELATÓRIO DE COMPATIBILIDADE DE ÁUDIO

🔍 CAPACIDADES DETECTADAS:
• Web Audio API: ${capabilities.hasWebAudioAPI ? '✅ Disponível' : '❌ Não disponível'}
• Media Session API: ${capabilities.hasMediaSessionAPI ? '✅ Disponível' : '❌ Não disponível'}
• Audio Context: ${capabilities.hasAudioContext ? '✅ Disponível' : '❌ Não disponível'}
• Get User Media: ${capabilities.hasGetUserMedia ? '✅ Disponível' : '❌ Não disponível'}
• Audio Worklet: ${capabilities.hasAudioWorklet ? '✅ Disponível' : '❌ Não disponível'}
• Shared Array Buffer: ${capabilities.hasSharedArrayBuffer ? '✅ Disponível' : '❌ Não disponível'}

🧪 RESULTADOS DOS TESTES:
• Web Audio API: ${testResults.webAudio || 'Não testado'}
• Media Session API: ${testResults.mediaSession || 'Não testado'}
• Microfone: ${testResults.microphone || 'Não testado'}

📊 STATUS GERAL:
• APIs Nativas Suportadas: ${isSupported ? '✅ Sim' : '❌ Não'}
• Recomendação: ${getRecommendation()}`;

        return report;
    };

    // Gerar recomendação baseada nos resultados
    const getRecommendation = () => {
        if (capabilities.hasWebAudioAPI && testResults.webAudio === true) {
            return 'Use Web Audio API para melhor compatibilidade em mobile';
        } else if (capabilities.hasMediaSessionAPI && testResults.mediaSession === true) {
            return 'Use Media Session API com HTML5 Audio como fallback';
        } else if (capabilities.hasGetUserMedia && testResults.microphone === true) {
            return 'Solicite acesso ao microfone para ativar áudio';
        } else {
            return 'Use HTML5 Audio padrão com interação do usuário obrigatória';
        }
    };

    // Copiar relatório
    const copyReport = async () => {
        const report = generateCompatibilityReport();
        try {
            await navigator.clipboard.writeText(report);
            alert('Relatório copiado para clipboard!');
        } catch (error) {
            console.error('Erro ao copiar relatório:', error);
        }
    };

    return (
        <div className="p-6 bg-gray-800 rounded-lg border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-4">
                🔧 Testador de APIs Nativas de Áudio
            </h3>

            {/* Status das Capacidades */}
            <div className="mb-6">
                <h4 className="font-medium text-gray-300 mb-3">🔍 Capacidades Detectadas</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    <div className={`p-3 rounded-lg text-sm ${capabilities.hasWebAudioAPI ? 'bg-green-900/20 border border-green-500/30' : 'bg-red-900/20 border border-red-500/30'}`}>
                        <div className="font-medium text-gray-300">Web Audio API</div>
                        <div className={capabilities.hasWebAudioAPI ? 'text-green-400' : 'text-red-400'}>
                            {capabilities.hasWebAudioAPI ? '✅ Disponível' : '❌ Não disponível'}
                        </div>
                    </div>

                    <div className={`p-3 rounded-lg text-sm ${capabilities.hasMediaSessionAPI ? 'bg-green-900/20 border border-green-500/30' : 'bg-red-900/20 border border-red-500/30'}`}>
                        <div className="font-medium text-gray-300">Media Session API</div>
                        <div className={capabilities.hasMediaSessionAPI ? 'text-green-400' : 'text-red-400'}>
                            {capabilities.hasMediaSessionAPI ? '✅ Disponível' : '❌ Não disponível'}
                        </div>
                    </div>

                    <div className={`p-3 rounded-lg text-sm ${capabilities.hasAudioContext ? 'bg-green-900/20 border border-green-500/30' : 'bg-red-900/20 border border-red-500/30'}`}>
                        <div className="font-medium text-gray-300">Audio Context</div>
                        <div className={capabilities.hasAudioContext ? 'text-green-400' : 'text-red-400'}>
                            {capabilities.hasAudioContext ? '✅ Disponível' : '❌ Não disponível'}
                        </div>
                    </div>

                    <div className={`p-3 rounded-lg text-sm ${capabilities.hasGetUserMedia ? 'bg-green-900/20 border border-green-500/30' : 'bg-red-900/20 border border-red-500/30'}`}>
                        <div className="font-medium text-gray-300">Get User Media</div>
                        <div className={capabilities.hasGetUserMedia ? 'text-green-400' : 'text-red-400'}>
                            {capabilities.hasGetUserMedia ? '✅ Disponível' : '❌ Não disponível'}
                        </div>
                    </div>

                    <div className={`p-3 rounded-lg text-sm ${capabilities.hasAudioWorklet ? 'bg-green-900/20 border border-green-500/30' : 'bg-red-900/20 border border-red-500/30'}`}>
                        <div className="font-medium text-gray-300">Audio Worklet</div>
                        <div className={capabilities.hasAudioWorklet ? 'text-green-400' : 'text-red-400'}>
                            {capabilities.hasAudioWorklet ? '✅ Disponível' : '❌ Não disponível'}
                        </div>
                    </div>

                    <div className={`p-3 rounded-lg text-sm ${capabilities.hasSharedArrayBuffer ? 'bg-green-900/20 border border-green-500/30' : 'bg-red-900/20 border border-red-500/30'}`}>
                        <div className="font-medium text-gray-300">Shared Array Buffer</div>
                        <div className={capabilities.hasSharedArrayBuffer ? 'text-green-400' : 'text-red-400'}>
                            {capabilities.hasSharedArrayBuffer ? '✅ Disponível' : '❌ Não disponível'}
                        </div>
                    </div>
                </div>
            </div>

            {/* Seletor de Track */}
            {databaseTracks.length > 0 && (
                <div className="mb-6">
                    <h4 className="font-medium text-gray-300 mb-3">🎵 Selecionar Track para Teste</h4>
                    <select
                        value={selectedTrack?.id || ''}
                        onChange={(e) => {
                            const track = databaseTracks.find(t => t.id === parseInt(e.target.value)) || null;
                            setSelectedTrack(track);
                        }}
                        className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white"
                    >
                        {databaseTracks.map((track) => (
                            <option key={track.id} value={track.id}>
                                {track.songName} - {track.artist} ({track.style})
                            </option>
                        ))}
                    </select>
                    {selectedTrack && (
                        <div className="mt-3 p-3 bg-gray-700 rounded-lg">
                            <div className="text-sm text-gray-300">
                                <strong>Track Selecionada:</strong> {selectedTrack.songName} - {selectedTrack.artist}
                            </div>
                            <div className="text-xs text-gray-400 mt-1">
                                Estilo: {selectedTrack.style} • Bitrate: {selectedTrack.bitrate}kbps
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Botões de Teste */}
            <div className="mb-6">
                <h4 className="font-medium text-gray-300 mb-3">🧪 Testes de Funcionalidade</h4>
                <div className="flex flex-wrap gap-3">
                    <button
                        onClick={testAllAPIs}
                        disabled={isTesting}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white rounded-lg font-medium"
                    >
                        {isTesting ? 'Testando...' : '🧪 Testar Todas as APIs'}
                    </button>

                    <button
                        onClick={testWebAudioAPI}
                        disabled={isTesting || !capabilities.hasWebAudioAPI}
                        className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white rounded-lg font-medium"
                    >
                        🎵 Testar Web Audio API
                    </button>

                    <button
                        onClick={testMediaSessionAPI}
                        disabled={isTesting || !capabilities.hasMediaSessionAPI}
                        className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white rounded-lg font-medium"
                    >
                        📱 Testar Media Session API
                    </button>

                    <button
                        onClick={testMicrophoneAccess}
                        disabled={isTesting || !capabilities.hasGetUserMedia}
                        className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-600 text-white rounded-lg font-medium"
                    >
                        🎤 Testar Microfone
                    </button>
                </div>
            </div>

            {/* Resultados dos Testes */}
            {Object.keys(testResults).length > 0 && (
                <div className="mb-6">
                    <h4 className="font-medium text-gray-300 mb-3">📊 Resultados dos Testes</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {Object.entries(testResults).map(([key, result]) => (
                            <div key={key} className={`p-3 rounded-lg text-sm ${result === true ? 'bg-green-900/20 border border-green-500/30' :
                                result === false ? 'bg-red-900/20 border border-red-500/30' :
                                    'bg-yellow-900/20 border border-yellow-500/30'
                                }`}>
                                <div className="font-medium text-gray-300 capitalize">{key}</div>
                                <div className={
                                    result === true ? 'text-green-400' :
                                        result === false ? 'text-red-400' :
                                            'text-yellow-400'
                                }>
                                    {result === true ? '✅ Funcionando' :
                                        result === false ? '❌ Falhou' :
                                            result}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Relatório */}
            <div className="mb-6">
                <h4 className="font-medium text-gray-300 mb-3">📋 Relatório de Compatibilidade</h4>
                <div className="bg-gray-900 p-4 rounded-lg">
                    <pre className="text-sm text-gray-200 whitespace-pre-wrap">
                        {generateCompatibilityReport()}
                    </pre>
                </div>
            </div>

            {/* Ações */}
            <div className="flex gap-3">
                <button
                    onClick={copyReport}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium"
                >
                    📋 Copiar Relatório
                </button>
            </div>

            {/* Informações */}
            <div className="mt-6 p-4 bg-blue-900/20 border border-blue-500/30 rounded-lg">
                <h4 className="font-medium text-blue-300 mb-2">ℹ️ Sobre APIs Nativas</h4>
                <div className="text-sm text-blue-200 space-y-1">
                    <p>• <strong>Web Audio API:</strong> Mais poderosa, melhor para mobile</p>
                    <p>• <strong>Media Session API:</strong> Integração com controles nativos</p>
                    <p>• <strong>Get User Media:</strong> Ativa áudio via permissão de microfone</p>
                    <p>• <strong>HTML5 Audio:</strong> Fallback básico com limitações em mobile</p>
                </div>
            </div>
        </div>
    );
};
