"use client";
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import { Play, Pause, Download, Heart, AlertTriangle, Copyright, Music, Trash2, Loader2, DownloadCloud, Sparkles, Zap, Star, Shield, Eye, Clock, TrendingUp, Volume2, FileAudio, Headphones, Mic, Disc3, Radio, Music2, Music3, Music4, Plus, Minus, ShoppingCart, Package } from 'lucide-react';
import Link from 'next/link';
import { Track } from '@/types/track';
import { useGlobalPlayer } from '@/context/GlobalPlayerContext';
import { useToastContext } from '@/context/ToastContext';
import { useUserData } from '@/hooks/useUserData';
import clsx from 'clsx';

// Componente de Loading estilo Facebook
const FacebookSkeleton = () => (
    <div className="animate-pulse">
        <div className="flex items-center gap-4 p-4">
            <div className="w-12 h-12 bg-gray-700 rounded-lg"></div>
            <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-700 rounded w-3/4"></div>
                <div className="h-3 bg-gray-700 rounded w-1/2"></div>
            </div>
            <div className="flex gap-2">
                <div className="w-8 h-8 bg-gray-700 rounded"></div>
                <div className="w-8 h-8 bg-gray-700 rounded"></div>
                <div className="w-8 h-8 bg-gray-700 rounded"></div>
            </div>
        </div>
    </div>
);

// Componente de Loading para a tabela
const TableSkeleton = () => (
    <div className="animate-pulse">
        <div className="hidden md:table min-w-full">
            <thead className="sticky top-0 z-10 bg-[#1A1B1C]/80 backdrop-blur-sm">
                <tr className="border-b border-zinc-800">
                    <th className="px-4 py-3 w-[35%]">
                        <div className="h-4 bg-gray-700 rounded w-24"></div>
                    </th>
                    <th className="px-4 py-3 w-[15%]">
                        <div className="h-4 bg-gray-700 rounded w-16"></div>
                    </th>
                    <th className="px-4 py-3 w-[15%]">
                        <div className="h-4 bg-gray-700 rounded w-12"></div>
                    </th>
                    <th className="px-4 py-3 w-[35%] text-right">
                        <div className="h-4 bg-gray-700 rounded w-20 ml-auto"></div>
                    </th>
                </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/70">
                {Array.from({ length: 10 }).map((_, index) => (
                    <tr key={index} className="animate-pulse">
                        <td className="px-4 py-3">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-gray-700 rounded-lg"></div>
                                <div className="flex-1 space-y-2">
                                    <div className="h-4 bg-gray-700 rounded w-3/4"></div>
                                    <div className="h-3 bg-gray-700 rounded w-1/2"></div>
                                </div>
                            </div>
                        </td>
                        <td className="px-4 py-3">
                            <div className="h-6 bg-gray-700 rounded w-20"></div>
                        </td>
                        <td className="px-4 py-3">
                            <div className="h-6 bg-gray-700 rounded w-16"></div>
                        </td>
                        <td className="px-4 py-3">
                            <div className="flex items-center justify-end gap-2">
                                <div className="w-8 h-8 bg-gray-700 rounded"></div>
                                <div className="w-8 h-8 bg-gray-700 rounded"></div>
                                <div className="w-8 h-8 bg-gray-700 rounded"></div>
                                <div className="w-8 h-8 bg-gray-700 rounded"></div>
                            </div>
                        </td>
                    </tr>
                ))}
            </tbody>
        </div>

        <div className="md:hidden space-y-4">
            {Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="animate-pulse p-4 bg-zinc-800/50 rounded-xl">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-gray-700 rounded-xl"></div>
                        <div className="flex-1 space-y-2">
                            <div className="h-4 bg-gray-700 rounded w-3/4"></div>
                            <div className="h-3 bg-gray-700 rounded w-1/2"></div>
                            <div className="flex gap-2">
                                <div className="h-6 bg-gray-700 rounded w-16"></div>
                                <div className="h-6 bg-gray-700 rounded w-12"></div>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center justify-between gap-2 mt-3">
                        <div className="w-8 h-8 bg-gray-700 rounded"></div>
                        <div className="w-8 h-8 bg-gray-700 rounded"></div>
                        <div className="w-8 h-8 bg-gray-700 rounded"></div>
                        <div className="w-8 h-8 bg-gray-700 rounded"></div>
                    </div>
                </div>
            ))}
        </div>
    </div>
);

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
    isInQueue: boolean;
    onPlayPause: (track: Track) => void;
    onDownload: (track: Track) => void;
    onLike: (trackId: number) => void;
    onReport: (track: Track) => void;
    onCopyright: (track: Track) => void;
    onDelete: (track: Track) => void;
    onAddToQueue: (track: Track) => void;
    onRemoveFromQueue: (track: Track) => void;
}

