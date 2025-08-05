"use client";
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import { Play, Pause, Download, Heart, AlertTriangle, Copyright, Music, Trash2, Loader2, DownloadCloud, Sparkles, Zap, Star, Shield, Eye, Clock, TrendingUp, Volume2, FileAudio, Headphones, Mic, Disc3, Radio, Music2, Music3, Music4 } from 'lucide-react';
import Link from 'next/link';
import { Track } from '@/types/track';
import { useGlobalPlayer } from '@/context/GlobalPlayerContext';
import { useToastContext } from '@/context/ToastContext';
import { useUserData } from '@/hooks/useUserData';
import clsx from 'clsx';

// --- SUBCOMPONENTES (Nenhuma alteração aqui) ---

interface TrackUIProps {
    track: Track;
    isCurrent: boolean;
    isPlaying: boolean;
    isLiked: boolean;
    isLiking: boolean;
    isDeleting: boolean;
    isAdmin: boolean;
    canDownloadResult: { can: boolean; reason: string; timeLeft: string };
    onPlayPause: (track: Track) => void;
    onDownload: (track: Track) => void;
    onLike: (trackId: number) => void;
    onReport: (track: Track) => void;
    onCopyright: (track: Track) => void;
    onDelete: (track: Track) => void;
}

const TrackRow = React.memo(({
    track, isCurrent, isPlaying, isLiked, isLiking, isDeleting, isAdmin, canDownloadResult,
    onPlayPause, onDownload, onLike, onReport, onCopyright, onDelete
}: TrackUIProps) => {
    const { userData } = useUserData();
    const hasDownloaded = userData?.downloadedTrackIds?.includes(track.id) || false;

    return (
        <tr className={clsx("group hover:bg-zinc-800/50 transition-all duration-200", { 'bg-blue-900/20': isCurrent })}>
            <td className="px-4 py-3 align-middle w-[35%]">
                <div className="flex items-center gap-4">
                    <div className="relative flex-shrink-0 w-12 h-12 group-hover:scale-105 transition-transform duration-200">
                        <img src={track.imageUrl || "https://i.ibb.co/FL1rxTtx/20250526-1938-Sound-Cloud-Cover-Design-remix-01jw7bwxq6eqj8sqztah5n296g.png"} alt={`Capa de ${track.songName}`} className="w-12 h-12 rounded-lg object-cover border border-zinc-700 shadow-md" />
                        <button onClick={() => onPlayPause(track)} className={clsx("absolute inset-0 flex items-center justify-center rounded-lg transition-all duration-300 backdrop-blur-sm text-white bg-black/60 opacity-0 group-hover:opacity-100 hover:bg-black/80", { 'opacity-100': isCurrent })} title={isPlaying && isCurrent ? "Pausar" : "Tocar"}>
                            {isPlaying && isCurrent ? <Pause size={24} className="text-blue-400" /> : <Play size={24} className="ml-1 text-white" />}
                        </button>
                    </div>
                    <div className="flex flex-col min-w-0">
                        <span className="font-semibold text-gray-100 truncate" title={track.songName}>{track.songName}</span>
                        <span className="text-sm text-gray-400 truncate" title={track.artist}>{track.artist}</span>
                    </div>
                </div>
            </td>
            <td className="px-4 py-3 align-middle w-[15%]"><span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-purple-600 to-blue-600 text-white tracking-wide shadow-sm">{track.style}</span></td>
            <td className="px-4 py-3 align-middle w-[15%]"><span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-emerald-600 to-green-600 text-white tracking-wide shadow-sm">{track.pool || 'Nexor Records'}</span></td>
            <td className="px-4 py-3 align-middle w-[35%]">
                <div className="flex items-center justify-end gap-2">
                    <button
                        onClick={() => onDownload(track)}
                        disabled={!canDownloadResult.can}
                        title={hasDownloaded ? "Você já baixou esta música" : canDownloadResult.reason}
                        className={clsx("flex items-center gap-2 p-2 rounded-lg font-bold transition-all duration-200 shadow-md hover:shadow-lg", {
                            "bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white": hasDownloaded && canDownloadResult.can,
                            "bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white": !hasDownloaded && canDownloadResult.can,
                            "bg-zinc-700 text-gray-400 cursor-not-allowed opacity-60": !canDownloadResult.can
                        })}
                    >
                        <DownloadCloud size={16} />
                        <span className='text-xs'>
                            {hasDownloaded ? 'BAIXADO' : (canDownloadResult.timeLeft || 'DOWNLOAD')}
                        </span>
                    </button>
                    <button onClick={() => onLike(track.id)} disabled={isLiking} title={isLiked ? "Descurtir" : "Curtir"} className={clsx("p-2 rounded-lg transition-all duration-200 hover:shadow-lg", { 'text-pink-500 fill-pink-500 bg-pink-500/10 hover:bg-pink-500/20': isLiked, 'text-gray-400 hover:text-pink-400 hover:bg-pink-500/10': !isLiked })}>
                        {isLiking ? <Loader2 size={16} className="animate-spin" /> : <Heart size={16} />}
                    </button>
                    <button onClick={() => onReport(track)} title="Reportar Problema" className="p-2 text-gray-400 hover:text-yellow-400 hover:bg-yellow-500/10 transition-all duration-200 rounded-lg"><AlertTriangle size={16} /></button>
                    <button onClick={() => onCopyright(track)} title="Reportar Copyright" className="p-2 text-gray-400 hover:text-purple-400 hover:bg-purple-500/10 transition-all duration-200 rounded-lg"><Shield size={16} /></button>
                    {isAdmin && <button onClick={() => onDelete(track)} disabled={isDeleting} title="Excluir Música" className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-500/10 transition-all duration-200 rounded-lg">{isDeleting ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}</button>}
                </div>
            </td>
        </tr>
    );
});
TrackRow.displayName = 'TrackRow';

const TrackCard = React.memo(({
    track, isCurrent, isPlaying, isLiked, isLiking, isDeleting, isAdmin, canDownloadResult,
    onPlayPause, onDownload, onLike, onReport, onCopyright, onDelete
}: TrackUIProps) => {
    const { userData } = useUserData();
    const hasDownloaded = userData?.downloadedTrackIds?.includes(track.id) || false;

    return (
        <div className={clsx("rounded-xl border shadow-lg backdrop-blur-md transition-all duration-300 ease-in-out", { 'ring-2 ring-blue-500 bg-zinc-900 border-zinc-700': isCurrent, 'bg-zinc-900/70 border-zinc-800': !isCurrent })}>
            <div className="p-4 flex items-center gap-4 border-b border-zinc-800">
                <div className="relative flex-shrink-0 w-14 h-14">
                    <img src={track.imageUrl || "https://i.ibb.co/FL1rxTtx/20250526-1938-Sound-Cloud-Cover-Design-remix-01jw7bwxq6eqj8sqztah5n296g.png"} alt={`Capa de ${track.songName}`} className="w-14 h-14 rounded-lg object-cover border border-zinc-700" />
                    <button onClick={() => onPlayPause(track)} className="absolute inset-0 flex items-center justify-center rounded-lg bg-black/50 hover:bg-black/70 transition-all duration-200" title={isPlaying && isCurrent ? "Pausar" : "Tocar"}>
                        {isPlaying && isCurrent ? <Pause size={28} className="text-blue-400" /> : <Play size={28} className="ml-1 text-white" />}
                    </button>
                </div>
                <div className="flex flex-col min-w-0">
                    <span className="font-bold text-white text-lg truncate">{track.songName}</span>
                    <span className="text-sm text-gray-400 truncate">{track.artist}</span>
                    <div className="flex items-center gap-2 mt-2">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-gradient-to-r from-purple-600 to-blue-600 text-white">{track.style}</span>
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-gradient-to-r from-emerald-600 to-green-600 text-white">{track.pool || 'NR'}</span>
                    </div>
                </div>
            </div>
            <div className="p-4 grid grid-cols-2 gap-3">
                <button
                    onClick={() => onDownload(track)}
                    disabled={!canDownloadResult.can}
                    title={hasDownloaded ? "Você já baixou esta música" : canDownloadResult.reason}
                    className={clsx("flex items-center justify-center gap-2 py-3 rounded-lg font-bold transition-all duration-200 shadow-lg text-sm", {
                        "bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white": hasDownloaded && canDownloadResult.can,
                        "bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white": !hasDownloaded && canDownloadResult.can,
                        "bg-zinc-700 text-gray-400 cursor-not-allowed opacity-70": !canDownloadResult.can
                    })}
                >
                    <DownloadCloud size={16} />
                    {hasDownloaded ? 'BAIXADO' : (canDownloadResult.timeLeft || 'DOWNLOAD')}
                </button>
                <button onClick={() => onLike(track.id)} disabled={isLiking} title={isLiked ? "Descurtir" : "Curtir"} className={clsx("flex items-center justify-center gap-2 py-3 rounded-lg font-bold transition-all duration-200 shadow-lg text-sm", { 'bg-gradient-to-r from-pink-600 to-pink-500 text-white': isLiked, 'bg-zinc-700 hover:bg-zinc-600 text-white': !isLiked })}>
                    {isLiking ? <Loader2 size={16} className="animate-spin" /> : <Heart size={16} className={clsx({ "fill-current": isLiked })} />} {isLiked ? 'CURTIDO' : 'CURTIR'}
                </button>
                <button onClick={() => onReport(track)} title="Reportar Problema" className="flex items-center justify-center gap-2 py-2 rounded-lg bg-zinc-800/50 hover:bg-yellow-600/50 text-gray-300 hover:text-white transition-all duration-200 text-xs"><AlertTriangle size={14} /> Reportar</button>
                <button onClick={() => onCopyright(track)} title="Reportar Copyright" className="flex items-center justify-center gap-2 py-2 rounded-lg bg-zinc-800/50 hover:bg-purple-600/50 text-gray-300 hover:text-white transition-all duration-200 text-xs"><Shield size={14} /> Copyright</button>
                {isAdmin && <button onClick={() => onDelete(track)} disabled={isDeleting} title="Excluir Música" className="col-span-2 flex items-center justify-center gap-2 py-2 rounded-lg bg-red-800/60 hover:bg-red-700/60 text-white transition-all duration-200 font-semibold text-xs">{isDeleting ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={14} />} {isDeleting ? 'Excluindo...' : 'Excluir Música'}</button>}
            </div>
        </div>
    );
});
TrackCard.displayName = 'TrackCard';


// --- COMPONENTE PRINCIPAL ---
const MusicTable = ({ tracks, onDownload: onTracksUpdate, isDownloading }: { tracks: Track[], onDownload?: (tracks: Track[]) => void, isDownloading?: boolean }) => {
    const { data: session } = useSession();
    const user = session?.user;
    const { showToast } = useToastContext();

    // Hooks de contexto e dados
    const { currentTrack, isPlaying, playTrack, togglePlayPause } = useGlobalPlayer();
    const { userData, updateLikedTrack, updateDownloadedTrack } = useUserData();

    // Estados de UI
    const [liking, setLiking] = useState<number | null>(null);
    const [deleting, setDeleting] = useState<number | null>(null);
    const [downloadCooldowns, setDownloadCooldowns] = useState<{ [key: number]: number }>({});

    // Constantes e Helpers
    const isAdmin = useMemo(() => user?.email === 'edersonleonardo@nexorrecords.com.br', [user?.email]);
    const isVip = useMemo(() => !!user?.is_vip || isAdmin, [user?.is_vip, isAdmin]);

    const downloadsToday = useMemo(() => userData?.dailyDownloadCount || 0, [userData?.dailyDownloadCount]);
    const dailyLimit = useMemo(() => userData?.dailyDownloadLimit || 50, [userData?.dailyDownloadLimit]);
    const downloadsLeft = useMemo(() => {
        if (typeof dailyLimit === 'string' && dailyLimit === 'Ilimitado') {
            return 'Ilimitado';
        }
        return Math.max((dailyLimit as number) - downloadsToday, 0);
    }, [dailyLimit, downloadsToday]);

    // Função para verificar se o usuário já baixou a música
    const hasDownloadedTrack = useCallback((trackId: number) => {
        return userData?.downloadedTrackIds?.includes(trackId) || false;
    }, [userData?.downloadedTrackIds]);

    // Efeito para gerenciar os cooldowns de download
    useEffect(() => {
        const interval = setInterval(() => {
            setDownloadCooldowns(prev => {
                const newCooldowns = { ...prev };
                let changed = false;
                Object.keys(newCooldowns).forEach(trackId => {
                    const id = Number(trackId);
                    if (newCooldowns[id] <= 1) delete newCooldowns[id];
                    else newCooldowns[id] -= 1;
                    changed = true;
                });
                return changed ? newCooldowns : prev;
            });
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    // Funções de formatação e verificação
    const formatTimeLeft = (seconds: number): string => {
        if (seconds <= 0) return '';
        const h = Math.floor(seconds / 3600).toString().padStart(2, '0');
        const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
        const s = (seconds % 60).toString().padStart(2, '0');
        return `${h}:${m}:${s}`;
    };

    const canDownload = useMemo(() => {
        return (trackId: number) => {
            if (!isVip) return { can: false, reason: 'Apenas usuários VIP podem baixar músicas.', timeLeft: '' };
            if (typeof dailyLimit === 'string' && dailyLimit === 'Ilimitado') {
                // Para usuários VIP com downloads ilimitados, apenas verificar cooldown
                const cooldown = downloadCooldowns[trackId];
                if (cooldown > 0) {
                    const timeLeftFormatted = formatTimeLeft(cooldown);
                    return { can: false, reason: `Aguarde ${timeLeftFormatted} para baixar novamente.`, timeLeft: timeLeftFormatted };
                }
                return { can: true, reason: 'Clique para baixar a música.', timeLeft: '' };
            }
            // Para usuários não-VIP ou com limite
            if (typeof downloadsLeft === 'number' && downloadsLeft <= 0) return { can: false, reason: 'Limite diário de downloads atingido.', timeLeft: '' };
            const cooldown = downloadCooldowns[trackId];
            if (cooldown > 0) {
                const timeLeftFormatted = formatTimeLeft(cooldown);
                return { can: false, reason: `Aguarde ${timeLeftFormatted} para baixar novamente.`, timeLeft: timeLeftFormatted };
            }
            return { can: true, reason: 'Clique para baixar a música.', timeLeft: '' };
        };
    }, [isVip, downloadsLeft, downloadCooldowns, dailyLimit]);

    // Handlers de Ações
    const handlePlayPauseClick = async (track: Track) => {
        if (!user) { showToast('👤 Faça login para ouvir as músicas', 'warning'); return; }
        if (currentTrack?.id === track.id) { togglePlayPause(); }
        else {
            try { await playTrack(track, tracks); showToast(`🎵 Tocando "${track.songName}"`, 'info'); }
            catch (error) { showToast('❌ Erro ao reproduzir música', 'error'); }
        }
    };

    const handleDownloadClick = async (track: Track) => {
        if (!user) {
            showToast('👤 Faça login para fazer downloads', 'warning');
            return;
        }

        if (!isVip) {
            showToast('💎 Apenas usuários VIP podem baixar músicas', 'warning');
            return;
        }

        const canDownloadResult = canDownload(track.id);
        if (!canDownloadResult.can) {
            showToast(canDownloadResult.reason, 'warning');
            return;
        }

        // Verifica se já baixou nas últimas 24 horas
        if (hasDownloadedTrack(track.id)) {
            showToast('⚠️ Você já baixou esta música nas últimas 24 horas', 'warning');
            return;
        }

        try {
            const response = await fetch('/api/tracks/download', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    trackId: track.id.toString()
                }),
            });

            if (response.ok) {
                const responseData = await response.json();

                updateDownloadedTrack(track.id);

                // Definir cooldown de 24 horas (86400 segundos)
                setDownloadCooldowns(prev => ({
                    ...prev,
                    [track.id]: 86400
                }));

                // Forçar download do arquivo (não abrir em nova aba)
                if (track.downloadUrl) {
                    // Criar um blob para forçar o download
                    const response = await fetch(track.downloadUrl);
                    const blob = await response.blob();
                    const url = window.URL.createObjectURL(blob);

                    const link = document.createElement('a');
                    link.href = url;
                    link.download = `${track.artist} - ${track.songName}.mp3`;
                    link.style.display = 'none';
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);

                    // Limpar o URL do blob
                    window.URL.revokeObjectURL(url);
                }

                showToast(`✅ "${track.songName}" baixada com sucesso!`, 'success');
            } else {
                const errorData = await response.json();
                showToast(errorData.error || '❌ Erro ao fazer download', 'error');
            }
        } catch (error) {
            console.error('❌ Erro ao fazer download:', error);
            showToast('❌ Erro ao fazer download', 'error');
        }
    };

    const handleLikeClick = async (trackId: number) => {
        if (!user) {
            showToast('👤 Faça login para curtir músicas', 'warning');
            return;
        }

        if (!session?.user?.email) {
            showToast('👤 Faça login para curtir músicas', 'warning');
            return;
        }

        if (liking === trackId) {
            return;
        }

        setLiking(trackId);
        try {
            const isLiked = userData?.likedTrackIds?.includes(trackId) ?? false;

            const response = await fetch('/api/tracks/like', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    trackId: trackId.toString(),
                    action: isLiked ? 'unlike' : 'like'
                }),
            });

            if (response.ok) {
                const responseData = await response.json();

                updateLikedTrack(trackId, !isLiked);
                showToast(
                    isLiked ? '💔 Música removida dos favoritos!' : '❤️ Música adicionada aos favoritos!',
                    'success'
                );
            } else {
                const errorData = await response.json();
                showToast('❌ Erro ao curtir música', 'error');
            }
        } catch (error) {
            console.error('❌ Erro ao curtir música:', error);
            showToast('❌ Erro ao curtir música', 'error');
        } finally {
            setLiking(null);
        }
    };

    const handleDeleteClick = async (track: Track) => {
        if (!isAdmin) {
            showToast('🚫 Apenas administradores podem excluir músicas', 'error');
            return;
        }

        if (deleting === track.id) return;

        setDeleting(track.id);
        try {
            const response = await fetch(`/api/tracks/delete`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    trackId: track.id.toString()
                }),
            });

            if (response.ok) {
                showToast(`🗑️ "${track.songName}" excluída com sucesso!`, 'success');
                // Atualizar a lista de tracks removendo a track excluída
                if (onTracksUpdate) {
                    const updatedTracks = tracks.filter(t => t.id !== track.id);
                    onTracksUpdate(updatedTracks);
                }
            } else {
                const data = await response.json();
                showToast(data.error || '❌ Erro ao excluir música', 'error');
            }
        } catch (error) {
            console.error('Erro ao excluir música:', error);
            showToast('❌ Erro ao excluir música', 'error');
        } finally {
            setDeleting(null);
        }
    };

    const handleReportClick = (track: Track) => { showToast(`📣 Problema com "${track.songName}" reportado. Obrigado!`, 'info'); };
    const handleCopyrightClick = (track: Track) => { showToast(`©️ Denúncia de copyright para "${track.songName}" enviada.`, 'info'); };

    // --- RENDERIZAÇÃO PRINCIPAL ---
    return (
        <div className="relative w-full h-full text-sm text-gray-200 font-sans bg-[#1A1B1C]">

            {/* NOVO: Bloco de estilo para a barra de rolagem */}
            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 8px;
                    height: 8px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background-color: #1f2937; /* gray-800 */
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background-color: #4b5563; /* gray-600 */
                    border-radius: 10px;
                    border: 2px solid #1f2937; /* gray-800 */
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background-color: #6b7280; /* gray-500 */
                }
                /* Suporte para Firefox */
                .custom-scrollbar {
                    scrollbar-width: thin;
                    scrollbar-color: #4b5563 #1f2937;
                }
            `}</style>

            {!isVip && (
                <div className="w-full flex items-center gap-4 text-center py-3 px-5 mb-4 rounded-xl bg-zinc-900/70 border border-zinc-800 shadow-lg">
                    <DownloadCloud className="text-blue-500 flex-shrink-0" size={28} />
                    <div className='text-left'>
                        <p className="text-gray-300 text-base">
                            Você tem{' '}
                            <span className="font-black text-2xl text-cyan-400" style={{ textShadow: '0 0 8px rgba(56, 189, 248, 0.5)' }}>
                                {downloadsLeft}
                            </span>
                            {' '} de {' '}
                            <span className="font-bold text-xl text-gray-400">
                                {dailyLimit}
                            </span>
                            {' '} downloads diários.
                        </p>
                    </div>
                </div>
            )}

            {/* ATUALIZADO: Adicionada a classe custom-scrollbar */}
            <div className="overflow-auto custom-scrollbar" style={{ maxHeight: '70vh' }}>
                <table className="hidden md:table min-w-full text-left table-fixed">
                    <thead className="sticky top-0 z-10 bg-[#1A1B1C]/80 backdrop-blur-sm">
                        <tr className="border-b border-zinc-800">
                            <th className="px-4 py-3 font-bold text-gray-400 tracking-wider w-[35%]">
                                <div className="flex items-center gap-2">
                                    <Music2 className="h-5 w-5 text-purple-400" />
                                    MÚSICA
                                </div>
                            </th>
                            <th className="px-4 py-3 font-bold text-gray-400 tracking-wider w-[15%]">
                                <div className="flex items-center gap-2">
                                    <Sparkles className="h-5 w-5 text-blue-400" />
                                    GÊNERO
                                </div>
                            </th>
                            <th className="px-4 py-3 font-bold text-gray-400 tracking-wider w-[15%]">
                                <div className="flex items-center gap-2">
                                    <Star className="h-5 w-5 text-yellow-400" />
                                    POOL
                                </div>
                            </th>
                            <th className="px-4 py-3 font-bold text-gray-400 tracking-wider w-[35%] text-right">
                                <div className="flex items-center justify-end gap-2">
                                    <Zap className="h-5 w-5 text-green-400" />
                                    AÇÕES
                                </div>
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800/70">
                        {tracks.length > 0 ? (
                            tracks.map(track => <TrackRow key={`desktop-${track.id}`} {...{ track, isCurrent: currentTrack?.id === track.id, isPlaying: isPlaying && currentTrack?.id === track.id, isLiked: userData?.likedTrackIds?.includes(track.id) ?? false, isLiking: liking === track.id, isDeleting: deleting === track.id, isAdmin, canDownloadResult: canDownload(track.id), onPlayPause: handlePlayPauseClick, onDownload: handleDownloadClick, onLike: handleLikeClick, onReport: handleReportClick, onCopyright: handleCopyrightClick, onDelete: handleDeleteClick }} />)
                        ) : (
                            <tr><td colSpan={5} className="text-center py-16 text-gray-500">Nenhuma música encontrada.</td></tr>
                        )}
                    </tbody>
                </table>

                <div className="md:hidden flex flex-col gap-4 px-2">
                    {tracks.length > 0 ? (
                        tracks.map(track => <TrackCard key={`mobile-${track.id}`} {...{ track, isCurrent: currentTrack?.id === track.id, isPlaying: isPlaying && currentTrack?.id === track.id, isLiked: userData?.likedTrackIds?.includes(track.id) ?? false, isLiking: liking === track.id, isDeleting: deleting === track.id, isAdmin, canDownloadResult: canDownload(track.id), onPlayPause: handlePlayPauseClick, onDownload: handleDownloadClick, onLike: handleLikeClick, onReport: handleReportClick, onCopyright: handleCopyrightClick, onDelete: handleDeleteClick }} />)
                    ) : (
                        <div className="text-center py-16 text-gray-500">Nenhuma música encontrada.</div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default MusicTable;