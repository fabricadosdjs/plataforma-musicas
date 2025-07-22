// src/components/music/MusicTable.tsx
"use client";

import { useAppContext } from '@/context/AppContext';
import { Track } from '@/types/track';
import { AlertTriangle, Copyright, Download, Heart, Music, Pause, Play } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';

interface MusicTableProps {
    tracks: Track[];
}

const MusicTable = ({ tracks }: MusicTableProps) => {
    const { playTrack, currentTrack, isPlaying, togglePlayPause, handleDownload, downloadedTracks, handleLike, likedTracks: contextLikedTracks, isUserDataLoaded } = useAppContext();
    const { data: session } = useSession();
    const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' | 'warning' } | null>(null);

    const user = session?.user;

    // Estados para controle de download
    const [downloadStatus, setDownloadStatus] = useState<{ [trackId: number]: { canDownload: boolean; hasDownloaded: boolean; nextAllowedDownload?: string } }>({});
    const [timeLeft, setTimeLeft] = useState<{ [trackId: number]: string }>({});

    // Converter array do contexto para Set para facilitar verificações
    const likedTracksSet = new Set(contextLikedTracks);
    const downloadedTracksSet = new Set(downloadedTracks);

    // Função para calcular tempo restante
    const calculateTimeLeft = (nextAllowedDownload: string): string => {
        const now = new Date().getTime();
        const nextAllowed = new Date(nextAllowedDownload).getTime();
        const diff = nextAllowed - now;

        if (diff <= 0) return "Disponível";

        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

        if (hours > 0) {
            return `${hours}h ${minutes}m`;
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
            if (!session?.user) return;

            const statusPromises = tracks.map(async (track) => {
                try {
                    const response = await fetch(`/api/downloads/control?trackId=${track.id}`);
                    const data = await response.json();
                    return {
                        trackId: track.id,
                        canDownload: data.canDownload,
                        hasDownloaded: data.hasDownloaded,
                        nextAllowedDownload: data.nextAllowedDownload
                    };
                } catch (error) {
                    console.error(`Erro ao verificar status do track ${track.id}:`, error);
                    return {
                        trackId: track.id,
                        canDownload: true,
                        hasDownloaded: false,
                        nextAllowedDownload: undefined
                    };
                }
            });

            const statuses = await Promise.all(statusPromises);
            const statusMap = statuses.reduce((acc, status) => {
                acc[status.trackId] = {
                    canDownload: status.canDownload,
                    hasDownloaded: status.hasDownloaded,
                    nextAllowedDownload: status.nextAllowedDownload
                };
                return acc;
            }, {} as { [trackId: number]: { canDownload: boolean; hasDownloaded: boolean; nextAllowedDownload?: string } });

            setDownloadStatus(statusMap);

            // Calcular tempo inicial
            const initialTimeLeft: { [trackId: number]: string } = {};
            statuses.forEach(status => {
                if (!status.canDownload && status.nextAllowedDownload) {
                    initialTimeLeft[status.trackId] = calculateTimeLeft(status.nextAllowedDownload);
                }
            });
            setTimeLeft(initialTimeLeft);
        };

        loadDownloadStatus();
    }, [tracks, session?.user]);

    // Função para verificar se pode baixar usando o estado do banco
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
            const response = await fetch('/api/likes', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    trackId: trackId
                }),
            });

            const data = await response.json();

            if (response.ok) {
                showNotification(data.message, 'success');
                // Atualizar o contexto chamando a função do contexto
                await handleLike(trackId);
            } else {
                showNotification(data.error || 'Erro ao processar like', 'error');
            }
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
        <div className="w-full overflow-hidden">
            {notification && (
                <div className={`fixed top-20 right-6 px-4 py-3 rounded-lg shadow-lg z-50 animate-bounce text-white ${notification.type === 'success' ? 'bg-green-600' :
                    notification.type === 'error' ? 'bg-red-600' :
                        'bg-green-600'
                    }`}>
                    {notification.message}
                </div>
            )}            <table className="min-w-full text-left text-sm text-gray-200" style={{ backgroundColor: '#202124' }}>
                <thead style={{ backgroundColor: '#2d2f32' }} className="text-gray-300 uppercase text-xs tracking-wider border-b border-gray-600">
                    <tr>
                        <th className="px-4 py-3 font-semibold w-16">Play</th>
                        <th className="px-4 py-3 font-semibold">Música</th>
                        <th className="px-4 py-3 font-semibold">Artista</th>
                        <th className="px-4 py-3 font-semibold text-center">Gênero</th>
                        <th className="px-4 py-3 text-right font-semibold">Ações</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                    {tracks.length === 0 && (
                        <tr>
                            <td colSpan={5} className="text-center py-12 text-gray-400">
                                <div className="flex flex-col items-center gap-3">
                                    <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center">
                                        <Music size={24} className="text-gray-600" />
                                    </div>
                                    <div>
                                        <p className="text-lg font-medium">Nenhuma música encontrada</p>
                                        <p className="text-sm text-gray-500">Tente ajustar os filtros de busca</p>
                                    </div>
                                </div>
                            </td>
                        </tr>
                    )}
                    {tracks.map((track, index) => (
                        <tr
                            key={track.id}
                            className={`transition-all duration-200 group border-b border-gray-700/50 ${currentTrack?.id === track.id ? 'bg-green-600/10' : ''
                                }`}
                            style={{
                                backgroundColor: currentTrack?.id === track.id ? 'rgba(34, 197, 94, 0.1)' : '#202124'
                            }}
                            onMouseEnter={(e) => {
                                if (currentTrack?.id !== track.id) {
                                    e.currentTarget.style.backgroundColor = '#2d2f32';
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (currentTrack?.id !== track.id) {
                                    e.currentTarget.style.backgroundColor = '#202124';
                                }
                            }}
                        >
                            <td className="px-4 py-3">
                                <button
                                    onClick={() => handlePlayClick(track)}
                                    className={`w-10 h-10 flex items-center justify-center rounded-full transition-all duration-200 ${currentTrack?.id === track.id && isPlaying
                                        ? 'bg-green-700 text-white'
                                        : 'bg-gray-800 text-gray-400 hover:bg-green-700 hover:text-white'
                                        }`}
                                >
                                    {isPlaying && currentTrack?.id === track.id ?
                                        <Pause size={16} /> :
                                        <Play size={16} className="ml-0.5" />
                                    }
                                </button>
                            </td>

                            <td className="px-4 py-3">
                                <div>
                                    <div className="font-semibold text-white text-xs">
                                        {track.songName}
                                    </div>
                                    {currentTrack?.id === track.id && (
                                        <div className="text-xs text-green-400">
                                            {isPlaying ? '▶ Playing' : '⏸ Paused'}
                                        </div>
                                    )}
                                </div>
                            </td>

                            <td className="px-4 py-3">
                                <div className="text-gray-300 text-sm">
                                    {track.artist}
                                </div>
                            </td>

                            <td className="px-4 py-3 text-center">
                                <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-800 text-gray-300 border border-gray-700">
                                    {track.style}
                                </span>
                            </td>

                            <td className="px-4 py-3">
                                <div className="flex items-center justify-end gap-2">
                                    <button
                                        onClick={() => handleDownloadClick(track)}
                                        disabled={!canDownload(track.id)}
                                        className={`inline-flex items-center gap-1 px-3 py-1.5 rounded text-xs font-semibold transition-all duration-200 min-w-[80px] justify-center ${hasDownloaded(track.id)
                                            ? canDownload(track.id)
                                                ? 'bg-blue-600 text-white hover:bg-blue-700'
                                                : 'bg-blue-400 text-white opacity-50 cursor-not-allowed'
                                            : 'bg-gray-600 text-white hover:bg-green-700'
                                            }`}
                                        title={
                                            !session?.user?.is_vip
                                                ? 'Apenas usuários VIP podem fazer downloads'
                                                : hasDownloaded(track.id)
                                                    ? canDownload(track.id)
                                                        ? "Clique para baixar novamente"
                                                        : `Aguarde ${timeLeft[track.id] || 'calculando...'} para baixar novamente`
                                                    : "Download disponível"
                                        }
                                    >
                                        <Download size={12} />
                                        {!session?.user?.is_vip
                                            ? 'VIP'
                                            : hasDownloaded(track.id)
                                                ? getTimerText(track.id)
                                                : 'Baixar'
                                        }
                                    </button>

                                    <button
                                        onClick={() => handleLikeClick(track.id)}
                                        disabled={!session?.user?.is_vip}
                                        className={`inline-flex items-center gap-1 px-3 py-1.5 rounded text-xs font-semibold transition-all duration-200 min-w-[80px] justify-center ${!session?.user?.is_vip
                                            ? 'bg-gray-500 text-gray-300 opacity-50 cursor-not-allowed'
                                            : likedTracksSet.has(track.id)
                                                ? 'bg-blue-600 text-white hover:bg-blue-700'
                                                : 'bg-gray-600 text-white hover:bg-blue-600'
                                            }`}
                                        title={
                                            !session?.user?.is_vip
                                                ? 'Apenas usuários VIP podem curtir músicas'
                                                : likedTracksSet.has(track.id)
                                                    ? 'Remover dos favoritos'
                                                    : 'Adicionar aos favoritos'
                                        }
                                    >
                                        <Heart size={12} className={likedTracksSet.has(track.id) ? 'fill-current' : ''} />
                                        {!session?.user?.is_vip
                                            ? 'VIP'
                                            : likedTracksSet.has(track.id)
                                                ? 'Curtido'
                                                : 'Curtir'
                                        }
                                    </button>

                                    <button
                                        onClick={() => handleCopyrightClick(track)}
                                        className="inline-flex items-center justify-center w-8 h-8 bg-yellow-600 hover:bg-yellow-700 text-white rounded transition-all duration-200"
                                        title="Report Copyright"
                                    >
                                        <Copyright size={12} />
                                    </button>

                                    <button
                                        onClick={() => handleReportClick(track)}
                                        className="inline-flex items-center justify-center w-8 h-8 bg-red-600 hover:bg-red-700 text-white rounded transition-all duration-200"
                                        title="Report Offline"
                                    >
                                        <AlertTriangle size={12} />
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default MusicTable;