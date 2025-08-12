"use client";
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAppContext } from '@/context/AppContext';
import { useSession } from 'next-auth/react';
import { Play, Pause, Download, Heart, Music, Trash2, Loader2, DownloadCloud, Sparkles, Zap, Star, Crown, X, CheckCircle, Plus, Minus, ShoppingCart, Package, Music2, Users } from 'lucide-react';
import Link from 'next/link';
import { useGlobalPlayer } from '@/context/GlobalPlayerContext';
import { useToastContext } from '@/context/ToastContext';
import { useUserData } from '@/hooks/useUserData';
import { Track } from '@/types/track';
import clsx from 'clsx';

// --- Skeletons de Loading ---
const CardSkeleton = () => (
    <div className="animate-pulse flex flex-col gap-4 rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
        <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-lg bg-zinc-700"></div>
            <div className="flex-1 space-y-2">
                <div className="h-5 rounded bg-zinc-700 w-3/4"></div>
                <div className="h-4 rounded bg-zinc-700 w-1/2"></div>
            </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
            <div className="h-10 rounded-lg bg-zinc-700"></div>
            <div className="h-10 rounded-lg bg-zinc-700"></div>
        </div>
    </div>
);

const TableSkeleton = () => (
    <>
        {Array.from({ length: 8 }).map((_, index) => (
            <tr key={index} className="animate-pulse">
                <td className="px-4 py-3"><div className="flex items-center gap-4"><div className="h-12 w-12 rounded-lg bg-zinc-700"></div><div className="flex-1 space-y-2"><div className="h-4 rounded bg-zinc-700 w-3/4"></div><div className="h-3 rounded bg-zinc-700 w-1/2"></div></div></div></td>
                <td className="px-4 py-3"><div className="h-6 rounded-full bg-zinc-700 w-24"></div></td>
                <td className="px-4 py-3"><div className="h-6 rounded-full bg-zinc-700 w-28"></div></td>
                <td className="px-4 py-3"><div className="flex items-center justify-end gap-2"><div className="h-9 w-24 rounded-lg bg-zinc-700"></div><div className="h-9 w-9 rounded-full bg-zinc-700"></div><div className="h-9 w-9 rounded-full bg-zinc-700"></div></div></td>
            </tr>
        ))}
    </>
);


// --- Componentes de UI ---
interface TrackUIProps {
    track: Track;
    isCurrent: boolean;
    isPlaying: boolean;
    isLiked: boolean;
    isLiking: boolean;
    isDeleting: boolean;
    isAdmin: boolean;
    canDownloadResult: { can: boolean; reason: string; timeLeft: string; showUpgrade?: boolean };
    isInQueue: boolean;
    hasDownloaded: boolean;
    onPlayPause: (track: Track) => void;
    onDownload: (track: Track) => void;
    onLike: (trackId: number) => void;
    onDelete: (track: Track) => void;
    onToggleQueue: (track: Track) => void;
    externalDownloadQueue?: Track[];
}

