'use client';

import { useState, useEffect } from 'react';
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
    Search,
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
    const [selectedGenre, setSelectedGenre] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
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

    const filteredTracks = tracks.filter(track => {
        const matchesSearch = track.songName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            track.artist.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesGenre = selectedGenre === 'all' || track.genre === selectedGenre;
        return matchesSearch && matchesGenre;
    });

    const genres = ['all', 'Brazilian Bass', 'Deep House', 'Progressive House', 'Electro House', 'Trance'];

    if (loading) {
        return (
            <div className="min-h-screen bg-black">
                <div className="container mx-auto px-4 py-8">
                    <div className="flex items-center justify-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black">
            <div className="container mx-auto px-4 py-8">

                {/* Hero Section */}
                <div className="mb-12">
                    <div className="text-center mb-8">
                        <div className="flex items-center justify-center mb-6">
                            <div className="relative">
                                <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-purple-600 rounded-full blur-xl opacity-50"></div>
                                <div className="relative bg-black border border-gray-800 rounded-full p-4">
                                    <Disc3 className="h-12 w-12 text-white" />
                                </div>
                            </div>
                        </div>
                        <h1 className="text-6xl font-black text-white mb-4 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                            RECORD LABEL
                        </h1>
                        <p className="text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
                            Descubra as produções exclusivas da nossa gravadora, disponíveis nos principais streamings
                        </p>
                    </div>


                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                    <div className="bg-black border border-gray-800 rounded-2xl p-6 hover:scale-105 transition-all duration-300 relative overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        <div className="relative flex items-center gap-4">
                            <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                                <Music className="h-7 w-7 text-white" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-400 font-medium">Total de Músicas</p>
                                <p className="text-3xl font-black text-white">{tracks.length}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-black border border-gray-800 rounded-2xl p-6 hover:scale-105 transition-all duration-300 relative overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 to-emerald-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        <div className="relative flex items-center gap-4">
                            <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                                <TrendingUp className="h-7 w-7 text-white" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-400 font-medium">Streams Mensais</p>
                                <p className="text-3xl font-black text-white">45.2K</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-black border border-gray-800 rounded-2xl p-6 hover:scale-105 transition-all duration-300 relative overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-pink-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        <div className="relative flex items-center gap-4">
                            <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
                                <Award className="h-7 w-7 text-white" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-400 font-medium">Prêmios</p>
                                <p className="text-3xl font-black text-white">12</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-black border border-gray-800 rounded-2xl p-6 hover:scale-105 transition-all duration-300 relative overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-r from-orange-500/5 to-red-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        <div className="relative flex items-center gap-4">
                            <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg">
                                <Globe className="h-7 w-7 text-white" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-400 font-medium">Países</p>
                                <p className="text-3xl font-black text-white">28</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Search and Filters */}
                <div className="mb-8">
                    <div className="flex flex-col lg:flex-row gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Buscar músicas da gravadora..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-12 pr-4 py-4 bg-black border border-gray-800 rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 transition-all duration-300"
                            />
                        </div>
                        <select
                            value={selectedGenre}
                            onChange={(e) => setSelectedGenre(e.target.value)}
                            className="px-6 py-4 bg-black border border-gray-800 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 transition-all duration-300"
                        >
                            {genres.map(genre => (
                                <option key={genre} value={genre}>
                                    {genre === 'all' ? 'Todos os Gêneros' : genre}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Artists Section */}
                <div className="mb-12">
                    <div className="flex items-center gap-3 mb-6">
                        <Mic className="h-6 w-6 text-purple-400" />
                        <h2 className="text-3xl font-black text-white">Artistas da Gravadora</h2>
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* DJ Jéssika Luana */}
                        <div className="bg-black border border-gray-800 rounded-3xl p-8 hover:scale-105 transition-all duration-300 group relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-r from-red-500/5 to-purple-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            <div className="relative">
                                <div className="flex items-center gap-6 mb-6">
                                    <div className="relative">
                                        <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-purple-600 rounded-full blur-xl opacity-30"></div>
                                        <div className="relative w-24 h-24 bg-black border border-gray-700 rounded-full flex items-center justify-center shadow-2xl">
                                            <img
                                                src="https://i.ibb.co/vvcZpm0d/20250508-0639-Varia-es-da-Garota-remix-01jtqm5hshex7a23kkhghy64v1.png"
                                                alt="DJ Jéssika Luana"
                                                className="w-20 h-20 rounded-full object-cover"
                                            />
                                        </div>
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-2xl font-black text-white mb-2">DJ Jéssika Luana</h3>
                                        <p className="text-gray-400 mb-3">Picada Café, RS</p>
                                        <div className="flex items-center gap-4 text-sm">
                                            <div className="flex items-center gap-2 bg-gray-900 px-3 py-1 rounded-full border border-gray-700">
                                                <Users className="h-4 w-4 text-purple-400" />
                                                <span className="text-gray-300">8 monthly listeners</span>
                                            </div>
                                            <div className="flex items-center gap-2 bg-gray-900 px-3 py-1 rounded-full border border-gray-700">
                                                <Heart className="h-4 w-4 text-pink-400" />
                                                <span className="text-gray-300">6 Followers</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <p className="text-gray-400 mb-6 leading-relaxed">
                                    DJ Jéssika é a energia contagiante que vem direto de Picada Café para as pistas do mundo. Com um estilo jovem, ousado e criativo, ela domina os ritmos dançantes que fazem qualquer um sair do chão.
                                </p>

                                {/* Spotify Playlist */}
                                <div className="mb-6">
                                    <h4 className="text-lg font-bold text-white mb-3">Playlist Oficial</h4>
                                    <iframe
                                        data-testid="embed-iframe"
                                        style={{ borderRadius: '12px' }}
                                        src="https://open.spotify.com/embed/playlist/4Vvh79uR5SBNJyLRkfr3aX?utm_source=generator&theme=0"
                                        width="100%"
                                        height="352"
                                        frameBorder="0"
                                        allowFullScreen={true}
                                        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                                        loading="lazy"
                                    />
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="flex gap-3">
                                        <button className="p-3 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 rounded-full transition-all duration-300 shadow-lg shadow-red-500/25">
                                            <Instagram className="h-5 w-5 text-white" />
                                        </button>
                                        <button className="p-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 rounded-full transition-all duration-300 shadow-lg shadow-blue-500/25">
                                            <Facebook className="h-5 w-5 text-white" />
                                        </button>
                                        <button className="p-3 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 rounded-full transition-all duration-300 shadow-lg shadow-green-500/25">
                                            <Music className="h-5 w-5 text-white" />
                                        </button>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm text-gray-400">Músicas</p>
                                        <p className="text-2xl font-black text-white">12</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Rebeka Sanches */}
                        <div className="bg-black border border-gray-800 rounded-3xl p-8 hover:scale-105 transition-all duration-300 group relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-cyan-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            <div className="relative">
                                <div className="flex items-center gap-6 mb-6">
                                    <div className="relative">
                                        <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-full blur-xl opacity-30"></div>
                                        <div className="relative w-24 h-24 bg-black border border-gray-700 rounded-full flex items-center justify-center shadow-2xl">
                                            <img
                                                src="https://i.ibb.co/5XR8b2Xr/492313840-122095806554856833-4887195066294116636-n.jpg"
                                                alt="Rebeka Sanches"
                                                className="w-20 h-20 rounded-full object-cover"
                                            />
                                        </div>
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-2xl font-black text-white mb-2">Rebeka Sanches</h3>
                                        <p className="text-gray-400 mb-3">São Paulo, SP</p>
                                        <div className="flex items-center gap-4 text-sm">
                                            <div className="flex items-center gap-2 bg-gray-900 px-3 py-1 rounded-full border border-gray-700">
                                                <Users className="h-4 w-4 text-blue-400" />
                                                <span className="text-gray-300">15 monthly listeners</span>
                                            </div>
                                            <div className="flex items-center gap-2 bg-gray-900 px-3 py-1 rounded-full border border-gray-700">
                                                <Heart className="h-4 w-4 text-pink-400" />
                                                <span className="text-gray-300">12 Followers</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <p className="text-gray-400 mb-6 leading-relaxed">
                                    Rebeka Sanches é uma produtora musical inovadora que combina elementos eletrônicos com ritmos brasileiros. Sua música transcende fronteiras e conecta culturas através de melodias únicas e batidas contagiantes.
                                </p>
                                <div className="flex items-center justify-between">
                                    <div className="flex gap-3">
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
                                    <div className="text-right">
                                        <p className="text-sm text-gray-400">Músicas</p>
                                        <p className="text-2xl font-black text-white">8</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>







                {/* Latest Releases */}
                <div className="mb-12">
                    <div className="flex items-center gap-3 mb-6">
                        <Album className="h-6 w-6 text-purple-400" />
                        <h2 className="text-3xl font-black text-white">Últimos Lançamentos</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[
                            {
                                title: "Vem Pro Meu Ritmo",
                                type: "Single",
                                year: "2025",
                                tracks: 1,
                                artist: "DJ Jéssika Luana",
                                duration: "03:33",
                                playUrl: "https://usc1.contabostorage.com/211285f2fbcc4760a62df1aff280735f:plataforma-de-musicas/DJ JÉSSIKA PRODUÇÕES/Dj Jéssika Luana - Vem Pro Meu Ritmo (Original Mix).mp3",
                                downloadUrl: "https://usc1.contabostorage.com/211285f2fbcc4760a62df1aff280735f:plataforma-de-musicas/DJ JÉSSIKA PRODUÇÕES/Dj Jéssika Luana - Vem Pro Meu Ritmo (Original Mix).mp3",
                                spotifyUrl: "https://api.ffm.to/sl/e/c/vem-pro-meu-ritmo?cd=eyJ1YSI6eyJ1YSI6Ik1vemlsbGEvNS4wIChXaW5kb3dzIE5UIDEwLjA7IFdpbjY0OyB4NjQpIEFwcGxlV2ViS2l0LzUzNy4zNiAoS0hUTUwsIGxpa2UgR2Vja28pIENocm9tZS8xMzguMC4wLjAgU2FmYXJpLzUzNy4zNiIsImJyb3dzZXIiOnsibmFtZSI6IkNocm9tZSIsInZlcnNpb24iOiIxMzguMC4wLjAiLCJtYWpvciI6IjEzOCJ9LCJjcHUiOnsiYXJjaGl0ZWN0dXJlIjoiYW1kNjQifSwiZGV2aWNlIjp7fSwiZW5naW5lIjp7Im5hbWUiOiJCbGluayIsInZlcnNpb24iOiIxMzguMC4wLjAifSwib3MiOnsibmFtZSI6IldpbmRvd3MiLCJ2ZXJzaW9uIjoiMTAifX0sImNsaWVudCI6eyJyaWQiOiIzZmZjZjJjYS0wZDE0LTRiZTktYjg0MC1lZjAyNWZkMmQ3NDYiLCJzaWQiOiJiNTM4N2JkMy02ZjE0LTRmMzItYjI4MS04MmMyMjE4MjYwYjciLCJpcCI6IjEzOC4xMTguMTUuMTgzIiwicmVmIjoiIiwiaG9zdCI6ImRpdHRvLmZtIiwibGFuZyI6InB0LUJSIiwiaXBDb3VudHJ5IjoiQlIifSwiaXNXZWJwU3VwcG9ydGVkIjp0cnVlLCJnZHByRW5mb3JjZSI6ZmFsc2UsImNvdW50cnlDb2RlIjoiQlIiLCJpc0JvdCI6ZmFsc2UsInVzZUFmZiI6Im9yaWdpbiIsInZpZCI6IjA5ZjQzMzI4LTM1MjMtNGQwYi1iZDk2LTdhZmQ5OTY4NjhjZSIsImlkIjoiNjgzYmFmOTIzYzAwMDAxNjAwMmEyOWU5IiwicHJ2IjpmYWxzZSwiaXNQcmVSIjpmYWxzZSwidHpvIjpudWxsLCJjaCI6bnVsbCwiYW4iOm51bGwsImRlc3RVcmwiOiJodHRwczovL29wZW4uc3BvdGlmeS5jb20vYWxidW0vM2FTQUFrcDZxRjkxa290OUZ3Z3lUayIsInNydmMiOiJzcG90aWZ5IiwicHJvZHVjdCI6InNtYXJ0bGluayIsInNob3J0SWQiOiJ2ZW0tcHJvLW1ldS1yaXRtbyIsImlzQXV0aG9yaXphdGlvblJlcXVpcmVkIjpmYWxzZSwib3duZXIiOiI1YzUwYjUxZDE0MDAwMDE5MDA2ODY4OTEiLCJ0ZW5hbnQiOiI1ZDJjMjk2M2YwZDUxZWViZDI0ZTc3ODciLCJhciI6IjVjYTNiODcyMGUwMDAwMGJhMzliYzRlMiIsImlzU2hvcnRMaW5rIjpmYWxzZSwibmF0aXZlIjpmYWxzZX0",
                                amazonUrl: "https://music.amazon.com/albums/B0FBBJ8VM8?ref=dm_ff_amazonmusic.3p&tag=featurefmbr-20",
                                deezerUrl: "https://www.deezer.com/br/album/764543041",
                                tidalUrl: "https://tidal.com/album/438959283",
                                isLatest: true
                            },
                            { title: "Sul Azul Imortal", type: "Album", year: "2025", tracks: 12 },
                            { title: "Agro é Top no Batidão", type: "Album", year: "2025", tracks: 8 },
                            { title: "Bate Forte Pernambuco", type: "Album", year: "2025", tracks: 10 },
                            { title: "Burning Horizon", type: "Album", year: "2025", tracks: 15 },
                            { title: "Do You Wanna Play A Game", type: "Album", year: "2025", tracks: 6 }
                        ].map((release, index) => (
                            <div key={index} className="bg-black border border-gray-800 rounded-2xl p-6 hover:scale-105 transition-all duration-300 group relative overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 to-purple-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                <div className="relative mb-4">
                                    <div className="w-full aspect-square bg-black border border-gray-700 rounded-xl flex items-center justify-center overflow-hidden">
                                        {release.isLatest ? (
                                            <img
                                                src="https://i.ibb.co/vvcZpm0d/20250508-0639-Varia-es-da-Garota-remix-01jtqm5hshex7a23kkhghy64v1.png"
                                                alt="Vem Pro Meu Ritmo - DJ Jéssika Luana"
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <Album className="h-12 w-12 text-gray-600" />
                                        )}
                                    </div>
                                    {release.isLatest && (
                                        <div className="absolute top-2 left-2">
                                            <span className="px-2 py-1 bg-red-600 text-white text-xs font-bold rounded">NOVO</span>
                                        </div>
                                    )}
                                    <button
                                        onClick={() => {
                                            if (release.isLatest) {
                                                if (isPlaying && currentTrack?.songName === release.title) {
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
                                                    const newAudio = new Audio(release.playUrl);
                                                    newAudio.addEventListener('ended', () => {
                                                        setIsPlaying(false);
                                                        setCurrentTrack(null);
                                                    });

                                                    setAudio(newAudio);
                                                    setIsPlaying(true);
                                                    setCurrentTrack({
                                                        id: 999,
                                                        songName: release.title,
                                                        artist: release.artist || 'DJ Jéssika Luana',
                                                        style: 'Single',
                                                        duration: release.duration || '03:33',
                                                        bpm: 140,
                                                        key: 'Am',
                                                        downloadUrl: release.downloadUrl,
                                                        releaseDate: release.year,
                                                        genre: 'Single'
                                                    });

                                                    newAudio.play().catch(error => {
                                                        console.error('Erro ao tocar áudio:', error);
                                                        showToast('❌ Erro ao tocar música', 'error');
                                                    });
                                                    showToast(`▶️ Tocando "${release.title}"`, 'success');
                                                }
                                            }
                                        }}
                                        className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                                    >
                                        {isPlaying && currentTrack?.songName === release.title ? (
                                            <Pause className="h-8 w-8 text-white bg-black/50 rounded-full p-1" />
                                        ) : (
                                            <Play className="h-8 w-8 text-white bg-black/50 rounded-full p-1" />
                                        )}
                                    </button>
                                </div>
                                <div className="space-y-2">
                                    <h3 className="font-bold text-white">{release.title}</h3>
                                    {release.artist && (
                                        <p className="text-sm text-gray-400">{release.artist}</p>
                                    )}
                                    <div className="flex items-center justify-between text-sm text-gray-400">
                                        <span>{release.type} • {release.year}</span>
                                        <span>{release.duration || `${release.tracks} faixas`}</span>
                                    </div>
                                    {release.isLatest && (
                                        <div className="space-y-2 mt-3">
                                            <a
                                                href={release.spotifyUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center justify-center gap-2 w-full px-3 py-2 bg-green-600 hover:bg-green-700 rounded-lg transition-colors text-white text-sm font-medium"
                                            >
                                                <Music className="h-4 w-4" />
                                                Spotify
                                            </a>
                                            <a
                                                href={release.amazonUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center justify-center gap-2 w-full px-3 py-2 bg-orange-600 hover:bg-orange-700 rounded-lg transition-colors text-white text-sm font-medium"
                                            >
                                                <Music className="h-4 w-4" />
                                                Amazon Music
                                            </a>
                                            <a
                                                href={release.deezerUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center justify-center gap-2 w-full px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors text-white text-sm font-medium"
                                            >
                                                <Headphones className="h-4 w-4" />
                                                Deezer
                                            </a>
                                            <a
                                                href={release.tidalUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center justify-center gap-2 w-full px-3 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors text-white text-sm font-medium"
                                            >
                                                <Music className="h-4 w-4" />
                                                Tidal
                                            </a>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Contact Section */}
                <div className="text-center">
                    <div className="bg-black border border-gray-800 rounded-3xl p-8 relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-r from-red-500/5 to-purple-600/5"></div>
                        <div className="relative">
                            <h2 className="text-3xl font-black text-white mb-4">Entre em Contato</h2>
                            <p className="text-gray-400 mb-8 text-lg leading-relaxed">
                                Interessado em trabalhar com nossa gravadora? Entre em contato conosco!
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <button className="px-8 py-4 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-bold rounded-2xl hover:scale-105 transition-all duration-300 shadow-lg shadow-red-500/25">
                                    <Mail className="h-5 w-5 inline mr-2" />
                                    Contato
                                </button>
                                <button className="px-8 py-4 bg-black border border-gray-700 text-white font-bold rounded-2xl hover:bg-gray-900 transition-all duration-300">
                                    <Zap className="h-5 w-5 inline mr-2" />
                                    Parcerias
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default RecordLabelPage; 