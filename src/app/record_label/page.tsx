'use client';

import { useState, useEffect } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import {
    Music,
    Play,
    Pause,
    Heart,
    Download,
    Share2,
    Star,
    Crown,
    TrendingUp,
    Users,
    Calendar,
    MapPin,
    Instagram,
    Facebook,
    Youtube,
    Award,
    Mic,
    Disc3,
    Headphones,
    Radio,
    Album,
    Disc,
    Zap,
    Sparkles,
    Target,
    Globe,
    Music2,
    Disc2,
    Volume2,
    MessageCircle,
    Mail,
    ExternalLink
} from 'lucide-react';
import { useToast } from '@/hooks/useToast';

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

const RecordLabelPage = () => {
    const { showToast } = useToast();
    const [tracks, setTracks] = useState<Track[]>([]);
    const [loading, setLoading] = useState(true);

    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
    const [audio, setAudio] = useState<HTMLAudioElement | null>(null);

    // Dados da DJ Jéssika Luana baseados no Spotify
    const artistData = {
        name: "DJ Jéssika Luana",
        location: "Picada Café, RS",
        monthlyListeners: "8 monthly listeners",
        followers: "6 Followers",
        description: "DJ Jéssika é a energia contagiante que vem direto de Picada Café para as pistas do mundo. Com um estilo jovem, ousado e criativo, ela domina os ritmos dançantes que fazem qualquer um sair do chão.",
        socialMedia: {
            instagram: "@djessikaluana",
            facebook: "DJ Jéssika Luana"
        }
    };

    // Músicas baseadas no Spotify da DJ Jéssika Luana
    const recordLabelTracks: Track[] = [];

    useEffect(() => {
        // Simular carregamento
        setTimeout(() => {
            setTracks(recordLabelTracks);
            setLoading(false);
        }, 1000);
    }, []);

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
                audio.currentTime = 0;
            }

            // Criar nova instância de áudio
            const newAudio = new Audio(track.downloadUrl);
            newAudio.addEventListener('ended', () => {
                setIsPlaying(false);
                setCurrentTrack(null);
            });

            setAudio(newAudio);
            setIsPlaying(true);
            setCurrentTrack(track);

            newAudio.play().catch(error => {
                console.error('Erro ao tocar áudio:', error);
                showToast('❌ Erro ao tocar música', 'error');
            });

            showToast(`▶️ Tocando "${track.songName}"`, 'success');
        }
    };

    const handleLikeTrack = (track: Track) => {
        showToast(`❤️ "${track.songName}" adicionada aos favoritos`, 'success');
    };

    const handleDownloadTrack = (track: Track) => {
        showToast(`📥 Download iniciado: "${track.songName}"`, 'success');
    };

    const handleShareTrack = (track: Track) => {
        showToast(`📤 "${track.songName}" compartilhada`, 'success');
    };



    if (loading) {
        return (
            <MainLayout>
                <div className="min-h-screen bg-black overflow-x-hidden">
                    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 md:px-8 lg:pl-8 lg:pr-8 xl:pl-10 xl:pr-10 2xl:pl-12 2xl:pr-12 py-8">
                    <div className="flex items-center justify-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
                    </div>
                </div>
            </div>
            </MainLayout>
        );
    }

    return (
        <MainLayout>
            <div className="min-h-screen bg-black overflow-x-hidden">
                <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 md:px-8 lg:pl-8 lg:pr-8 xl:pl-10 xl:pr-10 2xl:pl-12 2xl:pr-12 py-6 sm:py-8 transition-all duration-300">
                    {/* Hero Section - Mobile First */}
                    <div className="mb-8 sm:mb-12">
                        <div className="text-center mb-6 sm:mb-8">
                            <div className="flex items-center justify-center mb-4 sm:mb-6">
                            <div className="relative">
                                <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-purple-600 rounded-full blur-xl opacity-50"></div>
                                    <div className="relative bg-black rounded-full p-3 sm:p-4">
                                        <Disc3 className="h-8 w-8 sm:h-12 sm:w-12 text-white" />
                                    </div>
                                </div>
                            </div>
                            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white mb-3 sm:mb-4 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent leading-tight tracking-tight">
                            RECORD LABEL
                        </h1>
                            <p className="text-base sm:text-lg md:text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed px-4 font-light">
                            Descubra as produções exclusivas da nossa gravadora, disponíveis nos principais streamings
                        </p>
                        </div>
                    </div>

                    {/* Stats Cards - Mobile First Grid */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 mb-8 sm:mb-12">
                        <div className="bg-black rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-6 hover:scale-105 transition-all duration-300 relative overflow-hidden group">
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            <div className="relative flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                                <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg mx-auto sm:mx-0">
                                    <Music className="h-5 w-5 sm:h-6 sm:w-6 md:h-7 md:w-7 text-white" />
                </div>
                                <div className="text-center sm:text-left">
                                    <p className="text-xs sm:text-sm text-gray-400 font-medium">Total de Músicas</p>
                                    <p className="text-xl sm:text-2xl md:text-3xl font-black text-white tracking-tight">45</p>
                            </div>
                        </div>
                    </div>

                        <div className="bg-black rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-6 hover:scale-105 transition-all duration-300 relative overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 to-emerald-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            <div className="relative flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                                <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg mx-auto sm:mx-0">
                                    <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6 md:h-7 md:w-7 text-white" />
                                </div>
                                <div className="text-center sm:text-left">
                                    <p className="text-xs sm:text-sm text-gray-400 font-medium">Streams Mensais</p>
                                    <p className="text-xl sm:text-2xl md:text-3xl font-black text-white tracking-tight">125+</p>
                            </div>
                        </div>
                    </div>

                        <div className="bg-black rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-6 hover:scale-105 transition-all duration-300 relative overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-pink-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            <div className="relative flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                                <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg mx-auto sm:mx-0">
                                    <Award className="h-5 w-5 sm:h-6 sm:w-6 md:h-7 md:w-7 text-white" />
                                </div>
                                <div className="text-center sm:text-left">
                                    <p className="text-xs sm:text-sm text-gray-400 font-medium">Prêmios</p>
                                    <p className="text-xl sm:text-2xl md:text-3xl font-black text-white tracking-tight">0</p>
                            </div>
                        </div>
                    </div>

                        <div className="bg-black rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-6 hover:scale-105 transition-all duration-300 relative overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-r from-orange-500/5 to-red-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            <div className="relative flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                                <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg mx-auto sm:mx-0">
                                    <Globe className="h-5 w-5 sm:h-6 sm:w-6 md:h-7 md:w-7 text-white" />
                                </div>
                                <div className="text-center sm:text-left">
                                    <p className="text-xs sm:text-sm text-gray-400 font-medium">Países</p>
                                    <p className="text-xl sm:text-2xl md:text-3xl font-black text-white tracking-tight">12</p>
                            </div>
                            </div>
                        </div>
                    </div>



                    {/* Artists Section - Mobile First */}
                    <div className="mb-8 sm:mb-12">
                        <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                            <Mic className="h-5 w-5 sm:h-6 sm:w-6 text-purple-400" />
                            <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-white tracking-tight">Artistas da Gravadora</h2>
                        </div>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12">
                        {/* DJ Jéssika Luana */}
                            <div className="bg-black border border-blue-500/50 rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 group relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-r from-red-500/5 to-purple-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            <div className="relative">
                                    <div className="text-center mb-4 sm:mb-6">
                                        <div className="relative mx-auto mb-4">
                                        <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-purple-600 rounded-full blur-xl opacity-30"></div>
                                            <div className="relative w-24 h-24 sm:w-28 sm:h-28 bg-black border border-gray-700 rounded-full flex items-center justify-center shadow-2xl mx-auto">
                                            <img
                                                src="https://i.ibb.co/vvcZpm0d/20250508-0639-Varia-es-da-Garota-remix-01jtqm5hshex7a23kkhghy64v1.png"
                                                alt="DJ Jéssika Luana"
                                                    className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover"
                                            />
                                        </div>
                                    </div>
                                        <h3 className="text-xl sm:text-2xl font-black text-white mb-2 tracking-tight">DJ Jéssika Luana</h3>
                                        <p className="text-gray-400 mb-4 text-sm sm:text-base">Picada Café, RS</p>
                                        <div className="flex flex-row items-center justify-center gap-2 sm:gap-3 text-xs sm:text-sm">
                                            <div className="flex items-center gap-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 px-2 sm:px-3 py-1.5 rounded-full border border-purple-500/30">
                                                <Users className="h-3 w-3 sm:h-4 sm:w-4 text-purple-400" />
                                                <span className="text-white font-medium">2.4K ouvintes</span>
                                            </div>
                                            <div className="flex items-center gap-2 bg-gradient-to-r from-pink-500/20 to-red-500/20 px-2 sm:px-3 py-1.5 rounded-full border border-pink-500/30">
                                                <Heart className="h-3 w-3 sm:h-4 sm:w-4 text-pink-400" />
                                                <span className="text-white font-medium">1.2K seguidores</span>
                                            </div>
                                        </div>
                                    </div>
                                    <p className="text-gray-400 mb-4 sm:mb-6 leading-relaxed text-sm sm:text-base text-center sm:text-left">
                                    DJ Jéssika é a energia contagiante que vem direto de Picada Café para as pistas do mundo. Com um estilo jovem, ousado e criativo, ela domina os ritmos dançantes que fazem qualquer um sair do chão.
                                </p>

                                    {/* Contador de Músicas */}
                                    <div className="text-center mb-6">
                                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6">
                                            <div className="inline-flex flex-row items-center gap-4 px-6 py-3 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-2xl border border-purple-500/20">
                                                <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full flex items-center justify-center">
                                                    <Music className="h-5 w-5 text-white" />
                                                </div>
                                                <div className="text-left">
                                                    <p className="text-sm text-gray-400 font-medium">Singles</p>
                                                    <p className="text-xl font-black text-white tracking-tight">24</p>
                                                </div>
                                            </div>
                                            <div className="inline-flex flex-row items-center gap-4 px-6 py-3 bg-gradient-to-r from-pink-500/10 to-purple-500/10 rounded-2xl border border-pink-500/20">
                                                <div className="w-10 h-10 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center">
                                                    <Album className="h-5 w-5 text-white" />
                                                </div>
                                                <div className="text-left">
                                                    <p className="text-sm text-gray-400 font-medium">EP's</p>
                                                    <p className="text-xl font-black text-white tracking-tight">2</p>
                                                </div>
                                            </div>
                                </div>
                                    </div>

                                    {/* Redes Sociais */}
                                    <div className="flex items-center justify-center gap-3 flex-wrap">
                                        <a href="https://www.instagram.com/djjessikaluana/" target="_blank" rel="noopener noreferrer" className="p-3 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 rounded-full transition-all duration-300 shadow-lg shadow-red-500/25" aria-label="Instagram da DJ Jéssika Luana">
                                            <Instagram className="h-5 w-5 text-white" aria-hidden="true" />
                                        </a>
                                        <a href="https://www.facebook.com/djjessikaluana" target="_blank" rel="noopener noreferrer" className="p-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 rounded-full transition-all duration-300 shadow-lg shadow-blue-500/25" aria-label="Facebook da DJ Jéssika Luana">
                                            <Facebook className="h-5 w-5 text-white" aria-hidden="true" />
                                        </a>
                                        <a href="https://api.whatsapp.com/send?phone=555181086784" target="_blank" rel="noopener noreferrer" className="p-3 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 rounded-full transition-all duration-300 shadow-lg shadow-green-500/25" aria-label="WhatsApp da DJ Jéssika Luana">
                                            <svg className="h-5 w-5 text-white" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488" />
                                            </svg>
                                        </a>
                                        <a href="https://soundcloud.com/djjessikaluana" target="_blank" rel="noopener noreferrer" className="p-3 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 rounded-full transition-all duration-300 shadow-lg shadow-orange-500/25" aria-label="SoundCloud da DJ Jéssika Luana">
                                            <svg className="h-5 w-5 text-white" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                                                <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm0 22C6.486 22 2 17.514 2 12S6.486 2 12 2s10 4.486 10 10-4.486 10-10 10zm-1-6.5c0 .828-.672 1.5-1.5 1.5s-1.5-.672-1.5-1.5.672-1.5 1.5-1.5 1.5.672 1.5 1.5zm3 0c0 .828-.672 1.5-1.5 1.5s-1.5-.672-1.5-1.5.672-1.5 1.5-1.5 1.5.672 1.5 1.5zm-6-3c0 .828-.672 1.5-1.5 1.5s-1.5-.672-1.5-1.5.672-1.5 1.5-1.5 1.5.672 1.5 1.5zm3 0c0 .828-.672 1.5-1.5 1.5s-1.5-.672-1.5-1.5.672-1.5 1.5-1.5 1.5.672 1.5 1.5zm3 0c0 .828-.672 1.5-1.5 1.5s-1.5-.672-1.5-1.5.672-1.5 1.5-1.5 1.5.672 1.5 1.5z" />
                                            </svg>
                                        </a>
                                        <a href="https://open.spotify.com/intl-pt/artist/5NdJcuUWBt4pNGJC2sI6iZ?si=zBxTqBy8SH2YF0yCBLmcOg" target="_blank" rel="noopener noreferrer" className="p-3 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 rounded-full transition-all duration-300 shadow-lg shadow-green-500/25" aria-label="Spotify da DJ Jéssika Luana">
                                            <svg className="h-5 w-5 text-white" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                                                <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.24 12.84c.361.181.54.78.301 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
                                            </svg>
                                        </a>
                                        <a href="https://www.deezer.com/br/artist/327365411" target="_blank" rel="noopener noreferrer" className="p-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 rounded-full transition-all duration-300 shadow-lg shadow-blue-500/25" aria-label="Deezer da DJ Jéssika Luana">
                                            <svg className="h-5 w-5 text-white" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                                                <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm0 22C6.486 22 2 17.514 2 12S6.486 2 12 2s10 4.486 10 10-4.486 10-10 10zm-1-6.5c0 .828-.672 1.5-1.5 1.5s-1.5-.672-1.5-1.5.672-1.5 1.5-1.5 1.5.672 1.5 1.5zm3 0c0 .828-.672 1.5-1.5 1.5s-1.5-.672-1.5-1.5.672-1.5 1.5-1.5 1.5.672 1.5 1.5zm-6-3c0 .828-.672 1.5-1.5 1.5s-1.5-.672-1.5-1.5.672-1.5 1.5-1.5 1.5.672 1.5 1.5zm3 0c0 .828-.672 1.5-1.5 1.5s-1.5-.672-1.5-1.5.672-1.5 1.5-1.5 1.5.672 1.5 1.5zm3 0c0 .828-.672 1.5-1.5 1.5s-1.5-.672-1.5-1.5.672-1.5 1.5-1.5 1.5.672 1.5 1.5z" />
                                            </svg>
                                        </a>
                                </div>
                            </div>
                        </div>

                        {/* Rebeka Sanches */}
                            <div className="bg-black border border-blue-500/50 rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 group relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-cyan-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            <div className="relative">
                                    <div className="text-center mb-4 sm:mb-6">
                                        <div className="relative mx-auto mb-4">
                                        <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-full blur-xl opacity-30"></div>
                                            <div className="relative w-24 h-24 sm:w-28 sm:h-28 bg-black border border-gray-700 rounded-full flex items-center justify-center shadow-2xl mx-auto">
                                            <img
                                                src="https://i.ibb.co/5XR8b2Xr/492313840-122095806554856833-4887195066294116636-n.jpg"
                                                alt="Rebeka Sanches"
                                                    className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover"
                                                />
                                            </div>
                                        </div>
                                        <h3 className="text-xl sm:text-2xl font-black text-white mb-2 tracking-tight">Rebeka Sanches</h3>
                                        <p className="text-gray-400 mb-4 text-sm sm:text-base">São Paulo, SP</p>
                                        <div className="flex flex-row items-center justify-center gap-2 sm:gap-3 text-xs sm:text-sm">
                                            <div className="flex items-center gap-2 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 px-2 sm:px-3 py-1.5 rounded-full border border-blue-500/30">
                                                <Users className="h-3 w-3 sm:h-4 sm:w-4 text-blue-400" />
                                                <span className="text-white font-medium">5.8K ouvintes</span>
                                            </div>
                                            <div className="flex items-center gap-2 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 px-2 sm:px-3 py-1.5 rounded-full border border-cyan-500/30">
                                                <Heart className="h-3 w-3 sm:h-4 sm:w-4 text-cyan-400" />
                                                <span className="text-white font-medium">3.1K seguidores</span>
                                            </div>
                                        </div>
                                    </div>
                                    <p className="text-gray-400 mb-4 sm:mb-6 leading-relaxed text-sm sm:text-base text-center sm:text-left">
                                        Rebeka Sanches é uma produtora musical inovadora que combina elementos eletrônicos com ritmos brasileiros. Sua música transcende fronteiras e conecta culturas através de melodias únicas e batidas contagiantes.
                                    </p>
                                    {/* Contador de Músicas */}
                                    <div className="text-center mb-6">
                                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6">
                                            <div className="inline-flex flex-row items-center gap-4 px-6 py-3 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-2xl border border-blue-500/20">
                                                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-full flex items-center justify-center">
                                                    <Music className="h-5 w-5 text-white" />
                                                </div>
                                                <div className="text-left">
                                                    <p className="text-sm text-gray-400 font-medium">Singles</p>
                                                    <p className="text-xl font-black text-white">5</p>
                                                </div>
                                            </div>
                                            <div className="inline-flex flex-row items-center gap-4 px-6 py-3 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 rounded-2xl border border-cyan-500/20">
                                                <div className="w-10 h-10 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full flex items-center justify-center">
                                                    <Album className="h-5 w-5 text-white" />
                                                </div>
                                                <div className="text-left">
                                                    <p className="text-sm text-gray-400 font-medium">EP's</p>
                                                    <p className="text-xl font-black text-white tracking-tight">2</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Redes Sociais */}
                                    <div className="flex items-center justify-center gap-3">
                                        <button className="p-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 rounded-full transition-all duration-300 shadow-lg shadow-blue-500/25">
                                            <Instagram className="h-5 w-5 text-white" />
                                        </button>
                                        <button className="p-3 bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 rounded-full transition-all duration-300 shadow-lg shadow-cyan-500/25">
                                            <Facebook className="h-5 w-5 text-white" />
                                        </button>
                                        <button className="p-3 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 rounded-full transition-all duration-300 shadow-lg shadow-green-500/25">
                                            <Music className="h-5 w-5 text-white" />
                                        </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                    {/* Latest Releases - Mobile First Grid */}
                    <div className="mb-8 sm:mb-12">
                        <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                            <Album className="h-5 w-5 sm:h-6 sm:w-6 text-purple-400" />
                            <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-white tracking-tight">Últimos Lançamentos</h2>
                    </div>
                        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-1.5 sm:gap-2 lg:gap-3">
                            {[
                                {
                                    title: "Sul Azul Imortal",
                                    type: "Single",
                                    year: "2025",
                                    tracks: 1,
                                    artist: "DJ Jéssika Luana",
                                    duration: "03:43",
                                    spotifyUrl: "https://open.spotify.com/intl-pt/album/4n7labGTl3zHr52VkhNK0F?si=1&nd=1&dlsi=556ced0850bd4202",
                                    isLatest: true
                                },
                                {
                                    title: "Lone Wolf",
                                    type: "Single",
                                    year: "2025",
                                    tracks: 1,
                                    artist: "DJ Jéssika Luana",
                                    duration: "03:11",
                                    spotifyUrl: "https://open.spotify.com/intl-pt/album/2UlKamdFwxYxyYLLSV9zBM?si=1&nd=1&dlsi=46c823c3e6c04ee4",
                                    isLatest: true
                                },
                                {
                                    title: "Lagrimas Na Pista",
                                    type: "Single",
                                    year: "2025",
                                    tracks: 1,
                                    artist: "DJ Jéssika Luana",
                                    duration: "03:08",
                                    spotifyUrl: "https://open.spotify.com/intl-pt/track/67DygCfNcIMGqr0xGbfWoC",
                                    isLatest: true
                                },
                                {
                                    title: "Il Dj Di Tutta Italia",
                                    type: "Single",
                                    year: "2025",
                                    tracks: 1,
                                    artist: "DJ Jéssika Luana",
                                    duration: "03:45",
                                    spotifyUrl: "https://open.spotify.com/intl-pt/track/6ZvTbyfEcUCi7Uy2RRtvaC?si=662cbb1519704856",
                                    isLatest: true
                                },
                                {
                                    title: "Feel Me Close",
                                    type: "Single",
                                    year: "2025",
                                    tracks: 1,
                                    artist: "DJ Jéssika Luana",
                                    duration: "03:26",
                                    spotifyUrl: "https://open.spotify.com/intl-pt/track/5pjeo067FBZ6lv8mizNA1X?si=9fdceeda661b40d7",
                                    isLatest: true
                                },
                                {
                                    title: "I Shattered with You",
                                type: "Single",
                                year: "2025",
                                tracks: 1,
                                artist: "DJ Jéssika Luana",
                                    duration: "03:14",
                                    spotifyUrl: "https://open.spotify.com/intl-pt/track/7oaqFOKcdGDkZRRuFsfgJ1?si=608b03c5dbee4a30",
                                isLatest: true
                            },

                        ].map((release, index) => (
                                <div key={index} className="bg-black rounded-xl sm:rounded-2xl p-1.5 sm:p-2 lg:p-3 group relative overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 to-purple-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                    <div className="relative mb-1 sm:mb-1.5 lg:mb-2">
                                        <div className="w-full aspect-square bg-black border border-gray-700 rounded-lg sm:rounded-xl flex items-center justify-center overflow-hidden">
                                            {release.artist === "DJ Jéssika Luana" && release.year === "2025" ? (
                                                <img
                                                    src={
                                                        release.title === "Sul Azul Imortal" ? "https://i.ibb.co/SXWHwLVr/atwork-4420662.jpg" :
                                                            release.title === "Lone Wolf" ? "https://i.ibb.co/sdzRfhCj/atwork-4417627.jpg" :
                                                                release.title === "Lagrimas Na Pista" ? "https://i.ibb.co/twn8QPKb/atwork-4417585.jpg" :
                                                                    release.title === "Il Dj Di Tutta Italia" ? "https://i.ibb.co/zTys7Pn6/atwork-4382031.jpg" :
                                                                        release.title === "Feel Me Close" ? "https://i.ibb.co/S7yBTQLc/atwork-4347946.jpg" :
                                                                            release.title === "I Shattered with You" ? "https://i.ibb.co/Y7V00BVk/atwork-4568.jpg" :
                                                                                "https://i.ibb.co/SXWHwLVr/atwork-4420662.jpg"
                                                    }
                                                    alt={`${release.title} - ${release.artist}`}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                                <Album className="h-8 w-8 sm:h-12 sm:w-12 text-gray-600" />
                                        )}
                                    </div>
                                    {release.isLatest && (
                                        <div className="absolute top-2 left-2">
                                                <span className="px-2 py-1 bg-red-600 text-white text-xs font-bold rounded text-xs">NEW</span>
                                        </div>
                                        )}

                                        {/* Badge do tipo (Single/EP) */}
                                        <div className="absolute top-2 right-2">
                                            <span className={`px-2 py-1 text-white text-xs font-bold rounded text-xs ${release.type === 'Single'
                                                ? 'bg-green-600'
                                                : 'bg-purple-600'
                                                }`}>
                                                {release.type}
                                            </span>
                                </div>

                                        {/* Spotify Link Overlay - Clica na foto para abrir Spotify */}
                                    {release.isLatest && (
                                            <a
                                                href={release.spotifyUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 cursor-pointer z-5"
                                            >
                                                <div className="bg-black/50 rounded-full p-3 backdrop-blur-sm">
                                                    <svg className="w-8 h-8 sm:w-10 sm:h-10 text-white" viewBox="0 0 24 24" fill="currentColor">
                                                        <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.24 12.84c.361.181.54.78.301 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
                                                    </svg>
                                                </div>
                                            </a>
                                        )}

                                    </div>
                                    <div className="space-y-1.5 sm:space-y-2">
                                        <div className="overflow-hidden">
                                            <h3
                                                className="font-black text-white text-sm sm:text-base truncate cursor-pointer transition-all duration-500 ease-in-out tracking-tight"
                                                title={release.title}
                                                onClick={() => {
                                                    const element = event?.target as HTMLElement;
                                                    if (element) {
                                                        element.classList.remove('truncate');
                                                        element.classList.add('whitespace-nowrap', 'animate-scroll-text');
                                                        element.style.animationDuration = '3s';

                                                        // Reset após a animação
                                                        setTimeout(() => {
                                                            element.classList.remove('whitespace-nowrap', 'animate-scroll-text');
                                                            element.classList.add('truncate');
                                                            element.style.animationDuration = '';
                                                        }, 3000);
                                                    }
                                                }}
                                            >
                                                {release.title}
                                            </h3>
                                        </div>
                                        {release.artist && (
                                            <p className="text-xs sm:text-sm text-gray-300 relative z-10 -mt-1">
                                                {release.artist === "DJ Jéssika Luana" ? (
                                                    <a
                                                        href="https://open.spotify.com/intl-pt/artist/5NdJcuUWBt4pNGJC2sI6iZ"
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                        className="text-blue-400 hover:text-blue-300 transition-colors duration-300 cursor-pointer hover:underline relative z-20 font-medium"
                                                        title="Ver perfil da DJ Jéssika Luana no Spotify"
                                                    >
                                                        {release.artist}
                                                    </a>
                                                ) : (
                                                    <span className="font-medium">{release.artist}</span>
                                                )}
                                            </p>
                                        )}


                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                    {/* Nexor Records Section - Mobile First */}
                <div className="text-center">
                        <div className="bg-black rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-600/5"></div>
                            <div className="relative">
                                {/* Header com ícone */}
                                <div className="flex items-center justify-center mb-4 sm:mb-6">
                        <div className="relative">
                                        <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full blur-xl opacity-30"></div>
                                        <div className="relative bg-black border border-gray-700 rounded-full p-3 sm:p-4 mx-auto">
                                            <Disc3 className="h-6 w-6 sm:h-8 sm:w-8 text-blue-400" />
                                        </div>
                                    </div>
                                </div>

                                <h2 className="text-2xl sm:text-3xl font-black text-white mb-3 sm:mb-4 tracking-tight">Nexor Records</h2>

                                <p className="text-gray-300 mb-4 sm:mb-6 text-sm sm:text-base leading-relaxed px-2 font-light">
                                    Sua porta de entrada para o mundo da música eletrônica profissional
                                </p>

                                {/* Serviços em cards */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-6 sm:mb-8">
                                    {/* Gravação */}
                                    <div className="bg-black border border-gray-700 rounded-xl p-3 sm:p-4 text-center">
                                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mx-auto mb-2 sm:mb-3">
                                            <Mic className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                                        </div>
                                        <h3 className="text-sm sm:text-base font-bold text-white mb-1">Gravação Profissional</h3>
                                        <p className="text-xs sm:text-sm text-gray-400">Estúdio equipado com tecnologia de ponta</p>
                                    </div>

                                    {/* Distribuição */}
                                    <div className="bg-black border border-gray-700 rounded-xl p-3 sm:p-4 text-center">
                                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center mx-auto mb-2 sm:mb-3">
                                            <Globe className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                                        </div>
                                        <h3 className="text-sm sm:text-base font-bold text-white mb-1">Distribuição Global</h3>
                                        <p className="text-xs sm:text-sm text-gray-400">Spotify, Apple Music, Deezer e mais</p>
                                    </div>
                                </div>

                                {/* Descrição principal */}
                                <div className="bg-gradient-to-r from-blue-500/10 to-purple-600/10 border border-blue-500/20 rounded-xl p-4 sm:p-6 mb-6 sm:mb-8">
                                    <p className="text-sm sm:text-base text-gray-200 leading-relaxed font-medium">
                                        Grava sua música eletrônica conosco e alcance <span className="text-blue-400 font-bold">milhões de ouvintes</span> em todo o mundo.
                                        Oferecemos <span className="text-purple-400 font-bold">distribuição completa</span> para todas as principais plataformas de streaming,
                                        <span className="text-green-400 font-bold">marketing profissional</span> e <span className="text-yellow-400 font-bold">suporte artístico</span> personalizado.
                                    </p>
                                </div>

                                {/* Call to Action */}
                                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
                                    <a
                                        href="https://api.whatsapp.com/send?phone=5551981086784&text=Olá! Gostaria de gravar minha música eletrônica com a Nexor Records. Podem me ajudar?"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-black rounded-xl sm:rounded-2xl hover:scale-105 transition-all duration-300 shadow-lg shadow-blue-500/25 text-sm sm:text-base tracking-tight inline-flex items-center justify-center"
                                    >
                                        <MessageCircle className="h-4 w-4 sm:h-5 sm:w-5 inline mr-2" />
                                        Gravar Conosco
                                    </a>
                                    <a
                                        href="/label"
                                        className="px-6 sm:px-8 py-3 sm:py-4 bg-black border border-gray-700 text-white font-black rounded-xl sm:rounded-2xl hover:bg-gray-900 transition-all duration-300 text-sm sm:text-base tracking-tight inline-flex items-center justify-center"
                                    >
                                        <Zap className="h-4 w-4 sm:h-5 sm:w-5 inline mr-2" />
                                        Saiba Mais
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
};

export default RecordLabelPage; 

// CSS para animação de scroll do texto
const scrollTextStyles = `
  @keyframes scrollText {
    0% {
      transform: translateX(0);
    }
    100% {
      transform: translateX(-100%);
    }
  }
  
  .animate-scroll-text {
    animation: scrollText 3s linear;
    overflow: hidden;
    white-space: nowrap;
  }
`;

// Adicionar estilos ao head
if (typeof document !== 'undefined') {
    const existingStyle = document.getElementById('scroll-text-styles');
    if (!existingStyle) {
        const style = document.createElement('style');
        style.id = 'scroll-text-styles';
        style.textContent = scrollTextStyles;
        document.head.appendChild(style);
    }
} 