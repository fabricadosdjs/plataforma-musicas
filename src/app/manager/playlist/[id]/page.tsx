'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import {
    Plus,
    Minus,
    Music,
    Search,
    Filter,
    Play,
    Pause,
    Download,
    Heart,
    X,
    ArrowLeft,
    Save,
    RefreshCw,
    Folder,
    FolderOpen,
    GripVertical,
    BarChart3,
    Clock,
    Users,
    TrendingUp,
    Calendar,
    Star,
    Layers,
    Zap,
    Target,
    Activity
} from 'lucide-react';
import { Playlist, PlaylistTrack } from '@/types/playlist';
import { extractIdFromSlug } from '@/lib/playlist-utils';

interface Track {
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
    createdAt: string;
    updatedAt: string;
}

export default function ManagerPlaylistTracksPage({ params }: { params: Promise<{ id: string }> }) {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [playlistId, setPlaylistId] = useState<number | null>(null);

    const [playlist, setPlaylist] = useState<Playlist | null>(null);
    const [availableTracks, setAvailableTracks] = useState<Track[]>([]);
    const [playlistTracks, setPlaylistTracks] = useState<PlaylistTrack[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedStyle, setSelectedStyle] = useState<string>('');
    const [availableStyles, setAvailableStyles] = useState<string[]>([]);
    const [saving, setSaving] = useState(false);

    // Estados para navegação por pastas
    const [availableFolders, setAvailableFolders] = useState<string[]>([]);
    const [selectedFolder, setSelectedFolder] = useState<string>('');
    const [folderTracks, setFolderTracks] = useState<Track[]>([]);
    const [loadingFolders, setLoadingFolders] = useState(false);

    // Estados para drag & drop
    const [draggedTrack, setDraggedTrack] = useState<PlaylistTrack | null>(null);
    const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

    // Estados para estatísticas
    const [stats, setStats] = useState<any>(null);
    const [loadingStats, setLoadingStats] = useState(false);
    const [addingAllFolder, setAddingAllFolder] = useState(false);

    // Resolver params
    useEffect(() => {
        const resolveParams = async () => {
            const resolvedParams = await params;
            const id = extractIdFromSlug(resolvedParams.id);
            if (id) {
                setPlaylistId(id);
            }
        };
        resolveParams();
    }, [params]);

    // Verificar se está logado
    useEffect(() => {
        if (status === 'loading' || playlistId === null) return;

        if (!session?.user?.email) {
            router.push('/auth/signin');
            return;
        }

        fetchData();
    }, [session, status, router, playlistId]);

    const fetchData = async () => {
        try {
            setLoading(true);
            await Promise.all([
                fetchPlaylist(),
                fetchAvailableTracks(),
                fetchPlaylistTracks(),
                fetchAvailableFolders(),
                fetchStats()
            ]);
        } catch (error) {
            console.error('Error fetching data:', error);
            toast.error('Erro ao carregar dados');
        } finally {
            setLoading(false);
        }
    };

    const fetchPlaylist = async () => {
        if (!playlistId) return;

        try {
            const response = await fetch(`/api/playlists/${playlistId}`);
            const data = await response.json();

            if (response.ok) {
                setPlaylist(data.playlist);
            } else {
                toast.error('Erro ao carregar playlist');
                router.push('/manager/playlist');
            }
        } catch (error) {
            console.error('Error fetching playlist:', error);
            toast.error('Erro ao carregar playlist');
        }
    };

    const fetchAvailableTracks = async () => {
        try {
            const response = await fetch('/api/tracks?limit=1000');
            const data = await response.json();

            if (response.ok) {
                setAvailableTracks(data.tracks || []);

                // Extrair estilos únicos
                const uniqueStyles = [...new Set(data.tracks.map((track: Track) => track.style).filter(Boolean))];
                setAvailableStyles(uniqueStyles);
            } else {
                toast.error('Erro ao carregar músicas');
            }
        } catch (error) {
            console.error('Error fetching tracks:', error);
            toast.error('Erro ao carregar músicas');
        }
    };

    const fetchPlaylistTracks = async () => {
        if (!playlistId) return;

        try {
            const response = await fetch(`/api/playlists/${playlistId}/tracks`);
            const data = await response.json();

            if (response.ok) {
                setPlaylistTracks(data.tracks || []);
            } else {
                toast.error('Erro ao carregar músicas da playlist');
            }
        } catch (error) {
            console.error('Error fetching playlist tracks:', error);
            toast.error('Erro ao carregar músicas da playlist');
        }
    };

    const fetchAvailableFolders = async () => {
        try {
            const response = await fetch('/api/tracks/folders', {
                headers: {
                    'Content-Type': 'application/json',
                    'Cache-Control': 'no-cache'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                throw new Error('Resposta não é JSON válido');
            }

            const data = await response.json();

            if (data.success) {
                setAvailableFolders(data.folders || []);
            } else {
                toast.error(data.error || 'Erro ao carregar pastas');
            }
        } catch (error) {
            console.error('Error fetching folders:', error);
            if (error instanceof Error) {
                if (error.message.includes('JSON')) {
                    toast.error('Erro de formato de resposta. Tente recarregar a página.');
                } else {
                    toast.error(`Erro ao carregar pastas: ${error.message}`);
                }
            } else {
                toast.error('Erro ao carregar pastas');
            }
        }
    };

    const fetchTracksByFolder = async (folder: string) => {
        if (!folder) return;

        try {
            setLoadingFolders(true);
            const response = await fetch(`/api/tracks/by-folder?folder=${encodeURIComponent(folder)}`, {
                headers: {
                    'Content-Type': 'application/json',
                    'Cache-Control': 'no-cache'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                throw new Error('Resposta não é JSON válido');
            }

            const data = await response.json();

            if (data.success) {
                setFolderTracks(data.tracks || []);
            } else {
                toast.error(data.error || 'Erro ao carregar músicas da pasta');
            }
        } catch (error) {
            console.error('Error fetching tracks by folder:', error);
            if (error instanceof Error) {
                if (error.message.includes('JSON')) {
                    toast.error('Erro de formato de resposta. Tente recarregar a página.');
                } else {
                    toast.error(`Erro ao carregar músicas da pasta: ${error.message}`);
                }
            } else {
                toast.error('Erro ao carregar músicas da pasta');
            }
        } finally {
            setLoadingFolders(false);
        }
    };

    const addTrackToPlaylist = async (trackId: number) => {
        if (!playlistId) return;

        try {
            const response = await fetch(`/api/playlists/${playlistId}/tracks`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ trackId })
            });

            if (response.ok) {
                toast.success('Música adicionada à playlist!');
                fetchPlaylistTracks();
            } else {
                const data = await response.json();
                toast.error(data.error || 'Erro ao adicionar música');
            }
        } catch (error) {
            console.error('Error adding track:', error);
            toast.error('Erro ao adicionar música');
        }
    };

    const removeTrackFromPlaylist = async (trackId: number) => {
        if (!playlistId) return;

        try {
            const response = await fetch(`/api/playlists/${playlistId}/tracks`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ trackId })
            });

            if (response.ok) {
                toast.success('Música removida da playlist!');
                fetchPlaylistTracks();
            } else {
                const data = await response.json();
                toast.error(data.error || 'Erro ao remover música');
            }
        } catch (error) {
            console.error('Error removing track:', error);
            toast.error('Erro ao remover música');
        }
    };

    // Funções de drag & drop
    const handleDragStart = (e: React.DragEvent, track: PlaylistTrack) => {
        setDraggedTrack(track);
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDragOver = (e: React.DragEvent, index: number) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        setDragOverIndex(index);
    };

    const handleDragLeave = () => {
        setDragOverIndex(null);
    };

    const handleDrop = async (e: React.DragEvent, dropIndex: number) => {
        e.preventDefault();

        if (!draggedTrack || !playlistId) return;

        const dragIndex = playlistTracks.findIndex(track => track.id === draggedTrack.id);

        if (dragIndex === -1 || dragIndex === dropIndex) {
            setDraggedTrack(null);
            setDragOverIndex(null);
            return;
        }

        // Criar nova ordem das músicas
        const newTracks = [...playlistTracks];
        const [draggedItem] = newTracks.splice(dragIndex, 1);
        newTracks.splice(dropIndex, 0, draggedItem);

        // Atualizar a ordem no backend
        try {
            const trackOrders = newTracks.map((track, index) => ({
                trackId: track.trackId,
                order: index + 1
            }));

            const response = await fetch(`/api/playlists/${playlistId}/tracks/reorder`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ trackOrders })
            });

            if (response.ok) {
                toast.success('Ordem das músicas atualizada!');
                fetchPlaylistTracks();
            } else {
                const data = await response.json();
                toast.error(data.error || 'Erro ao reordenar músicas');
            }
        } catch (error) {
            console.error('Error reordering tracks:', error);
            toast.error('Erro ao reordenar músicas');
        }

        setDraggedTrack(null);
        setDragOverIndex(null);
    };

    const handleFolderChange = (folder: string) => {
        setSelectedFolder(folder);
        if (folder) {
            fetchTracksByFolder(folder);
        } else {
            setFolderTracks([]);
        }
    };

    const fetchStats = async () => {
        if (!playlistId) return;

        try {
            setLoadingStats(true);
            const response = await fetch(`/api/playlists/${playlistId}/stats`);
            const data = await response.json();

            if (response.ok) {
                setStats(data.stats);
            } else {
                console.error('Erro ao carregar estatísticas:', data.error);
            }
        } catch (error) {
            console.error('Error fetching stats:', error);
        } finally {
            setLoadingStats(false);
        }
    };

    const addAllFolderTracks = async () => {
        if (!playlistId || !selectedFolder) return;

        try {
            setAddingAllFolder(true);
            const response = await fetch(`/api/playlists/${playlistId}/tracks/add-folder`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ folder: selectedFolder })
            });

            const data = await response.json();

            if (response.ok) {
                toast.success(`${data.addedCount} músicas adicionadas da pasta "${selectedFolder}"!`);
                fetchPlaylistTracks();
                fetchStats();
            } else {
                toast.error(data.error || 'Erro ao adicionar músicas da pasta');
            }
        } catch (error) {
            console.error('Error adding folder tracks:', error);
            toast.error('Erro ao adicionar músicas da pasta');
        } finally {
            setAddingAllFolder(false);
        }
    };

    // Determinar quais tracks usar baseado na seleção
    const tracksToFilter = selectedFolder ? folderTracks : availableTracks;

    const filteredTracks = tracksToFilter.filter(track => {
        const matchesSearch = track.songName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            track.artist.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStyle = !selectedStyle || track.style === selectedStyle;
        const notInPlaylist = !playlistTracks.some(pt => pt.trackId === track.id);

        return matchesSearch && matchesStyle && notInPlaylist;
    });

    const playlistTrackIds = playlistTracks.map(pt => pt.trackId);

    if (status === 'loading' || loading || playlistId === null) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
                <div className="text-white text-xl">Carregando...</div>
            </div>
        );
    }

    if (!playlist) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
                <div className="text-white text-xl">Playlist não encontrada</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
            <div className="container mx-auto px-4 py-8">
                {/* Header Premium */}
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center space-x-4">
                            <button
                                onClick={() => router.push('/manager/playlist')}
                                className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-all duration-300 backdrop-blur-sm border border-white/20"
                            >
                                <ArrowLeft className="w-5 h-5 text-white" />
                            </button>
                            <div>
                                <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent mb-2">
                                    {playlist.name}
                                </h1>
                                <p className="text-gray-300 text-lg">
                                    {playlistTracks.length} músicas • {playlist.description || 'Sem descrição'}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={fetchStats}
                            className="p-3 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl"
                        >
                            <RefreshCw className={`w-5 h-5 text-white ${loadingStats ? 'animate-spin' : ''}`} />
                        </button>
                    </div>

                    {/* Cards de Estatísticas */}
                    {stats && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                            <div className="bg-gradient-to-br from-blue-500/20 to-purple-600/20 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:border-white/20 transition-all duration-300">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-blue-200 text-sm font-medium">Total de Músicas</p>
                                        <p className="text-3xl font-bold text-white">{stats.tracks.total}</p>
                                    </div>
                                    <div className="p-3 rounded-xl bg-blue-500/20">
                                        <Music className="w-6 h-6 text-blue-300" />
                                    </div>
                                </div>
                            </div>

                            <div className="bg-gradient-to-br from-green-500/20 to-emerald-600/20 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:border-white/20 transition-all duration-300">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-green-200 text-sm font-medium">Estilos Únicos</p>
                                        <p className="text-3xl font-bold text-white">{stats.styles.total}</p>
                                    </div>
                                    <div className="p-3 rounded-xl bg-green-500/20">
                                        <Layers className="w-6 h-6 text-green-300" />
                                    </div>
                                </div>
                            </div>

                            <div className="bg-gradient-to-br from-orange-500/20 to-red-600/20 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:border-white/20 transition-all duration-300">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-orange-200 text-sm font-medium">Total Downloads</p>
                                        <p className="text-3xl font-bold text-white">{stats.downloads.total}</p>
                                    </div>
                                    <div className="p-3 rounded-xl bg-orange-500/20">
                                        <Download className="w-6 h-6 text-orange-300" />
                                    </div>
                                </div>
                            </div>

                            <div className="bg-gradient-to-br from-purple-500/20 to-pink-600/20 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:border-white/20 transition-all duration-300">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-purple-200 text-sm font-medium">Pools Únicos</p>
                                        <p className="text-3xl font-bold text-white">{stats.pools.total}</p>
                                    </div>
                                    <div className="p-3 rounded-xl bg-purple-500/20">
                                        <Target className="w-6 h-6 text-purple-300" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Cards de Informações Detalhadas */}
                    {stats && (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                            <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
                                <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                                    <BarChart3 className="w-5 h-5 mr-2 text-blue-400" />
                                    Estatísticas por Estilo
                                </h3>
                                <div className="space-y-3">
                                    {Object.entries(stats.styles.distribution).slice(0, 5).map(([style, count]) => (
                                        <div key={style} className="flex items-center justify-between">
                                            <span className="text-gray-300">{style}</span>
                                            <div className="flex items-center space-x-2">
                                                <div className="w-20 bg-gray-700 rounded-full h-2">
                                                    <div
                                                        className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-500"
                                                        style={{ width: `${(count as number / stats.tracks.total) * 100}%` }}
                                                    ></div>
                                                </div>
                                                <span className="text-white font-medium w-8 text-right">{count}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
                                <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                                    <TrendingUp className="w-5 h-5 mr-2 text-green-400" />
                                    Informações da Playlist
                                </h3>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <span className="text-gray-300">Criada em:</span>
                                        <span className="text-white">{new Date(stats.playlist.createdAt).toLocaleDateString('pt-BR')}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-gray-300">Última atualização:</span>
                                        <span className="text-white">{new Date(stats.playlist.updatedAt).toLocaleDateString('pt-BR')}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-gray-300">Estilo mais popular:</span>
                                        <span className="text-white font-medium">{stats.styles.mostPopular}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-gray-300">Pool mais popular:</span>
                                        <span className="text-white font-medium">{stats.pools.mostPopular}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Músicas da Playlist */}
                    <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:border-white/20 transition-all duration-300">
                        <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                            <div className="p-2 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 mr-3">
                                <Music className="w-6 h-6 text-white" />
                            </div>
                            Músicas da Playlist
                            <span className="ml-2 px-3 py-1 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full text-sm font-medium">
                                {playlistTracks.length}
                            </span>
                        </h2>

                        {playlistTracks.length === 0 ? (
                            <div className="text-center py-12">
                                <div className="w-20 h-20 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                    <Music className="w-10 h-10 text-blue-400" />
                                </div>
                                <p className="text-gray-300 text-lg">Nenhuma música na playlist</p>
                                <p className="text-gray-500 text-sm mt-2">Adicione músicas usando o painel ao lado</p>
                            </div>
                        ) : (
                            <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                                {playlistTracks.map((playlistTrack, index) => (
                                    <div
                                        key={playlistTrack.id}
                                        draggable
                                        onDragStart={(e) => handleDragStart(e, playlistTrack)}
                                        onDragOver={(e) => handleDragOver(e, index)}
                                        onDragLeave={handleDragLeave}
                                        onDrop={(e) => handleDrop(e, index)}
                                        className={`bg-gradient-to-r from-slate-700/50 to-slate-800/50 rounded-xl p-4 flex items-center justify-between cursor-move transition-all duration-300 hover:from-slate-600/50 hover:to-slate-700/50 border border-white/5 hover:border-white/20 ${dragOverIndex === index ? 'bg-blue-500/20 border-2 border-blue-400 shadow-lg shadow-blue-500/20' : ''
                                            } ${draggedTrack?.id === playlistTrack.id ? 'opacity-50 scale-95' : ''
                                            }`}
                                    >
                                        <div className="flex items-center space-x-4">
                                            <div className="p-2 rounded-lg bg-white/10">
                                                <GripVertical className="w-4 h-4 text-gray-400" />
                                            </div>
                                            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                                                <span className="text-white font-bold text-sm">{index + 1}</span>
                                            </div>
                                            <div className="w-12 h-12 bg-gradient-to-r from-slate-600 to-slate-700 rounded-xl flex items-center justify-center">
                                                <Music className="w-6 h-6 text-slate-300" />
                                            </div>
                                            <div>
                                                <p className="text-white font-medium text-base">{playlistTrack.track?.songName}</p>
                                                <p className="text-gray-400 text-sm">{playlistTrack.track?.artist}</p>
                                                {playlistTrack.track?.style && (
                                                    <span className="inline-block mt-1 px-2 py-1 bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-blue-300 text-xs rounded-full">
                                                        {playlistTrack.track.style}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => removeTrackFromPlaylist(playlistTrack.trackId)}
                                            className="p-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-400 hover:text-red-300 transition-all duration-300"
                                            title="Remover da playlist"
                                        >
                                            <Minus className="w-5 h-5" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Músicas Disponíveis */}
                    <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:border-white/20 transition-all duration-300">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold text-white flex items-center">
                                <div className="p-2 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 mr-3">
                                    <Plus className="w-6 h-6 text-white" />
                                </div>
                                Músicas Disponíveis
                                <span className="ml-2 px-3 py-1 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-full text-sm font-medium">
                                    {filteredTracks.length}
                                </span>
                            </h2>

                            {/* Botão Adicionar Toda a Pasta */}
                            {selectedFolder && (
                                <button
                                    onClick={addAllFolderTracks}
                                    disabled={addingAllFolder}
                                    className="px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:from-gray-600 disabled:to-gray-700 text-white rounded-xl font-medium transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 flex items-center space-x-2"
                                >
                                    {addingAllFolder ? (
                                        <>
                                            <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                                            <span>Adicionando...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Zap className="w-4 h-4" />
                                            <span>Adicionar Toda a Pasta do Storage</span>
                                        </>
                                    )}
                                </button>
                            )}
                        </div>

                        {/* Filtros Premium */}
                        <div className="mb-6 space-y-4">
                            <div className="relative">
                                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input
                                    type="text"
                                    placeholder="Buscar músicas..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-12 pr-4 py-3 bg-slate-700/50 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all duration-300"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Navegação por Pastas do Storage */}
                                <div className="relative">
                                    <Folder className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                    <select
                                        value={selectedFolder}
                                        onChange={(e) => handleFolderChange(e.target.value)}
                                        className="w-full pl-12 pr-4 py-3 bg-slate-700/50 border border-white/10 rounded-xl text-white focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all duration-300"
                                    >
                                        <option value="">Todas as pastas do Storage</option>
                                        {availableFolders.map(folder => (
                                            <option key={folder} value={folder}>
                                                📁 {folder}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Filtro por Estilo */}
                                <div className="relative">
                                    <Filter className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                    <select
                                        value={selectedStyle}
                                        onChange={(e) => setSelectedStyle(e.target.value)}
                                        className="w-full pl-12 pr-4 py-3 bg-slate-700/50 border border-white/10 rounded-xl text-white focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all duration-300"
                                    >
                                        <option value="">Todos os estilos</option>
                                        {availableStyles.map(style => (
                                            <option key={style} value={style}>{style}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                            {loadingFolders ? (
                                <div className="text-center py-12">
                                    <div className="w-16 h-16 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                        <div className="animate-spin w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full"></div>
                                    </div>
                                    <p className="text-gray-300 text-lg">Carregando músicas da pasta...</p>
                                </div>
                            ) : (
                                filteredTracks.map(track => (
                                    <div key={track.id} className="bg-gradient-to-r from-slate-700/50 to-slate-800/50 rounded-xl p-4 flex items-center justify-between hover:from-slate-600/50 hover:to-slate-700/50 border border-white/5 hover:border-white/20 transition-all duration-300">
                                        <div className="flex items-center space-x-4">
                                            <div className="w-12 h-12 bg-gradient-to-r from-slate-600 to-slate-700 rounded-xl flex items-center justify-center">
                                                <Music className="w-6 h-6 text-slate-300" />
                                            </div>
                                            <div>
                                                <p className="text-white font-medium text-base">{track.songName}</p>
                                                <p className="text-gray-400 text-sm">{track.artist}</p>
                                                <div className="flex items-center space-x-2 mt-1">
                                                    {track.style && (
                                                        <span className="px-2 py-1 bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-300 text-xs rounded-full">
                                                            {track.style}
                                                        </span>
                                                    )}
                                                    {track.pool && (
                                                        <span className="px-2 py-1 bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-blue-300 text-xs rounded-full">
                                                            {track.pool}
                                                        </span>
                                                    )}
                                                    {track.isFromStorage && (
                                                        <span className="px-2 py-1 bg-gradient-to-r from-orange-500/20 to-yellow-500/20 text-orange-300 text-xs rounded-full flex items-center">
                                                            <Folder className="w-3 h-3 mr-1" />
                                                            Storage
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => addTrackToPlaylist(track.id)}
                                            className="p-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white transition-all duration-300 shadow-lg hover:shadow-xl"
                                            title="Adicionar à playlist"
                                        >
                                            <Plus className="w-5 h-5" />
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>

                        {!loadingFolders && filteredTracks.length === 0 && (
                            <div className="text-center py-12">
                                <div className="w-20 h-20 bg-gradient-to-r from-gray-500/20 to-slate-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                    <Music className="w-10 h-10 text-gray-400" />
                                </div>
                                <p className="text-gray-300 text-lg">
                                    {searchTerm || selectedStyle || selectedFolder ? 'Nenhuma música encontrada' : 'Nenhuma música disponível'}
                                </p>
                                <p className="text-gray-500 text-sm mt-2">
                                    {searchTerm || selectedStyle || selectedFolder ? 'Tente ajustar os filtros' : 'Selecione uma pasta ou estilo para ver músicas'}
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
