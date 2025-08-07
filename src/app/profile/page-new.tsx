"use client";

import React, { useState, useEffect, useMemo, memo, useRef } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import {
    Crown,
    BarChart3,
    Download,
    Music,
    Heart,
    Play,
    Settings,
    CreditCard,
    User,
    Bell,
    Shield,
    HelpCircle,
    LogOut,
    ChevronRight,
    Calendar,
    CheckCircle,
    XCircle,
    Clock,
    Star,
    MessageSquare,
    ListMusic,
    Package,
    Disc,
    Zap,
    Activity,
    Folder,
    Archive,
    Globe,
    FileText,
    Camera,
    ThumbsUp,
    AlertCircle,
    Search,
    Instagram,
    Twitter,
    Facebook,
    SkipBack,
    SkipForward,
    Pause,
    Loader2
} from "lucide-react";
import { useRouter } from "next/navigation";

// Types
type Track = {
    id: number;
    songName: string;
    artist: string;
    imageUrl: string;
    downloadUrl: string;
    actionDate: string;
    previewUrl: string;
};

interface UserProfile {
    id: string;
    email: string;
    name: string;
    whatsapp: string | null;
    createdAt: string;
    is_vip: boolean | null;
    isPro: boolean | null;
    isAdmin: boolean | null;
    status: string | null;
    valor: number | null;
    vencimento: string | null;
    dataPagamento: string | null;
    dailyDownloadCount: number | null;
    dailyDownloadLimit: number | string;
    lastDownloadReset: string | null;
    weeklyPackRequests: number | null;
    weeklyPlaylistDownloads: number | null;
    weeklyPackRequestsUsed: number | null;
    weeklyPlaylistDownloadsUsed: number | null;
    lastWeekReset: string | null;
    customBenefits: any;
    deemix: boolean | null;
    deezerPremium: boolean | null;
    deezerEmail: string | null;
    deezerPassword: string | null;
    isUploader: boolean | null;
    downloadsCount: number;
    likesCount: number;
    playsCount: number;
    vipPlan: 'BASICO' | 'PADRAO' | 'COMPLETO' | null;
    arlPremium?: boolean | null;
    musicProduction?: boolean | null;
    profileLikes?: Track[];
    profileDownloads?: Track[];
}

interface VencimentoInfo {
    status: 'active' | 'expiring_soon' | 'expired' | 'cancelled' | 'no_expiry';
    daysRemaining: number | null;
    isExpired: boolean;
    isExpiringSoon: boolean;
}

