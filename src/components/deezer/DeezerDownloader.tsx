'use client';

import { useState, useEffect } from 'react';
import { Download, Music, Search, Loader2, AlertCircle, CheckCircle, Trash2, Clock, FileAudio } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/useToast';

interface TrackInfo {
    title: string;
    artist: string;
    album: string;
    duration: number;
    cover: string;
    trackId: string;
    isValid: boolean;
}

interface DownloadRecord {
    id: string;
    title: string;
    artist: string;
    fileName: string;
    fileSize: number;
    downloadUrl: string;
    quality: string;
    createdAt: string;
    expiresAt: string;
    daysRemaining: number;
}

export default function DeezerDownloader() {
    const [url, setUrl] = useState('');
    const [query, setQuery] = useState('');
    const [trackInfo, setTrackInfo] = useState<TrackInfo | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);
    const [downloads, setDownloads] = useState<DownloadRecord[]>([]);
    const [loadingHistory, setLoadingHistory] = useState(true);
    const [quality, setQuality] = useState('128');
    const [searchMode, setSearchMode] = useState<'url' | 'search'>('url');

    const { showToast, showSuccessToast, showErrorToast, showWarningToast } = useToast();

    // Carregar histórico de downloads
    useEffect(() => {
        fetchDownloadHistory();
    }, []);

    const fetchDownloadHistory = async () => {
        try {
            const response = await fetch('/api/deezer-downloads/history');
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

    // Função para validar URL do Deezer
    const validateDeezerUrl = (url: string): boolean => {
        const deezerPatterns = [
            /^https?:\/\/(www\.)?deezer\.com\/[a-z]{2}\/track\/\d+/,
            /^https?:\/\/(www\.)?deezer\.com\/track\/\d+/,
            /^https?:\/\/(www\.)?deezer\.com\/[a-z]{2}\/album\/\d+/,
            /^https?:\/\/(www\.)?deezer\.com\/album\/\d+/
        ];

        return deezerPatterns.some(pattern => pattern.test(url.trim()));
    };

    const validateAndGetInfo = async () => {
        if (searchMode === 'url') {
            if (!url.trim()) {
                showErrorToast('Por favor, insira uma URL do Deezer');
                return;
            }

            if (!validateDeezerUrl(url)) {
                showErrorToast('URL do Deezer inválida. Use um link do Deezer válido.');
                return;
            }
        }

        if (searchMode === 'search' && !query.trim()) {
            showErrorToast('Por favor, insira o nome da música');
            return;
        }

        setIsLoading(true);
        setTrackInfo(null);

        try {
            const params = searchMode === 'url'
                ? `url=${encodeURIComponent(url)}`
                : `query=${encodeURIComponent(query)}`;

            const response = await fetch(`/api/deezer-downloads?${params}`);
            const data = await response.json();

            if (response.ok) {
                setTrackInfo(data);
                showSuccessToast('Música encontrada! Clique em "Baixar MP3" para iniciar o download.');
            } else {
                showErrorToast(data.error || 'Erro ao obter informações da música');
            }
        } catch (error) {
            showErrorToast('Erro ao conectar com o servidor');
        } finally {
            setIsLoading(false);
        }
    };

    const downloadMP3 = async () => {
        if (!trackInfo) return;

        setIsDownloading(true);

        try {
            const response = await fetch('/api/deezer-downloads', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    url: url || `https://www.deezer.com/track/${trackInfo.trackId}`,
                    title: trackInfo.title,
                    artist: trackInfo.artist,
                    trackId: trackInfo.trackId,
                    quality: quality
                }),
            });

            const data = await response.json();

            if (response.ok) {
                showSuccessToast(`Download concluído! Arquivo: ${data.fileName}`);

                // Criar link de download
                const downloadLink = document.createElement('a');
                downloadLink.href = data.downloadUrl;
                downloadLink.download = data.fileName;
                downloadLink.click();

                setUrl('');
                setQuery('');
                setTrackInfo(null);

                // Recarregar histórico
                fetchDownloadHistory();
            } else {
                showErrorToast(data.error || 'Erro durante o download');
            }
        } catch (error) {
            showErrorToast('Erro ao conectar com o servidor');
        } finally {
            setIsDownloading(false);
        }
    };

    const deleteDownload = async (downloadId: string) => {
        try {
            const response = await fetch(`/api/deezer-downloads/history?id=${downloadId}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                setDownloads(downloads.filter(d => d.id !== downloadId));
                showSuccessToast('Download removido com sucesso');
            } else {
                showErrorToast('Erro ao remover download');
            }
        } catch (error) {
            showErrorToast('Erro ao conectar com o servidor');
        }
    };

    const formatDuration = (seconds: number) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
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
            {/* URL/Search Input */}
            <Card className="border-gray-700/50 bg-gradient-to-br from-gray-900/40 to-gray-800/40 backdrop-blur-sm shadow-xl border border-gray-600/30">
                <CardContent className="p-6">
                    {/* Mode Toggle */}
                    <div className="flex gap-2 mb-4">
                        <button
                            onClick={() => setSearchMode('url')}
                            className={`flex-1 px-4 py-2 rounded-lg border-2 transition-all duration-300 font-medium text-sm ${searchMode === 'url'
                                ? 'bg-gradient-to-r from-blue-600 to-cyan-600 border-blue-500 text-white shadow-lg shadow-blue-500/25'
                                : 'bg-gray-800/50 border-gray-600 text-gray-300 hover:border-gray-500 hover:bg-gray-700/50'
                                }`}
                        >
                            <div className="flex items-center justify-center gap-2">
                                <span>🔗</span>
                                <span>URL do Deezer</span>
                            </div>
                        </button>
                        <button
                            onClick={() => setSearchMode('search')}
                            className={`flex-1 px-4 py-2 rounded-lg border-2 transition-all duration-300 font-medium text-sm ${searchMode === 'search'
                                ? 'bg-gradient-to-r from-green-600 to-emerald-600 border-green-500 text-white shadow-lg shadow-green-500/25'
                                : 'bg-gray-800/50 border-gray-600 text-gray-300 hover:border-gray-500 hover:bg-gray-700/50'
                                }`}
                        >
                            <div className="flex items-center justify-center gap-2">
                                <span>🔍</span>
                                <span>Buscar por Nome</span>
                            </div>
                        </button>
                    </div>

                    <div className="flex gap-3">
                        {searchMode === 'url' ? (
                            <input
                                type="text"
                                value={url}
                                onChange={(e) => setUrl(e.target.value)}
                                placeholder="Cole a URL da música do Deezer aqui..."
                                className="flex-1 px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        ) : (
                            <input
                                type="text"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder="Digite o nome da música ou artista..."
                                className="flex-1 px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
                            />
                        )}
                        <Button
                            onClick={validateAndGetInfo}
                            disabled={isLoading || (searchMode === 'url' ? !url.trim() : !query.trim())}
                            className={`px-6 py-3 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors flex items-center gap-2 ${searchMode === 'url'
                                ? 'bg-blue-600 hover:bg-blue-700'
                                : 'bg-green-600 hover:bg-green-700'
                                }`}
                        >
                            {isLoading ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <Search className="w-4 h-4" />
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
                                disabled={true}
                                className={`flex-1 px-4 py-3 rounded-lg border-2 transition-all duration-300 font-medium text-sm ${quality === '320'
                                    ? 'bg-gradient-to-r from-green-600 to-emerald-600 border-green-500 text-white shadow-lg shadow-green-500/25'
                                    : 'bg-gray-800/50 border-gray-600 text-gray-300 opacity-50 cursor-not-allowed'
                                    }`}
                            >
                                <div className="flex items-center justify-center gap-2">
                                    <div className={`w-2 h-2 rounded-full ${quality === '320' ? 'bg-white' : 'bg-gray-400'}`}></div>
                                    <span>320 kbps</span>
                                    <span className="text-xs opacity-75">(Indisponível)</span>
                                </div>
                            </button>
                        </div>
                        <div className="mt-2 text-xs text-gray-400 text-center">
                            {quality === '128' ? 'Qualidade padrão, arquivo menor' : 'Alta qualidade, arquivo maior'}
                        </div>
                        <div className="mt-2 p-2 bg-yellow-500/10 border border-yellow-500/20 rounded text-xs text-yellow-400 text-center">
                            ⚠️ <strong>Nota:</strong> Qualidade 320 kbps temporariamente indisponível. Apenas 128 kbps disponível.
                        </div>
                    </div>
                </CardContent>
            </Card>



            {/* Track Info */}
            {trackInfo && (
                <Card className="border-gray-700/50 bg-gradient-to-br from-gray-900/40 to-gray-800/40 backdrop-blur-sm shadow-xl border border-gray-600/30">
                    <CardContent className="p-6">
                        <div className="flex gap-4">
                            <img
                                src={trackInfo.cover}
                                alt={trackInfo.title}
                                className="w-32 h-32 object-cover rounded-lg"
                            />
                            <div className="flex-1">
                                <h3 className="text-lg font-semibold text-white mb-2">
                                    {trackInfo.title}
                                </h3>
                                <div className="text-sm text-gray-400 space-y-1">
                                    <p>Artista: {trackInfo.artist}</p>
                                    <p>Álbum: {trackInfo.album}</p>
                                    <p>Duração: {formatDuration(trackInfo.duration)}</p>
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
                                                            {download.title} - {download.artist}
                                                        </h4>
                                                    </div>
                                                    <div className="flex items-center gap-4 text-xs text-gray-400">
                                                        <span>{download.fileName}</span>
                                                        <span>{formatFileSize(download.fileSize)}</span>
                                                        <span>Qualidade: {download.quality} kbps</span>
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
                        <p>1. Cole a URL da música do Deezer ou busque por nome</p>
                        <p>2. Clique em "Verificar" para obter informações</p>
                        <p>3. Selecione a qualidade MP3 (128 ou 320 kbps)</p>
                        <p>4. Clique em "Baixar MP3" para iniciar o download</p>
                        <p>5. Os downloads ficam disponíveis por 5 dias</p>
                    </div>

                    <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                        <p className="text-xs text-yellow-400">
                            ⚠️ <strong>Atenção:</strong> Esta ferramenta é apenas para uso pessoal.
                            Respeite os direitos autorais e termos de uso do Deezer.
                        </p>
                    </div>

                    <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                        <p className="text-xs text-blue-400">
                            💡 <strong>Dica:</strong> Para melhor qualidade, use a opção 320 kbps.
                            A qualidade depende da disponibilidade no Deezer.
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
