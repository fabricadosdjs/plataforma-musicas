'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { toast } from 'react-hot-toast';
import Image from 'next/image';
import Link from 'next/link';
import {
    Music,
    Play,
    Download,
    Trash2,
    Calendar,
    User,
    Eye,
    EyeOff,
    MoreHorizontal,
    Heart,
    Clock,
    ChevronLeft,
    ChevronRight
} from 'lucide-react';
import { generatePlaylistUrl } from '@/lib/playlist-utils';

interface LibraryPlaylist {
    id: number;
    name: string;
    description?: string;
    coverImage?: string;
    isPublic: boolean;
    isFeatured: boolean;
    createdAt: string;
    updatedAt: string;
    createdBy: string;
    trackCount: number;
    addedToLibraryAt: string;
    tracks: Array<{
        id: number;
        playlistId: number;
        trackId: number;
        order: number;
        addedAt: string;
        track?: {
            id: number;
            songName: string;
            artist: string;
            style?: string;
            version?: string;
            pool?: string;
            imageUrl?: string;
            previewUrl?: string;
            downloadUrl?: string;
            releaseDate?: string;
            duration?: string;
            createdAt: string;
            updatedAt: string;
        };
    }>;
}

export default function LibrarySection() {
    const { data: session } = useSession();
    const [playlists, setPlaylists] = useState<LibraryPlaylist[]>([]);
    const [loading, setLoading] = useState(true);
    const [downloadingPlaylists, setDownloadingPlaylists] = useState<Set<number>>(new Set());
    const [removingPlaylists, setRemovingPlaylists] = useState<Set<number>>(new Set());
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    // Carregar playlists da biblioteca
    const loadLibraryPlaylists = async () => {
        if (!session?.user) {
            console.log('🔍 LibrarySection: Usuário não autenticado');
            return;
        }

        console.log('🔍 LibrarySection: Carregando playlists da biblioteca...');

        try {
            setLoading(true);
            const response = await fetch('/api/library');
            console.log('🔍 LibrarySection: Resposta da API:', response.status, response.ok);

            const data = await response.json();
            console.log('🔍 LibrarySection: Dados recebidos:', data);

            if (response.ok) {
                setPlaylists(data.playlists || []);
                console.log('🔍 LibrarySection: Playlists carregadas:', data.playlists?.length || 0);
            } else {
                console.error('🔍 LibrarySection: Erro na API:', data);
                toast.error('❌ Erro ao carregar biblioteca');
            }
        } catch (error) {
            console.error('🔍 LibrarySection: Erro ao carregar biblioteca:', error);
            toast.error('❌ Erro ao carregar biblioteca');
        } finally {
            setLoading(false);
        }
    };

    // Remover playlist da biblioteca
    const handleRemoveFromLibrary = async (playlistId: number) => {
        if (!session?.user) {
            toast.error('🔒 Faça login para gerenciar biblioteca');
            return;
        }

        setRemovingPlaylists(prev => new Set(prev).add(playlistId));

        try {
            const response = await fetch(`/api/library?playlistId=${playlistId}`, {
                method: 'DELETE'
            });

            const data = await response.json();

            if (response.ok) {
                setPlaylists(prev => prev.filter(p => p.id !== playlistId));
                toast.success('✅ Playlist removida da biblioteca');
            } else {
                toast.error(`❌ ${data.error || 'Erro ao remover playlist'}`);
            }
        } catch (error) {
            console.error('Erro ao remover playlist:', error);
            toast.error('❌ Erro ao remover playlist da biblioteca');
        } finally {
            setRemovingPlaylists(prev => {
                const newSet = new Set(prev);
                newSet.delete(playlistId);
                return newSet;
            });
        }
    };

    // Baixar todas as músicas de uma playlist
    const handleDownloadPlaylist = async (playlist: LibraryPlaylist) => {
        if (!session?.user) {
            toast.error('🔒 Faça login para baixar músicas');
            return;
        }

        if (!playlist.tracks || playlist.tracks.length === 0) {
            toast.error('❌ Playlist vazia');
            return;
        }

        setDownloadingPlaylists(prev => new Set(prev).add(playlist.id));

        try {
            const tracks = playlist.tracks.map(pt => pt.track).filter(Boolean);
            let downloadedCount = 0;

            toast.success(`📥 Iniciando download de ${tracks.length} músicas...`);

            // Processar em lotes de 5 para não sobrecarregar
            const batchSize = 5;
            for (let i = 0; i < tracks.length; i += batchSize) {
                const batch = tracks.slice(i, i + batchSize);

                for (const track of batch) {
                    if (!track) continue;

                    try {
                        // Registrar download no banco
                        const downloadResponse = await fetch('/api/download', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ trackId: track.id })
                        });

                        if (downloadResponse.ok) {
                            const downloadData = await downloadResponse.json();

                            // Baixar arquivo
                            const response = await fetch(downloadData.downloadUrl);
                            if (response.ok) {
                                const blob = await response.blob();
                                const url = window.URL.createObjectURL(blob);
                                const link = document.createElement('a');
                                link.href = url;
                                link.download = `${track.artist} - ${track.songName}.mp3`;
                                link.style.display = 'none';
                                document.body.appendChild(link);
                                link.click();
                                document.body.removeChild(link);
                                window.URL.revokeObjectURL(url);

                                downloadedCount++;
                            }
                        }

                        // Pequena pausa entre downloads
                        await new Promise(resolve => setTimeout(resolve, 500));
                    } catch (error) {
                        console.error(`Erro ao baixar ${track.songName}:`, error);
                    }
                }

                // Pausa maior entre lotes
                if (i + batchSize < tracks.length) {
                    await new Promise(resolve => setTimeout(resolve, 1000));
                }
            }

            toast.success(`✅ Download concluído! ${downloadedCount} músicas baixadas`);
        } catch (error) {
            console.error('Erro no download em lote:', error);
            toast.error('❌ Erro durante o download em lote');
        } finally {
            setDownloadingPlaylists(prev => {
                const newSet = new Set(prev);
                newSet.delete(playlist.id);
                return newSet;
            });
        }
    };

    // Funções de paginação
    const totalPages = Math.ceil(playlists.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentPlaylists = playlists.slice(startIndex, endIndex);

    const goToPage = (page: number) => {
        setCurrentPage(page);
    };

    const goToPreviousPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };

    const goToNextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage(currentPage + 1);
        }
    };

    useEffect(() => {
        loadLibraryPlaylists();
    }, [session]);

    // Reset página quando playlists mudam
    useEffect(() => {
        setCurrentPage(1);
    }, [playlists.length]);

    if (loading) {
        return (
            <div className="space-y-6 w-full">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-8">
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="space-y-4">
                            <div className="w-full aspect-square bg-gray-700 rounded-2xl animate-pulse"></div>
                            <div className="h-6 bg-gray-700 rounded animate-pulse"></div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (playlists.length === 0) {
        return (
            <div className="bg-gray-900 rounded-2xl p-12 border border-gray-800 text-center">
                <div className="w-16 h-16 bg-gray-800 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <Music className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-white mb-2">Biblioteca vazia</h3>
                <p className="text-gray-400 mb-6 text-sm sm:text-base">Você ainda não salvou nenhuma playlist na sua biblioteca</p>
                <Link
                    href="/playlists"
                    className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-xl font-medium transition-colors text-sm sm:text-base"
                >
                    <Music className="w-4 h-4" />
                    Explorar Playlists
                </Link>
            </div>
        );
    }

    return (
        <div className="space-y-6 w-full">
            {/* Grid de Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-8">
                {currentPlaylists.map((playlist) => (
                    <div key={playlist.id} className="group">
                        {/* Capa da Playlist - Quadrada */}
                        <div className="relative w-full aspect-square rounded-2xl overflow-hidden bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-gray-700/50 hover:border-purple-500/30 transition-all duration-300 backdrop-blur-sm mb-4">
                            {playlist.coverImage ? (
                                <Image
                                    src={playlist.coverImage}
                                    alt={playlist.name}
                                    fill
                                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                                />
                            ) : (
                                <div className="w-full h-full bg-gradient-to-br from-purple-500/30 to-blue-500/30 flex items-center justify-center border border-purple-400/20">
                                    <Music className="w-20 h-20 text-purple-300" />
                                </div>
                            )}

                            {/* Overlay com botões */}
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3">
                                <Link
                                    href={generatePlaylistUrl(playlist)}
                                    className="p-3 bg-white/20 hover:bg-white/30 text-white rounded-xl backdrop-blur-sm transition-all duration-200 hover:scale-110"
                                    title="Abrir playlist"
                                >
                                    <Play className="w-4 h-4" />
                                </Link>

                                <button
                                    onClick={() => handleDownloadPlaylist(playlist)}
                                    disabled={downloadingPlaylists.has(playlist.id)}
                                    className="p-3 bg-white/20 hover:bg-white/30 text-white rounded-xl backdrop-blur-sm transition-all duration-200 hover:scale-110 disabled:opacity-50"
                                    title="Baixar todas as músicas"
                                >
                                    {downloadingPlaylists.has(playlist.id) ? (
                                        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                    ) : (
                                        <Download className="w-4 h-4" />
                                    )}
                                </button>

                                <button
                                    onClick={() => handleRemoveFromLibrary(playlist.id)}
                                    disabled={removingPlaylists.has(playlist.id)}
                                    className="p-3 bg-white/20 hover:bg-white/30 text-white rounded-xl backdrop-blur-sm transition-all duration-200 hover:scale-110 disabled:opacity-50"
                                    title="Remover da biblioteca"
                                >
                                    {removingPlaylists.has(playlist.id) ? (
                                        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                    ) : (
                                        <Trash2 className="w-4 h-4" />
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Título da Playlist */}
                        <h3 className="text-lg font-semibold text-white text-center leading-tight break-words">
                            {playlist.name}
                        </h3>
                    </div>
                ))}
            </div>

            {/* Paginação */}
            {totalPages > 1 && (
                <div className="flex items-center justify-center gap-4 mt-8">
                    <button
                        onClick={goToPreviousPage}
                        disabled={currentPage === 1}
                        className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <ChevronLeft className="w-4 h-4" />
                        Anterior
                    </button>

                    <div className="flex items-center gap-2">
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                            <button
                                key={page}
                                onClick={() => goToPage(page)}
                                className={`w-10 h-10 rounded-lg transition-colors ${currentPage === page
                                    ? 'bg-purple-600 text-white'
                                    : 'bg-gray-800 hover:bg-gray-700 text-gray-300'
                                    }`}
                            >
                                {page}
                            </button>
                        ))}
                    </div>

                    <button
                        onClick={goToNextPage}
                        disabled={currentPage === totalPages}
                        className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Próximo
                        <ChevronRight className="w-4 h-4" />
                    </button>
                </div>
            )}

            {/* Informações da Paginação */}
            {playlists.length > 0 && (
                <div className="text-center text-gray-400 text-sm">
                    Mostrando {startIndex + 1} a {Math.min(endIndex, playlists.length)} de {playlists.length} playlists
                </div>
            )}
        </div>
    );
}
