// src/components/music/MusicTableMinimalist.tsx
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

const MusicTableMinimalist = ({ tracks, onDownload, isDownloading }: MusicTableProps) => {
    const { data: session } = useSession();
    const user = session?.user;
    const { showToast } = useToast();
    const { detectedExtensions, hasExtension } = useDownloadExtensionDetector();

    // Estados necessários (copiados do componente original)
    const [loadingDownloadStatus, setLoadingDownloadStatus] = useState(false);
    const [likedTracksSet, setLikedTracksSet] = useState<Set<number>>(new Set());
    const [, forceUpdate] = useState(0);
    const [liking, setLiking] = useState<number | null>(null);
    const [showRestrict24hModal, setShowRestrict24hModal] = useState<{ track: Track | null, open: boolean }>({ track: null, open: false });
    const [dailyDownloadLimit, setDailyDownloadLimit] = useState(50);
    const [downloadedTracksSet, setDownloadedTracksSet] = useState<Set<number>>(new Set());
    const [downloadsToday, setDownloadsToday] = useState(0);
    const [isLoadingUserData, setIsLoadingUserData] = useState(true);

    // Context para player de música
    const {
        currentTrack,
        isPlaying,
        playTrack,
        togglePlayPause,
        stopMusic,
        handleDownload: contextHandleDownload,
        downloadedTracks,
    } = useAppContext();

    // Funções utilitárias
    const formatDuration = (duration?: string | number): string => {
        // Como não temos duration no tipo Track, vamos retornar um placeholder
        return '3:45';
    };

    const hasDownloadedBefore = (trackId: number): boolean => {
        return downloadedTracksSet.has(trackId);
    };

    const getDownloadButtonText = (trackId: number) => {
        if (hasDownloadedBefore(trackId)) {
            return 'BAIXADO';
        }
        return 'DOWNLOAD';
    };

    // Funções de API (simplificadas para o exemplo)
    const fetchLikes = async () => {
        if (!user?.id) return;
        try {
            const res = await fetch('/api/likes');
            if (!res.ok) return;
            const data = await res.json();
            if (Array.isArray(data.likedTracks)) {
                setLikedTracksSet(new Set(data.likedTracks));
            }
        } catch (err) { }
    };

    const fetchUserData = async () => {
        if (!user?.id) return;
        try {
            setIsLoadingUserData(true);
            const res = await fetch('/api/user-data');
            if (!res.ok) return;
            const data = await res.json();

            if (data.dailyDownloadLimit) {
                setDailyDownloadLimit(data.dailyDownloadLimit);
            }
            if (data.dailyDownloadCount !== undefined) {
                setDownloadsToday(data.dailyDownloadCount);
            }
            if (data.downloadedTrackIds) {
                setDownloadedTracksSet(new Set(data.downloadedTrackIds));
            }
        } catch (err) {
            console.error('Erro ao buscar dados do usuário:', err);
        } finally {
            setIsLoadingUserData(false);
        }
    };

    // Handlers de eventos
    const handlePlayPauseClick = (track: Track) => {
        if (currentTrack?.id === track.id && isPlaying) {
            togglePlayPause();
        } else {
            playTrack(track);
        }
    };

    const handleDownload = async (track: Track, confirmReDownload = false) => {
        if (!user?.id) {
            showToast('❌ Faça login para baixar músicas', 'error');
            return;
        }

        try {
            await contextHandleDownload(track);
            showToast(`✅ "${track.songName}" baixada com sucesso!`, 'success');
        } catch (error) {
            showToast('❌ Erro ao baixar música', 'error');
        }
    };

    const handleLikeClick = async (trackId: number) => {
        if (!session?.user?.is_vip) {
            showToast('❌ Apenas usuários VIP podem curtir músicas', 'error');
            return;
        }

        setLiking(trackId);
        try {
            const isCurrentlyLiked = likedTracksSet.has(trackId);
            const endpoint = isCurrentlyLiked ? '/api/likes/remove' : '/api/likes/add';

            const response = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ trackId }),
            });

            if (response.ok) {
                const newLikedTracksSet = new Set(likedTracksSet);
                if (isCurrentlyLiked) {
                    newLikedTracksSet.delete(trackId);
                    showToast('💔 Música removida dos favoritos', 'info');
                } else {
                    newLikedTracksSet.add(trackId);
                    showToast('❤️ Música adicionada aos favoritos', 'success');
                }
                setLikedTracksSet(newLikedTracksSet);
            }
        } catch (error) {
            showToast('❌ Erro ao curtir música', 'error');
        } finally {
            setLiking(null);
        }
    };

    const handleReportClick = (track: Track) => {
        showToast(`🚨 Problema reportado para "${track.songName}"`, 'info');
    };

    const handleCopyrightClick = (track: Track) => {
        showToast(`📝 Copyright reportado para "${track.songName}"`, 'info');
    };

    // Effects
    useEffect(() => {
        if (tracks && tracks.length > 0) {
            console.log('🎵 Músicas carregadas, verificando extensões...');
        }
    }, [tracks]);

    useEffect(() => {
        const interval = setInterval(() => {
            forceUpdate((v) => v + 1);
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (!user?.id) return;
        fetchLikes();
        fetchUserData();
    }, [user?.id]);

    const downloadsLeft = Math.max(dailyDownloadLimit - downloadsToday, 0);

    return (
        <div className="w-full" style={{ fontFamily: "'Inter', -apple-system, sans-serif" }}>
            {/* Download Status Bar */}
            {user && (
                <div className="mb-6 rounded-2xl border border-white/[0.08] bg-white/[0.02] backdrop-blur-xl p-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                            <span className="text-sm font-medium text-gray-300">
                                Downloads hoje: {downloadsToday}/{dailyDownloadLimit}
                            </span>
                        </div>
                        <div className="text-sm text-gray-400">
                            {downloadsLeft > 0 ? (
                                <span className="text-emerald-400">{downloadsLeft} restantes</span>
                            ) : (
                                <span className="text-amber-400">Limite atingido</span>
                            )}
                        </div>
                    </div>
                    <div className="mt-3 w-full bg-gray-800/50 rounded-full h-2">
                        <div
                            className="bg-gradient-to-r from-emerald-500 to-blue-500 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${Math.min((downloadsToday / dailyDownloadLimit) * 100, 100)}%` }}
                        ></div>
                    </div>
                </div>
            )}

            {/* Main Table Container */}
            <div className="bg-white/[0.02] backdrop-blur-xl rounded-3xl overflow-hidden shadow-2xl border border-white/[0.08]">
                {/* Desktop Table */}
                <div className="hidden md:block overflow-auto" style={{ maxHeight: '70vh' }}>
                    <table className="min-w-full">
                        <thead className="sticky top-0 z-40 bg-white/[0.03] backdrop-blur-xl border-b border-white/[0.06]">
                            <tr>
                                <th className="px-8 py-6 text-left text-xs font-medium tracking-wider text-gray-400 uppercase w-[40%]">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                                        <span>Música</span>
                                    </div>
                                </th>
                                <th className="px-8 py-6 text-left text-xs font-medium tracking-wider text-gray-400 uppercase w-[20%]">
                                    Artista
                                </th>
                                <th className="px-8 py-6 text-left text-xs font-medium tracking-wider text-gray-400 uppercase w-[15%]">
                                    Gênero
                                </th>
                                <th className="px-8 py-6 text-left text-xs font-medium tracking-wider text-gray-400 uppercase w-[15%]">
                                    Pool
                                </th>
                                <th className="px-8 py-6 text-right text-xs font-medium tracking-wider text-gray-400 uppercase w-[10%]">
                                    Ações
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/[0.03]">
                            {tracks.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="text-center py-20">
                                        <div className="flex flex-col items-center space-y-4">
                                            <div className="w-16 h-16 rounded-full bg-gray-800/50 flex items-center justify-center">
                                                <Music className="w-8 h-8 text-gray-600" />
                                            </div>
                                            <p className="text-gray-500 text-sm">Nenhuma música encontrada</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                            {tracks.map((track: Track) => (
                                <tr
                                    key={track.id}
                                    className={`group hover:bg-white/[0.02] transition-all duration-300 ${currentTrack?.id === track.id ? 'bg-blue-500/[0.08] border-l-2 border-l-blue-500' : ''
                                        }`}
                                >
                                    {/* Música Column */}
                                    <td className="px-8 py-6 w-[40%]">
                                        <div className="flex items-center gap-4">
                                            <div className="relative w-12 h-12 group/play">
                                                <img
                                                    src="https://i.ibb.co/FL1rxTtx/20250526-1938-Sound-Cloud-Cover-Design-remix-01jw7bwxq6eqj8sqztah5n296g.png"
                                                    alt={track.songName + ' thumbnail'}
                                                    className="w-12 h-12 rounded-xl object-cover border border-white/[0.1] shadow-sm group-hover/play:border-white/[0.2] transition-all duration-300"
                                                />
                                                <button
                                                    onClick={session ? () => handlePlayPauseClick(track) : undefined}
                                                    disabled={!session}
                                                    className={`absolute inset-0 flex items-center justify-center rounded-xl transition-all duration-300 bg-black/40 hover:bg-black/60 backdrop-blur-sm ${currentTrack?.id === track.id && isPlaying
                                                        ? 'text-white bg-blue-500/90'
                                                        : 'text-gray-300 hover:text-white'
                                                        } ${!session ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                    title={!session ? 'Faça login para ouvir a prévia' : ''}
                                                >
                                                    {isPlaying && currentTrack?.id === track.id ? (
                                                        <Pause size={18} />
                                                    ) : (
                                                        <Play size={18} className="ml-0.5" />
                                                    )}
                                                </button>
                                            </div>
                                            <div className="flex flex-col min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-medium text-white text-sm truncate">
                                                        {track.songName}
                                                    </span>
                                                    {track.isCommunity && (
                                                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                                                            Community
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="text-xs text-gray-500 mt-0.5 truncate">
                                                    {formatDuration()}
                                                </div>
                                            </div>
                                        </div>
                                    </td>

                                    {/* Artista Column */}
                                    <td className="px-8 py-6 w-[20%]">
                                        <span className="text-sm text-gray-300 truncate block">{track.artist}</span>
                                    </td>

                                    {/* Gênero Column */}
                                    <td className="px-8 py-6 w-[15%]">
                                        <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-gray-800/50 text-gray-300 border border-gray-700/50">
                                            {track.style}
                                        </span>
                                    </td>

                                    {/* Pool Column */}
                                    <td className="px-8 py-6 w-[15%]">
                                        <span className="text-sm text-gray-400">{track.pool || 'Geral'}</span>
                                    </td>

                                    {/* Ações Column */}
                                    <td className="px-8 py-6 text-right w-[10%]">
                                        {session ? (
                                            <div className="flex items-center justify-end gap-2">
                                                {/* Download Button */}
                                                <button
                                                    onClick={() => handleDownload(track)}
                                                    disabled={isDownloading}
                                                    className={`inline-flex items-center justify-center w-9 h-9 rounded-lg transition-all duration-300 border group ${hasDownloadedBefore(track.id)
                                                        ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/30'
                                                        : 'bg-[#374151] text-gray-300 border-gray-600 hover:bg-gray-600'
                                                        } ${isDownloading ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                    title={hasDownloadedBefore(track.id) ? 'Baixado anteriormente' : 'Baixar música'}
                                                >
                                                    <Download size={16} className="group-hover:scale-110 transition-transform" />
                                                </button>

                                                {/* Like Button */}
                                                <button
                                                    onClick={() => handleLikeClick(track.id)}
                                                    disabled={!session?.user?.is_vip || liking === track.id}
                                                    className={`inline-flex items-center justify-center w-9 h-9 rounded-lg transition-all duration-300 border group ${likedTracksSet.has(track.id)
                                                        ? 'bg-pink-500/20 text-pink-400 border-pink-500/30 hover:bg-pink-500/30'
                                                        : 'bg-[#374151] text-gray-300 border-gray-600 hover:bg-gray-600'
                                                        }`}
                                                    title={likedTracksSet.has(track.id) ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
                                                >
                                                    <Heart
                                                        size={16}
                                                        className={`group-hover:scale-110 transition-transform ${likedTracksSet.has(track.id) ? 'fill-current' : ''
                                                            }`}
                                                    />
                                                </button>

                                                {/* Report Button */}
                                                <button
                                                    onClick={() => handleReportClick(track)}
                                                    className="inline-flex items-center justify-center w-9 h-9 rounded-lg transition-all duration-300 border bg-amber-500/20 text-amber-400 border-amber-500/30 hover:bg-amber-500/30 group"
                                                    title="Reportar problema"
                                                >
                                                    <AlertTriangle size={16} className="group-hover:scale-110 transition-transform" />
                                                </button>

                                                {/* Copyright Button */}
                                                <button
                                                    onClick={() => handleCopyrightClick(track)}
                                                    className="inline-flex items-center justify-center w-9 h-9 rounded-lg transition-all duration-300 border bg-purple-500/20 text-purple-400 border-purple-500/30 hover:bg-purple-500/30 group"
                                                    title="Reportar copyright"
                                                >
                                                    <Copyright size={16} className="group-hover:scale-110 transition-transform" />
                                                </button>
                                            </div>
                                        ) : (
                                            <Link
                                                href="/planos"
                                                className="inline-flex items-center justify-center px-4 py-2 rounded-lg text-xs font-medium transition-all duration-300 bg-blue-500/20 text-blue-400 border border-blue-500/30 hover:bg-blue-500/30"
                                            >
                                                Assinar
                                            </Link>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Mobile Cards */}
                <div className="md:hidden p-4 space-y-4">
                    {tracks.length === 0 && (
                        <div className="text-center py-16">
                            <div className="flex flex-col items-center space-y-4">
                                <div className="w-16 h-16 rounded-full bg-gray-800/50 flex items-center justify-center">
                                    <Music className="w-8 h-8 text-gray-600" />
                                </div>
                                <p className="text-gray-500 text-sm">Nenhuma música encontrada</p>
                            </div>
                        </div>
                    )}
                    {tracks.map((track: Track) => (
                        <div
                            key={track.id}
                            className={`rounded-2xl border border-white/[0.08] bg-white/[0.02] backdrop-blur-xl p-6 ${currentTrack?.id === track.id ? 'ring-2 ring-blue-500/50' : ''
                                }`}
                        >
                            {/* Mobile Track Info */}
                            <div className="flex items-center gap-4 mb-4">
                                <div className="relative w-16 h-16 group/play">
                                    <img
                                        src="https://i.ibb.co/FL1rxTtx/20250526-1938-Sound-Cloud-Cover-Design-remix-01jw7bwxq6eqj8sqztah5n296g.png"
                                        alt={track.songName + ' thumbnail'}
                                        className="w-16 h-16 rounded-xl object-cover border border-white/[0.1] shadow-sm"
                                    />
                                    <button
                                        onClick={session ? () => handlePlayPauseClick(track) : undefined}
                                        disabled={!session}
                                        className={`absolute inset-0 flex items-center justify-center rounded-xl transition-all duration-300 bg-black/40 hover:bg-black/60 backdrop-blur-sm ${currentTrack?.id === track.id && isPlaying
                                            ? 'text-white bg-blue-500/90'
                                            : 'text-gray-300 hover:text-white'
                                            } ${!session ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    >
                                        {isPlaying && currentTrack?.id === track.id ? (
                                            <Pause size={20} />
                                        ) : (
                                            <Play size={20} className="ml-0.5" />
                                        )}
                                    </button>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h3 className="font-medium text-white text-sm truncate">{track.songName}</h3>
                                        {track.isCommunity && (
                                            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                                                Community
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-sm text-gray-300 truncate">{track.artist}</p>
                                    <div className="flex items-center gap-2 mt-2">
                                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-gray-800/50 text-gray-300 border border-gray-700/50">
                                            {track.style}
                                        </span>
                                        <span className="text-xs text-gray-500">{formatDuration()}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Mobile Action Buttons */}
                            {session ? (
                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        onClick={() => handleDownload(track)}
                                        disabled={isDownloading}
                                        className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 border ${hasDownloadedBefore(track.id)
                                            ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                                            : 'bg-[#374151] text-gray-300 border-gray-600'
                                            }`}
                                    >
                                        <Download size={18} />
                                        <span>{hasDownloadedBefore(track.id) ? 'Baixado' : 'Download'}</span>
                                    </button>
                                    <button
                                        onClick={() => handleLikeClick(track.id)}
                                        disabled={!session?.user?.is_vip || liking === track.id}
                                        className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 border ${likedTracksSet.has(track.id)
                                            ? 'bg-pink-500/20 text-pink-400 border-pink-500/30'
                                            : 'bg-[#374151] text-gray-300 border-gray-600'
                                            }`}
                                    >
                                        <Heart size={18} className={likedTracksSet.has(track.id) ? 'fill-current' : ''} />
                                        <span>{likedTracksSet.has(track.id) ? 'Curtido' : 'Curtir'}</span>
                                    </button>
                                    <button
                                        onClick={() => handleReportClick(track)}
                                        className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 border bg-amber-500/20 text-amber-400 border-amber-500/30"
                                    >
                                        <AlertTriangle size={18} />
                                        <span>Reportar</span>
                                    </button>
                                    <button
                                        onClick={() => handleCopyrightClick(track)}
                                        className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 border bg-purple-500/20 text-purple-400 border-purple-500/30"
                                    >
                                        <Copyright size={18} />
                                        <span>Copyright</span>
                                    </button>
                                </div>
                            ) : (
                                <Link
                                    href="/planos"
                                    className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 border bg-blue-500/20 text-blue-400 border-blue-500/30"
                                >
                                    Assinar Plano
                                </Link>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default MusicTableMinimalist;
