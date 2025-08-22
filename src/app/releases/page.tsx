"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
    Search,
    Filter,
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
    ExternalLink,
    Plus,
    Edit,
    Trash2,
    Eye,
    EyeOff,
    Clock
} from "lucide-react";
import Image from "next/image";
import MainLayout from "@/components/layout/MainLayout";
import { useToastContext } from "@/context/ToastContext";

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
    tracks?: Track[];
}

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

const ReleasesPage = () => {
    const { data: session } = useSession();
    const router = useRouter();
    const { showToast } = useToastContext();

    // Estados
    const [releases, setReleases] = useState<Release[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedGenre, setSelectedGenre] = useState("");
    const [selectedArtist, setSelectedArtist] = useState("");
    const [showFeaturedOnly, setShowFeaturedOnly] = useState(false);
    const [showExclusiveOnly, setShowExclusiveOnly] = useState(false);
    const [sortBy, setSortBy] = useState<"date" | "title" | "artist" | "popularity">("date");
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

    // Estados para player
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
    const [audio, setAudio] = useState<HTMLAudioElement | null>(null);

    // Dados mockados para demonstração
    const mockReleases: Release[] = [
        {
            id: 1,
            title: "Universe",
            artist: "DJ Jéssika Luana",
            albumArt: "https://i.ibb.co/yB0w9yFx/20250526-1940-Capa-Eletr-nica-Sound-Cloud-remix-01jw7c19d3eee9dqwv0m1x642z.png",
            description: "Primeiro álbum completo da DJ Jéssika Luana, explorando os limites da música eletrônica com influências do progressive house e deep house.",
            genre: "Progressive House",
            releaseDate: "2025-01-15",
            trackCount: 12,
            duration: "78:32",
            label: "Nexor Records",
            producer: "DJ Jéssika Luana",
            featured: true,
            exclusive: true,
            streaming: {
                spotify: "https://open.spotify.com/album/example1",
                deezer: "https://www.deezer.com/album/example1",
                apple: "https://music.apple.com/album/example1"
            },
            social: {
                instagram: "@djessikaluana",
                facebook: "DJ Jéssika Luana",
                website: "https://djessikaluana.com"
            }
        },
        {
            id: 2,
            title: "Deep Vibes Collection",
            artist: "Various Artists",
            albumArt: "https://i.ibb.co/yB0w9yFx/20250526-1940-Capa-Eletr-nica-Sound-Cloud-remix-01jw7c19d3eee9dqwv0m1x642z.png",
            description: "Compilação exclusiva com os melhores artistas da cena deep house, incluindo tracks inéditas e remixes exclusivos.",
            genre: "Deep House",
            releaseDate: "2025-02-20",
            trackCount: 15,
            duration: "92:15",
            label: "Nexor Records",
            producer: "Nexor Records",
            featured: true,
            exclusive: false,
            streaming: {
                spotify: "https://open.spotify.com/album/example2",
                deezer: "https://www.deezer.com/album/example2"
            }
        },
        {
            id: 3,
            title: "Summer Beats 2025",
            artist: "DJ Nexor",
            albumArt: "https://i.ibb.co/yB0w9yFx/20250526-1940-Capa-Eletr-nica-Sound-Cloud-remix-01jw7c19d3eee9dqwv0m1x642z.png",
            description: "Álbum de verão com batidas energéticas e ritmos contagiantes, perfeito para festas e eventos ao ar livre.",
            genre: "House",
            releaseDate: "2025-03-10",
            trackCount: 10,
            duration: "65:48",
            label: "Nexor Records",
            producer: "DJ Nexor",
            featured: false,
            exclusive: true,
            streaming: {
                spotify: "https://open.spotify.com/album/example3",
                youtube: "https://www.youtube.com/playlist?list=example3"
            }
        },
        {
            id: 4,
            title: "Electronic Dreams",
            artist: "Synthwave Collective",
            albumArt: "https://i.ibb.co/yB0w9yFx/20250526-1940-Capa-Eletr-nica-Sound-Cloud-remix-01jw7c19d3eee9dqwv0m1x642z.png",
            description: "Viagem através dos sonhos eletrônicos com sintetizadores analógicos e batidas futuristas que transportam para outra dimensão.",
            genre: "Synthwave",
            releaseDate: "2025-04-05",
            trackCount: 8,
            duration: "52:20",
            label: "Nexor Records",
            producer: "Synthwave Collective",
            featured: false,
            exclusive: false,
            streaming: {
                spotify: "https://open.spotify.com/album/example4",
                deezer: "https://www.deezer.com/album/example4"
            }
        },
        {
            id: 5,
            title: "Club Anthems Vol. 1",
            artist: "Various Artists",
            albumArt: "https://i.ibb.co/yB0w9yFx/20250526-1940-Capa-Eletr-nica-Sound-Cloud-remix-01jw7c19d3eee9dqwv0m1x642z.png",
            description: "Primeiro volume da série Club Anthems, reunindo os maiores hits das pistas de dança com remixes exclusivos.",
            genre: "Club",
            releaseDate: "2025-05-12",
            trackCount: 20,
            duration: "120:45",
            label: "Nexor Records",
            producer: "Nexor Records",
            featured: true,
            exclusive: false,
            streaming: {
                spotify: "https://open.spotify.com/album/example5",
                deezer: "https://www.deezer.com/album/example5",
                apple: "https://music.apple.com/album/example5"
            }
        },
        {
            id: 6,
            title: "Midnight Sessions",
            artist: "Luna & The Night",
            albumArt: "https://i.ibb.co/yB0w9yFx/20250526-1940-Capa-Eletr-nica-Sound-Cloud-remix-01jw7c19d3eee9dqwv0m1x642z.png",
            description: "Sessões noturnas com atmosfera misteriosa e batidas profundas, inspiradas na energia da madrugada.",
            genre: "Deep House",
            releaseDate: "2025-06-18",
            trackCount: 6,
            duration: "45:30",
            label: "Nexor Records",
            producer: "Luna & The Night",
            featured: false,
            exclusive: true,
            streaming: {
                spotify: "https://open.spotify.com/album/example6"
            }
        },
        {
            id: 7,
            title: "Future Bass Revolution",
            artist: "Bass Masters",
            albumArt: "https://i.ibb.co/yB0w9yFx/20250526-1940-Capa-Eletr-nica-Sound-Cloud-remix-01jw7c19d3eee9dqwv0m1x642z.png",
            description: "Revolução no future bass com inovações sonoras e batidas que definem o futuro da música eletrônica.",
            genre: "Future Bass",
            releaseDate: "2025-07-25",
            trackCount: 14,
            duration: "88:15",
            label: "Nexor Records",
            producer: "Bass Masters",
            featured: true,
            exclusive: false,
            streaming: {
                spotify: "https://open.spotify.com/album/example7",
                deezer: "https://www.deezer.com/album/example7",
                youtube: "https://www.youtube.com/playlist?list=example7"
            }
        },
        {
            id: 8,
            title: "Acoustic Electronic",
            artist: "Hybrid Sound",
            albumArt: "https://i.ibb.co/yB0w9yFx/20250526-1940-Capa-Eletr-nica-Sound-Cloud-remix-01jw7c19d3eee9dqwv0m1x642z.png",
            description: "Fusão única entre instrumentos acústicos e eletrônicos, criando uma experiência sonora inovadora e envolvente.",
            genre: "Experimental",
            releaseDate: "2025-08-30",
            trackCount: 11,
            duration: "72:40",
            label: "Nexor Records",
            producer: "Hybrid Sound",
            featured: false,
            exclusive: true,
            streaming: {
                spotify: "https://open.spotify.com/album/example8"
            }
        }
    ];

    // Carregar dados
    useEffect(() => {
        const loadReleases = async () => {
            setLoading(true);
            try {
                const response = await fetch('/api/releases');
                if (!response.ok) {
                    const errorText = await response.text();
                    console.error('Erro na API releases:', response.status, response.statusText, errorText);
                    throw new Error(`Erro ${response.status}: ${response.statusText}`);
                }
                const data = await response.json();
                setReleases(data.releases || []);
            } catch (error) {
                console.error("Erro ao carregar releases:", error);
                showToast("⚠️ Usando dados de demonstração", "warning");
                // Usar dados mockados como fallback
                setReleases(mockReleases);
            } finally {
                setLoading(false);
            }
        };

        loadReleases();
    }, []);

    // Filtrar releases
    const filteredReleases = releases.filter(release => {
        const matchesSearch = release.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            release.artist.toLowerCase().includes(searchQuery.toLowerCase()) ||
            release.description?.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesGenre = !selectedGenre || release.genre === selectedGenre;
        const matchesArtist = !selectedArtist || release.artist === selectedArtist;
        const matchesFeatured = !showFeaturedOnly || release.featured;
        const matchesExclusive = !showExclusiveOnly || release.exclusive;

        return matchesSearch && matchesGenre && matchesArtist && matchesFeatured && matchesExclusive;
    });

    // Ordenar releases
    const sortedReleases = [...filteredReleases].sort((a, b) => {
        switch (sortBy) {
            case "date":
                return new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime();
            case "title":
                return a.title.localeCompare(b.title);
            case "artist":
                return a.artist.localeCompare(b.artist);
            case "popularity":
                return (b.featured ? 2 : 0) + (b.exclusive ? 1 : 0) - (a.featured ? 2 : 0) - (a.exclusive ? 1 : 0);
            default:
                return 0;
        }
    });

    // Gêneros únicos
    const uniqueGenres = Array.from(new Set(releases.map(r => r.genre))).sort();
    const uniqueArtists = Array.from(new Set(releases.map(r => r.artist))).sort();

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

    // Função para limpar filtros
    const clearFilters = () => {
        setSearchQuery("");
        setSelectedGenre("");
        setSelectedArtist("");
        setShowFeaturedOnly(false);
        setShowExclusiveOnly(false);
        setSortBy("date");
    };

    // Função para adicionar novo release
    const handleAddRelease = () => {
        router.push('/releases/add');
    };

    // Função para editar release
    const handleEditRelease = (releaseId: number) => {
        router.push(`/releases/edit/${releaseId}`);
    };

    // Função para visualizar release
    const handleViewRelease = (releaseId: number) => {
        router.push(`/releases/${releaseId}`);
    };

    if (loading) {
        return (
            <MainLayout>
                <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
                    <div className="flex items-center justify-center min-h-screen">
                        <div className="text-center">
                            <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                            <p className="text-gray-400 text-lg">Carregando releases...</p>
                        </div>
                    </div>
                </div>
            </MainLayout>
        );
    }

    return (
        <MainLayout>
            <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
                {/* Hero Section */}
                <div className="relative bg-gradient-to-r from-purple-900/20 via-blue-900/20 to-emerald-900/20 border-b border-gray-700/40">
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 via-blue-500/5 to-emerald-500/5"></div>
                    <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                        <div className="text-center">
                            <div className="flex items-center justify-center gap-4 mb-6">
                                <div className="relative">
                                    <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-emerald-500 rounded-3xl flex items-center justify-center shadow-2xl">
                                        <Album className="h-10 w-10 text-white" />
                                    </div>
                                    <div className="absolute -inset-3 bg-gradient-to-br from-purple-500 to-emerald-500 rounded-3xl blur opacity-30 animate-pulse"></div>
                                </div>
                                <div>
                                    <h1 className="text-5xl md:text-6xl font-black bg-gradient-to-r from-purple-400 via-blue-400 to-emerald-400 bg-clip-text text-transparent drop-shadow-2xl">
                                        RELEASES
                                    </h1>
                                    <p className="text-xl md:text-2xl text-gray-300 mt-2 font-medium">
                                        Álbuns e Compilações da Plataforma
                                    </p>
                                </div>
                            </div>

                            {/* Estatísticas */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 max-w-4xl mx-auto">
                                <div className="bg-purple-600/20 border border-purple-500/30 rounded-xl p-4">
                                    <div className="text-2xl font-bold text-purple-400">{releases.length}</div>
                                    <div className="text-sm text-purple-300">Total de Releases</div>
                                </div>
                                <div className="bg-blue-600/20 border border-blue-500/30 rounded-xl p-4">
                                    <div className="text-2xl font-bold text-blue-400">{releases.filter(r => r.featured).length}</div>
                                    <div className="text-sm text-blue-300">Featured</div>
                                </div>
                                <div className="bg-emerald-600/20 border border-emerald-500/30 rounded-xl p-4">
                                    <div className="text-2xl font-bold text-emerald-400">{releases.filter(r => r.exclusive).length}</div>
                                    <div className="text-sm text-emerald-300">Exclusivos</div>
                                </div>
                                <div className="bg-yellow-600/20 border border-yellow-500/30 rounded-xl p-4">
                                    <div className="text-2xl font-bold text-yellow-400">{uniqueGenres.length}</div>
                                    <div className="text-sm text-yellow-300">Gêneros</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Conteúdo Principal */}
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {/* Barra de Pesquisa e Filtros */}
                    <div className="mb-8">
                        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
                            {/* Barra de Pesquisa */}
                            <div className="flex-1 relative">
                                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Buscar releases, artistas, álbuns..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-12 pr-4 py-4 bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 rounded-2xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all duration-300"
                                />
                            </div>

                            {/* Botões de Ação */}
                            <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                                <button
                                    onClick={handleAddRelease}
                                    className="px-6 py-4 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-2xl font-semibold hover:from-purple-600 hover:to-blue-600 transition-all duration-300 shadow-lg flex items-center gap-2"
                                >
                                    <Plus className="h-5 w-5" />
                                    Adicionar Release
                                </button>

                                <button
                                    onClick={() => setViewMode(viewMode === "grid" ? "list" : "grid")}
                                    className="px-6 py-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-2xl font-semibold hover:from-emerald-600 hover:to-teal-600 transition-all duration-300 shadow-lg flex items-center gap-2"
                                >
                                    {viewMode === "grid" ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                    {viewMode === "grid" ? "Lista" : "Grid"}
                                </button>

                                {searchQuery || selectedGenre || selectedArtist || showFeaturedOnly || showExclusiveOnly ? (
                                    <button
                                        onClick={clearFilters}
                                        className="px-6 py-4 bg-gray-700 text-white rounded-2xl font-semibold hover:bg-gray-600 transition-all duration-300"
                                    >
                                        Limpar
                                    </button>
                                ) : null}
                            </div>
                        </div>

                        {/* Filtros Avançados */}
                        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                            {/* Filtro por Gênero */}
                            <select
                                value={selectedGenre}
                                onChange={(e) => setSelectedGenre(e.target.value)}
                                className="px-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50"
                            >
                                <option value="">🎵 Todos os gêneros</option>
                                {uniqueGenres.map(genre => (
                                    <option key={genre} value={genre}>🎧 {genre}</option>
                                ))}
                            </select>

                            {/* Filtro por Artista */}
                            <select
                                value={selectedArtist}
                                onChange={(e) => setSelectedArtist(e.target.value)}
                                className="px-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50"
                            >
                                <option value="">🎤 Todos os artistas</option>
                                {uniqueArtists.map(artist => (
                                    <option key={artist} value={artist}>👤 {artist}</option>
                                ))}
                            </select>

                            {/* Ordenar por */}
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value as any)}
                                className="px-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50"
                            >
                                <option value="date">📅 Data de Lançamento</option>
                                <option value="title">📖 Título</option>
                                <option value="artist">👤 Artista</option>
                                <option value="popularity">⭐ Popularidade</option>
                            </select>

                            {/* Checkbox Featured */}
                            <label className="flex items-center gap-3 px-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-xl cursor-pointer hover:bg-gray-800/70 transition-colors">
                                <input
                                    type="checkbox"
                                    checked={showFeaturedOnly}
                                    onChange={(e) => setShowFeaturedOnly(e.target.checked)}
                                    className="w-4 h-4 text-purple-600 bg-gray-700 border-gray-600 rounded focus:ring-purple-500 focus:ring-2"
                                />
                                <span className="text-white text-sm">⭐ Featured</span>
                            </label>

                            {/* Checkbox Exclusive */}
                            <label className="flex items-center gap-3 px-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-xl cursor-pointer hover:bg-gray-800/70 transition-colors">
                                <input
                                    type="checkbox"
                                    checked={showExclusiveOnly}
                                    onChange={(e) => setShowExclusiveOnly(e.target.checked)}
                                    className="w-4 h-4 text-emerald-600 bg-gray-700 border-gray-600 rounded focus:ring-emerald-500 focus:ring-2"
                                />
                                <span className="text-white text-sm">🔒 Exclusive</span>
                            </label>
                        </div>

                        {/* Indicadores de Status */}
                        <div className="mt-6 p-4 bg-gray-800/30 backdrop-blur-sm rounded-2xl border border-gray-700/30">
                            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 bg-purple-500 rounded-full animate-pulse"></div>
                                        <span className="text-purple-300 font-medium">
                                            🎵 {sortedReleases.length} releases encontrados
                                        </span>
                                    </div>
                                    <div className="hidden sm:flex items-center gap-2 text-gray-400">
                                        <span>•</span>
                                        <span>Total: {releases.length}</span>
                                    </div>
                                </div>

                                {/* Filtros Ativos */}
                                {(selectedGenre || selectedArtist || showFeaturedOnly || showExclusiveOnly) && (
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm text-gray-400">Filtros ativos:</span>
                                        <div className="flex flex-wrap gap-2">
                                            {selectedGenre && (
                                                <span className="px-3 py-1 bg-purple-500/20 text-purple-300 text-xs rounded-full border border-purple-500/30">
                                                    {selectedGenre}
                                                </span>
                                            )}
                                            {selectedArtist && (
                                                <span className="px-3 py-1 bg-blue-500/20 text-blue-300 text-xs rounded-full border border-blue-500/30">
                                                    {selectedArtist}
                                                </span>
                                            )}
                                            {showFeaturedOnly && (
                                                <span className="px-3 py-1 bg-yellow-500/20 text-yellow-300 text-xs rounded-full border border-yellow-500/30">
                                                    Featured
                                                </span>
                                            )}
                                            {showExclusiveOnly && (
                                                <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 text-xs rounded-full border border-emerald-500/30">
                                                    Exclusive
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Grid de Releases */}
                    {viewMode === "grid" ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {sortedReleases.map((release) => (
                                <div
                                    key={release.id}
                                    className="group bg-gray-800/30 backdrop-blur-sm rounded-2xl border border-gray-700/30 overflow-hidden hover:border-purple-500/50 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/25"
                                >
                                    {/* Album Art */}
                                    <div className="relative aspect-square overflow-hidden">
                                        <Image
                                            src={release.albumArt}
                                            alt={release.title}
                                            fill
                                            className="object-cover group-hover:scale-110 transition-transform duration-500"
                                        />

                                        {/* Overlay com botões */}
                                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2">
                                            <button
                                                onClick={() => handleViewRelease(release.id)}
                                                className="p-3 bg-purple-600/80 hover:bg-purple-600 text-white rounded-xl transition-colors"
                                                title="Ver detalhes"
                                            >
                                                <Eye className="h-5 w-5" />
                                            </button>

                                            {session?.user && (session.user as any)?.isAdmin && (
                                                <>
                                                    <button
                                                        onClick={() => handleEditRelease(release.id)}
                                                        className="p-3 bg-blue-600/80 hover:bg-blue-600 text-white rounded-xl transition-colors"
                                                        title="Editar"
                                                    >
                                                        <Edit className="h-5 w-5" />
                                                    </button>

                                                    <button
                                                        onClick={() => {/* Implementar delete */ }}
                                                        className="p-3 bg-red-600/80 hover:bg-red-600 text-white rounded-xl transition-colors"
                                                        title="Excluir"
                                                    >
                                                        <Trash2 className="h-5 w-5" />
                                                    </button>
                                                </>
                                            )}
                                        </div>

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

                                        {/* Gênero */}
                                        <div className="absolute top-3 right-3">
                                            <span className="px-2 py-1 bg-gray-900/80 text-gray-200 text-xs font-medium rounded-full">
                                                {release.genre}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Informações */}
                                    <div className="p-4">
                                        <h3 className="text-lg font-bold text-white mb-2 line-clamp-2 group-hover:text-purple-400 transition-colors">
                                            {release.title}
                                        </h3>

                                        <p className="text-gray-300 text-sm mb-3 font-medium">
                                            {release.artist}
                                        </p>

                                        {release.description && (
                                            <p className="text-gray-400 text-xs mb-3 line-clamp-2">
                                                {release.description}
                                            </p>
                                        )}

                                        {/* Detalhes */}
                                        <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                                            <span>{release.trackCount} tracks</span>
                                            {release.duration && <span>{release.duration}</span>}
                                            <span>{new Date(release.releaseDate).toLocaleDateString('pt-BR')}</span>
                                        </div>

                                        {/* Streaming Links */}
                                        {release.streaming && Object.keys(release.streaming).length > 0 && (
                                            <div className="flex items-center gap-2 mb-3">
                                                {release.streaming.spotify && (
                                                    <a
                                                        href={release.streaming.spotify}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="p-2 bg-green-600/20 hover:bg-green-600/40 text-green-400 rounded-lg transition-colors"
                                                        title="Spotify"
                                                    >
                                                        <Music className="h-4 w-4" />
                                                    </a>
                                                )}
                                                {release.streaming.deezer && (
                                                    <a
                                                        href={release.streaming.deezer}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="p-2 bg-blue-600/20 hover:bg-blue-600/40 text-blue-400 rounded-lg transition-colors"
                                                        title="Deezer"
                                                    >
                                                        <Disc className="h-4 w-4" />
                                                    </a>
                                                )}
                                                {release.streaming.youtube && (
                                                    <a
                                                        href={release.streaming.youtube}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="p-2 bg-red-600/20 hover:bg-red-600/40 text-red-400 rounded-lg transition-colors"
                                                        title="YouTube"
                                                    >
                                                        <Youtube className="h-4 w-4" />
                                                    </a>
                                                )}
                                            </div>
                                        )}

                                        {/* Social Links */}
                                        {release.social && Object.keys(release.social).length > 0 && (
                                            <div className="flex items-center gap-2">
                                                {release.social.instagram && (
                                                    <a
                                                        href={`https://instagram.com/${release.social.instagram.replace('@', '')}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="p-2 bg-pink-600/20 hover:bg-pink-600/40 text-pink-400 rounded-lg transition-colors"
                                                        title="Instagram"
                                                    >
                                                        <Instagram className="h-4 w-4" />
                                                    </a>
                                                )}
                                                {release.social.facebook && (
                                                    <a
                                                        href={`https://facebook.com/${release.social.facebook}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="p-2 bg-blue-600/20 hover:bg-blue-600/40 text-blue-400 rounded-lg transition-colors"
                                                        title="Facebook"
                                                    >
                                                        <Facebook className="h-4 w-4" />
                                                    </a>
                                                )}
                                                {release.social.website && (
                                                    <a
                                                        href={release.social.website}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="p-2 bg-purple-600/20 hover:bg-purple-600/40 text-purple-400 rounded-lg transition-colors"
                                                        title="Website"
                                                    >
                                                        <Globe className="h-4 w-4" />
                                                    </a>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        /* Lista de Releases */
                        <div className="space-y-4">
                            {sortedReleases.map((release) => (
                                <div
                                    key={release.id}
                                    className="group bg-gray-800/30 backdrop-blur-sm rounded-2xl border border-gray-700/30 p-4 hover:border-purple-500/50 transition-all duration-300"
                                >
                                    <div className="flex items-center gap-4">
                                        {/* Album Art */}
                                        <div className="relative w-20 h-20 flex-shrink-0">
                                            <Image
                                                src={release.albumArt}
                                                alt={release.title}
                                                fill
                                                className="object-cover rounded-xl group-hover:scale-105 transition-transform duration-300"
                                            />

                                            {/* Badges */}
                                            <div className="absolute -top-2 -left-2 flex flex-col gap-1">
                                                {release.featured && (
                                                    <span className="px-1 py-0.5 bg-yellow-500/90 text-yellow-900 text-xs font-bold rounded-full">
                                                        ⭐
                                                    </span>
                                                )}
                                                {release.exclusive && (
                                                    <span className="px-1 py-0.5 bg-emerald-500/90 text-emerald-900 text-xs font-bold rounded-full">
                                                        👑
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Informações */}
                                        <div className="flex-1 min-w-0">
                                            <h3 className="text-lg font-bold text-white mb-1 group-hover:text-purple-400 transition-colors">
                                                {release.title}
                                            </h3>

                                            <p className="text-gray-300 text-sm mb-2 font-medium">
                                                {release.artist}
                                            </p>

                                            {release.description && (
                                                <p className="text-gray-400 text-sm line-clamp-2">
                                                    {release.description}
                                                </p>
                                            )}

                                            {/* Detalhes */}
                                            <div className="flex items-center gap-4 text-xs text-gray-500 mt-2">
                                                <span className="flex items-center gap-1">
                                                    <Music className="h-3 w-3" />
                                                    {release.trackCount} tracks
                                                </span>
                                                {release.duration && (
                                                    <span className="flex items-center gap-1">
                                                        <Clock className="h-3 w-3" />
                                                        {release.duration}
                                                    </span>
                                                )}
                                                <span className="flex items-center gap-1">
                                                    <Calendar className="h-3 w-3" />
                                                    {new Date(release.releaseDate).toLocaleDateString('pt-BR')}
                                                </span>
                                                <span className="px-2 py-1 bg-gray-700/50 text-gray-300 rounded-full">
                                                    {release.genre}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Botões de Ação */}
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => handleViewRelease(release.id)}
                                                className="p-3 bg-purple-600/20 hover:bg-purple-600/40 text-purple-400 rounded-xl transition-colors"
                                                title="Ver detalhes"
                                            >
                                                <Eye className="h-5 w-5" />
                                            </button>

                                            {session?.user?.email?.includes('admin') && (
                                                <>
                                                    <button
                                                        onClick={() => handleEditRelease(release.id)}
                                                        className="p-3 bg-blue-600/20 hover:bg-blue-600/40 text-blue-400 rounded-xl transition-colors"
                                                        title="Editar"
                                                    >
                                                        <Edit className="h-5 w-5" />
                                                    </button>

                                                    <button
                                                        onClick={() => {/* Implementar delete */ }}
                                                        className="p-3 bg-red-600/20 hover:bg-red-600/40 text-red-400 rounded-xl transition-colors"
                                                        title="Excluir"
                                                    >
                                                        <Trash2 className="h-5 w-5" />
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Mensagem quando não há resultados */}
                    {sortedReleases.length === 0 && (
                        <div className="text-center py-20">
                            <div className="w-24 h-24 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Album className="h-12 w-12 text-gray-400" />
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-4">Nenhum release encontrado</h3>
                            <p className="text-gray-400 mb-6">
                                {searchQuery || selectedGenre || selectedArtist || showFeaturedOnly || showExclusiveOnly
                                    ? "Tente ajustar os filtros de busca"
                                    : "Não há releases disponíveis no momento."}
                            </p>
                            {(searchQuery || selectedGenre || selectedArtist || showFeaturedOnly || showExclusiveOnly) && (
                                <button
                                    onClick={clearFilters}
                                    className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors"
                                >
                                    Limpar Filtros
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </MainLayout>
    );
};

export default ReleasesPage;
