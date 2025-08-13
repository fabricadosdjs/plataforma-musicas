"use client";
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import { Play, Pause, Download, Heart, Music, Trash2, Loader2, DownloadCloud, Sparkles, Zap, Star, Crown, X, CheckCircle, Plus, Minus, ShoppingCart, Package, Music2, Users } from 'lucide-react';
import Link from 'next/link';
import { useGlobalPlayer } from '@/context/GlobalPlayerContext';
import { useToastContext } from '@/context/ToastContext';
import { useUserData } from '@/hooks/useUserData';
import { Track } from '@/types/track';
import clsx from 'clsx';

// Importação global da fonte Inter
import { Inter } from 'next/font/google';

const inter = Inter({
    weight: ['300', '400', '500', '600', '700'],
    subsets: ['latin'],
    display: 'swap',
});

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
            "group border-l-4",
            isCurrent ? 'bg-blue-900/20 border-blue-400' : 'border-transparent hover:bg-gray-800/20'
        )}>
            <td className="px-2 sm:px-3 lg:px-4 py-2 sm:py-3 align-middle w-[60%] sm:w-[45%] lg:w-[40%]">
                <div className="flex items-center gap-2 sm:gap-3 lg:gap-4">
                    <div className="relative flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 overflow-hidden">
                        <img src={track.imageUrl || "/images/default-track.jpg"} alt={`Capa de ${track.songName}`} className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-lg object-cover border border-zinc-700/50 image-rendering-auto" />
                        <button onClick={() => onPlayPause(track)} className={clsx("absolute inset-0 w-full h-full flex items-center justify-center rounded-lg text-white bg-black/40 focus:outline-none focus:ring-0", isCurrent ? 'opacity-100' : 'opacity-0 group-hover:opacity-100')} title={isPlaying ? "Pausar" : "Tocar"}>
                            {isPlaying && isCurrent ? <Pause size={16} strokeWidth={1.75} className="text-blue-400 sm:w-[18px] sm:h-[18px] lg:w-[22px] lg:h-[22px]" /> : <Play size={16} strokeWidth={1.75} className="sm:w-[18px] sm:h-[18px] lg:w-[22px] lg:h-[22px]" />}
                        </button>
                    </div>
                    <div className="flex flex-col min-w-0 flex-1">
                        <span className="font-bold text-gray-100 truncate text-[10px] sm:text-[11px] lg:text-[12px]">{track.songName}</span>
                        <span className="text-[8px] sm:text-[9px] lg:text-[10px] text-gray-400 truncate">{track.artist}</span>
                        {/* Pool/Label visível apenas em tablet, não em mobile */}
                        <div className="hidden sm:flex lg:hidden items-center gap-1 mt-1">
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[7px] sm:text-[8px] font-bold bg-green-600 text-white tracking-wide uppercase">{track.pool || 'Nexor Records'}</span>
                        </div>
                    </div>
                </div>
            </td>
            <td className="hidden sm:table-cell px-2 sm:px-3 lg:px-4 py-2 sm:py-3 align-middle w-[20%] text-center">
                <span className="inline-flex items-center px-1.5 sm:px-2 lg:px-2 py-0.5 rounded-full text-[8px] sm:text-[9px] lg:text-[10px] font-bold text-white tracking-wide whitespace-nowrap uppercase bg-orange-600">{track.style}</span>
            </td>
            <td className="hidden lg:table-cell px-4 py-3 align-middle w-[25%] text-center">
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-600 text-white tracking-wide whitespace-nowrap uppercase">{track.pool || 'Nexor Records'}</span>
            </td>
            <td className="px-2 sm:px-3 lg:px-4 py-2 sm:py-3 align-middle w-[40%] sm:w-[35%] lg:w-[30%]">
                <div className="flex items-center justify-end gap-1">
                    <button onClick={() => onDownload(track)} disabled={!canDownloadResult.can} title={canDownloadResult.reason} className={clsx("flex items-center gap-1 sm:gap-2 px-2 sm:px-3 lg:px-4 py-1.5 sm:py-2 lg:py-2.5 rounded-lg font-bold text-[9px] sm:text-[10px] lg:text-xs min-w-[50px] sm:min-w-[80px] lg:min-w-[120px] justify-center", hasDownloaded ? "bg-green-600 text-white cursor-default" : canDownloadResult.can ? "bg-blue-600 hover:bg-blue-700 text-white" : "bg-gray-600 text-gray-300 cursor-not-allowed opacity-60")}>
                        {hasDownloaded ? <CheckCircle size={10} strokeWidth={2} className="sm:w-[14px] sm:h-[14px] lg:w-[16px] lg:h-[16px]" /> : <Download size={10} strokeWidth={2} className="sm:w-[14px] sm:h-[14px] lg:w-[16px] lg:h-[16px]" />}
                        <span className="whitespace-nowrap hidden sm:inline">{hasDownloaded ? 'BAIXADO' : canDownloadResult.timeLeft || 'DOWNLOAD'}</span>
                        <span className="whitespace-nowrap sm:hidden">{hasDownloaded ? '✓' : '↓'}</span>
                    </button>
                    <button
                        onClick={() => onToggleQueue(track)}
                        disabled={!isInQueue && externalDownloadQueue && externalDownloadQueue.length >= 20}
                        title={isInQueue ? "Remover da Fila" : externalDownloadQueue && externalDownloadQueue.length >= 20 ? "Limite de 20 músicas atingido" : "Adicionar à Fila"}
                        className={clsx("h-8 w-8 sm:h-8 sm:w-8 lg:h-10 lg:w-10 flex items-center justify-center rounded-lg",
                            isInQueue ? 'bg-blue-600 text-white' :
                                externalDownloadQueue && externalDownloadQueue.length >= 20 ? 'bg-red-600 text-white cursor-not-allowed' :
                                    'bg-gray-600 text-gray-300 hover:bg-gray-500 hover:text-white'
                        )}
                    >
                        {isInQueue ? <Minus size={12} strokeWidth={2.5} className="sm:w-[16px] sm:h-[16px] lg:w-[18px] lg:h-[18px]" /> : <Plus size={12} strokeWidth={2.5} className="sm:w-[16px] sm:h-[16px] lg:w-[18px] lg:h-[18px]" />}
                    </button>
                    <button onClick={() => onLike(track.id)} disabled={isLiking} title={isLiked ? "Descurtir" : "Curtir"} className={clsx("h-8 w-8 sm:h-8 sm:w-8 lg:h-10 lg:w-10 flex items-center justify-center rounded-lg", isLiked ? 'bg-pink-600 text-white fill-white' : 'bg-gray-600 text-gray-300 hover:bg-gray-500 hover:text-white')}>
                        {isLiking ? <Loader2 size={12} strokeWidth={2} className="animate-spin sm:w-[16px] sm:h-[16px] lg:w-[18px] lg:h-[18px]" /> : <Heart size={12} strokeWidth={2} className="sm:w-[16px] sm:h-[16px] lg:w-[18px] lg:h-[18px]" />}
                    </button>
                    {isAdmin && <button onClick={() => onDelete(track)} disabled={isDeleting} title="Excluir Música" className="h-8 w-8 sm:h-8 sm:w-8 lg:h-10 lg:w-10 flex items-center justify-center rounded-lg bg-red-600 hover:bg-red-700 text-white">{isDeleting ? <Loader2 size={12} strokeWidth={2} className="animate-spin sm:w-[16px] sm:h-[16px] lg:w-[18px] lg:h-[18px]" /> : <Trash2 size={12} strokeWidth={2} className="sm:w-[16px] sm:h-[16px] lg:w-[18px] lg:h-[18px]" />}</button>}
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
                    <button onClick={() => onPlayPause(track)} className="absolute inset-0 flex items-center justify-center rounded-lg bg-black/40" title={isPlaying && isCurrent ? "Pausar" : "Tocar"}>
                        {isPlaying && isCurrent ? <Pause size={26} strokeWidth={1.75} className="text-blue-400" /> : <Play size={26} strokeWidth={1.75} className="text-white" />}
                    </button>
                </div>
                <div className="flex flex-col min-w-0">
                    <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-base truncate">{track.songName}</span>
                    </div>
                    <span className="text-sm text-gray-400 truncate">{track.artist}</span>
                    <div className="flex items-center gap-2 mt-2">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-gradient-to-r from-purple-600 to-blue-600 text-white">{track.style}</span>
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-gradient-to-r from-emerald-600 to-green-600 text-white">{track.pool || 'NR'}</span>
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
    }>({
        isActive: false,
        progress: 0,
        current: 0,
        total: 0,
        trackName: '',
        elapsedTime: 0,
        remainingTime: 0,
        isGenerating: false
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
                showToast('🔄 Baixando arquivo...', 'info');

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

                showToast(`✅ "${track.songName}" baixada com sucesso!`, 'success');
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

    // Função para download em lote (ZIP)
    const handleDownloadQueue = async () => {
        if (!session?.user) {
            showToast('👤 Faça login para fazer downloads', 'warning');
            return;
        }

        if (downloadQueue.length === 0) {
            showToast('📦 Adicione músicas à fila primeiro', 'warning');
            return;
        }

        setIsDownloadingQueue(true);
        setZipProgress(prev => ({ ...prev, isActive: true, isGenerating: true }));

        // Timeout de 5 minutos
        const timeout = setTimeout(() => {
            setZipProgress(prev => ({ ...prev, isActive: false, isGenerating: false }));
            setIsDownloadingQueue(false);
            showToast('⏰ Timeout - download em lote demorou muito', 'error');
        }, 5 * 60 * 1000);

        try {
            const trackIds = downloadQueue.map(track => track.id);
            const filename = `nexor-records-${new Date().toISOString().split('T')[0]}.zip`;

            const response = await fetch('/api/downloads/zip-progress', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ trackIds, filename })
            });

            if (!response.ok) {
                throw new Error('Erro ao iniciar download em lote');
            }

            const reader = response.body?.getReader();
            if (!reader) {
                throw new Error('Erro ao ler resposta do servidor');
            }

            const decoder = new TextDecoder();
            let buffer = '';

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value);
                buffer += chunk;

                // Processar linhas completas
                const lines = buffer.split('\n');
                buffer = lines.pop() || ''; // Manter linha incompleta no buffer

                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        try {
                            const jsonData = line.slice(6).trim();

                            // Verificar se a linha não está vazia
                            if (!jsonData) {
                                continue;
                            }

                            const data = JSON.parse(jsonData);

                            if (data.type === 'progress') {
                                setZipProgress(prev => ({
                                    ...prev,
                                    progress: data.progress,
                                    current: data.current,
                                    total: data.total,
                                    trackName: data.trackName,
                                    elapsedTime: data.elapsedTime,
                                    remainingTime: data.remainingTime
                                }));
                            } else if (data.type === 'complete') {
                                console.log('✅ ZIP gerado com sucesso');

                                // Verificar se zipData existe
                                if (!data.zipData) {
                                    throw new Error('Dados do ZIP não recebidos');
                                }

                                // Decodificar dados do ZIP
                                const zipBuffer = atob(data.zipData);
                                const bytes = new Uint8Array(zipBuffer.length);
                                for (let i = 0; i < zipBuffer.length; i++) {
                                    bytes[i] = zipBuffer.charCodeAt(i);
                                }

                                // Criar blob e fazer download
                                const blob = new Blob([bytes], { type: 'application/zip' });
                                const url = URL.createObjectURL(blob);
                                const a = document.createElement('a');
                                a.href = url;
                                a.download = filename;
                                document.body.appendChild(a);
                                a.click();
                                URL.revokeObjectURL(url);
                                document.body.removeChild(a);

                                // Limpar fila e estados
                                setDownloadQueue([]);
                                setZipProgress(prev => ({ ...prev, isActive: false, isGenerating: false }));
                                setIsDownloadingQueue(false);
                                clearTimeout(timeout);

                                showToast('✅ Download em lote concluído!', 'success');
                            } else if (data.type === 'error') {
                                throw new Error(data.message || 'Erro ao gerar ZIP');
                            }
                        } catch (error) {
                            console.error('Erro ao processar dados do ZIP:', error);
                            console.error('Linha problemática:', line);
                        }
                    }
                }
            }
        } catch (error) {
            console.error('Erro no download em lote:', error);
            setZipProgress(prev => ({ ...prev, isActive: false, isGenerating: false }));
            setIsDownloadingQueue(false);
            clearTimeout(timeout);
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
        <div className={`relative w-full h-full text-sm text-white bg-[#121212] ${inter.className}`}>
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
                }
                
                /* Cabeçalho fixo com sticky positioning - permanece visível durante o scroll */
                .music-table thead th {
                    position: sticky;
                    top: 0;
                    z-index: 50;
                    background: #121212 !important;
                    backdrop-filter: blur(15px);
                    border-bottom: 2px solid #374151;
                    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
                    transition: all 0.2s ease;
                }
                
                /* Garantir que o background do cabeçalho seja sólido */
                .music-table thead th::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: #121212;
                    z-index: -1;
                }
                
                /* Hover effect no cabeçalho */
                .music-table thead th:hover {
                    background: #1a1a1a !important;
                }
                
                .music-table tbody td {
                    word-wrap: break-word;
                    overflow: hidden;
                }
                
                /* Melhorar a separação visual entre cabeçalho e conteúdo */
                .music-table tbody tr:first-child td {
                    border-top: 1px solid #374151;
                }
                
                /* Melhorar qualidade de renderização das imagens */
                .music-table img {
                    image-rendering: -webkit-optimize-contrast;
                    image-rendering: crisp-edges;
                    image-rendering: pixelated;
                    -webkit-font-smoothing: antialiased;
                    -moz-osx-font-smoothing: grayscale;
                }
                
                /* Melhorar qualidade dos botões e elementos */
                .music-table button {
                    -webkit-font-smoothing: antialiased;
                    -moz-osx-font-smoothing: grayscale;
                    text-rendering: optimizeLegibility;
                }
                
                /* Melhorar qualidade do texto */
                .music-table {
                    -webkit-font-smoothing: antialiased;
                    -moz-osx-font-smoothing: grayscale;
                    text-rendering: optimizeLegibility;
                }
                
                /* Responsividade para mobile */
                @media (max-width: 768px) {
                    .music-table-container {
                        height: calc(100vh - 150px) !important;
                        min-height: 300px !important;
                    }
                }
                
                /* Otimizações para tablets */
                @media (min-width: 768px) and (max-width: 1024px) {
                    .music-table thead th {
                        font-size: 0.875rem;
                        padding: 0.5rem 0.75rem;
                    }
                }
            `}</style>

            <div
                className="music-table-container overflow-auto music-table-scrollbar"
                style={{
                    height: 'calc(100vh - 200px)', // Altura responsiva baseada na viewport
                    maxHeight: 'calc(80 * 88px)', // 80 músicas × 88px por linha (incluindo padding e bordas)
                    minHeight: '400px', // Altura mínima para telas pequenas
                    overscrollBehavior: 'contain',
                    position: 'relative'
                }}
                onWheel={(e) => {
                    // Prevenir scroll da página quando rolando a tabela
                    e.preventDefault();
                    e.stopPropagation();

                    // Aplicar scroll na tabela
                    const container = e.currentTarget;
                    container.scrollTop += e.deltaY;
                }}
            >
                {/* Tabela Responsiva - Sempre visível */}
                <table className="music-table min-w-full text-left">
                    <thead>
                        <tr className="border-b border-zinc-800">
                            <th className="px-1 sm:px-1.5 lg:px-2 py-1 sm:py-1.5 lg:py-2 font-bold text-white tracking-wider w-[60%] sm:w-[45%] lg:w-[40%]">
                                <div className="flex items-center gap-0.5 sm:gap-1">
                                    <Music2 strokeWidth={1.5} className="h-3 w-3 sm:h-3.5 sm:w-3.5 lg:h-4 lg:w-4 text-purple-400 drop-shadow-lg" />
                                    <span className="text-[9px] sm:text-[10px] lg:text-xs">MÚSICA</span>
                                </div>
                            </th>
                            <th className="hidden sm:table-cell px-1 sm:px-1.5 lg:px-2 py-1 sm:py-1.5 lg:py-2 font-bold text-white tracking-wider w-[20%] text-center">
                                <div className="flex items-center justify-center gap-0.5 sm:gap-1">
                                    <Sparkles strokeWidth={1.5} className="h-3 w-3 sm:h-3.5 sm:w-3.5 lg:h-4 lg:w-4 text-blue-400 drop-shadow-lg" />
                                    <span className="text-[9px] sm:text-[10px] lg:text-xs">GÊNERO</span>
                                </div>
                            </th>
                            <th className="hidden lg:table-cell px-2 py-2 font-bold text-white tracking-wider w-[25%] text-center">
                                <div className="flex items-center justify-center gap-1">
                                    <Star strokeWidth={1.5} className="h-3.5 w-3.5 lg:h-4 lg:w-4 text-yellow-400 drop-shadow-lg" />
                                    <span className="text-[9px] sm:text-[10px] lg:text-xs">POOL/LABEL</span>
                                </div>
                            </th>
                            <th className="px-1 sm:px-1.5 lg:px-2 py-1 sm:py-1.5 lg:py-2 font-bold text-white tracking-wider w-[40%] sm:w-[35%] lg:w-[30%] text-right">
                                <div className="flex items-center justify-end gap-0.5 sm:gap-1">
                                    <Zap strokeWidth={1.5} className="h-3 w-3 sm:h-3.5 sm:w-3.5 lg:h-4 lg:w-4 text-green-400 drop-shadow-lg" />
                                    <span className="text-[9px] sm:text-[10px] lg:text-xs">AÇÕES</span>
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
    );
}

export default MusicTable;