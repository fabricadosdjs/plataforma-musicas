"use client";

import GoogleDrivePlayer from '@/components/player/GoogleDrivePlayer';
import { getAlternativeGoogleDriveUrls, isGoogleDriveUrl } from '@/utils/googleDriveUtils';
import { Pause, Play, Volume2 } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function TestGoogleDrivePage() {
    const [isPlaying, setIsPlaying] = useState(false);
    const [audio, setAudio] = useState<HTMLAudioElement | null>(null);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolume] = useState(0.8);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [currentUrlIndex, setCurrentUrlIndex] = useState(0);
    const [alternativeUrls, setAlternativeUrls] = useState<string[]>([]);

    // URL de teste do Google Drive
    const testUrl = 'https://drive.google.com/uc?export=download&id=1pwthiEgKH9vBYrtIIZWFv8T1nc4fh65A';

    // Gerar URLs alternativas
    useEffect(() => {
        const urls = getAlternativeGoogleDriveUrls(testUrl);
        setAlternativeUrls(urls);
    }, []);

    // Reinicializar áudio quando o índice da URL muda
    useEffect(() => {
        if (audio && alternativeUrls.length > 0 && currentUrlIndex < alternativeUrls.length) {
            const currentUrl = alternativeUrls[currentUrlIndex];
            console.log(`🔄 Mudando para URL ${currentUrlIndex + 1}/${alternativeUrls.length}:`, currentUrl);
            audio.src = currentUrl;
            audio.load();
        }
    }, [currentUrlIndex, alternativeUrls, audio]);

    const initializeAudio = () => {
        if (audio) {
            audio.pause();
            audio.removeAttribute('src');
        }

        if (alternativeUrls.length === 0) {
            setError('URLs alternativas não carregadas ainda');
            return;
        }

        setLoading(true);
        setError(null);

        const newAudio = new Audio();
        newAudio.crossOrigin = 'anonymous';
        newAudio.preload = 'metadata';

        newAudio.addEventListener('loadstart', () => {
            console.log('🎵 Iniciando carregamento...');
        });

        newAudio.addEventListener('loadedmetadata', () => {
            console.log('📊 Metadata carregada:', {
                duration: newAudio.duration,
                src: newAudio.src
            });
            setDuration(newAudio.duration);
            setLoading(false);
        });

        newAudio.addEventListener('canplay', () => {
            console.log('✅ Áudio pronto para reprodução');
            setLoading(false);
        });

        newAudio.addEventListener('timeupdate', () => {
            setCurrentTime(newAudio.currentTime);
        });

        newAudio.addEventListener('ended', () => {
            setIsPlaying(false);
        });

        newAudio.addEventListener('error', (e) => {
            console.error('❌ Erro no áudio:', e);

            // Tentar próxima URL se disponível
            if (currentUrlIndex < alternativeUrls.length - 1) {
                console.log(`🔄 Tentando URL alternativa ${currentUrlIndex + 1}/${alternativeUrls.length}`);
                setCurrentUrlIndex(prev => prev + 1);
                return;
            }

            setError(`Erro ao carregar áudio: ${newAudio.error?.message || 'Todas as URLs falharam'}`);
            setLoading(false);
        });

        if (alternativeUrls.length > 0) {
            const currentUrl = alternativeUrls[currentUrlIndex];
            console.log(`🔄 Usando URL ${currentUrlIndex + 1}/${alternativeUrls.length}:`, currentUrl);

            newAudio.src = currentUrl;
            newAudio.volume = volume;
            newAudio.load();
        }

        setAudio(newAudio);
    };

    const togglePlayPause = () => {
        if (!audio) {
            initializeAudio();
            return;
        }

        if (isPlaying) {
            audio.pause();
            setIsPlaying(false);
        } else {
            const playPromise = audio.play();
            if (playPromise !== undefined) {
                playPromise
                    .then(() => {
                        setIsPlaying(true);
                    })
                    .catch(error => {
                        console.error('Erro ao reproduzir:', error);
                        setError(`Erro ao reproduzir: ${error.message}`);
                    });
            }
        }
    };

    const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newVolume = parseFloat(e.target.value);
        setVolume(newVolume);
        if (audio) {
            audio.volume = newVolume;
        }
    };

    const nextUrl = () => {
        if (currentUrlIndex < alternativeUrls.length - 1) {
            setCurrentUrlIndex(prev => prev + 1);
            setError(null);
        }
    };

    const resetUrls = () => {
        setCurrentUrlIndex(0);
        setError(null);
        if (audio) {
            audio.pause();
            setIsPlaying(false);
        }
    };

    const formatTime = (time: number) => {
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white p-8">
            <div className="max-w-2xl mx-auto">
                <h1 className="text-3xl font-bold mb-8 text-center">
                    Teste Google Drive Player
                </h1>

                <div className="bg-gray-800 rounded-lg p-6 mb-6">
                    <h2 className="text-xl font-semibold mb-4">
                        DV - LA DOLCE VITA (DJ IL CUBANO)
                    </h2>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-2">URL Original:</label>
                            <code className="block bg-gray-700 p-2 rounded text-sm break-all">
                                {testUrl}
                            </code>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">É Google Drive URL:</label>
                            <span className={`px-2 py-1 rounded text-sm ${isGoogleDriveUrl(testUrl) ? 'bg-green-600' : 'bg-red-600'
                                }`}>
                                {isGoogleDriveUrl(testUrl) ? 'Sim' : 'Não'}
                            </span>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">URLs Alternativas:</label>
                            <div className="space-y-1">
                                {alternativeUrls.map((url, index) => (
                                    <div key={index} className="flex items-center gap-2">
                                        <span className={`w-2 h-2 rounded-full ${index === currentUrlIndex ? 'bg-blue-500' : 'bg-gray-500'
                                            }`}></span>
                                        <code className="text-xs bg-gray-700 p-1 rounded break-all">
                                            {url}
                                        </code>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                <GoogleDrivePlayer
                    fileId="1pwthiEgKH9vBYrtIIZWFv8T1nc4fh65A"
                    title="DV - LA DOLCE VITA (DJ IL CUBANO)"
                />

                <div className="bg-gray-800 rounded-lg p-6">
                    <h3 className="text-lg font-semibold mb-4">Player HTML5 (Teste Técnico)</h3>
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold">Player de Teste</h3>
                        <div className="flex items-center gap-2">
                            <Volume2 size={18} />
                            <input
                                type="range"
                                min="0"
                                max="1"
                                step="0.1"
                                value={volume}
                                onChange={handleVolumeChange}
                                className="w-20"
                            />
                        </div>
                    </div>

                    {loading && (
                        <div className="text-center py-4">
                            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                            <p className="mt-2">Carregando áudio...</p>
                        </div>
                    )}

                    {error && (
                        <div className="bg-red-900/50 border border-red-500 rounded p-3 mb-4">
                            <p className="text-red-200">{error}</p>
                        </div>
                    )}

                    <div className="flex items-center justify-center gap-4 py-6">
                        <button
                            onClick={togglePlayPause}
                            disabled={loading}
                            className="w-16 h-16 flex items-center justify-center rounded-full bg-blue-600 text-white hover:bg-blue-700 transition-colors disabled:opacity-50"
                        >
                            {isPlaying ? <Pause size={32} /> : <Play size={32} />}
                        </button>
                    </div>

                    <div className="flex gap-2 mb-4 justify-center">
                        <button
                            onClick={nextUrl}
                            disabled={currentUrlIndex >= alternativeUrls.length - 1}
                            className="px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Próxima URL ({currentUrlIndex + 1}/{alternativeUrls.length})
                        </button>
                        <button
                            onClick={resetUrls}
                            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
                        >
                            Reset
                        </button>
                    </div>

                    <div className="space-y-2">
                        <div className="flex justify-between text-sm text-gray-400">
                            <span>{formatTime(currentTime)}</span>
                            <span>{formatTime(duration)}</span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-2">
                            <div
                                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                                style={{
                                    width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%`
                                }}
                            ></div>
                        </div>
                    </div>

                    {audio && (
                        <div className="mt-4 text-sm text-gray-400">
                            <p>Status: {loading ? 'Carregando...' : isPlaying ? 'Reproduzindo' : 'Pausado'}</p>
                            <p>Duração: {formatTime(duration)}</p>
                            <p>Tempo atual: {formatTime(currentTime)}</p>
                        </div>
                    )}
                </div>

                <div className="mt-6 text-center">
                    <button
                        onClick={() => window.location.href = '/new'}
                        className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded transition-colors"
                    >
                        Voltar para New
                    </button>
                </div>
            </div>
        </div>
    );
}
