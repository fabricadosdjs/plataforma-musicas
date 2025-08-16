"use client";

import React, { useState, useMemo } from 'react';
import { Track } from '@/types/track';
import { useToast } from '@/hooks/useToast';
import { useGlobalPlayer } from '@/context/GlobalPlayerContext';
import { useSession } from 'next-auth/react';
import { Play, Pause, Download, Heart, Plus, Calendar } from 'lucide-react';
import { formatDateBrazil, getDateKeyBrazil, isTodayBrazil, isYesterdayBrazil } from '@/utils/dateUtils';
import { useRouter } from 'next/navigation';

interface MusicListProps {
    tracks: Track[];
    downloadedTrackIds: number[];
    setDownloadedTrackIds: (ids: number[] | ((prev: number[]) => number[])) => void;
    showDate?: boolean; // Nova prop para controlar exibição da data
}

interface GroupedTracks {
    [key: string]: {
        label: string;
        tracks: Track[];
        date: Date;
    };
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
    const router = useRouter();

    // Agrupar músicas por data de postagem
    const groupedTracks = useMemo(() => {
        const groups: GroupedTracks = {};

        tracks.forEach(track => {
            // Usar releaseDate se disponível, senão createdAt
            const trackDate = track.releaseDate || track.createdAt;
            if (!trackDate) return;

            const dateKey = getDateKeyBrazil(trackDate);
            const date = new Date(trackDate);

            if (!groups[dateKey]) {
                let label = '';
                if (dateKey === 'today') {
                    label = '📅 Hoje';
                } else if (dateKey === 'yesterday') {
                    label = '📅 Ontem';
                } else if (dateKey === 'future') {
                    label = '🚀 Em breve';
                } else {
                    label = `📅 ${formatDateBrazil(date)}`;
                }

                groups[dateKey] = {
                    label,
                    tracks: [],
                    date
                };
            }

            groups[dateKey].tracks.push(track);
        });

        // Ordenar grupos por data (mais recente primeiro)
        const sortedGroups: GroupedTracks = {};
        Object.keys(groups)
            .sort((a, b) => {
                if (a === 'future') return -1;
                if (b === 'future') return 1;
                if (a === 'today') return -1;
                if (b === 'today') return 1;
                if (a === 'yesterday') return -1;
                if (b === 'yesterday') return 1;
                return groups[b].date.getTime() - groups[a].date.getTime();
            })
            .forEach(key => {
                sortedGroups[key] = groups[key];
            });

        return sortedGroups;
    }, [tracks]);

    // Carregar likes do localStorage ao montar o componente (apenas para usuários logados)
    React.useEffect(() => {
        if (!session) return;

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
    }, [session]);

    // Sincronizar dados do localStorage periodicamente (a cada 5 segundos) - apenas para usuários logados
    React.useEffect(() => {
        if (!session) return;

        const syncInterval = setInterval(() => {
            // Sincronizar downloads
            try {
                const savedDownloadedTracks = JSON.parse(localStorage.getItem('downloadedTracks') || '[]');
                const savedDownloadedIds = savedDownloadedTracks.map((track: any) => track.id);

                // Adicionar IDs que estão no localStorage mas não no estado
                const missingIds = savedDownloadedIds.filter((id: number) => !downloadedTrackIds.includes(id));
                if (missingIds.length > 0) {
                    console.log('🔄 Sincronizando downloads perdidos:', missingIds);
                    setDownloadedTrackIds((prev: number[]) => [...prev, ...missingIds]);
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
    }, [session, downloadedTrackIds, likedTrackIds]);

    // Carregar downloads do localStorage ao montar o componente (apenas para usuários logados)
    React.useEffect(() => {
        if (!session) return;

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
    }, [session]);

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

    // Função para play/pause usando o GlobalPlayer (permitido para todos os usuários)
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
                previewUrl: track.previewUrl,
                imageUrl: track.imageUrl
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
                previewUrl: t.previewUrl,
                imageUrl: t.imageUrl
            })));