const TrackRow = React.memo(({
    track, isCurrent, isPlaying, isLiked, isLiking, isDeleting, isAdmin, canDownloadResult, isInQueue, hasDownloaded,
    onPlayPause, onDownload, onLike, onDelete, onToggleQueue, externalDownloadQueue
}: TrackUIProps) => {
    return (
        <tr className={clsx(
            "group transition-all duration-300 ease-in-out border-l-4 hover:shadow-lg",
            isCurrent ? 'bg-zinc-900/50 border-blue-500 shadow-blue-500/20' : 'border-transparent hover:bg-zinc-800/60 hover:shadow-zinc-800/20'
        )}>
            <td className="px-2 sm:px-4 py-2 sm:py-3 align-middle w-[60%] sm:w-[40%]">
                <div className="flex items-center gap-2 sm:gap-4 min-w-0">
                    <div className="relative flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12">
                        <img src={track.imageUrl || "/images/default-track.jpg"} alt={`Capa de ${track.songName}`} className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg object-cover border border-zinc-700/50" />
                        <button onClick={() => onPlayPause(track)} className={clsx("absolute inset-0 flex items-center justify-center rounded-lg transition-all duration-300 backdrop-blur-sm text-white bg-black/60", isCurrent ? 'opacity-100' : 'opacity-0 group-hover:opacity-100')} title={isPlaying ? "Pausar" : "Tocar"}>
                            {isPlaying && isCurrent ? <Pause size={18} strokeWidth={1.75} className="text-blue-400 sm:w-[22px] sm:h-[22px]" /> : <Play size={18} strokeWidth={1.75} className="ml-1 sm:w-[22px] sm:h-[22px]" />}
                        </button>
                    </div>
                    <div className="flex flex-col min-w-0">
                        <div className="flex items-center gap-2">
                            <span className="font-medium text-gray-100 text-truncate text-[11px] sm:text-[12px]">{track.songName}</span>
                        </div>
                        <span className="text-[10px] sm:text-[11px] text-gray-400 text-truncate">{track.artist}</span>
                    </div>
                </div>
            </td>
            <td className="hidden sm:table-cell px-2 sm:px-4 py-2 sm:py-3 align-middle w-[20%] text-center">
                <span className="inline-flex items-center px-1.5 sm:px-2 py-0.5 rounded-full text-[9px] sm:text-[11px] font-bold text-white tracking-wide shadow-sm whitespace-nowrap uppercase" style={{ backgroundColor: '#FF4500' }}>{track.style}</span>
            </td>
            <td className="hidden sm:table-cell px-2 sm:px-4 py-2 sm:py-3 align-middle w-[25%] text-center">
                <span className="inline-flex items-center px-1.5 sm:px-2 py-0.5 rounded-full text-[9px] sm:text-[11px] font-bold bg-green-600 text-white tracking-wide shadow-sm whitespace-nowrap uppercase">{track.pool || 'Nexor Records'}</span>
            </td>
            <td className="px-2 sm:px-4 py-2 sm:py-3 align-middle w-[40%] sm:w-[30%]">
                <div className="flex items-center justify-end gap-1 action-buttons min-w-[140px] sm:min-w-[160px]">
                    <button onClick={() => onDownload(track)} disabled={!canDownloadResult.can} title={canDownloadResult.reason} className={clsx("flex items-center justify-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg font-bold transition-all duration-300 shadow-lg text-[10px] sm:text-xs min-w-[40px] sm:min-w-[100px] justify-center", hasDownloaded ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-green-500/25 cursor-default" : canDownloadResult.can ? "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-blue-500/25" : "bg-gradient-to-r from-zinc-700 to-zinc-600 text-gray-400 cursor-not-allowed shadow-zinc-500/25 opacity-60")}>
                        {hasDownloaded ? <CheckCircle size={14} strokeWidth={2} className="sm:w-[14px] sm:h-[14px]" /> : <Download size={14} strokeWidth={2} className="sm:w-[14px] sm:h-[14px]" />}
                        <span className="whitespace-nowrap hidden sm:inline">{hasDownloaded ? 'BAIXADO' : canDownloadResult.timeLeft || 'DOWNLOAD'}</span>
                    </button>
                    <button
                        onClick={() => onToggleQueue(track)}
                        disabled={!isInQueue && externalDownloadQueue && externalDownloadQueue.length >= 20}
                        title={isInQueue ? "Remover da Fila" : externalDownloadQueue && externalDownloadQueue.length >= 20 ? "Limite de 20 músicas atingido" : "Adicionar à Fila"}
                        className={clsx("h-7 w-7 sm:h-8 sm:w-8 flex items-center justify-center rounded-lg transition-all duration-300 active:scale-95 shadow-lg",
                            isInQueue ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-blue-500/25' :
                                externalDownloadQueue && externalDownloadQueue.length >= 20 ? 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-red-500/25 cursor-not-allowed' :
                                    'bg-gradient-to-r from-zinc-700 to-zinc-600 text-gray-300 hover:from-zinc-600 hover:to-zinc-500 hover:text-white shadow-zinc-500/25'
                        )}
                    >
                        {isInQueue ? <Minus size={14} strokeWidth={2.5} className="sm:w-[16px] sm:h-[16px]" /> : <Plus size={14} strokeWidth={2.5} className="sm:w-[16px] sm:h-[16px]" />}
                    </button>
                    <button onClick={() => onLike(track.id)} disabled={isLiking} title={isLiked ? "Descurtir" : "Curtir"} className={clsx("h-7 w-7 sm:h-8 sm:w-8 flex items-center justify-center rounded-lg transition-all duration-300 active:scale-95 shadow-lg", isLiked ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-pink-500/25 fill-white' : 'bg-gradient-to-r from-zinc-700 to-zinc-600 text-gray-300 hover:from-zinc-600 hover:to-zinc-500 hover:text-white shadow-zinc-500/25')}>
                        {isLiking ? <Loader2 size={14} strokeWidth={2} className="animate-spin sm:w-[16px] sm:h-[16px]" /> : <Heart size={14} strokeWidth={2} className="sm:w-[16px] sm:h-[16px]" />}
                    </button>
                    {isAdmin && <button onClick={() => onDelete(track)} disabled={isDeleting} title="Excluir Música" className="h-7 w-7 sm:h-8 sm:w-8 flex items-center justify-center rounded-lg bg-gradient-to-r from-red-600 to-red-700 text-white transition-all duration-300 hover:from-red-700 hover:to-red-800 active:scale-95 shadow-lg shadow-red-500/25">{isDeleting ? <Loader2 size={14} strokeWidth={2} className="animate-spin sm:w-[16px] sm:h-[16px]" /> : <Trash2 size={14} strokeWidth={2} className="sm:w-[16px] sm:h-[16px]" />}</button>}
                </div>
            </td>
        </tr>
    );
});
TrackRow.displayName = 'TrackRow';

const TrackCard = React.memo(({
    track, isCurrent, isPlaying, isLiked, isLiking, isDeleting, isAdmin, canDownloadResult, isInQueue, hasDownloaded,
    onPlayPause, onDownload, onLike, onDelete, onToggleQueue, externalDownloadQueue
}: TrackUIProps) => {
    return (
        <div className={clsx("rounded-xl border shadow-lg backdrop-blur-md transition-all", isCurrent ? 'ring-2 ring-blue-500 bg-zinc-900 border-zinc-700' : 'bg-zinc-900/70 border-zinc-800')}>
            <div className="p-4 flex items-center gap-4">
                <div className="relative flex-shrink-0 w-14 h-14">
                    <img src={track.imageUrl || "/images/default-track.jpg"} alt={track.songName} className="w-14 h-14 rounded-lg object-cover border border-zinc-700" />
                    <button onClick={() => onPlayPause(track)} className="absolute inset-0 flex items-center justify-center rounded-lg bg-black/50" title={isPlaying && isCurrent ? "Pausar" : "Tocar"}>
                        {isPlaying && isCurrent ? <Pause size={26} strokeWidth={1.75} className="text-blue-400" /> : <Play size={26} strokeWidth={1.75} className="ml-1 text-white" />}
                    </button>
                </div>
                <div className="flex flex-col min-w-0">
                    <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-base truncate">{track.songName}</span>
                    </div>
                    <span className="text-sm text-gray-400 truncate">{track.artist}</span>
                    <div className="flex items-center gap-2 mt-2">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-sm font-semibold bg-gradient-to-r from-purple-600 to-blue-600 text-white">{track.style}</span>
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-sm font-semibold bg-gradient-to-r from-emerald-600 to-green-600 text-white">{track.pool || 'NR'}</span>
                    </div>
                </div>
            </div>
            <div className="p-3 grid grid-cols-2 gap-2">
                <button onClick={() => onDownload(track)} disabled={!canDownloadResult.can} title={canDownloadResult.reason} className={clsx("flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all text-xs active:scale-95 shadow-lg min-w-[100px]", hasDownloaded ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-green-500/25 cursor-default" : canDownloadResult.can ? "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-blue-500/25" : "bg-gradient-to-r from-zinc-700 to-zinc-600 text-gray-400 cursor-not-allowed shadow-zinc-500/25")}>
                    {hasDownloaded ? <CheckCircle size={18} strokeWidth={2} /> : <Download size={18} strokeWidth={2} />}
                    <span className="whitespace-nowrap">{hasDownloaded ? 'BAIXADO' : canDownloadResult.timeLeft || 'DOWNLOAD'}</span>
                </button>
                <button onClick={() => onLike(track.id)} disabled={isLiking} title={isLiked ? "Descurtir" : "Curtir"} className={clsx("flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all text-xs active:scale-95 shadow-lg", isLiked ? "bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-pink-500/25" : "bg-gradient-to-r from-zinc-700 to-zinc-600 hover:from-zinc-600 hover:to-zinc-500 text-white shadow-zinc-500/25")}>
                    {isLiking ? <Loader2 size={18} strokeWidth={2} className="animate-spin" /> : <Heart size={18} strokeWidth={2} className={clsx({ "fill-current": isLiked })} />}
                    {isLiked ? 'CURTIDO' : 'CURTIR'}
                </button>
                <button
                    onClick={() => onToggleQueue(track)}
                    disabled={!isInQueue && externalDownloadQueue && externalDownloadQueue.length >= 20}
                    title={isInQueue ? "Remover da Fila" : externalDownloadQueue && externalDownloadQueue.length >= 20 ? "Limite de 20 músicas atingido" : "Adicionar à Fila"}
                    className={clsx("col-span-2 flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all text-xs active:scale-95 shadow-lg",
                        isInQueue ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-blue-500/25" :
                            externalDownloadQueue && externalDownloadQueue.length >= 20 ? "bg-gradient-to-r from-red-500 to-red-600 text-white shadow-red-500/25 cursor-not-allowed" :
                                "bg-gradient-to-r from-zinc-700 to-zinc-600 hover:from-zinc-600 hover:to-zinc-500 text-white shadow-zinc-500/25"
                    )}
                >
                    {isInQueue ? <><Minus size={18} strokeWidth={2.5} /> NA FILA</> : <><Plus size={18} strokeWidth={2.5} /> ADD À FILA</>}
                </button>

                {isAdmin && <button onClick={() => onDelete(track)} disabled={isDeleting} title="Excluir Música" className="col-span-2 flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-semibold text-xs active:scale-95 shadow-lg shadow-red-500/25">{isDeleting ? <Loader2 size={18} strokeWidth={2} className="animate-spin" /> : <Trash2 size={18} strokeWidth={2} />} {isDeleting ? 'Excluindo...' : 'Excluir'}</button>}
            </div>
        </div>
    );
});
TrackCard.displayName = 'TrackCard';


// --- COMPONENTE PRINCIPAL ---
const MusicTable = ({ tracks, onDownload: onTracksUpdate, isDownloading: isDownloadingProp, onToggleQueue: externalOnToggleQueue, externalDownloadQueue }: { tracks: Track[] | null, onDownload?: (tracks: Track[]) => void, isDownloading?: boolean, onToggleQueue?: (track: Track) => void, externalDownloadQueue?: Track[] }) => {
    // Hooks e Estados
    const { data: session } = useSession();
    const { bulkCancel, setBulkCancel } = useAppContext();
    const { showToast } = useToastContext();
    const { userData, updateLikedTrack, updateDownloadedTrack } = useUserData();
    const { currentTrack, isPlaying, playTrack, togglePlayPause } = useGlobalPlayer();
    const [liking, setLiking] = useState<number | null>(null);
    const [deleting, setDeleting] = useState<number | null>(null);
    const [downloadQueue, setDownloadQueue] = useState<Track[]>([]);
    const [isDownloadingQueue, setIsDownloadingQueue] = useState(false);
    const [downloadCooldowns, setDownloadCooldowns] = useState<{ [key: number]: number }>({});
    const [zipProgress, setZipProgress] = useState<{
        isActive: boolean;
        progress: number;
        current: number;
        total: number;
        trackName: string;
        elapsedTime: number;
        remainingTime: number;
        isGenerating: boolean;
        currentChunk?: number;
        totalChunks?: number;
    }>({
        isActive: false,
        progress: 0,
        current: 0,
        total: 0,
        trackName: '',
        elapsedTime: 0,
        remainingTime: 0,
        isGenerating: false,
        currentChunk: 0,
        totalChunks: 0
    });

    // Persistência da fila
    useEffect(() => {
        try { const savedQueue = localStorage.getItem('downloadQueue'); if (savedQueue) setDownloadQueue(JSON.parse(savedQueue)); }
        catch (e) { console.error(e); localStorage.removeItem('downloadQueue'); }
    }, []);
    useEffect(() => { localStorage.setItem('downloadQueue', JSON.stringify(downloadQueue)); }, [downloadQueue]);

    // Memos para performance
    const isAdmin = session?.user?.email === 'edersonleonardo@nexorrecords.com.br';
    const isVip = !!userData?.isVip || isAdmin;
    const downloadsToday = userData?.dailyDownloadCount || 0;
    const dailyLimit = userData?.dailyDownloadLimit || 50;
    const downloadsLeft = (typeof dailyLimit === 'string' && dailyLimit === 'Ilimitado') ? 'Ilimitado' : Math.max(Number(dailyLimit) - downloadsToday, 0);
    const hasDownloadedTrack = useCallback((trackId: number) => userData?.downloadedTrackIds?.includes(trackId) || false, [userData?.downloadedTrackIds]);

    // Cooldown Timer
    useEffect(() => {
        const interval = setInterval(() => setDownloadCooldowns(prev => {
            const newCooldowns = { ...prev };
            let changed = false;
            Object.keys(newCooldowns).forEach(trackId => {
                const id = Number(trackId);
                if (newCooldowns[id] <= 1) delete newCooldowns[id];
                else newCooldowns[id] -= 1;
                changed = true;
            });
            return changed ? newCooldowns : prev;
        }), 1000);
        return () => clearInterval(interval);
    }, []);

    // Monitorar cancelamento global
    useEffect(() => {
        if (bulkCancel) {
            // Cancelar download em lote
            (window as any).__zipCancel = true;
            setZipProgress(prev => ({ ...prev, isActive: false, isGenerating: false }));
            setIsDownloadingQueue(false);
            setBulkCancel(false); // Resetar o flag
        }
    }, [bulkCancel, setBulkCancel]);

    // Lógica para `canDownload`
    const canDownload = useCallback((trackId: number) => {
        if (isVip) {
            // Lógica VIP
            return { can: true, reason: 'Clique para baixar.', timeLeft: '' };
        }
        // Lógica não-VIP
        if (typeof downloadsLeft === 'number' && downloadsLeft <= 0) return { can: false, reason: 'Limite diário atingido.', showUpgrade: true, timeLeft: '' };
        return { can: true, reason: `Downloads restantes: ${downloadsLeft}`, timeLeft: '' };
    }, [isVip, downloadsLeft, downloadCooldowns]);


    // Handlers (abreviados para manter o foco na UI)
    const handlePlayPauseClick = (track: Track) => {
        if (!session?.user) {
            showToast('Faça login para reproduzir músicas', 'warning');
            return;
        }
        if (currentTrack?.id === track.id) togglePlayPause();
        else playTrack(track, tracks || []);
    };
    const handleDownloadClick = async (track: Track) => {
        if (!session?.user?.email) {
            showToast('Faça login para fazer downloads', 'warning');
            return;
        }

        const canDownloadResult = canDownload(track.id);
        if (!canDownloadResult.can) {
            showToast(canDownloadResult.reason, 'warning');
            return;
        }

        try {
            // Primeiro, registrar o download no banco
            const downloadResponse = await fetch('/api/tracks/download', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    trackId: track.id.toString()
                }),
            });

            if (!downloadResponse.ok) {
                const data = await downloadResponse.json();
                showToast(data.error || 'Erro ao registrar download', 'error');
                return;
            }

            // Atualizar estado local imediatamente após registro bem-sucedido
            updateDownloadedTrack(track.id);

            // Se o registro foi bem-sucedido, baixar o arquivo
            if (track.downloadUrl) {

                let downloadUrl = track.downloadUrl;

                // Se a URL já for completa (começa com http), usar diretamente
                if (track.downloadUrl.startsWith('http')) {
                    downloadUrl = track.downloadUrl;
                } else {
                    // Se for apenas a chave, obter URL segura
                    const audioUrlResponse = await fetch(`/api/audio-url?key=${encodeURIComponent(track.downloadUrl)}`);

                    if (!audioUrlResponse.ok) {
                        showToast('❌ Erro ao obter URL do arquivo', 'error');
                        return;
                    }

                    const { url } = await audioUrlResponse.json();
                    downloadUrl = url;
                }

                // Baixar arquivo usando blob para forçar download
                try {
                    const response = await fetch(downloadUrl);
                    if (!response.ok) {
                        throw new Error('Erro ao baixar arquivo');
                    }

                    const blob = await response.blob();
                    const url = window.URL.createObjectURL(blob);

                    const link = document.createElement('a');
                    link.href = url;
                    link.download = `${track.songName} - ${track.artist}.mp3`;
                    link.style.display = 'none';
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);

                    // Limpar URL do blob
                    window.URL.revokeObjectURL(url);
                } catch (error) {
                    console.error('Erro ao baixar arquivo:', error);
                    showToast('❌ Erro ao baixar arquivo', 'error');
                    return;
                }
            } else {
                showToast('❌ URL do arquivo não disponível', 'error');
            }
        } catch (error) {
            console.error('Erro ao fazer download:', error);
            showToast('❌ Erro ao fazer download', 'error');
        }
    };
    const handleLikeClick = async (trackId: number) => {
        if (!session?.user) {
            showToast('👤 Faça login para curtir músicas', 'warning');
            return;
        }

        try {
            setLiking(trackId);

            // Verificar se já curtiu
            const isCurrentlyLiked = userData?.likedTrackIds?.includes(trackId) || false;
            const action = isCurrentlyLiked ? 'unlike' : 'like';

            const response = await fetch('/api/tracks/like', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    trackId: trackId,
                    action: action
                })
            });

            if (response.ok) {
                const result = await response.json();

                if (result.success) {
                    // Atualizar estado local
                    updateLikedTrack(trackId, action === 'like');

                    const track = tracks?.find(t => t.id === trackId);
                    const trackName = track?.songName || 'Música';

                    if (action === 'like') {
                        showToast(`❤️ "${trackName}" adicionada aos favoritos!`, 'success');
                    } else {
                        showToast(`💔 "${trackName}" removida dos favoritos`, 'success');
                    }
                } else {
                    showToast('❌ Erro ao processar curtida', 'error');
                }
            } else {
                const errorData = await response.json();
                showToast(`❌ ${errorData.error || 'Erro ao processar curtida'}`, 'error');
            }
        } catch (error) {
            console.error('Erro ao curtir música:', error);
            showToast('❌ Erro ao processar curtida', 'error');
        } finally {
            setLiking(null);
        }
    };
    const handleDeleteClick = (track: Track) => { /* ... sua lógica de delete ... */ };



    const onToggleQueue = (track: Track) => {
        if (externalOnToggleQueue) {
            // Usar função externa se fornecida
            externalOnToggleQueue(track);
        } else {
            // Lógica interna (mantida para compatibilidade)
            const isInQueue = downloadQueue.some(t => t.id === track.id);
            setDownloadQueue(prev => isInQueue ? prev.filter(t => t.id !== track.id) : [...prev, track]);

            if (!isInQueue) {
                showToast(`📦 "${track.songName}" adicionada à fila`, 'success');
            } else {
                showToast(`📦 "${track.songName}" removida da fila`, 'success');
            }
        }
    };

    // Função para verificar se uma música está na fila
    const isTrackInQueue = (trackId: number) => {
        if (externalDownloadQueue) {
            return externalDownloadQueue.some(t => t.id === trackId);
        }
        return downloadQueue.some(t => t.id === trackId);
    };

    // Adicionar todas as músicas da tabela à fila interna
    const addAllToQueue = () => {
        if (!tracks || tracks.length === 0) return;
        setDownloadQueue(prev => {
            const existingIds = new Set(prev.map(t => t.id));
            const toAdd = tracks.filter(t => !existingIds.has(t.id));
            return [...prev, ...toAdd];
        });
    };

    // Função para download em lote (ZIP) com chunks de 50
    const handleDownloadQueue = async () => {
        if (!session?.user) {
            showToast('👤 Faça login para fazer downloads', 'warning');
            return;
        }

        if (downloadQueue.length === 0) {
            showToast('📦 Adicione músicas à fila primeiro', 'warning');
            return;
        }

        // Resetar estado de cancelamento
        (window as any).__zipCancel = false;
        setIsDownloadingQueue(true);
        setZipProgress(prev => ({ ...prev, isActive: true, isGenerating: true, progress: 0, current: 0, total: downloadQueue.length, trackName: '', currentChunk: 0, totalChunks: Math.ceil(downloadQueue.length / 50) }));
        // Função auxiliar para processar um chunk via SSE e baixar um ZIP
        const processChunk = async (chunkTracks: Track[], index: number, totalChunks: number) => {
            setZipProgress(prev => ({ ...prev, currentChunk: index + 1, totalChunks }));
            const filename = `nexor-records-parte-${index + 1}__${new Date().toISOString().split('T')[0]}.zip`;
            // Timeout de 5 minutos por chunk
            const timeout = setTimeout(() => {
                setZipProgress(prev => ({ ...prev, isActive: false, isGenerating: false }));
                setIsDownloadingQueue(false);
                showToast('⏰ Timeout - download em lote demorou muito', 'error');
            }, 5 * 60 * 1000);

            try {
                const controller = new AbortController();
                const response = await fetch('/api/downloads/zip-progress', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ trackIds: chunkTracks.map(t => t.id), filename }),
                    // Notas: Cancelamento global controlado por estado; o fetch abort seria extra
                });
                if (!response.ok) throw new Error('Erro ao iniciar download em lote');

                const reader = response.body?.getReader();
                if (!reader) throw new Error('Erro ao ler resposta do servidor');

                const decoder = new TextDecoder();
                let buffer = '';
                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;
                    const chunk = decoder.decode(value);
                    buffer += chunk;
                    const lines = buffer.split('\n');
                    buffer = lines.pop() || '';
                    for (const line of lines) {
                        if (!line.startsWith('data: ')) continue;
                        try {
                            const jsonData = line.slice(6).trim();
                            if (!jsonData) continue;
                            const data = JSON.parse(jsonData);
                            if (data.type === 'progress') {
                                setZipProgress(prev => ({
                                    ...prev,
                                    progress: data.progress,
                                    current: data.current + index * 50,
                                    total: Math.max(downloadQueue.length, data.total * totalChunks),
                                    trackName: data.trackName,
                                    elapsedTime: data.elapsedTime,
                                    remainingTime: data.remainingTime
                                }));
                            } else if (data.type === 'complete') {
                                if (!data.zipData) throw new Error('Dados do ZIP não recebidos');
                                const zipBuffer = atob(data.zipData);
                                const bytes = new Uint8Array(zipBuffer.length);
                                for (let i = 0; i < zipBuffer.length; i++) bytes[i] = zipBuffer.charCodeAt(i);
                                const blob = new Blob([bytes], { type: 'application/zip' });
                                const url = URL.createObjectURL(blob);
                                const a = document.createElement('a');
                                a.href = url;
                                a.download = filename;
                                document.body.appendChild(a);
                                a.click();
                                URL.revokeObjectURL(url);
                                document.body.removeChild(a);

                                // Marcar como baixadas as músicas deste chunk
                                try {
                                    chunkTracks.forEach(t => updateDownloadedTrack(t.id));
                                } catch { }
                            } else if (data.type === 'error') {
                                throw new Error(data.message || 'Erro ao gerar ZIP');
                            }
                        } catch (e) {
                            if ((e as any)?.name === 'AbortError') { return; }
                            console.error('Erro ao processar dados do ZIP:', e);
                        }
                    }
                }
            } finally {
                clearTimeout(timeout);
            }
        };

        try {
            // Dividir a fila em chunks de 50
            const allTracks = [...downloadQueue];
            const chunks: Track[][] = [];
            for (let i = 0; i < allTracks.length; i += 50) {
                chunks.push(allTracks.slice(i, i + 50));
            }

            for (let i = 0; i < chunks.length; i++) {
                if ((window as any).__zipCancel) break;
                await processChunk(chunks[i], i, chunks.length);
            }

            // Limpar fila e estados
            setDownloadQueue([]);
            setZipProgress(prev => ({ ...prev, isActive: false, isGenerating: false }));
            setIsDownloadingQueue(false);
            showToast('✅ Download(s) em lote concluído(s)!', 'success');
        } catch (error) {
            console.error('Erro no download em lote:', error);
            setZipProgress(prev => ({ ...prev, isActive: false, isGenerating: false }));
            setIsDownloadingQueue(false);
            showToast('❌ Erro ao fazer download em lote', 'error');
        }
    };

    if (!tracks) {
        return (
            <div className="w-full h-full">
                <div className="hidden md:block"><TableSkeleton /></div>
                <div className="md:hidden flex flex-col gap-4 px-2">{Array.from({ length: 5 }).map((_, i) => <CardSkeleton key={i} />)}</div>
            </div>
        );
    }

    return (
        <div className="relative w-full h-full text-sm text-gray-200 font-sans bg-[#1A1B1C]">
            <style jsx global>{`
                .music-table-scrollbar::-webkit-scrollbar { 
                    width: 12px; 
                    height: 12px; 
                }
                .music-table-scrollbar::-webkit-scrollbar-track { 
                    background-color: #1f2937; 
                    border-radius: 8px;
                }
                .music-table-scrollbar::-webkit-scrollbar-thumb { 
                    background: linear-gradient(135deg, #4b5563, #6b7280);
                    border-radius: 8px; 
                    border: 2px solid #1f2937;
                    transition: all 0.3s ease;
                }
                .music-table-scrollbar::-webkit-scrollbar-thumb:hover { 
                    background: linear-gradient(135deg, #6b7280, #9ca3af);
                    transform: scale(1.05);
                }
                .music-table-scrollbar::-webkit-scrollbar-corner {
                    background-color: #1f2937;
                }
                .music-table-scrollbar { 
                    scrollbar-width: thin; 
                    scrollbar-color: #4b5563 #1f2937; 
                }
                
                /* Prevenir scroll da página quando mouse está sobre a tabela */
                .music-table-container {
                    overscroll-behavior: contain;
                }
                
                /* Melhorar a aparência da tabela */
                .music-table {
                    border-collapse: separate;
                    border-spacing: 0;
                    table-layout: fixed;
                    width: 100%;
                    min-width: 0;
                }
                .music-table-container, .music-table-scrollbar, .music-table {
                    overflow-x: visible !important;
                }
                
                .music-table thead th {
                    position: sticky;
                    top: 0;
                    z-index: 20;
                    background: #1A1B1C;
                    backdrop-filter: blur(10px);
                    border-bottom: 2px solid #374151;
                }
                
                .music-table tbody td {
                    word-wrap: break-word;
                    overflow: hidden;
                }
                
                /* Responsividade para mobile */
                @media (max-width: 768px) {
                    .music-table {
                        font-size: 0.875rem;
                    }
                    
                    .music-table thead th {
                        padding: 0.5rem 0.25rem;
                    }
                    
                    .music-table tbody td {
                        padding: 0.5rem 0.25rem;
                    }
                    
                    /* Garantir que os botões sejam sempre visíveis */
                    .music-table .action-buttons {
                        min-width: 140px;
                        flex-shrink: 0;
                        white-space: nowrap;
                    }
                    
                    /* Ajustar larguras das colunas para mobile */
                    .music-table th:nth-child(1) { width: 60%; }
                    .music-table th:nth-child(2) { width: 40%; }
                    
                    /* Garantir que o texto seja truncado corretamente */
                    .music-table .text-truncate {
                        overflow: hidden;
                        text-overflow: ellipsis;
                        white-space: nowrap;
                    }
                    
                    /* Ajustar tamanho dos botões para mobile */
                    .music-table button {
                        flex-shrink: 0;
                    }
                    
                    /* Garantir que a coluna de ações tenha espaço suficiente */
                    .music-table td:last-child {
                        min-width: 140px;
                    }
                }
            `}</style>

            <div
                className="music-table-container overflow-auto music-table-scrollbar"
                style={{
                    maxHeight: 'calc(80 * 72px)', // 80 músicas × 72px por linha (mais compacto para mobile)
                    minHeight: '300px', // Altura mínima menor para mobile
                    overscrollBehavior: 'contain'
                }}
                onWheel={(e) => {
                    // Prevenir scroll da página quando rolando a tabela
                    e.stopPropagation();
                }}
            >
                {/* Toolbar para seleção e ZIP em massa - apenas desktop */}
                <div className="hidden sm:flex items-center justify-between px-2 sm:px-3 py-2">
                    <div className="text-xs text-gray-400">
                        Seleção rápida
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={addAllToQueue}
                            className="px-2 py-1.5 rounded-lg text-[11px] bg-zinc-700/60 hover:bg-zinc-600 text-white shadow-sm"
                            title="Adicionar todas as músicas desta lista à fila"
                        >
                            Selecionar todas
                        </button>
                        <button
                            onClick={handleDownloadQueue}
                            disabled={downloadQueue.length === 0 || isDownloadingQueue}
                            className={clsx("px-2 py-1.5 rounded-lg text-[11px] text-white shadow-sm",
                                downloadQueue.length === 0 || isDownloadingQueue
                                    ? "bg-zinc-700/60 cursor-not-allowed"
                                    : "bg-blue-600 hover:bg-blue-700")}
                            title="Gerar ZIPs em partes de até 50 músicas"
                        >
                            Gerar ZIP (x50)
                        </button>
                    </div>
                </div>

                {/* Barra de progresso e aviso para múltiplos ZIPs - apenas desktop */}
                {zipProgress.isActive && (
                    <div className="hidden sm:block px-3 pb-2">
                        {zipProgress.totalChunks && zipProgress.totalChunks > 1 && (
                            <>
                                <div className="text-[11px] text-amber-300 mb-1">
                                    Pode ser necessário autorizar o navegador a baixar múltiplos arquivos.
                                </div>
                                <div className="text-[11px] text-amber-300 mb-2">
                                    São muitos arquivos em qualidade HD. O processo pode demorar bastante, por favor tenha paciência.
                                </div>
                            </>
                        )}
                        <div className="w-full bg-zinc-800/70 rounded-md h-2 overflow-hidden">
                            <div
                                className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 transition-all"
                                style={{ width: `${Math.min(100, Math.round((zipProgress.current / Math.max(1, zipProgress.total)) * 100))}%` }}
                            />
                        </div>
                        <div className="mt-1 flex items-center justify-between text-[11px] text-gray-400">
                            <span>{zipProgress.trackName || 'Preparando...'}</span>
                            <div className="flex items-center gap-2">
                                <span>
                                    {zipProgress.currentChunk && zipProgress.totalChunks && zipProgress.totalChunks > 1
                                        ? `Parte ${zipProgress.currentChunk}/${zipProgress.totalChunks}`
                                        : `${zipProgress.current}/${zipProgress.total}`}
                                </span>
                                <button
                                    onClick={() => setBulkCancel(true)}
                                    className="px-2 py-0.5 rounded bg-red-600/80 hover:bg-red-600 text-white"
                                    title="Cancelar downloads em lote"
                                >
                                    Cancelar
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Aviso para mobile sobre downloads em massa */}
                <div className="sm:hidden px-3 py-2 text-center">
                    <div className="text-[11px] text-amber-300 mb-1">
                        Para downloads em massa, acesse nossos packs completos
                    </div>
                    <a
                        href="https://plataformavip.nexorrecords.com.br/atualizacoes"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-[11px] bg-gradient-to-r from-green-500 to-blue-500 text-white shadow-sm hover:scale-105 transition-transform"
                        title="Abrir packs no Google Drive (nova aba)"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                            <path d="M20.37 10.79L12 2.42 3.63 10.79A2.5 2.5 0 0 0 5.3 15h13.4a2.5 2.5 0 0 0 1.67-4.21zM12 17l-4 4h8l-4-4z" />
                        </svg>
                        Acessar Packs
                    </a>
                </div>

                <div className="overflow-x-auto w-full">
                    <table className="music-table w-full text-left" style={{ tableLayout: 'fixed', minWidth: 0 }}>
                        <thead>
                            <tr className="border-b border-zinc-800">
                                <th className="px-2 sm:px-4 py-2 sm:py-3 font-bold text-gray-400 tracking-wider w-[60%] sm:w-[40%]">
                                    <div className="flex items-center gap-1 sm:gap-2">
                                        <Music2 strokeWidth={1.5} className="h-4 w-4 sm:h-5 sm:w-5 text-purple-400" />
                                        <span className="hidden sm:inline">MÚSICA</span>
                                        <span className="sm:hidden">MÚSICA</span>
                                    </div>
                                </th>
                                <th className="hidden sm:table-cell px-2 sm:px-4 py-2 sm:py-3 font-bold text-blue-400 tracking-wider w-[20%] text-center">
                                    <div className="flex items-center justify-center gap-1 sm:gap-2">
                                        <Sparkles strokeWidth={1.5} className="h-4 w-4 sm:h-5 sm:w-5 text-blue-400" />
                                        <span>GÊNERO</span>
                                    </div>
                                </th>
                                <th className="hidden sm:table-cell px-2 sm:px-4 py-2 sm:py-3 font-bold text-yellow-400 tracking-wider w-[25%] text-center">
                                    <div className="flex items-center justify-center gap-1 sm:gap-2">
                                        <Star strokeWidth={1.5} className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-400" />
                                        <span>POOL/LABEL</span>
                                    </div>
                                </th>
                                <th className="px-2 sm:px-4 py-2 sm:py-3 font-bold text-gray-400 tracking-wider w-[40%] sm:w-[30%] text-right">
                                    <div className="flex items-center justify-end gap-1 sm:gap-2">
                                        <Zap strokeWidth={1.5} className="h-4 w-4 sm:h-5 sm:w-5 text-green-400" />
                                        <span className="hidden sm:inline">AÇÕES</span>
                                        <span className="sm:hidden">AÇÕES</span>
                                    </div>
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-800/70">
                            {tracks.map(track => <TrackRow key={`track-${track.id}`} {...{ track, isCurrent: currentTrack?.id === track.id, isPlaying: isPlaying && currentTrack?.id === track.id, isLiked: userData?.likedTrackIds?.includes(track.id) ?? false, isLiking: liking === track.id, isDeleting: deleting === track.id, isAdmin, canDownloadResult: canDownload(track.id), isInQueue: isTrackInQueue(track.id), onPlayPause: handlePlayPauseClick, onDownload: handleDownloadClick, onLike: handleLikeClick, onDelete: handleDeleteClick, onToggleQueue, hasDownloaded: hasDownloadedTrack(track.id), externalDownloadQueue }} />)}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

export default MusicTable;