"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
    ArrowLeft,
    Music,
    Play,
    Heart,
    Download,
    Share2,
    Star,
    Crown,
    Instagram,
    Facebook,
    Youtube,
    Album,
    Disc,
    Globe,
    Edit,
    Trash2,
    Clock
} from "lucide-react";
import Image from "next/image";
import MainLayout from "@/components/layout/MainLayout";
import { useToastContext } from "@/context/ToastContext";

interface Track {
    id: number;
    songName: string;
    artist: string;
    style: string;
    duration: string;
    bpm: number;
    key: string;
    downloadUrl: string;
    imageUrl?: string;
    releaseDate: string;
    genre: string;
    featured?: boolean;
    exclusive?: boolean;
}

interface Release {
    id: number;
    title: string;
    artist: string;
    albumArt: string;
    description?: string;
    genre: string;
    releaseDate: string;
    trackCount: number;
    duration?: string;
    label?: string;
    producer?: string;
    featured: boolean;
    exclusive: boolean;
    streaming?: {
        spotify?: string;
        deezer?: string;
        apple?: string;
        youtube?: string;
    };
    social?: {
        instagram?: string;
        facebook?: string;
        twitter?: string;
        website?: string;
    };
    tracks: Track[];
}

const ReleaseDetailPage = () => {
    const params = useParams();
    const router = useRouter();
    const { data: session } = useSession();
    const { showToast } = useToastContext();

    // Estados
    const [release, setRelease] = useState<Release | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Estados para player
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
    const [audio, setAudio] = useState<HTMLAudioElement | null>(null);

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
                setRelease(data);
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

    // Função para tocar música
    const handlePlayTrack = (track: Track) => {
        if (isPlaying && currentTrack?.id === track.id) {
            // Pausar música atual
            if (audio) {
                audio.pause();
            }
            setIsPlaying(false);
            setCurrentTrack(null);
            showToast('⏸️ Música pausada', 'info');
        } else {
            // Parar música anterior se houver
            if (audio) {
                audio.pause();
            }

            // Criar novo áudio
            const newAudio = new Audio(track.downloadUrl || track.imageUrl);
            newAudio.volume = 0.7;

            newAudio.addEventListener('ended', () => {
                setIsPlaying(false);
                setCurrentTrack(null);
            });

            newAudio.play().then(() => {
                setIsPlaying(true);
                setCurrentTrack(track);
                setAudio(newAudio);
                showToast(`🎵 Tocando: ${track.songName}`, 'success');
            }).catch(error => {
                console.error('Erro ao tocar música:', error);
                showToast('❌ Erro ao reproduzir música', 'error');
            });
        }
    };

    // Função para editar release
    const handleEditRelease = () => {
        router.push(`/releases/edit/${params.id}`);
    };

    // Função para deletar release
    const handleDeleteRelease = async () => {
        if (!confirm('Tem certeza que deseja deletar este release?')) {
            return;
        }

        try {
            const response = await fetch(`/api/releases/${params.id}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                throw new Error('Erro ao deletar release');
            }

            showToast('✅ Release deletado com sucesso', 'success');
            router.push('/releases');
        } catch (error) {
            console.error('Erro ao deletar release:', error);
            showToast('❌ Erro ao deletar release', 'error');
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

    if (error || !release) {
        return (
            <MainLayout>
                <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
                    <div className="text-center">
                        <div className="w-24 h-24 bg-red-600/20 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Album className="h-12 w-12 text-red-400" />
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-4">Release não encontrado</h3>
                        <p className="text-gray-400 mb-6">
                            {error || 'O release solicitado não foi encontrado.'}
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
                            <div className="flex-1">
                                <h1 className="text-3xl font-bold text-white">{release.title}</h1>
                                <p className="text-gray-400 text-lg">{release.artist}</p>
                            </div>

                            {/* Botões de Ação */}
                            {session?.user?.email?.includes('admin') && (
                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={handleEditRelease}
                                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
                                    >
                                        <Edit className="h-4 w-4" />
                                        Editar
                                    </button>

                                    <button
                                        onClick={handleDeleteRelease}
                                        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                        Deletar
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Conteúdo */}
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Coluna Esquerda - Informações do Release */}
                        <div className="lg:col-span-1 space-y-6">
                            {/* Capa do Álbum */}
                            <div className="bg-gray-800/30 backdrop-blur-sm rounded-2xl border border-gray-700/30 p-6">
                                <div className="relative aspect-square overflow-hidden rounded-xl mb-4">
                                    <Image
                                        src={release.albumArt}
                                        alt={release.title}
                                        fill
                                        className="object-cover"
                                    />

                                    {/* Badges */}
                                    <div className="absolute top-3 left-3 flex flex-col gap-2">
                                        {release.featured && (
                                            <span className="px-2 py-1 bg-yellow-500/90 text-yellow-900 text-xs font-bold rounded-full flex items-center gap-1">
                                                <Star className="h-3 w-3" />
                                                FEATURED
                                            </span>
                                        )}
                                        {release.exclusive && (
                                            <span className="px-2 py-1 bg-emerald-500/90 text-emerald-900 text-xs font-bold rounded-full flex items-center gap-1">
                                                <Crown className="h-3 w-3" />
                                                EXCLUSIVE
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Informações Básicas */}
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2 text-sm text-gray-400">
                                        <Music className="h-4 w-4" />
                                        <span>{release.trackCount} tracks</span>
                                    </div>

                                    {release.duration && (
                                        <div className="flex items-center gap-2 text-sm text-gray-400">
                                            <Clock className="h-4 w-4" />
                                            <span>{release.duration}</span>
                                        </div>
                                    )}

                                    <div className="flex items-center gap-2 text-sm text-gray-400">
                                        <Calendar className="h-4 w-4" />
                                        <span>{new Date(release.releaseDate).toLocaleDateString('pt-BR')}</span>
                                    </div>

                                    <div className="flex items-center gap-2 text-sm text-gray-400">
                                        <Tag className="h-4 w-4" />
                                        <span>{release.genre}</span>
                                    </div>

                                    {release.label && (
                                        <div className="flex items-center gap-2 text-sm text-gray-400">
                                            <Building className="h-4 w-4" />
                                            <span>{release.label}</span>
                                        </div>
                                    )}

                                    {release.producer && (
                                        <div className="flex items-center gap-2 text-sm text-gray-400">
                                            <Mic className="h-4 w-4" />
                                            <span>{release.producer}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Descrição */}
                            {release.description && (
                                <div className="bg-gray-800/30 backdrop-blur-sm rounded-2xl border border-gray-700/30 p-6">
                                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                        <MessageCircle className="h-5 w-5 text-blue-400" />
                                        Descrição
                                    </h3>
                                    <p className="text-gray-300 leading-relaxed">
                                        {release.description}
                                    </p>
                                </div>
                            )}

                            {/* Links de Streaming */}
                            {release.streaming && Object.keys(release.streaming).length > 0 && (
                                <div className="bg-gray-800/30 backdrop-blur-sm rounded-2xl border border-gray-700/30 p-6">
                                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                        <Globe className="h-5 w-5 text-green-400" />
                                        Streaming
                                    </h3>
                                    <div className="space-y-3">
                                        {release.streaming.spotify && (
                                            <a
                                                href={release.streaming.spotify}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-3 p-3 bg-green-600/20 hover:bg-green-600/40 text-green-400 rounded-lg transition-colors"
                                            >
                                                <Music className="h-5 w-5" />
                                                <span>Spotify</span>
                                                <ExternalLink className="h-4 w-4 ml-auto" />
                                            </a>
                                        )}

                                        {release.streaming.deezer && (
                                            <a
                                                href={release.streaming.deezer}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-3 p-3 bg-blue-600/20 hover:bg-blue-600/40 text-blue-400 rounded-lg transition-colors"
                                            >
                                                <Disc className="h-5 w-5" />
                                                <span>Deezer</span>
                                                <ExternalLink className="h-4 w-4 ml-auto" />
                                            </a>
                                        )}

                                        {release.streaming.apple && (
                                            <a
                                                href={release.streaming.apple}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-3 p-3 bg-gray-600/20 hover:bg-gray-600/40 text-gray-400 rounded-lg transition-colors"
                                            >
                                                <Music className="h-5 w-5" />
                                                <span>Apple Music</span>
                                                <ExternalLink className="h-4 w-4 ml-auto" />
                                            </a>
                                        )}

                                        {release.streaming.youtube && (
                                            <a
                                                href={release.streaming.youtube}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-3 p-3 bg-red-600/20 hover:bg-red-600/40 text-red-400 rounded-lg transition-colors"
                                            >
                                                <Youtube className="h-5 w-5" />
                                                <span>YouTube</span>
                                                <ExternalLink className="h-4 w-4 ml-auto" />
                                            </a>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Redes Sociais */}
                            {release.social && Object.keys(release.social).length > 0 && (
                                <div className="bg-gray-800/30 backdrop-blur-sm rounded-2xl border border-gray-700/30 p-6">
                                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                        <Users className="h-5 w-5 text-blue-400" />
                                        Redes Sociais
                                    </h3>
                                    <div className="space-y-3">
                                        {release.social.instagram && (
                                            <a
                                                href={`https://instagram.com/${release.social.instagram.replace('@', '')}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-3 p-3 bg-pink-600/20 hover:bg-pink-600/40 text-pink-400 rounded-lg transition-colors"
                                            >
                                                <Instagram className="h-5 w-5" />
                                                <span>{release.social.instagram}</span>
                                                <ExternalLink className="h-4 w-4 ml-auto" />
                                            </a>
                                        )}

                                        {release.social.facebook && (
                                            <a
                                                href={`https://facebook.com/${release.social.facebook}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-3 p-3 bg-blue-600/20 hover:bg-blue-600/40 text-blue-400 rounded-lg transition-colors"
                                            >
                                                <Facebook className="h-5 w-5" />
                                                <span>{release.social.facebook}</span>
                                                <ExternalLink className="h-4 w-4 ml-auto" />
                                            </a>
                                        )}

                                        {release.social.twitter && (
                                            <a
                                                href={`https://twitter.com/${release.social.twitter.replace('@', '')}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-3 p-3 bg-blue-600/20 hover:bg-blue-600/40 text-blue-400 rounded-lg transition-colors"
                                            >
                                                <MessageCircle className="h-5 w-5" />
                                                <span>{release.social.twitter}</span>
                                                <ExternalLink className="h-4 w-4 ml-auto" />
                                            </a>
                                        )}

                                        {release.social.website && (
                                            <a
                                                href={release.social.website}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-3 p-3 bg-purple-600/20 hover:bg-purple-600/40 text-purple-400 rounded-lg transition-colors"
                                            >
                                                <Globe className="h-5 w-5" />
                                                <span>Website</span>
                                                <ExternalLink className="h-4 w-4 ml-auto" />
                                            </a>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Coluna Direita - Lista de Tracks */}
                        <div className="lg:col-span-2">
                            <div className="bg-gray-800/30 backdrop-blur-sm rounded-2xl border border-gray-700/30 p-6">
                                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                                    <Music className="h-5 w-5 text-purple-400" />
                                    Tracks ({release.tracks.length})
                                </h3>

                                {release.tracks.length === 0 ? (
                                    <div className="text-center py-12">
                                        <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <Music className="h-8 w-8 text-gray-400" />
                                        </div>
                                        <h4 className="text-lg font-bold text-white mb-2">Nenhuma track disponível</h4>
                                        <p className="text-gray-400">Este release ainda não possui tracks cadastradas.</p>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {release.tracks.map((track, index) => (
                                            <div
                                                key={track.id}
                                                className="group bg-gray-700/30 hover:bg-gray-700/50 rounded-xl p-4 transition-all duration-200 border border-gray-600/30 hover:border-purple-500/50"
                                            >
                                                <div className="flex items-center gap-4">
                                                    {/* Número da Track */}
                                                    <div className="w-8 h-8 bg-purple-600/20 text-purple-400 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                                                        {index + 1}
                                                    </div>

                                                    {/* Informações da Track */}
                                                    <div className="flex-1 min-w-0">
                                                        <h4 className="text-white font-semibold mb-1 truncate">
                                                            {track.songName}
                                                        </h4>
                                                        <p className="text-gray-400 text-sm mb-2">
                                                            {track.artist}
                                                        </p>

                                                        {/* Detalhes da Track */}
                                                        <div className="flex items-center gap-4 text-xs text-gray-500">
                                                            {track.duration && (
                                                                <span className="flex items-center gap-1">
                                                                    <Clock className="h-3 w-3" />
                                                                    {track.duration}
                                                                </span>
                                                            )}

                                                            {track.bpm && (
                                                                <span className="flex items-center gap-1">
                                                                    <Zap className="h-3 w-3" />
                                                                    {track.bpm} BPM
                                                                </span>
                                                            )}

                                                            {track.key && (
                                                                <span className="flex items-center gap-1">
                                                                    <Music className="h-3 w-3" />
                                                                    {track.key}
                                                                </span>
                                                            )}

                                                            <span className="px-2 py-1 bg-gray-600/50 text-gray-300 rounded-full">
                                                                {track.style || track.genre}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    {/* Botões de Ação */}
                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            onClick={() => handlePlayTrack(track)}
                                                            className={`p-3 rounded-xl transition-colors ${isPlaying && currentTrack?.id === track.id
                                                                ? 'bg-red-600/20 text-red-400 border border-red-600/30'
                                                                : 'bg-green-600/20 text-green-400 border border-green-600/30 hover:bg-green-600/30'
                                                                }`}
                                                            title={isPlaying && currentTrack?.id === track.id ? 'Pausar' : 'Tocar'}
                                                        >
                                                            {isPlaying && currentTrack?.id === track.id ? (
                                                                <Pause className="h-4 w-4" />
                                                            ) : (
                                                                <Play className="h-4 w-4" />
                                                            )}
                                                        </button>

                                                        <button
                                                            className="p-3 bg-gray-600/20 text-gray-400 border border-gray-600/30 rounded-xl hover:bg-gray-600/30 transition-colors"
                                                            title="Curtir"
                                                        >
                                                            <Heart className="h-4 w-4" />
                                                        </button>

                                                        <button
                                                            className="p-3 bg-gray-600/20 text-gray-400 border border-gray-600/30 rounded-xl hover:bg-gray-600/30 transition-colors"
                                                            title="Download"
                                                        >
                                                            <Download className="h-4 w-4" />
                                                        </button>

                                                        <button
                                                            className="p-3 bg-gray-600/20 text-gray-400 border border-gray-600/30 rounded-xl hover:bg-gray-600/30 transition-colors"
                                                            title="Compartilhar"
                                                        >
                                                            <Share2 className="h-4 w-4" />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
};

export default ReleaseDetailPage;
