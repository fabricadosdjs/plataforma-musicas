'use client';

import { useState, useEffect } from 'react';
import { Download, Music, Users, FileAudio, Search, Filter, ChevronDown, ChevronUp, Archive, Copy, AlertTriangle, Info, CheckCircle, Star, Zap, Target, TrendingUp, Folder } from 'lucide-react';
import '@/styles/contabo-extractor.css';

interface Track {
    id: number;
    songName: string;
    artist: string;
    style: string;
    pool: string;
    imageUrl: string;
    downloadUrl: string;
    releaseDate: string;
    createdAt: string;
    previewUrl: string;
    isCommunity: boolean;
    uploadedBy: string | null;
}

interface StyleCount {
    style: string;
    count: number;
}

interface TracksByStyle {
    [key: string]: Track[];
}

export default function ContaboExtractor() {
    const [tracksByStyle, setTracksByStyle] = useState<TracksByStyle>({});
    const [styleCounts, setStyleCounts] = useState<StyleCount[]>([]);
    const [totalTracks, setTotalTracks] = useState(0);
    const [totalStyles, setTotalStyles] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedStyle, setSelectedStyle] = useState<string>('all');
    const [expandedStyles, setExpandedStyles] = useState<Set<string>>(new Set());
    const [downloadingTracks, setDownloadingTracks] = useState<Set<number>>(new Set());
    const [downloadingStyles, setDownloadingStyles] = useState<Set<string>>(new Set());
    const [batchDownloads, setBatchDownloads] = useState<Record<string, { tracks: Track[], currentIndex: number, isActive: boolean }>>({});
    const [downloadedTracks, setDownloadedTracks] = useState<Set<number>>(new Set());
    const [copiedTracks, setCopiedTracks] = useState<Set<number>>(new Set());

    useEffect(() => {
        fetchTracksByStyle();
        loadDownloadHistory();
    }, []);

    const loadDownloadHistory = () => {
        try {
            const history = localStorage.getItem('contabo-download-history');
            if (history) {
                const parsedHistory = JSON.parse(history);
                setDownloadedTracks(new Set(parsedHistory));
            }
        } catch (error) {
            console.error('Erro ao carregar histórico de downloads:', error);
        }
    };

    const saveDownloadToHistory = (trackId: number) => {
        try {
            setDownloadedTracks(prev => {
                const newSet = new Set(prev);
                newSet.add(trackId);

                // Salvar no localStorage
                const historyArray = Array.from(newSet);
                localStorage.setItem('contabo-download-history', JSON.stringify(historyArray));

                return newSet;
            });
        } catch (error) {
            console.error('Erro ao salvar histórico de download:', error);
        }
    };

    const copyTrackName = async (track: Track) => {
        try {
            const trackName = `${track.artist} - ${track.songName}.mp3`;
            await navigator.clipboard.writeText(trackName);

            // Mostrar feedback visual
            setCopiedTracks(prev => new Set(prev).add(track.id));

            // Remover feedback após 2 segundos
            setTimeout(() => {
                setCopiedTracks(prev => {
                    const newSet = new Set(prev);
                    newSet.delete(track.id);
                    return newSet;
                });
            }, 2000);
        } catch (error) {
            console.error('Erro ao copiar nome da música:', error);
            // Fallback para navegadores mais antigos
            const textArea = document.createElement('textarea');
            textArea.value = `${track.artist} - ${track.songName}.mp3`;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);

            setCopiedTracks(prev => new Set(prev).add(track.id));
            setTimeout(() => {
                setCopiedTracks(prev => {
                    const newSet = new Set(prev);
                    newSet.delete(track.id);
                    return newSet;
                });
            }, 2000);
        }
    };

    const showDownloadNotification = (track: Track, downloadType: string) => {
        // Criar notificação visual
        const notification = document.createElement('div');
        notification.className = 'fixed top-4 right-4 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white px-6 py-4 rounded-xl shadow-2xl z-50 transform transition-all duration-300 translate-x-full';
        notification.innerHTML = `
            <div class="flex items-center space-x-3">
                <div class="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                    <CheckCircle className="h-5 w-5" />
                </div>
                <div>
                    <div class="font-semibold">✅ Download Concluído!</div>
                    <div class="text-sm opacity-90">${track.songName}</div>
                    <div class="text-xs opacity-75">📁 ${downloadType}</div>
                </div>
            </div>
        `;

        document.body.appendChild(notification);

        // Animar entrada
        setTimeout(() => {
            notification.classList.remove('translate-x-full');
        }, 100);

        // Remover após 4 segundos
        setTimeout(() => {
            notification.classList.add('translate-x-full');
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 4000);
    };

    const showBatchDownloadNotification = (track: Track, downloadType: string) => {
        // Notificação mais compacta para downloads em lote
        const notification = document.createElement('div');
        notification.className = 'fixed bottom-4 right-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-3 rounded-lg shadow-xl z-50 transform transition-all duration-300 translate-x-full';
        notification.innerHTML = `
            <div class="flex items-center space-x-2">
                <div class="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
                    <Download className="h-3 w-3" />
                </div>
                <div class="text-sm">
                    <div class="font-medium">${track.songName}</div>
                    <div class="text-xs opacity-75">📁 ${downloadType}</div>
                </div>
            </div>
        `;

        document.body.appendChild(notification);

        // Animar entrada
        setTimeout(() => {
            notification.classList.remove('translate-x-full');
        }, 100);

        // Remover após 3 segundos (mais rápido para lotes)
        setTimeout(() => {
            notification.classList.add('translate-x-full');
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    };

    const fetchTracksByStyle = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/admin/tracks-by-style');
            const data = await response.json();

            if (response.ok) {
                setTracksByStyle(data.tracksByStyle);
                setStyleCounts(data.styleCounts);
                setTotalTracks(data.totalTracks);
                setTotalStyles(data.totalStyles);
            } else {
                setError(data.error || 'Erro ao carregar músicas');
            }
        } catch (err) {
            setError('Erro de conexão');
        } finally {
            setLoading(false);
        }
    };

    const downloadTrack = async (track: Track) => {
        try {
            setDownloadingTracks(prev => new Set(prev).add(track.id));

            const response = await fetch('/api/admin/download-track', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ trackId: track.id }),
            });

            if (response.ok) {
                // A API agora sempre retorna o arquivo para download forçado
                const blob = await response.blob();

                // Criar link de download com nome original do arquivo
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;

                // Usar o nome sugerido pela API (Content-Disposition)
                // Se não conseguir extrair, usar o nome padrão
                const contentDisposition = response.headers.get('Content-Disposition');
                let fileName = '';

                if (contentDisposition) {
                    const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
                    if (filenameMatch && filenameMatch[1]) {
                        fileName = filenameMatch[1].replace(/['"]/g, '');
                    }
                }

                // Se não conseguir extrair o nome da API, usar o padrão
                if (!fileName) {
                    fileName = `${track.artist} - ${track.songName}.mp3`;
                }

                a.download = fileName;

                // Adicionar ao DOM e clicar
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);

                // Salvar no histórico de downloads
                saveDownloadToHistory(track.id);

                // Mostrar notificação de sucesso
                showDownloadNotification(track, 'Download direto');
            } else {
                const errorData = await response.json();
                alert(`Erro ao baixar: ${errorData.error}`);
            }
        } catch (err) {
            alert('Erro ao baixar música');
        } finally {
            setDownloadingTracks(prev => {
                const newSet = new Set(prev);
                newSet.delete(track.id);
                return newSet;
            });
        }
    };

    const downloadStyleBatch = async (style: string) => {
        try {
            setDownloadingStyles(prev => new Set(prev).add(style));

            // Buscar todas as músicas do estilo
            const response = await fetch('/api/admin/download-style-batch', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ style }),
            });

            if (response.ok) {
                const data = await response.json();

                // Inicializar o download em lote
                setBatchDownloads(prev => ({
                    ...prev,
                    [style]: {
                        tracks: data.tracks,
                        currentIndex: 0,
                        isActive: true
                    }
                }));

                // Iniciar o primeiro lote de 10 músicas
                await downloadNextBatch(style, data.tracks, 0);
            } else {
                const errorData = await response.json();
                alert(`Erro ao baixar lote: ${errorData.error}`);
            }
        } catch (err) {
            alert('Erro ao baixar lote de músicas');
        } finally {
            setDownloadingStyles(prev => {
                const newSet = new Set(prev);
                newSet.delete(style);
                return newSet;
            });
        }
    };

    const downloadNextBatch = async (style: string, tracks: Track[], startIndex: number) => {
        const batchSize = 10;
        const endIndex = Math.min(startIndex + batchSize, tracks.length);
        const currentBatch = tracks.slice(startIndex, endIndex);

        console.log(`📥 Baixando lote ${Math.floor(startIndex / batchSize) + 1}: músicas ${startIndex + 1} a ${endIndex} de ${tracks.length}`);

        // Baixar todas as músicas do lote atual simultaneamente
        const downloadPromises = currentBatch.map(track => downloadTrackForBatch(track));

        try {
            await Promise.all(downloadPromises);
            console.log(`✅ Lote ${Math.floor(startIndex / batchSize) + 1} concluído!`);

            // Verificar se há mais músicas para baixar
            if (endIndex < tracks.length) {
                // Aguardar um pouco antes de baixar o próximo lote
                setTimeout(() => {
                    downloadNextBatch(style, tracks, endIndex);
                }, 1000);
            } else {
                // Todos os downloads foram concluídos
                console.log(`🎉 Todos os downloads do estilo "${style}" foram concluídos!`);
                setBatchDownloads(prev => ({
                    ...prev,
                    [style]: {
                        ...prev[style],
                        isActive: false
                    }
                }));
            }
        } catch (error) {
            console.error(`❌ Erro no lote ${Math.floor(startIndex / batchSize) + 1}:`, error);
        }
    };

    const downloadTrackForBatch = async (track: Track) => {
        try {
            const response = await fetch('/api/admin/download-track', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ trackId: track.id }),
            });

            if (response.ok) {
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;

                // Usar o nome sugerido pela API (Content-Disposition)
                // Se não conseguir extrair, usar o nome padrão
                const contentDisposition = response.headers.get('Content-Disposition');
                let fileName = '';

                if (contentDisposition) {
                    const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
                    if (filenameMatch && filenameMatch[1]) {
                        fileName = filenameMatch[1].replace(/['"]/g, '');
                    }
                }

                // Se não conseguir extrair o nome da API, usar o padrão
                if (!fileName) {
                    fileName = `${track.artist} - ${track.songName}.mp3`;
                }

                a.download = fileName;

                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);

                // Atualizar o progresso
                updateBatchProgress(track.style, track.id);

                // Salvar no histórico de downloads
                saveDownloadToHistory(track.id);

                // Mostrar notificação de sucesso para downloads em lote
                showBatchDownloadNotification(track, 'Download direto');
            } else {
                const errorData = await response.json();
                console.error(`Erro ao baixar ${track.songName}: ${errorData.error}`);
            }
        } catch (err) {
            console.error(`Erro ao baixar ${track.songName}:`, err);
        }
    };

    const updateBatchProgress = (style: string, trackId: number) => {
        setBatchDownloads(prev => {
            if (!prev[style]) return prev;

            const currentIndex = prev[style].tracks.findIndex(track => track.id === trackId);
            if (currentIndex === -1) return prev;

            return {
                ...prev,
                [style]: {
                    ...prev[style],
                    currentIndex: Math.max(prev[style].currentIndex, currentIndex + 1)
                }
            };
        });
    };

    const toggleStyleExpansion = (style: string) => {
        setExpandedStyles(prev => {
            const newSet = new Set(prev);
            if (newSet.has(style)) {
                newSet.delete(style);
            } else {
                newSet.add(style);
            }
            return newSet;
        });
    };

    const filteredStyleCounts = styleCounts.filter(styleCount =>
        styleCount.style.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredTracksByStyle = Object.keys(tracksByStyle).reduce((acc, style) => {
        if (selectedStyle === 'all' || style === selectedStyle) {
            if (style.toLowerCase().includes(searchTerm.toLowerCase())) {
                acc[style] = tracksByStyle[style];
            }
        }
        return acc;
    }, {} as TracksByStyle);

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 via-indigo-900 to-slate-900 p-8 relative overflow-hidden">
                {/* Background Elements */}
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
                    <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
                    <div className="absolute top-40 left-40 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
                </div>
                <div className="max-w-7xl mx-auto relative z-10">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-400 mx-auto shadow-2xl"></div>
                        <p className="text-white text-xl mt-4 font-semibold">Carregando músicas...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 via-indigo-900 to-slate-900 p-8 relative overflow-hidden">
                {/* Background Elements */}
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
                    <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
                    <div className="absolute top-40 left-40 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
                </div>
                <div className="max-w-7xl mx-auto relative z-10">
                    <div className="bg-gradient-to-r from-red-600 to-red-700 text-white p-8 rounded-2xl shadow-2xl border border-red-500/30 backdrop-blur-sm">
                        <h1 className="text-3xl font-bold mb-4 flex items-center justify-center">
                            <AlertTriangle className="h-8 w-8 mr-3" />
                            Erro
                        </h1>
                        <p className="text-lg text-center mb-6">{error}</p>
                        <button
                            onClick={fetchTracksByStyle}
                            className="mx-auto bg-white text-red-600 px-6 py-3 rounded-xl hover:bg-gray-100 transition-all transform hover:scale-105 shadow-lg font-semibold"
                        >
                            Tentar Novamente
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 via-indigo-900 to-slate-900 p-8 relative overflow-hidden">
            {/* Background Elements */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
                <div className="absolute top-40 left-40 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
            </div>

            <div className="max-w-7xl mx-auto relative z-10">
                {/* Header Épico */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full mb-6 shadow-2xl">
                        <Music className="h-10 w-10 text-white" />
                    </div>
                    <h1 className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-blue-400 to-pink-400 mb-6">
                        🎵 Extrator de Músicas Contabo
                    </h1>
                    <p className="text-2xl text-gray-300 font-medium max-w-3xl mx-auto leading-relaxed">
                        Baixe suas músicas diretamente com nomes originais do Contabo Storage
                    </p>
                    <div className="flex items-center justify-center space-x-4 mt-6">
                        <div className="flex items-center space-x-2 text-purple-300">
                            <Star className="h-5 w-5" />
                            <span className="text-sm">Premium</span>
                        </div>
                        <div className="flex items-center space-x-2 text-blue-300">
                            <Zap className="h-5 w-5" />
                            <span className="text-sm">Rápido</span>
                        </div>
                        <div className="flex items-center space-x-2 text-pink-300">
                            <Target className="h-5 w-5" />
                            <span className="text-sm">Original</span>
                        </div>
                    </div>
                </div>

                {/* Aviso sobre Downloads em Lote */}
                <div className="mb-8">
                    <div className="bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30 rounded-2xl p-6 backdrop-blur-sm shadow-xl">
                        <div className="flex items-start space-x-4">
                            <div className="flex-shrink-0">
                                <div className="w-12 h-12 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full flex items-center justify-center">
                                    <AlertTriangle className="h-6 w-6 text-white" />
                                </div>
                            </div>
                            <div className="flex-1">
                                <h3 className="text-lg font-semibold text-amber-300 mb-2">
                                    ⚠️ Aviso Importante: Downloads em Lote
                                </h3>
                                <p className="text-amber-200 mb-4 leading-relaxed">
                                    Para downloads em lote funcionarem corretamente, pode ser necessário autorizar múltiplos downloads no seu navegador.
                                    Alguns navegadores bloqueiam downloads automáticos por segurança.
                                </p>
                                <div className="bg-black/20 rounded-lg p-4">
                                    <h4 className="font-semibold text-amber-300 mb-2">💡 Como resolver:</h4>
                                    <ul className="text-amber-100 text-sm space-y-1">
                                        <li>• <strong>Chrome:</strong> Clique no ícone de download na barra de endereços e permita</li>
                                        <li>• <strong>Firefox:</strong> Vá em Configurações → Downloads → Marque "Salvar arquivos automaticamente"</li>
                                        <li>• <strong>Edge:</strong> Clique em "Permitir" quando aparecer o aviso de download</li>
                                        <li>• <strong>Safari:</strong> Vá em Preferências → Geral → Desmarque "Abrir arquivos seguros após download"</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Informações sobre Downloads Diretos */}
                <div className="mb-8">
                    <div className="bg-gradient-to-r from-emerald-500/20 to-blue-500/20 border border-emerald-500/30 rounded-2xl p-6 backdrop-blur-sm shadow-xl">
                        <div className="flex items-start space-x-4">
                            <div className="flex-shrink-0">
                                <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-full flex items-center justify-center">
                                    <Download className="h-6 w-6 text-white" />
                                </div>
                            </div>
                            <div className="flex-1">
                                <h3 className="text-lg font-semibold text-emerald-300 mb-2">
                                    📁 Downloads Diretos com Nomes Originais
                                </h3>
                                <p className="text-emerald-200 mb-4 leading-relaxed">
                                    O sistema agora baixa os arquivos MP3 diretamente com seus nomes originais do Contabo Storage!
                                    Não há mais criação automática de pastas por estilo - os arquivos são salvos exatamente como estão no servidor.
                                </p>
                                <div className="bg-black/20 rounded-lg p-4">
                                    <h4 className="font-semibold text-emerald-300 mb-2">🎯 Como Funciona:</h4>
                                    <div className="text-emerald-100 text-sm space-y-2">
                                        <div className="font-mono bg-black/30 px-3 py-2 rounded">
                                            📁 Downloads/
                                            <br />├── nome_original_arquivo1.mp3
                                            <br />├── nome_original_arquivo2.mp3
                                            <br />├── nome_original_arquivo3.mp3
                                            <br />└── nome_original_arquivo4.mp3
                                        </div>
                                        <p className="mt-2 text-xs opacity-75">
                                            💡 Os arquivos mantêm seus nomes originais do Contabo Storage
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Estatísticas Épicas */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 backdrop-blur-sm rounded-2xl p-6 text-center border border-blue-500/30 shadow-2xl hover:shadow-blue-500/25 transition-all duration-300 transform hover:scale-105">
                        <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                            <Music className="h-8 w-8 text-white" />
                        </div>
                        <h3 className="text-4xl font-black text-blue-300 mb-2">{totalTracks}</h3>
                        <p className="text-blue-200 font-medium">Total de Músicas</p>
                        <div className="mt-3 text-xs text-blue-300">🎵 Catálogo Completo</div>
                    </div>

                    <div className="bg-gradient-to-br from-green-500/20 to-green-600/20 backdrop-blur-sm rounded-2xl p-6 text-center border border-green-500/30 shadow-2xl hover:shadow-green-500/25 transition-all duration-300 transform hover:scale-105">
                        <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                            <Filter className="h-8 w-8 text-white" />
                        </div>
                        <h3 className="text-4xl font-black text-green-300 mb-2">{totalStyles}</h3>
                        <p className="text-green-200 font-medium">Estilos Diferentes</p>
                        <div className="mt-3 text-xs text-green-300">🎯 Variedade Musical</div>
                    </div>

                    <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 backdrop-blur-sm rounded-2xl p-6 text-center border border-purple-500/30 shadow-2xl hover:shadow-purple-500/25 transition-all duration-300 transform hover:scale-105">
                        <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                            <FileAudio className="h-8 w-8 text-white" />
                        </div>
                        <h3 className="text-4xl font-black text-purple-300 mb-2">
                            {Object.values(tracksByStyle).reduce((acc, tracks) => acc + tracks.length, 0)}
                        </h3>
                        <p className="text-purple-200 font-medium">Músicas Disponíveis</p>
                        <div className="mt-3 text-xs text-purple-300">🎧 Prontas para Download</div>
                    </div>

                    <div className="bg-gradient-to-br from-emerald-500/20 to-emerald-600/20 backdrop-blur-sm rounded-2xl p-6 text-center border border-emerald-500/30 shadow-2xl hover:shadow-emerald-500/25 transition-all duration-300 transform hover:scale-105">
                        <div className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                            <Download className="h-8 w-8 text-white" />
                        </div>
                        <h3 className="text-4xl font-black text-emerald-300 mb-2">{downloadedTracks.size}</h3>
                        <p className="text-emerald-200 font-medium">Já Baixadas</p>
                        <div className="mt-3 text-xs text-emerald-300">💾 Progresso Salvo</div>
                    </div>
                </div>

                {/* Filtros Épicos */}
                <div className="bg-gradient-to-br from-slate-800/40 to-slate-700/40 backdrop-blur-sm rounded-2xl p-8 mb-8 border border-slate-600/30 shadow-2xl">
                    <h3 className="text-2xl font-bold text-white mb-6 flex items-center">
                        <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center mr-3 shadow-lg">
                            <Filter className="h-5 w-5 text-white" />
                        </div>
                        Filtros e Controles Avançados
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        <div>
                            <label className="block text-white text-sm font-medium mb-2">
                                🔍 Buscar por Estilo
                            </label>
                            <input
                                type="text"
                                placeholder="Digite o nome do estilo..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full px-4 py-3 rounded-lg border border-white/20 bg-white/10 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                            />
                        </div>
                        <div>
                            <label className="block text-white text-sm font-medium mb-2">
                                🎯 Filtrar por Estilo
                            </label>
                            <select
                                value={selectedStyle}
                                onChange={(e) => setSelectedStyle(e.target.value)}
                                className="w-full px-4 py-3 rounded-lg border border-white/20 bg-white/10 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                            >
                                <option value="all">Todos os Estilos</option>
                                {styleCounts.map((styleCount) => (
                                    <option key={styleCount.style} value={styleCount.style}>
                                        {styleCount.style} ({styleCount.count})
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-4">
                        <button
                            onClick={() => setExpandedStyles(new Set(Object.keys(tracksByStyle)))}
                            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-8 py-4 rounded-xl flex items-center space-x-3 transition-all transform hover:scale-105 shadow-2xl hover:shadow-blue-500/25 font-semibold"
                        >
                            <ChevronDown className="h-5 w-5" />
                            <span>Expandir Todos</span>
                        </button>
                        <button
                            onClick={() => setExpandedStyles(new Set())}
                            className="bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 text-white px-8 py-4 rounded-xl flex items-center space-x-3 transition-all transform hover:scale-105 shadow-2xl hover:shadow-slate-500/25 font-semibold"
                        >
                            <ChevronUp className="h-5 w-5" />
                            <span>Recolher Todos</span>
                        </button>
                        <button
                            onClick={() => {
                                if (confirm('Tem certeza que deseja limpar o histórico de downloads?')) {
                                    localStorage.removeItem('contabo-download-history');
                                    setDownloadedTracks(new Set());
                                }
                            }}
                            className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-8 py-4 rounded-xl flex items-center space-x-3 transition-all transform hover:scale-105 shadow-2xl hover:shadow-red-500/25 font-semibold"
                        >
                            <span>🧹 Limpar Histórico</span>
                        </button>
                    </div>
                </div>

                {/* Lista de Estilos */}
                <div className="space-y-6">
                    {Object.entries(filteredTracksByStyle).map(([style, tracks]) => (
                        <div key={style} className="bg-gradient-to-br from-slate-800/40 to-slate-700/40 backdrop-blur-sm rounded-2xl overflow-hidden border border-slate-600/30 shadow-2xl hover:shadow-slate-500/25 transition-all duration-300">
                            <div className="px-8 py-6 bg-gradient-to-r from-slate-700/50 to-slate-600/50 flex items-center justify-between border-b border-slate-500/30">
                                <button
                                    onClick={() => toggleStyleExpansion(style)}
                                    className="flex items-center space-x-4 hover:bg-white/10 px-3 py-2 rounded-lg transition-all flex-1 text-left group"
                                >
                                    <div className="p-2 bg-blue-500/20 rounded-lg group-hover:bg-blue-500/30 transition-colors">
                                        <Music className="h-6 w-6 text-blue-400" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-white group-hover:text-blue-200 transition-colors">{style}</h3>
                                        <div className="flex items-center space-x-4 text-sm">
                                            <p className="text-blue-200">{tracks.length} músicas</p>
                                            <span className="text-green-400">
                                                {tracks.filter(track => downloadedTracks.has(track.id)).length} baixadas
                                            </span>
                                        </div>
                                    </div>
                                </button>

                                <div className="flex items-center space-x-3">
                                    <button
                                        onClick={() => downloadStyleBatch(style)}
                                        disabled={downloadingStyles.has(style) || batchDownloads[style]?.isActive}
                                        className="bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 disabled:from-slate-600 disabled:to-slate-700 text-white px-6 py-3 rounded-xl flex items-center space-x-3 transition-all transform hover:scale-105 shadow-2xl hover:shadow-emerald-500/25 disabled:transform-none disabled:shadow-none font-semibold"
                                        title="Baixar todas as músicas deste estilo em lotes de 10 MP3s individuais"
                                    >
                                        {downloadingStyles.has(style) ? (
                                            <>
                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                                <span>Preparando...</span>
                                            </>
                                        ) : batchDownloads[style]?.isActive ? (
                                            <>
                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                                <span>Baixando Lote...</span>
                                            </>
                                        ) : (
                                            <>
                                                <Archive className="h-4 w-4" />
                                                <span>Baixar Lote</span>
                                            </>
                                        )}
                                    </button>

                                    {/* Indicador de Progresso */}
                                    {batchDownloads[style]?.isActive && (
                                        <div className="flex items-center space-x-3 bg-white/10 px-3 py-2 rounded-lg">
                                            <div className="text-xs text-blue-200 font-medium">
                                                {batchDownloads[style].currentIndex} / {batchDownloads[style].tracks.length}
                                            </div>
                                            <div className="w-24 bg-gray-700 rounded-full h-2">
                                                <div
                                                    className="bg-gradient-to-r from-green-400 to-green-500 h-2 rounded-full transition-all duration-300"
                                                    style={{
                                                        width: `${(batchDownloads[style].currentIndex / batchDownloads[style].tracks.length) * 100}%`
                                                    }}
                                                ></div>
                                            </div>
                                            <div className="text-xs text-blue-200">
                                                Lote {Math.floor(batchDownloads[style].currentIndex / 10) + 1} de {Math.ceil(batchDownloads[style].tracks.length / 10)}
                                            </div>
                                        </div>
                                    )}

                                    <button
                                        onClick={() => toggleStyleExpansion(style)}
                                        className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                                    >
                                        {expandedStyles.has(style) ? (
                                            <ChevronUp className="h-6 w-6 text-white" />
                                        ) : (
                                            <ChevronDown className="h-6 w-6 text-white" />
                                        )}
                                    </button>
                                </div>
                            </div>

                            {expandedStyles.has(style) && (
                                <div className="p-8">
                                    {/* Header da Lista Épico */}
                                    <div className="mb-6 flex items-center justify-between">
                                        <h4 className="text-2xl font-bold text-white flex items-center">
                                            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center mr-3">
                                                <Music className="h-4 w-4 text-white" />
                                            </div>
                                            Lista de Músicas
                                        </h4>
                                        <div className="flex items-center space-x-6 text-sm">
                                            <span className="flex items-center space-x-2 text-emerald-300">
                                                <div className="w-4 h-4 bg-emerald-500 rounded-full shadow-lg"></div>
                                                <span className="font-medium">Já Baixada</span>
                                            </span>
                                            <span className="flex items-center space-x-2 text-blue-300">
                                                <div className="w-4 h-4 bg-blue-500 rounded-full shadow-lg"></div>
                                                <span className="font-medium">Disponível</span>
                                            </span>
                                        </div>
                                    </div>

                                    {/* Lista em Tabela Épica */}
                                    <div className="bg-gradient-to-br from-slate-900/60 to-slate-800/60 rounded-2xl overflow-hidden border border-slate-600/30 shadow-2xl">
                                        <div className="overflow-x-auto">
                                            <table className="w-full">
                                                <thead>
                                                    <tr className="bg-gradient-to-r from-slate-700/80 to-slate-600/80 border-b border-slate-500/30">
                                                        <th className="px-6 py-4 text-left text-sm font-bold text-purple-300 uppercase tracking-wider">
                                                            #
                                                        </th>
                                                        <th className="px-6 py-4 text-left text-sm font-bold text-purple-300 uppercase tracking-wider">
                                                            Música
                                                        </th>
                                                        <th className="px-6 py-4 text-left text-sm font-bold text-purple-300 uppercase tracking-wider">
                                                            Artista
                                                        </th>
                                                        <th className="px-6 py-4 text-left text-sm font-bold text-purple-300 uppercase tracking-wider">
                                                            Pool
                                                        </th>
                                                        <th className="px-6 py-4 text-left text-sm font-bold text-purple-300 uppercase tracking-wider">
                                                            Data
                                                        </th>
                                                        <th className="px-6 py-4 text-left text-sm font-bold text-purple-300 uppercase tracking-wider">
                                                            Status
                                                        </th>
                                                        <th className="px-6 py-4 text-left text-sm font-bold text-purple-300 uppercase tracking-wider">
                                                            Ações
                                                        </th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-white/10">
                                                    {tracks.map((track, index) => (
                                                        <tr
                                                            key={track.id}
                                                            className={`hover:bg-slate-700/30 transition-all duration-300 ${downloadedTracks.has(track.id) ? 'bg-emerald-500/10' : ''
                                                                }`}
                                                        >
                                                            <td className="px-4 py-3 text-sm text-gray-300">
                                                                {index + 1}
                                                            </td>
                                                            <td className="px-4 py-3">
                                                                <div className="flex items-center space-x-3">
                                                                    <img
                                                                        src={track.imageUrl || '/images/default-album.jpg'}
                                                                        alt={track.songName}
                                                                        className="w-10 h-10 rounded object-cover"
                                                                        onError={(e) => {
                                                                            const target = e.target as HTMLImageElement;
                                                                            target.src = '/images/default-album.jpg';
                                                                        }}
                                                                    />
                                                                    <div>
                                                                        <div className="text-sm font-medium text-white">
                                                                            {track.songName}
                                                                        </div>
                                                                        <div className="text-xs text-gray-400">
                                                                            {track.style}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td className="px-4 py-3 text-sm text-blue-200">
                                                                {track.artist}
                                                            </td>
                                                            <td className="px-4 py-3 text-sm text-gray-300">
                                                                {track.pool}
                                                            </td>
                                                            <td className="px-4 py-3 text-sm text-gray-300">
                                                                {new Date(track.releaseDate).toLocaleDateString('pt-BR')}
                                                            </td>
                                                            <td className="px-4 py-3">
                                                                {downloadedTracks.has(track.id) ? (
                                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                                        <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                                                                        Baixada
                                                                    </span>
                                                                ) : (
                                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                                        <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                                                                        Disponível
                                                                    </span>
                                                                )}
                                                            </td>
                                                            <td className="px-4 py-3">
                                                                {downloadedTracks.has(track.id) ? (
                                                                    <button
                                                                        disabled
                                                                        className="bg-gray-500 text-white px-3 py-1.5 rounded text-sm flex items-center space-x-2 cursor-not-allowed opacity-50"
                                                                    >
                                                                        <Download className="h-4 w-4" />
                                                                        <span>Já Baixada</span>
                                                                    </button>
                                                                ) : (
                                                                    <button
                                                                        onClick={() => downloadTrack(track)}
                                                                        disabled={downloadingTracks.has(track.id)}
                                                                        className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white px-3 py-1.5 rounded text-sm flex items-center space-x-2 transition-colors"
                                                                    >
                                                                        {downloadingTracks.has(track.id) ? (
                                                                            <>
                                                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                                                                <span>Baixando...</span>
                                                                            </>
                                                                        ) : (
                                                                            <>
                                                                                <Download className="h-4 w-4" />
                                                                                <span>Baixar</span>
                                                                            </>
                                                                        )}
                                                                    </button>
                                                                )}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {Object.keys(filteredTracksByStyle).length === 0 && (
                    <div className="text-center py-12">
                        <div className="w-24 h-24 bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl">
                            <Music className="h-12 w-12 text-purple-400" />
                        </div>
                        <p className="text-gray-300 text-2xl font-semibold">Nenhum estilo encontrado com os filtros atuais</p>
                        <p className="text-gray-400 text-lg mt-2">Tente ajustar os filtros de busca</p>
                    </div>
                )}
            </div>
        </div>


    );
}
