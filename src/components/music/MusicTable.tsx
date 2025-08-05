"use client";
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import { Play, Pause, Download, Heart, AlertTriangle, Copyright, Music, Trash2, Loader2, DownloadCloud, Sparkles, Zap, Star, Shield, Eye, Clock, TrendingUp, Volume2, FileAudio, Headphones, Mic, Disc3, Radio, Music2, Music3, Music4, Plus, Minus, ShoppingCart, Package, Crown, X } from 'lucide-react';
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
    canDownloadResult: { can: boolean; reason: string; timeLeft: string; showUpgrade?: boolean };
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

const TrackRow = ({ track, isCurrent, isPlaying, isLiked, isLiking, isDeleting, isAdmin, canDownloadResult, isInQueue, onPlayPause, onDownload, onLike, onReport, onCopyright, onDelete, onAddToQueue, onRemoveFromQueue }: TrackUIProps) => {
    const { data: session } = useSession();
    const { showToast } = useToastContext();

    const handleDownloadClick = () => {
        if (!session?.user) {
            showToast('👤 Faça login para fazer downloads', 'warning');
            return;
        }

        if (!canDownloadResult.can) {
            if (canDownloadResult.showUpgrade) {
                showToast('🚀 Assine um plano VIP para downloads ilimitados!', 'warning');
            } else {
                showToast(canDownloadResult.reason, 'warning');
            }
            return;
        }

        onDownload(track);
    };

    const handleLikeClick = () => {
        if (!session?.user) {
            showToast('👤 Faça login para curtir músicas', 'warning');
            return;
        }
        onLike(track.id);
    };

    const handleReportClick = () => {
        if (!session?.user) {
            showToast('👤 Faça login para reportar', 'warning');
            return;
        }
        onReport(track);
    };

    const handleCopyrightClick = () => {
        if (!session?.user) {
            showToast('👤 Faça login para reportar copyright', 'warning');
            return;
        }
        onCopyright(track);
    };

    const handleDeleteClick = () => {
        if (!session?.user) {
            showToast('👤 Faça login para deletar', 'warning');
            return;
        }
        onDelete(track);
    };

    return (
        <tr className={`hover:bg-zinc-800/50 transition-all duration-300 ${isCurrent ? 'bg-purple-600/20 border-l-4 border-purple-500' : ''}`}>
            <td className="px-4 py-3">
                <div className="flex items-center gap-4">
                    <div className="relative">
                        <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-600 rounded-lg flex items-center justify-center cursor-pointer hover:scale-105 transition-transform duration-200" onClick={() => onPlayPause(track)}>
                            {isPlaying ? (
                                <Pause className="h-6 w-6 text-white" />
                            ) : (
                                <Play className="h-6 w-6 text-white" />
                            )}
                        </div>
                        {isCurrent && (
                            <div className="absolute -top-1 -right-1 w-4 h-4 bg-purple-500 rounded-full animate-pulse"></div>
                        )}
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="text-white font-medium truncate">{track.songName}</div>
                        <div className="text-gray-400 text-sm truncate">{track.artist}</div>
                    </div>
                </div>
            </td>
            <td className="px-4 py-3">
                <span className="px-3 py-1 bg-gradient-to-r from-purple-600/20 to-blue-600/20 text-purple-300 rounded-full text-sm font-medium border border-purple-500/30">
                    {track.style}
                </span>
            </td>
            <td className="px-4 py-3">
                <span className="px-3 py-1 bg-gradient-to-r from-emerald-600/20 to-green-600/20 text-emerald-300 rounded-full text-sm font-medium border border-emerald-500/30">
                    {track.pool || 'Nexor Records'}
                </span>
            </td>
            <td className="px-4 py-3">
                <div className="flex items-center justify-end gap-2">
                    {/* Botão de Adicionar à Fila */}
                    <button
                        onClick={() => isInQueue ? onRemoveFromQueue(track) : onAddToQueue(track)}
                        className={`w-10 h-10 rounded-lg transition-all duration-300 flex items-center justify-center ${isInQueue
                            ? 'bg-orange-600/20 text-orange-400 border border-orange-500/30 hover:bg-orange-600/30'
                            : 'bg-green-600/20 text-green-400 border border-green-500/30 hover:bg-green-600/30'
                            }`}
                        title={isInQueue ? 'Remover da fila' : 'Adicionar à fila'}
                    >
                        {isInQueue ? <Minus className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                    </button>

                    {/* Botão de Download */}
                    <button
                        onClick={handleDownloadClick}
                        disabled={!canDownloadResult.can}
                        className={`w-10 h-10 rounded-lg transition-all duration-300 flex items-center justify-center ${canDownloadResult.can
                            ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30 hover:bg-blue-600/30'
                            : 'bg-gray-600/20 text-gray-400 border border-gray-500/30 cursor-not-allowed'
                            }`}
                        title={canDownloadResult.reason}
                    >
                        <Download className="h-4 w-4" />
                    </button>

                    {/* Botão de Like */}
                    <button
                        onClick={handleLikeClick}
                        disabled={isLiking}
                        className={`w-10 h-10 rounded-lg transition-all duration-300 flex items-center justify-center ${isLiked
                            ? 'bg-red-600/20 text-red-400 border border-red-500/30'
                            : 'bg-gray-600/20 text-gray-400 border border-gray-500/30 hover:bg-red-600/20 hover:text-red-400 hover:border-red-500/30'
                            }`}
                        title={isLiked ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
                    >
                        {isLiking ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <Heart className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
                        )}
                    </button>

                    {/* Botão de Report */}
                    <button
                        onClick={handleReportClick}
                        className="w-10 h-10 bg-gray-600/20 text-gray-400 border border-gray-500/30 rounded-lg hover:bg-gray-600/30 transition-all duration-300 flex items-center justify-center"
                        title="Reportar problema"
                    >
                        <AlertTriangle className="h-4 w-4" />
                    </button>

                    {/* Botão de Copyright */}
                    <button
                        onClick={handleCopyrightClick}
                        className="w-10 h-10 bg-gray-600/20 text-gray-400 border border-gray-500/30 rounded-lg hover:bg-gray-600/30 transition-all duration-300 flex items-center justify-center"
                        title="Reportar copyright"
                    >
                        <Copyright className="h-4 w-4" />
                    </button>

                    {/* Botão de Delete (apenas para admin) */}
                    {isAdmin && (
                        <button
                            onClick={handleDeleteClick}
                            disabled={isDeleting}
                            className="w-10 h-10 bg-red-600/20 text-red-400 border border-red-500/30 rounded-lg hover:bg-red-600/30 transition-all duration-300 disabled:opacity-50 flex items-center justify-center"
                            title="Deletar música"
                        >
                            {isDeleting ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <Trash2 className="h-4 w-4" />
                            )}
                        </button>
                    )}
                </div>
            </td>
        </tr>
    );
};
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
                    {/* Botão de Adicionar à Fila */}
                    <button
                        onClick={() => isInQueue ? onRemoveFromQueue(track) : onAddToQueue(track)}
                        className={`w-10 h-10 rounded-lg transition-all duration-300 flex items-center justify-center ${isInQueue
                            ? 'bg-orange-600/20 text-orange-400 border border-orange-500/30 hover:bg-orange-600/30'
                            : 'bg-green-600/20 text-green-400 border border-green-500/30 hover:bg-green-600/30'
                            }`}
                        title={isInQueue ? 'Remover da fila' : 'Adicionar à fila'}
                    >
                        {isInQueue ? <Minus className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                    </button>

                    {/* Botão de Download */}
                    <button
                        onClick={() => onDownload(track)}
                        disabled={!canDownloadResult.can}
                        className={`w-10 h-10 rounded-lg transition-all duration-300 flex items-center justify-center ${hasDownloaded && canDownloadResult.can
                            ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30 hover:bg-blue-600/30'
                            : 'bg-gray-600/20 text-gray-400 border border-gray-500/30 cursor-not-allowed'
                            }`}
                        title={hasDownloaded ? "Você já baixou esta música" : canDownloadResult.reason}
                    >
                        <DownloadCloud size={16} />
                        <span className='text-xs'>
                            {hasDownloaded ? 'BAIXADO' : (canDownloadResult.timeLeft || 'DOWNLOAD')}
                        </span>
                    </button>

                    {/* Botão de Like */}
                    <button
                        onClick={() => onLike(track.id)}
                        disabled={isLiking}
                        className={`w-10 h-10 rounded-lg transition-all duration-300 flex items-center justify-center ${isLiked
                            ? 'bg-red-600/20 text-red-400 border border-red-500/30'
                            : 'bg-gray-600/20 text-gray-400 border border-gray-500/30 hover:bg-red-600/20 hover:text-red-400 hover:border-red-500/30'
                            }`}
                        title={isLiked ? "Descurtir" : "Curtir"}
                    >
                        {isLiking ? <Loader2 size={16} className="animate-spin" /> : <Heart size={16} />}
                    </button>

                    {/* Botão de Report */}
                    <button
                        onClick={() => onReport(track)}
                        className="w-10 h-10 bg-gray-600/20 text-gray-400 border border-gray-500/30 rounded-lg hover:bg-gray-600/30 transition-all duration-300 flex items-center justify-center"
                        title="Reportar Problema"
                    >
                        <AlertTriangle size={16} />
                    </button>

                    {/* Botão de Copyright */}
                    <button
                        onClick={() => onCopyright(track)}
                        className="w-10 h-10 bg-gray-600/20 text-gray-400 border border-gray-500/30 rounded-lg hover:bg-gray-600/30 transition-all duration-300 flex items-center justify-center"
                        title="Reportar Copyright"
                    >
                        <Shield size={16} />
                    </button>

                    {/* Botão de Delete (apenas para admin) */}
                    {isAdmin && (
                        <button
                            onClick={() => onDelete(track)}
                            disabled={isDeleting}
                            className="w-10 h-10 bg-red-600/20 text-red-400 border border-red-500/30 rounded-lg hover:bg-red-600/30 transition-all duration-300 disabled:opacity-50 flex items-center justify-center"
                            title="Excluir Música"
                        >
                            {isDeleting ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                        </button>
                    )}
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

    // Persistência da fila de downloads
    useEffect(() => {
        const savedQueue = localStorage.getItem('downloadQueue');
        if (savedQueue) {
            try {
                const parsedQueue = JSON.parse(savedQueue);
                setDownloadQueue(parsedQueue);
            } catch (error) {
                console.error('Erro ao carregar fila de downloads:', error);
                localStorage.removeItem('downloadQueue');
            }
        }
    }, []);

    // Salvar fila no localStorage sempre que mudar
    useEffect(() => {
        if (downloadQueue.length > 0) {
            localStorage.setItem('downloadQueue', JSON.stringify(downloadQueue));
        } else {
            localStorage.removeItem('downloadQueue');
        }
    }, [downloadQueue]);

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
        if (downloadQueue.length === 0) return;

        try {
            setIsDownloadingQueue(true);
            setZipProgress({
                isActive: true,
                progress: 0,
                current: 0,
                total: downloadQueue.length,
                trackName: '',
                elapsedTime: 0,
                remainingTime: 0,
                isGenerating: false
            });

            const trackIds = downloadQueue.map(track => track.id);
            const filename = `nexor-records-${new Date().toISOString().split('T')[0]}.zip`;

            // Usar a nova API com progresso
            const response = await fetch('/api/downloads/zip-progress', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ trackIds, filename })
            });

            if (!response.ok) {
                throw new Error('Erro ao criar ZIP');
            }

            const reader = response.body?.getReader();
            if (!reader) {
                throw new Error('Erro ao ler resposta');
            }

            const decoder = new TextDecoder();
            let zipData = '';

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value);
                const lines = chunk.split('\n');

                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        try {
                            const data = JSON.parse(line.slice(6));

                            switch (data.type) {
                                case 'start':
                                    setZipProgress(prev => ({
                                        ...prev,
                                        total: data.total,
                                        trackName: 'Iniciando...'
                                    }));
                                    break;

                                case 'progress':
                                    setZipProgress(prev => ({
                                        ...prev,
                                        progress: data.progress,
                                        current: data.current,
                                        total: data.total,
                                        trackName: data.trackName,
                                        elapsedTime: data.elapsedTime,
                                        remainingTime: data.remainingTime
                                    }));
                                    break;

                                case 'generating':
                                    setZipProgress(prev => ({
                                        ...prev,
                                        isGenerating: true,
                                        trackName: 'Gerando arquivo ZIP...'
                                    }));
                                    break;

                                case 'complete':
                                    // Converter base64 para blob e fazer download
                                    const binaryString = atob(data.zipData);
                                    const bytes = new Uint8Array(binaryString.length);
                                    for (let i = 0; i < binaryString.length; i++) {
                                        bytes[i] = binaryString.charCodeAt(i);
                                    }

                                    const blob = new Blob([bytes], { type: 'application/zip' });
                                    const url = URL.createObjectURL(blob);
                                    const a = document.createElement('a');
                                    a.href = url;
                                    a.download = data.filename;
                                    document.body.appendChild(a);
                                    a.click();
                                    document.body.removeChild(a);
                                    URL.revokeObjectURL(url);

                                    // Limpar fila e progresso
                                    setDownloadQueue([]);
                                    setZipProgress({
                                        isActive: false,
                                        progress: 0,
                                        current: 0,
                                        total: 0,
                                        trackName: '',
                                        elapsedTime: 0,
                                        remainingTime: 0,
                                        isGenerating: false
                                    });

                                    showToast('ZIP baixado com sucesso!', 'success');
                                    break;

                                case 'error':
                                    throw new Error(data.message || 'Erro desconhecido');
                            }
                        } catch (error) {
                            console.error('Erro ao processar dados:', error);
                        }
                    }
                }
            }

        } catch (error) {
            console.error('Erro ao baixar ZIP:', error);
            showToast('Erro ao baixar ZIP', 'error');
            setZipProgress({
                isActive: false,
                progress: 0,
                current: 0,
                total: 0,
                trackName: '',
                elapsedTime: 0,
                remainingTime: 0,
                isGenerating: false
            });
        } finally {
            setIsDownloadingQueue(false);
        }
    }, [downloadQueue, showToast]);

    // Verificar se é VIP
    useEffect(() => {
        if (userData) {
            // setIsVip(userData.isVip || false); // This line was removed as per the new_code
        }
    }, [userData]);

    // Funções de formatação e verificação
    const formatTime = (seconds: number): string => {
        if (seconds <= 0) return '00:00';
        const h = Math.floor(seconds / 3600).toString().padStart(2, '0');
        const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
        const s = (seconds % 60).toString().padStart(2, '0');
        return `${h}:${m}:${s}`;
    };

    // Lógica de download otimizada
    const canDownload = useMemo(() => {
        return (trackId: number) => {
            // Para usuários VIP, sempre permitir download (apenas verificar cooldown)
            if (isVip) {
                const cooldown = downloadCooldowns[trackId];
                if (cooldown > 0) {
                    const timeLeftFormatted = formatTime(cooldown);
                    return { can: false, reason: `Aguarde ${timeLeftFormatted} para baixar novamente.`, timeLeft: timeLeftFormatted };
                }
                return { can: true, reason: 'Clique para baixar a música.', timeLeft: '' };
            }

            // Para usuários não-VIP
            if (typeof downloadsLeft === 'number' && downloadsLeft <= 0) {
                return {
                    can: false,
                    reason: 'Limite diário de downloads atingido. Assine um plano VIP para downloads ilimitados!',
                    timeLeft: '',
                    showUpgrade: true
                };
            }
            const cooldown = downloadCooldowns[trackId];
            if (cooldown > 0) {
                const timeLeftFormatted = formatTime(cooldown);
                return { can: false, reason: `Aguarde ${timeLeftFormatted} para baixar novamente.`, timeLeft: timeLeftFormatted };
            }
            return {
                can: true,
                reason: `Clique para baixar a música. (${downloadsLeft} restantes hoje)`,
                timeLeft: '',
                showUpgrade: false
            };
        };
    }, [isVip, downloadsLeft, downloadCooldowns]);

    // Atualizar a interface TrackUIProps para incluir showUpgrade
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
        onPlayPause: (track: Track) => void;
        onDownload: (track: Track) => void;
        onLike: (trackId: number) => void;
        onReport: (track: Track) => void;
        onCopyright: (track: Track) => void;
        onDelete: (track: Track) => void;
        onAddToQueue: (track: Track) => void;
        onRemoveFromQueue: (track: Track) => void;
    }

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

            {/* Download Queue Section */}
            {downloadQueue.length > 0 && (
                <div className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 border border-blue-500/30 rounded-lg p-4 mb-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <ShoppingCart className="h-5 w-5 text-blue-400" />
                            <h3 className="text-lg font-semibold text-white">
                                Fila de Downloads ({downloadQueue.length}/20)
                            </h3>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={handleDownloadQueue}
                                disabled={isDownloadingQueue || zipProgress.isActive}
                                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white rounded-lg font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isDownloadingQueue || zipProgress.isActive ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        {zipProgress.isActive ? 'Processando...' : 'Baixando...'}
                                    </>
                                ) : (
                                    <>
                                        <Package className="h-4 w-4" />
                                        Baixar ZIP
                                    </>
                                )}
                            </button>
                            <button
                                onClick={() => setDownloadQueue([])}
                                disabled={isDownloadingQueue || zipProgress.isActive}
                                className="px-4 py-2 bg-gray-600/20 text-gray-300 hover:bg-gray-600/30 border border-gray-500/30 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Limpar
                            </button>
                        </div>
                    </div>

                    {/* Progress Bar */}
                    {zipProgress.isActive && (
                        <div className="mb-4">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm text-gray-300">
                                    {zipProgress.trackName}
                                </span>
                                <span className="text-sm text-gray-300">
                                    {zipProgress.current}/{zipProgress.total} ({zipProgress.progress}%)
                                </span>
                            </div>
                            <div className="w-full bg-gray-700 rounded-full h-2">
                                <div
                                    className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                                    style={{ width: `${zipProgress.progress}%` }}
                                ></div>
                            </div>
                            <div className="flex items-center justify-between mt-2 text-xs text-gray-400">
                                <span>
                                    Tempo decorrido: {formatTime(zipProgress.elapsedTime)}
                                </span>
                                <span>
                                    Tempo restante: {formatTime(zipProgress.remainingTime)}
                                </span>
                            </div>
                        </div>
                    )}

                    {/* Queue List */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {downloadQueue.map((track, index) => (
                            <div key={`${track.id}-${index}`} className="flex items-center justify-between bg-gray-800/50 rounded-lg p-3">
                                <div className="flex-1 min-w-0">
                                    <p className="text-white font-medium truncate">{track.songName}</p>
                                    <p className="text-gray-400 text-sm truncate">{track.artist}</p>
                                </div>
                                <button
                                    onClick={() => handleRemoveFromQueue(track)}
                                    disabled={isDownloadingQueue || zipProgress.isActive}
                                    className="ml-2 p-1 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded transition-all duration-200 disabled:opacity-50"
                                    title="Remover da fila"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Informação para usuários não-VIP */}
            {!isVip && (
                <div className="mb-6 p-4 bg-gradient-to-r from-orange-600/20 to-red-600/20 rounded-xl backdrop-blur-sm border border-orange-500/30">
                    <div className="flex items-start gap-3">
                        <div className="p-2 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg">
                            <Crown className="h-5 w-5 text-white" />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-white font-semibold mb-2">🚀 Upgrade para VIP e Baixe Ilimitado!</h3>
                            <p className="text-gray-300 text-sm mb-3">
                                Você tem <span className="font-bold text-orange-400">{downloadsLeft}</span> downloads restantes hoje.
                                Assine um plano VIP e tenha downloads ilimitados!
                            </p>
                            <div className="flex flex-wrap gap-2 text-xs text-gray-400 mb-3">
                                <span className="flex items-center gap-1">
                                    <Download className="h-3 w-3" />
                                    Downloads ilimitados
                                </span>
                                <span className="flex items-center gap-1">
                                    <Music className="h-3 w-3" />
                                    Acesso premium
                                </span>
                                <span className="flex items-center gap-1">
                                    <Star className="h-3 w-3" />
                                    Benefícios exclusivos
                                </span>
                            </div>
                            <div className="flex gap-2">
                                <Link
                                    href="/plans"
                                    className="px-4 py-2 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white rounded-lg text-sm font-medium transition-all duration-300"
                                >
                                    Ver Planos VIP
                                </Link>
                                <Link
                                    href="/profile"
                                    className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg text-sm font-medium transition-all duration-300"
                                >
                                    Meu Perfil
                                </Link>
                            </div>
                        </div>
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