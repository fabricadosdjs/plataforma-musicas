"use client";

import React, { useState, useEffect } from "react";
import { Download, Trash2, Music, Clock, User, Loader2, CheckCircle, Info, Play, Pause, AlertTriangle, CreditCard } from "lucide-react";
import Link from "next/link";
import { Track } from "@/types/track";
import Header from "@/components/layout/Header";
import { useGlobalPlayer } from "@/context/GlobalPlayerContext";

import clsx from 'clsx';

export default function PlaylistPage() {
    const [playlist, setPlaylist] = useState<Track[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [downloadingTracks, setDownloadingTracks] = useState<Set<number>>(new Set());
    const [isDownloadingAll, setIsDownloadingAll] = useState(false);
    const [downloadedTracks, setDownloadedTracks] = useState<Set<number>>(new Set());
    const [creditWarning, setCreditWarning] = useState<string | null>(null);

    const { currentTrack, isPlaying, playTrack, pauseTrack, togglePlayPause } = useGlobalPlayer();
    // Sistema de créditos removido

    // TODO: Substitua por sua lógica real de autenticação/usuário VIP e créditos
    // Exemplo de mock para evitar erro de compilação:
    const isVipUser = false; // Defina como true se o usuário for VIP
    const creditInfo = { credits: 0 }; // Substitua por dados reais de créditos do usuário

    useEffect(() => {
        const savedPlaylist = localStorage.getItem("musicPlaylist");

        if (savedPlaylist) {
            try {
                const playlistData = JSON.parse(savedPlaylist);
                setPlaylist(playlistData);

                // Verificar status de downloads no servidor
                if (playlistData.length > 0) {
                    checkDownloadStatus(playlistData.map((track: Track) => track.id));
                }
            } catch (error) {
                console.error("Erro ao carregar playlist:", error);
            }
        }

        setIsLoading(false);
    }, []);

    // Função para verificar status de downloads no servidor
    const checkDownloadStatus = async (trackIds: number[]) => {
        try {
            const response = await fetch('/api/downloads/status', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ trackIds })
            });

            if (response.ok) {
                const data = await response.json();
                const downloadedIds = Object.keys(data.status)
                    .filter(trackId => data.status[trackId].downloaded)
                    .map(id => parseInt(id));

                setDownloadedTracks(new Set(downloadedIds));
                // Manter também no localStorage para compatibilidade
                localStorage.setItem("downloadedTracks", JSON.stringify(downloadedIds));

                console.log(`✅ Status verificado: ${downloadedIds.length} músicas já baixadas`);
            }
        } catch (error) {
            console.error('Erro ao verificar status de downloads:', error);
        }
    };

    const removeFromPlaylist = (trackId: number) => {
        const newPlaylist = playlist.filter((track) => track.id !== trackId);
        setPlaylist(newPlaylist);
        localStorage.setItem("musicPlaylist", JSON.stringify(newPlaylist));
    };

    const clearPlaylist = () => {
        setPlaylist([]);
        localStorage.removeItem("musicPlaylist");
    };

    const handlePlayPause = (track: Track) => {
        if (currentTrack?.id === track.id) {
            togglePlayPause();
        } else {
            playTrack(track);
        }
    };

    const downloadTrack = async (track: Track) => {
        setDownloadingTracks((prev) => new Set(prev).add(track.id));

        try {
            // Verificar se já foi baixada antes (otimização local)
            if (downloadedTracks.has(track.id)) {
                console.log(`✅ Música ${track.songName} já foi baixada localmente`);
            }

            // Verificar créditos e registrar download no servidor
            const registrationResponse = await fetch('/api/downloads/track', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    trackId: track.id,
                    action: 'download'
                })
            });

            const registrationData = await registrationResponse.json();

            if (!registrationResponse.ok) {
                if (registrationData.error === 'Créditos insuficientes') {
                    setCreditWarning(`Créditos insuficientes! Você precisa de 350 créditos para baixar "${track.songName}", mas tem apenas ${registrationData.available}.`);
                } else {
                    setCreditWarning(`Erro: ${registrationData.error}`);
                }
                return;
            }

            // Fazer o download real
            const response = await fetch(track.downloadUrl);
            if (!response.ok) throw new Error("Falha no download");

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.style.display = "none";
            a.href = url;

            // Melhorar nome do arquivo com fallbacks
            const songName = track.songName || 'Unknown Song';
            const artistName = track.artist || 'Unknown Artist';
            const sanitizedSongName = songName.replace(/[^a-zA-Z0-9\s-_.]/g, '').trim() || 'Unknown_Song';
            const sanitizedArtist = artistName.replace(/[^a-zA-Z0-9\s-_.]/g, '').trim() || 'Unknown_Artist';

            a.download = `${sanitizedArtist} - ${sanitizedSongName}.mp3`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);

            // Marcar track como baixada
            const newDownloadedTracks = new Set([...downloadedTracks, track.id]);
            setDownloadedTracks(newDownloadedTracks);
            localStorage.setItem("downloadedTracks", JSON.stringify([...newDownloadedTracks]));

            // Atualizar créditos se foram consumidos
            if (registrationData.creditsConsumed > 0) {
                // Atualize os créditos do usuário aqui, se necessário
                // Exemplo: await refreshCredits();
                console.log(`� ${registrationData.creditsConsumed} créditos consumidos para: ${track.songName}`);
            } else {
                console.log(`✅ Download sem consumo de créditos: ${track.songName}`);
            }

        } catch (error) {
            console.error("Erro no download:", error);
            setCreditWarning(`Erro ao baixar "${track.songName || 'Unknown'}". Tente novamente.`);
        } finally {
            setDownloadingTracks((prev) => {
                const newSet = new Set(prev);
                newSet.delete(track.id);
                return newSet;
            });
        }
    };

    const downloadAllTracks = async () => {
        if (playlist.length === 0) return;

        // Verificar créditos para usuários FREE
        if (!isVipUser && creditInfo) {
            const totalCost = playlist.length * 350;
            const affordableTracks = Math.floor(creditInfo.credits / 350);

            if (affordableTracks === 0) {
                setCreditWarning(`Você precisa de ${totalCost} créditos para baixar todas as músicas, mas tem apenas ${creditInfo.credits}. Cada download custa 350 créditos.`);
                return;
            } else if (affordableTracks < playlist.length) {
                setCreditWarning(`Você pode baixar apenas ${affordableTracks} de ${playlist.length} músicas com seus ${creditInfo.credits} créditos disponíveis.`);
            } else {
                setCreditWarning(null);
            }
        }

        setIsDownloadingAll(true);
        setCreditWarning(null);

        try {
            const response = await fetch("/api/downloads/zip", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    trackIds: playlist.map((track) => track.id),
                    filename: `playlist_${new Date().toISOString().slice(0, 10)}.zip`,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();

                if (response.status === 400 && errorData.creditsAvailable !== undefined) {
                    // Erro de créditos insuficientes
                    setCreditWarning(errorData.message);
                    return;
                }

                throw new Error(`Erro na requisição: ${response.status}`);
            }

            // Verificar se foi um download parcial e extrair informações
            const isPartialDownload = response.headers.get('X-Partial-Download') === 'true';
            const downloadedCount = response.headers.get('X-Downloaded');
            const remainingCredits = response.headers.get('X-Remaining-Credits');
            const creditsUsed = response.headers.get('X-Credits-Used');
            const alreadyDownloaded = response.headers.get('X-Already-Downloaded');
            const newDownloads = response.headers.get('X-New-Downloads');

            // Criar mensagem informativa baseada no resultado
            if (isPartialDownload && downloadedCount) {
                let message = `Download concluído! ${downloadedCount} de ${playlist.length} músicas no ZIP.`;

                if (alreadyDownloaded && parseInt(alreadyDownloaded) > 0) {
                    message += ` ${alreadyDownloaded} já eram suas (sem custo adicional).`;
                }

                if (newDownloads && parseInt(newDownloads) > 0) {
                    message += ` ${newDownloads} downloads novos custaram ${creditsUsed} créditos.`;
                }

                if (remainingCredits) {
                    message += ` Créditos restantes: ${remainingCredits}.`;
                }

                setCreditWarning(message);
            } else if (alreadyDownloaded && parseInt(alreadyDownloaded) > 0) {
                // Todos foram baixados, mas alguns já eram conhecidos
                const alreadyCount = parseInt(alreadyDownloaded);
                const newCount = parseInt(newDownloads || '0');

                if (alreadyCount > 0 && newCount > 0) {
                    setCreditWarning(`Download concluído! ${alreadyCount} músicas já eram suas (sem custo) e ${newCount} foram baixadas usando ${creditsUsed} créditos.`);
                } else if (alreadyCount === playlist.length) {
                    setCreditWarning(`Todas as ${playlist.length} músicas já foram baixadas antes! Nenhum crédito foi consumido.`);
                }
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `playlist_${new Date().toISOString().slice(0, 10)}.zip`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);

            // Marcar todas as tracks que estavam no ZIP como baixadas
            const allTracksInZip = playlist.map(track => track.id);
            const newDownloadedTracks = new Set([...downloadedTracks, ...allTracksInZip]);
            setDownloadedTracks(newDownloadedTracks);
            localStorage.setItem("downloadedTracks", JSON.stringify([...newDownloadedTracks]));

            // Atualizar status do servidor para garantir sincronização
            await checkDownloadStatus(playlist.map(track => track.id));

            // Atualizar informações de crédito
            if (!isVipUser) {
                // await refreshCredits(); // Função não implementada, remova ou implemente conforme necessário
            }

            console.log(`✅ Download ZIP concluído. ${playlist.length} músicas marcadas como baixadas.`);

        } catch (error) {
            console.error("Erro no download da playlist:", error);
            setCreditWarning("Erro ao fazer download. Tente novamente.");
        } finally {
            setIsDownloadingAll(false);
        }
    };

    const formatDuration = (duration?: number) => {
        if (!duration) return "0:00";
        const mins = Math.floor(duration / 60);
        const secs = duration % 60;
        return `${mins}:${secs.toString().padStart(2, "0")}`;
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-[#121212] flex items-center justify-center">
                <div className="text-center">
                    <div className="relative">
                        <div className="w-20 h-20 border-4 border-purple-600/30 border-t-purple-600 rounded-full animate-spin mx-auto mb-6"></div>
                        <Music className="h-8 w-8 text-purple-500 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-2">
                        Carregando Lista de Download
                    </h3>
                    <p className="text-gray-400">
                        Aguarde enquanto carregamos suas músicas selecionadas...
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#121212] text-white relative">
            <Header />

            <div className="bg-gradient-to-b from-purple-600/20 to-transparent">
                <div className="container mx-auto px-6 pt-32 pb-8">
                    <div className="flex items-end gap-6">
                        <div className="w-48 h-48 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-2xl">
                            <Download size={80} className="text-white/80" />
                        </div>

                        <div className="flex-1 pb-6">
                            <p className="text-sm font-medium text-purple-200 mb-2">
                                DOWNLOADER EM MASSA
                            </p>
                            <h1 className="text-7xl font-black mb-4 bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
                                Downloads
                            </h1>
                            <p className="text-white/70 text-lg mb-4">
                                Baixe todas as suas músicas selecionadas de uma vez
                            </p>
                            <div className="flex items-center gap-4 text-white/60">
                                <div className="flex items-center gap-1">
                                    <User size={16} />
                                    <span className="text-sm">Você</span>
                                </div>
                                <span>•</span>
                                <span className="text-sm">
                                    {playlist.length} música{playlist.length !== 1 ? "s" : ""} selecionada{playlist.length !== 1 ? "s" : ""}
                                </span>
                                <span>•</span>
                                <span className="text-sm text-green-400">
                                    {downloadedTracks.size} baixada{downloadedTracks.size !== 1 ? "s" : ""}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Seção explicativa */}
            <div className="container mx-auto px-6 py-8">
                <div className="bg-gradient-to-r from-purple-900/20 to-blue-900/20 backdrop-blur-sm border border-purple-500/20 rounded-xl p-6 mb-8">
                    <div className="flex items-start gap-4">
                        <div className="p-2 bg-purple-500/20 rounded-lg">
                            <Info className="h-6 w-6 text-purple-300" />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-lg font-semibold text-white mb-3">Como funciona o Downloader em Massa</h3>
                            <p className="text-gray-300 text-justify leading-relaxed">
                                O sistema de download em massa permite que você selecione múltiplas músicas na página principal e baixe todas de uma vez em formato ZIP.
                                Navegue pela nossa biblioteca musical, clique no ícone de adicionar (❤️) nas músicas que deseja baixar - você pode selecionar até 35 músicas por vez.
                                Todas as músicas selecionadas aparecerão nesta página, onde você pode gerenciar sua lista, remover itens específicos ou baixar tudo em um único arquivo compactado.
                                As músicas já baixadas são marcadas com um ícone verde para facilitar o controle. Este sistema é ideal para criar suas próprias coletâneas musicais
                                e organizar downloads de forma eficiente, economizando tempo e facilitando o gerenciamento dos seus arquivos de áudio.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-6 pb-6">
                {/* Aviso de Créditos para Usuários FREE */}
                {!isVipUser && creditInfo && (
                    <div className="mb-6 bg-gradient-to-r from-purple-900/30 to-blue-900/30 border border-purple-500/30 rounded-xl p-4">
                        <div className="flex items-start gap-3">
                            <CreditCard className="w-5 h-5 text-purple-300 mt-0.5 flex-shrink-0" />
                            <div className="flex-1">
                                <h4 className="text-sm font-semibold text-purple-200 mb-1">Sistema de Créditos</h4>
                                <p className="text-xs text-purple-100 mb-2">
                                    Você tem {creditInfo.credits.toLocaleString()} créditos. Cada download em ZIP custa 350 créditos por música.
                                </p>
                                <div className="text-xs text-purple-200">
                                    • Total de músicas: {playlist.length}
                                    • Custo total: {(playlist.length * 350).toLocaleString()} créditos
                                    • Você pode baixar: {Math.floor(creditInfo.credits / 350)} músicas
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Alerta de aviso sobre créditos */}
                {creditWarning && (
                    <div className="mb-6 bg-gradient-to-r from-yellow-900/30 to-orange-900/30 border border-yellow-500/30 rounded-xl p-4">
                        <div className="flex items-start gap-3">
                            <AlertTriangle className="w-5 h-5 text-yellow-300 mt-0.5 flex-shrink-0" />
                            <div className="flex-1">
                                <h4 className="text-sm font-semibold text-yellow-200 mb-1">Aviso sobre Créditos</h4>
                                <p className="text-xs text-yellow-100">{creditWarning}</p>
                                <button
                                    onClick={() => setCreditWarning(null)}
                                    className="mt-2 text-xs text-yellow-300 hover:text-yellow-100 underline"
                                >
                                    Fechar aviso
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Aviso de erro/warning de créditos */}
                {creditWarning && (
                    <div className="mb-6 bg-gradient-to-r from-yellow-900/30 to-orange-900/30 border border-yellow-500/30 rounded-xl p-4">
                        <div className="flex items-start gap-3">
                            <AlertTriangle className="w-5 h-5 text-yellow-300 mt-0.5 flex-shrink-0" />
                            <div className="flex-1">
                                <h4 className="text-sm font-semibold text-yellow-200 mb-1">Atenção!</h4>
                                <p className="text-xs text-yellow-100">{creditWarning}</p>
                            </div>
                            <button
                                onClick={() => setCreditWarning(null)}
                                className="text-yellow-300 hover:text-yellow-100 transition-colors"
                            >
                                ×
                            </button>
                        </div>
                    </div>
                )}

                <div className="flex items-center gap-4">
                    <button
                        onClick={downloadAllTracks}
                        disabled={playlist.length === 0 || isDownloadingAll}
                        className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed px-6 py-3 rounded-full font-semibold transition-all flex items-center gap-2 shadow-lg hover:shadow-purple-500/25"
                    >
                        {isDownloadingAll ? (
                            <>
                                <Loader2 size={20} className="animate-spin" />
                                Baixando ZIP...
                            </>
                        ) : (
                            <>
                                <Download size={20} />
                                Baixar Todas (.ZIP)
                            </>
                        )}
                    </button>

                    {playlist.length > 0 && (
                        <button
                            onClick={clearPlaylist}
                            disabled={isDownloadingAll}
                            className="bg-red-600 hover:bg-red-700 disabled:bg-gray-600 disabled:cursor-not-allowed px-6 py-3 rounded-full font-semibold transition-all flex items-center gap-2 shadow-lg hover:shadow-red-500/25"
                        >
                            <Trash2 size={20} />
                            Limpar Lista
                        </button>
                    )}

                    <Link
                        href="/new"
                        className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-full font-semibold transition-all flex items-center gap-2 shadow-lg hover:shadow-blue-500/25"
                    >
                        <Music size={20} />
                        Adicionar Músicas
                    </Link>
                </div>
            </div>

            <div className="container mx-auto px-6 pb-20">
                {playlist.length === 0 ? (
                    <div className="text-center py-20">
                        <div className="p-6 bg-gray-800/50 rounded-2xl inline-block mb-6">
                            <Music size={64} className="text-gray-400 mx-auto" />
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-4">
                            Nenhuma música selecionada
                        </h3>
                        <p className="text-gray-400 mb-8">
                            Selecione algumas músicas na página principal para fazer download em lote
                        </p>
                        <Link
                            href="/new"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors"
                        >
                            <Music size={20} />
                            Selecionar Músicas
                        </Link>
                    </div>
                ) : (
                    <div className="bg-black/20 backdrop-blur-sm rounded-xl overflow-hidden border border-white/10">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-zinc-800 bg-zinc-900/50">
                                        <th className="px-4 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-wider w-[40%]">
                                            TÍTULO
                                        </th>
                                        <th className="px-4 py-3 text-center text-xs font-bold text-gray-400 uppercase tracking-wider w-[20%]">
                                            GÊNERO
                                        </th>
                                        <th className="px-4 py-3 text-center text-xs font-bold text-gray-400 uppercase tracking-wider w-[25%]">
                                            ARTISTA
                                        </th>
                                        <th className="px-4 py-3 text-center text-xs font-bold text-gray-400 uppercase tracking-wider w-[15%]">
                                            STATUS
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {playlist.map((track, index) => {
                                        const isCurrent = currentTrack?.id === track.id;
                                        const isCurrentPlaying = isCurrent && isPlaying;

                                        return (
                                            <tr
                                                key={track.id}
                                                className={clsx(
                                                    "group transition-all duration-300 ease-in-out border-l-4 hover:shadow-lg",
                                                    isCurrent ? 'bg-zinc-900/50 border-blue-500 shadow-blue-500/20' : 'border-transparent hover:bg-zinc-800/60 hover:shadow-zinc-800/20'
                                                )}
                                            >
                                                <td className="px-4 py-3 align-middle w-[40%]">
                                                    <div className="flex items-center gap-4">
                                                        <div className="relative flex-shrink-0 w-12 h-12">
                                                            <img
                                                                src={track.imageUrl || "/images/default-track.jpg"}
                                                                alt={`Capa de ${track.songName}`}
                                                                className="w-12 h-12 rounded-lg object-cover border border-zinc-700/50"
                                                            />
                                                            <button
                                                                onClick={() => handlePlayPause(track)}
                                                                className={clsx(
                                                                    "absolute inset-0 flex items-center justify-center rounded-lg transition-all duration-300 backdrop-blur-sm text-white bg-black/60",
                                                                    isCurrent ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                                                                )}
                                                                title={isCurrentPlaying ? "Pausar" : "Tocar"}
                                                            >
                                                                {isCurrentPlaying ? (
                                                                    <Pause size={22} strokeWidth={1.75} className="text-blue-400" />
                                                                ) : (
                                                                    <Play size={22} strokeWidth={1.75} className="ml-1" />
                                                                )}
                                                            </button>
                                                        </div>
                                                        <div className="flex flex-col min-w-0">
                                                            <div className="flex items-center gap-2">
                                                                <span className="font-medium text-gray-100 truncate text-[12px]">
                                                                    {track.songName}
                                                                </span>
                                                            </div>
                                                            {track.pool && (
                                                                <span className="text-[11px] text-gray-400 truncate">
                                                                    {track.pool}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 align-middle w-[20%] text-center">
                                                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold text-white tracking-wide shadow-sm whitespace-nowrap uppercase" style={{ backgroundColor: '#FF4500' }}>
                                                        {track.style}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 align-middle w-[25%] text-center">
                                                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-600 text-white tracking-wide shadow-sm whitespace-nowrap uppercase">
                                                        {track.artist}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 align-middle w-[15%] text-center">
                                                    <div className="flex items-center justify-center gap-2">
                                                        {downloadedTracks.has(track.id) ? (
                                                            <div className="flex items-center gap-2">
                                                                <div className="p-2 rounded-full bg-green-600/20 text-green-300" title="Música já baixada">
                                                                    <CheckCircle size={16} />
                                                                </div>
                                                                <button
                                                                    onClick={() => removeFromPlaylist(track.id)}
                                                                    disabled={isDownloadingAll}
                                                                    className="p-2 rounded-full bg-red-600/20 hover:bg-red-600/40 text-red-300 hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                                                    title="Remover da lista de download"
                                                                >
                                                                    <Trash2 size={16} />
                                                                </button>
                                                            </div>
                                                        ) : (
                                                            <div className="flex items-center gap-2">
                                                                <button
                                                                    onClick={() => downloadTrack(track)}
                                                                    disabled={downloadingTracks.has(track.id) || isDownloadingAll}
                                                                    className="p-2 rounded-full bg-purple-600/20 hover:bg-purple-600/40 text-purple-300 hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                                                    title="Baixar música"
                                                                >
                                                                    {downloadingTracks.has(track.id) ? (
                                                                        <Loader2 size={16} className="animate-spin" />
                                                                    ) : (
                                                                        <Download size={16} />
                                                                    )}
                                                                </button>
                                                                <button
                                                                    onClick={() => removeFromPlaylist(track.id)}
                                                                    disabled={isDownloadingAll}
                                                                    className="p-2 rounded-full bg-red-600/20 hover:bg-red-600/40 text-red-300 hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                                                    title="Remover da lista de download"
                                                                >
                                                                    <Trash2 size={16} />
                                                                </button>
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