            showToast(`🎵 Tocando: ${track.songName}`, 'success');
        } catch (error) {
            console.error('❌ Erro ao tocar música:', error);
            showToast('❌ Erro ao reproduzir música', 'error');
        }
    };

    const handleDownload = async (track: Track) => {
        if (!session) {
            showToast('🔐 Faça login para baixar músicas', 'warning');
            return;
        }

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
            setDownloadedTrackIds((prev: number[]) => [...prev, track.id]);

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
        if (!session) {
            showToast('🔐 Faça login para curtir músicas', 'warning');
            return;
        }

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
        // Apenas usuários logados podem ter downloads
        if (!session) return false;
        return downloadedTrackIds.includes(track.id);
    };

    const isLiked = (track: Track) => {
        // Verificar apenas no estado local para evitar setState durante render
        // Apenas usuários logados podem ter likes
        if (!session) return false;
        return likedTrackIds.has(track.id);
    };

    // Função para navegação rápida com filtro de estilo
    const handleStyleClick = (style: string | undefined) => {
        if (style && style !== 'N/A') {
            router.push(`/new?style=${encodeURIComponent(style)}`);
        }
    };

    // Função para navegação rápida com filtro de pool
    const handlePoolClick = (pool: string | undefined) => {
        if (pool && pool !== 'N/A') {
            router.push(`/new?pool=${encodeURIComponent(pool)}`);
        }
    };

    // Função para baixar músicas em lotes de 10 MP3s diretos
    const downloadTracksInBatches = async (tracksToDownload: Track[], isAllTracks: boolean = false) => {
        if (!session) {
            showToast('🔐 Faça login para baixar músicas', 'warning');
            return;
        }

        // Filtrar músicas baseado no tipo de download
        let tracksToProcess: Track[];
        if (isAllTracks) {
            // Baixar todas as músicas da data
            tracksToProcess = tracksToDownload;
        } else {
            // Baixar apenas músicas não baixadas
            tracksToProcess = tracksToDownload.filter(track => !downloadedTrackIds.includes(track.id));
        }

        if (tracksToProcess.length === 0) {
            const message = isAllTracks
                ? 'Todas as músicas desta data já foram baixadas!'
                : 'Não há músicas novas para baixar!';
            showToast(message, 'info');
            return;
        }

        // Marcar todas as músicas como "baixando"
        setDownloadingTracks(prev => new Set([...prev, ...tracksToProcess.map(t => t.id)]));

        try {
            // Dividir em lotes de 10
            const batchSize = 10;
            const batches = [];
            for (let i = 0; i < tracksToProcess.length; i += batchSize) {
                batches.push(tracksToProcess.slice(i, i + batchSize));
            }

            let totalDownloaded = 0;

            // Processar cada lote
            for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
                const batch = batches[batchIndex];

                showToast(`📥 Baixando lote ${batchIndex + 1} de ${batches.length}...`, 'info');

                // Baixar cada música do lote individualmente
                for (const track of batch) {
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

                        if (response.ok) {
                            const blob = await response.blob();
                            const url = window.URL.createObjectURL(blob);
                            const a = document.createElement('a');
                            a.href = url;
                            a.download = `${track.artist} - ${track.songName}.mp3`;
                            document.body.appendChild(a);
                            a.click();
                            window.URL.revokeObjectURL(url);
                            document.body.removeChild(a);

                            // Marcar como baixada
                            setDownloadedTrackIds(prev => [...prev, track.id]);
                            totalDownloaded++;

                            // Salvar no localStorage
                            const savedTracks = JSON.parse(localStorage.getItem('downloadedTracks') || '[]');
                            const updatedTracks = [...savedTracks, track];
                            localStorage.setItem('downloadedTracks', JSON.stringify(updatedTracks));

                            console.log(`✅ ${track.songName} baixada com sucesso`);
                        } else {
                            console.error(`❌ Erro ao baixar ${track.songName}:`, response.status);
                        }
                    } catch (error) {
                        console.error(`❌ Erro ao baixar ${track.songName}:`, error);
                    }

                    // Pequena pausa entre downloads para não sobrecarregar
                    await new Promise(resolve => setTimeout(resolve, 100));
                }

                // Pausa entre lotes
                if (batchIndex < batches.length - 1) {
                    await new Promise(resolve => setTimeout(resolve, 500));
                }
            }

            // Sucesso final
            const message = isAllTracks
                ? `✅ ${totalDownloaded} músicas baixadas com sucesso!`
                : `✅ ${totalDownloaded} músicas novas baixadas com sucesso!`;
            showToast(message, 'success');

            console.log(`🎉 Download em lote concluído: ${totalDownloaded} músicas baixadas`);

        } catch (error) {
            console.error('❌ Erro ao baixar músicas em lote:', error);
            showToast('❌ Erro ao baixar músicas', 'error');
        } finally {
            // Limpar estado de "baixando"
            setDownloadingTracks(prev => {
                const newSet = new Set(prev);
                tracksToProcess.forEach(track => newSet.delete(track.id));
                return newSet;
            });
        }
    };

    // Função para baixar apenas músicas novas (não baixadas)
    const downloadNewTracks = async (tracksToDownload: Track[]) => {
        await downloadTracksInBatches(tracksToDownload, false);
    };

    // Função para baixar todas as músicas da data
    const downloadAllTracks = async (tracksToDownload: Track[]) => {
        await downloadTracksInBatches(tracksToDownload, true);
    };

    return (
        <div className="space-y-0">
            {Object.entries(groupedTracks).map(([dateKey, group], groupIndex) => (
                <div key={dateKey} className={`space-y-4 ${groupIndex > 0 ? 'pt-8' : ''}`}>
                    {/* Cabeçalho de data em linha horizontal */}
                    <div className="relative mb-6">
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                                <h2 className="text-2xl font-bold text-white font-sans">{group.label}</h2>
                                <span className="text-gray-400 text-base font-medium bg-gray-800/50 px-3 py-1 rounded-full">
                                    {group.tracks.length} {group.tracks.length === 1 ? 'música' : 'músicas'}
                                </span>
                            </div>

                            {/* Botões de download em massa para esta data */}
                            <div className="flex items-center gap-2">
                                {/* Botão Baixar Novas (apenas músicas não baixadas) */}
                                <button
                                    onClick={() => downloadNewTracks(group.tracks)}
                                    className="bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white px-4 py-2 rounded-lg font-semibold text-sm transition-all duration-200 transform hover:scale-105 shadow-lg border border-blue-400/30 flex items-center gap-2"
                                    title={`Baixar ${group.tracks.filter(t => !downloadedTrackIds.includes(t.id)).length} músicas novas desta data`}
                                >
                                    <Download className="h-4 w-4" />
                                    Baixar Novas ({group.tracks.filter(t => !downloadedTrackIds.includes(t.id)).length})
                                </button>

                                {/* Botão Baixar Tudo (todas as músicas da data) */}
                                <button
                                    onClick={() => downloadAllTracks(group.tracks)}
                                    className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-4 py-2 rounded-lg font-semibold text-sm transition-all duration-200 transform hover:scale-105 shadow-lg border border-green-400/30 flex items-center gap-2"
                                    title={`Baixar todas as ${group.tracks.length} músicas desta data`}
                                >
                                    <Download className="h-4 w-4" />
                                    Baixar Tudo ({group.tracks.length})
                                </button>
                            </div>
                        </div>

                        {/* Linha verde sutil */}
                        <div className="h-px bg-green-500/40 rounded-full"></div>
                    </div>
                    {group.tracks.map((track, index) => {
                        const { initials, colors } = generateThumbnail(track);
                        const isCurrentlyPlaying = currentTrack?.id === track.id && isPlaying;
                        const isDownloadedTrack = isDownloaded(track);

                        return (
                            <div key={track.id}>
                                <div
                                    className={`group py-1 px-2 sm:px-4 ${isCurrentlyPlaying ? '' : ''
                                        }`}
                                >
                                    <div className="flex items-center gap-2 h-16 sm:h-20">
                                        {/* Thumbnail com imagem real ou fallback para iniciais */}
                                        <div className="flex-shrink-0 relative h-16 w-16 sm:h-20 sm:w-20">
                                            {track.imageUrl && track.imageUrl !== '' && track.imageUrl !== 'undefined' ? (
                                                <img
                                                    src={track.imageUrl}
                                                    alt={`${track.artist} - ${track.songName}`}
                                                    className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg sm:rounded-xl object-cover shadow-lg border border-red-500/30"
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
                                                className={`w-16 h-16 sm:w-20 sm:h-20 rounded-lg sm:rounded-xl bg-gradient-to-br ${colors} flex items-center justify-center text-white font-bold text-sm sm:text-lg shadow-lg border border-red-500/30 ${track.imageUrl && track.imageUrl !== '' && track.imageUrl !== 'undefined' ? 'hidden' : ''}`}
                                                style={{ display: track.imageUrl && track.imageUrl !== '' && track.imageUrl !== 'undefined' ? 'none' : 'flex' }}
                                            >
                                                {initials}
                                            </div>

                                            {/* Botão Play/Pause sobreposto */}
                                            <button
                                                onClick={() => handlePlayPause(track)}
                                                className="absolute inset-0 bg-red-900/60 rounded-lg sm:rounded-xl opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all duration-200 backdrop-blur-sm"
                                            >
                                                {isCurrentlyPlaying ? (
                                                    <Pause className="h-5 w-5 sm:h-6 sm:w-6 text-white drop-shadow-lg" />
                                                ) : (
                                                    <Play className="h-5 w-5 sm:h-6 sm:w-6 text-white drop-shadow-lg ml-0.5" />
                                                )}
                                            </button>
                                        </div>

                                        {/* Informações da música */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-0.5 mt-0">
                                                <h3 className="text-white font-bold text-xs sm:text-sm truncate tracking-wide font-sans">
                                                    {track.songName}
                                                </h3>
                                                {isCurrentlyPlaying && (
                                                    <span className="text-red-400 text-xs font-semibold bg-red-500/20 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full border border-red-500/30 font-sans">
                                                        Tocando
                                                    </span>
                                                )}
                                            </div>

                                            <p className="text-gray-300 text-xs sm:text-sm font-medium mb-0.5 font-sans">
                                                {track.artist}
                                            </p>

                                            {/* Estilo e Pool lado a lado */}
                                            <div className="flex items-center gap-3">
                                                {/* Estilo - Clicável */}
                                                <button
                                                    onClick={() => handleStyleClick(track.style)}
                                                    disabled={!track.style || track.style === 'N/A'}
                                                    className={`flex items-center gap-1.5 px-2 py-1 rounded-lg transition-all duration-200 ${track.style && track.style !== 'N/A'
                                                        ? 'bg-emerald-500/20 border border-emerald-500/30 cursor-pointer'
                                                        : 'bg-gray-600/20 border border-gray-600/30 cursor-not-allowed opacity-50'
                                                        }`}
                                                    title={track.style && track.style !== 'N/A' ? `Filtrar por estilo: ${track.style}` : 'Estilo não disponível'}
                                                >
                                                    <span className="text-emerald-400 text-xs">🎭</span>
                                                    <span className="text-gray-200 text-xs font-medium">
                                                        {track.style || 'N/A'}
                                                    </span>
                                                </button>

                                                {/* Pool/Label - Clicável */}
                                                <button
                                                    onClick={() => handlePoolClick(track.pool)}
                                                    disabled={!track.pool || track.pool === 'N/A'}
                                                    className={`flex items-center gap-1.5 px-2 py-1 rounded-lg transition-all duration-200 ${track.pool && track.pool !== 'N/A'
                                                        ? 'bg-amber-500/20 border border-amber-500/30 cursor-pointer'
                                                        : 'bg-gray-600/20 border border-gray-600/30 cursor-not-allowed opacity-50'
                                                        }`}
                                                    title={track.pool && track.pool !== 'N/A' ? `Filtrar por pool: ${track.pool}` : 'Pool não disponível'}
                                                >
                                                    <span className="text-amber-400 text-xs">🏷️</span>
                                                    <span className="text-gray-200 text-xs font-medium">
                                                        {track.pool || 'N/A'}
                                                    </span>
                                                </button>
                                            </div>
                                        </div>

                                        {/* Botões de ação */}
                                        <div className="flex items-center gap-1 sm:gap-2">
                                            <button
                                                onClick={() => handleDownload(track)}
                                                disabled={downloadingTracks.has(track.id) || isDownloadedTrack || !session}
                                                className={`flex items-center gap-1 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg text-xs font-medium transition-all duration-200 justify-center ${isDownloadedTrack
                                                    ? 'bg-green-600/20 text-green-400 border border-green-600/30 cursor-not-allowed'
                                                    : !session
                                                        ? 'bg-gray-600/40 text-gray-500 border border-gray-600/30 cursor-not-allowed'
                                                        : 'bg-gray-700/60 text-gray-300 border border-gray-600/50 hover:bg-gray-600/60 hover:text-gray-200'
                                                    } font-sans`}
                                                title={isDownloadedTrack ? 'Música já baixada' : !session ? 'Faça login para baixar' : 'Baixar música'}
                                            >
                                                {downloadingTracks.has(track.id) ? (
                                                    <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                                                ) : (
                                                    <span className="flex justify-center w-full"><Download className="h-3 w-3" /></span>
                                                )}
                                                <span className="hidden sm:inline">
                                                    {isDownloadedTrack ? 'Baixado' : !session ? 'Login' : 'Download'}
                                                </span>
                                            </button>

                                            <button
                                                onClick={() => handleLike(track)}
                                                disabled={!session}
                                                className={`flex items-center gap-1 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${!session
                                                    ? 'bg-gray-600/40 text-gray-500 border border-gray-600/30 cursor-not-allowed'
                                                    : isLiked(track)
                                                        ? 'bg-red-600/20 text-red-400 border border-red-600/30'
                                                        : 'bg-gray-700/60 text-gray-300 border border-gray-600/50 hover:bg-red-600/20 hover:text-red-400 hover:border-red-600/30'
                                                    } font-sans`}
                                                title={!session ? 'Faça login para curtir' : isLiked(track) ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
                                            >
                                                <span className="flex justify-center w-full"><Heart className={`h-3 w-3 ${isLiked(track) ? 'fill-current' : ''}`} /></span>
                                                <span className="hidden sm:inline">
                                                    {!session ? 'Login' : isLiked(track) ? 'Curtido' : 'Curtir'}
                                                </span>
                                            </button>
                                        </div>
                                    </div>

                                    {/* Mensagem para usuários não logados */}
                                    {!session && index === 0 && (
                                        <div className="w-full flex flex-col items-center justify-center my-6 px-0 sm:px-0">
                                            <div className="w-full min-h-[60vh] sm:min-h-[80vh] flex flex-col items-center justify-center bg-gradient-to-br from-blue-900/80 via-gray-900/90 to-gray-800/90 border-2 border-blue-700/30 rounded-none sm:rounded-2xl shadow-xl p-4 sm:p-10 text-center animate-fade-in">
                                                <span className="text-4xl sm:text-6xl mb-4">🔊</span>
                                                <h2 className="text-2xl sm:text-4xl font-extrabold text-blue-200 mb-4 font-sans">Bem-vindo à plataforma!</h2>
                                                <p className="text-gray-200 text-base sm:text-xl mb-6 font-sans max-w-2xl mx-auto">
                                                    Usuários não logados podem <span className="text-green-300 font-semibold">ouvir todas as músicas gratuitamente</span>.<br className="hidden sm:block" />
                                                    Para <span className="text-yellow-300 font-semibold">baixar faixas individuais</span> ou <span className="text-yellow-300 font-semibold">fazer downloads em massa</span>, é necessário ter um <span className="text-pink-300 font-semibold">plano pago</span>.<br className="hidden sm:block" />
                                                    <span className="text-blue-200 font-semibold">Faça login ou assine para liberar todos os recursos.</span>
                                                </p>
                                                <div className="flex flex-col sm:flex-row gap-3 mt-2 w-full sm:w-auto justify-center">
                                                    <a href="/login" className="px-6 py-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg transition-all duration-200 shadow-md w-full sm:w-auto">Entrar</a>
                                                    <a href="/planos" className="px-6 py-3 rounded-lg bg-pink-600 hover:bg-pink-700 text-white font-bold text-lg transition-all duration-200 shadow-md w-full sm:w-auto">Ver Planos</a>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                    {/* Linha separadora elegante */}
                                    {index < group.tracks.length - 1 && (
                                        <div className="h-px bg-gray-600/40 mt-3 ml-16 sm:ml-20 mr-2 sm:mr-4"></div>
                                    )}

                                    {/* Linha separadora adicional após a última row de cada data */}
                                    {index === group.tracks.length - 1 && (
                                        <div className="h-px bg-gray-600/60 mt-3 ml-16 sm:ml-20 mr-2 sm:mr-4"></div>
                                    )}
                                </div>
                            </div>
                        );
                    })}


                </div>
            ))}
        </div>
    );
};
