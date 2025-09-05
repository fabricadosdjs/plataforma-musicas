"use client";

// Força renderização dinâmica para evitar erro de pré-renderização
export const dynamic = 'force-dynamic';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Header from '@/components/layout/Header';
import { useDownloadsCache } from '@/hooks/useDownloadsCache';
import MusicList from '@/components/music/MusicList';
import InlineDownloadProgress from '@/components/music/InlineDownloadProgress';
import { Track } from '@/types/track';
import { Download, Heart, Play, TrendingUp, Users, Calendar, X, RefreshCw, ArrowLeft } from 'lucide-react';
import BatchDownloadButtons from '@/components/download/BatchDownloadButtons';
import { useGlobalDownload } from '@/context/GlobalDownloadContext';

import { useToastContext } from '@/context/ToastContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

// Função para obter informações sobre artistas baseada em dados reais
const getArtistInfo = (artistName: string, stats: any): string => {
    // Se não temos estatísticas ou não há tracks, mostrar mensagem padrão
    if (!stats || stats.totalTracks === 0) {
        return 'Não obtivemos informações detalhadas sobre este artista.';
    }

    // Gerar informações baseadas nos dados reais
    const totalTracks = stats.totalTracks || 0;
    const totalDownloads = stats.totalDownloads || 0;
    const totalLikes = stats.totalLikes || 0;
    const uniqueGenres = stats.uniqueGenres || 0;
    const uniquePools = stats.uniquePools || 0;

    // Criar descrição baseada nos dados reais
    let description = `${artistName} é um artista com ${totalTracks} música${totalTracks !== 1 ? 's' : ''} em nossa plataforma. `;

    if (totalDownloads > 0) {
        description += `Suas músicas já foram baixadas ${totalDownloads} vez${totalDownloads !== 1 ? 'es' : ''}. `;
    }

    if (totalLikes > 0) {
        description += `Recebeu ${totalLikes} curtida${totalLikes !== 1 ? 's' : ''} dos usuários. `;
    }

    if (uniqueGenres > 0) {
        description += `Seu trabalho abrange ${uniqueGenres} estilo${uniqueGenres !== 1 ? 's' : ''} musical${uniqueGenres !== 1 ? 'is' : ''}. `;
    }

    if (uniquePools > 0) {
        description += `Suas músicas estão disponíveis em ${uniquePools} gravadora${uniquePools !== 1 ? 's' : ''} ou plataforma${uniquePools !== 1 ? 's' : ''}.`;
    }

    return description;
};

