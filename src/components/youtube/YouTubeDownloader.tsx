'use client';

import { useState, useEffect } from 'react';
import { Download, Music, Play, Loader2, AlertCircle, CheckCircle, Trash2, Clock, FileAudio } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface VideoInfo {
    title: string;
    duration: string;
    thumbnail: string;
    author: string;
    viewCount: string;
    isValid: boolean;
}

interface DownloadRecord {
    id: string;
    title: string;
    fileName: string;
    fileSize: number;
    downloadUrl: string;
    createdAt: string;
    expiresAt: string;
    isPlaylist?: boolean;
    daysRemaining: number;
}



export default function YouTubeDownloader() {
    const [url, setUrl] = useState('');
    const [videoInfo, setVideoInfo] = useState<VideoInfo | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [downloads, setDownloads] = useState<DownloadRecord[]>([]);
    const [loadingHistory, setLoadingHistory] = useState(true);
    const [quality, setQuality] = useState('128');

    // Carregar histórico de downloads
    useEffect(() => {
        fetchDownloadHistory();
    }, []);

    const fetchDownloadHistory = async () => {
        try {
            const response = await fetch('/api/youtube-downloads/history');
            if (response.ok) {
                const data = await response.json();
                setDownloads(data.downloads || []);
            }
        } catch (error) {
            console.error('Erro ao carregar histórico:', error);
        } finally {
            setLoadingHistory(false);
        }
    };

    const validateAndGetInfo = async () => {
        if (!url.trim()) {
            setError('Por favor, insira uma URL do YouTube');
            return;
        }

        setIsLoading(true);
        setError('');
        setVideoInfo(null);

        try {
            const response = await fetch(`/api/youtube-downloads?url=${encodeURIComponent(url)}`);
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
            const response = await fetch('/api/youtube-downloads', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    url: url,
                    title: videoInfo.title,
                    quality: quality
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

                // Recarregar histórico
                fetchDownloadHistory();
            } else {
                setError(data.error || 'Erro durante o download');
            }
        } catch (error) {
            setError('Erro ao conectar com o servidor');
        } finally {
            setIsDownloading(false);
        }
    };



    const deleteDownload = async (downloadId: string) => {
        try {
            const response = await fetch(`/api/youtube-downloads/history?id=${downloadId}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                setDownloads(downloads.filter(d => d.id !== downloadId));
                setSuccess('Download removido com sucesso');
            } else {
                setError('Erro ao remover download');
            }
        } catch (error) {
            setError('Erro ao conectar com o servidor');
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

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="space-y-8">

            {/* URL Input */}
            <Card className="border-gray-700/50 bg-gradient-to-br from-gray-900/40 to-gray-800/40 backdrop-blur-sm shadow-xl border border-gray-600/30">
                <CardContent className="p-6">
                    <div className="flex gap-3">
                        <input
                            type="text"
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            placeholder="Cole a URL do vídeo do YouTube aqui..."
                            className="flex-1 px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500"
                        />
                        <Button
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
                        </Button>
                    </div>

                    {/* Quality Selection */}
                    <div className="mt-4">
                        <label className="text-sm text-gray-300 mb-3 block">Qualidade MP3:</label>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setQuality('128')}
                                className={`flex-1 px-4 py-3 rounded-lg border-2 transition-all duration-300 font-medium text-sm ${quality === '128'
                                    ? 'bg-gradient-to-r from-blue-600 to-cyan-600 border-blue-500 text-white shadow-lg shadow-blue-500/25'
                                    : 'bg-gray-800/50 border-gray-600 text-gray-300 hover:border-gray-500 hover:bg-gray-700/50'
                                    }`}
                            >
                                <div className="flex items-center justify-center gap-2">
                                    <div className={`w-2 h-2 rounded-full ${quality === '128' ? 'bg-white' : 'bg-gray-400'}`}></div>
                                    <span>128 kbps</span>
                                    <span className="text-xs opacity-75">(Padrão)</span>
                                </div>
                            </button>
                            <button
                                onClick={() => setQuality('320')}
                                className={`flex-1 px-4 py-3 rounded-lg border-2 transition-all duration-300 font-medium text-sm ${quality === '320'
                                    ? 'bg-gradient-to-r from-green-600 to-emerald-600 border-green-500 text-white shadow-lg shadow-green-500/25'
                                    : 'bg-gray-800/50 border-gray-600 text-gray-300 hover:border-gray-500 hover:bg-gray-700/50'
                                    }`}
                            >
                                <div className="flex items-center justify-center gap-2">
                                    <div className={`w-2 h-2 rounded-full ${quality === '320' ? 'bg-white' : 'bg-gray-400'}`}></div>
                                    <span>320 kbps</span>
                                    <span className="text-xs opacity-75">(Alta)</span>
                                </div>
                            </button>
                        </div>
                        <div className="mt-2 text-xs text-gray-400 text-center">
                            {quality === '128' ? 'Qualidade padrão, arquivo menor' : 'Alta qualidade, arquivo maior'}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Box Informativo sobre Playlists */}
            <Card className="border-purple-500/40 bg-gradient-to-r from-purple-600/30 to-pink-600/30 backdrop-blur-sm shadow-2xl">
                <CardContent className="p-8">
                    <div className="text-center">
                        {/* Ícone Principal */}
                        <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                            <span className="text-white text-2xl font-bold">🎵</span>
                        </div>

                        {/* Título */}
                        <h3 className="text-xl font-bold text-white mb-4">
                            📋 Tem playlists do YouTube?
                        </h3>

                        {/* Descrição */}
                        <p className="text-gray-300 mb-8 text-base leading-relaxed max-w-md mx-auto">
                            Para download de playlists completas, entre em contato via WhatsApp e solicite o serviço personalizado.
                        </p>

                        {/* Botão Grande e Centralizado */}
                        <a
                            href="https://wa.me/5551935052274?text=Olá! Gostaria de solicitar o download de uma playlist do YouTube."
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white text-lg font-semibold rounded-xl transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-105 transform"
                        >
                            <span className="text-xl">📱</span>
                            <span>Solicitar via WhatsApp</span>
                            <span className="text-xl">→</span>
                        </a>

                        {/* Informação Adicional */}
                        <p className="text-xs text-gray-400 mt-4">
                            Resposta rápida • Serviço personalizado • Qualidade garantida
                        </p>
                    </div>
                </CardContent>
            </Card>

            {/* Error Message */}
            {error && (
                <Card className="border-red-500/20 bg-red-500/10 backdrop-blur-sm shadow-xl">
                    <CardContent className="p-4 flex items-center gap-3">
                        <AlertCircle className="w-5 h-5 text-red-400" />
                        <span className="text-red-400">{error}</span>
                    </CardContent>
                </Card>
            )}

            {/* Success Message */}
            {success && (
                <Card className="border-green-500/20 bg-green-500/10 backdrop-blur-sm shadow-xl">
                    <CardContent className="p-4 flex items-center gap-3">
                        <CheckCircle className="w-5 h-5 text-green-400" />
                        <span className="text-green-400">{success}</span>
                    </CardContent>
                </Card>
            )}

            {/* Video Info */}
            {videoInfo && (
                <Card className="border-gray-700/50 bg-gradient-to-br from-gray-900/40 to-gray-800/40 backdrop-blur-sm shadow-xl border border-gray-600/30">
                    <CardContent className="p-6">
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

                        <Button
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
                        </Button>
                    </CardContent>
                </Card>
            )}



            {/* Histórico de Downloads */}
            <div className="space-y-4">
                <div className="flex items-center gap-3">
                    <FileAudio className="w-5 h-5 text-blue-400" />
                    <h3 className="text-xl font-bold text-white">Histórico de Downloads</h3>
                    {loadingHistory && <Loader2 className="w-4 h-4 animate-spin text-gray-400" />}
                </div>

                {downloads.length === 0 && !loadingHistory ? (
                    <Card className="border-gray-700/50 bg-gradient-to-br from-gray-900/40 to-gray-800/40 backdrop-blur-sm shadow-xl border border-gray-600/30">
                        <CardContent className="p-6 text-center">
                            <Music className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                            <p className="text-gray-400">Nenhum download encontrado</p>
                            <p className="text-sm text-gray-500 mt-2">Os downloads ficam disponíveis por 5 dias</p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-4">
                        {/* Downloads */}
                        {downloads.length > 0 && (
                            <div className="grid gap-4">
                                {downloads.map((download) => (
                                    <Card key={download.id} className="border-gray-700/50 bg-gradient-to-br from-gray-900/40 to-gray-800/40 backdrop-blur-sm shadow-xl border border-gray-600/30 hover:border-gray-500/50 transition-all duration-300">
                                        <CardContent className="p-4">
                                            <div className="flex items-center justify-between">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-3 mb-2">
                                                        <FileAudio className="w-4 h-4 text-blue-400" />
                                                        <h4 className="text-sm font-semibold text-white truncate">
                                                            {download.title}
                                                        </h4>
                                                    </div>
                                                    <div className="flex items-center gap-4 text-xs text-gray-400">
                                                        <span>{download.fileName}</span>
                                                        <span>{formatFileSize(download.fileSize)}</span>
                                                        <div className="flex items-center gap-1">
                                                            <Clock className="w-3 h-3" />
                                                            <span>{download.daysRemaining} dias restantes</span>
                                                        </div>
                                                    </div>
                                                    <div className="text-xs text-gray-500 mt-1">
                                                        Baixado em {formatDate(download.createdAt)}
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Button
                                                        onClick={() => {
                                                            const downloadLink = document.createElement('a');
                                                            downloadLink.href = download.downloadUrl;
                                                            downloadLink.download = download.fileName;
                                                            downloadLink.click();
                                                        }}
                                                        className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded"
                                                    >
                                                        <Download className="w-3 h-3" />
                                                    </Button>
                                                    <Button
                                                        onClick={() => deleteDownload(download.id)}
                                                        className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-xs rounded"
                                                    >
                                                        <Trash2 className="w-3 h-3" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Instructions */}
            <Card className="border-gray-700/50 bg-gradient-to-br from-gray-900/40 to-gray-800/40 backdrop-blur-sm shadow-xl border border-gray-600/30">
                <CardContent className="p-6">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        <Music className="w-5 h-5 text-green-400" />
                        Como usar
                    </h3>
                    <div className="space-y-3 text-sm text-gray-300">
                        <p>1. Cole a URL do vídeo do YouTube no campo acima</p>
                        <p>2. Clique em "Verificar" para obter informações</p>
                        <p>3. Selecione a qualidade MP3 (128 ou 320 kbps)</p>
                        <p>4. Clique em "Baixar MP3" para iniciar o download</p>
                        <p>5. Os downloads ficam disponíveis por 5 dias</p>
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
                </CardContent>
            </Card>
        </div>
    );
}