const TrackRow = React.memo(({
    track, isCurrent, isPlaying, isLiked, isLiking, isDeleting, isAdmin, canDownloadResult, isInQueue,
    onPlayPause, onDownload, onLike, onReport, onCopyright, onDelete, onAddToQueue, onRemoveFromQueue
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
                    {/* Botão Adicionar à Fila */}
                    <button
                        onClick={() => isInQueue ? onRemoveFromQueue(track) : onAddToQueue(track)}
                        title={isInQueue ? "Remover da fila" : "Adicionar à fila"}
                        className={clsx("flex items-center gap-2 p-2 rounded-lg font-bold transition-all duration-200 shadow-md hover:shadow-lg", {
                            "bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-700 hover:to-orange-600 text-white": isInQueue,
                            "bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white": !isInQueue
                        })}
                    >
                        {isInQueue ? <Minus size={16} /> : <Plus size={16} />}
                        <span className='text-xs'>
                            {isInQueue ? 'REMOVER' : 'ADICIONAR'}
                        </span>
                    </button>

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
    track, isCurrent, isPlaying, isLiked, isLiking, isDeleting, isAdmin, canDownloadResult, isInQueue,
    onPlayPause, onDownload, onLike, onReport, onCopyright, onDelete, onAddToQueue, onRemoveFromQueue
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
                <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-100 truncate" title={track.songName}>{track.songName}</h3>
                    <p className="text-sm text-gray-400 truncate" title={track.artist}>{track.artist}</p>
                    <div className="flex items-center gap-2 mt-2">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-purple-600 to-blue-600 text-white">{track.style}</span>
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-emerald-600 to-green-600 text-white">{track.pool || 'Nexor Records'}</span>
                    </div>
                </div>
            </div>
            <div className="p-4">
                <div className="flex items-center justify-between gap-2">
                    {/* Botão Adicionar à Fila */}
                    <button
                        onClick={() => isInQueue ? onRemoveFromQueue(track) : onAddToQueue(track)}
                        title={isInQueue ? "Remover da fila" : "Adicionar à fila"}
                        className={clsx("flex items-center gap-2 px-3 py-2 rounded-lg font-bold transition-all duration-200 shadow-md hover:shadow-lg", {
                            "bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-700 hover:to-orange-600 text-white": isInQueue,
                            "bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white": !isInQueue
                        })}
                    >
                        {isInQueue ? <Minus size={16} /> : <Plus size={16} />}
                        <span className='text-xs'>
                            {isInQueue ? 'REMOVER' : 'ADICIONAR'}
                        </span>
                    </button>

                    <button
                        onClick={() => onDownload(track)}
                        disabled={!canDownloadResult.can}
                        title={hasDownloaded ? "Você já baixou esta música" : canDownloadResult.reason}
                        className={clsx("flex items-center gap-2 px-3 py-2 rounded-lg font-bold transition-all duration-200 shadow-md hover:shadow-lg", {
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
                </div>
                <div className="flex items-center justify-between gap-2 mt-3">
                    <button onClick={() => onLike(track.id)} disabled={isLiking} title={isLiked ? "Descurtir" : "Curtir"} className={clsx("p-2 rounded-lg transition-all duration-200 hover:shadow-lg", { 'text-pink-500 fill-pink-500 bg-pink-500/10 hover:bg-pink-500/20': isLiked, 'text-gray-400 hover:text-pink-400 hover:bg-pink-500/10': !isLiked })}>
                        {isLiking ? <Loader2 size={16} className="animate-spin" /> : <Heart size={16} />}
                    </button>
                    <button onClick={() => onReport(track)} title="Reportar Problema" className="p-2 text-gray-400 hover:text-yellow-400 hover:bg-yellow-500/10 transition-all duration-200 rounded-lg"><AlertTriangle size={16} /></button>
                    <button onClick={() => onCopyright(track)} title="Reportar Copyright" className="p-2 text-gray-400 hover:text-purple-400 hover:bg-purple-500/10 transition-all duration-200 rounded-lg"><Shield size={16} /></button>
                    {isAdmin && <button onClick={() => onDelete(track)} disabled={isDeleting} title="Excluir Música" className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-500/10 transition-all duration-200 rounded-lg">{isDeleting ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}</button>}
                </div>
            </div>
        </div>
    );
});
TrackCard.displayName = 'TrackCard';


// --- COMPONENTE PRINCIPAL ---
const MusicTable = ({ tracks, onDownload: onTracksUpdate, isDownloading }: { tracks: Track[], onDownload?: (tracks: Track[]) => void, isDownloading?: boolean }) => {
    const { data: session } = useSession();
    const { showToast } = useToastContext();
    const { userData } = useUserData();
    const { currentTrack, isPlaying, playTrack, pauseTrack } = useGlobalPlayer();

    // Estados para likes e downloads
    const [liking, setLiking] = useState<number | null>(null);
    const [deleting, setDeleting] = useState<number | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Estado da fila de downloads
    const [downloadQueue, setDownloadQueue] = useState<Track[]>([]);
    const [isDownloadingQueue, setIsDownloadingQueue] = useState(false);

    // Estados de UI
    const [downloadCooldowns, setDownloadCooldowns] = useState<{ [key: number]: number }>({});

    // Constantes e Helpers
    const isAdmin = useMemo(() => session?.user?.email === 'edersonleonardo@nexorrecords.com.br', [session?.user?.email]);
    const isVip = useMemo(() => !!userData?.isVip || isAdmin, [userData?.isVip, isAdmin]);

    const downloadsToday = useMemo(() => userData?.dailyDownloadCount || 0, [userData?.dailyDownloadCount]);
    const dailyLimit = useMemo(() => userData?.dailyDownloadLimit || 50, [userData?.dailyDownloadLimit]);
    const downloadsLeft = useMemo(() => {
        if (typeof dailyLimit === 'string' && dailyLimit === 'Ilimitado') {
            return 'Ilimitado';
        }
        return Math.max((dailyLimit as number) - downloadsToday, 0);
    }, [dailyLimit, downloadsToday]);

    // Efeito para simular loading inicial
    useEffect(() => {
        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 800); // Simula tempo de carregamento

        return () => clearTimeout(timer);
    }, []);

    // Efeito para mostrar loading quando tracks mudam
    useEffect(() => {
        if (tracks.length > 0) {
            setIsLoading(false);
        }
    }, [tracks]);

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

    // Funções de gerenciamento da fila
    const handleAddToQueue = useCallback((track: Track) => {
        if (downloadQueue.length >= 20) {
            showToast('❌ Limite máximo de 20 músicas na fila atingido!', 'error');
            return;
        }

        if (downloadQueue.some(t => t.id === track.id)) {
            showToast('⚠️ Esta música já está na fila!', 'warning');
            return;
        }

        setDownloadQueue(prev => [...prev, track]);
        showToast(`✅ "${track.songName}" adicionada à fila!`, 'success');
    }, [downloadQueue, showToast]);

    const handleRemoveFromQueue = useCallback((track: Track) => {
        setDownloadQueue(prev => prev.filter(t => t.id !== track.id));
        showToast(`🗑️ "${track.songName}" removida da fila!`, 'info');
    }, [showToast]);

    const handleDownloadQueue = useCallback(async () => {
        if (downloadQueue.length === 0) {
            showToast('❌ Nenhuma música na fila para baixar!', 'error');
            return;
        }

        if (!session?.user) {
            showToast('👤 Faça login para fazer downloads', 'warning');
            return;
        }

        setIsDownloadingQueue(true);

        try {
            // Verificar se pode baixar (lógica de VIP e limites)
            if (!isVip) {
                const totalDownloads = downloadsToday + downloadQueue.length;
                if (totalDownloads > dailyLimit) {
                    showToast(`❌ Você só pode baixar ${dailyLimit - downloadsToday} músicas hoje!`, 'error');
                    return;
                }
            }

            // Fazer download de cada música da fila
            for (const track of downloadQueue) {
                try {
                    const response = await fetch('/api/download', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ trackId: track.id })
                    });

                    if (!response.ok) {
                        console.error(`Erro ao baixar ${track.songName}`);
                    }
                } catch (error) {
                    console.error(`Erro ao baixar ${track.songName}:`, error);
                }
            }

            // Baixar ZIP com todas as músicas
            const response = await fetch('/api/downloads/zip', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    trackIds: downloadQueue.map(t => t.id),
                    filename: `nexor-records-${new Date().toISOString().split('T')[0]}.zip`
                })
            });

            if (response.ok) {
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `nexor-records-${new Date().toISOString().split('T')[0]}.zip`;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);

                showToast(`✅ ${downloadQueue.length} músicas baixadas com sucesso!`, 'success');
                setDownloadQueue([]); // Limpar fila
            } else {
                showToast('❌ Erro ao baixar arquivo ZIP!', 'error');
            }
        } catch (error) {
            console.error('Erro ao baixar fila:', error);
            showToast('❌ Erro ao baixar músicas da fila!', 'error');
        } finally {
            setIsDownloadingQueue(false);
        }
    }, [downloadQueue, session?.user, isVip, downloadsToday, dailyLimit, showToast]);

    // Verificar se é VIP
    useEffect(() => {
        if (userData) {
            // setIsVip(userData.isVip || false); // This line was removed as per the new_code
        }
    }, [userData]);

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
            // Para usuários VIP, sempre permitir download (apenas verificar cooldown)
            if (isVip) {
                const cooldown = downloadCooldowns[trackId];
                if (cooldown > 0) {
                    const timeLeftFormatted = formatTimeLeft(cooldown);
                    return { can: false, reason: `Aguarde ${timeLeftFormatted} para baixar novamente.`, timeLeft: timeLeftFormatted };
                }
                return { can: true, reason: 'Clique para baixar a música.', timeLeft: '' };
            }

            // Para usuários não-VIP
            if (typeof downloadsLeft === 'number' && downloadsLeft <= 0) return { can: false, reason: 'Limite diário de downloads atingido.', timeLeft: '' };
            const cooldown = downloadCooldowns[trackId];
            if (cooldown > 0) {
                const timeLeftFormatted = formatTimeLeft(cooldown);
                return { can: false, reason: `Aguarde ${timeLeftFormatted} para baixar novamente.`, timeLeft: timeLeftFormatted };
            }
            return { can: true, reason: 'Clique para baixar a música.', timeLeft: '' };
        };
    }, [isVip, downloadsLeft, downloadCooldowns]);

    // Handlers de Ações
    const handlePlayPauseClick = async (track: Track) => {
        if (!session?.user) { showToast('👤 Faça login para ouvir as músicas', 'warning'); return; }
        if (currentTrack?.id === track.id) { pauseTrack(); }
        else {
            try { await playTrack(track, tracks); showToast(`🎵 Tocando "${track.songName}"`, 'info'); }
            catch (error) { showToast('❌ Erro ao reproduzir música', 'error'); }
        }
    };

    const handleDownloadClick = async (track: Track) => {
        if (!session?.user) {
            showToast('👤 Faça login para fazer downloads', 'warning');
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
                body: JSON.stringify({ trackId: track.id })
            });

            if (response.ok) {
                const data = await response.json();

                // Forçar download do arquivo
                const audioResponse = await fetch(data.downloadUrl);
                const blob = await audioResponse.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `${track.artist} - ${track.songName}.mp3`;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);

                // Definir cooldown de 5 minutos
                setDownloadCooldowns(prev => ({ ...prev, [track.id]: 300 }));

                showToast(`✅ "${track.songName}" baixada com sucesso!`, 'success');
            } else {
                const errorData = await response.json();
                showToast(errorData.error || '❌ Erro ao baixar música', 'error');
            }
        } catch (error) {
            console.error('Erro ao baixar música:', error);
            showToast('❌ Erro ao baixar música', 'error');
        }
    };

    const handleLikeClick = async (trackId: number) => {
        if (!session?.user) {
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

                // updateLikedTrack(trackId, !isLiked); // This line was removed as per the new_code
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

            {/* Fila de Downloads */}
            {downloadQueue.length > 0 && (
                <div className="w-full mb-4 p-4 rounded-xl bg-gradient-to-r from-purple-900/50 to-blue-900/50 border border-purple-500/30 shadow-lg">
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                            <ShoppingCart className="text-purple-400" size={24} />
                            <div>
                                <h3 className="text-white font-bold text-lg">Fila de Downloads</h3>
                                <p className="text-gray-300 text-sm">{downloadQueue.length} música{downloadQueue.length !== 1 ? 's' : ''} na fila</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={handleDownloadQueue}
                                disabled={isDownloadingQueue}
                                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white font-bold rounded-lg transition-all duration-200 shadow-lg hover:shadow-green-500/20 disabled:opacity-50"
                            >
                                {isDownloadingQueue ? (
                                    <>
                                        <Loader2 size={16} className="animate-spin" />
                                        Baixando...
                                    </>
                                ) : (
                                    <>
                                        <Package size={16} />
                                        Baixar ZIP ({downloadQueue.length})
                                    </>
                                )}
                            </button>
                            <button
                                onClick={() => setDownloadQueue([])}
                                className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition-all duration-200"
                            >
                                Limpar
                            </button>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                        {downloadQueue.map((track, index) => (
                            <div key={track.id} className="flex items-center justify-between p-2 bg-black/20 rounded-lg">
                                <div className="flex items-center gap-2 flex-1 min-w-0">
                                    <span className="text-purple-400 font-bold text-sm">{index + 1}</span>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-white text-sm truncate">{track.songName}</p>
                                        <p className="text-gray-400 text-xs truncate">{track.artist}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleRemoveFromQueue(track)}
                                    className="p-1 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded transition-colors"
                                >
                                    <Minus size={14} />
                                </button>
                            </div>
                        ))}
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
                        {isLoading ? (
                            <TableSkeleton />
                        ) : tracks.length > 0 ? (
                            tracks.map(track => <TrackRow key={`desktop-${track.id}`} {...{ track, isCurrent: currentTrack?.id === track.id, isPlaying: isPlaying && currentTrack?.id === track.id, isLiked: userData?.likedTrackIds?.includes(track.id) ?? false, isLiking: liking === track.id, isDeleting: deleting === track.id, isAdmin, canDownloadResult: canDownload(track.id), isInQueue: downloadQueue.some(t => t.id === track.id), onPlayPause: handlePlayPauseClick, onDownload: handleDownloadClick, onLike: handleLikeClick, onReport: handleReportClick, onCopyright: handleCopyrightClick, onDelete: handleDeleteClick, onAddToQueue: handleAddToQueue, onRemoveFromQueue: handleRemoveFromQueue }} />)
                        ) : (
                            <tr><td colSpan={5} className="text-center py-16 text-gray-500">Nenhuma música encontrada.</td></tr>
                        )}
                    </tbody>
                </table>

                <div className="md:hidden flex flex-col gap-4 px-2">
                    {isLoading ? (
                        <TableSkeleton />
                    ) : tracks.length > 0 ? (
                        tracks.map(track => <TrackCard key={`mobile-${track.id}`} {...{ track, isCurrent: currentTrack?.id === track.id, isPlaying: isPlaying && currentTrack?.id === track.id, isLiked: userData?.likedTrackIds?.includes(track.id) ?? false, isLiking: liking === track.id, isDeleting: deleting === track.id, isAdmin, canDownloadResult: canDownload(track.id), isInQueue: downloadQueue.some(t => t.id === track.id), onPlayPause: handlePlayPauseClick, onDownload: handleDownloadClick, onLike: handleLikeClick, onReport: handleReportClick, onCopyright: handleCopyrightClick, onDelete: handleDeleteClick, onAddToQueue: handleAddToQueue, onRemoveFromQueue: handleRemoveFromQueue }} />)
                    ) : (
                        <div className="text-center py-16 text-gray-500">Nenhuma música encontrada.</div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default MusicTable;