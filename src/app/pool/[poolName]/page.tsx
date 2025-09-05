"use client";

// Força renderização dinâmica para evitar erro de pré-renderização
export const dynamic = 'force-dynamic';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { useDownloadsCache } from '@/hooks/useDownloadsCache';
import { useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Header from '@/components/layout/Header';
import MusicList from '@/components/music/MusicList';
import InlineDownloadProgress from '@/components/music/InlineDownloadProgress';
import { Track } from '@/types/track';
import { Download, Heart, Play, TrendingUp, Users, Music, X, RefreshCw, ArrowLeft } from 'lucide-react';

import { useToastContext } from '@/context/ToastContext';
import { useRouter } from 'next/navigation';
import BatchDownloadButtons from '@/components/download/BatchDownloadButtons';

// Função para obter informações sobre gravadoras/plataformas baseada em dados reais
const getPoolInfo = (poolName: string, stats: any): string => {
    // Se não temos estatísticas ou não há tracks, mostrar mensagem padrão
    if (!stats || stats.totalTracks === 0) {
        return 'Não obtivemos informações detalhadas sobre esta gravadora ou plataforma musical.';
    }

    // Gerar informações baseadas nos dados reais
    const totalTracks = stats.totalTracks || 0;
    const totalDownloads = stats.totalDownloads || 0;
    const totalLikes = stats.totalLikes || 0;
    const uniqueGenres = stats.uniqueGenres || 0;

    // Criar descrição baseada nos dados reais
    let description = `${poolName} é uma gravadora/plataforma com ${totalTracks} música${totalTracks !== 1 ? 's' : ''} em nossa plataforma. `;

    if (totalDownloads > 0) {
        description += `As músicas desta gravadora já foram baixadas ${totalDownloads} vez${totalDownloads !== 1 ? 'es' : ''}. `;
    }

    if (totalLikes > 0) {
        description += `Recebeu ${totalLikes} curtida${totalLikes !== 1 ? 's' : ''} dos usuários. `;
    }

    if (uniqueGenres > 0) {
        description += `Representa ${uniqueGenres} estilo${uniqueGenres !== 1 ? 's' : ''} musical${uniqueGenres !== 1 ? 'is' : ''} diferentes.`;
    }

    return description;
};

export default function PoolPage() {
    const params = useParams();
    const poolName = params?.poolName as string;
    const decodedPoolName = decodeURIComponent(poolName);
    const { showToast } = useToastContext();
    const { data: session } = useSession();

    // Verificar se deve iniciar download automático
    const [shouldAutoDownload, setShouldAutoDownload] = useState(false);

    const [tracks, setTracks] = useState<Track[]>([]);
    const [filteredTracks, setFilteredTracks] = useState<Track[]>([]);
    const [loading, setLoading] = useState(true);
    // Usar cache global igual ao /new e /genre para atualização em tempo real
    const downloadsCache = useDownloadsCache();
    const downloadedTrackIds = downloadsCache.downloadedTrackIds;
    const markAsDownloaded = downloadsCache.markAsDownloaded;
    const [selectedGenre, setSelectedGenre] = useState<string | null>(null);
    const [selectedStyle, setSelectedStyle] = useState<string | null>(null);
    const [stats, setStats] = useState({
        totalDownloads: 0,
        totalLikes: 0,
        totalPlays: 0,
        uniqueArtists: 0,
        uniqueGenres: 0,
        latestRelease: null as Date | null,
        totalTracks: 0
    });



    // Estados para modal de confirmação mobile
    const [showMobileConfirmModal, setShowMobileConfirmModal] = useState(false);
    const [pendingDownloadAction, setPendingDownloadAction] = useState<{
        type: 'new' | 'all';
        tracks: Track[];
        callback: () => void;
    } | null>(null);

    // Função para limpar o histórico de downloads de um estilo específico
    const clearDownloadHistory = async (tracks: Track[]) => {
        if (!session) {
            showToast('👑 Para limpar o histórico de downloads, você precisa estar logado. Ative um plano VIP!', 'warning');
            return;
        }

        const trackIdsToClear = tracks.map(track => track.id);
        const confirmed = window.confirm(`Tem certeza que deseja limpar o histórico de downloads para todas as músicas da pool ${decodedPoolName}? Isso removerá ${trackIdsToClear.length} músicas do seu histórico de downloads.`);

        if (confirmed) {
            try {
                const response = await fetch('/api/tracks/clear-downloads', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ trackIds: trackIdsToClear }),
                });

                if (response.ok) {
                    const data = await response.json();
                    if (data.success) {
                        // Limpar estado local
                        // Não remover do cache global, apenas logar (igual às outras páginas)
                        console.log('Remover múltiplos do cache não suportado no modo global.');

                        // Limpar localStorage
                        localStorage.setItem('downloadedTracks', JSON.stringify(JSON.parse(localStorage.getItem('downloadedTracks') || '[]').filter((track: any) => !trackIdsToClear.includes(track.id))));

                        // Atualizar verificação de downloads recentes
                        // Não há mais useRecentDownloads, então não precisamos chamar checkDownloads aqui
                        // A lógica de verificação de downloads recentes agora está integrada ao backend

                        showToast('✅ Histórico de downloads limpo com sucesso!', 'success');
                    } else {
                        showToast('❌ Erro ao limpar histórico de downloads.', 'error');
                    }
                } else {
                    let msg = `HTTP ${response.status}`;
                    try {
                        const err = await response.json();
                        if (err?.error) msg = err.error;
                    } catch { }
                    showToast(`❌ Erro ao limpar histórico de downloads: ${msg}`, 'error');
                }
            } catch (error) {
                console.error('❌ Erro ao limpar histórico de downloads:', error);
                showToast('❌ Erro ao limpar histórico de downloads', 'error');
            }
        }
    };

    // Função para sincronizar estado com localStorage e marcar como baixado no cache global
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

    useEffect(() => {
        const fetchPoolTracks = async () => {
            try {
                setLoading(true);

                // Buscar tracks e estatísticas em paralelo
                const [tracksResponse, statsResponse] = await Promise.all([
                    fetch(`/api/tracks/pool/${encodeURIComponent(decodedPoolName)}`),
                    fetch(`/api/tracks/pool/${encodeURIComponent(decodedPoolName)}/stats`)
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
                    setFilteredTracks([]);
                    setStats(prev => ({ ...prev, totalTracks: 0 }));
                }

                if (statsResponse.ok) {
                    const statsData = await statsResponse.json();
                    setStats(prev => ({
                        ...prev,
                        totalDownloads: statsData.totalDownloads || 0,
                        totalLikes: statsData.totalLikes || 0,
                        totalPlays: statsData.totalPlays || 0,
                        uniqueArtists: statsData.uniqueArtists || 0,
                        uniqueGenres: statsData.uniqueGenres || 0,
                        latestRelease: statsData.latestRelease ? new Date(statsData.latestRelease) : null,
                        totalTracks: tracks.length // Manter sincronizado com o número de tracks
                    }));
                }
            } catch (e) {
                console.error('Erro ao buscar dados da pool:', e);
                setTracks([]);
                setFilteredTracks([]);
                setStats(prev => ({ ...prev, totalTracks: 0 }));
            } finally {
                setLoading(false);
            }
        };
        if (decodedPoolName) fetchPoolTracks();
    }, [decodedPoolName]);

    // Processar filtros da URL (hash)
    useEffect(() => {
        const hash = window.location.hash;
        const genreMatch = hash.match(/genre=([^&]+)/);

        if (genreMatch) {
            const genre = decodeURIComponent(genreMatch[1]);
            setSelectedGenre(genre);
        } else {
            setSelectedGenre(null);
        }
    }, []);

    // Obter estilos únicos disponíveis
    const availableStyles = useMemo(() => {
        if (!tracks.length) return [];
        return Array.from(new Set(tracks.map(track => track.style).filter(Boolean))).sort();
    }, [tracks]);

    // Filtrar tracks baseado no gênero ou estilo selecionado
    useEffect(() => {
        let filtered = tracks;

        if (selectedGenre) {
            filtered = filtered.filter(track => track.style === selectedGenre);
        }

        if (selectedStyle) {
            filtered = filtered.filter(track => track.style === selectedStyle);
        }

        setFilteredTracks(filtered);
    }, [selectedGenre, selectedStyle, tracks]);

    // Verificar se o usuário é VIP (simples)
    const isVip = true; // Por enquanto, sempre true para teste

    const goBack = () => {
        window.history.back();
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-900 via-[#1a1a1a] to-black">
                <div className="container mx-auto px-4 py-8">
                    <div className="flex items-center justify-center min-h-[400px]">
                        <div className="text-center">
                            <div className="animate-spin w-16 h-16 border-4 border-amber-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                            <p className="text-amber-400 text-lg">Carregando músicas da pool...</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#121212] overflow-x-hidden">
            {/* Header Fixo */}
            <Header />

            {/* Conteúdo Principal - Tela Cheia */}
            <div className="pt-12 lg:pt-16">
                {/* Header do Pool */}
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

                        {/* Informações do Pool */}
                        <div className="text-center">
                            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4">
                                {decodedPoolName}
                            </h1>

                            {/* Informações Adicionais da Gravadora */}
                            <div className="max-w-3xl mx-auto mb-8">
                                <div className="bg-[#181818] rounded-xl p-6 border border-[#282828] mb-6">
                                    <div className="text-[#b3b3b3] text-sm leading-relaxed">
                                        {getPoolInfo(decodedPoolName, stats)}
                                    </div>
                                </div>
                            </div>

                            {/* Estatísticas */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 max-w-2xl mx-auto">
                                <div className="bg-[#181818] rounded-xl p-4 border border-[#282828]">
                                    <div className="text-2xl sm:text-3xl font-bold text-[#1db954] mb-1">
                                        {filteredTracks.length}
                                    </div>
                                    <div className="text-[#b3b3b3] text-sm">
                                        {filteredTracks.length === 1 ? 'Música' : 'Músicas'}
                                        {selectedStyle && (
                                            <div className="text-xs text-[#1db954] mt-1">
                                                de {selectedStyle}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="bg-[#181818] rounded-xl p-4 border border-[#282828]">
                                    <div className="text-2xl sm:text-3xl font-bold text-[#1db954] mb-1">
                                        {stats.totalDownloads}
                                    </div>
                                    <div className="text-[#b3b3b3] text-sm">Downloads</div>
                                </div>

                                <div className="bg-[#181818] rounded-xl p-4 border border-[#282828]">
                                    <div className="text-2xl sm:text-3xl font-bold text-[#1db954] mb-1">
                                        {stats.totalLikes}
                                    </div>
                                    <div className="text-[#b3b3b3] text-sm">Curtidas</div>
                                </div>

                                <div className="bg-[#181818] rounded-xl p-4 border border-[#282828]">
                                    <div className="text-2xl sm:text-3xl font-bold text-[#1db954] mb-1">
                                        {new Set(filteredTracks.map((t: Track) => t.artist)).size}
                                    </div>
                                    <div className="text-[#b3b3b3] text-sm">Artistas</div>
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
                                    Carregando músicas de {decodedPoolName}...
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
                                        ? `Não encontramos músicas do estilo "${selectedStyle}" no pool "${decodedPoolName}".`
                                        : `Não encontramos músicas para o pool "${decodedPoolName}".`
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
                            setDownloadedTrackIds={(ids) => {
                                if (typeof ids === 'function') {
                                    const newIds = ids(downloadedTrackIds);
                                    if (Array.isArray(newIds)) {
                                        newIds.forEach((id) => markAsDownloaded(id));
                                    }
                                } else if (Array.isArray(ids)) {
                                    ids.forEach((id) => markAsDownloaded(id));
                                }
                            }}
                            showDate={true}
                        />
                    )}
                </div>

            </div>

            {/* Modal de Confirmação para Downloads Mobile */}
            {showMobileConfirmModal && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-3">
                    <div className="bg-[#282828] border border-[#3e3e3e] rounded-xl p-5 max-w-sm w-full mx-3">
                        {/* Ícone de Aviso */}
                        <div className="flex justify-center mb-4">
                            <div className="w-14 h-14 bg-yellow-500/20 border-2 border-yellow-500/30 rounded-full flex items-center justify-center">
                                <svg className="w-7 h-7 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                            </div>
                        </div>

                        {/* Título */}
                        <h3 className="text-white text-lg font-bold text-center mb-4">
                            Aviso de Download
                        </h3>

                        {/* Mensagem */}
                        <div className="text-gray-300 text-sm text-center mb-6 space-y-3">
                            <p className="font-medium">
                                {pendingDownloadAction?.type === 'new'
                                    ? `Baixar ${pendingDownloadAction.tracks.filter(t => !downloadedTrackIds.includes(t.id)).length} músicas novas?`
                                    : `Baixar todas as ${pendingDownloadAction?.tracks.length} músicas?`
                                }
                            </p>

                            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3">
                                <p className="text-yellow-400 font-medium text-xs">
                                    ⚠️ Celulares podem não suportar muitos downloads simultâneos.
                                </p>
                                <p className="text-gray-300 text-xs mt-1">
                                    Recomendamos usar um computador para downloads em massa.
                                </p>
                            </div>

                            <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-3">
                                <p className="text-purple-300 font-medium text-xs">
                                    💎 Para uma experiência premium, acesse nossa plataforma VIP!
                                </p>
                            </div>
                        </div>

                        {/* Botões de Ação */}
                        <div className="flex flex-col gap-3">
                            <button
                                onClick={confirmMobileDownload}
                                className="w-full bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white py-3 px-4 rounded-lg font-semibold transition-all duration-200 transform hover:scale-105 shadow-lg text-sm"
                            >
                                Continuar no Celular
                            </button>

                            <button
                                onClick={() => window.open('https://plataformavip.nexorrecords.com.br/atualizacoes', '_blank')}
                                className="w-full bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white py-3 px-4 rounded-lg font-semibold transition-all duration-200 transform hover:scale-105 shadow-lg border border-purple-400/30 text-sm"
                            >
                                <div className="flex items-center justify-center gap-2">
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                                    </svg>
                                    Acessar Plataforma VIP
                                </div>
                            </button>

                            <button
                                onClick={cancelMobileDownload}
                                className="w-full bg-gradient-to-r from-gray-600 hover:bg-gray-700 text-white py-3 px-4 rounded-lg font-medium transition-all duration-200 text-sm"
                            >
                                Cancelar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