export default function ArtistPage() {
    const downloadsCache = useDownloadsCache();
    const params = useParams();
    const artistName = params?.artistName as string;
    const decodedArtistName = decodeURIComponent(artistName);
    const { showToast } = useToastContext();
    // Hook global de download
    const globalDownload = useGlobalDownload();
    const { data: session } = useSession();

    const [tracks, setTracks] = useState<Track[]>([]);
    const [loading, setLoading] = useState(true);
    // Usar cache global igual ao /new para atualização em tempo real
    const downloadedTrackIds = downloadsCache.downloadedTrackIds;
    const markAsDownloaded = downloadsCache.markAsDownloaded;
    const [stats, setStats] = useState({
        totalDownloads: 0,
        totalLikes: 0,
        totalPlays: 0,
        uniqueGenres: 0,
        uniquePools: 0,
        latestRelease: null as Date | null,
        totalTracks: 0
    });

    // Estado para filtros
    const [selectedStyle, setSelectedStyle] = useState<string | null>(null);
    const [filteredTracks, setFilteredTracks] = useState<Track[]>([]);

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
    const [abortController, setAbortController] = useState<AbortController | null>(null);

    // Estados para modal de confirmação mobile
    const [showMobileConfirmModal, setShowMobileConfirmModal] = useState(false);
    const [pendingDownloadAction, setPendingDownloadAction] = useState<{
        type: 'new' | 'all';
        tracks: Track[];
        callback: () => void;
    } | null>(null);

    // Verificar se o usuário é VIP (simples)
    const isVip = true; // Por enquanto, sempre true para teste

    // Função para mostrar modal de confirmação mobile
    const showMobileDownloadConfirmation = (type: 'new' | 'all', tracks: Track[], callback: () => void) => {
        if (window.innerWidth < 640) {
            setPendingDownloadAction({ type, tracks, callback });
            setShowMobileConfirmModal(true);
        } else {
            // Em desktop, executa diretamente
            callback();
        }
    };

    // Função para confirmar download mobile
    const confirmMobileDownload = () => {
        if (pendingDownloadAction) {
            pendingDownloadAction.callback();
            setShowMobileConfirmModal(false);
            setPendingDownloadAction(null);
        }
    };

    // Função para cancelar download mobile
    const cancelMobileDownload = () => {
        setShowMobileConfirmModal(false);
        setPendingDownloadAction(null);
    };

    // Obter estilos únicos disponíveis
    const availableStyles = useMemo(() => {
        if (!tracks.length) return [];
        return Array.from(new Set(tracks.map(track => track.style).filter(Boolean))).sort();
    }, [tracks]);

    // Filtrar tracks baseado no estilo selecionado
    useEffect(() => {
        if (selectedStyle) {
            const filtered = tracks.filter(track => track.style === selectedStyle);
            setFilteredTracks(filtered);
        } else {
            setFilteredTracks(tracks);
        }
    }, [selectedStyle, tracks]);

    // Estado para contador em tempo real
    const [availableTracksCount, setAvailableTracksCount] = useState(0);

    // Calcular quantas músicas estão disponíveis para download
    const getAvailableTracksCount = useCallback(() => {
        if (!filteredTracks.length) return 0;

        const availableCount = filteredTracks.filter(track => {
            return !downloadedTrackIds.includes(track.id);
        }).length;

        console.log('🔍 getAvailableTracksCount:', {
            totalTracks: filteredTracks.length,
            downloadedIds: downloadedTrackIds.length,
            availableCount
        });

        return availableCount;
    }, [filteredTracks, downloadedTrackIds]);

    // Função para atualizar contador automaticamente
    const updateAvailableTracksCount = useCallback(() => {
        const count = getAvailableTracksCount();
        setAvailableTracksCount(count);
        console.log('🔄 Contador atualizado automaticamente:', count);
    }, [getAvailableTracksCount]);

    // Atualizar contador sempre que downloadedTrackIds mudar
    useEffect(() => {
        updateAvailableTracksCount();
    }, [downloadedTrackIds, updateAvailableTracksCount]);

    // Atualizar contador sempre que filteredTracks mudar
    useEffect(() => {
        updateAvailableTracksCount();
    }, [filteredTracks, updateAvailableTracksCount]);

    // Função para obter tracks disponíveis para download
    const getAvailableTracks = useCallback(() => {
        if (!filteredTracks.length) return [];

        const availableTracks = filteredTracks.filter(track => {
            return !downloadedTrackIds.includes(track.id);
        });

        console.log('🔍 getAvailableTracks:', {
            totalTracks: filteredTracks.length,
            downloadedIds: downloadedTrackIds.length,
            availableTracks: availableTracks.length
        });

        return availableTracks;
    }, [filteredTracks, downloadedTrackIds]);

    useEffect(() => {
        syncDownloadedTrackIds();
    }, []);

    // Função para marcar como baixado igual ao /new
    const handleDownloadedTrackIdsChange = (newIds: number[] | ((prev: number[]) => number[])) => {
        if (typeof newIds === 'function') {
            const result = newIds(downloadedTrackIds);
            if (Array.isArray(result) && result.length > 0) {
                markAsDownloaded(result[result.length - 1]);
            }
        } else if (Array.isArray(newIds) && newIds.length > 0) {
            markAsDownloaded(newIds[newIds.length - 1]);
        }
    };

    // Função para sincronizar estado com localStorage
    const syncDownloadedTrackIds = () => {
        const saved = localStorage.getItem('downloadedTrackIds');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                if (Array.isArray(parsed)) {
                    parsed.forEach((id: number) => markAsDownloaded(id));
                    console.log('🔄 Sincronizando downloadedTrackIds com localStorage:', parsed.length, 'IDs');
                }
            } catch (error) {
                console.error('❌ Erro ao sincronizar downloadedTrackIds:', error);
            }
        }
    };

    useEffect(() => {
        const fetchArtistTracks = async () => {
            try {
                setLoading(true);

                // Buscar tracks e estatísticas em paralelo
                const [tracksResponse, statsResponse] = await Promise.all([
                    fetch(`/api/tracks/artist/${encodeURIComponent(decodedArtistName)}`),
                    fetch(`/api/tracks/artist/${encodeURIComponent(decodedArtistName)}/stats`)
                ]);

                if (tracksResponse.ok) {
                    const tracksData = await tracksResponse.json();
                    const tracks = Array.isArray(tracksData.tracks) ? tracksData.tracks : [];
                    setTracks(tracks);
                    setFilteredTracks(tracks);

                    // Atualizar totalTracks nas estatísticas
                    setStats(prev => ({ ...prev, totalTracks: tracks.length }));
                } else {
                    setTracks([]);
                    setStats(prev => ({ ...prev, totalTracks: 0 }));
                }

                if (statsResponse.ok) {
                    const statsData = await statsResponse.json();
                    setStats(prev => ({
                        ...prev,
                        totalDownloads: statsData.totalDownloads || 0,
                        totalLikes: statsData.totalLikes || 0,
                        totalPlays: statsData.totalPlays || 0,
                        uniqueGenres: statsData.uniqueGenres || 0,
                        uniquePools: statsData.uniquePools || 0,
                        latestRelease: statsData.latestRelease ? new Date(statsData.latestRelease) : null,
                        totalTracks: tracks.length // Manter sincronizado com o número de tracks
                    }));
                }
            } catch (e) {
                console.error('Erro ao buscar dados do artista:', e);
                setTracks([]);
                setStats(prev => ({ ...prev, totalTracks: 0 }));
            } finally {
                setLoading(false);
            }
        };
        if (decodedArtistName) fetchArtistTracks();
    }, [decodedArtistName]);

    const goBack = () => {
        window.history.back();
    };

    return (
        <div className="min-h-screen bg-[#121212] overflow-x-hidden">
            {/* Header Fixo */}
            <Header />

            {/* Conteúdo Principal - Tela Cheia */}
            <div className="pt-12 lg:pt-16">
                {/* Header do Artista */}
                <div className="w-full bg-gradient-to-b from-[#1db954]/20 to-transparent">
                    <div className="w-full max-w-[95%] mx-auto px-2 sm:px-4 md:px-6 lg:px-8 xl:px-10 2xl:px-12 py-8 sm:py-12">
                        {/* Botão Voltar */}
                        <button
                            onClick={goBack}
                            className="flex items-center gap-2 text-[#b3b3b3] hover:text-white transition-colors mb-6"
                        >
                            <ArrowLeft className="w-5 h-5" />
                            Voltar
                        </button>

                        {/* Informações do Artista */}
                        <div className="text-center">
                            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4">
                                {decodedArtistName}
                            </h1>

                            {/* Informações Adicionais do Artista */}
                            <div className="max-w-3xl mx-auto mb-8">
                                <div className="bg-[#181818] rounded-xl p-6 border border-[#282828] mb-6">
                                    <div className="text-[#b3b3b3] text-sm leading-relaxed text-justify">
                                        {getArtistInfo(decodedArtistName, stats)}
                                    </div>
                                </div>
                            </div>

                            {/* Estatísticas */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 max-w-3xl mx-auto">
                                <div className="bg-[#181818] rounded-xl p-3 sm:p-4 border border-[#282828]">
                                    <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-[#1db954] mb-1">
                                        {filteredTracks.length}
                                    </div>
                                    <div className="text-[#b3b3b3] text-xs sm:text-sm">
                                        {filteredTracks.length === 1 ? 'Música' : 'Músicas'}
                                        {selectedStyle && (
                                            <div className="text-[10px] sm:text-xs text-[#1db954] mt-1">
                                                de {selectedStyle.toUpperCase()}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="bg-[#181818] rounded-xl p-3 sm:p-4 border border-[#282828]">
                                    <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-[#1db954] mb-1">
                                        {stats.totalDownloads}
                                    </div>
                                    <div className="text-[#b3b3b3] text-xs sm:text-sm">Downloads</div>
                                </div>

                                <div className="bg-[#181818] rounded-xl p-3 sm:p-4 border border-[#282828]">
                                    <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-[#1db954] mb-1">
                                        {stats.totalLikes}
                                    </div>
                                    <div className="text-[#b3b3b3] text-xs sm:text-sm">Curtidas</div>
                                </div>

                                <div className="bg-[#181818] rounded-xl p-3 sm:p-4 border border-[#282828]">
                                    <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-[#1db954] mb-1">
                                        {stats.uniqueGenres}
                                    </div>
                                    <div className="text-[#b3b3b3] text-xs sm:text-sm">Estilos</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filtros por Estilo */}
                {availableStyles.length > 0 && (
                    <div className="w-full max-w-[95%] mx-auto px-2 sm:px-4 md:px-6 lg:px-8 xl:px-10 2xl:px-12 py-4">
                        <div className="bg-[#181818] rounded-xl p-4 border border-[#282828]">
                            <div className="flex items-center gap-3 mb-4">
                                <span className="text-white font-semibold">🎵 Filtrar por Estilo:</span>
                                <button
                                    onClick={() => setSelectedStyle(null)}
                                    className={`px-3 py-1 rounded-lg text-sm font-medium transition-all duration-200 ${selectedStyle === null
                                        ? 'bg-[#1db954] text-white'
                                        : 'bg-[#282828] text-[#b3b3b3] hover:bg-[#3e3e3e] hover:text-white'
                                        }`}
                                >
                                    Todos ({tracks.length})
                                </button>
                            </div>
                            <div className="flex flex-wrap gap-2 mb-4">
                                {availableStyles.map((style) => (
                                    <button
                                        key={style}
                                        onClick={() => setSelectedStyle(style)}
                                        className={`px-3 py-1 rounded-lg text-sm font-medium transition-all duration-200 ${selectedStyle === style
                                            ? 'bg-[#1db954] text-white'
                                            : 'bg-[#282828] text-[#b3b3b3] hover:bg-[#3e3e3e] hover:text-white'
                                            }`}
                                    >
                                        {style} ({tracks.filter(t => t.style === style).length})
                                    </button>
                                ))}
                            </div>
                            {/* Botões de Download em Massa (agora dentro da seção de filtros) */}
                            <BatchDownloadButtons
                                tracks={filteredTracks}
                                downloadedTrackIds={downloadedTrackIds}
                                batchName={`Artista ${decodedArtistName}`}
                                sourcePageName={`Artista ${decodedArtistName}`}
                                isGlobal={true}
                                showNewTracksOnly={true}
                                showAllTracks={true}
                                showStyleDownload={false}
                                className="mt-2"
                            />
                        </div>
                    </div>
                )}

                {/* Lista de Músicas */}
                <div className="w-full max-w-[95%] mx-auto px-2 sm:px-4 md:px-6 lg:px-8 xl:px-10 2xl:px-12 py-8">
                    {loading ? (
                        <div className="flex items-center justify-center py-16">
                            <div className="text-center">
                                <div className="animate-spin w-12 h-12 border-4 border-[#1db954] border-t-transparent rounded-full mx-auto mb-4"></div>
                                <p className="text-[#b3b3b3] text-lg">
                                    Carregando músicas de {decodedArtistName}...
                                </p>
                            </div>
                        </div>
                    ) : filteredTracks.length === 0 ? (
                        <div className="text-center py-16">
                            <div className="bg-[#181818] rounded-2xl p-8 max-w-md mx-auto border border-[#282828]">
                                <div className="text-6xl mb-4">🎵</div>
                                <h3 className="text-xl font-bold text-white mb-2">
                                    Nenhuma música encontrada
                                </h3>
                                <p className="text-[#b3b3b3] mb-6">
                                    {selectedStyle
                                        ? `Não encontramos músicas do estilo "${selectedStyle}" do artista "${decodedArtistName}".`
                                        : `Não encontramos músicas para o artista "${decodedArtistName}".`
                                    }
                                </p>
                                <button
                                    onClick={goBack}
                                    className="px-6 py-2 bg-[#1db954] text-white rounded-lg hover:bg-[#1ed760] transition-colors font-medium"
                                >
                                    Voltar
                                </button>
                            </div>
                        </div>
                    ) : (
                        <MusicList
                            tracks={filteredTracks}
                            downloadedTrackIds={downloadedTrackIds}
                            setDownloadedTrackIds={handleDownloadedTrackIdsChange}
                            showDate={true}
                        />
                    )}
                </div>
            </div>

            {/* Footer Simples */}
            <footer className="bg-black border-t border-gray-800 mt-20">
                <div className="max-w-[95%] mx-auto px-6 py-12">

                    {/* Conteúdo Principal */}
                    <div className="flex flex-col items-center gap-4">

                        {/* Logo e Nome */}
                        <div className="text-center">
                            <div className="flex items-center justify-center gap-3 mb-2">
                                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
                                    <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
                                    </svg>
                                </div>
                                <span className="text-2xl font-bold text-white">
                                    Nexor Records Pools
                                </span>
                            </div>
                        </div>

                        {/* Links */}
                        <div className="flex flex-wrap justify-center gap-6">
                            <Link href="/new" className="text-gray-400 hover:text-blue-400 transition-colors text-sm cursor-pointer select-text relative z-10 px-2 py-1" style={{ pointerEvents: 'auto' }}>
                                Novidades
                            </Link>
                            <Link href="/trending" className="text-gray-400 hover:text-blue-400 transition-colors text-sm cursor-pointer select-text relative z-10 px-2 py-1" style={{ pointerEvents: 'auto' }}>
                                Trending
                            </Link>
                            <Link href="/plans" className="text-gray-400 hover:text-blue-400 transition-colors text-sm cursor-pointer select-text relative z-10 px-2 py-1" style={{ pointerEvents: 'auto' }}>
                                Planos
                            </Link>
                            <Link href="/privacidade" className="text-gray-400 hover:text-blue-400 transition-colors text-sm cursor-pointer select-text relative z-10 px-2 py-1" style={{ pointerEvents: 'auto' }}>
                                Privacidade
                            </Link>
                            <Link href="/termos" className="text-gray-400 hover:text-blue-400 transition-colors text-sm cursor-pointer select-text relative z-10 px-2 py-1" style={{ pointerEvents: 'auto' }}>
                                Termos
                            </Link>
                        </div>

                        {/* Redes Sociais */}
                        <div className="flex gap-4">
                            <a href="https://twitter.com/plataformamusicas" target="_blank" rel="noopener noreferrer" className="w-9 h-9 bg-gray-800 hover:bg-blue-600 rounded-lg flex items-center justify-center text-gray-400 hover:text-white transition-all cursor-pointer relative z-10" style={{ pointerEvents: 'auto' }}>
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806.026-1.566.247-2.229.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" />
                                </svg>
                            </a>
                            <a href="https://instagram.com/plataformamusicas" target="_blank" rel="noopener noreferrer" className="w-9 h-9 bg-gray-800 hover:bg-pink-600 rounded-lg flex items-center justify-center text-gray-400 hover:text-white transition-all cursor-pointer relative z-10" style={{ pointerEvents: 'auto' }}>
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.174-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.402.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.357-.629-2.746-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24.009 12.017 24.009c6.624 0 11.99-5.367 11.99-11.988C24.007 5.367 18.641.017 12.017.017z" />
                                </svg>
                            </a>
                            <a href="https://youtube.com/@plataformamusicas" target="_blank" rel="noopener noreferrer" className="w-9 h-9 bg-gray-800 hover:bg-red-600 rounded-lg flex items-center justify-center text-gray-400 hover:text-white transition-all cursor-pointer relative z-10" style={{ pointerEvents: 'auto' }}>
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                                </svg>
                            </a>
                        </div>

                        {/* Copyright */}
                        <div className="text-center">
                            <p className="text-gray-400 text-sm">
                                © 2025 Nexor Records Pools. Todos os direitos reservados.
                            </p>
                        </div>
                    </div>
                </div>
            </footer>

            {/* Dados Estruturados para SEO */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "MusicGroup",
                        "name": decodedArtistName,
                        "description": getArtistInfo(decodedArtistName, stats),
                        "url": `https://plataformamusicas.com/artist/${encodeURIComponent(decodedArtistName)}`,
                        "genre": availableStyles.join(', '),
                        "numberOfTracks": filteredTracks.length,
                        "track": filteredTracks.slice(0, 10).map(track => ({
                            "@type": "MusicRecording",
                            "name": track.songName,
                            "byArtist": {
                                "@type": "MusicGroup",
                                "name": track.artist
                            },
                            "genre": track.style || "Unknown",
                            "datePublished": track.releaseDate || track.createdAt
                        })),
                        "aggregateRating": {
                            "@type": "AggregateRating",
                            "ratingValue": "4.5",
                            "reviewCount": stats.totalLikes || 100
                        },
                        "publisher": {
                            "@type": "Organization",
                            "name": "Nexor Records Pools",
                            "url": "https://plataformamusicas.com"
                        }
                    })
                }}
            />
        </div>
    );
}
