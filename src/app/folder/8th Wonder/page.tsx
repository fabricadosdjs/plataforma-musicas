"use client";

import { useEffect, useState, useCallback, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import Header from '@/components/layout/Header';
import MusicList from '@/components/music/MusicList';
import { Track } from '@/types/track';
import { Download, Heart, Play, TrendingUp, Users, Calendar, X, RefreshCw, ArrowLeft, Folder, Music, Star, Filter } from 'lucide-react';
import { useToastContext } from '@/context/ToastContext';
import { useRouter } from 'next/navigation';

// Dados específicos do folder 8th Wonder
const EIGHTH_WONDER_DATA = {
    name: '8th Wonder',
    description: 'O 8th Wonder é um pool de música eletrônica que reúne faixas exclusivas e atualizações constantes para DJs, focando em sons modernos e de alta qualidade para sets profissionais. Com uma curadoria atenta, o pool oferece desde lançamentos quentes até remixes raros, garantindo repertório atualizado para qualquer estilo dentro da música eletrônica.',
    image: 'https://i.ibb.co/qYHcpXrb/8th-Wonder-Promo.png',
    stats: {
        totalTracks: 150,
        totalDownloads: 25000,
        totalLikes: 8500,
        totalPlays: 125000,
        uniqueArtists: 45,
        uniquePools: 8,
        latestRelease: new Date('2024-12-19')
    },
    styles: ['Deep House', 'Techno', 'Trance', 'Progressive House', 'Melodic Techno'],
    features: [
        'Faixas exclusivas para DJs',
        'Atualizações semanais',
        'Curadoria profissional',
        'Qualidade de estúdio',
        'Suporte a múltiplos formatos'
    ]
};

export default function EighthWonderPage() {
    const { showToast } = useToastContext();
    const { data: session } = useSession();
    const router = useRouter();

    const [tracks, setTracks] = useState<Track[]>([]);
    const [loading, setLoading] = useState(true);
    const [downloadedTrackIds, setDownloadedTrackIds] = useState<number[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchLoading, setSearchLoading] = useState(false);
    const [showFiltersModal, setShowFiltersModal] = useState(false);

    // Estado para download em lote
    const [isBatchDownloading, setIsBatchDownloading] = useState(false);
    const [batchProgress, setBatchProgress] = useState({
        total: 0,
        downloaded: 0,
        failed: 0,
        skipped: 0,
        currentTrack: '',
        failedDetails: [] as Array<{ trackName: string, reason: string }>
    });

    // Verificar se o usuário é VIP
    const isVip = session?.user?.is_vip || session?.user?.email === 'edersonleonardo@nexorrecords.com.br';

    // Carregar tracks do folder
    useEffect(() => {
        const loadTracks = async () => {
            try {
                setLoading(true);
                const response = await fetch('/api/tracks/folder/8th%20Wonder');
                if (response.ok) {
                    const data = await response.json();
                    setTracks(data.tracks || []);
                }
            } catch (error) {
                console.error('Erro ao carregar tracks:', error);
                showToast('Erro ao carregar músicas', 'error');
            } finally {
                setLoading(false);
            }
        };

        loadTracks();
    }, [showToast]);

    // Função de busca
    const performSearch = useCallback(async (query: string) => {
        if (!query.trim()) return;

        try {
            setSearchLoading(true);
            const response = await fetch(`/api/tracks/search?q=${encodeURIComponent(query)}&folder=8th%20Wonder`);
            if (response.ok) {
                const data = await response.json();
                setTracks(data.tracks || []);
                showToast(`Encontradas ${data.tracks?.length || 0} músicas para "${query}"`, 'success');
            }
        } catch (error) {
            console.error('Erro na busca:', error);
            showToast('Erro ao realizar busca', 'error');
        } finally {
            setSearchLoading(false);
        }
    }, [showToast]);

    // Limpar busca
    const clearSearch = useCallback(() => {
        setSearchQuery('');
        // Recarregar tracks originais
        window.location.reload();
    }, []);

    // Download em lote
    const handleBatchDownload = useCallback(async (type: 'new' | 'all') => {
        if (!isVip) {
            showToast('Apenas usuários VIP podem fazer download em lote', 'warning');
            return;
        }

        const tracksToDownload = type === 'new'
            ? tracks.filter(track => !downloadedTrackIds.includes(track.id))
            : tracks;

        if (tracksToDownload.length === 0) {
            showToast('Nenhuma música para download', 'info');
            return;
        }

        setIsBatchDownloading(true);
        setBatchProgress({
            total: tracksToDownload.length,
            downloaded: 0,
            failed: 0,
            skipped: 0,
            currentTrack: '',
            failedDetails: []
        });

        for (const track of tracksToDownload) {
            setBatchProgress(prev => ({ ...prev, currentTrack: track.songName }));

            try {
                // Simular download
                await new Promise(resolve => setTimeout(resolve, 1000));

                if (Math.random() > 0.1) { // 90% de sucesso
                    setBatchProgress(prev => ({
                        ...prev,
                        downloaded: prev.downloaded + 1
                    }));
                    setDownloadedTrackIds(prev => [...prev, track.id]);
                } else {
                    setBatchProgress(prev => ({
                        ...prev,
                        failed: prev.failed + 1,
                        failedDetails: [...prev.failedDetails, {
                            trackName: track.songName,
                            reason: 'Erro de conexão'
                        }]
                    }));
                }
            } catch (error) {
                setBatchProgress(prev => ({
                    ...prev,
                    failed: prev.failed + 1,
                    failedDetails: [...prev.failedDetails, {
                        trackName: track.songName,
                        reason: 'Erro desconhecido'
                    }]
                }));
            }
        }

        setIsBatchDownloading(false);
        showToast(`Download em lote concluído: ${batchProgress.downloaded} baixadas, ${batchProgress.failed} falharam`, 'success');
    }, [tracks, downloadedTrackIds, isVip, showToast, batchProgress]);

    // Voltar para página anterior
    const goBack = useCallback(() => {
        router.back();
    }, [router]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-[#0a0a0a] via-[#1a1a1a] to-[#0a0a0a]">
                <Header />
                <div className="flex items-center justify-center min-h-[60vh]">
                    <div className="text-center">
                        <RefreshCw className="animate-spin mx-auto mb-4 text-[#1db954] w-12 h-12" />
                        <p className="text-white text-lg">Carregando 8th Wonder...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#0a0a0a] via-[#1a1a1a] to-[#0a0a0a]">
            <Header />

            {/* Hero Section */}
            <div className="relative w-full bg-cover bg-center bg-no-repeat" style={{ backgroundImage: `url(${EIGHTH_WONDER_DATA.image})` }}>
                <div className="absolute inset-0 bg-black/70"></div>

                <div className="relative z-10 w-full max-w-[95%] mx-auto px-2 sm:px-4 md:px-6 lg:px-8 xl:px-10 2xl:px-12 py-16 sm:py-20">
                    <div className="text-center">
                        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-white mb-6 leading-tight">
                            8TH WONDER
                        </h1>

                        <div className="max-w-4xl mx-auto mb-8">
                            <div className="bg-[#181818]/90 backdrop-blur-sm rounded-xl p-6 border border-[#282828] mb-6">
                                <div className="text-[#b3b3b3] text-sm sm:text-base leading-relaxed space-y-4 text-justify">
                                    <p>{EIGHTH_WONDER_DATA.description}</p>
                                    <p className="text-[#1db954] font-semibold text-base sm:text-lg text-center">
                                        Pool exclusivo para DJs profissionais!
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Estatísticas */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 max-w-2xl mx-auto">
                            <div className="bg-[#181818]/90 backdrop-blur-sm rounded-xl p-4 border border-[#282828]">
                                <div className="text-2xl sm:text-3xl font-bold text-[#1db954] mb-1">
                                    {EIGHTH_WONDER_DATA.stats.totalTracks}
                                </div>
                                <div className="text-[#b3b3b3] text-xs sm:text-sm">Músicas</div>
                            </div>

                            <div className="bg-[#181818]/90 backdrop-blur-sm rounded-xl p-4 border border-[#282828]">
                                <div className="text-2xl sm:text-3xl font-bold text-[#1db954] mb-1">
                                    {EIGHTH_WONDER_DATA.stats.totalDownloads.toLocaleString()}
                                </div>
                                <div className="text-[#b3b3b3] text-xs sm:text-sm">Downloads</div>
                            </div>

                            <div className="bg-[#181818]/90 backdrop-blur-sm rounded-xl p-4 border border-[#282828]">
                                <div className="text-2xl sm:text-3xl font-bold text-[#1db954] mb-1">
                                    {EIGHTH_WONDER_DATA.stats.totalLikes.toLocaleString()}
                                </div>
                                <div className="text-[#b3b3b3] text-xs sm:text-sm">Curtidas</div>
                            </div>

                            <div className="bg-[#181818]/90 backdrop-blur-sm rounded-xl p-4 border border-[#282828]">
                                <div className="text-2xl sm:text-3xl font-bold text-[#1db954] mb-1">
                                    {EIGHTH_WONDER_DATA.stats.uniqueArtists}
                                </div>
                                <div className="text-[#b3b3b3] text-xs sm:text-sm">Artistas</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Seção de Busca e Filtros */}
            <div className="w-full max-w-[95%] mx-auto px-3 sm:px-6 md:px-8 mb-8">
                <div className="bg-[#181818] rounded-xl p-6 border border-[#282828]">
                    <div className="flex flex-col gap-4 w-full">
                        {/* Campo de Busca */}
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Buscar músicas do 8th Wonder..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && performSearch(searchQuery)}
                                className="w-full px-4 py-3 bg-[#282828] text-white rounded-lg border border-[#3e3e3e] focus:border-[#1db954] focus:outline-none transition-colors placeholder-[#b3b3b3] text-base"
                            />
                            {searchQuery && (
                                <button
                                    onClick={clearSearch}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#b3b3b3] hover:text-white transition-colors"
                                >
                                    <X size={20} />
                                </button>
                            )}
                        </div>

                        {/* Botões de Ação */}
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full">
                            <button
                                onClick={() => performSearch(searchQuery)}
                                disabled={searchLoading || !searchQuery.trim()}
                                className="px-4 py-3 bg-[#1db954] text-white rounded-lg hover:bg-[#1ed760] disabled:bg-[#535353] disabled:cursor-not-allowed transition h-12 w-full sm:w-auto min-w-[120px] text-sm sm:text-base font-medium shadow-lg"
                            >
                                {searchLoading ? "Buscando..." : "Buscar"}
                            </button>
                            <button
                                onClick={() => setShowFiltersModal(true)}
                                className="flex items-center justify-center gap-2 px-4 py-2 bg-[#282828] text-white rounded-lg hover:bg-[#3e3e3e] transition h-12 w-full sm:w-auto min-w-[120px] text-sm sm:text-base border border-[#3e3e3e]"
                            >
                                <Filter size={18} /> Filtros
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Informações do Folder */}
            <div className="w-full max-w-[95%] mx-auto px-3 sm:px-6 md:px-8 mb-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Estilos Musicais */}
                    <div className="bg-[#181818] rounded-xl p-6 border border-[#282828]">
                        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                            <Music className="text-[#1db954]" size={24} />
                            Estilos Musicais
                        </h3>
                        <div className="flex flex-wrap gap-2">
                            {EIGHTH_WONDER_DATA.styles.map((style, index) => (
                                <span
                                    key={index}
                                    className="px-3 py-2 bg-[#282828] text-[#1db954] rounded-lg text-sm font-medium border border-[#3e3e3e]"
                                >
                                    {style}
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Características */}
                    <div className="bg-[#181818] rounded-xl p-6 border border-[#282828]">
                        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                            <Star className="text-[#1db954]" size={24} />
                            Características
                        </h3>
                        <ul className="space-y-2">
                            {EIGHTH_WONDER_DATA.features.map((feature, index) => (
                                <li key={index} className="flex items-center gap-2 text-[#b3b3b3]">
                                    <div className="w-2 h-2 bg-[#1db954] rounded-full"></div>
                                    {feature}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>

            {/* Botões de Download em Lote */}
            {isVip && (
                <div className="w-full max-w-[95%] mx-auto px-3 sm:px-6 md:px-8 mb-8">
                    <div className="bg-[#181818] rounded-xl p-6 border border-[#282828]">
                        <h3 className="text-xl font-bold text-white mb-4">Download em Lote</h3>
                        <div className="flex flex-col sm:flex-row gap-3">
                            <button
                                onClick={() => handleBatchDownload('new')}
                                disabled={isBatchDownloading}
                                className="flex items-center justify-center gap-2 px-6 py-3 bg-[#1db954] text-white rounded-lg hover:bg-[#1ed760] disabled:bg-[#535353] disabled:cursor-not-allowed transition font-medium"
                            >
                                <Download size={18} />
                                {isBatchDownloading ? 'Baixando...' : 'Baixar Novas'}
                            </button>
                            <button
                                onClick={() => handleBatchDownload('all')}
                                disabled={isBatchDownloading}
                                className="flex items-center justify-center gap-2 px-6 py-3 bg-[#282828] text-white rounded-lg hover:bg-[#3e3e3e] disabled:bg-[#535353] disabled:cursor-not-allowed transition font-medium border border-[#3e3e3e]"
                            >
                                <Download size={18} />
                                {isBatchDownloading ? 'Baixando...' : 'Baixar Todas'}
                            </button>
                        </div>

                        {/* Progresso do Download */}
                        {isBatchDownloading && (
                            <div className="mt-4 p-4 bg-[#282828] rounded-lg">
                                <div className="flex justify-between text-sm text-[#b3b3b3] mb-2">
                                    <span>Progresso: {batchProgress.downloaded}/{batchProgress.total}</span>
                                    <span>Falharam: {batchProgress.failed}</span>
                                </div>
                                <div className="w-full bg-[#3e3e3e] rounded-full h-2">
                                    <div
                                        className="bg-[#1db954] h-2 rounded-full transition-all duration-300"
                                        style={{ width: `${(batchProgress.downloaded / batchProgress.total) * 100}%` }}
                                    ></div>
                                </div>
                                {batchProgress.currentTrack && (
                                    <p className="text-[#1db954] text-sm mt-2">Baixando: {batchProgress.currentTrack}</p>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Lista de Músicas */}
            <div className="w-full max-w-[95%] mx-auto px-3 sm:px-6 md:px-8 mb-8">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                        <Folder className="text-[#1db954]" size={28} />
                        Músicas do 8th Wonder
                    </h2>
                    <button
                        onClick={goBack}
                        className="flex items-center gap-2 px-4 py-2 bg-[#282828] text-white rounded-lg hover:bg-[#3e3e3e] transition"
                    >
                        <ArrowLeft size={18} />
                        Voltar
                    </button>
                </div>

                {tracks.length > 0 ? (
                    <MusicList
                        tracks={tracks}
                        showDate={false}
                        downloadedTrackIds={downloadedTrackIds}
                        setDownloadedTrackIds={setDownloadedTrackIds}
                    />
                ) : (
                    <div className="text-center py-12">
                        <Music className="mx-auto mb-4 text-[#1db954] w-16 h-16 opacity-50" />
                        <p className="text-[#b3b3b3] text-lg">Nenhuma música encontrada</p>
                    </div>
                )}
            </div>
        </div>
    );
}
