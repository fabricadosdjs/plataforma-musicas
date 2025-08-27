"use client";

// Força renderização dinâmica para evitar erro de pré-renderização
export const dynamic = 'force-dynamic';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Header from '@/components/layout/Header';
import MusicList from '@/components/music/MusicList';
import { Track } from '@/types/track';
import { Download, Heart, Play, TrendingUp, Users, Calendar, X, RefreshCw, ArrowLeft, Folder } from 'lucide-react';
import { useToastContext } from '@/context/ToastContext';
import { useRouter } from 'next/navigation';

// Função para obter informações sobre o folder baseada em dados reais
const getFolderInfo = (folderName: string, tracks: Track[], selectedStyle: string | null): string => {
    // Se não há tracks, mostrar mensagem padrão
    if (!tracks || tracks.length === 0) {
        return 'Não obtivemos informações detalhadas sobre este folder.';
    }

    // Gerar informações baseadas nos dados reais
    const totalTracks = tracks.length;
    const totalDownloads = tracks.reduce((sum: number, track: Track) => sum + (track.downloadCount || 0), 0);
    const totalLikes = tracks.reduce((sum: number, track: Track) => sum + (track.likeCount || 0), 0);
    const uniqueArtists = new Set(tracks.map((t: Track) => t.artist)).size;

    // Criar descrição baseada nos dados reais
    let description = `${folderName} é um folder com ${totalTracks} música${totalTracks !== 1 ? 's' : ''} em nossa plataforma. `;

    if (selectedStyle) {
        description = `${folderName} contém ${totalTracks} música${totalTracks !== 1 ? 's' : ''} do estilo ${selectedStyle}. `;
    }

    if (totalDownloads > 0) {
        description += `As músicas deste folder já foram baixadas ${totalDownloads} vez${totalDownloads !== 1 ? 'es' : ''}. `;
    }

    if (totalLikes > 0) {
        description += `Recebeu ${totalLikes} curtida${totalLikes !== 1 ? 's' : ''} dos usuários. `;
    }

    if (uniqueArtists > 0) {
        description += `Contém músicas de ${uniqueArtists} artista${uniqueArtists !== 1 ? 's' : ''} diferente${uniqueArtists !== 1 ? 's' : ''}.`;
    }

    return description;
};

