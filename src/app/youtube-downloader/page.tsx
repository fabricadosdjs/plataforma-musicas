'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import { Download, Music, Play, Loader2, AlertCircle, CheckCircle, Youtube } from 'lucide-react';

interface VideoInfo {
    title: string;
    duration: string;
    thumbnail: string;
    author: string;
    viewCount: string;
    isValid: boolean;
}

export default function YouTubeDownloader() {
    const { data: session, status } = useSession();
    const [url, setUrl] = useState('');
    const [videoInfo, setVideoInfo] = useState<VideoInfo | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    if (status === 'loading') {
        return (
            <div className="min-h-screen bg-[#1B1C1D] flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-green-600 animate-spin" />
            </div>
        );
    }

    if (status === 'unauthenticated') {
        redirect('/auth/sign-in');
    }

    const validateAndGetInfo = async () => {
        if (!url.trim()) {
            setError('Por favor, insira uma URL do YouTube');
            return;
        }

        setIsLoading(true);
        setError('');
        setVideoInfo(null);

        try {
            const response = await fetch(`/api/youtube-download-robust?url=${encodeURIComponent(url)}`);
            const data = await response.json();

            if (response.ok) {
                setVideoInfo(data);
                setSuccess('Vídeo encontrado! Clique em "Baixar MP3" para iniciar o download.');
            } else {
                setError(data.error || 'Erro ao obter informações do vídeo');
            }
        } catch (error) {
            setError('Erro ao conectar com o servidor');
        } finally {
            setIsLoading(false);
        }
    };

    const downloadMP3 = async () => {
        if (!videoInfo) return;

        setIsDownloading(true);
        setError('');
        setSuccess('');

        try {
            const response = await fetch('/api/youtube-download-robust', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    url: url,
                    title: videoInfo.title
                }),
            });

            const data = await response.json();

            if (response.ok) {
                setSuccess(`Download concluído! Arquivo: ${data.fileName}`);

                // Criar link de download
                const downloadLink = document.createElement('a');
                downloadLink.href = data.downloadUrl;
                downloadLink.download = data.fileName;
                downloadLink.click();

                setUrl('');
                setVideoInfo(null);
            } else {
                setError(data.error || 'Erro durante o download');
            }
        } catch (error) {
            setError('Erro ao conectar com o servidor');
        } finally {
            setIsDownloading(false);
        }
    };

    const formatDuration = (seconds: string) => {
        const totalSeconds = parseInt(seconds);
        const minutes = Math.floor(totalSeconds / 60);
        const remainingSeconds = totalSeconds % 60;
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    };

    const formatViewCount = (count: string) => {
        const num = parseInt(count);
        if (num >= 1000000) {
            return `${(num / 1000000).toFixed(1)}M`;
        } else if (num >= 1000) {
            return `${(num / 1000).toFixed(1)}K`;
        }
        return num.toString();
    };

    return (
        <div className="min-h-screen bg-[#1B1C1D] text-white">
            <div className="container mx-auto px-6 py-8">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="flex items-center justify-center gap-3 mb-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-red-600 to-red-800 rounded-xl flex items-center justify-center">
                            <Youtube className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-white">YouTube Downloader</h1>
                            <p className="text-gray-400 mt-1">Baixe vídeos do YouTube em MP3</p>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="max-w-2xl mx-auto">
                    {/* URL Input */}
                    <div className="bg-gray-800/50 rounded-xl p-6 mb-6">
                        <div className="flex gap-3">
                            <input
                                type="text"
                                value={url}
                                onChange={(e) => setUrl(e.target.value)}
                                placeholder="Cole a URL do vídeo do YouTube aqui..."
                                className="flex-1 px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500"
                            />
                            <button
                                onClick={validateAndGetInfo}
                                disabled={isLoading || !url.trim()}
                                className="px-6 py-3 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors flex items-center gap-2"
                            >
                                {isLoading ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    <Play className="w-4 h-4" />
                                )}
                                {isLoading ? 'Verificando...' : 'Verificar'}
                            </button>
                        </div>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-6 flex items-center gap-3">
                            <AlertCircle className="w-5 h-5 text-red-400" />
                            <span className="text-red-400">{error}</span>
                        </div>
                    )}

                    {/* Success Message */}
                    {success && (
                        <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 mb-6 flex items-center gap-3">
                            <CheckCircle className="w-5 h-5 text-green-400" />
                            <span className="text-green-400">{success}</span>
                        </div>
                    )}

                    {/* Video Info */}
                    {videoInfo && (
                        <div className="bg-gray-800/50 rounded-xl p-6 mb-6">
                            <div className="flex gap-4">
                                <img
                                    src={videoInfo.thumbnail}
                                    alt={videoInfo.title}
                                    className="w-32 h-24 object-cover rounded-lg"
                                />
                                <div className="flex-1">
                                    <h3 className="text-lg font-semibold text-white mb-2">
                                        {videoInfo.title}
                                    </h3>
                                    <div className="text-sm text-gray-400 space-y-1">
                                        <p>Canal: {videoInfo.author}</p>
                                        <p>Duração: {formatDuration(videoInfo.duration)}</p>
                                        <p>Visualizações: {formatViewCount(videoInfo.viewCount)}</p>
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={downloadMP3}
                                disabled={isDownloading}
                                className="w-full mt-4 px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 disabled:opacity-50 text-white rounded-lg font-medium transition-all flex items-center justify-center gap-2"
                            >
                                {isDownloading ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    <Download className="w-5 h-5" />
                                )}
                                {isDownloading ? 'Baixando MP3...' : 'Baixar MP3'}
                            </button>
                        </div>
                    )}

                    {/* Instructions */}
                    <div className="bg-gray-800/50 rounded-xl p-6">
                        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                            <Music className="w-5 h-5 text-green-400" />
                            Como usar
                        </h3>
                        <div className="space-y-3 text-sm text-gray-300">
                            <p>1. Cole a URL do vídeo do YouTube no campo acima</p>
                            <p>2. Clique em "Verificar" para obter informações do vídeo</p>
                            <p>3. Clique em "Baixar MP3" para iniciar o download</p>
                            <p>4. O arquivo será baixado automaticamente</p>
                        </div>

                        <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                            <p className="text-xs text-yellow-400">
                                ⚠️ <strong>Atenção:</strong> Esta ferramenta é apenas para uso pessoal.
                                Respeite os direitos autorais e termos de uso do YouTube.
                            </p>
                        </div>

                        <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                            <p className="text-xs text-blue-400">
                                💡 <strong>Dica:</strong> Para melhor qualidade, use vídeos com áudio de alta qualidade.
                                A conversão para MP3 mantém a qualidade original do áudio.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
