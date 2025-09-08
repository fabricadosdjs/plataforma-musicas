'use client';

import { useState, useEffect, use, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import Image from 'next/image';
import Link from 'next/link';
import {
    Play,
    Pause,
    Music,
    Clock,
    Download,
    Heart,
    ArrowLeft,
    Star,
    Eye,
    EyeOff,
    Calendar,
    User,
    MoreHorizontal,
    Shuffle,
    Plus
} from 'lucide-react';
import { Playlist, PlaylistTrack } from '@/types/playlist';
import { extractIdFromSlug } from '@/lib/playlist-utils';
import { useGlobalPlayer } from '@/context/GlobalPlayerContext';
import { Button } from '@/components/ui/button';
import FooterPlayer from '@/components/player/FooterPlayer';
import Header from '@/components/layout/Header';

interface PlaylistPageProps {
    params: Promise<{ id: string }>;
}

export default function PlaylistPage({ params }: PlaylistPageProps) {
    const { data: session } = useSession();
    const router = useRouter();
    const { currentTrack, isPlaying, playTrack, togglePlayPause } = useGlobalPlayer();

    // Função para gerar slug do gênero
    const generateGenreSlug = (style: string) => {
        return style.toLowerCase()
            .replace(/\s+/g, '-')
            .replace(/\//g, '-%2F-')
            .replace(/--/g, '-');
    };

    const [playlist, setPlaylist] = useState<Playlist | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [downloadingTracks, setDownloadingTracks] = useState<Set<number>>(new Set());
    const [downloadedTracks, setDownloadedTracks] = useState<Set<number>>(new Set());
    const [likedTracks, setLikedTracks] = useState<Set<number>>(new Set());
    const [likingTracks, setLikingTracks] = useState<Set<number>>(new Set());
    const [isShuffleActive, setIsShuffleActive] = useState(false);
    const [shuffledOrder, setShuffledOrder] = useState<number[]>([]);
    const [isDownloadingPlaylist, setIsDownloadingPlaylist] = useState(false);
    const [downloadProgress, setDownloadProgress] = useState({ current: 0, total: 0 });
    const [downloadCancel, setDownloadCancel] = useState(false);
    const [isClient, setIsClient] = useState(false);
    const [dominantColors, setDominantColors] = useState<{ primary: string; secondary: string } | null>(null);
    const imageRef = useRef<HTMLImageElement>(null);

    // Usar React.use() para aguardar os params
    const resolvedParams = use(params);
    const playlistId = extractIdFromSlug(resolvedParams.id);

    // Função para extrair cores dominantes da imagem
    const extractDominantColors = (imageUrl: string) => {
        const img = new window.Image();
        img.crossOrigin = 'anonymous';

        img.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');

            if (!ctx) return;

            canvas.width = 50;
            canvas.height = 50;

            ctx.drawImage(img, 0, 0, 50, 50);

            const imageData = ctx.getImageData(0, 0, 50, 50);
            const data = imageData.data;

            let r = 0, g = 0, b = 0;
            let pixelCount = 0;

            for (let i = 0; i < data.length; i += 4) {
                r += data[i];
                g += data[i + 1];
                b += data[i + 2];
                pixelCount++;
            }

            r = Math.floor(r / pixelCount);
            g = Math.floor(g / pixelCount);
            b = Math.floor(b / pixelCount);

            // Criar cores mais vibrantes
            const primary = `rgb(${Math.min(255, r + 30)}, ${Math.min(255, g + 20)}, ${Math.min(255, b + 10)})`;
            const secondary = `rgb(${Math.min(255, r + 60)}, ${Math.min(255, g + 40)}, ${Math.min(255, b + 20)})`;

            setDominantColors({ primary, secondary });
        };

        img.onerror = () => {
            console.warn('Erro ao carregar imagem para extração de cores');
            // Usar cores padrão em caso de erro
            setDominantColors({
                primary: 'rgb(249, 115, 22)',
                secondary: 'rgb(234, 88, 12)'
            });
        };

        img.src = imageUrl;
    };

    // Função para verificar likes do usuário
    const checkUserLikes = async (trackIds: number[]) => {
        if (!session?.user || trackIds.length === 0) return;

        try {
            const response = await fetch('/api/likes', {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' }
            });

            if (response.ok) {
                const data = await response.json();
                const likedSet = new Set<number>();
                if (data.likedTracks && Array.isArray(data.likedTracks)) {
                    data.likedTracks.forEach((trackId: number) => {
                        likedSet.add(trackId);
                    });
                }
                setLikedTracks(likedSet);
            }
        } catch (error) {
            console.error('Erro ao verificar likes:', error);
        }
    };

    // Função para verificar downloads do usuário
    const checkUserDownloads = async (trackIds: number[]) => {
        if (!session?.user || trackIds.length === 0) {
            console.log('🔍 checkUserDownloads: Não há sessão ou trackIds vazios');
            return;
        }

        console.log('🔍 checkUserDownloads: Verificando downloads para', trackIds.length, 'tracks');

        try {
            const response = await fetch('/api/downloads', {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' }
            });

            console.log('🔍 checkUserDownloads: Resposta da API:', response.status, response.ok);

            if (response.ok) {
                const data = await response.json();
                console.log('🔍 checkUserDownloads: Dados recebidos:', data);

                const downloadedSet = new Set<number>();
                // A API retorna 'downloads' em vez de 'downloadedTracks'
                if (data.downloads && Array.isArray(data.downloads)) {
                    data.downloads.forEach((trackId: number) => {
                        downloadedSet.add(trackId);
                    });
                }
                console.log('🔍 checkUserDownloads: Downloads encontrados:', downloadedSet.size, 'tracks');
                setDownloadedTracks(downloadedSet);
            } else {
                console.error('🔍 checkUserDownloads: Erro na API:', response.status, response.statusText);
            }
        } catch (error) {
            console.error('🔍 checkUserDownloads: Erro ao verificar downloads:', error);
        }
    };

    // Função para baixar música individual
    const handleDownloadTrack = async (track: any) => {
        if (!session?.user) {
            toast.error('🔒 Faça login para baixar músicas');
            return;
        }

        if (downloadingTracks.has(track.id)) return;

        setDownloadingTracks(prev => new Set(prev).add(track.id));

        try {
            console.log('🔍 Baixando track individual:', track.id);

            // Registrar download no banco
            const downloadResponse = await fetch('/api/download', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ trackId: track.id })
            });

            if (downloadResponse.ok) {
                const downloadData = await downloadResponse.json();

                // Baixar arquivo
                const response = await fetch(downloadData.downloadUrl);
                if (response.ok) {
                    const blob = await response.blob();
                    const url = window.URL.createObjectURL(blob);
                    const link = document.createElement('a');
                    link.href = url;
                    link.download = `${track.artist} - ${track.songName}.mp3`;
                    link.style.display = 'none';
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    window.URL.revokeObjectURL(url);

                    // Marcar como baixado
                    setDownloadedTracks(prev => new Set(prev).add(track.id));
                    toast.success(`✅ ${track.songName} baixada com sucesso!`);
                } else {
                    toast.error('❌ Erro ao baixar arquivo');
                }
            } else {
                const errorData = await downloadResponse.json();
                toast.error(`❌ ${errorData.error || 'Erro ao processar download'}`);
            }
        } catch (error) {
            console.error('❌ Erro no download individual:', error);
            toast.error(`❌ Erro ao baixar música: ${error instanceof Error ? (error as Error).message : 'Erro desconhecido'}`);
        } finally {
            setDownloadingTracks(prev => {
                const newSet = new Set(prev);
                newSet.delete(track.id);
                return newSet;
            });
        }
    };

    // Função para lidar com likes (igual à homepage)
    const handleLike = async (track: any) => {
        if (!session?.user) {
            toast.error('🔒 Faça login para curtir músicas');
            return;
        }

        if (likingTracks.has(track.id)) return;

        setLikingTracks(prev => new Set(prev).add(track.id));

        try {
            console.log('🔍 Enviando like para track:', track.id);

            const response = await fetch('/api/likes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    trackId: track.id
                })
            });

            if (response.ok) {
                const data = await response.json();
                console.log('🔍 Dados recebidos:', data);

                if (data.liked) {
                    setLikedTracks(prev => new Set(prev).add(track.id));
                    toast.success('❤️ Música curtida!');
                } else {
                    setLikedTracks(prev => {
                        const newSet = new Set(prev);
                        newSet.delete(track.id);
                        return newSet;
                    });
                    toast.success('💔 Música descurtida');
                }
            } else {
                const errorData = await response.json();
                toast.error(`❌ ${errorData.error || 'Erro ao processar like'}`);
            }
        } catch (error) {
            console.error('❌ Erro no like:', error);
            toast.error(`❌ Erro ao curtir música: ${error instanceof Error ? (error as Error).message : 'Erro desconhecido'}`);
        } finally {
            setLikingTracks(prev => {
                const newSet = new Set(prev);
                newSet.delete(track.id);
                return newSet;
            });
        }
    };

    // Função para download em lote da playlist (igual à homepage)
    const handleDownloadPlaylist = async () => {
        if (!session?.user) {
            toast.error('🔒 Faça login para baixar músicas');
            return;
        }

        if (!playlist?.tracks || playlist.tracks.length === 0) {
            toast.error('❌ Nenhuma música encontrada na playlist');
            return;
        }

        if (isDownloadingPlaylist) {
            // Cancelar download
            setDownloadCancel(true);
            toast.error('⏹️ Cancelando download...');
            return;
        }

        const tracks = playlist.tracks.map(pt => pt.track).filter(Boolean) as any[];
        const tracksToDownload = tracks.filter(track => track && !downloadedTracks.has(track.id));

        if (tracksToDownload.length === 0) {
            toast.error('📭 Todas as músicas já foram baixadas');
            return;
        }

        setIsDownloadingPlaylist(true);
        setDownloadCancel(false);
        setDownloadProgress({ current: 0, total: tracksToDownload.length });

        toast.success(`📥 Iniciando download de ${tracksToDownload.length} músicas...`);

        try {
            // Processar em lotes de 10 (igual à homepage)
            const batchSize = 10;
            const batches = [];
            for (let i = 0; i < tracksToDownload.length; i += batchSize) {
                batches.push(tracksToDownload.slice(i, i + batchSize));
            }

            for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
                if (downloadCancel) {
                    toast.error('❌ Download cancelado pelo usuário');
                    break;
                }

                const batch = batches[batchIndex];

                // Processar cada música do lote
                for (let trackIndex = 0; trackIndex < batch.length; trackIndex++) {
                    if (downloadCancel) break;

                    const track = batch[trackIndex];
                    if (!track) continue;

                    const currentProgress = batchIndex * batchSize + trackIndex + 1;
                    setDownloadProgress({ current: currentProgress, total: tracksToDownload.length });

                    try {
                        // Registrar download no banco
                        const downloadResponse = await fetch('/api/download', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ trackId: track.id })
                        });

                        if (downloadResponse.ok) {
                            const downloadData = await downloadResponse.json();

                            // Baixar arquivo
                            const response = await fetch(downloadData.downloadUrl);
                            if (response.ok) {
                                const blob = await response.blob();
                                const url = window.URL.createObjectURL(blob);
                                const link = document.createElement('a');
                                link.href = url;
                                link.download = `${track.artist} - ${track.songName}.mp3`;
                                link.style.display = 'none';
                                document.body.appendChild(link);
                                link.click();
                                document.body.removeChild(link);
                                window.URL.revokeObjectURL(url);

                                // Marcar como baixado
                                setDownloadedTracks(prev => {
                                    const newSet = new Set(prev).add(track.id);
                                    console.log('🎵 Música marcada como baixada:', track.songName, 'Total baixadas:', newSet.size);
                                    return newSet;
                                });
                            }
                        }

                        // Pequena pausa entre downloads
                        await new Promise(resolve => setTimeout(resolve, 500));
                    } catch (error) {
                        console.error(`Erro ao baixar ${track.songName}:`, error);
                    }
                }

                // Pausa maior entre lotes
                if (batchIndex < batches.length - 1 && !downloadCancel) {
                    await new Promise(resolve => setTimeout(resolve, 1000));
                }
            }

            if (!downloadCancel) {
                toast.success(`✅ Download concluído! ${tracksToDownload.length} músicas baixadas`);
            }
        } catch (error) {
            console.error('Erro no download em lote:', error);
            toast.error('❌ Erro durante o download em lote');
        } finally {
            setIsDownloadingPlaylist(false);
            setDownloadProgress({ current: 0, total: 0 });
            setDownloadCancel(false);
        }
    };

    // Detectar client-side rendering
    useEffect(() => {
        setIsClient(true);
    }, []);

    // Extrair cores dominantes quando a playlist for carregada
    useEffect(() => {
        if (playlist?.coverImage) {
            extractDominantColors(playlist.coverImage);
        }
    }, [playlist?.coverImage]);

    useEffect(() => {
        if (playlistId) {
            const loadPlaylist = async () => {
                try {
                    setLoading(true);
                    setError(null);

                    const response = await fetch(`/api/playlists/${playlistId}`);
                    const data = await response.json();

                    if (response.ok) {
                        setPlaylist(data.playlist);
                    } else {
                        setError(data.error || 'Erro ao carregar playlist');
                    }
                } catch (err) {
                    setError('Erro ao carregar playlist');
                    console.error('Error fetching playlist:', err);
                } finally {
                    setLoading(false);
                }
            };
            loadPlaylist();
        }
    }, [playlistId]);

    // Verificar likes e downloads quando a playlist carrega
    useEffect(() => {
        if (!isClient || !playlist?.tracks) return;

        const trackIds = playlist.tracks.map(pt => pt.track?.id).filter(Boolean) as number[];
        checkUserLikes(trackIds);
        checkUserDownloads(trackIds);
    }, [playlist, session, isClient]);

    // Detectar quando a música termina e tocar a próxima
    useEffect(() => {
        if (!isClient || !currentTrack || !playlist?.tracks) return;

        const handleTrackEnd = () => {
            if (isShuffleActive && shuffledOrder.length > 0) {
                // Encontrar índice atual na ordem embaralhada
                const currentIndex = shuffledOrder.findIndex(index =>
                    playlist.tracks?.[index]?.track?.id === currentTrack.id
                );

                if (currentIndex !== -1 && currentIndex < shuffledOrder.length - 1) {
                    // Tocar próxima música na ordem embaralhada
                    const nextShuffledIndex = shuffledOrder[currentIndex + 1];
                    const nextTrack = playlist.tracks?.[nextShuffledIndex]?.track;
                    if (nextTrack) {
                        playTrack(nextTrack as any);
                    }
                }
            } else if (!isShuffleActive && playlist.tracks) {
                // Ordem normal
                const currentIndex = playlist.tracks.findIndex(pt => pt.track?.id === currentTrack.id);
                if (currentIndex !== -1 && currentIndex < playlist.tracks.length - 1) {
                    const nextTrack = playlist.tracks[currentIndex + 1]?.track;
                    if (nextTrack) {
                        playTrack(nextTrack as any);
                    }
                }
            }
        };

        // Simular detecção de fim de música (em uma implementação real, isso viria do player)
        // Por enquanto, vamos usar um timer para demonstrar
        const timer = setTimeout(handleTrackEnd, 30000); // 30 segundos para demo

        return () => clearTimeout(timer);
    }, [currentTrack, isShuffleActive, shuffledOrder, playlist, playTrack, isClient]);

    const handlePlayTrack = async (track: any) => {
        if (!session) {
            toast.error('🔒 Faça login para ouvir as músicas');
            return;
        }

        if (!playlist?.tracks) return;

        try {
            if (currentTrack?.id === track.id && isPlaying) {
                togglePlayPause();
            } else {
                // Converter PlaylistTracks para Tracks
                const tracks = playlist.tracks.map(pt => pt.track).filter(Boolean) as any[];
                await playTrack(track, tracks);
            }
        } catch (error) {
            console.error('Error playing track:', error);
            toast.error('Erro ao reproduzir música');
        }
    };

    const handlePlayPlaylist = async () => {
        if (!session) {
            toast.error('🔒 Faça login para ouvir as músicas');
            return;
        }

        if (!playlist?.tracks || playlist.tracks.length === 0) return;

        try {
            const firstTrack = playlist.tracks[0]?.track;
            if (firstTrack) {
                await handlePlayTrack(firstTrack);
            }
        } catch (error) {
            console.error('Error playing playlist:', error);
            toast.error('Erro ao reproduzir playlist');
        }
    };


    const handleShufflePlaylist = () => {
        if (playlist?.tracks && playlist.tracks.length > 0) {
            if (isShuffleActive) {
                // Desativar shuffle
                setIsShuffleActive(false);
                setShuffledOrder([]);
                toast.success('Modo aleatório desativado');
            } else {
                // Ativar shuffle
                const newShuffledOrder = Array.from({ length: playlist.tracks.length }, (_, i) => i)
                    .sort(() => Math.random() - 0.5);
                setShuffledOrder(newShuffledOrder);
                setIsShuffleActive(true);

                // Tocar primeira música embaralhada
                const firstShuffledIndex = newShuffledOrder[0];
                const firstTrack = playlist.tracks[firstShuffledIndex]?.track;
                if (firstTrack) {
                    playTrack(firstTrack as any);
                }
                toast.success('Modo aleatório ativado');
            }
        }
    };

    const handleSavePlaylist = async () => {
        if (!session?.user) {
            toast.error('🔒 Faça login para salvar playlists');
            return;
        }

        if (!playlist) {
            toast.error('❌ Playlist não encontrada');
            return;
        }

        console.log('🔍 Salvando playlist:', playlist.id, playlist.name);

        try {
            const response = await fetch('/api/library', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ playlistId: playlist.id })
            });

            console.log('🔍 Resposta da API:', response.status, response.ok);

            const data = await response.json();
            console.log('🔍 Dados recebidos:', data);

            if (response.ok) {
                toast.success(
                    (t) => (
                        <div className="flex items-center gap-3">
                            <span>Playlist salva na sua biblioteca!</span>
                            <button
                                onClick={() => {
                                    toast.dismiss(t.id);
                                    router.push('/profile?tab=library');
                                }}
                                className="px-3 py-1 bg-orange-500 hover:bg-orange-600 text-white text-sm rounded-lg transition-colors"
                            >
                                Ver Biblioteca
                            </button>
                        </div>
                    ),
                    { duration: 5000 }
                );
            } else {
                // Verificar se é erro de playlist já existente
                if (data.error === 'Playlist já está na sua biblioteca') {
                    toast.success(
                        (t) => (
                            <div className="flex items-center gap-3">
                                <span>Playlist já está na sua biblioteca!</span>
                                <button
                                    onClick={() => {
                                        toast.dismiss(t.id);
                                        router.push('/profile?tab=library');
                                    }}
                                    className="px-3 py-1 bg-orange-500 hover:bg-orange-600 text-white text-sm rounded-lg transition-colors"
                                >
                                    Ver Biblioteca
                                </button>
                            </div>
                        ),
                        { duration: 5000 }
                    );
                } else {
                    toast.error(`${data.error || 'Erro ao salvar playlist'}`);
                }
            }
        } catch (error) {
            console.error('❌ Erro ao salvar playlist:', error);
            toast.error('Erro ao salvar playlist na biblioteca');
        }
    };


    // Componente de Skeleton para o header
    const PlaylistHeaderSkeleton = () => (
        <div className="flex flex-col md:flex-row gap-6 p-6">
            <div className="w-48 h-48 bg-gray-800 rounded-lg animate-pulse"></div>
            <div className="flex-1 space-y-4">
                <div className="h-4 bg-gray-800 rounded w-20 animate-pulse"></div>
                <div className="h-12 bg-gray-800 rounded w-3/4 animate-pulse"></div>
                <div className="h-6 bg-gray-800 rounded w-1/2 animate-pulse"></div>
                <div className="flex gap-4">
                    <div className="h-10 bg-gray-800 rounded w-32 animate-pulse"></div>
                    <div className="h-10 bg-gray-800 rounded w-10 animate-pulse"></div>
                    <div className="h-10 bg-gray-800 rounded w-10 animate-pulse"></div>
                </div>
            </div>
        </div>
    );

    // Componente de Skeleton para a tabela
    const TracksTableSkeleton = () => (
        <div className="space-y-2 p-6">
            {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center gap-4 p-3">
                    <div className="w-6 h-6 bg-gray-800 rounded animate-pulse"></div>
                    <div className="w-12 h-12 bg-gray-800 rounded animate-pulse"></div>
                    <div className="flex-1 space-y-2">
                        <div className="h-4 bg-gray-800 rounded w-1/3 animate-pulse"></div>
                        <div className="h-3 bg-gray-800 rounded w-1/4 animate-pulse"></div>
                    </div>
                    <div className="h-4 bg-gray-800 rounded w-16 animate-pulse"></div>
                    <div className="h-4 bg-gray-800 rounded w-12 animate-pulse"></div>
                </div>
            ))}
        </div>
    );

    if (loading) {
        return (
            <div className="min-h-screen bg-black font-inter">
                <Header />
                <div className="container mx-auto pt-32">
                    <PlaylistHeaderSkeleton />
                    <TracksTableSkeleton />
                </div>
            </div>
        );
    }

    if (error || !playlist) {
        return (
            <div className="min-h-screen bg-black font-inter">
                <Header />
                <div className="flex items-center justify-center h-screen pt-32">
                    <div className="text-center">
                        <Music className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <h2 className="text-2xl font-bold text-white mb-2 font-inter">Playlist não encontrada</h2>
                        <p className="text-gray-400 mb-6 font-inter">{error || 'Esta playlist não existe ou foi removida'}</p>
                        <Button
                            onClick={() => router.back()}
                            className="bg-orange-500 hover:bg-orange-600 text-white font-inter"
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Voltar
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black pb-32 font-inter">
            <Header />
            <div className="container mx-auto pt-32">
                {/* Header da Playlist com Gradiente */}
                <div className="relative">
                    {/* Gradiente de fundo do hero baseado na cor da capa */}
                    <div
                        className="absolute inset-0 bg-gradient-to-b to-black transition-all duration-1000"
                        style={{
                            background: dominantColors
                                ? `linear-gradient(to bottom, ${dominantColors.primary}30, ${dominantColors.secondary}15, ${dominantColors.primary}08, #000000)`
                                : 'linear-gradient(to bottom, rgba(249, 115, 22, 0.3), rgba(234, 88, 12, 0.15), rgba(249, 115, 22, 0.08), #000000)'
                        }}
                    ></div>

                    <div className="relative flex flex-col md:flex-row gap-6 p-6">
                        {/* Capa da Playlist */}
                        <div className="w-48 h-48 md:w-64 md:h-64 relative">
                            {playlist.coverImage ? (
                                <Image
                                    src={playlist.coverImage}
                                    alt={playlist.name}
                                    fill
                                    className="object-cover rounded-2xl shadow-2xl"
                                />
                            ) : (
                                <div className="w-full h-full bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl flex items-center justify-center">
                                    <Music className="w-24 h-24 text-white/50" />
                                </div>
                            )}
                        </div>

                        {/* Informações da Playlist */}
                        <div className="flex-1 flex flex-col justify-end space-y-4">
                            <div>
                                <p className="text-sm font-medium text-gray-300 uppercase tracking-wider mb-2 font-inter">
                                    Playlist
                                </p>
                                <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 font-inter">
                                    {playlist.name}
                                </h1>
                                {playlist.description && (
                                    <p className="text-lg text-gray-300 mb-4 font-inter">
                                        {playlist.description}
                                    </p>
                                )}
                            </div>

                            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-300 font-inter">
                                <div className="flex items-center gap-1">
                                    <User className="w-4 h-4" />
                                    <span>Criada por {playlist.createdBy}</span>
                                </div>
                                <span>•</span>
                                <div className="flex items-center gap-1">
                                    <Music className="w-4 h-4" />
                                    <span>{playlist.trackCount || 0} músicas</span>
                                </div>
                                <span>•</span>
                                <div className="flex items-center gap-1">
                                    <Calendar className="w-4 h-4" />
                                    <span>{new Date(playlist.createdAt).toLocaleDateString('pt-BR')}</span>
                                </div>
                                <span>•</span>
                                <div className="flex items-center gap-1">
                                    {playlist.isPublic ? (
                                        <>
                                            <Eye className="w-4 h-4" />
                                            <span>Pública</span>
                                        </>
                                    ) : (
                                        <>
                                            <EyeOff className="w-4 h-4" />
                                            <span>Privada</span>
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* Botões de Ação */}
                            <div className="flex items-center gap-4">
                                <Button
                                    onClick={handlePlayPlaylist}
                                    className="text-white px-8 py-3 rounded-full text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 font-inter"
                                    style={{
                                        backgroundColor: dominantColors?.primary || '#f97316',
                                        '--hover-color': dominantColors?.secondary || '#ea580c'
                                    } as React.CSSProperties}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.backgroundColor = dominantColors?.secondary || '#ea580c';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.backgroundColor = dominantColors?.primary || '#f97316';
                                    }}
                                >
                                    {isPlaying ? (
                                        <>
                                            <Pause className="w-6 h-6 mr-2" />
                                            Tocando
                                        </>
                                    ) : (
                                        <>
                                            <Play className="w-6 h-6 mr-2" />
                                            Tocar
                                        </>
                                    )}
                                </Button>

                                <Button
                                    onClick={() => handleShufflePlaylist()}
                                    className={`w-12 h-12 rounded-full text-white border-2 transition-all duration-200 ${isShuffleActive
                                        ? ''
                                        : 'bg-black hover:bg-gray-900 border-green-500 hover:border-green-400'
                                        }`}
                                    style={isShuffleActive ? {
                                        backgroundColor: dominantColors?.primary || '#10b981',
                                        borderColor: dominantColors?.secondary || '#059669'
                                    } as React.CSSProperties : undefined}
                                    onMouseEnter={isShuffleActive ? (e) => {
                                        e.currentTarget.style.backgroundColor = dominantColors?.secondary || '#059669';
                                    } : undefined}
                                    onMouseLeave={isShuffleActive ? (e) => {
                                        e.currentTarget.style.backgroundColor = dominantColors?.primary || '#10b981';
                                    } : undefined}
                                >
                                    <Shuffle className="w-6 h-6" />
                                </Button>

                                <Button
                                    onClick={() => handleSavePlaylist()}
                                    className="w-12 h-12 rounded-full bg-black hover:bg-gray-900 text-white border-2 border-green-500 hover:border-green-400 transition-all duration-200"
                                >
                                    <Plus className="w-6 h-6" />
                                </Button>

                                <Button
                                    onClick={handleDownloadPlaylist}
                                    disabled={isDownloadingPlaylist}
                                    className={`w-12 h-12 rounded-full text-white border-2 transition-all duration-200 ${isDownloadingPlaylist
                                        ? 'bg-red-600 hover:bg-red-700 border-red-500 hover:border-red-400'
                                        : 'bg-black hover:bg-gray-900 border-green-500 hover:border-green-400'
                                        }`}
                                    title={isDownloadingPlaylist ? 'Cancelar download' : 'Baixar playlist'}
                                >
                                    {isDownloadingPlaylist ? (
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    ) : (
                                        <Download className="w-6 h-6" />
                                    )}
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Progress Bar (só aparece durante download) */}
                    {isDownloadingPlaylist && downloadProgress.total > 0 && (
                        <div className="mt-4 px-6">
                            <div className="flex justify-between text-sm text-gray-400 mb-2 font-inter">
                                <span>Baixando playlist...</span>
                                <span>{downloadProgress.current}/{downloadProgress.total}</span>
                            </div>
                            <div className="w-full bg-gray-700 rounded-full h-2">
                                <div
                                    className="bg-green-500 h-2 rounded-full transition-all duration-300"
                                    style={{ width: `${(downloadProgress.current / downloadProgress.total) * 100}%` }}
                                ></div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Tabela de Músicas */}
                <div className="px-6 pb-6">
                    {playlist.tracks && playlist.tracks.length > 0 ? (
                        <div className="bg-black overflow-hidden">
                            {/* Cabeçalho da Tabela */}
                            <div className="px-6 py-4">
                                {/* Header das Colunas */}
                                <div className="flex items-center gap-4 text-sm text-gray-400 border-b border-gray-700 pb-2 font-inter">
                                    <div className="w-12 text-center">#</div>
                                    <div className="w-12"></div>
                                    <div className="flex-1">Título</div>
                                    <div className="w-32 flex items-center gap-1">
                                        Adicionada em
                                        <div className="w-0 h-0 border-l-2 border-l-transparent border-r-2 border-r-transparent border-b-2 border-b-green-500"></div>
                                    </div>
                                    <div className="w-12 flex items-center justify-center">
                                        Like
                                    </div>
                                    <div className="w-12 flex items-center justify-center">
                                        Download
                                    </div>
                                </div>
                            </div>

                            {/* Lista de Músicas */}
                            <div>
                                {playlist.tracks.map((playlistTrack: PlaylistTrack, index: number) => {
                                    const track = playlistTrack.track;
                                    if (!track) return null;

                                    const isCurrentTrack = currentTrack?.id === track.id;
                                    const isPlayingTrack = isCurrentTrack && isPlaying;

                                    return (
                                        <div
                                            key={track.id}
                                            className={`px-6 py-4 hover:bg-red-900/20 transition-colors cursor-pointer group ${isCurrentTrack ? 'bg-orange-500/10' : ''
                                                }`}
                                            onClick={() => handlePlayTrack(track)}
                                        >
                                            <div className="flex items-center gap-4">
                                                {/* Número da Música com estilo do most-popular */}
                                                <div className="w-12 text-center">
                                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${index + 1 <= 3
                                                        ? 'bg-gradient-to-br from-yellow-400 to-yellow-600 text-black'
                                                        : index + 1 <= 10
                                                            ? 'bg-gradient-to-br from-gray-400 to-gray-600 text-white'
                                                            : 'bg-gray-700 text-gray-300'
                                                        }`}>
                                                        {index + 1}
                                                    </div>
                                                </div>

                                                {/* Capa da Música com Play/Pause */}
                                                <div className="w-12 h-12 relative group/thumbnail">
                                                    <Image
                                                        src={track.imageUrl || playlist.coverImage || '/placeholder-music.jpg'}
                                                        alt={track.songName}
                                                        fill
                                                        className="object-cover rounded"
                                                    />
                                                    {/* Overlay com botão Play/Pause */}
                                                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover/thumbnail:opacity-100 transition-opacity duration-200 flex items-center justify-center rounded">
                                                        {isCurrentTrack ? (
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    togglePlayPause();
                                                                }}
                                                                className="text-white hover:text-orange-400 transition-colors"
                                                            >
                                                                {isPlayingTrack ? (
                                                                    <Pause className="w-6 h-6" />
                                                                ) : (
                                                                    <Play className="w-6 h-6" />
                                                                )}
                                                            </button>
                                                        ) : (
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handlePlayTrack(track);
                                                                }}
                                                                className="text-white hover:text-orange-400 transition-colors"
                                                            >
                                                                <Play className="w-6 h-6" />
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Informações da Música */}
                                                <div className="flex-1 min-w-0">
                                                    <h3 className={`text-sm font-semibold truncate font-inter ${isCurrentTrack ? 'text-orange-500' : 'text-white'
                                                        }`}>
                                                        {track.songName}
                                                    </h3>
                                                    <p className="text-gray-400 text-sm truncate font-inter">
                                                        {track.artist}
                                                    </p>
                                                    {/* Tags de estilo e pool destacadas */}
                                                    <div className="flex gap-1 flex-wrap mt-1">
                                                        {track.style && (
                                                            <Link
                                                                href={`/genres/${generateGenreSlug(track.style)}`}
                                                                className="bg-red-500/20 text-red-300 px-1.5 py-0.5 rounded font-inter font-medium text-xs hover:bg-red-500/30 hover:text-red-200 transition-all duration-200 border border-red-500/30"
                                                                title={`Ver todas as músicas de ${track.style}`}
                                                            >
                                                                {track.style}
                                                            </Link>
                                                        )}
                                                        {track.pool && (
                                                            <Link
                                                                href={`/pools/${track.pool.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '').replace(/-+/g, '-').replace(/^-|-$/g, '')}`}
                                                                className="bg-blue-500/20 text-blue-300 px-1.5 py-0.5 rounded font-inter font-medium text-xs hover:bg-blue-500/30 hover:text-blue-200 transition-all duration-200 border border-blue-500/30"
                                                                title={`Ver todas as músicas da pool ${track.pool}`}
                                                            >
                                                                {track.pool}
                                                            </Link>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Data de Adição */}
                                                <div className="w-32 text-gray-400 text-sm font-inter">
                                                    {new Date(playlistTrack.addedAt).toLocaleDateString('pt-BR')}
                                                </div>

                                                {/* Botão de Like */}
                                                <div className="w-12 flex items-center justify-center">
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleLike(track);
                                                        }}
                                                        disabled={likingTracks.has(track.id)}
                                                        className={`transition-colors ${likedTracks.has(track.id)
                                                            ? 'text-red-500 hover:text-red-400'
                                                            : 'text-gray-400 hover:text-red-500'
                                                            }`}
                                                        title={likedTracks.has(track.id) ? 'Descurtir' : 'Curtir'}
                                                    >
                                                        {likingTracks.has(track.id) ? (
                                                            <div className="w-4 h-4 border border-current border-t-transparent rounded-full animate-spin" />
                                                        ) : (
                                                            <Heart className={`w-4 h-4 ${likedTracks.has(track.id) ? 'fill-current' : ''}`} />
                                                        )}
                                                    </button>
                                                </div>

                                                {/* Botão de Download Individual */}
                                                <div className="w-12 flex items-center justify-center">
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleDownloadTrack(track);
                                                        }}
                                                        disabled={downloadingTracks.has(track.id)}
                                                        className={`transition-all duration-200 rounded-full p-2 ${downloadedTracks.has(track.id)
                                                            ? 'text-green-500 hover:text-green-400 bg-green-500/10 hover:bg-green-500/20'
                                                            : 'text-gray-400 hover:text-orange-500 bg-gray-800/50 hover:bg-orange-500/10'
                                                            }`}
                                                        title={downloadedTracks.has(track.id) ? 'Música baixada' : 'Baixar música'}
                                                    >
                                                        {downloadingTracks.has(track.id) ? (
                                                            <div className="w-4 h-4 border border-current border-t-transparent rounded-full animate-spin" />
                                                        ) : downloadedTracks.has(track.id) ? (
                                                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                            </svg>
                                                        ) : (
                                                            <Download className="w-4 h-4" />
                                                        )}
                                                    </button>
                                                </div>

                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <Music className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-xl font-semibold text-white mb-2 font-inter">Playlist vazia</h3>
                            <p className="text-gray-400 font-inter">Esta playlist ainda não possui músicas</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Footer Player */}
            <FooterPlayer />
        </div>
    );
}
