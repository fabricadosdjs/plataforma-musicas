// src/components/music/MusicTable.tsx
"use client";
import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Play, Pause, Download, Heart, AlertTriangle, Copyright } from 'lucide-react';
import Link from 'next/link';
import { Track } from '@/types/track';
import { useGlobalPlayer } from '@/context/GlobalPlayerContext';
import { useDownloadExtensionDetector } from '@/hooks/useDownloadExtensionDetector';
import toast from 'react-hot-toast';

interface MusicTableProps {
    tracks: Track[];
    user?: any;
    session?: any;
    onDownload?: (tracks: Track[]) => void;
    isDownloading?: boolean;
    onPlay?: (track: Track) => void;
}

const MusicTable = ({ tracks, user, session, onDownload, isDownloading, onPlay }: MusicTableProps) => {
    const { data: sessionData } = useSession();
    const userId = user?.id || sessionData?.user?.id;
    const { detectedExtensions, hasExtension } = useDownloadExtensionDetector();

    // GlobalPlayer para controle de áudio
    const { currentTrack, isPlaying, playTrack, togglePlayPause } = useGlobalPlayer();

    // Estados para download tracking
    const [downloadedTracksSet, setDownloadedTracksSet] = useState<Set<number>>(new Set());
    const [downloadedTracksTime, setDownloadedTracksTime] = useState<{ [key: number]: number }>({});
    const [likedTracksSet, setLikedTracksSet] = useState<Set<number>>(new Set());
    const [liking, setLiking] = useState<number | null>(null);

    // Verificar extensões quando há músicas
    useEffect(() => {
        if (tracks && tracks.length > 0) {
            console.log('🎵 Músicas carregadas, verificando extensões...');
        }
    }, [tracks]);

    // Função principal para play/pause
    const handlePlayPauseClick = (track: Track) => {
        console.log('🔍 MusicTable: Play button clicked', {
            trackId: track.id,
            trackName: track.songName,
            downloadUrl: track.downloadUrl,
            isCurrentTrack: currentTrack?.id === track.id,
            isPlaying
        });

        // Se não está logado ou não é VIP, verificar limitações
        if (!sessionData || !sessionData?.user?.is_vip) {
            if (onPlay) {
                onPlay(track);
            } else {
                if (!sessionData) {
                    toast.error('🔒 Você precisa fazer login para ouvir as músicas!');
                } else {
                    toast.error('⭐ Você precisa assinar um plano VIP para ouvir as músicas!');
                }
            }
            return;
        }

        // Se é a mesma música, toggle play/pause
        if (currentTrack?.id === track.id) {
            console.log('🔍 MusicTable: Toggling play/pause for current track');
            togglePlayPause();
        } else {
            console.log('🔍 MusicTable: Playing new track with GlobalPlayer');
            playTrack(track);
        }
    };

    // Função para download
    const handleDownload = async (track: Track) => {
        console.log('🔍 MusicTable: Download clicked', {
            trackId: track.id,
            downloadUrl: track.downloadUrl
        });

        if (!sessionData?.user?.is_vip) {
            toast.error('⭐ Você precisa ser VIP para baixar músicas!');
            return;
        }

        try {
            const response = await fetch('/api/download', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    trackId: track.id,
                    trackName: track.songName,
                    downloadUrl: track.downloadUrl
                }),
            });

            if (!response.ok) {
                throw new Error('Falha no download');
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;
            a.download = `${track.artist} - ${track.songName}.mp3`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);

            toast.success('🎵 Download iniciado!');
        } catch (error) {
            console.error('Erro no download:', error);
            toast.error('❌ Erro no download. Tente novamente.');
        }
    };

    // Função para like
    const handleLike = async (trackId: number) => {
        if (!sessionData?.user?.is_vip) {
            toast.error('⭐ Você precisa ser VIP para curtir músicas!');
            return;
        }

        if (liking === trackId) return;

        try {
            setLiking(trackId);
            const response = await fetch('/api/like', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ trackId }),
            });

            if (response.ok) {
                setLikedTracksSet(prev => {
                    const newSet = new Set(prev);
                    if (newSet.has(trackId)) {
                        newSet.delete(trackId);
                    } else {
                        newSet.add(trackId);
                    }
                    return newSet;
                });
                toast.success('❤️ Like atualizado!');
            }
        } catch (error) {
            console.error('Erro no like:', error);
            toast.error('❌ Erro ao curtir música');
        } finally {
            setLiking(null);
        }
    };

    // Função para report
    const handleReport = (trackId: number) => {
        toast.success('📢 Música reportada para análise!');
    };

    // Função para copyright
    const handleCopyright = (trackId: number) => {
        toast.success('©️ Informações de direitos autorais enviadas!');
    };

    if (!tracks || tracks.length === 0) {
        return (
            <div className="text-center py-8">
                <p className="text-gray-400">Nenhuma música encontrada</p>
            </div>
        );
    }

    return (
        <div className="bg-black/20 backdrop-blur-sm rounded-2xl border border-white/10 overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
                {/* Desktop Table */}
                <div className="hidden lg:block">
                    <table className="min-w-full">
                        <thead className="bg-black/30 border-b border-white/10">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Música</th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Artista</th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Estilo</th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="bg-black/10 divide-y divide-white/5">
                            {tracks.map((track, index) => (
                                <tr key={track.id} className="hover:bg-white/5 transition-colors">
                                    <td className="px-6 py-4 align-middle w-[35%]">
                                        <div className="flex items-center gap-4">
                                            <div className="relative w-14 h-14 group">
                                                <img
                                                    src="https://i.ibb.co/FL1rxTtx/20250526-1938-Sound-Cloud-Cover-Design-remix-01jw7bwxq6eqj8sqztah5n296g.png"
                                                    alt={track.songName + ' thumbnail'}
                                                    className="w-14 h-14 rounded-xl object-cover border border-gray-700 shadow-lg group-hover:border-blue-500 transition-all duration-300 cursor-pointer"
                                                    onClick={() => handlePlayPauseClick(track)}
                                                />
                                                {/* Overlay de play/pause */}
                                                <div className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-300">
                                                    {currentTrack?.id === track.id && isPlaying ? (
                                                        <Pause size={24} className="text-white drop-shadow-lg" />
                                                    ) : (
                                                        <Play size={24} className="text-white drop-shadow-lg ml-1" />
                                                    )}
                                                </div>
                                                {/* Indicador de música atual */}
                                                {currentTrack?.id === track.id && (
                                                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                                                        <div className="w-2 h-2 bg-white rounded-full"></div>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex flex-col">
                                                <h3 className="font-semibold text-white text-lg leading-tight">{track.songName}</h3>
                                                <p className="text-gray-400 text-sm">{track.version || 'Original'}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-white font-medium">{track.artist}</td>
                                    <td className="px-6 py-4">
                                        <span className="px-3 py-1 text-xs font-medium bg-purple-500/20 text-purple-300 rounded-full border border-purple-500/30">
                                            {track.style}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => handleDownload(track)}
                                                className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition-colors"
                                                title="Download"
                                                disabled={isDownloading}
                                            >
                                                <Download className="h-4 w-4" />
                                            </button>
                                            <button
                                                onClick={() => handleLike(track.id)}
                                                className={`bg-pink-600 text-white p-2 rounded-lg hover:bg-pink-700 transition-colors ${likedTracksSet.has(track.id) ? 'ring-2 ring-pink-400' : ''}`}
                                                title="Like"
                                                disabled={liking === track.id}
                                            >
                                                <Heart className="h-4 w-4" />
                                            </button>
                                            <button
                                                onClick={() => handleReport(track.id)}
                                                className="bg-yellow-600 text-white p-2 rounded-lg hover:bg-yellow-700 transition-colors"
                                                title="Reportar"
                                            >
                                                <AlertTriangle className="h-4 w-4" />
                                            </button>
                                            <button
                                                onClick={() => handleCopyright(track.id)}
                                                className="bg-gray-700 text-white p-2 rounded-lg hover:bg-gray-800 transition-colors"
                                                title="Copyright"
                                            >
                                                <Copyright className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Mobile Cards */}
                <div className="lg:hidden space-y-4 p-4">
                    {tracks.map((track, index) => (
                        <div key={track.id} className="bg-black/30 rounded-xl p-4 border border-white/10">
                            <div className="flex items-center gap-4 mb-3">
                                <div className="relative w-12 h-12 group">
                                    <img
                                        src="https://i.ibb.co/FL1rxTtx/20250526-1938-Sound-Cloud-Cover-Design-remix-01jw7bwxq6eqj8sqztah5n296g.png"
                                        alt={track.songName + ' thumbnail'}
                                        className="w-12 h-12 rounded-lg object-cover border border-gray-700 cursor-pointer"
                                        onClick={() => handlePlayPauseClick(track)}
                                    />
                                    {/* Overlay móvel */}
                                    <div className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200">
                                        {currentTrack?.id === track.id && isPlaying ? (
                                            <Pause size={16} className="text-white" />
                                        ) : (
                                            <Play size={16} className="text-white ml-0.5" />
                                        )}
                                    </div>
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-semibold text-white">{track.songName}</h3>
                                    <p className="text-gray-400 text-sm">{track.artist}</p>
                                </div>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="px-2 py-1 text-xs font-medium bg-purple-500/20 text-purple-300 rounded-full">
                                    {track.style}
                                </span>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => handleDownload(track)}
                                        className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition-colors"
                                        disabled={isDownloading}
                                    >
                                        <Download className="h-4 w-4" />
                                    </button>
                                    <button
                                        onClick={() => handleLike(track.id)}
                                        className={`bg-pink-600 text-white p-2 rounded-lg hover:bg-pink-700 transition-colors ${likedTracksSet.has(track.id) ? 'ring-2 ring-pink-400' : ''}`}
                                        disabled={liking === track.id}
                                    >
                                        <Heart className="h-4 w-4" />
                                    </button>
                                    <button
                                        onClick={() => handleReport(track.id)}
                                        className="bg-yellow-600 text-white p-2 rounded-lg hover:bg-yellow-700 transition-colors"
                                    >
                                        <AlertTriangle className="h-4 w-4" />
                                    </button>
                                    <button
                                        onClick={() => handleCopyright(track.id)}
                                        className="bg-gray-700 text-white p-2 rounded-lg hover:bg-gray-800 transition-colors"
                                    >
                                        <Copyright className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default MusicTable;
