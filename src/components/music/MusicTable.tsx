// src/components/music/MusicTable.tsx
"use client";
import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Play, Pause, Download, Heart, AlertTriangle, Copyright, Music } from 'lucide-react';
import Link from 'next/link';
import { Track } from '@/types/track';
import { useGlobalPlayer } from '@/context/GlobalPlayerContext';
import { useToast } from '@/hooks/useToast';
import { useDownloadExtensionDetector } from '@/hooks/useDownloadExtensionDetector';
import { useUserData } from '@/hooks/useUserData';

interface MusicTableProps {
    tracks: Track[];
    onDownload?: (tracks: Track[]) => void;
    isDownloading?: boolean;
}

const MusicTable = ({ tracks, onDownload, isDownloading }: MusicTableProps) => {
    const { data: session } = useSession();
    const user = session?.user;
    const {
        showToast,
        showLikeToast,
        showDownloadToast,
        showPlayToast,
        showLoginRequiredToast,
        showVipRequiredToast,
        showTimeLimitToast,
        showErrorToastWithDetails
    } = useToast();
    const { detectedExtensions, hasExtension } = useDownloadExtensionDetector();
    const { userData, updateLikedTrack, updateDownloadedTrack } = useUserData();

    // Verificar extensões quando há músicas
    useEffect(() => {
        if (tracks && tracks.length > 0) {
            console.log('🎵 Músicas carregadas, verificando extensões...');
        }
    }, [tracks]);

    // Função para texto do botão de download
    const getDownloadButtonText = (trackId: number) => {
        if (hasDownloadedBefore(trackId)) {
            return 'BAIXADO';
        }
        return 'DOWNLOAD';
    };

    // Simula status de carregamento dos downloads
    const [loadingDownloadStatus, setLoadingDownloadStatus] = useState(false);

    // Estado para forçar atualização do timer a cada segundo
    const [, forceUpdate] = useState(0);
    // Atualiza o timer a cada segundo para feedback visual
    useEffect(() => {
        const interval = setInterval(() => {
            forceUpdate((v) => v + 1);
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    // Estado para controle de "curtir"
    const [liking, setLiking] = useState<number | null>(null);
    // Estado para modal estiloso de download restrito 24h
    const [showRestrict24hModal, setShowRestrict24hModal] = useState<{ track: Track | null, open: boolean }>({ track: null, open: false });

    // Estado para guardar tempo restante para cada track (em segundos)
    const [downloadedTracksTime, setDownloadedTracksTime] = useState<{ [trackId: number]: number }>({});

    // Função para formatar tempo restante
    const formatTimeLeft = (seconds: number) => {
        if (seconds <= 0) return '';
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        if (h > 0) return `${h}h ${m}m ${s}s`;
        if (m > 0) return `${m}m ${s}s`;
        return `${s}s`;
    };

    // Helper functions usando userData
    const hasDownloadedBefore = (trackId: number) => {
        return userData?.downloadedTrackIds?.includes(trackId) || false;
    };

    const isTrackLiked = (trackId: number) => {
        return userData?.likedTrackIds?.includes(trackId) || false;
    };

    const getDailyDownloadLimit = () => {
        return userData?.dailyDownloadLimit || 50;
    };

    const getDownloadsToday = () => {
        return userData?.dailyDownloadCount || 0;
    };

    const getDownloadsLeft = () => {
        return Math.max(getDailyDownloadLimit() - getDownloadsToday(), 0);
    };

    const handleDownload = async (track: Track, confirmReDownload = false) => {
        if (!session?.user?.is_vip) {
            setShowRestrict24hModal({ track, open: true });
            return;
        }

        if (hasDownloadedBefore(track.id) && downloadedTracksTime[track.id] > 0) {
            showToast(
                `⏰ Você já baixou "${track.songName}" nas últimas 24 horas. Aguarde ${formatTimeLeft(downloadedTracksTime[track.id])} para baixar novamente.`,
                'warning'
            );
            return;
        }

        try {
            const response = await fetch('/api/downloads', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ trackId: track.id, confirmReDownload }),
            });

            if (response.ok) {
                const data = await response.json();

                // Update download counts immediately
                updateDownloadedTrack(track.id);

                // Force download the file
                await downloadTrack(track);

                // Show success toast
                showToast(
                    `✅ "${track.songName}" baixada com sucesso! Restam ${Math.max((data.dailyLimit || getDailyDownloadLimit()) - (data.dailyDownloadCount || 0), 0)} downloads hoje.`,
                    'success'
                );
            } else {
                const errorData = await response.json();

                if (errorData.needsConfirmation) {
                    // Show re-download confirmation toast
                    showToast(
                        `🔄 Você já baixou "${track.songName}" nas últimas 24h. Clique novamente para baixar.`,
                        'info'
                    );
                } else {
                    showToast(
                        `❌ ${errorData.error || 'Erro ao baixar música'}`,
                        'error'
                    );
                }
            }
        } catch (error) {
            showToast(
                '❌ Erro ao baixar música',
                'error'
            );
        }
    };

    // Audio player context
    const { currentTrack, isPlaying, playTrack, togglePlayPause } = useGlobalPlayer();

    const handlePlayPauseClick = (track: Track) => {
        if (!session?.user?.email) {
            showLoginRequiredToast('ouvir as músicas');
            return;
        }

        console.log('Play/Pause clicked for track:', track);
        console.log('Current track:', currentTrack);
        console.log('Is playing:', isPlaying);

        if (currentTrack?.id === track.id) {
            // Se é a mesma música, apenas toggle play/pause
            console.log('Toggling play/pause for same track');
            togglePlayPause();
        } else {
            // Se é uma música diferente, toca ela e passa a playlist completa
            console.log('Playing new track:', track, 'with playlist of', tracks.length, 'tracks');
            playTrack(track, tracks);
            showPlayToast(track.songName);
        }
    };

    const canDownloadNow = (trackId: number) => {
        return !hasDownloadedBefore(trackId) || downloadedTracksTime[trackId] <= 0;
    };

    const handleDownloadClick = async (track: Track) => {
        if (!session?.user?.email) {
            showLoginRequiredToast('fazer downloads');
            return;
        }

        if (!session?.user?.is_vip) {
            setShowRestrict24hModal({ track, open: true });
            return;
        }

        if (hasDownloadedBefore(track.id) && downloadedTracksTime[track.id] > 0) {
            showTimeLimitToast(track.songName, formatTimeLeft(downloadedTracksTime[track.id]));
            return;
        }

        try {
            // Registrar download na API
            const response = await fetch('/api/tracks/download', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    trackId: track.id.toString()
                }),
            });

            if (response.ok) {
                // Atualizar estado local
                updateDownloadedTrack(track.id);

                // Iniciar download do arquivo
                if (track.downloadUrl) {
                    const link = document.createElement('a');
                    link.href = track.downloadUrl;
                    link.download = `${track.artist} - ${track.songName}.mp3`;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                }

                showDownloadToast(track.songName);
            } else {
                const data = await response.json();
                showErrorToastWithDetails('fazer download', data.error);
            }
        } catch (error) {
            console.error('Erro ao fazer download:', error);
            showErrorToastWithDetails('fazer download');
        }
    };

    const downloadTrack = async (track: Track) => {
        if (track.downloadUrl) {
            try {
                // Usar o proxy de download para garantir que o arquivo seja baixado corretamente
                const proxyUrl = `/api/download-proxy?url=${encodeURIComponent(track.downloadUrl)}&filename=${encodeURIComponent(`${track.artist} - ${track.songName}.mp3`)}`;
                
                const response = await fetch(proxyUrl);
                if (!response.ok) {
                    throw new Error('Failed to fetch file');
                }

                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);

                // Create download link
                const link = document.createElement('a');
                link.href = url;
                link.download = `${track.artist} - ${track.songName}.mp3`;
                link.style.display = 'none';

                // Trigger download
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);

                // Clean up
                window.URL.revokeObjectURL(url);

                // Small delay to ensure download starts
                await new Promise(resolve => setTimeout(resolve, 100));

            } catch (error) {
                console.error('Error downloading track:', error);
                showToast(
                    'Erro ao baixar arquivo da música',
                    'error'
                );
            }
        }
    };

    const handleLikeClick = async (trackId: number) => {
        if (!session?.user?.email || liking === trackId) return;

        setLiking(trackId);
        try {
            const isLiked = isTrackLiked(trackId);
            const response = await fetch('/api/tracks/like', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    trackId: trackId.toString(),
                    action: isLiked ? 'unlike' : 'like'
                }),
            });

            if (response.ok) {
                updateLikedTrack(trackId, !isLiked);

                // Usar função específica do toast
                showLikeToast(!isLiked);
            } else {
                const errorData = await response.json();
                console.error('Erro ao curtir música:', errorData);
                showErrorToastWithDetails('curtir música', errorData.error);
            }
        } catch (error) {
            console.error('Erro ao curtir música:', error);
            showErrorToastWithDetails('curtir música');
        } finally {
            setLiking(null);
        }
    };

    const handleReportClick = async (track: Track) => {
        try {
            const response = await fetch('/api/report-bug', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    track,
                    user: user?.email || 'Usuário não identificado',
                    timestamp: new Date().toISOString(),
                    issue: 'Problema reportado pelo usuário'
                }),
            });

            const data = await response.json();

            if (response.ok) {
                showToast('Relatório enviado com sucesso!', 'success');
            } else {
                showToast('Erro ao enviar relatório', 'error');
            }
        } catch (error) {
            console.error('Erro ao reportar:', error);
            showToast('Erro ao enviar relatório', 'error');
        }
    };

    const handleCopyrightClick = async (track: Track) => {
        try {
            const response = await fetch('/api/report-copyright', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    track,
                    user: user?.email || 'Usuário não identificado',
                    timestamp: new Date().toISOString(),
                }),
            });

            const data = await response.json();

            if (response.ok) {
                showToast('Denúncia de direitos autorais enviada com sucesso!', 'success');
            } else {
                showToast('Erro ao enviar denúncia', 'error');
            }
        } catch (error) {
            console.error('Erro ao reportar copyright:', error);
            showToast('Erro ao enviar denúncia', 'error');
        }
    };


    // Debug: Log tracks to check previewUrl
    useEffect(() => {
        if (tracks.length > 0) {
            console.log('MusicTable: Tracks loaded:', tracks.map(t => ({
                id: t.id,
                songName: t.songName,
                previewUrl: t.previewUrl,
                downloadUrl: t.downloadUrl
            })));
        }
    }, [tracks]);

    // Debug function to test extension detection


    return (
        <div className="relative w-full h-full">
            <style jsx global>{`
                @import url('https://fonts.googleapis.com/css2?family=Lato:wght@400;700&display=swap');
            `}</style>

            {session?.user?.is_vip && (
                <div
                    className="w-full flex items-center justify-center py-3 px-4 mb-2 rounded-xl shadow-md"
                    style={{
                        background: '#47191C',
                        color: '#e53935',
                        fontFamily: 'Lato, sans-serif',
                        fontWeight: 700,
                        fontSize: 15,
                        letterSpacing: 0.5,
                        textAlign: 'center',
                    }}
                >
                    <span style={{ fontSize: 20, marginRight: 10 }}>⬇️</span>
                    {getDownloadsLeft() > 0 ? (
                        <>
                            <span style={{ color: '#fff' }}>Você pode baixar até {getDailyDownloadLimit()} músicas por dia. </span>
                            <span style={{ color: '#39FF14', marginLeft: 6 }}>Restam {getDownloadsLeft()} downloads hoje.</span>
                        </>
                    ) : (
                        <span>Limite diário de downloads atingido. Tente novamente amanhã.</span>
                    )}
                </div>
            )}



            <div
                className="bg-gradient-to-br from-gray-800 via-gray-900 to-black rounded-2xl overflow-auto shadow-2xl border border-gray-700/50 mt-2 custom-scrollbar"
                style={{
                    maxHeight: '70vh',
                    scrollbarWidth: 'thin',
                    scrollbarColor: '#3b82f6 #18181b',
                    fontFamily: "'Lato', sans-serif"
                }}
            >
                {/* Desktop Table */}
                <table className="hidden md:table min-w-full text-left text-sm text-gray-200 table-fixed" style={{ fontFamily: "'Lato', sans-serif", fontSize: '13px' }}>
                    <thead className="sticky top-0 z-40 bg-gradient-to-r from-gray-800 via-gray-900 to-black text-gray-300 uppercase text-xs tracking-wider border-b border-gray-600/50" style={{ fontFamily: "'Lato', sans-serif" }}>
                        <tr>
                            <th className="px-3 py-3 font-bold tracking-wide w-[32%] text-white">
                                <div className="flex items-center space-x-2">
                                    <Music className="h-4 w-4 text-[#6b7280]" />
                                    <span>MÚSICA</span>
                                </div>
                            </th>
                            <th className="px-3 py-3 font-bold tracking-wide w-[22%] text-white">
                                <span>ARTISTA</span>
                            </th>
                            <th className="px-3 py-3 font-bold tracking-wide w-[16%] text-white">
                                <span>GÊNERO</span>
                            </th>
                            <th className="px-3 py-3 font-bold tracking-wide w-[14%] text-white">
                                <span>POOL</span>
                            </th>
                            <th className="px-3 py-3 text-right font-bold tracking-wide w-[16%] text-white">
                                <span>AÇÕES</span>
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800" style={{ fontFamily: "'Lato', sans-serif" }}>
                        {tracks.length === 0 && (
                            <tr>
                                <td colSpan={5} className="text-center py-16 text-gray-400">
                                    <p>Nenhuma música encontrada.</p>
                                </td>
                            </tr>
                        )}
                        {tracks.map((track: Track) => (
                            <tr
                                key={track.id}
                                className={`${currentTrack?.id === track.id ? 'bg-[#374151]/20 border-l-4 border-l-[#6b7280]' : 'hover:border-l-4 hover:border-l-gray-600'}`}
                            >
                                <td className="px-3 py-3 align-middle w-[32%]">
                                    <div className="flex items-center gap-3">
                                        <div className="relative flex-shrink-0 w-12 h-12 group">
                                            <img
                                                src="https://i.ibb.co/FL1rxTtx/20250526-1938-Sound-Cloud-Cover-Design-remix-01jw7bwxq6eqj8sqztah5n296g.png"
                                                alt={track.songName + ' thumbnail'}
                                                className="w-12 h-12 rounded-xl object-cover border border-gray-700 shadow-lg group-hover:border-blue-500 transition-all duration-300"
                                                style={{ minWidth: '48px', minHeight: '48px', maxWidth: '48px', maxHeight: '48px' }}
                                            />
                                            <button
                                                onClick={session ? () => handlePlayPauseClick(track) : undefined}
                                                disabled={!session}
                                                className={`absolute inset-0 flex items-center justify-center rounded-xl transition-all duration-300 cursor-pointer backdrop-blur-sm ${currentTrack?.id === track.id && isPlaying
                                                    ? 'text-orange-400 bg-orange-600/20 border-2 border-orange-500/50'
                                                    : 'text-gray-200 hover:text-orange-400 bg-black/60 hover:bg-orange-600/20'
                                                    } ${!session ? 'opacity-60 cursor-not-allowed' : ''}`}
                                                style={{ zIndex: 2 }}
                                                title={!session ? 'Faça login para ouvir a prévia' : currentTrack?.id === track.id && isPlaying ? 'Tocando agora - Clique para pausar' : 'Clique para tocar'}
                                            >
                                                {isPlaying && currentTrack?.id === track.id ?
                                                    <Pause size={20} /> :
                                                    <Play size={20} className="ml-1" />
                                                }
                                            </button>
                                        </div>
                                        <div className="flex flex-col min-w-0 flex-1">
                                            <div className="flex items-center gap-2">
                                                <span className="font-semibold text-white tracking-wide truncate" style={{ fontSize: '11px' }}>
                                                    {track.songName}
                                                </span>
                                                {track.isCommunity && (
                                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-purple-600 to-pink-600 text-white border border-purple-500/30 tracking-wide shadow-lg flex-shrink-0" style={{ fontSize: '9px' }}>
                                                        COMUNIDADE
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-3 py-3 align-middle w-[22%]">
                                    <span className="text-gray-300 font-medium tracking-wide block truncate" style={{ fontSize: '11px' }}>
                                        {track.artist}
                                    </span>
                                </td>
                                <td className="px-3 py-3 align-middle w-[16%]">
                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-purple-600 to-blue-600 text-white border border-purple-500/30 tracking-wide shadow-lg truncate" style={{ fontSize: '10px' }}>
                                        {track.style}
                                    </span>
                                </td>
                                <td className="px-3 py-3 align-middle w-[14%]">
                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-green-600 to-emerald-600 text-white border border-green-500/30 tracking-wide shadow-lg truncate" style={{ fontSize: '10px' }}>
                                        {track.pool || 'Nexor Records'}
                                    </span>
                                </td>
                                <td className="px-3 py-3 align-middle w-[16%]">
                                    {/* AÇÕES ORIGINAIS */}
                                    <div className="flex flex-row flex-nowrap items-center justify-end gap-1">
                                        {/* Download */}
                                        <button
                                            onClick={() => handleDownload(track)}
                                            disabled={
                                                !session?.user?.is_vip ||
                                                (hasDownloadedBefore(track.id) && downloadedTracksTime[track.id] > 0)
                                            }
                                            className={`inline-flex items-center justify-center p-2 rounded-lg text-xs font-bold transition-all duration-300 cursor-pointer tracking-wide shadow-lg
                                                ${!session?.user?.is_vip
                                                    ? 'bg-[#374151] text-gray-400 opacity-50 cursor-not-allowed'
                                                    : hasDownloadedBefore(track.id)
                                                        ? downloadedTracksTime[track.id] > 0
                                                            ? 'bg-[#6b7280] text-white border border-[#6b7280] shadow-[#6b7280]/25 opacity-60 cursor-not-allowed'
                                                            : 'bg-[#6b7280] text-white hover:bg-[#9ca3af] border border-[#6b7280] shadow-[#6b7280]/25'
                                                        : 'bg-[#374151] text-white hover:bg-[#4b5563] border border-[#374151] shadow-[#374151]/25'
                                                }`}
                                            title={
                                                !session?.user?.is_vip ? 'Apenas usuários VIP podem fazer downloads'
                                                    : hasDownloadedBefore(track.id)
                                                        ? downloadedTracksTime[track.id] > 0
                                                            ? `Aguarde ${formatTimeLeft(downloadedTracksTime[track.id] || 0)} para baixar novamente`
                                                            : 'Música já baixada'
                                                        : "Download disponível"
                                            }
                                        >
                                            <Download size={16} />
                                        </button>
                                        {/* Curtir */}
                                        <button
                                            onClick={() => handleLikeClick(track.id)}
                                            disabled={!session?.user?.is_vip || liking === track.id}
                                            className={`inline-flex items-center justify-center p-2 rounded-lg text-xs font-bold transition-all duration-300 cursor-pointer tracking-wide shadow-lg
                                                ${isTrackLiked(track.id)
                                                    ? 'bg-pink-600 text-white border border-pink-500 shadow-pink-500/25'
                                                    : 'bg-gray-700 text-gray-200 hover:bg-pink-700 border border-gray-500 shadow-gray-500/25'
                                                }`}
                                            title={isTrackLiked(track.id) ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
                                        >
                                            <Heart size={16} className={isTrackLiked(track.id) ? 'fill-pink-400 text-pink-200' : 'text-gray-300'} />
                                        </button>
                                        {/* Reportar erro */}
                                        <button
                                            onClick={() => handleReportClick(track)}
                                            className="inline-flex items-center justify-center p-2 rounded-lg text-xs font-bold transition-all duration-300 cursor-pointer tracking-wide shadow-lg bg-yellow-700 text-white hover:bg-yellow-800 border border-yellow-500 shadow-yellow-500/25 transform hover:scale-105 active:scale-95"
                                            title="Reportar problema com a música"
                                        >
                                            <AlertTriangle size={16} />
                                        </button>
                                        {/* Copyright */}
                                        <button
                                            onClick={() => handleCopyrightClick(track)}
                                            className="inline-flex items-center justify-center p-2 rounded-lg text-xs font-bold transition-all duration-300 cursor-pointer tracking-wide shadow-lg bg-gray-800 text-white hover:bg-purple-800 border border-purple-500 shadow-purple-500/25 transform hover:scale-105 active:scale-95"
                                            title="Reportar copyright"
                                        >
                                            <Copyright size={16} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {/* Mobile Cards */}
                <div className="md:hidden flex flex-col gap-3 p-4">
                    {tracks.length === 0 && (
                        <div className="text-center py-12 text-gray-400 bg-gradient-to-br from-[#202B3F]/50 via-[#27212B]/50 to-[#0C0C0C]/50 rounded-xl border border-gray-700/30">Nenhuma música encontrada.</div>
                    )}
                    {tracks.map((track: Track) => (
                        <div key={track.id} className={`rounded-xl bg-gradient-to-br from-[#202B3F]/80 via-[#27212B]/80 to-[#0C0C0C]/80 border border-gray-700/30 shadow-xl backdrop-blur-sm ${currentTrack?.id === track.id ? 'ring-2 ring-blue-500/50' : ''}`}>
                            {/* Header com informações da música */}
                            <div className="p-4 border-b border-gray-700/30">
                                <div className="flex items-center gap-3">
                                    <div className="relative w-12 h-12 flex-shrink-0 group">
                                        <img
                                            src="https://i.ibb.co/FL1rxTtx/20250526-1938-Sound-Cloud-Cover-Design-remix-01jw7bwxq6eqj8sqztah5n296g.png"
                                            alt={track.songName + ' thumbnail'}
                                            className="w-12 h-12 rounded-lg object-cover border border-gray-600/50 shadow-lg group-hover:border-blue-500/70 transition-all duration-300"
                                        />
                                        <button
                                            onClick={() => handlePlayPauseClick(track)}
                                            className={`absolute inset-0 flex items-center justify-center rounded-lg transition-all duration-300 cursor-pointer bg-[#374151]/60 hover:bg-blue-600/80 backdrop-blur-sm ${currentTrack?.id === track.id && isPlaying ? 'text-white bg-blue-600/80' : 'text-gray-200 hover:text-white'}`}
                                            style={{ zIndex: 2 }}
                                        >
                                            {isPlaying && currentTrack?.id === track.id ? <Pause size={20} /> : <Play size={20} className="ml-0.5" />}
                                        </button>
                                    </div>
                                    <div className="flex flex-col flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="font-semibold text-white text-sm truncate">{track.songName}</span>
                                            {track.isCommunity && (
                                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-gradient-to-r from-purple-600 to-pink-600 text-white border border-purple-500/30 tracking-wide shadow-lg">
                                                    COMUNIDADE
                                                </span>
                                            )}
                                        </div>
                                        <span className="text-gray-300 text-xs truncate mb-1">{track.artist}</span>
                                        <div className="flex items-center gap-2">
                                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r from-purple-600/80 to-blue-600/80 text-white border border-purple-500/30 tracking-wide shadow-md">{track.style}</span>
                                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r from-green-600/80 to-emerald-600/80 text-white border border-green-500/30 tracking-wide shadow-md">{track.pool || 'Nexor Records'}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Ações */}
                            <div className="p-3">
                                <div className="grid grid-cols-2 gap-2 mb-2">
                                    {/* Download */}
                                    <button
                                        onClick={() => handleDownload(track)}
                                        disabled={!session?.user?.is_vip || (hasDownloadedBefore(track.id) && downloadedTracksTime[track.id] > 0)}
                                        className={`flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition-all duration-300 cursor-pointer tracking-wide shadow-lg
                                ${!session?.user?.is_vip
                                                ? 'bg-[#374151] text-gray-400 opacity-50 cursor-not-allowed'
                                                : hasDownloadedBefore(track.id)
                                                    ? downloadedTracksTime[track.id] > 0
                                                        ? 'bg-blue-600/80 text-white border border-blue-500/50 shadow-blue-500/25 opacity-60 cursor-not-allowed'
                                                        : 'bg-[#374151] text-white hover:bg-gray-600 border border-gray-500/50 shadow-gray-500/25'
                                                    : 'bg-[#374151] text-white hover:bg-gray-600 border border-gray-500/50 shadow-gray-500/25'
                                            }`}
                                        title={!session?.user?.is_vip ? 'Apenas usuários VIP podem fazer downloads' : hasDownloadedBefore(track.id) ? downloadedTracksTime[track.id] > 0 ? `Aguarde ${formatTimeLeft(downloadedTracksTime[track.id] || 0)} para baixar novamente` : 'Música já baixada' : "Download disponível"}
                                    >
                                        <Download size={16} />
                                        <span>{getDownloadButtonText(track.id)}</span>
                                    </button>

                                    {/* Curtir */}
                                    <button
                                        onClick={() => handleLikeClick(track.id)}
                                        disabled={!session?.user?.is_vip || liking === track.id}
                                        className={`flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition-all duration-300 cursor-pointer tracking-wide shadow-lg
                                ${isTrackLiked(track.id)
                                                ? 'bg-pink-600/80 text-white border border-pink-500/50 shadow-pink-500/25'
                                                : 'bg-[#374151] text-gray-200 hover:bg-gray-600 border border-gray-500/50 shadow-gray-500/25'
                                            }`}
                                        title={isTrackLiked(track.id) ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
                                    >
                                        <Heart size={16} className={isTrackLiked(track.id) ? 'fill-pink-400 text-pink-200' : 'text-gray-300'} />
                                        <span>{isTrackLiked(track.id) ? 'Curtido' : 'Curtir'}</span>
                                    </button>
                                </div>

                                <div className="grid grid-cols-2 gap-2">
                                    {/* Reportar erro */}
                                    <button
                                        onClick={() => handleReportClick(track)}
                                        className="flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition-all duration-300 cursor-pointer tracking-wide shadow-lg bg-yellow-700/80 text-white hover:bg-yellow-800/80 border border-yellow-500/50 shadow-yellow-500/25"
                                        title="Reportar problema com a música"
                                    >
                                        <AlertTriangle size={16} />
                                        <span>Reportar</span>
                                    </button>

                                    {/* Copyright */}
                                    <button
                                        onClick={() => handleCopyrightClick(track)}
                                        className="flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition-all duration-300 cursor-pointer tracking-wide shadow-lg bg-gray-800/80 text-white hover:bg-purple-800/80 border border-purple-500/50 shadow-purple-500/25"
                                        title="Reportar copyright"
                                    >
                                        <Copyright size={16} />
                                        <span>Copyright</span>
                                    </button>
                                </div>

                                {!session && (
                                    <Link href="/planos" className="mt-3 w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all duration-300 cursor-pointer tracking-wide shadow-lg bg-[#374151]/80 text-white hover:bg-[#4b5563]/80 border border-[#374151]/50 shadow-[#374151]/25">
                                        ASSINAR PLANO
                                    </Link>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div >
        </div >
    );
}

export default MusicTable;