// Header Component
const Header = memo(function Header({ onSearchChange }: { onSearchChange: (query: string) => void }) {
    const { data: session } = useSession();

    return (
        <header className="w-full bg-white/80 backdrop-blur-sm p-4 flex justify-between items-center border-b border-gray-200 sticky top-0 z-30">
            <div className="flex items-center gap-4">
                <Link href="/new" className="flex items-center gap-4">
                    <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center">
                        <Music size={16} className="text-white" />
                    </div>
                    <h1 className="text-xl font-bold text-gray-900 hidden sm:block">Nextor Records</h1>
                </Link>
            </div>
            <div className="relative w-full max-w-md mx-4 hidden lg:block">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                    type="text"
                    placeholder="Pesquisar por música ou artista..."
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                />
            </div>
            <div className="flex items-center gap-8">
                <nav className="hidden md:flex items-center space-x-8">
                    <Link href="/new" className="font-semibold transition-colors pb-2 text-gray-600 hover:text-blue-600">New</Link>
                    <Link href="/featured" className="font-semibold transition-colors pb-2 text-gray-600 hover:text-blue-600">Featured</Link>
                    <Link href="/trending" className="font-semibold transition-colors pb-2 text-gray-600 hover:text-blue-600">Trending</Link>
                    <Link href="/charts" className="font-semibold transition-colors pb-2 text-gray-600 hover:text-blue-600">Charts</Link>
                    <Link href="/profile" className="font-semibold transition-colors pb-2 text-blue-600 border-b-2 border-blue-600">Meu Perfil</Link>
                </nav>
                <div className="flex items-center gap-4">
                    {session?.user && (
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-600">Olá, {session.user.name || session.user.email}</span>
                            <button
                                onClick={() => window.location.href = '/api/auth/signout'}
                                className="text-sm text-red-600 hover:text-red-700"
                            >
                                Sair
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
});

// Footer Player Component
const FooterPlayer = memo(function FooterPlayer({
    track,
    onNext,
    onPrevious,
    onLike,
    onDownload,
    isPlaying,
    onPlayPause
}: {
    track: Track | null,
    onNext: () => void,
    onPrevious: () => void,
    onLike: (trackId: number) => void,
    onDownload: (track: Track) => void,
    isPlaying: boolean,
    onPlayPause: (state: boolean) => void
}) {
    const waveformRef = useRef<HTMLDivElement>(null);
    const wavesurfer = useRef<any>(null);

    useEffect(() => {
        const createWaveSurfer = async () => {
            if (waveformRef.current && track) {
                try {
                    const WaveSurfer = (await import('wavesurfer.js')).default;
                    if (wavesurfer.current) wavesurfer.current.destroy();

                    wavesurfer.current = WaveSurfer.create({
                        container: waveformRef.current,
                        waveColor: '#E2E8F0',
                        progressColor: '#007BFF',
                        cursorWidth: 1,
                        barWidth: 2,
                        barGap: 2,
                        barRadius: 2,
                        height: 40,
                        hideScrollbar: true
                    });

                    wavesurfer.current.load(track.previewUrl);
                    wavesurfer.current.on('ready', () => wavesurfer.current.play());
                    wavesurfer.current.on('play', () => onPlayPause(true));
                    wavesurfer.current.on('pause', () => onPlayPause(false));
                    wavesurfer.current.on('finish', onNext);
                } catch (error) {
                    console.error('Error creating wavesurfer:', error);
                }
            }
        };

        if (track) createWaveSurfer();
        return () => wavesurfer.current?.destroy();
    }, [track, onNext, onPlayPause]);

    if (!track) return null;

    const handlePlayPause = () => wavesurfer.current?.playPause();

    return (
        <footer className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-20 shadow-[0_-4px_15px_rgba(0,0,0,0.08)]">
            <div className="container mx-auto px-6 py-3 flex items-center gap-4">
                <img src={track.imageUrl} alt={track.songName} className="w-14 h-14 rounded-lg shadow-sm flex-shrink-0" />
                <div className="flex items-center gap-4 flex-shrink-0">
                    <button onClick={onPrevious} className="p-2 rounded-full bg-gray-100 hover:bg-gray-200">
                        <SkipBack size={20} className="text-gray-700" />
                    </button>
                    <button
                        onClick={handlePlayPause}
                        className="w-12 h-12 flex items-center justify-center rounded-full bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                    >
                        {isPlaying ? <Pause size={24} /> : <Play size={24} />}
                    </button>
                    <button onClick={onNext} className="p-2 rounded-full bg-gray-100 hover:bg-gray-200">
                        <SkipForward size={20} className="text-gray-700" />
                    </button>
                </div>
                <div className="flex-grow flex flex-col justify-center gap-1 w-full min-w-0">
                    <div className="truncate">
                        <p className="font-bold text-gray-900 truncate">{track.songName}</p>
                        <p className="text-sm text-gray-500 truncate">{track.artist}</p>
                    </div>
                    <div ref={waveformRef} className="w-full h-[40px]"></div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                        onClick={() => onLike(track.id)}
                        className="p-3 rounded-full hover:bg-blue-500/10"
                        title="Like"
                    >
                        <ThumbsUp size={20} className="text-blue-500" />
                    </button>
                    <button
                        onClick={() => onDownload(track)}
                        className="p-3 rounded-full hover:bg-green-500/10"
                        title="Download"
                    >
                        <Download size={20} className="text-green-500" />
                    </button>
                </div>
            </div>
        </footer>
    );
});

// Music List Component
function ProfileMusicList({
    tracks,
    onPlay,
    onLike,
    onDownload,
    likedTracks,
    downloadedTracks,
    currentTrackId,
    isPlaying
}: any) {
    if (tracks.length === 0) {
        return (
            <div className="text-center text-gray-500 p-16 border-2 border-dashed border-gray-300 rounded-lg">
                <Music size={48} className="mx-auto mb-4 text-gray-400" />
                <h3 className="text-xl font-semibold">Nenhuma música encontrada</h3>
                <p className="mt-2">Suas músicas aparecerão aqui.</p>
            </div>
        );
    }

    return (
        <div className="space-y-2 mt-6">
            {tracks.map((track: Track) => {
                const isLiked = likedTracks.includes(track.id);
                const isDownloaded = downloadedTracks.includes(track.id);
                const isCurrentlyPlaying = track.id === currentTrackId;

                return (
                    <div key={track.id} className="flex items-center justify-between p-4 rounded-lg hover:bg-gray-50 group transition-colors border border-gray-100">
                        <div className="flex items-center gap-4">
                            <div
                                className={`relative w-12 h-12 rounded-md overflow-hidden cursor-pointer shadow-sm ${isCurrentlyPlaying ? 'ring-2 ring-blue-500' : ''}`}
                                onClick={() => onPlay(track, tracks)}
                            >
                                <img src={track.imageUrl} alt={track.songName} className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    {isCurrentlyPlaying && isPlaying ?
                                        <Pause size={20} className="text-white" /> :
                                        <Play size={20} className="text-white" />
                                    }
                                </div>
                            </div>
                            <div>
                                <p className="font-semibold text-gray-800">{track.songName}</p>
                                <p className="text-sm text-gray-500">{track.artist}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => onLike(track.id)}
                                className="p-2 rounded-full hover:bg-blue-100"
                                title="Like"
                            >
                                <ThumbsUp
                                    size={18}
                                    className={`transition-colors ${isLiked ? 'text-blue-500 fill-current' : 'text-gray-500'}`}
                                />
                            </button>
                            <button
                                onClick={() => onDownload(track)}
                                className="p-2 rounded-full hover:bg-green-100"
                                title="Download"
                            >
                                <Download
                                    size={18}
                                    className={isDownloaded ? 'text-green-500' : 'text-blue-600'}
                                />
                            </button>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

// Site Footer Component
const SiteFooter = memo(function SiteFooter() {
    return (
        <footer className="bg-white border-t border-gray-200 mt-auto">
            <div className="max-w-screen-xl mx-auto py-8 px-6 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
                <div className="text-center md:text-left">
                    <p className="text-sm text-gray-500">&copy; {new Date().getFullYear()} Nextor Records. Todos os direitos reservados.</p>
                </div>
                <div className="flex items-center gap-2">
                    <span className="relative flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                    </span>
                    <p className="text-sm text-green-600 font-semibold">Todos os serviços online</p>
                </div>
                <div className="flex space-x-6">
                    <a href="#" className="text-gray-400 hover:text-gray-500"><Instagram size={24} /></a>
                    <a href="#" className="text-gray-400 hover:text-gray-500"><Twitter size={24} /></a>
                    <a href="#" className="text-gray-400 hover:text-gray-500"><Facebook size={24} /></a>
                </div>
            </div>
        </footer>
    );
});

export default function ModernProfilePage() {
    const { data: session, status: sessionStatus } = useSession();
    const [userData, setUserData] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'likes' | 'downloads'>('likes');
    const [profileLikes, setProfileLikes] = useState<Track[]>([]);
    const [profileDownloads, setProfileDownloads] = useState<Track[]>([]);
    const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [likedTracks, setLikedTracks] = useState<number[]>([]);
    const [downloadedTracks, setDownloadedTracks] = useState<number[]>([]);
    const router = useRouter();

    // Utility functions
    const formatCurrency = (value: number | null) => {
        if (value === null || isNaN(value)) return "N/D";
        return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
    };

    const formatDate = (dateString: string | null) => {
        if (!dateString) return "Não definido";
        return new Date(dateString).toLocaleDateString("pt-BR", {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active': return 'text-green-400 bg-green-400/10 border-green-400/20';
            case 'expiring_soon': return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';
            case 'expired': return 'text-red-400 bg-red-400/10 border-red-400/20';
            case 'cancelled': return 'text-gray-400 bg-gray-400/10 border-gray-400/20';
            default: return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'active': return 'Ativo';
            case 'expiring_soon': return 'Vencendo';
            case 'expired': return 'Expirado';
            case 'cancelled': return 'Cancelado';
            default: return 'Sem expiração';
        }
    };

    // Audio context functions
    const playTrack = (track: Track, trackList: Track[]) => {
        setCurrentTrack(track);
        setIsPlaying(true);
    };

    const nextTrack = () => {
        // Implement next track logic
        console.log('Next track');
    };

    const previousTrack = () => {
        // Implement previous track logic
        console.log('Previous track');
    };

    const handleLike = (trackId: number) => {
        setLikedTracks(prev =>
            prev.includes(trackId)
                ? prev.filter(id => id !== trackId)
                : [...prev, trackId]
        );
    };

    const handleDownload = (track: Track) => {
        setDownloadedTracks(prev => [...prev, track.id]);
        // Implement download logic
        console.log('Downloading:', track.songName);
    };

    useEffect(() => {
        if (sessionStatus === 'authenticated') {
            const fetchUserData = async () => {
                setLoading(true);
                try {
                    const [profileRes, userDataRes] = await Promise.all([
                        fetch('/api/user-data'),
                        fetch('/api/profile')
                    ]);

                    if (profileRes.ok) {
                        const profileData = await profileRes.json();
                        setProfileLikes(profileData.likes || []);
                        setProfileDownloads(profileData.downloads || []);
                    }

                    if (userDataRes.ok) {
                        const userData = await userDataRes.json();
                        setUserData(userData);
                    }
                } catch (error) {
                    console.error("Erro ao buscar dados:", error);
                } finally {
                    setLoading(false);
                }
            };

            fetchUserData();
        } else if (sessionStatus === 'unauthenticated') {
            router.push('/auth/sign-in');
        }
    }, [sessionStatus, router]);

    if (sessionStatus === 'loading' || loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
                    <p className="text-gray-600">Carregando perfil...</p>
                </div>
            </div>
        );
    }

    const showProfileNotice = session?.user && (!session.user.name || session.user.name === session.user.email);

    return (
        <div className="bg-gray-50 text-gray-800 font-inter min-h-screen flex flex-col">
            <Header onSearchChange={() => { }} />

            <main className="flex-grow">
                {/* Cover Photo */}
                <div className="h-[350px] bg-gradient-to-r from-blue-600 to-purple-600 relative">
                    <div className="absolute inset-0 bg-black/20"></div>
                    <Link href="/manage-profile" className="absolute top-4 right-4 bg-white/20 backdrop-blur-sm p-2 rounded-full shadow-md hover:bg-white/30 transition-colors">
                        <Camera size={20} className="text-white" />
                    </Link>
                </div>

                <div className="container mx-auto max-w-5xl px-8">
                    {/* Profile Header */}
                    <div className="flex items-end -mt-20">
                        <div className="relative w-40 h-40 bg-white rounded-full border-4 border-white shadow-lg flex-shrink-0 flex items-center justify-center">
                            {session?.user?.image ?
                                <img src={session.user.image} alt="Foto do Perfil" className="w-full h-full rounded-full object-cover" /> :
                                <span className="text-6xl font-bold text-gray-400">{session?.user?.name?.[0] || session?.user?.email?.[0]}</span>
                            }
                            <Link href="/manage-profile" className="absolute bottom-2 right-2 bg-gray-200/80 p-2 rounded-full hover:bg-gray-300 transition-colors">
                                <Camera size={16} className="text-gray-700" />
                            </Link>
                        </div>
                        <div className="ml-6 flex-grow">
                            <h1 className="text-3xl font-extrabold text-gray-900">{session?.user?.name || 'Nome do Usuário'}</h1>
                            <p className="text-md text-gray-500">{session?.user?.email}</p>
                            {userData?.is_vip && (
                                <div className="flex items-center gap-2 mt-2">
                                    <Crown className="h-5 w-5 text-yellow-500" />
                                    <span className="text-sm font-medium text-yellow-600">Membro VIP</span>
                                </div>
                            )}
                        </div>
                        <Link href="/manage-profile" className="bg-blue-500 text-white px-5 py-2 rounded-lg font-semibold hover:bg-blue-600 transition-colors">
                            Editar Perfil
                        </Link>
                    </div>

                    {/* Profile Notice */}
                    {showProfileNotice && (
                        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 rounded-md my-8" role="alert">
                            <div className="flex">
                                <div className="py-1">
                                    <AlertCircle className="h-5 w-5 text-yellow-500 mr-3" />
                                </div>
                                <div>
                                    <p className="font-bold">Complete seu perfil!</p>
                                    <p className="text-sm">Parece que seu nome completo não está definido. Clique em "Editar Perfil" para atualizá-lo.</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 my-8">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <div className="flex items-center justify-between mb-4">
                                <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                    <Download className="h-6 w-6 text-blue-600" />
                                </div>
                            </div>
                            <h3 className="font-semibold text-gray-900 mb-1">Downloads</h3>
                            <p className="text-2xl font-bold text-gray-900">{userData?.downloadsCount || 0}</p>
                        </div>

                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <div className="flex items-center justify-between mb-4">
                                <div className="h-12 w-12 bg-red-100 rounded-lg flex items-center justify-center">
                                    <Heart className="h-6 w-6 text-red-600" />
                                </div>
                            </div>
                            <h3 className="font-semibold text-gray-900 mb-1">Curtidas</h3>
                            <p className="text-2xl font-bold text-gray-900">{userData?.likesCount || 0}</p>
                        </div>

                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <div className="flex items-center justify-between mb-4">
                                <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                                    <Play className="h-6 w-6 text-green-600" />
                                </div>
                            </div>
                            <h3 className="font-semibold text-gray-900 mb-1">Plays</h3>
                            <p className="text-2xl font-bold text-gray-900">{userData?.playsCount || 0}</p>
                        </div>

                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <div className="flex items-center justify-between mb-4">
                                <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
                                    <Crown className="h-6 w-6 text-purple-600" />
                                </div>
                            </div>
                            <h3 className="font-semibold text-gray-900 mb-1">Plano</h3>
                            <p className="text-lg font-bold text-gray-900">{userData?.is_vip ? 'VIP' : 'Free'}</p>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="mt-8 border-b border-gray-200">
                        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                            <button
                                onClick={() => setActiveTab('likes')}
                                className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'likes'
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                            >
                                Músicas Curtidas
                            </button>
                            <button
                                onClick={() => setActiveTab('downloads')}
                                className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'downloads'
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                            >
                                Histórico de Downloads
                            </button>
                        </nav>
                    </div>

                    {/* Content */}
                    <div className="mt-8 mb-24">
                        {activeTab === 'likes' && (
                            <ProfileMusicList
                                tracks={profileLikes}
                                onPlay={playTrack}
                                onLike={handleLike}
                                onDownload={handleDownload}
                                likedTracks={likedTracks}
                                downloadedTracks={downloadedTracks}
                                currentTrackId={currentTrack?.id}
                                isPlaying={isPlaying}
                            />
                        )}
                        {activeTab === 'downloads' && (
                            <ProfileMusicList
                                tracks={profileDownloads}
                                onPlay={playTrack}
                                onLike={handleLike}
                                onDownload={handleDownload}
                                likedTracks={likedTracks}
                                downloadedTracks={downloadedTracks}
                                currentTrackId={currentTrack?.id}
                                isPlaying={isPlaying}
                            />
                        )}
                    </div>
                </div>
            </main>

            <SiteFooter />

            <FooterPlayer
                track={currentTrack}
                onNext={nextTrack}
                onPrevious={previousTrack}
                onLike={handleLike}
                onDownload={handleDownload}
                isPlaying={isPlaying}
                onPlayPause={setIsPlaying}
            />
        </div>
    );
}
