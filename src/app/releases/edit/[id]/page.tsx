"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
    ArrowLeft,
    Save,
    FileText,
    Music,
    Album,
    Star,
    Crown,
    Globe,
    Instagram,
    Facebook,
    Youtube,
    Music2,
    Disc,
    Users,
    MessageCircle,
    CheckCircle,
    AlertCircle,
    Info,
    Clock,
    User,
    Building,
    Tag
} from "lucide-react";
import MainLayout from "@/components/layout/MainLayout";
import { useToastContext } from "@/context/ToastContext";

interface ReleaseFormData {
    title: string;
    artist: string;
    albumArt: string;
    description: string;
    genre: string;
    releaseDate: string;
    trackCount: number;
    duration: string;
    label: string;
    producer: string;
    featured: boolean;
    exclusive: boolean;
    streaming: {
        spotify: string;
        deezer: string;
        apple: string;
        youtube: string;
    };
    social: {
        instagram: string;
        facebook: string;
        twitter: string;
        website: string;
    };
}

const EditReleasePage = () => {
    const params = useParams();
    const router = useRouter();
    const { data: session } = useSession();
    const { showToast } = useToastContext();

    // Estados
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    // Estado do formulário
    const [formData, setFormData] = useState<ReleaseFormData>({
        title: "",
        artist: "",
        albumArt: "",
        description: "",
        genre: "",
        releaseDate: "",
        trackCount: 0,
        duration: "",
        label: "",
        producer: "",
        featured: false,
        exclusive: false,
        streaming: {
            spotify: "",
            deezer: "",
            apple: "",
            youtube: ""
        },
        social: {
            instagram: "",
            facebook: "",
            twitter: "",
            website: ""
        }
    });

    // Verificar se o usuário é admin
    if (!session?.user?.email || !session.user.email.includes('admin')) {
        return (
            <MainLayout>
                <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
                    <div className="text-center">
                        <div className="w-24 h-24 bg-red-600/20 rounded-full flex items-center justify-center mx-auto mb-6">
                            <AlertCircle className="h-12 w-12 text-red-400" />
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-4">Acesso Negado</h3>
                        <p className="text-gray-400 mb-6">
                            Você precisa ser administrador para acessar esta página.
                        </p>
                        <button
                            onClick={() => router.push('/releases')}
                            className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors"
                        >
                            Voltar aos Releases
                        </button>
                    </div>
                </div>
            </MainLayout>
        );
    }

    // Carregar dados do release
    useEffect(() => {
        const loadRelease = async () => {
            if (!params.id) return;

            try {
                setLoading(true);
                const response = await fetch(`/api/releases/${params.id}`);

                if (!response.ok) {
                    throw new Error('Release não encontrado');
                }

                const data = await response.json();

                // Formatar dados para o formulário
                setFormData({
                    title: data.title || "",
                    artist: data.artist || "",
                    albumArt: data.albumArt || "",
                    description: data.description || "",
                    genre: data.genre || "",
                    releaseDate: data.releaseDate ? new Date(data.releaseDate).toISOString().split('T')[0] : "",
                    trackCount: data.trackCount || 0,
                    duration: data.duration || "",
                    label: data.label || "",
                    producer: data.producer || "",
                    featured: data.featured || false,
                    exclusive: data.exclusive || false,
                    streaming: {
                        spotify: data.streaming?.spotify || "",
                        deezer: data.streaming?.deezer || "",
                        apple: data.streaming?.apple || "",
                        youtube: data.streaming?.youtube || ""
                    },
                    social: {
                        instagram: data.social?.instagram || "",
                        facebook: data.social?.facebook || "",
                        twitter: data.social?.twitter || "",
                        website: data.social?.website || ""
                    }
                });
            } catch (error) {
                console.error('Erro ao carregar release:', error);
                setError('Erro ao carregar release');
                showToast('❌ Erro ao carregar release', 'error');
            } finally {
                setLoading(false);
            }
        };

        loadRelease();
    }, [params.id]);

    // Lidar com mudanças no formulário
    const handleFormChange = (field: string, value: any) => {
        if (field.includes('.')) {
            const [parent, child] = field.split('.');
            setFormData(prev => ({
                ...prev,
                [parent]: {
                    ...(prev[parent as keyof ReleaseFormData] as any),
                    [child]: value
                }
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [field]: value
            }));
        }
    };

    // Salvar alterações
    const handleSave = async () => {
        try {
            setSaving(true);

            const response = await fetch(`/api/releases/${params.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            if (!response.ok) {
                throw new Error('Erro ao atualizar release');
            }

            showToast('✅ Release atualizado com sucesso!', 'success');

            // Redirecionar para a página do release
            setTimeout(() => {
                router.push(`/releases/${params.id}`);
            }, 1500);
        } catch (error) {
            console.error('Erro ao salvar release:', error);
            showToast('❌ Erro ao salvar release', 'error');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <MainLayout>
                <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
                    <div className="flex items-center justify-center min-h-screen">
                        <div className="text-center">
                            <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                            <p className="text-gray-400 text-lg">Carregando release...</p>
                        </div>
                    </div>
                </div>
            </MainLayout>
        );
    }

    if (error) {
        return (
            <MainLayout>
                <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
                    <div className="text-center">
                        <div className="w-24 h-24 bg-red-600/20 rounded-full flex items-center justify-center mx-auto mb-6">
                            <AlertCircle className="h-12 w-12 text-red-400" />
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-4">Erro ao carregar</h3>
                        <p className="text-gray-400 mb-6">{error}</p>
                        <button
                            onClick={() => router.push('/releases')}
                            className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors"
                        >
                            Voltar aos Releases
                        </button>
                    </div>
                </div>
            </MainLayout>
        );
    }

    return (
        <MainLayout>
            <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
                {/* Header */}
                <div className="bg-gradient-to-r from-purple-900/20 via-blue-900/20 to-emerald-900/20 border-b border-gray-700/40">
                    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                        <div className="flex items-center gap-4 mb-6">
                            <button
                                onClick={() => router.push(`/releases/${params.id}`)}
                                className="p-2 bg-gray-800/50 hover:bg-gray-700/50 text-gray-300 rounded-lg transition-colors"
                            >
                                <ArrowLeft className="h-5 w-5" />
                            </button>
                            <div>
                                <h1 className="text-3xl font-bold text-white">Editar Release</h1>
                                <p className="text-gray-400">Edite as informações do release</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Conteúdo */}
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="space-y-8">
                        {/* Informações Básicas */}
                        <div className="bg-gray-800/30 backdrop-blur-sm rounded-2xl border border-gray-700/30 p-6">
                            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                                <Music className="h-5 w-5 text-purple-400" />
                                Informações Básicas
                            </h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        Título do Álbum *
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.title}
                                        onChange={(e) => handleFormChange('title', e.target.value)}
                                        className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50"
                                        placeholder="Ex: Universe"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        Artista *
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.artist}
                                        onChange={(e) => handleFormChange('artist', e.target.value)}
                                        className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50"
                                        placeholder="Ex: DJ Jéssika Luana"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        URL da Capa do Álbum *
                                    </label>
                                    <input
                                        type="url"
                                        value={formData.albumArt}
                                        onChange={(e) => handleFormChange('albumArt', e.target.value)}
                                        className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50"
                                        placeholder="https://example.com/album-art.jpg"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        Gênero Musical *
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.genre}
                                        onChange={(e) => handleFormChange('genre', e.target.value)}
                                        className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50"
                                        placeholder="Ex: Progressive House"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        Data de Lançamento *
                                    </label>
                                    <input
                                        type="date"
                                        value={formData.releaseDate}
                                        onChange={(e) => handleFormChange('releaseDate', e.target.value)}
                                        className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        Número de Tracks *
                                    </label>
                                    <input
                                        type="number"
                                        value={formData.trackCount}
                                        onChange={(e) => handleFormChange('trackCount', parseInt(e.target.value))}
                                        min="1"
                                        className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50"
                                        placeholder="12"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        Duração Total
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.duration}
                                        onChange={(e) => handleFormChange('duration', e.target.value)}
                                        className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50"
                                        placeholder="Ex: 78:32"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        Label/Gravadora
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.label}
                                        onChange={(e) => handleFormChange('label', e.target.value)}
                                        className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50"
                                        placeholder="Ex: Nexor Records"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        Produtor
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.producer}
                                        onChange={(e) => handleFormChange('producer', e.target.value)}
                                        className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50"
                                        placeholder="Ex: DJ Jéssika Luana"
                                    />
                                </div>
                            </div>

                            <div className="mt-6">
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Descrição
                                </label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => handleFormChange('description', e.target.value)}
                                    rows={3}
                                    className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50"
                                    placeholder="Descreva o álbum, inspirações, conceito..."
                                />
                            </div>
                        </div>

                        {/* Configurações */}
                        <div className="bg-gray-800/30 backdrop-blur-sm rounded-2xl border border-gray-700/30 p-6">
                            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                                <Star className="h-5 w-5 text-yellow-400" />
                                Configurações
                            </h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <label className="flex items-center gap-3 p-4 bg-gray-700/30 rounded-xl cursor-pointer hover:bg-gray-700/50 transition-colors">
                                    <input
                                        type="checkbox"
                                        checked={formData.featured}
                                        onChange={(e) => handleFormChange('featured', e.target.checked)}
                                        className="w-5 h-5 text-purple-600 bg-gray-700 border-gray-600 rounded focus:ring-purple-500 focus:ring-2"
                                    />
                                    <div>
                                        <div className="text-white font-medium">⭐ Featured</div>
                                        <div className="text-gray-400 text-sm">Destacar este release na plataforma</div>
                                    </div>
                                </label>

                                <label className="flex items-center gap-3 p-4 bg-gray-700/30 rounded-xl cursor-pointer hover:bg-gray-700/50 transition-colors">
                                    <input
                                        type="checkbox"
                                        checked={formData.exclusive}
                                        onChange={(e) => handleFormChange('exclusive', e.target.checked)}
                                        className="w-5 h-5 text-emerald-600 bg-gray-700 border-gray-600 rounded focus:ring-emerald-500 focus:ring-2"
                                    />
                                    <div>
                                        <div className="text-white font-medium">👑 Exclusive</div>
                                        <div className="text-gray-400 text-sm">Release exclusivo da plataforma</div>
                                    </div>
                                </label>
                            </div>
                        </div>

                        {/* Links de Streaming */}
                        <div className="bg-gray-800/30 backdrop-blur-sm rounded-2xl border border-gray-700/30 p-6">
                            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                                <Globe className="h-5 w-5 text-green-400" />
                                Links de Streaming
                            </h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                                        <Music2 className="h-4 w-4 text-green-400" />
                                        Spotify
                                    </label>
                                    <input
                                        type="url"
                                        value={formData.streaming.spotify}
                                        onChange={(e) => handleFormChange('streaming.spotify', e.target.value)}
                                        className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50"
                                        placeholder="https://open.spotify.com/album/..."
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                                        <Music2 className="h-4 w-4 text-gray-400" />
                                        Apple Music
                                    </label>
                                    <input
                                        type="url"
                                        value={formData.streaming.apple}
                                        onChange={(e) => handleFormChange('streaming.apple', e.target.value)}
                                        className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500/50 focus:border-gray-500/50"
                                        placeholder="https://music.apple.com/album/..."
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                                        <Disc className="h-4 w-4 text-blue-400" />
                                        Deezer
                                    </label>
                                    <input
                                        type="url"
                                        value={formData.streaming.deezer}
                                        onChange={(e) => handleFormChange('streaming.deezer', e.target.value)}
                                        className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50"
                                        placeholder="https://www.deezer.com/album/..."
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                                        <Youtube className="h-4 w-4 text-red-400" />
                                        YouTube
                                    </label>
                                    <input
                                        type="url"
                                        value={formData.streaming.youtube}
                                        onChange={(e) => handleFormChange('streaming.youtube', e.target.value)}
                                        className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50"
                                        placeholder="https://www.youtube.com/playlist?list=..."
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Redes Sociais */}
                        <div className="bg-gray-800/30 backdrop-blur-sm rounded-2xl border border-gray-700/30 p-6">
                            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                                <Users className="h-5 w-5 text-blue-400" />
                                Redes Sociais
                            </h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                                        <Instagram className="h-4 w-4 text-pink-400" />
                                        Instagram
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.social.instagram}
                                        onChange={(e) => handleFormChange('social.instagram', e.target.value)}
                                        className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500/50 focus:border-pink-500/50"
                                        placeholder="@username"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                                        <Facebook className="h-4 w-4 text-blue-400" />
                                        Facebook
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.social.facebook}
                                        onChange={(e) => handleFormChange('social.facebook', e.target.value)}
                                        className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50"
                                        placeholder="Nome da página"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                                        <MessageCircle className="h-4 w-4 text-blue-400" />
                                        Twitter
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.social.twitter}
                                        onChange={(e) => handleFormChange('social.twitter', e.target.value)}
                                        className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50"
                                        placeholder="@username"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                                        <Globe className="h-4 w-4 text-purple-400" />
                                        Website
                                    </label>
                                    <input
                                        type="url"
                                        value={formData.social.website}
                                        onChange={(e) => handleFormChange('social.website', e.target.value)}
                                        className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50"
                                        placeholder="https://example.com"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Botões de Ação */}
                        <div className="flex flex-col sm:flex-row gap-4">
                            <button
                                onClick={handleSave}
                                disabled={saving}
                                className="flex-1 px-6 py-4 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-2xl font-semibold hover:from-purple-600 hover:to-blue-600 transition-all duration-300 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {saving ? (
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                ) : (
                                    <Save className="h-5 w-5" />
                                )}
                                {saving ? 'Salvando...' : 'Salvar Alterações'}
                            </button>

                            <button
                                onClick={() => router.push(`/releases/${params.id}`)}
                                className="px-6 py-4 bg-gray-700 text-white rounded-2xl font-semibold hover:bg-gray-600 transition-all duration-300 flex items-center gap-2"
                            >
                                <ArrowLeft className="h-5 w-5" />
                                Cancelar
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
};

export default EditReleasePage;