export default function FolderPage() {
    const params = useParams();
    const folderName = decodeURIComponent(params.folderName as string);
    const { showToast } = useToastContext();
    const { data: session } = useSession();

    const [tracks, setTracks] = useState<Track[]>([]);
    const [loading, setLoading] = useState(true);
    const [downloadedTrackIds, setDownloadedTrackIds] = useState<number[]>([]);
    const [stats, setStats] = useState({
        totalDownloads: 0,
        totalLikes: 0,
        totalPlays: 0,
        uniqueArtists: 0,
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

    // Estados para modal de confirmação mobile
    const [showMobileConfirmModal, setShowMobileConfirmModal] = useState(false);
    const [pendingDownloadAction, setPendingDownloadAction] = useState<{
        type: 'new' | 'all';
        tracks: Track[];
        callback: () => void;
    } | null>(null);

    // Verificar se o usuário é VIP (simples)
    const isVip = true; // Por enquanto, sempre true para teste

    // Estado para contador em tempo real
    const [availableTracksCount, setAvailableTracksCount] = useState(0);

    // Obter estilos únicos disponíveis
    const availableStyles = useMemo(() => {
        if (!tracks.length) return [];
        return Array.from(new Set(tracks.map(track => track.style).filter(Boolean))).sort();
    }, [tracks]);

    // Calcular quantas músicas estão disponíveis para download
    const getAvailableTracksCount = useCallback(() => {
        if (!filteredTracks.length) return 0;

        const availableCount = filteredTracks.filter(track => {
            return !downloadedTrackIds.includes(track.id);
        }).length;

        console.log('🔍 getAvailableTracksCount (Folder):', {
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
        console.log('🔄 Contador atualizado automaticamente (Folder):', count);
    }, [getAvailableTracksCount]);

    // Função para obter tracks disponíveis para download
    const getAvailableTracks = useCallback(() => {
        if (!filteredTracks.length) return [];

        const availableTracks = filteredTracks.filter(track => {
            return !downloadedTrackIds.includes(track.id);
        });

        console.log('🔍 getAvailableTracks (Folder):', {
            totalTracks: filteredTracks.length,
            downloadedIds: downloadedTrackIds.length,
            availableTracks: availableTracks.length
        });

        return availableTracks;
    }, [filteredTracks, downloadedTrackIds]);

    // Função para sincronizar estado com localStorage
    const syncDownloadedTrackIds = () => {
        const saved = localStorage.getItem('downloadedTrackIds');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                setDownloadedTrackIds(parsed);
                console.log('🔄 Sincronizando downloadedTrackIds com localStorage (Folder):', parsed.length, 'IDs');
            } catch (error) {
                console.error('❌ Erro ao sincronizar downloadedTrackIds (Folder):', error);
            }
        }
    };

    const handleDownloadedTrackIdsChange = (newIds: number[] | ((prev: number[]) => number[])) => {
        if (typeof newIds === 'function') {
            setDownloadedTrackIds(prev => {
                const result = newIds(prev);
                localStorage.setItem('downloadedTrackIds', JSON.stringify(result));
                // Forçar atualização do contador
                setTimeout(() => updateAvailableTracksCount(), 0);
                return result;
            });
        } else {
            setDownloadedTrackIds(newIds);
            localStorage.setItem('downloadedTrackIds', JSON.stringify(newIds));
            // Forçar atualização do contador
            setTimeout(() => updateAvailableTracksCount(), 0);
        }
    };

    // Filtrar tracks baseado no estilo selecionado
    useEffect(() => {
        if (selectedStyle) {
            const filtered = tracks.filter(track => track.style === selectedStyle);
            setFilteredTracks(filtered);
        } else {
            setFilteredTracks(tracks);
        }
    }, [selectedStyle, tracks]);

    // Atualizar contador sempre que downloadedTrackIds mudar
    useEffect(() => {
        updateAvailableTracksCount();
    }, [downloadedTrackIds, updateAvailableTracksCount]);

    // Atualizar contador sempre que filteredTracks mudar
    useEffect(() => {
        updateAvailableTracksCount();
    }, [filteredTracks, updateAvailableTracksCount]);

    useEffect(() => {
        syncDownloadedTrackIds();
    }, []);

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
        const fetchFolderTracks = async () => {
            try {
                setLoading(true);

                // Buscar tracks e estatísticas em paralelo
                const [tracksResponse, statsResponse] = await Promise.all([
                    fetch(`/api/tracks/by-folder?folder=${encodeURIComponent(folderName)}`),
                    fetch(`/api/tracks/folder/${encodeURIComponent(folderName)}/stats`)
                ]);

                if (tracksResponse.ok) {
                    const data = await tracksResponse.json();
                    const tracks = Array.isArray(data.tracks) ? data.tracks : [];
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
                        uniqueArtists: statsData.uniqueArtists || 0,
                        uniquePools: statsData.uniquePools || 0,
                        latestRelease: statsData.latestRelease ? new Date(statsData.latestRelease) : null,
                        totalTracks: tracks.length // Manter sincronizado com o número de tracks
                    }));
                }
            } catch (e) {
                console.error('Erro ao buscar dados do folder:', e);
                setTracks([]);
                setStats(prev => ({ ...prev, totalTracks: 0 }));
            } finally {
                setLoading(false);
            }
        };

        if (folderName) fetchFolderTracks();
    }, [folderName]);

    // Função para baixar músicas em lote (simplificada)
    const downloadTracksInBatches = async (tracksToDownload: Track[]) => {
        if (!isVip) {
            showToast('👑 Apenas usuários VIP podem baixar músicas em lote', 'warning');
            return;
        }

        // Filtrar apenas músicas não baixadas
        const availableTracks = tracksToDownload.filter(track =>
            !downloadedTrackIds.includes(track.id)
        );

        if (availableTracks.length === 0) {
            showToast('✅ Todas as músicas já foram baixadas!', 'info');
            return;
        }

        setIsBatchDownloading(true);
        setBatchProgress({
            total: availableTracks.length,
            downloaded: 0,
            failed: 0,
            skipped: 0,
            currentTrack: '',
            failedDetails: []
        });

        try {
            for (let i = 0; i < availableTracks.length; i++) {
                const track = availableTracks[i];

                setBatchProgress(prev => ({
                    ...prev,
                    currentTrack: `${track.artist} - ${track.songName}`
                }));

                try {
                    const response = await fetch('/api/download', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ trackId: track.id }),
                    });

                    if (response.ok) {
                        const data = await response.json();
                        if (data.downloadUrl) {
                            // Simular download
                            await new Promise(resolve => setTimeout(resolve, 500));

                            setDownloadedTrackIds(prev => {
                                const newIds = [...prev, track.id];
                                // Sincronizar com localStorage
                                localStorage.setItem('downloadedTrackIds', JSON.stringify(newIds));
                                // Forçar atualização do contador em tempo real
                                setTimeout(() => updateAvailableTracksCount(), 0);
                                return newIds;
                            });
                            setBatchProgress(prev => ({
                                ...prev,
                                downloaded: prev.downloaded + 1
                            }));
                        }
                    } else {
                        setBatchProgress(prev => ({
                            ...prev,
                            failed: prev.failed + 1
                        }));
                    }
                } catch (error) {
                    setBatchProgress(prev => ({
                        ...prev,
                        failed: prev.failed + 1
                    }));
                }

                // Pequena pausa entre downloads
                if (i < availableTracks.length - 1) {
                    await new Promise(resolve => setTimeout(resolve, 200));
                }
            }

            showToast(`✅ Download em lote concluído! ${batchProgress.downloaded} baixadas, ${batchProgress.failed} falharam`, 'success');
        } catch (error) {
            showToast('❌ Erro durante download em lote', 'error');
        } finally {
            setIsBatchDownloading(false);
            setBatchProgress({ total: 0, downloaded: 0, failed: 0, skipped: 0, currentTrack: '', failedDetails: [] });

            // Sincronizar estado após download em lote
            syncDownloadedTrackIds();
            console.log('🔄 Estado sincronizado após download em lote');
        }
    };

    const goBack = () => {
        window.history.back();
    };

    return (
        <div className="min-h-screen bg-[#121212] overflow-x-hidden">
            {/* Header Fixo */}
            <Header />

            {/* Conteúdo Principal - Tela Cheia */}
            <div className="pt-12 lg:pt-16">
                {/* Header do Folder */}
                <div className="w-full bg-gradient-to-b from-[#8b5cf6]/20 to-transparent">
                    <div className="w-full max-w-[95%] mx-auto px-2 sm:px-4 md:px-6 lg:px-8 xl:px-10 2xl:px-12 py-8 sm:py-12">
                        {/* Botão Voltar */}
                        <button
                            onClick={goBack}
                            className="flex items-center gap-2 text-[#b3b3b3] hover:text-white transition-colors mb-6"
                        >
                            <ArrowLeft className="w-5 h-5" />
                            Voltar
                        </button>

                        {/* Informações do Folder */}
                        <div className="text-center">
                            <div className="flex items-center justify-center gap-3 mb-4">
                                {/* Capa da Pasta ou Ícone Padrão */}
                                {(() => {
                                    // Buscar a primeira imagem disponível das músicas do folder
                                    const folderCover = filteredTracks.find(track => track.imageUrl)?.imageUrl;

                                    if (folderCover) {
                                        return (
                                            <div className="relative">
                                                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden border-2 border-[#8b5cf6]/30 shadow-lg">
                                                    <img
                                                        src={folderCover}
                                                        alt={`Capa do folder ${folderName}`}
                                                        className="w-full h-full object-cover"
                                                        onError={(e) => {
                                                            // Fallback para ícone se a imagem falhar
                                                            const target = e.currentTarget as HTMLImageElement;
                                                            const fallback = target.nextElementSibling as HTMLElement;
                                                            if (target && fallback) {
                                                                target.style.display = 'none';
                                                                fallback.style.display = 'flex';
                                                            }
                                                        }}
                                                    />
                                                    {/* Fallback ícone (inicialmente oculto) */}
                                                    <div className="hidden w-full h-full bg-[#8b5cf6]/20 border border-[#8b5cf6]/30 rounded-xl items-center justify-center">
                                                        <Folder className="w-8 h-8 sm:w-10 sm:h-10 text-[#8b5cf6]" />
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    } else {
                                        // Ícone padrão se não houver imagem
                                        return (
                                            <div className="p-3 bg-[#8b5cf6]/20 border border-[#8b5cf6]/30 rounded-xl">
                                                <Folder className="w-8 h-8 sm:w-10 sm:h-10 text-[#8b5cf6]" />
                                            </div>
                                        );
                                    }
                                })()}
                                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white">
                                    {folderName}
                                </h1>
                            </div>

                            {/* Informações Adicionais do Folder */}
                            <div className="max-w-3xl mx-auto mb-8">
                                <div className="bg-[#181818] rounded-xl p-6 border border-[#282828] mb-6">
                                    <div className="text-[#b3b3b3] text-sm leading-relaxed">
                                        {getFolderInfo(folderName, filteredTracks, selectedStyle)}
                                    </div>
                                </div>
                            </div>

                            {/* Estatísticas */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 max-w-2xl mx-auto">
                                <div className="bg-[#181818] rounded-xl p-4 border border-[#282828]">
                                    <div className="text-2xl sm:text-3xl font-bold text-[#8b5cf6] mb-1">
                                        {filteredTracks.length}
                                    </div>
                                    <div className="text-[#b3b3b3] text-sm">
                                        {filteredTracks.length === 1 ? 'Música' : 'Músicas'}
                                        {selectedStyle && (
                                            <div className="text-xs text-[#8b5cf6] mt-1">
                                                de {selectedStyle}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="bg-[#181818] rounded-xl p-4 border border-[#282828]">
                                    <div className="text-2xl sm:text-3xl font-bold text-[#8b5cf6] mb-1">
                                        {stats.totalDownloads}
                                    </div>
                                    <div className="text-[#b3b3b3] text-sm">Downloads</div>
                                </div>

                                <div className="bg-[#181818] rounded-xl p-4 border border-[#282828]">
                                    <div className="text-2xl sm:text-3xl font-bold text-[#8b5cf6] mb-1">
                                        {stats.totalLikes}
                                    </div>
                                    <div className="text-[#b3b3b3] text-sm">Curtidas</div>
                                </div>

                                <div className="bg-[#181818] rounded-xl p-4 border border-[#282828]">
                                    <div className="text-2xl sm:text-3xl font-bold text-[#8b5cf6] mb-1">
                                        {new Set(filteredTracks.map((t: Track) => t.artist)).size}
                                    </div>
                                    <div className="text-[#b3b3b3] text-sm">Artistas</div>
                                </div>
                            </div>

                            {/* Botões de Download */}
                            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
                                <button
                                    onClick={() => {
                                        if (session) {
                                            showMobileDownloadConfirmation('all', filteredTracks, () => downloadTracksInBatches(filteredTracks));
                                        } else {
                                            showToast('👑 Para baixar músicas em lote, você precisa estar logado. Ative um plano VIP!', 'warning');
                                        }
                                    }}
                                    disabled={isBatchDownloading || filteredTracks.length === 0 || !session}
                                    className="flex items-center justify-center gap-3 px-8 py-3 bg-[#8b5cf6] text-white rounded-xl hover:bg-[#9333ea] disabled:bg-[#535353] disabled:cursor-not-allowed transition-all duration-200 font-semibold text-lg shadow-lg hover:shadow-xl"
                                >
                                    <Download className="w-5 h-5" />
                                    Baixar Todas ({filteredTracks.length})
                                </button>

                                <button
                                    onClick={() => {
                                        if (session) {
                                            const availableTracks = getAvailableTracks();
                                            if (availableTracks.length > 0) {
                                                showMobileDownloadConfirmation('new', availableTracks, () => downloadTracksInBatches(availableTracks));
                                            } else {
                                                showToast('✅ Todas as músicas já foram baixadas!', 'info');
                                            }
                                        } else {
                                            showToast('👑 Para baixar músicas em lote, você precisa estar logado. Ative um plano VIP!', 'warning');
                                        }
                                    }}
                                    disabled={isBatchDownloading || availableTracksCount === 0 || !session}
                                    className="flex items-center justify-center gap-3 px-8 py-3 bg-[#282828] text-white rounded-xl hover:bg-[#3e3e3e] disabled:bg-[#535353] disabled:cursor-not-allowed transition-all duration-200 font-semibold text-lg border border-[#3e3e3e] shadow-lg hover:shadow-xl"
                                >
                                    <RefreshCw className="w-5 h-5" />
                                    Baixar Novas ({availableTracksCount})
                                </button>
                            </div>

                            {/* Indicador de Progresso do Download */}
                            {isBatchDownloading && (
                                <div className="mt-6 max-w-md mx-auto">
                                    <div className="bg-[#181818] rounded-xl p-4 border border-[#282828]">
                                        <div className="flex items-center justify-between mb-3">
                                            <span className="text-[#b3b3b3] text-sm font-medium">
                                                Baixando músicas...
                                            </span>
                                            <span className="text-[#8b5cf6] text-sm font-bold">
                                                {batchProgress.downloaded}/{batchProgress.total}
                                            </span>
                                        </div>

                                        {/* Barra de Progresso */}
                                        <div className="w-full bg-[#282828] rounded-full h-2 mb-3">
                                            <div
                                                className="bg-[#8b5cf6] h-2 rounded-full transition-all duration-300"
                                                style={{
                                                    width: `${batchProgress.total > 0 ? (batchProgress.downloaded / batchProgress.total) * 100 : 0}%`
                                                }}
                                            ></div>
                                        </div>

                                        {/* Música Atual */}
                                        {batchProgress.currentTrack && (
                                            <p className="text-[#b3b3b3] text-xs text-center mb-3">
                                                {batchProgress.currentTrack}
                                            </p>
                                        )}

                                        {/* Estatísticas do Download */}
                                        <div className="grid grid-cols-3 gap-2 mt-3 text-xs">
                                            <div className="text-center">
                                                <div className="text-[#8b5cf6] font-bold">{batchProgress.downloaded}</div>
                                                <div className="text-[#b3b3b3]">Baixadas</div>
                                            </div>
                                            <div className="text-center">
                                                <div className="text-yellow-500 font-bold">{batchProgress.failed}</div>
                                                <div className="text-[#b3b3b3]">Falharam</div>
                                            </div>
                                            <div className="text-center">
                                                <div className="text-[#535353] font-bold">{batchProgress.skipped}</div>
                                                <div className="text-[#b3b3b3]">Puladas</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
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
                                        ? 'bg-[#8b5cf6] text-white'
                                        : 'bg-[#282828] text-[#b3b3b3] hover:bg-[#3e3e3e] hover:text-white'
                                        }`}
                                >
                                    Todos ({tracks.length})
                                </button>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {availableStyles.map((style) => (
                                    <button
                                        key={style}
                                        onClick={() => setSelectedStyle(style)}
                                        className={`px-3 py-1 rounded-lg text-sm font-medium transition-all duration-200 ${selectedStyle === style
                                            ? 'bg-[#8b5cf6] text-white'
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
                                <div className="animate-spin w-12 h-12 border-4 border-[#8b5cf6] border-t-transparent rounded-full mx-auto mb-4"></div>
                                <p className="text-[#b3b3b3] text-lg">
                                    Carregando músicas do folder {folderName}...
                                </p>
                            </div>
                        </div>
                    ) : filteredTracks.length === 0 ? (
                        <div className="text-center py-16">
                            <div className="bg-[#181818] rounded-2xl p-8 max-w-md mx-auto border border-[#282828]">
                                <div className="text-6xl mb-4">📁</div>
                                <h3 className="text-xl font-bold text-white mb-2">
                                    Nenhuma música encontrada
                                </h3>
                                <p className="text-[#b3b3b3] mb-6">
                                    {selectedStyle
                                        ? `Não encontramos músicas do estilo "${selectedStyle}" no folder "${folderName}".`
                                        : `Não encontramos músicas para o folder "${folderName}".`
                                    }
                                </p>
                                <button
                                    onClick={goBack}
                                    className="px-6 py-2 bg-[#8b5cf6] text-white rounded-lg hover:bg-[#9333ea] transition-colors font-medium"
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
                            enableInfiniteScroll={false}
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
