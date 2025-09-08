"use client";

import React, { useState, useEffect } from 'react';
import { useGlobalPlayer } from '@/context/GlobalPlayerContext';

interface AudioDiagnosticResult {
    format: string;
    codec: string;
    contentType: string;
    fileSize: number;
    duration: number;
    supported: boolean;
    error?: string;
}

export const AudioDiagnostics: React.FC = () => {
    const [diagnostics, setDiagnostics] = useState<AudioDiagnosticResult | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [currentTrack, setCurrentTrack] = useState<string>('');
    const { audioRef } = useGlobalPlayer();

    // Função para diagnosticar um arquivo de áudio
    const diagnoseAudio = async (audioUrl: string) => {
        if (!audioUrl) return;

        setIsLoading(true);
        setCurrentTrack(audioUrl);

        try {
            // 1. Verificar cabeçalhos HTTP
            const response = await fetch(audioUrl, { method: 'HEAD' });
            const contentType = response.headers.get('content-type') || 'unknown';
            const contentLength = response.headers.get('content-length') || '0';

            // 2. Criar elemento de áudio para análise
            const audio = new Audio();
            audio.src = audioUrl;

            // 3. Aguardar carregamento para análise
            await new Promise((resolve, reject) => {
                const timeout = setTimeout(() => reject(new Error('Timeout')), 10000);

                audio.addEventListener('loadedmetadata', () => {
                    clearTimeout(timeout);
                    resolve(true);
                });

                audio.addEventListener('error', (e) => {
                    clearTimeout(timeout);
                    reject(new Error(`Audio error: ${audio.error?.message}`));
                });

                audio.load();
            });

            // 4. Analisar formato e codec
            const format = getAudioFormat(audioUrl, contentType);
            const codec = getAudioCodec(contentType, audio);
            const duration = audio.duration || 0;
            const fileSize = parseInt(contentLength);

            // 5. Verificar compatibilidade
            const supported = await checkAudioCompatibility(audio, format, codec);

            setDiagnostics({
                format,
                codec,
                contentType,
                fileSize,
                duration,
                supported
            });

        } catch (error) {
            setDiagnostics({
                format: 'unknown',
                codec: 'unknown',
                contentType: 'unknown',
                fileSize: 0,
                duration: 0,
                supported: false,
                error: error instanceof Error ? (error as Error).message : 'Unknown error'
            });
        } finally {
            setIsLoading(false);
        }
    };

    // Determinar formato baseado na URL e Content-Type
    const getAudioFormat = (url: string, contentType: string): string => {
        if (contentType.includes('audio/mpeg') || url.includes('.mp3')) return 'MP3';
        if (contentType.includes('audio/aac') || url.includes('.aac')) return 'AAC';
        if (contentType.includes('audio/wav') || url.includes('.wav')) return 'WAV';
        if (contentType.includes('audio/ogg') || url.includes('.ogg')) return 'OGG';
        if (contentType.includes('audio/mp4') || url.includes('.m4a')) return 'M4A';
        if (contentType.includes('audio/flac') || url.includes('.flac')) return 'FLAC';
        return 'Unknown';
    };

    // Determinar codec baseado no Content-Type e análise do áudio
    const getAudioCodec = (contentType: string, audio: HTMLAudioElement): string => {
        if (contentType.includes('audio/mpeg')) return 'MPEG-1 Layer 3';
        if (contentType.includes('audio/aac')) return 'AAC';
        if (contentType.includes('audio/wav')) return 'PCM';
        if (contentType.includes('audio/ogg')) return 'Vorbis';
        if (contentType.includes('audio/mp4')) return 'AAC/MPEG-4';
        if (contentType.includes('audio/flac')) return 'FLAC';
        return 'Unknown';
    };

    // Verificar compatibilidade do áudio
    const checkAudioCompatibility = async (audio: HTMLAudioElement, format: string, codec: string): Promise<boolean> => {
        try {
            // Tentar reproduzir por um milissegundo para testar compatibilidade
            audio.currentTime = 0;
            audio.volume = 0;
            await audio.play();
            audio.pause();
            return true;
        } catch (error) {
            return false;
        }
    };

    // Testar com arquivo de exemplo
    const testWithSampleFile = () => {
        const sampleUrl = 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav';
        diagnoseAudio(sampleUrl);
    };

    return (
        <div className="p-6 bg-gray-800 rounded-lg border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-4">
                🔍 Diagnóstico de Áudio para Dispositivos Móveis
            </h3>

            {/* Controles */}
            <div className="space-y-4 mb-6">
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                        URL do Arquivo de Áudio:
                    </label>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            placeholder="https://exemplo.com/musica.mp3"
                            className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400"
                            onChange={(e) => setCurrentTrack(e.target.value)}
                            value={currentTrack}
                        />
                        <button
                            onClick={() => diagnoseAudio(currentTrack)}
                            disabled={!currentTrack || isLoading}
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white rounded-lg font-medium"
                        >
                            {isLoading ? 'Analisando...' : 'Analisar'}
                        </button>
                    </div>
                </div>

                <button
                    onClick={testWithSampleFile}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium"
                >
                    🧪 Testar com Arquivo de Exemplo
                </button>
            </div>

            {/* Resultados do Diagnóstico */}
            {diagnostics && (
                <div className="space-y-4">
                    <h4 className="text-md font-semibold text-white border-b border-gray-600 pb-2">
                        📊 Resultados da Análise
                    </h4>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-gray-700 p-4 rounded-lg">
                            <h5 className="font-medium text-gray-300 mb-2">📁 Informações do Arquivo</h5>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-400">Formato:</span>
                                    <span className={`font-medium ${diagnostics.format === 'MP3' ? 'text-green-400' : 'text-yellow-400'}`}>
                                        {diagnostics.format}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-400">Codec:</span>
                                    <span className="text-white">{diagnostics.codec}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-400">Tamanho:</span>
                                    <span className="text-white">
                                        {diagnostics.fileSize > 0 ? `${(diagnostics.fileSize / 1024 / 1024).toFixed(2)} MB` : 'Desconhecido'}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-400">Duração:</span>
                                    <span className="text-white">
                                        {diagnostics.duration > 0 ? `${Math.floor(diagnostics.duration / 60)}:${(diagnostics.duration % 60).toFixed(0).padStart(2, '0')}` : 'Desconhecido'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gray-700 p-4 rounded-lg">
                            <h5 className="font-medium text-gray-300 mb-2">🌐 Cabeçalhos HTTP</h5>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-400">Content-Type:</span>
                                    <span className={`font-medium ${diagnostics.contentType.includes('audio/') ? 'text-green-400' : 'text-red-400'}`}>
                                        {diagnostics.contentType}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-400">Compatibilidade:</span>
                                    <span className={`font-medium ${diagnostics.supported ? 'text-green-400' : 'text-red-400'}`}>
                                        {diagnostics.supported ? '✅ Suportado' : '❌ Não Suportado'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Recomendações */}
                    <div className="bg-gray-700 p-4 rounded-lg">
                        <h5 className="font-medium text-gray-300 mb-2">💡 Recomendações</h5>
                        <div className="text-sm text-gray-300 space-y-2">
                            {diagnostics.format !== 'MP3' && (
                                <p>⚠️ <strong>Formato:</strong> Recomendamos converter para MP3 para máxima compatibilidade</p>
                            )}
                            {!diagnostics.contentType.includes('audio/') && (
                                <p>⚠️ <strong>Content-Type:</strong> O servidor não está enviando o tipo MIME correto</p>
                            )}
                            {!diagnostics.supported && (
                                <p>❌ <strong>Compatibilidade:</strong> Este arquivo pode não funcionar em todos os dispositivos</p>
                            )}
                            {diagnostics.format === 'MP3' && diagnostics.contentType.includes('audio/') && diagnostics.supported && (
                                <p>✅ <strong>Perfeito!</strong> Este arquivo deve funcionar em todos os dispositivos móveis</p>
                            )}
                        </div>
                    </div>

                    {/* Erro se houver */}
                    {diagnostics.error && (
                        <div className="bg-red-900/20 border border-red-500/30 p-4 rounded-lg">
                            <h5 className="font-medium text-red-400 mb-2">❌ Erro na Análise</h5>
                            <p className="text-sm text-red-300">{diagnostics.error}</p>
                        </div>
                    )}
                </div>
            )}

            {/* Informações sobre Problemas Comuns */}
            <div className="mt-6 p-4 bg-blue-900/20 border border-blue-500/30 rounded-lg">
                <h4 className="font-medium text-blue-300 mb-2">ℹ️ Problemas Comuns em Dispositivos Móveis</h4>
                <div className="text-sm text-blue-200 space-y-1">
                    <p>• <strong>Autoplay:</strong> Áudio só toca após interação do usuário</p>
                    <p>• <strong>Formato:</strong> MP3 é o mais compatível, evite FLAC/WAV</p>
                    <p>• <strong>Codec:</strong> Use codecs padrão (MPEG-1 Layer 3 para MP3)</p>
                    <p>• <strong>Content-Type:</strong> Servidor deve enviar MIME type correto</p>
                </div>
            </div>
        </div>
    );
};
