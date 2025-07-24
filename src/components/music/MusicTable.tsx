// src/components/music/MusicTable.tsx
"use client";

import { useAppContext } from '@/context/AppContext';
import { Track } from '@/types/track';
import { AlertTriangle, Copyright, Download, Heart, Music, Pause, Play } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useEffect, useMemo, useState } from 'react';

interface MusicTableProps {
    tracks: Track[];
}

const MusicTable = ({ tracks }: MusicTableProps) => {
    const { playTrack, currentTrack, isPlaying, togglePlayPause, handleDownload, downloadedTracks, handleLike, likedTracks: contextLikedTracks } = useAppContext();
    const { data: session } = useSession();
    const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' | 'warning' } | null>(null);
    const [loadingDownloadStatus, setLoadingDownloadStatus] = useState(true);

    const user = session?.user;

    // Estados para controle de download
    const [downloadStatus, setDownloadStatus] = useState<{ [trackId: number]: { canDownload: boolean; hasDownloaded: boolean; nextAllowedDownload?: string } }>({});
    const [timeLeft, setTimeLeft] = useState<{ [trackId: number]: string }>({});

    // Converter array do contexto para Set para facilitar verificações
    const likedTracksSet = new Set(contextLikedTracks);
    const downloadedTracksSet = new Set(downloadedTracks);

    // Memoizar IDs dos tracks para evitar loops infinitos no useEffect
    const trackIds = useMemo(() =>
        tracks.map(track => track.id).join(','),
        [tracks]
    );

    // Função para calcular tempo restante
    const calculateTimeLeft = (nextAllowedDownload: string): string => {
        const now = new Date().getTime();
        const nextAllowed = new Date(nextAllowedDownload).getTime();
        const diff = nextAllowed - now;

        if (diff <= 0) return "Disponível";

        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

        // Mostrar apenas o maior valor para economizar espaço
        if (hours > 0) {
            return `${hours}h`;
        }
        return `${minutes}m`;
    };

    // Atualizar timer a cada minuto

    useEffect(() => {
        const interval = setInterval(() => {
            const newTimeLeft: { [trackId: number]: string } = {};
            Object.entries(downloadStatus).forEach(([trackId, status]) => {
                if (!status.canDownload && status.nextAllowedDownload) {
                    newTimeLeft[parseInt(trackId)] = calculateTimeLeft(status.nextAllowedDownload);
                }
            });
            setTimeLeft(newTimeLeft);
        }, 60000); // Atualizar a cada minuto
        return () => clearInterval(interval);
    }, [downloadStatus]);

    // Carregar status de download para cada track
    useEffect(() => {
        const loadDownloadStatus = async () => {
            if (!session?.user) {
                setLoadingDownloadStatus(false);
                return;
            }

            // Se não há tracks, limpar estados e finalizar
            if (!tracks || tracks.length === 0) {
                setDownloadStatus({});
                setTimeLeft({});
                setLoadingDownloadStatus(false);
                return;
            }

            setLoadingDownloadStatus(true);

            try {
                // Usar API otimizada para verificar múltiplos tracks de uma vez
                const trackIds = tracks.map(track => track.id);

                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s timeout

                const response = await fetch('/api/downloads/batch-control', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ trackIds }),
                    signal: controller.signal
                });

                clearTimeout(timeoutId);

                if (!response.ok) {
                    console.warn(`Erro ${response.status} ao verificar status dos tracks`);
                    // Fallback: usar valores padrão
                    const fallbackStatus: any = {};
                    tracks.forEach(track => {
                        fallbackStatus[track.id] = {
                            canDownload: true,
                            hasDownloaded: false,
                            nextAllowedDownload: undefined
                        };
                    });
                    setDownloadStatus(fallbackStatus);
                    return;
                }

                const batchResult = await response.json();

                // Converter para o formato esperado
                const statusMap: any = {};
                Object.entries(batchResult).forEach(([trackId, status]: [string, any]) => {
                    statusMap[parseInt(trackId)] = {
                        canDownload: status.canDownload ?? true,
                        hasDownloaded: status.hasDownloaded ?? false,
                        nextAllowedDownload: status.nextAllowedDownload
                    };
                });

                setDownloadStatus(statusMap);

                // Calcular tempo inicial
                const initialTimeLeft: { [trackId: number]: string } = {};
                Object.entries(batchResult).forEach(([trackId, status]: [string, any]) => {
                    if (!status.canDownload && status.nextAllowedDownload) {
                        initialTimeLeft[parseInt(trackId)] = calculateTimeLeft(status.nextAllowedDownload);
                    }
                });
                setTimeLeft(initialTimeLeft);

            } catch (error) {
                if (error instanceof Error && error.name === 'AbortError') {
                    console.warn('Timeout ao verificar status dos tracks');
                } else {
                    console.error('Erro geral ao carregar status de downloads:', error);
                }

                // Fallback: usar valores padrão para todos os tracks
                const fallbackStatus: any = {};
                tracks.forEach(track => {
                    fallbackStatus[track.id] = {
                        canDownload: true,
                        hasDownloaded: false,
                        nextAllowedDownload: undefined
                    };
                });
                setDownloadStatus(fallbackStatus);
            } finally {
                setLoadingDownloadStatus(false);
            }
        };

        loadDownloadStatus();
    }, [trackIds, session?.user?.id]);    // Função para verificar se pode baixar usando o estado do banco
    const canDownload = (trackId: number) => {
        return downloadStatus[trackId]?.canDownload ?? true;
    };

    // Função para verificar se já foi baixado
    const hasDownloaded = (trackId: number) => {
        return downloadStatus[trackId]?.hasDownloaded ?? false;
    };

    // Função para obter o texto do timer
    const getTimerText = (trackId: number) => {
        if (canDownload(trackId)) return 'Baixar';
        return timeLeft[trackId] || 'Calculando...';
    }; const showNotification = (message: string, type: 'success' | 'error' | 'warning' = 'success') => {
        setNotification({ message, type });
        setTimeout(() => setNotification(null), 3000);
    };

    const handlePlayClick = (track: Track) => {
        if (!session) {
            showNotification('Você precisa estar logado para usar o player', 'warning');
            return;
        }

        if (!session.user.is_vip) {
            showNotification('Apenas usuários VIP podem usar o player', 'warning');
            return;
        }

        if (currentTrack?.id === track.id) {
            togglePlayPause();
        } else {
            playTrack(track, tracks);
        }
    };

    const handleLikeClick = async (trackId: number) => {
        if (!session) {
            showNotification('Você precisa estar logado para curtir músicas', 'warning');
            return;
        }

        try {
            // Usar apenas a função do contexto que já faz a chamada da API
            await handleLike(trackId);
        } catch (error) {
            console.error('Erro ao processar like:', error);
            showNotification('Erro ao processar like', 'error');
        }
    }; const handleDownloadClick = async (track: Track) => {
        if (!session) {
            showNotification('Você precisa estar logado para baixar músicas', 'warning');
            return;
        }

        try {
            const response = await fetch('/api/download', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    trackId: track.id
                }),
            });

            const data = await response.json();

            if (response.ok) {
                showNotification(`Download autorizado! ${data.remainingDownloads} downloads restantes hoje.`, 'success');

                // Atualizar o estado local
                setDownloadStatus(prev => ({
                    ...prev,
                    [track.id]: {
                        canDownload: true,
                        hasDownloaded: true
                    }
                }));

                // Iniciar o download real
                await handleDownload(track);
            } else {
                if (response.status === 429) {
                    showNotification(`Limite diário atingido: ${data.used}/${data.limit} downloads`, 'warning');
                } else {
                    showNotification(data.error || 'Erro ao processar download', 'error');
                }
            }
        } catch (error) {
            console.error('Erro no download:', error);
            showNotification('Erro ao processar download', 'error');
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
                    track: {
                        id: track.id,
                        songName: track.songName,
                        artist: track.artist,
                        imageUrl: track.imageUrl
                    },
                    user: user?.email || 'Anonymous',
                    timestamp: new Date().toISOString()
                }),
            });

            if (response.ok) {
                showNotification('Denúncia de direitos autorais enviada com sucesso!', 'success');
            } else {
                showNotification('Falha ao enviar denúncia de direitos autorais', 'error');
            }
        } catch (error) {
            console.error('Error submitting copyright report:', error);
            showNotification('Erro ao enviar denúncia de direitos autorais', 'error');
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
                    track: {
                        id: track.id,
                        songName: track.songName,
                        artist: track.artist,
                        imageUrl: track.imageUrl
                    },
                    user: user?.email || 'Anonymous',
                    timestamp: new Date().toISOString(),
                    issue: 'Track offline/not working'
                }),
            });

            if (response.ok) {
                showNotification('Relatório enviado com sucesso!', 'success');
            } else {
                showNotification('Falha ao enviar relatório', 'error');
            }
        } catch (error) {
            console.error('Error submitting report:', error);
            showNotification('Erro ao enviar relatório', 'error');
        }
    };

    return (
        <>
                <div className="w-full overflow-hidden">
                    {notification && (
                        <div className={`w-full mb-4 px-4 py-3 rounded-lg shadow text-white text-center font-semibold ${notification.type === 'success' ? 'bg-blue-600' : notification.type === 'error' ? 'bg-red-600' : 'bg-blue-600'}`}
                            style={{ position: 'relative', top: 0, left: 0, zIndex: 10 }}>
                            {notification.message}
                        </div>
                    )}
                    <table className="min-w-full text-left text-sm text-gray-200 table-fixed" style={{ backgroundColor: '#202124' }}>
                    <thead style={{ backgroundColor: '#2d2f32' }} className="text-gray-300 uppercase text-xs tracking-wider border-b border-gray-600">
                        <tr>
                            <th className="px-4 py-3 font-sans font-semibold tracking-wide w-1/3">Música</th>
                            <th className="px-4 py-3 font-sans font-semibold tracking-wide w-1/3">Artista</th>
                            <th className="px-4 py-3 font-sans font-semibold tracking-wide w-1/3">Gênero</th>
                            <th className="px-4 py-3 text-right font-sans font-semibold tracking-wide w-[120px]">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700">
                        {/* Estado de carregamento */}
                        {loadingDownloadStatus && tracks.length > 0 && (
                            <tr>
                                <td colSpan={2} className="text-center py-8 text-gray-400">
                                    <div className="flex flex-col items-center gap-3">
                                        <div className="animate-spin w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                                        <p className="text-sm">Carregando informações de download...</p>
                                    </div>
                                </td>
                            </tr>
                        )}

                        {/* Mensagem quando não há tracks */}
                        {tracks.length === 0 && !loadingDownloadStatus && (
                            <tr>
                                <td colSpan={2} className="text-center py-12 text-gray-400">
                                    <div className="flex flex-col items-center gap-3">
                                        <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center">
                                            <Music size={24} className="text-gray-600" />
                                        </div>
                                        <div>
                                            <p className="text-lg font-medium">Nenhuma música encontrada</p>
                                            <p className="text-sm text-gray-500">Tente ajustar os filtros de busca ou aguarde o carregamento</p>
                                        </div>
                                    </div>
                                </td>
                            </tr>
                        )}

                        {/* Renderizar tracks apenas quando não está carregando */}
                        {!loadingDownloadStatus && tracks.map((track, index) => (
                            <tr
                                key={track.id}
                                className={`transition-all duration-200 group border-b border-gray-700/50 ${currentTrack?.id === track.id ? 'bg-green-600/10' : ''}`}
                                style={{ backgroundColor: currentTrack?.id === track.id ? 'rgba(34, 197, 94, 0.1)' : '#202124' }}
                            >
                                {/* Música */}
                                <td className="px-4 py-3 align-middle w-1/3">
                                    <div className="flex items-center gap-3">
                                        <div className="relative w-12 h-12">
                                            {track.imageUrl && (
                                                <img
                                                    src={track.imageUrl}
                                                    alt={track.songName + ' thumbnail'}
                                                    className="w-12 h-12 rounded-lg object-cover border border-gray-700 shadow"
                                                />
                                            )}
                                            <button
                                                onClick={() => handlePlayClick(track)}
                                                className={`absolute inset-0 flex items-center justify-center rounded-lg transition-all duration-200 cursor-pointer bg-black/40 hover:bg-green-700/60 ${currentTrack?.id === track.id && isPlaying
                                                    ? 'text-white'
                                                    : 'text-gray-200'
                                                    }`}
                                                style={{ zIndex: 2 }}
                                            >
                                                {isPlaying && currentTrack?.id === track.id ?
                                                    <Pause size={20} /> :
                                                    <Play size={20} className="ml-0.5" />
                                                }
                                            </button>
                                        </div>
                                        <span className="font-normal text-white tracking-wide" style={{ fontSize: '13px', fontWeight: 400 }}>
                                            {track.songName}
                                        </span>
                                    </div>
                                </td>
                                {/* Artista */}
                                <td className="px-4 py-3 align-middle w-1/3">
                                    <span className="text-gray-300 font-light tracking-wide block" style={{ fontSize: '12px', fontWeight: 300 }}>
                                        {track.artist}
                                    </span>
                                </td>
                                {/* Gênero */}
                                <td className="px-4 py-3 align-middle w-1/3">
                                    <span className="inline-flex items-center px-2 py-1 rounded text-[10px] font-sans font-bold bg-gray-800 text-gray-300 border border-gray-700 tracking-wide">
                                        {track.style}
                                    </span>
                                </td>
                                {/* Ações */}
                                <td className="px-4 py-3 align-middle w-[120px]">
                                    <div className="flex items-center justify-end gap-2">
                                        {/* Botão de download */}
                                        <button
                                            onClick={() => handleDownload(track)}
                                            disabled={!downloadStatus[track.id]?.canDownload}
                                            className={`inline-flex items-center gap-1 px-3 py-1.5 rounded text-xs font-sans font-semibold transition-all duration-200 min-w-[75px] justify-center cursor-pointer tracking-wide ${downloadStatus[track.id]?.hasDownloaded
                                                ? downloadStatus[track.id]?.canDownload
                                                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                                                    : 'bg-blue-400 text-white opacity-50 cursor-not-allowed'
                                                : 'bg-gray-600 text-white hover:bg-green-700'
                                                }`}
                                            title={
                                                !session?.user?.is_vip
                                                    ? 'Apenas usuários VIP podem fazer downloads'
                                                    : downloadStatus[track.id]?.hasDownloaded
                                                        ? downloadStatus[track.id]?.canDownload
                                                            ? "Clique para baixar novamente"
                                                            : `Aguarde ${timeLeft[track.id] || 'calculando...'} para baixar novamente`
                                                        : "Download disponível"
                                            }
                                        >
                                            <Download size={12} />
                                            {!session?.user?.is_vip
                                                ? 'VIP'
                                                : downloadStatus[track.id]?.hasDownloaded
                                                    ? timeLeft[track.id] || 'Baixar'
                                                    : 'Baixar'
                                            }
                                        </button>
                                        {/* Botão de curtir */}
                                        <button
                                            onClick={() => handleLike(track.id)}
                                            disabled={!session?.user?.is_vip}
                                            className={`inline-flex items-center gap-1 px-3 py-1.5 rounded text-xs font-sans font-semibold transition-all duration-200 min-w-[80px] justify-center cursor-pointer tracking-wide ${!session?.user?.is_vip
                                                ? 'bg-gray-500 text-gray-300 opacity-50 cursor-not-allowed'
                                                : likedTracksSet.has(track.id)
                                                    ? 'bg-blue-600 text-white hover:bg-blue-700 border border-blue-500'
                                                    : 'bg-gray-600 text-white hover:bg-blue-600 border border-gray-500'
                                                }`}
                                            title={
                                                !session?.user?.is_vip
                                                    ? 'Apenas usuários VIP podem curtir músicas'
                                                    : likedTracksSet.has(track.id)
                                                        ? 'Remover dos favoritos'
                                                        : 'Adicionar aos favoritos'
                                            }
                                        >
                                            <Heart size={12} className={likedTracksSet.has(track.id) ? 'fill-blue-200 text-blue-200' : 'text-gray-300'} />
                                            {!session?.user?.is_vip
                                                ? 'VIP'
                                                : likedTracksSet.has(track.id)
                                                    ? 'Favorito'
                                                    : 'Curtir'
                                            }
                                        </button>
                                        {/* Botão de reportar */}
                                        <button
                                            onClick={() => handleReportClick(track)}
                                            className={`inline-flex items-center gap-1 px-3 py-1.5 rounded text-xs font-sans font-semibold transition-all duration-200 min-w-[40px] justify-center cursor-pointer tracking-wide bg-green-600 text-white hover:bg-green-700 border border-green-500`}
                                            title="Reportar problema com a música"
                                        >
                                            <AlertTriangle size={14} />
                                        </button>
                                        {/* Botão de copyright */}
                                        <button
                                            onClick={() => handleCopyrightClick(track)}
                                            className={`inline-flex items-center gap-1 px-3 py-1.5 rounded text-xs font-sans font-semibold transition-all duration-200 min-w-[40px] justify-center cursor-pointer tracking-wide bg-gray-700 text-gray-100 hover:bg-gray-800 border border-gray-600`}
                                            title="Reportar problema de copyright"
                                        >
                                            <Copyright size={14} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </>
    );
};

export default MusicTable;