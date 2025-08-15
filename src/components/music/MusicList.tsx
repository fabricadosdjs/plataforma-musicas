"use client";

import React, { useState } from 'react';
import { Track } from '@/types/track';
import { useToast } from '@/hooks/useToast';
import { useGlobalPlayer } from '@/context/GlobalPlayerContext';
import { useSession } from 'next-auth/react';
import { Play, Pause, Download, Heart, Plus, Calendar } from 'lucide-react';
import { formatDateBrazil } from '@/utils/dateUtils';

interface MusicListProps {
    tracks: Track[];
    downloadedTrackIds: number[];
    setDownloadedTrackIds: (ids: number[]) => void;
    showDate?: boolean; // Nova prop para controlar exibição da data
}

export const MusicList = ({
    tracks,
    downloadedTrackIds,
    setDownloadedTrackIds,
    showDate = true // Por padrão mostra a data
}: MusicListProps) => {
    const [downloadingTracks, setDownloadingTracks] = useState<Set<number>>(new Set());
    const [likedTrackIds, setLikedTrackIds] = useState<Set<number>>(new Set());
    const { showToast } = useToast();
    const { playTrack, currentTrack, isPlaying } = useGlobalPlayer();
    const { data: session } = useSession();

    // Carregar likes do localStorage ao montar o componente
    React.useEffect(() => {
        const savedLikedTracks = localStorage.getItem('likedTracks');
        if (savedLikedTracks) {
            try {
                const likedIds = JSON.parse(savedLikedTracks);
                // Filtrar apenas IDs válidos (números)
                const validIds = likedIds.filter((id: any) => typeof id === 'number' && !isNaN(id));

                // Se houver IDs inválidos, limpar o localStorage
                if (validIds.length !== likedIds.length) {
                    console.log('🧹 Limpando IDs inválidos do localStorage de likes');
                    localStorage.setItem('likedTracks', JSON.stringify(validIds));
                }

                setLikedTrackIds(new Set(validIds));
                console.log('✅ Likes carregados:', validIds);
            } catch (error) {
                console.error('❌ Erro ao carregar likes:', error);
                localStorage.removeItem('likedTracks'); // Limpar dados corrompidos
                setLikedTrackIds(new Set());
            }
        }
    }, []);

    // Sincronizar dados do localStorage periodicamente (a cada 5 segundos)
    React.useEffect(() => {
        const syncInterval = setInterval(() => {
            // Sincronizar downloads
            try {
                const savedDownloadedTracks = JSON.parse(localStorage.getItem('downloadedTracks') || '[]');
                const savedDownloadedIds = savedDownloadedTracks.map((track: any) => track.id);

                // Adicionar IDs que estão no localStorage mas não no estado
                const missingIds = savedDownloadedIds.filter((id: number) => !downloadedTrackIds.includes(id));
                if (missingIds.length > 0) {
                    console.log('🔄 Sincronizando downloads perdidos:', missingIds);
                    setDownloadedTrackIds([...downloadedTrackIds, ...missingIds]);
                }
            } catch (error) {
                console.error('❌ Erro ao sincronizar downloads:', error);
            }

            // Sincronizar likes
            try {
                const savedLikedIds = JSON.parse(localStorage.getItem('likedTracks') || '[]');

                // Adicionar IDs que estão no localStorage mas não no estado
                const missingLikedIds = savedLikedIds.filter((id: number) => !likedTrackIds.has(id));
                if (missingLikedIds.length > 0) {
                    console.log('🔄 Sincronizando likes perdidos:', missingLikedIds);
                    setLikedTrackIds(prev => new Set([...prev, ...missingLikedIds]));
                }
            } catch (error) {
                console.error('❌ Erro ao sincronizar likes:', error);
            }
        }, 5000); // Sincronizar a cada 5 segundos

        return () => clearInterval(syncInterval);
    }, [downloadedTrackIds, likedTrackIds]);

    // Carregar downloads do localStorage ao montar o componente
    React.useEffect(() => {
        const savedDownloadedTracks = localStorage.getItem('downloadedTracks');
        if (savedDownloadedTracks) {
            try {
                const downloadedTracks = JSON.parse(savedDownloadedTracks);
                // Filtrar apenas tracks válidos
                const validTracks = downloadedTracks.filter((track: any) => track && track.id && track.songName);
                const downloadedIds = validTracks.map((track: any) => track.id);

                // Se houver tracks inválidos, limpar o localStorage
                if (validTracks.length !== downloadedTracks.length) {
                    console.log('🧹 Limpando tracks inválidos do localStorage');
                    localStorage.setItem('downloadedTracks', JSON.stringify(validTracks));
                }

                setDownloadedTrackIds(downloadedIds);
                console.log('✅ Downloads carregados:', downloadedIds);
            } catch (error) {
                console.error('❌ Erro ao carregar downloads:', error);
                localStorage.removeItem('downloadedTracks'); // Limpar dados corrompidos
                setDownloadedTrackIds([]);
            }
        }
    }, []);

    // Função para gerar thumbnail baseado no nome da música
    const generateThumbnail = (track: Track) => {
        const initials = `${track.artist.charAt(0)}${track.songName.charAt(0)}`.toUpperCase();
        const colors = [
            'from-purple-500 to-pink-500',
            'from-blue-500 to-cyan-500',
            'from-green-500 to-emerald-500',
            'from-orange-500 to-red-500',
            'from-indigo-500 to-purple-500',
            'from-teal-500 to-blue-500',
            'from-yellow-500 to-orange-500',
            'from-pink-500 to-rose-500'
        ];
        const colorIndex = (track.id % colors.length);
        return { initials, colors: colors[colorIndex] };
    };

    // Função para play/pause usando o GlobalPlayer
    const handlePlayPause = async (track: Track) => {
        try {
            // Converter o track para o formato esperado pelo GlobalPlayer
            const globalTrack = {
                id: track.id,
                title: track.songName,
                songName: track.songName,
                artist: track.artist,
                artistName: track.artist,
                url: track.previewUrl || track.downloadUrl,
                downloadUrl: track.downloadUrl,
                previewUrl: track.previewUrl
            };

            // Se a música atual está tocando, pausar
            if (currentTrack?.id === track.id && isPlaying) {
                // O FooterPlayerNew já tem o botão de pause, então só precisamos pausar
                // Aqui vamos apenas parar a música atual
                return;
            }

            // Tocar a nova música
            await playTrack(globalTrack, tracks.map(t => ({
                id: t.id,
                title: t.songName,
                songName: t.songName,
                artist: t.artist,
                artistName: t.artist,
                url: t.previewUrl || t.downloadUrl,
                downloadUrl: t.downloadUrl,
                previewUrl: t.previewUrl
            })));

            showToast(`🎵 Tocando: ${track.songName}`, 'success');
        } catch (error) {
            console.error('❌ Erro ao tocar música:', error);
            showToast('❌ Erro ao reproduzir música', 'error');
        }
    };

    const handleDownload = async (track: Track) => {
        if (downloadingTracks.has(track.id)) return;

        setDownloadingTracks(prev => new Set(prev).add(track.id));

        try {
            const response = await fetch('/api/admin/download-track', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    trackId: track.id,
                    originalFileName: `${track.artist} - ${track.songName}.mp3`
                }),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${track.artist} - ${track.songName}.mp3`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);

            // Adicionar à lista de músicas baixadas
            setDownloadedTrackIds([...downloadedTrackIds, track.id]);

            // Salvar no localStorage
            const savedTracks = JSON.parse(localStorage.getItem('downloadedTracks') || '[]');
            const updatedTracks = [...savedTracks, track];
            localStorage.setItem('downloadedTracks', JSON.stringify(updatedTracks));

            // Log para debug
            console.log('✅ Música baixada e salva:', track.id, track.songName);
            console.log('📊 Total de downloads:', updatedTracks.length);

            showToast(`✅ ${track.songName} baixada com sucesso!`, 'success');
        } catch (error) {
            console.error('❌ Erro ao baixar música:', error);
            showToast('❌ Erro ao baixar música', 'error');
        } finally {
            setDownloadingTracks(prev => {
                const newSet = new Set(prev);
                newSet.delete(track.id);
                return newSet;
            });
        }
    };

    const handleLike = (track: Track) => {
        const isLiked = likedTrackIds.has(track.id);

        if (isLiked) {
            // Remover do like
            const newLikedIds = new Set(likedTrackIds);
            newLikedIds.delete(track.id);
            setLikedTrackIds(newLikedIds);

            // Salvar no localStorage
            localStorage.setItem('likedTracks', JSON.stringify(Array.from(newLikedIds)));

            // Log para debug
            console.log('💔 Like removido:', track.id, track.songName);
            console.log('📊 Total de likes:', newLikedIds.size);

            showToast(`💔 ${track.songName} removida dos favoritos`, 'info');
        } else {
            // Adicionar ao like
            const newLikedIds = new Set(likedTrackIds);
            newLikedIds.add(track.id);
            setLikedTrackIds(newLikedIds);

            // Salvar no localStorage
            localStorage.setItem('likedTracks', JSON.stringify(Array.from(newLikedIds)));

            // Log para debug
            console.log('❤️ Like adicionado:', track.id, track.songName);
            console.log('📊 Total de likes:', newLikedIds.size);

            showToast(`❤️ ${track.songName} adicionada aos favoritos!`, 'success');
        }
    };

    const isDownloaded = (track: Track) => {
        // Verificar apenas no estado local para evitar setState durante render
        return downloadedTrackIds.includes(track.id);
    };

    const isLiked = (track: Track) => {
        // Verificar apenas no estado local para evitar setState durante render
        return likedTrackIds.has(track.id);
    };

    return (
        <div className="space-y-0">
            {tracks.map((track, index) => {
                const { initials, colors } = generateThumbnail(track);
                const isCurrentlyPlaying = currentTrack?.id === track.id && isPlaying;
                const isDownloadedTrack = isDownloaded(track);

                return (
                    <div key={track.id}>
                        <div
                            className={`group py-1 px-4 ${isCurrentlyPlaying ? '' : ''
                                }`}
                        >
                            <div className="flex items-center gap-2 h-20">
                                {/* Thumbnail com imagem real ou fallback para iniciais */}
                                <div className="flex-shrink-0 relative h-20 w-20">
                                    {track.imageUrl && track.imageUrl !== '' && track.imageUrl !== 'undefined' ? (
                                        <img
                                            src={track.imageUrl}
                                            alt={`${track.artist} - ${track.songName}`}
                                            className="w-20 h-20 rounded-xl object-cover shadow-lg border border-white/10"
                                            onError={(e) => {
                                                // Fallback para iniciais se a imagem falhar
                                                const target = e.target as HTMLImageElement;
                                                target.style.display = 'none';
                                                const fallback = target.nextElementSibling as HTMLElement;
                                                if (fallback) fallback.style.display = 'flex';
                                            }}
                                        />
                                    ) : null}
                                    <div
                                        className={`w-20 h-20 rounded-xl bg-gradient-to-br ${colors} flex items-center justify-center text-white font-bold text-lg shadow-lg border border-white/10 ${track.imageUrl && track.imageUrl !== '' && track.imageUrl !== 'undefined' ? 'hidden' : ''}`}
                                        style={{ display: track.imageUrl && track.imageUrl !== '' && track.imageUrl !== 'undefined' ? 'none' : 'flex' }}
                                    >
                                        {initials}
                                    </div>

                                    {/* Botão Play/Pause sobreposto */}
                                    <button
                                        onClick={() => handlePlayPause(track)}
                                        className="absolute inset-0 bg-black/60 rounded-xl opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all duration-200 backdrop-blur-sm"
                                    >
                                        {isCurrentlyPlaying ? (
                                            <Pause className="h-6 w-6 text-white drop-shadow-lg" />
                                        ) : (
                                            <Play className="h-6 w-6 text-white drop-shadow-lg ml-0.5" />
                                        )}
                                    </button>
                                </div>

                                {/* Informações da música */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-0.5 mt-0">
                                        <h3 className="text-white font-bold text-sm truncate tracking-wide font-sans">
                                            {track.songName}
                                        </h3>
                                        {isCurrentlyPlaying && (
                                            <span className="text-blue-400 text-xs font-semibold bg-blue-500/20 px-3 py-1 rounded-full border border-blue-500/30 font-sans">
                                                Tocando
                                            </span>
                                        )}
                                    </div>

                                    <p className="text-gray-300 text-sm font-medium mb-0.5 font-sans">
                                        {track.artist}
                                    </p>

                                    {/* Estilo e Pool lado a lado */}
                                    <div className="flex items-center gap-2 mb-0.5">
                                        {track.style && (
                                            <button
                                                onClick={() => {
                                                    const url = `/new?style=${encodeURIComponent(track.style!)}`;
                                                    window.history.pushState({}, '', url);
                                                    window.location.reload();
                                                }}
                                                className="text-xs bg-gradient-to-r from-blue-500/20 to-blue-600/20 text-blue-300 px-2 py-0.5 rounded-full border border-blue-400/30 font-sans hover:from-blue-500/30 hover:to-blue-600/30 hover:border-blue-400/50 hover:text-blue-200 transition-all duration-200 cursor-pointer active:scale-95"
                                                title={`Filtrar por estilo: ${track.style}`}
                                            >
                                                {track.style}
                                            </button>
                                        )}
                                        {track.pool && (
                                            <button
                                                onClick={() => {
                                                    const url = `/new?pool=${encodeURIComponent(track.pool!)}`;
                                                    window.history.pushState({}, '', url);
                                                    window.location.reload();
                                                }}
                                                className="text-xs bg-gradient-to-r from-green-500/20 to-green-600/20 text-green-300 px-2 py-0.5 rounded-full border border-green-400/30 font-sans hover:from-green-500/30 hover:to-green-600/30 hover:border-green-400/50 hover:text-green-200 transition-all duration-200 cursor-pointer active:scale-95"
                                                title={`Filtrar por pool: ${track.pool}`}
                                            >
                                                {track.pool}
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {/* Botões de ação */}
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => handleDownload(track)}
                                        disabled={downloadingTracks.has(track.id) || isDownloadedTrack}
                                        className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${isDownloadedTrack
                                            ? 'bg-green-600/20 text-green-400 border border-green-600/30 cursor-not-allowed'
                                            : 'bg-gray-700/60 text-gray-300 border border-gray-600/50 hover:bg-gray-600/60 hover:text-gray-200'
                                            } font-sans`}
                                        title={isDownloadedTrack ? 'Música já baixada' : 'Baixar música'}
                                    >
                                        {downloadingTracks.has(track.id) ? (
                                            <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                                        ) : (
                                            <Download className="h-3 w-3" />
                                        )}
                                        {isDownloadedTrack ? 'Baixado' : 'Download'}
                                    </button>

                                    <button
                                        onClick={() => handleLike(track)}
                                        className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${isLiked(track)
                                            ? 'bg-red-600/20 text-red-400 border border-red-600/30'
                                            : 'bg-gray-700/60 text-gray-300 border border-gray-600/50 hover:bg-red-600/20 hover:text-red-400 hover:border-red-600/30'
                                            } font-sans`}
                                        title={isLiked(track) ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
                                    >
                                        <Heart className={`h-3 w-3 ${isLiked(track) ? 'fill-current' : ''}`} />
                                        {isLiked(track) ? 'Curtido' : 'Curtir'}
                                    </button>
                                </div>
                            </div>

                            {/* Linha separadora elegante */}
                            {index < tracks.length - 1 && (
                                <div className="h-px bg-gray-600/40 mt-3 ml-20 mr-4"></div>
                            )}

                            {/* Linha separadora adicional após a última row de cada data */}
                            {index === tracks.length - 1 && (
                                <div className="h-px bg-gray-600/60 mt-3 ml-20 mr-4"></div>
                            )}
                        </div>
 