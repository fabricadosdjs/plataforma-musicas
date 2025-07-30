// src/components/music/MusicTable.tsx
"use client";
import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Play, Pause, Download, Heart, AlertTriangle, Copyright, Music } from 'lucide-react';
import Link from 'next/link';
import { Track } from '@/types/track';
import { useAppContext } from '@/context/AppContext';
import { useToast } from '@/hooks/useToast';
import { useDownloadExtensionDetector } from '@/hooks/useDownloadExtensionDetector';

interface MusicTableProps {
    tracks: Track[];
    onDownload?: (tracks: Track[]) => void;
    isDownloading?: boolean;
}

const MusicTable = ({ tracks, onDownload, isDownloading }: MusicTableProps) => {
    const { data: session } = useSession();
    const user = session?.user;
    const { showToast } = useToast();
    const { detectedExtensions, hasExtension } = useDownloadExtensionDetector();

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
    // Tracks curtidas (persistente)
    const [likedTracksSet, setLikedTracksSet] = useState<Set<number>>(new Set());

    // Função para buscar likes do backend
    const fetchLikes = async () => {
        if (!user?.id) return;
        try {
            const res = await fetch('/api/likes');
            if (!res.ok) return;
            const data = await res.json();
            // Corrigido: backend retorna 'likedTracks', não 'likedTrackIds'
            if (Array.isArray(data.likedTracks)) {
                setLikedTracksSet(new Set(data.likedTracks));
            }
        } catch (err) { }
    };

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
    // Limite de downloads por dia - será obtido dinamicamente
    const [dailyDownloadLimit, setDailyDownloadLimit] = useState(50);

    // Carrega likes do usuário ao montar (deve vir após a declaração de user)
    useEffect(() => {
        if (!user?.id) return;
        fetchLikes();
    }, [user?.id]);

    // Função para buscar dados do usuário (incluindo limite diário e downloads)
    const fetchUserData = async () => {
        if (!user?.id) return;
        try {
            setIsLoadingUserData(true);
            const res = await fetch('/api/user-data');
            if (!res.ok) return;
            const data = await res.json();

            // Set daily download limit
            if (data.dailyDownloadLimit) {
                setDailyDownloadLimit(data.dailyDownloadLimit);
            }

            // Set daily download count
            if (data.dailyDownloadCount !== undefined) {
                setDownloadsToday(data.dailyDownloadCount);
            }

            // Set downloaded tracks
            if (data.downloadedTrackIds) {
                setDownloadedTracksSet(new Set(data.downloadedTrackIds));
            }
        } catch (err) {
            console.error('Erro ao buscar dados do usuário:', err);
        } finally {
            setIsLoadingUserData(false);
        }
    };

    // Carrega dados do usuário ao montar
    useEffect(() => {
        if (!user?.id) return;
        fetchUserData();
    }, [user?.id]);

    // Quantos downloads o usuário já fez hoje (do contexto, ou do status)
    const [downloadsToday, setDownloadsToday] = useState(0);
    const [isLoadingUserData, setIsLoadingUserData] = useState(false);
    const downloadsLeft = Math.max(dailyDownloadLimit - downloadsToday, 0);
    // Set de IDs de músicas já baixadas
    const [downloadedTracksSet, setDownloadedTracksSet] = useState<Set<number>>(new Set());

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
                setDownloadsToday(data.dailyDownloadCount || 0);

                // Update downloaded tracks set immediately for real-time UI update
                const newDownloadedTracksSet = new Set(downloadedTracksSet);
                newDownloadedTracksSet.add(track.id);
                setDownloadedTracksSet(newDownloadedTracksSet);

                // Force download the file
                await downloadTrack(track);

                // Show success toast
                showToast(
                    `✅ "${track.songName}" baixada com sucesso! Restam ${Math.max((data.dailyLimit || dailyDownloadLimit) - (data.dailyDownloadCount || 0), 0)} downloads hoje.`,
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
    const { currentTrack, isPlaying, playTrack, togglePlayPause } = useAppContext();

    const handlePlayPauseClick = (track: Track) => {
        if (!session) {
            console.log('No session, cannot play');
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
            // Se é uma música diferente, toca ela
            console.log('Playing new track:', track);
            playTrack(track, tracks);
        }
    };

    const canDownloadNow = (trackId: number) => {
        return !hasDownloadedBefore(trackId) || downloadedTracksTime[trackId] <= 0;
    };

    const handleDownloadClick = (track: Track) => {
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

        // Use handleDownload instead of downloadTrack to ensure state updates
        handleDownload(track);
    };

    const downloadTrack = async (track: Track) => {
        if (track.downloadUrl) {
            try {
                // Fetch the file as blob to force download
                const response = await fetch(track.downloadUrl);
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
        if (!session?.user?.is_vip || liking === trackId) return;

        setLiking(trackId);
        try {
            const response = await fetch('/api/likes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ trackId }),
            });

            if (response.ok) {
                const newLikedTracksSet = new Set(likedTracksSet);
                if (newLikedTracksSet.has(trackId)) {
                    newLikedTracksSet.delete(trackId);
                } else {
                    newLikedTracksSet.add(trackId);
                }
                setLikedTracksSet(newLikedTracksSet);
            }
        } catch (error) {
            console.error('Erro ao curtir música:', error);
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

    const hasDownloadedBefore = (trackId: number) => {
        return downloadedTracksSet.has(trackId);
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
                    {isLoadingUserData ? (
                        <span style={{ color: '#fff' }}>Carregando dados de download...</span>
                    ) : downloadsLeft > 0 ? (
                        <>
                            <span style={{ color: '#fff' }}>Você pode baixar até {dailyDownloadLimit} músicas por dia. </span>
                            <span style={{ color: '#39FF14', marginLeft: 6 }}>Restam {downloadsLeft} downloads hoje.</span>
                        </>
                    ) : (
                        <span>Limite diário de downloads atingido. Tente novamente amanhã.</span>
                    )}
                </div>
            )}



            <div
                className="bg-black rounded-2xl overflow-auto shadow-2xl border border-gray-800 mt-2 custom-scrollbar"
                style={{
                    maxHeight: '70vh',
                    scrollbarWidth: 'thin',
                    scrollbarColor: '#3b82f6 #18181b',
                    fontFamily: "'Lato', sans-serif"
                }}
            >
                {/* Desktop Table */}
                <table className="hidden md:table min-w-full text-left text-sm text-gray-200 table-fixed" style={{ fontFamily: "'Lato', sans-serif", fontSize: '13px' }}>
                    <thead className="sticky top-0 z-40 bg-gradient-to-r from-gray-900 to-black text-gray-300 uppercase text-xs tracking-wider border-b border-gray-700" style={{ fontFamily: "'Lato', sans-serif" }}>
                        <tr>
                            <th className="px-6 py-4 font-bold tracking-wide w-[35%] text-white">
                                <div className="flex items-center space-x-2">
                                    <Music className="h-4 w-4 text-blue-400" />
                                    <span>MÚSICA</span>
                                </div>
                            </th>
                            <th className="px-6 py-4 font-bold tracking-wide w-[20%] text-white">
                                <span>ARTISTA</span>
                            </th>
                            <th className="px-6 py-4 font-bold tracking-wide w-[20%] text-white">
                                <span>GÊNERO</span>
                            </th>
                            <th className="px-6 py-4 font-bold tracking-wide w-[15%] text-white">
                                <span>POOL</span>
                            </th>
                            <th className="px-6 py-4 text-right font-bold tracking-wide w-[10%] text-white">
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
                                className={`${currentTrack?.id === track.id ? 'bg-blue-900/20 border-l-4 border-l-blue-500' : 'hover:border-l-4 hover:border-l-gray-600'}`}
                            >
                                <td className="px-6 py-4 align-middle w-[35%]">
                                    <div className="flex items-center gap-4">
                                        <div className="relative w-14 h-14 group">
                                            <img
                                                src="https://i.ibb.co/FL1rxTtx/20250526-1938-Sound-Cloud-Cover-Design-remix-01jw7bwxq6eqj8sqztah5n296g.png"
                                                alt={track.songName + ' thumbnail'}
                                                className="w-14 h-14 rounded-xl object-cover border border-gray-700 shadow-lg group-hover:border-blue-500 transition-all duration-300"
                                            />
                                            <button
                                                onClick={session ? () => handlePlayPauseClick(track) : undefined}
                                                disabled={!session}
                                                className={`absolute inset-0 flex items-center justify-center rounded-xl transition-all duration-300 cursor-pointer bg-black/60 hover:bg-blue-600/80 backdrop-blur-sm ${currentTrack?.id === track.id && isPlaying
                                                    ? 'text-white bg-blue-600/80'
                                                    : 'text-gray-200 hover:text-white'
                                                    } ${!session ? 'opacity-60 cursor-not-allowed' : ''}`}
                                                style={{ zIndex: 2 }}
                                                title={!session ? 'Faça login para ouvir a prévia' : ''}
                                            >
                                                {isPlaying && currentTrack?.id === track.id ?
                                                    <Pause size={24} /> :
                                                    <Play size={24} className="ml-1" />
                                                }
                                            </button>
                                        </div>
                                        <div className="flex flex-col">
                                            <div className="flex items-center gap-2">
                                                <span className="font-semibold text-white tracking-wide" style={{ fontSize: '11px' }}>
                                                    {track.songName}
                                                </span>
                                                {track.isCommunity && (
                                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-purple-600 to-pink-600 text-white border border-purple-500/30 tracking-wide shadow-lg" style={{ fontSize: '9px' }}>
                                                        COMUNIDADE
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 align-middle w-[20%]">
                                    <span className="text-gray-300 font-medium tracking-wide block truncate" style={{ fontSize: '11px' }}>
                                        {track.artist}
                                    </span>
                                </td>
                                <td className="px-6 py-4 align-middle w-[20%]">
                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-purple-600 to-blue-600 text-white border border-purple-500/30 tracking-wide shadow-lg truncate" style={{ fontSize: '10px' }}>
                                        {track.style}
                                    </span>
                                </td>
                                <td className="px-6 py-4 align-middle w-[15%]">
                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-green-600 to-emerald-600 text-white border border-green-500/30 tracking-wide shadow-lg truncate" style={{ fontSize: '10px' }}>
                                        {track.pool || 'Nexor Records'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 align-middle w-[10%]">
                                    {session ? (
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
                                                        ? 'bg-gray-700 text-gray-400 opacity-50 cursor-not-allowed'
                                                        : hasDownloadedBefore(track.id)
                                                            ? downloadedTracksTime[track.id] > 0
                                                                ? 'bg-blue-600 text-white border border-blue-500 shadow-blue-500/25 opacity-60 cursor-not-allowed'
                                                                : 'bg-blue-600 text-white hover:bg-blue-700 border border-blue-500 shadow-blue-500/25'
                                                            : 'bg-green-600 text-white hover:bg-green-700 border border-green-500 shadow-green-500/25'
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
                                                    ${likedTracksSet.has(track.id)
                                                        ? 'bg-pink-600 text-white border border-pink-500 shadow-pink-500/25'
                                                        : 'bg-gray-700 text-gray-200 hover:bg-pink-700 border border-gray-500 shadow-gray-500/25'
                                                    }`}
                                                title={likedTracksSet.has(track.id) ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
                                            >
                                                <Heart size={16} className={likedTracksSet.has(track.id) ? 'fill-pink-400 text-pink-200' : 'text-gray-300'} />
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
                                    ) : (
                                        <Link href="/planos" className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all duration-300 cursor-pointer tracking-wide shadow-lg bg-blue-600 text-white hover:bg-blue-700 border border-blue-500 shadow-blue-500/25 transform hover:scale-105 active:scale-95">
                                            ASSINAR PLANO
                                        </Link>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {/* Mobile Cards */}
                <div className="md:hidden flex flex-col gap-4 p-2">
                    {tracks.length === 0 && (
                        <div className="text-center py-10 text-gray-400 bg-gray-900 rounded-xl">Nenhuma música encontrada.</div>
                    )}
                    {tracks.map((track: Track) => (
                        <div key={track.id} className={`rounded-2xl bg-gradient-to-br from-gray-900 to-black border border-gray-800 shadow-xl p-4 flex flex-col gap-3 ${currentTrack?.id === track.id ? 'ring-2 ring-blue-500' : ''}`}>
                            <div className="flex items-center gap-4">
                                <div className="relative w-16 h-16 flex-shrink-0 group">
                                    <img
                                        src="https://i.ibb.co/FL1rxTtx/20250526-1938-Sound-Cloud-Cover-Design-remix-01jw7bwxq6eqj8sqztah5n296g.png"
                                        alt={track.songName + ' thumbnail'}
                                        className="w-16 h-16 rounded-xl object-cover border border-gray-700 shadow-lg group-hover:border-blue-500 transition-all duration-300"
                                    />
                                    <button
                                        onClick={() => handlePlayPauseClick(track)}
                                        className={`absolute inset-0 flex items-center justify-center rounded-xl transition-all duration-300 cursor-pointer bg-black/60 hover:bg-blue-600/80 backdrop-blur-sm ${currentTrack?.id === track.id && isPlaying ? 'text-white bg-blue-600/80' : 'text-gray-200 hover:text-white'}`}
                                        style={{ zIndex: 2 }}
                                    >
                                        {isPlaying && currentTrack?.id === track.id ? <Pause size={28} /> : <Play size={28} className="ml-1" />}
                                    </button>
                                </div>
                                <div className="flex flex-col flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <span className="font-bold text-white text-base truncate">{track.songName}</span>
                                        {track.isCommunity && (
                                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-purple-600 to-pink-600 text-white border border-purple-500/30 tracking-wide shadow-lg" style={{ fontSize: '9px' }}>
                                                COMUNIDADE
                                            </span>
                                        )}
                                    </div>
                                    <span className="text-gray-300 text-sm truncate">{track.artist}</span>
                                    <span className="inline-flex items-center px-3 py-1 mt-1 rounded-full text-xs font-bold bg-gradient-to-r from-purple-600 to-blue-600 text-white border border-purple-500/30 tracking-wide shadow-lg w-fit">{track.style}</span>
                                </div>
                            </div>
                            <div className="flex flex-row flex-wrap gap-2 mt-2">
                                {/* Download */}
                                <button
                                    onClick={() => handleDownload(track)}
                                    disabled={!session?.user?.is_vip || (hasDownloadedBefore(track.id) && downloadedTracksTime[track.id] > 0)}
                                    className={`flex-1 flex items-center justify-center gap-2 px-3 py-3 rounded-xl text-sm font-bold transition-all duration-300 cursor-pointer tracking-wide shadow-lg
                            ${!session?.user?.is_vip
                                            ? 'bg-gray-700 text-gray-400 opacity-50 cursor-not-allowed'
                                            : hasDownloadedBefore(track.id)
                                                ? downloadedTracksTime[track.id] > 0
                                                    ? 'bg-blue-600 text-white border border-blue-500 shadow-blue-500/25 opacity-60 cursor-not-allowed'
                                                    : 'bg-blue-600 text-white hover:bg-blue-700 border border-blue-500 shadow-blue-500/25'
                                                : 'bg-green-600 text-white hover:bg-green-700 border border-green-500 shadow-green-500/25'
                                        }`}
                                    style={{ fontSize: '15px' }}
                                    title={!session?.user?.is_vip ? 'Apenas usuários VIP podem fazer downloads' : hasDownloadedBefore(track.id) ? downloadedTracksTime[track.id] > 0 ? `Aguarde ${formatTimeLeft(downloadedTracksTime[track.id] || 0)} para baixar novamente` : 'Música já baixada' : "Download disponível"}
                                >
                                    <Download size={20} />
                                    <span>{getDownloadButtonText(track.id)}</span>
                                </button>
                                {/* Curtir */}
                                <button
                                    onClick={() => handleLikeClick(track.id)}
                                    disabled={!session?.user?.is_vip || liking === track.id}
                                    className={`flex-1 flex items-center justify-center gap-2 px-3 py-3 rounded-xl text-sm font-bold transition-all duration-300 cursor-pointer tracking-wide shadow-lg
                            ${likedTracksSet.has(track.id)
                                            ? 'bg-pink-600 text-white border border-pink-500 shadow-pink-500/25'
                                            : 'bg-gray-700 text-gray-200 hover:bg-pink-700 border border-gray-500 shadow-gray-500/25'
                                        }`}
                                    style={{ fontSize: '15px' }}
                                    title={likedTracksSet.has(track.id) ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
                                >
                                    <Heart size={20} className={likedTracksSet.has(track.id) ? 'fill-pink-400 text-pink-200' : 'text-gray-300'} />
                                    <span>{likedTracksSet.has(track.id) ? 'Curtido' : 'Curtir'}</span>
                                </button>
                            </div>
                            <div className="flex flex-row gap-2 mt-2">
                                {/* Reportar erro */}
                                <button
                                    onClick={() => handleReportClick(track)}
                                    className="flex-1 flex items-center justify-center gap-2 px-3 py-3 rounded-xl text-sm font-bold transition-all duration-300 cursor-pointer tracking-wide shadow-lg bg-yellow-700 text-white hover:bg-yellow-800 border border-yellow-500 shadow-yellow-500/25"
                                    style={{ fontSize: '15px' }}
                                    title="Reportar problema com a música"
                                >
                                    <AlertTriangle size={20} />
                                    <span>Reportar</span>
                                </button>
                                {/* Copyright */}
                                <button
                                    onClick={() => handleCopyrightClick(track)}
                                    className="flex-1 flex items-center justify-center gap-2 px-3 py-3 rounded-xl text-sm font-bold transition-all duration-300 cursor-pointer tracking-wide shadow-lg bg-gray-800 text-white hover:bg-purple-800 border border-purple-500 shadow-purple-500/25"
                                    style={{ fontSize: '15px' }}
                                    title="Reportar copyright"
                                >
                                    <Copyright size={20} />
                                    <span>Copyright</span>
                                </button>
                            </div>
                            {!session && (
                                <Link href="/planos" className="mt-3 flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-bold transition-all duration-300 cursor-pointer tracking-wide shadow-lg bg-blue-600 text-white hover:bg-blue-700 border border-blue-500 shadow-blue-500/25">
                                    ASSINAR PLANO
                                </Link>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default MusicTable;