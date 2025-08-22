"use client";

// Força renderização dinâmica para evitar erro de pré-renderização
export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import MainLayout from '@/components/layout/MainLayout';
import { MusicList } from '@/components/music/MusicList';
import FooterSpacer from '@/components/layout/FooterSpacer';
import { Track } from '@/types/track';
import { Download, Heart, Play, TrendingUp, Users, Calendar, X, RefreshCw, ArrowLeft } from 'lucide-react';
import { useBatchDownload } from '@/hooks/useBatchDownload';
import { useToastContext } from '@/context/ToastContext';
import { useRouter } from 'next/navigation';

// Função para obter informações sobre artistas baseada em dados reais
const getArtistInfo = (artistName: string, stats: any): string | null => {
    // Se não temos estatísticas ou não há tracks, não mostramos informações
    if (!stats || stats.totalTracks === 0) {
        return null;
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
    const params = useParams();
    const artistName = params?.artistName as string;
    const decodedArtistName = decodeURIComponent(artistName);
    const { showToast } = useToastContext();
    const router = useRouter();

    const [tracks, setTracks] = useState<Track[]>([]);
    const [loading, setLoading] = useState(true);
    const [downloadedTrackIds, setDownloadedTrackIds] = useState<number[]>([]);
    const [stats, setStats] = useState({
        totalDownloads: 0,
        totalLikes: 0,
        totalPlays: 0,
        uniqueGenres: 0,
        uniquePools: 0,
        latestRelease: null as Date | null,
        totalTracks: 0
    });

    const {
        state: batchState,
        startBatchDownload,
        pauseDownload,
        resumeDownload,
        cancelDownload
    } = useBatchDownload();

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

    // Verificar se o usuário é VIP (simples)
    const isVip = true; // Por enquanto, sempre true para teste

    // Calcular quantas músicas estão disponíveis para download
    const getAvailableTracksCount = () => {
        if (!tracks.length) return 0;

        return tracks.filter(track => {
            // Verificar se não foi baixada no localStorage (antigos)
            const notInLocalStorage = !downloadedTrackIds.includes(track.id);
            // Por enquanto, considerar todas como disponíveis
            return notInLocalStorage;
        }).length;
    };

    // Sincronizar estado local com o hook
    useEffect(() => {
        setIsBatchDownloading(batchState.isActive);
        setBatchProgress({
            total: batchState.totalTracks,
            downloaded: batchState.downloadedCount,
            failed: batchState.failedCount,
            skipped: batchState.skippedCount,
            currentTrack: batchState.currentTrackName,
            failedDetails: []
        });
    }, [batchState]);

    useEffect(() => {
        const saved = localStorage.getItem('downloadedTrackIds');
        if (saved) {
            try { setDownloadedTrackIds(JSON.parse(saved)); } catch { }
        }
    }, []);

    const handleDownloadedTrackIdsChange = (newIds: number[] | ((prev: number[]) => number[])) => {
        if (typeof newIds === 'function') {
            setDownloadedTrackIds(newIds);
        } else {
            setDownloadedTrackIds(newIds);
        }
        localStorage.setItem('downloadedTrackIds', JSON.stringify(typeof newIds === 'function' ? newIds(downloadedTrackIds) : newIds));
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

                    // Atualizar totalTracks nas estatísticas
                    setStats(prev => ({ ...prev, totalTracks: tracks.length }));
                } else {
                    console.error('Erro ao buscar tracks do artista:', tracksResponse.status);
                    setTracks([]);
                    setStats(prev => ({ ...prev, totalTracks: 0 }));
                }

                if (statsResponse.ok) {
                    const statsData = await statsResponse.json();
                    setStats(statsData);
                } else {
                    console.error('Erro ao buscar estatísticas do artista:', statsResponse.status);
                }

            } catch (error) {
                console.error('Erro ao buscar dados do artista:', error);
                setTracks([]);
            } finally {
                setLoading(false);
            }
        };

        if (decodedArtistName) {
            fetchArtistTracks();
        }
    }, [decodedArtistName]);

    // Função para voltar à página anterior
    const goBack = () => {
        router.back();
    };

    return (
        <MainLayout>
            <div className="min-h-screen bg-[#121212]">
                {/* Header do Artista */}
                <div className="w-full bg-gradient-to-b from-[#1db954]/20 to-transparent">
                    <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 py-8 sm:py-12">
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
                            <div className="max-w-2xl mx-auto mb-8">
                                {getArtistInfo(decodedArtistName, stats) && (
                                    <div className="bg-[#181818] rounded-xl p-6 border border-[#282828] mb-6">
                                        <div className="text-[#b3b3b3] text-sm leading-relaxed">
                                            {getArtistInfo(decodedArtistName, stats)}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Estatísticas */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 max-w-2xl mx-auto">
                                <div className="bg-[#181818] rounded-xl p-4 border border-[#282828]">
                                    <div className="text-2xl sm:text-3xl font-bold text-[#1db954] mb-1">
                                        {tracks.length}
                                    </div>
                                    <div className="text-[#b3b3b3] text-sm">
                                        {tracks.length === 1 ? 'Música' : 'Músicas'}
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
                                        {stats.uniqueGenres}
                                    </div>
                                    <div className="text-[#b3b3b3] text-sm">Estilos</div>
                                </div>
                            </div>

                            {/* Botões de Download */}
                            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
                                <button
                                    onClick={() => startBatchDownload(tracks, decodedArtistName, 'genre')}
                                    disabled={isBatchDownloading || tracks.length === 0}
                                    className="flex items-center justify-center gap-3 px-8 py-3 bg-[#1db954] text-white rounded-xl hover:bg-[#1ed760] disabled:bg-[#535353] disabled:cursor-not-allowed transition-all duration-200 font-semibold text-lg shadow-lg hover:shadow-xl"
                                >
                                    <Download className="w-5 h-5" />
                                    Baixar Todas ({tracks.length})
                                </button>

                                <button
                                    onClick={() => {
                                        const newTracks = tracks.filter(track => !downloadedTrackIds.includes(track.id));
                                        if (newTracks.length > 0) {
                                            startBatchDownload(newTracks, decodedArtistName, 'genre');
                                        } else {
                                            showToast('Todas as músicas já foram baixadas!', 'info');
                                        }
                                    }}
                                    disabled={isBatchDownloading || tracks.length === 0}
                                    className="flex items-center justify-center gap-3 px-8 py-3 bg-[#282828] text-white rounded-xl hover:bg-[#3e3e3e] disabled:bg-[#535353] disabled:cursor-not-allowed transition-all duration-200 font-semibold text-lg border border-[#3e3e3e] shadow-lg hover:shadow-xl"
                                >
                                    <RefreshCw className="w-5 h-5" />
                                    Baixar Novas ({getAvailableTracksCount()})
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
                                            <span className="text-[#1db954] text-sm font-bold">
                                                {batchProgress.downloaded}/{batchProgress.total}
                                            </span>
                                        </div>

                                        {/* Barra de Progresso */}
                                        <div className="w-full bg-[#282828] rounded-full h-2 mb-3">
                                            <div
                                                className="bg-[#1db954] h-2 rounded-full transition-all duration-300"
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

                                        {/* Controles */}
                                        <div className="flex gap-2">
                                            <button
                                                onClick={pauseDownload}
                                                disabled={!batchState.isActive}
                                                className="flex-1 px-3 py-2 bg-[#282828] text-white rounded-lg hover:bg-[#3e3e3e] disabled:bg-[#535353] disabled:cursor-not-allowed transition-colors text-sm"
                                            >
                                                Pausar
                                            </button>
                                            <button
                                                onClick={resumeDownload}
                                                disabled={batchState.isActive}
                                                className="flex-1 px-3 py-2 bg-[#1db954] text-white rounded-lg hover:bg-[#1ed760] disabled:bg-[#535353] disabled:cursor-not-allowed transition-colors text-sm"
                                            >
                                                Continuar
                                            </button>
                                            <button
                                                onClick={cancelDownload}
                                                className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                                            >
                                                Cancelar
                                            </button>
                                        </div>

                                        {/* Estatísticas do Download */}
                                        <div className="grid grid-cols-3 gap-2 mt-3 text-xs">
                                            <div className="text-center">
                                                <div className="text-[#1db954] font-bold">{batchProgress.downloaded}</div>
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

                {/* Lista de Músicas */}
                <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 py-8">
                    {loading ? (
                        <div className="flex items-center justify-center py-16">
                            <div className="text-center">
                                <div className="animate-spin w-12 h-12 border-4 border-[#1db954] border-t-transparent rounded-full mx-auto mb-4"></div>
                                <p className="text-[#b3b3b3] text-lg">
                                    Carregando músicas de {decodedArtistName}...
                                </p>
                            </div>
                        </div>
                    ) : tracks.length === 0 ? (
                        <div className="text-center py-16">
                            <div className="bg-[#181818] rounded-2xl p-8 max-w-md mx-auto border border-[#282828]">
                                <div className="text-6xl mb-4">🎵</div>
                                <h3 className="text-xl font-bold text-white mb-2">
                                    Nenhuma música encontrada
                                </h3>
                                <p className="text-[#b3b3b3] mb-6">
                                    Não encontramos músicas para o artista "{decodedArtistName}".
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
                            tracks={tracks}
                            downloadedTrackIds={downloadedTrackIds}
                            setDownloadedTrackIds={handleDownloadedTrackIdsChange}
                            showDate={true}
                            enableInfiniteScroll={false}
                        />
                    )}
                </div>

                <FooterSpacer />
            </div>
        </MainLayout>
    );
}
