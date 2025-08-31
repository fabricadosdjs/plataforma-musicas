"use client";

import React, { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
    ArrowLeft,
    Upload,
    Music,
    Star,
    Globe,
    Instagram,
    Facebook,
    Youtube,
    Save,
    Plus,
    Eye,
    EyeOff,
    CheckCircle,
    AlertCircle,
    Users,
    MessageCircle
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

const AddReleasePage = () => {
    const { data: session } = useSession();
    const router = useRouter();
    const { showToast } = useToastContext();

    // Estados
    const [activeTab, setActiveTab] = useState<"form" | "json">("form");
    const [jsonInput, setJsonInput] = useState("");
    const [isJsonValid, setIsJsonValid] = useState(false);
    const [jsonError, setJsonError] = useState("");
    const [previewData, setPreviewData] = useState<ReleaseFormData | null>(null);
    const [showPreview, setShowPreview] = useState(false);

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

    // Validar JSON
    const validateJson = (jsonString: string) => {
        try {
            const parsed = JSON.parse(jsonString);

            // Verificar campos obrigatórios
            const requiredFields = ['title', 'artist', 'albumArt', 'genre', 'releaseDate', 'trackCount'];
            const missingFields = requiredFields.filter(field => !parsed[field]);

            if (missingFields.length > 0) {
                setJsonError(`Campos obrigatórios ausentes: ${missingFields.join(', ')}`);
                setIsJsonValid(false);
                return null;
            }

            // Verificar tipos
            if (typeof parsed.title !== 'string' || typeof parsed.artist !== 'string') {
                setJsonError('Título e artista devem ser strings');
                setIsJsonValid(false);
                return null;
            }

            if (typeof parsed.trackCount !== 'number' || parsed.trackCount <= 0) {
                setJsonError('Número de tracks deve ser um número positivo');
                setIsJsonValid(false);
                return null;
            }

            setJsonError("");
            setIsJsonValid(true);
            return parsed;
        } catch (error) {
            setJsonError("JSON inválido");
            setIsJsonValid(false);
            return null;
        }
    };

    // Atualizar JSON quando o formulário mudar
    const updateJsonFromForm = () => {
        const jsonString = JSON.stringify(formData, null, 2);
        setJsonInput(jsonString);
        validateJson(jsonString);
    };

    // Atualizar formulário quando o JSON mudar
    const updateFormFromJson = () => {
        const parsed = validateJson(jsonInput);
        if (parsed) {
            setFormData(parsed);
            setPreviewData(parsed);
        }
    };

    // Lidar com mudanças no formulário
    const handleFormChange = (
        field: string,
        value: string | number | boolean
    ) => {
        if (field.includes('.')) {
            const [parent, child] = field.split('.') as [keyof ReleaseFormData, string];
            setFormData(prev => ({
                ...prev,
                [parent]: {
                    ...((prev[parent] as Record<string, string | number | boolean>) ?? {}),
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

    // Salvar release
    const handleSave = async () => {
        try {
            const response = await fetch('/api/releases', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            if (!response.ok) {
                throw new Error('Erro ao salvar release');
            }

            const data = await response.json();
            console.log('Release salvo:', data);

            showToast('✅ Release salvo com sucesso!', 'success');

            // Redirecionar para a página de releases
            setTimeout(() => {
                router.push('/releases');
            }, 1500);
        } catch (error) {
            console.error('Erro ao salvar release:', error);
            showToast('❌ Erro ao salvar release', 'error');
        }
    };

    // Exemplo de JSON
    const exampleJson = `{
  "title": "Universe",
  "artist": "DJ Jéssika Luana",
  "albumArt": "https://example.com/album-art.jpg",
  "description": "Primeiro álbum completo da DJ Jéssika Luana",
  "genre": "Progressive House",
  "releaseDate": "2025-01-15",
  "trackCount": 12,
  "duration": "78:32",
  "label": "Nexor Records",
  "producer": "DJ Jéssika Luana",
  "featured": true,
  "exclusive": true,
  "streaming": {
    "spotify": "https://open.spotify.com/album/example",
    "deezer": "https://www.deezer.com/album/example",
    "apple": "https://music.apple.com/album/example",
    "youtube": "https://www.youtube.com/playlist?list=example"
  },
  "social": {
    "instagram": "@djessikaluana",
    "facebook": "DJ Jéssika Luana",
    "twitter": "@djessikaluana",
    "website": "https://djessikaluana.com"
  }
}`;

    return (
        <MainLayout>
            <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
                {/* Header */}
                <div className="bg-gradient-to-r from-purple-900/20 via-blue-900/20 to-emerald-900/20 border-b border-gray-700/40">
                    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                        <div className="flex items-center gap-4 mb-6">
                            <button
                                onClick={() => router.push('/releases')}
                                className="p-2 bg-gray-800/50 hover:bg-gray-700/50 text-gray-300 rounded-lg transition-colors"
                            >
                                <ArrowLeft className="h-5 w-5" />
                            </button>
                            <div>
                                <h1 className="text-3xl font-bold text-white">Adicionar Release</h1>
                                <p className="text-gray-400">Crie um novo release para a plataforma</p>
                            </div>
                        </div>

                        {/* Tabs */}
                        <div className="flex space-x-1 bg-gray-800/50 rounded-xl p-1">
                            <button
                                onClick={() => setActiveTab("form")}
                                className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${activeTab === "form"
                                    ? "bg-purple-600 text-white shadow-lg"
                                    : "text-gray-400 hover:text-white hover:bg-gray-700/50"
                                    }`}
                            >
                                <div className="flex items-center gap-2 justify-center">
                                    <Album className="h-4 w-4" />
                                    Formulário
                                </div>
                            </button>
                            <button
                                onClick={() => setActiveTab("json")}
                                className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${activeTab === "json"
                                    ? "bg-purple-600 text-white shadow-lg"
                                    : "text-gray-400 hover:text-white hover:bg-gray-700/50"
                                    }`}
                            >
                                <div className="flex items-center gap-2 justify-center">
                                    <FileText className="h-4 w-4" />
                                    JSON
                                </div>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Conteúdo */}
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {activeTab === "form" ? (
                        /* Formulário */
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
                                            <Music className="h-4 w-4 text-green-400" />
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
                                            <Music className="h-4 w-4 text-gray-400" />
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
                                            <Music className="h-4 w-4 text-blue-400" />
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
                                    className="flex-1 px-6 py-4 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-2xl font-semibold hover:from-purple-600 hover:to-blue-600 transition-all duration-300 shadow-lg flex items-center justify-center gap-2"
                                >
                                    <Save className="h-5 w-5" />
                                    Salvar Release
                                </button>

                                <button
                                    onClick={() => updateJsonFromForm()}
                                    className="px-6 py-4 bg-gray-700 text-white rounded-2xl font-semibold hover:bg-gray-600 transition-all duration-300 flex items-center gap-2"
                                >
                                    <FileText className="h-5 w-5" />
                                    Ver JSON
                                </button>

                                <button
                                    onClick={() => setActiveTab("json")}
                                    className="px-6 py-4 bg-emerald-600 text-white rounded-2xl font-semibold hover:bg-emerald-700 transition-all duration-300 flex items-center gap-2"
                                >
                                    <Upload className="h-5 w-5" />
                                    Ir para JSON
                                </button>
                            </div>
                        </div>
                    ) : (
                        /* JSON Input */
                        <div className="space-y-6">
                            <div className="bg-gray-800/30 backdrop-blur-sm rounded-2xl border border-gray-700/30 p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                        <FileText className="h-5 w-5 text-blue-400" />
                                        Input JSON
                                    </h2>

                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => setJsonInput(exampleJson)}
                                            className="px-4 py-2 bg-blue-600/20 text-blue-400 rounded-lg hover:bg-blue-600/40 transition-colors text-sm"
                                        >
                                            Exemplo
                                        </button>

                                        <button
                                            onClick={() => setShowPreview(!showPreview)}
                                            className="px-4 py-2 bg-purple-600/20 text-purple-400 rounded-lg hover:bg-purple-600/40 transition-colors text-sm flex items-center gap-2"
                                        >
                                            {showPreview ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                            Preview
                                        </button>
                                    </div>
                                </div>

                                <textarea
                                    value={jsonInput}
                                    onChange={(e) => {
                                        setJsonInput(e.target.value);
                                        validateJson(e.target.value);
                                    }}
                                    rows={20}
                                    className="w-full px-4 py-4 bg-gray-900/50 border border-gray-600/50 rounded-xl text-green-400 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 resize-none"
                                    placeholder="Cole ou digite o JSON do release aqui..."
                                />

                                {/* Status do JSON */}
                                <div className="mt-4 flex items-center gap-2">
                                    {isJsonValid ? (
                                        <div className="flex items-center gap-2 text-green-400">
                                            <CheckCircle className="h-5 w-5" />
                                            <span>JSON válido</span>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-2 text-red-400">
                                            <AlertCircle className="h-5 w-5" />
                                            <span>{jsonError || "JSON inválido"}</span>
                                        </div>
                                    )}
                                </div>

                                {/* Dica */}
                                <div className="mt-4 p-4 bg-blue-600/20 border border-blue-600/30 rounded-xl">
                                    <div className="flex items-start gap-3">
                                        <Info className="h-5 w-5 text-blue-400 mt-0.5" />
                                        <div className="text-blue-300 text-sm">
                                            <p className="font-medium mb-1">💡 Dica:</p>
                                            <p>Use o botão "Exemplo" para ver um modelo de JSON válido. Todos os campos marcados com * são obrigatórios.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Preview */}
                            {showPreview && previewData && (
                                <div className="bg-gray-800/30 backdrop-blur-sm rounded-2xl border border-gray-700/30 p-6">
                                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                        <Eye className="h-5 w-5 text-purple-400" />
                                        Preview do Release
                                    </h3>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <h4 className="text-white font-semibold mb-2">Informações Básicas</h4>
                                            <div className="space-y-2 text-sm">
                                                <div><span className="text-gray-400">Título:</span> <span className="text-white">{previewData.title}</span></div>
                                                <div><span className="text-gray-400">Artista:</span> <span className="text-white">{previewData.artist}</span></div>
                                                <div><span className="text-gray-400">Gênero:</span> <span className="text-white">{previewData.genre}</span></div>
                                                <div><span className="text-gray-400">Tracks:</span> <span className="text-white">{previewData.trackCount}</span></div>
                                                <div><span className="text-gray-400">Data:</span> <span className="text-white">{previewData.releaseDate}</span></div>
                                            </div>
                                        </div>

                                        <div>
                                            <h4 className="text-white font-semibold mb-2">Configurações</h4>
                                            <div className="space-y-2 text-sm">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-gray-400">Featured:</span>
                                                    {previewData.featured ? <span className="text-yellow-400">⭐ Sim</span> : <span className="text-gray-500">Não</span>}
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-gray-400">Exclusive:</span>
                                                    {previewData.exclusive ? <span className="text-emerald-400">👑 Sim</span> : <span className="text-gray-500">Não</span>}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Botões de Ação */}
                            <div className="flex flex-col sm:flex-row gap-4">
                                <button
                                    onClick={updateFormFromJson}
                                    disabled={!isJsonValid}
                                    className="flex-1 px-6 py-4 bg-blue-600 text-white rounded-2xl font-semibold hover:bg-blue-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    <Upload className="h-5 w-5" />
                                    Aplicar JSON ao Formulário
                                </button>

                                <button
                                    onClick={() => setActiveTab("form")}
                                    className="px-6 py-4 bg-gray-700 text-white rounded-2xl font-semibold hover:bg-gray-600 transition-all duration-300 flex items-center gap-2"
                                >
                                    <Album className="h-5 w-5" />
                                    Ir para Formulário
                                </button>

                                <button
                                    onClick={handleSave}
                                    disabled={!isJsonValid}
                                    className="px-6 py-4 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-2xl font-semibold hover:from-purple-600 hover:to-blue-600 transition-all duration-300 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                >
                                    <Save className="h-5 w-5" />
                                    Salvar Release
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </MainLayout>
    );
};

export default AddReleasePage;
