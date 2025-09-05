'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import {
    ArrowLeft,
    Plus,
    Trash2,
    Search,
    Music,
    Play,
    Download,
    Heart,
    X,
    Save,
    GripVertical
} from 'lucide-react';
import { Playlist, PlaylistTrack } from '@/types/playlist';

interface PlaylistManagePageProps {
    params: Promise<{ id: string }>;
}

export default function PlaylistManagePage({ params }: PlaylistManagePageProps) {
    const { data: session, status } = useSession();
    const router = useRouter();

    const [playlist, setPlaylist] = useState<Playlist | null>(null);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showAddTracksModal, setShowAddTracksModal] = useState(false);
    const [availableTracks, setAvailableTracks] = useState<any[]>([]);
    const [selectedTracks, setSelectedTracks] = useState<Set<number>>(new Set());
    const [saving, setSaving] = useState(false);
    const [playlistId, setPlaylistId] = useState<string | null>(null);

    useEffect(() => {
        const resolveParams = async () => {
            const resolvedParams = await params;
            setPlaylistId(resolvedParams.id);
        };
        resolveParams();
    }, [params]);

    useEffect(() => {
        if (status === 'loading') return;

        if (!session?.user?.email) {
            router.push('/auth/signin');
            return;
        }

        if (playlistId) {
            fetchPlaylist();
        }
    }, [session, status, router, playlistId]);

    const fetchPlaylist = async () => {
        if (!playlistId) return;

        try {
            setLoading(true);
            const response = await fetch(`/api/playlists/${playlistId}`);
            const data = await response.json();

            if (response.ok) {
                setPlaylist(data.playlist);
            } else {
                toast.error(data.error || 'Erro ao carregar playlist');
                router.push('/admin/playlists');
            }
        } catch (error) {
            console.error('Error fetching playlist:', error);
            toast.error('Erro ao carregar playlist');
            router.push('/admin/playlists');
        } finally {
            setLoading(false);
        }
    };

    const fetchAvailableTracks = async () => {
        try {
            const response = await fetch(`/api/tracks/new?limit=100&search=${searchTerm}`);
            const data = await response.json();

            if (response.ok) {
                // Filtrar tracks que já estão na playlist
                const playlistTrackIds = new Set(playlist?.tracks?.map(pt => pt.trackId) || []);
                const filteredTracks = data.tracks.filter((track: any) => !playlistTrackIds.has(track.id));
                setAvailableTracks(filteredTracks);
            }
        } catch (error) {
            console.error('Error fetching tracks:', error);
            toast.error('Erro ao carregar músicas');
        }
    };

    const handleAddTracks = async () => {
        if (selectedTracks.size === 0) {
            toast.error('Selecione pelo menos uma música');
            return;
        }

        try {
            setSaving(true);

            // Adicionar tracks uma por uma
            for (const trackId of selectedTracks) {
                const response = await fetch(`/api/playlists/${playlistId}/tracks`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ trackId })
                });

                if (!response.ok) {
                    const data = await response.json();
                    throw new Error(data.error || 'Erro ao adicionar track');
                }
            }

            toast.success(`${selectedTracks.size} música(s) adicionada(s) com sucesso!`);
            setShowAddTracksModal(false);
            setSelectedTracks(new Set());
            setSearchTerm('');
            fetchPlaylist();
        } catch (error) {
            console.error('Error adding tracks:', error);
            toast.error('Erro ao adicionar músicas');
        } finally {
            setSaving(false);
        }
    };

    const handleRemoveTrack = async (trackId: number) => {
        if (!confirm('Tem certeza que deseja remover esta música da playlist?')) {
            return;
        }

        try {
            const response = await fetch(`/api/playlists/${playlistId}/tracks?trackId=${trackId}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                toast.success('Música removida com sucesso!');
                fetchPlaylist();
            } else {
                const data = await response.json();
                toast.error(data.error || 'Erro ao remover música');
            }
        } catch (error) {
            console.error('Error removing track:', error);
            toast.error('Erro ao remover música');
        }
    };

    const toggleTrackSelection = (trackId: number) => {
        setSelectedTracks(prev => {
            const newSet = new Set(prev);
            if (newSet.has(trackId)) {
                newSet.delete(trackId);
            } else {
                newSet.add(trackId);
            }
            return newSet;
        });
    };

    if (status === 'loading' || loading) {
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
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
            <div className="container mx-auto px-4 py-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center space-x-4">
                        <button
                            onClick={() => router.push('/admin/playlists')}
                            className="flex items-center text-gray-400 hover:text-white transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5 mr-2" />
                            Voltar
                        </button>
                        <div>
                            <h1 className="text-3xl font-bold text-white">{playlist.name}</h1>
                            <p className="text-gray-400">Gerenciar músicas da playlist</p>
                        </div>
                    </div>

                    <button
                        onClick={() => setShowAddTracksModal(true)}
                        className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg flex items-center space-x-2 transition-colors"
                    >
                        <Plus className="w-5 h-5" />
                        <span>Adicionar Músicas</span>
                    </button>
                </div>

                {/* Playlist Info */}
                <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 mb-8">
                    <div className="flex items-center space-x-6">
                        <div className="w-20 h-20 bg-gradient-to-br from-green-600 to-blue-600 rounded-lg overflow-hidden">
                            {playlist.coverImage ? (
                                <img
                                    src={playlist.coverImage}
                                    alt={playlist.name}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                    <Music className="w-8 h-8 text-white/50" />
                                </div>
                            )}
                        </div>

                        <div>
                            <h2 className="text-xl font-bold text-white mb-2">{playlist.name}</h2>
                            {playlist.description && (
                                <p className="text-gray-400 mb-2">{playlist.description}</p>
                            )}
                            <div className="flex items-center space-x-4 text-sm text-gray-400">
                                <span>{playlist.trackCount || 0} músicas</span>
                                <span>Criada em {new Date(playlist.createdAt).toLocaleDateString('pt-BR')}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tracks List */}
                {playlist.tracks && playlist.tracks.length > 0 ? (
                    <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg overflow-hidden">
                        <div className="p-6 border-b border-gray-700">
                            <h3 className="text-xl font-bold text-white">Músicas da Playlist</h3>
                        </div>

                        <div className="divide-y divide-gray-700">
                            {playlist.tracks.map((playlistTrack: PlaylistTrack, index: number) => {
                                const track = playlistTrack.track;
                                if (!track) return null;

                                return (
                                    <div key={track.id} className="p-4 hover:bg-gray-700/50 transition-colors">
                                        <div className="flex items-center space-x-4">
                                            <div className="w-8 text-center text-gray-400">
                                                {index + 1}
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <h4 className="font-semibold text-white truncate">{track.songName}</h4>
                                                <p className="text-gray-400 text-sm truncate">
                                                    {track.artist}
                                                    {track.style && ` • ${track.style}`}
                                                </p>
                                            </div>

                                            <button
                                                onClick={() => handleRemoveTrack(track.id)}
                                                className="p-2 text-red-400 hover:text-red-300 transition-colors"
                                                title="Remover da playlist"
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <Music className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-white mb-2">Playlist vazia</h3>
                        <p className="text-gray-400 mb-6">Adicione músicas para começar</p>
                        <button
                            onClick={() => setShowAddTracksModal(true)}
                            className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg transition-colors"
                        >
                            Adicionar Músicas
                        </button>
                    </div>
                )}

                {/* Add Tracks Modal */}
                {showAddTracksModal && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                        <div className="bg-gray-800 rounded-lg w-full max-w-4xl max-h-[80vh] overflow-hidden">
                            <div className="flex justify-between items-center p-6 border-b border-gray-700">
                                <h2 className="text-xl font-bold text-white">Adicionar Músicas</h2>
                                <button
                                    onClick={() => {
                                        setShowAddTracksModal(false);
                                        setSelectedTracks(new Set());
                                        setSearchTerm('');
                                    }}
                                    className="text-gray-400 hover:text-white"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            <div className="p-6">
                                {/* Search */}
                                <div className="mb-6">
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                        <input
                                            type="text"
                                            placeholder="Buscar músicas..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-green-500"
                                        />
                                    </div>
                                </div>

                                {/* Tracks List */}
                                <div className="max-h-96 overflow-y-auto space-y-2 mb-6">
                                    {availableTracks.map((track) => (
                                        <div
                                            key={track.id}
                                            className={`p-3 rounded-lg border transition-colors cursor-pointer ${selectedTracks.has(track.id)
                                                ? 'bg-green-900/20 border-green-500'
                                                : 'bg-gray-700/50 border-gray-600 hover:bg-gray-700'
                                                }`}
                                            onClick={() => toggleTrackSelection(track.id)}
                                        >
                                            <div className="flex items-center space-x-3">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedTracks.has(track.id)}
                                                    onChange={() => toggleTrackSelection(track.id)}
                                                    className="w-4 h-4"
                                                />
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="font-semibold text-white truncate">{track.songName}</h4>
                                                    <p className="text-gray-400 text-sm truncate">
                                                        {track.artist}
                                                        {track.style && ` • ${track.style}`}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Actions */}
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-400">
                                        {selectedTracks.size} música(s) selecionada(s)
                                    </span>

                                    <div className="flex space-x-3">
                                        <button
                                            onClick={() => {
                                                setShowAddTracksModal(false);
                                                setSelectedTracks(new Set());
                                                setSearchTerm('');
                                            }}
                                            className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                                        >
                                            Cancelar
                                        </button>
                                        <button
                                            onClick={handleAddTracks}
                                            disabled={selectedTracks.size === 0 || saving}
                                            className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white rounded-lg transition-colors flex items-center space-x-2"
                                        >
                                            {saving ? (
                                                <>
                                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                                    <span>Adicionando...</span>
                                                </>
                                            ) : (
                                                <>
                                                    <Save className="w-4 h-4" />
                                                    <span>Adicionar {selectedTracks.size} Música(s)</span>
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

