'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import {
    Plus,
    Edit,
    Trash2,
    Music,
    Eye,
    EyeOff,
    Star,
    StarOff,
    Search,
    Filter,
    Upload,
    X
} from 'lucide-react';
import { Playlist, CreatePlaylistData, UpdatePlaylistData } from '@/types/playlist';
import { generateManagerPlaylistUrl } from '@/lib/playlist-utils';

export default function ManagerPlaylistPage() {
    const { data: session, status } = useSession();
    const router = useRouter();

    const [playlists, setPlaylists] = useState<Playlist[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingPlaylist, setEditingPlaylist] = useState<Playlist | null>(null);
    const [formData, setFormData] = useState<CreatePlaylistData>({
        name: '',
        description: '',
        coverImage: '',
        isPublic: true,
        isFeatured: false,
        section: ''
    });

    // Verificar se está logado
    useEffect(() => {
        if (status === 'loading') return;

        if (!session?.user?.email) {
            router.push('/auth/signin');
            return;
        }

        fetchPlaylists();
    }, [session, status, router]);

    const fetchPlaylists = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/playlists?limit=100');
            const data = await response.json();

            if (response.ok) {
                setPlaylists(data.playlists || []);
            } else {
                toast.error('Erro ao carregar playlists');
            }
        } catch (error) {
            console.error('Error fetching playlists:', error);
            toast.error('Erro ao carregar playlists');
        } finally {
            setLoading(false);
        }
    };

    const handleCreatePlaylist = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.name.trim()) {
            toast.error('Nome da playlist é obrigatório');
            return;
        }

        try {
            const response = await fetch('/api/playlists', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (response.ok) {
                toast.success('Playlist criada com sucesso!');
                setShowCreateModal(false);
                setFormData({ name: '', description: '', coverImage: '', isPublic: true, isFeatured: false, section: '' });
                fetchPlaylists();
            } else {
                toast.error(data.error || 'Erro ao criar playlist');
            }
        } catch (error) {
            console.error('Error creating playlist:', error);
            toast.error('Erro ao criar playlist');
        }
    };

    const handleEditPlaylist = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!editingPlaylist || !formData.name.trim()) {
            toast.error('Nome da playlist é obrigatório');
            return;
        }

        try {
            const response = await fetch(`/api/playlists/${editingPlaylist.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (response.ok) {
                toast.success('Playlist atualizada com sucesso!');
                setShowEditModal(false);
                setEditingPlaylist(null);
                setFormData({ name: '', description: '', coverImage: '', isPublic: true, isFeatured: false, section: '' });
                fetchPlaylists();
            } else {
                toast.error(data.error || 'Erro ao atualizar playlist');
            }
        } catch (error) {
            console.error('Error updating playlist:', error);
            toast.error('Erro ao atualizar playlist');
        }
    };

    const handleDeletePlaylist = async (playlist: Playlist) => {
        if (!confirm(`Tem certeza que deseja deletar a playlist "${playlist.name}"?`)) {
            return;
        }

        try {
            const response = await fetch(`/api/playlists/${playlist.id}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                toast.success('Playlist deletada com sucesso!');
                fetchPlaylists();
            } else {
                const data = await response.json();
                toast.error(data.error || 'Erro ao deletar playlist');
            }
        } catch (error) {
            console.error('Error deleting playlist:', error);
            toast.error('Erro ao deletar playlist');
        }
    };

    const openEditModal = (playlist: Playlist) => {
        setEditingPlaylist(playlist);
        setFormData({
            name: playlist.name,
            description: playlist.description || '',
            coverImage: playlist.coverImage || '',
            isPublic: playlist.isPublic,
            isFeatured: playlist.isFeatured,
            section: playlist.section || ''
        });
        setShowEditModal(true);
    };

    const filteredPlaylists = playlists.filter(playlist =>
        playlist.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (playlist.description && playlist.description.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    if (status === 'loading' || loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
                <div className="text-white text-xl">Carregando...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
            <div className="container mx-auto px-4 py-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-2">Gerenciar Playlists</h1>
                        <p className="text-gray-400">Crie e gerencie playlists da plataforma</p>
                    </div>

                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="mt-4 md:mt-0 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg flex items-center space-x-2 transition-colors"
                    >
                        <Plus className="w-5 h-5" />
                        <span>Nova Playlist</span>
                    </button>
                </div>

                {/* Search and Filters */}
                <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 mb-8">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input
                                    type="text"
                                    placeholder="Buscar playlists..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-green-500"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Playlists Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredPlaylists.map((playlist) => (
                        <div key={playlist.id} className="bg-gray-800/50 backdrop-blur-sm rounded-lg overflow-hidden hover:bg-gray-800/70 transition-colors">
                            {/* Cover Image */}
                            <div className="aspect-video bg-gradient-to-br from-green-600 to-blue-600 relative">
                                {playlist.coverImage ? (
                                    <img
                                        src={playlist.coverImage}
                                        alt={playlist.name}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                        <Music className="w-16 h-16 text-white/50" />
                                    </div>
                                )}

                                {/* Status Badges */}
                                <div className="absolute top-3 right-3 flex flex-col gap-2">
                                    {playlist.isFeatured && (
                                        <div className="bg-yellow-500 text-black px-2 py-1 rounded-full text-xs font-bold">
                                            <Star className="w-3 h-3 inline mr-1" />
                                            DESTAQUE
                                        </div>
                                    )}
                                    <div className={`px-2 py-1 rounded-full text-xs font-bold ${playlist.isPublic
                                        ? 'bg-green-500 text-white'
                                        : 'bg-gray-500 text-white'
                                        }`}>
                                        {playlist.isPublic ? (
                                            <>
                                                <Eye className="w-3 h-3 inline mr-1" />
                                                PÚBLICA
                                            </>
                                        ) : (
                                            <>
                                                <EyeOff className="w-3 h-3 inline mr-1" />
                                                PRIVADA
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="p-6">
                                <h3 className="text-xl font-bold text-white mb-2">{playlist.name}</h3>
                                {playlist.description && (
                                    <p className="text-gray-400 text-sm mb-4 line-clamp-2">{playlist.description}</p>
                                )}

                                <div className="flex items-center justify-between text-sm text-gray-400 mb-4">
                                    <span>{playlist.trackCount || 0} músicas</span>
                                    <span>{new Date(playlist.createdAt).toLocaleDateString('pt-BR')}</span>
                                </div>

                                {/* Actions */}
                                <div className="flex space-x-2">
                                    <button
                                        onClick={() => router.push(`/playlists/${playlist.id}`)}
                                        className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-sm transition-colors"
                                        title="Ver playlist"
                                    >
                                        <Eye className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => router.push(generateManagerPlaylistUrl(playlist))}
                                        className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded-lg text-sm transition-colors"
                                        title="Gerenciar músicas"
                                    >
                                        <Music className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => openEditModal(playlist)}
                                        className="bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-2 rounded-lg text-sm transition-colors"
                                        title="Editar playlist"
                                    >
                                        <Edit className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => handleDeletePlaylist(playlist)}
                                        className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg text-sm transition-colors"
                                        title="Deletar playlist"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {filteredPlaylists.length === 0 && !loading && (
                    <div className="text-center py-12">
                        <Music className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-white mb-2">Nenhuma playlist encontrada</h3>
                        <p className="text-gray-400 mb-6">
                            {searchTerm ? 'Tente ajustar os filtros de busca' : 'Crie sua primeira playlist'}
                        </p>
                        {!searchTerm && (
                            <button
                                onClick={() => setShowCreateModal(true)}
                                className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg transition-colors"
                            >
                                Criar Playlist
                            </button>
                        )}
                    </div>
                )}
            </div>

            {/* Create Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-gray-800 rounded-lg w-full max-w-md">
                        <div className="flex justify-between items-center p-6 border-b border-gray-700">
                            <h2 className="text-xl font-bold text-white">Nova Playlist</h2>
                            <button
                                onClick={() => setShowCreateModal(false)}
                                className="text-gray-400 hover:text-white"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <form onSubmit={handleCreatePlaylist} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Nome *
                                </label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-green-500"
                                    placeholder="Nome da playlist"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Descrição
                                </label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-green-500"
                                    placeholder="Descrição da playlist"
                                    rows={3}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    URL da Capa
                                </label>
                                <input
                                    type="url"
                                    value={formData.coverImage}
                                    onChange={(e) => setFormData({ ...formData, coverImage: e.target.value })}
                                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-green-500"
                                    placeholder="https://exemplo.com/capa.jpg"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Seção
                                </label>
                                <select
                                    value={formData.section || ''}
                                    onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-green-500"
                                >
                                    <option value="">Selecione uma seção</option>
                                    <option value="Sua Vibe">Sua Vibe</option>
                                    <option value="Final de Semana">Final de Semana</option>
                                    <option value="Trabalho">Trabalho</option>
                                    <option value="Festa">Festa</option>
                                    <option value="Relaxamento">Relaxamento</option>
                                    <option value="Outras">Outras</option>
                                </select>
                            </div>

                            <div className="flex space-x-4">
                                <label className="flex items-center">
                                    <input
                                        type="checkbox"
                                        checked={formData.isPublic}
                                        onChange={(e) => setFormData({ ...formData, isPublic: e.target.checked })}
                                        className="mr-2"
                                    />
                                    <span className="text-gray-300">Pública</span>
                                </label>

                                <label className="flex items-center">
                                    <input
                                        type="checkbox"
                                        checked={formData.isFeatured}
                                        onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                                        className="mr-2"
                                    />
                                    <span className="text-gray-300">Destaque</span>
                                </label>
                            </div>

                            <div className="flex space-x-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowCreateModal(false)}
                                    className="flex-1 px-4 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                                >
                                    Criar
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit Modal */}
            {showEditModal && editingPlaylist && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-gray-800 rounded-lg w-full max-w-md">
                        <div className="flex justify-between items-center p-6 border-b border-gray-700">
                            <h2 className="text-xl font-bold text-white">Editar Playlist</h2>
                            <button
                                onClick={() => setShowEditModal(false)}
                                className="text-gray-400 hover:text-white"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <form onSubmit={handleEditPlaylist} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Nome *
                                </label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-green-500"
                                    placeholder="Nome da playlist"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Descrição
                                </label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-green-500"
                                    placeholder="Descrição da playlist"
                                    rows={3}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    URL da Capa
                                </label>
                                <input
                                    type="url"
                                    value={formData.coverImage}
                                    onChange={(e) => setFormData({ ...formData, coverImage: e.target.value })}
                                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-green-500"
                                    placeholder="https://exemplo.com/capa.jpg"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Seção
                                </label>
                                <select
                                    value={formData.section || ''}
                                    onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-green-500"
                                >
                                    <option value="">Selecione uma seção</option>
                                    <option value="Sua Vibe">Sua Vibe</option>
                                    <option value="Final de Semana">Final de Semana</option>
                                    <option value="Trabalho">Trabalho</option>
                                    <option value="Festa">Festa</option>
                                    <option value="Relaxamento">Relaxamento</option>
                                    <option value="Outras">Outras</option>
                                </select>
                            </div>

                            <div className="flex space-x-4">
                                <label className="flex items-center">
                                    <input
                                        type="checkbox"
                                        checked={formData.isPublic}
                                        onChange={(e) => setFormData({ ...formData, isPublic: e.target.checked })}
                                        className="mr-2"
                                    />
                                    <span className="text-gray-300">Pública</span>
                                </label>

                                <label className="flex items-center">
                                    <input
                                        type="checkbox"
                                        checked={formData.isFeatured}
                                        onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                                        className="mr-2"
                                    />
                                    <span className="text-gray-300">Destaque</span>
                                </label>
                            </div>

                            <div className="flex space-x-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowEditModal(false)}
                                    className="flex-1 px-4 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                                >
                                    Salvar
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
