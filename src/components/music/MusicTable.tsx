// src/components/music/MusicTable.tsx
"use client";
import React, { useState, useEffect } from 'react';
import { Track } from '@/types/track';
import Link from 'next/link';
import { AlertTriangle, Copyright, Download, Heart, Music, Pause, Play } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useAppContext } from '@/context/AppContext';
import GlobalAudioPlayer from '@/components/player/GlobalAudioPlayer';

interface MusicTableProps {
    tracks: Track[];
    onDownload?: (tracks: Track[]) => void;
    isDownloading?: boolean;
}

const MusicTable = ({ tracks, onDownload, isDownloading }: MusicTableProps) => {
    // Função para texto do botão de download
    const getDownloadButtonText = (trackId: number) => {
        if (hasDownloadedBefore(trackId)) {
            return 'BAIXADO';
        }
        return 'Download';
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
    // Limite de downloads por dia
    const DAILY_DOWNLOAD_LIMIT = 50;
    const { data: session } = useSession();
    const user = session?.user;

    // Carrega likes do usuário ao montar (deve vir após a declaração de user)
    useEffect(() => {
        if (!user?.id) return;
        fetchLikes();
    }, [user?.id]);
    // Quantos downloads o usuário já fez hoje (do contexto, ou do status)
    const [downloadsToday, setDownloadsToday] = useState(0);
    const downloadsLeft = Math.max(DAILY_DOWNLOAD_LIMIT - downloadsToday, 0);
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
        if (h > 0) return `${h}h ${m}m`;
        if (m > 0) return `${m}m ${s}s`;
        return `${s}s`;
    };


    // Função real para baixar música
    const handleDownload = async (track: Track, confirmReDownload = false) => {
        try {
            // Chama a API para registrar o download e validar VIP/limite
            const res = await fetch('/api/downloads', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ trackId: track.id, confirmReDownload })
            });
            const data = await res.json();
            if (res.status === 202 && data.needsConfirmation) {
                // Precisa de confirmação para re-download
                if (window.confirm(data.message || 'Você já baixou esta música hoje. Deseja baixar novamente?')) {
                    await handleDownload(track, true);
                }
                return;
            }
            if (res.status === 429) {
                setNotification({ message: data?.message || 'Limite diário de downloads atingido.', type: 'error' });
                return;
            }
            if (!res.ok) {
                setNotification({ message: data?.message || data?.error || 'Erro ao baixar música.', type: 'error' });
                return;
            }
            // Se permitido, faz o download forçado via fetch blob
            if (track.downloadUrl) {
                const fileRes = await fetch(track.downloadUrl);
                if (!fileRes.ok) {
                    setNotification({ message: 'Erro ao baixar arquivo da música.', type: 'error' });
                    return;
                }
                const blob = await fileRes.blob();
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', `${track.artist} - ${track.songName}.mp3`);
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                window.URL.revokeObjectURL(url);
            } else {
                setNotification({ message: 'URL de download não disponível.', type: 'error' });
            }
            // Atualiza contadores locais após sucesso
            setDownloadsToday((prev: number) => Math.min((data.dailyDownloadCount ?? prev + 1), DAILY_DOWNLOAD_LIMIT));
            if (data.downloadedTrackIds) {
                setDownloadedTracksSet(new Set(data.downloadedTrackIds));
            }
        } catch (err) {
            setNotification({ message: 'Erro ao baixar música.', type: 'error' });
        }
    };

    // Toast visual para notificações
    const [toast, setToast] = useState<{ message: string; type: string } | null>(null);
    const setNotification = (notif: { message: string; type: string }) => {
        setToast(notif);
        setTimeout(() => setToast(null), 4000);
    };

    // Função para tocar/pausar música usando o contexto global
    const { playTrack: playTrackContext, togglePlayPause, currentTrack, isPlaying } = useAppContext();
    const handlePlayPauseClick = (track: Track) => {
        if (currentTrack?.id === track.id && isPlaying) {
            togglePlayPause();
        } else {
            playTrackContext(track);
        }
    };

    // Função para verificar se pode baixar agora (restrição de 24h)
    const canDownloadNow = (trackId: number) => {
        if (!downloadedTracksTime[trackId]) return true;
        return downloadedTracksTime[trackId] <= 0;
    };

    // Função para download
    const handleDownloadClick = (track: Track) => {
        if (hasDownloadedBefore(track.id) && !canDownloadNow(track.id)) {
            setNotification({
                message: `Você já baixou esta música nas últimas 24h. Aguarde ${formatTimeLeft(downloadedTracksTime[track.id] || 0)} para baixar novamente!`,
                type: 'error'
            });
            return;
        }
        if (downloadsLeft <= 0) {
            setNotification({ message: 'Limite diário de downloads atingido. Tente novamente amanhã.', type: 'error' });
            return;
        }
        if (!canDownloadNow(track.id)) {
            setNotification({
                message: `Você já baixou esta música nas últimas 24h. Aguarde ${formatTimeLeft(downloadedTracksTime[track.id] || 0)} para baixar novamente!`,
                type: 'error'
            });
            return;
        }
        if (onDownload) {
            onDownload([track]);
        }
    };

    // Função para baixar novamente
    const downloadTrack = async (track: Track) => {
        if (hasDownloadedBefore(track.id) && !canDownloadNow(track.id)) {
            setNotification({
                message: `Você já baixou esta música nas últimas 24h. Aguarde ${formatTimeLeft(downloadedTracksTime[track.id] || 0)} para baixar novamente!`,
                type: 'error'
            });
            setShowRestrict24hModal({ track: null, open: false });
            return;
        }
        await handleDownload(track);
        setDownloadsToday((prev: number) => Math.min(prev + 1, DAILY_DOWNLOAD_LIMIT));
        setNotification({
            message: `Música "${track.songName}" baixada com sucesso!\nVocê pode baixar até ${DAILY_DOWNLOAD_LIMIT} músicas por dia. Restam ${Math.max(downloadsLeft - 1, 0)} downloads hoje.`,
            type: 'success'
        });
        setShowRestrict24hModal({ track: null, open: false });
    };

    // Função para curtir/descurtir (persistente)
    const handleLikeClick = async (trackId: number) => {
        if (!user?.id || liking) return;
        setLiking(trackId);
        const alreadyLiked = likedTracksSet.has(trackId);
        try {
            const res = await fetch('/api/likes', {
                method: alreadyLiked ? 'DELETE' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ trackId: Number(trackId) })
            });
            const data = await res.json();
            if (res.ok) {
                await fetchLikes();
                setNotification({ message: data?.message || (alreadyLiked ? 'Like removido' : 'Like adicionado'), type: 'success' });
            } else {
                setNotification({ message: data?.error || 'Erro ao atualizar favorito.', type: 'error' });
            }
        } catch (err) {
            setNotification({ message: 'Erro ao atualizar favorito.', type: 'error' });
        }
        setTimeout(() => setLiking(null), 400);
    };

    // Função para reportar
    const handleReportClick = (track: Track) => {
        setNotification({ message: `Reportado problema na música: ${track.songName}`, type: 'info' });
    };

    // Função para copyright
    const handleCopyrightClick = (track: Track) => {
        setNotification({ message: `Reportado copyright na música: ${track.songName}`, type: 'info' });
    };

    // Função para verificar se já baixou
    const hasDownloadedBefore = (trackId: number) => {
        return downloadedTracksSet.has(trackId);
    };

    // Buscar contador real do backend ao carregar ou trocar de usuário
    useEffect(() => {
        let cancelled = false;
        if (!user?.id) return;
        const fetchDailyDownloadCount = async () => {
            try {
                const res = await fetch('/api/user-data');
                if (!res.ok) return;
                const data = await res.json();
                if (cancelled) return;
                if (data.user && typeof data.user.dailyDownloadCount === 'number') {
                    setDownloadsToday(data.user.dailyDownloadCount);
                } else if (typeof data.downloadedTrackIds?.length === 'number') {
                    setDownloadsToday(data.downloadedTrackIds.length);
                }
                if (Array.isArray(data.downloadedTrackIds)) {
                    setDownloadedTracksSet(new Set(data.downloadedTrackIds.map((t: any) => typeof t === 'object' ? t.id : t)));
                    const now = Date.now();
                    const times: { [trackId: number]: number } = {};
                    data.downloadedTrackIds.forEach((t: any) => {
                        if (typeof t === 'object' && t.lastDownloadedAt) {
                            const last = new Date(t.lastDownloadedAt).getTime();
                            const left = Math.max(0, Math.floor((last + 86400000 - now) / 1000));
                            times[t.id] = left;
                        }
                    });
                    setDownloadedTracksTime(times);
                } else {
                    setDownloadedTracksSet(new Set());
                    setDownloadedTracksTime({});
                }
            } catch (err) { }
        };
        fetchDailyDownloadCount();
        return () => { cancelled = true; }
    }, [user?.id]);

    return (
        <div className="relative w-full h-full">
            <style jsx global>{`
                @import url('https://fonts.googleapis.com/css2?family=Lato:wght@400;700&display=swap');
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700&display=swap');
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
                    {downloadsLeft > 0 ? (
                        <>
                            <span style={{ color: '#fff' }}>Você pode baixar até {DAILY_DOWNLOAD_LIMIT} músicas por dia. </span>
                            <span style={{ color: '#39FF14', marginLeft: 6 }}>Restam {downloadsLeft} downloads hoje.</span>
                        </>
                    ) : (
                        <span>Limite diário de downloads atingido. Tente novamente amanhã.</span>
                    )}
                </div>
            )}

            {toast && (
                <div
                    className={`fixed top-4 left-1/2 z-50 transform -translate-x-1/2 px-6 py-3 rounded-lg shadow-lg text-white font-semibold text-sm flex items-center gap-3
                        ${toast.type === 'success' ? 'bg-green-600' : toast.type === 'error' ? 'bg-red-700' : 'bg-blue-600'}`}
                    style={{ minWidth: 260, maxWidth: 400, letterSpacing: 0.2, fontFamily: 'Inter, sans-serif' }}
                >
                    {toast.type === 'success' && <span style={{ fontSize: 18 }}>✔️</span>}
                    {toast.type === 'error' && <span style={{ fontSize: 18 }}>❌</span>}
                    {toast.type === 'info' && <span style={{ fontSize: 18 }}>ℹ️</span>}
                    <span style={{ whiteSpace: 'pre-line' }}>{toast.message}</span>
                </div>
            )}

            <GlobalAudioPlayer />

            <div
                className="bg-black rounded-2xl overflow-auto shadow-2xl border border-gray-800 mt-2 custom-scrollbar"
                style={{
                    maxHeight: '70vh',
                    scrollbarWidth: 'thin',
                    scrollbarColor: '#3b82f6 #18181b',
                    fontFamily: "'Inter', sans-serif"
                }}
            >
                {/* Desktop Table */}
                <table className="hidden md:table min-w-full text-left text-sm text-gray-200 table-fixed" style={{ fontFamily: "'Inter', sans-serif", fontSize: '13px' }}>
                    <thead className="sticky top-0 z-40 bg-gradient-to-r from-gray-900 to-black text-gray-300 uppercase text-xs tracking-wider border-b border-gray-700" style={{ fontFamily: "'Inter', sans-serif" }}>
                        <tr>
                            <th className="px-6 py-4 font-bold tracking-wide w-[44%] text-white">
                                <div className="flex items-center space-x-2">
                                    <Music className="h-4 w-4 text-blue-400" />
                                    <span>MÚSICA</span>
                                </div>
                            </th>
                            <th className="px-6 py-4 font-bold tracking-wide w-1/3 text-white">
                                <span>ARTISTA</span>
                            </th>
                            <th className="px-6 py-4 font-bold tracking-wide w-1/3 text-white">
                                <span>GÊNERO</span>
                            </th>
                            <th className="px-6 py-4 text-right font-bold tracking-wide w-[140px] text-white">
                                <span>AÇÕES</span>
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800" style={{ fontFamily: "'Inter', sans-serif" }}>
                        {tracks.length === 0 && (
                            <tr>
                                <td colSpan={4} className="text-center py-16 text-gray-400">
                                    <p>Nenhuma música encontrada.</p>
                                </td>
                            </tr>
                        )}
                        {tracks.map((track: Track) => (
                            <tr
                                key={track.id}
                                className={`${currentTrack?.id === track.id ? 'bg-blue-900/20 border-l-4 border-l-blue-500' : 'hover:border-l-4 hover:border-l-gray-600'}`}
                            >
                                <td className="px-6 py-4 align-middle w-[50%]">
                                    <div className="flex items-center gap-4">
                                        <div className="relative w-14 h-14 group">
                                            <img
                                                src="https://i.ibb.co/FL1rxTtx/20250526-1938-Sound-Cloud-Cover-Design-remix-01jw7bwxq6eqj8sqztah5n296g.png"
                                                alt={track.songName + ' thumbnail'}
                                                className="w-14 h-14 rounded-xl object-cover border border-gray-700 shadow-lg group-hover:border-blue-500 transition-all duration-300"
                                            />
                                            <button
                                                onClick={() => handlePlayPauseClick(track)}
                                                className={`absolute inset-0 flex items-center justify-center rounded-xl transition-all duration-300 cursor-pointer bg-black/60 hover:bg-blue-600/80 backdrop-blur-sm ${currentTrack?.id === track.id && isPlaying
                                                    ? 'text-white bg-blue-600/80'
                                                    : 'text-gray-200 hover:text-white'
                                                    }`}
                                                style={{ zIndex: 2 }}
                                            >
                                                {isPlaying && currentTrack?.id === track.id ?
                                                    <Pause size={24} /> :
                                                    <Play size={24} className="ml-1" />
                                                }
                                            </button>
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="font-semibold text-white tracking-wide" style={{ fontSize: '11px' }}>
                                                {track.songName}
                                            </span>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 align-middle w-[30%]">
                                    <span className="text-gray-300 font-medium tracking-wide block" style={{ fontSize: '11px' }}>
                                        {track.artist}
                                    </span>
                                </td>
                                <td className="px-6 py-4 align-middle w-1/3">
                                    <span className="inline-flex items-center px-3 py-2 rounded-full text-xs font-bold bg-gradient-to-r from-purple-600 to-blue-600 text-white border border-purple-500/30 tracking-wide shadow-lg" style={{ fontSize: '11px' }}>
                                        {track.style}
                                    </span>
                                </td>
                                <td className="px-6 py-4 align-middle w-[180px]">
                                    {session ? (
                                        <div className="flex flex-row flex-nowrap items-center justify-end gap-2 min-w-[170px] space-x-2">
                                            {/* Download */}
                                            <button
                                                onClick={() => handleDownload(track)}
                                                disabled={
                                                    !session?.user?.is_vip ||
                                                    (hasDownloadedBefore(track.id) && downloadedTracksTime[track.id] > 0)
                                                }
                                                className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold transition-all duration-300 min-w-[85px] justify-center cursor-pointer tracking-wide shadow-lg
                                                    ${!session?.user?.is_vip
                                                        ? 'bg-gray-700 text-gray-400 opacity-50 cursor-not-allowed'
                                                        : hasDownloadedBefore(track.id)
                                                            ? downloadedTracksTime[track.id] > 0
                                                                ? 'bg-blue-600 text-white border border-blue-500 shadow-blue-500/25 opacity-60 cursor-not-allowed'
                                                                : 'bg-blue-600 text-white hover:bg-blue-700 border border-blue-500 shadow-blue-500/25'
                                                            : 'bg-green-600 text-white hover:bg-green-700 border border-green-500 shadow-green-500/25'
                                                    }`}
                                                style={{ fontSize: '11px' }}
                                                title={
                                                    !session?.user?.is_vip ? 'Apenas usuários VIP podem fazer downloads'
                                                        : hasDownloadedBefore(track.id)
                                                            ? downloadedTracksTime[track.id] > 0
                                                                ? `Aguarde ${formatTimeLeft(downloadedTracksTime[track.id] || 0)} para baixar novamente`
                                                                : 'Baixar novamente'
                                                            : "Download disponível"
                                                }
                                            >
                                                <Download size={16} />
                                                <span>{getDownloadButtonText(track.id)}</span>
                                            </button>
                                            {/* Curtir */}
                                            <button
                                                onClick={() => handleLikeClick(track.id)}
                                                disabled={!session?.user?.is_vip || liking === track.id}
                                                className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold transition-all duration-300 min-w-[60px] justify-center cursor-pointer tracking-wide shadow-lg
                                                    ${likedTracksSet.has(track.id)
                                                        ? 'bg-pink-600 text-white border border-pink-500 shadow-pink-500/25'
                                                        : 'bg-gray-700 text-gray-200 hover:bg-pink-700 border border-gray-500 shadow-gray-500/25'
                                                    }`}
                                                style={{ fontSize: '11px' }}
                                                title={likedTracksSet.has(track.id) ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
                                            >
                                                <Heart size={16} className={likedTracksSet.has(track.id) ? 'fill-pink-400 text-pink-200' : 'text-gray-300'} />
                                                <span>{likedTracksSet.has(track.id) ? 'Curtido' : 'Curtir'}</span>
                                            </button>
                                            {/* Reportar erro */}
                                            <button
                                                onClick={() => handleReportClick(track)}
                                                className="inline-flex items-center justify-center px-3 py-2 rounded-lg text-xs font-bold transition-all duration-300 min-w-[38px] cursor-pointer tracking-wide shadow-lg bg-yellow-700 text-white hover:bg-yellow-800 border border-yellow-500 shadow-yellow-500/25"
                                                style={{ fontSize: '11px' }}
                                                title="Reportar problema com a música"
                                            >
                                                <AlertTriangle size={16} />
                                            </button>
                                            {/* Copyright */}
                                            <button
                                                onClick={() => handleCopyrightClick(track)}
                                                className="inline-flex items-center justify-center px-3 py-2 rounded-lg text-xs font-bold transition-all duration-300 min-w-[38px] cursor-pointer tracking-wide shadow-lg bg-gray-800 text-white hover:bg-purple-800 border border-purple-500 shadow-purple-500/25"
                                                style={{ fontSize: '11px' }}
                                                title="Reportar copyright"
                                            >
                                                <Copyright size={16} />
                                            </button>
                                        </div>
                                    ) : (
                                        <Link href="/planos" className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all duration-300 cursor-pointer tracking-wide shadow-lg bg-blue-600 text-white hover:bg-blue-700 border border-blue-500 shadow-blue-500/25">
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
                                    <span className="font-bold text-white text-base truncate">{track.songName}</span>
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
                                    title={!session?.user?.is_vip ? 'Apenas usuários VIP podem fazer downloads' : hasDownloadedBefore(track.id) ? downloadedTracksTime[track.id] > 0 ? `Aguarde ${formatTimeLeft(downloadedTracksTime[track.id] || 0)} para baixar novamente` : 'Baixar novamente' : "Download disponível"}
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
                                {/* Reportar erro */}
                                <button
                                    onClick={() => handleReportClick(track)}
                                    className="flex-1 flex items-center justify-center gap-2 px-3 py-3 rounded-xl text-sm font-bold transition-all duration-300 cursor-pointer tracking-wide shadow-lg bg-yellow-700 text-white hover:bg-yellow-800 border border-yellow-500 shadow-yellow-500/25"
                                    style={{ fontSize: '15px' }}
                                    title="Reportar problema com a música"
                                >
                                    <AlertTriangle size={20} />
                                </button>
                                {/* Copyright */}
                                <button
                                    onClick={() => handleCopyrightClick(track)}
                                    className="flex-1 flex items-center justify-center gap-2 px-3 py-3 rounded-xl text-sm font-bold transition-all duration-300 cursor-pointer tracking-wide shadow-lg bg-gray-800 text-white hover:bg-purple-800 border border-purple-500 shadow-purple-500/25"
                                    style={{ fontSize: '15px' }}
                                    title="Reportar copyright"
                                >
                                    <Copyright size={20} />
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