"use client";

import React, { useState, useMemo, useEffect, useCallback, memo, useRef } from 'react';
import { useUser, UserButton, SignedIn, SignedOut, SignInButton, SignUpButton, ClerkLoaded, ClerkLoading } from '@clerk/nextjs';
import Head from 'next/head';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Play, Download, ThumbsUp, X, Info, Pause, SkipBack, SkipForward, Music, Search, Loader2, Instagram, Twitter, Facebook } from 'lucide-react';

// --- Tipos e Dados (Mock Data) ---
type Track = {
  id: number;
  songName: string;
  artist: string;
  style: string;
  version: 'Original' | 'Remix' | 'Dirty' | 'Clean' | 'Instrumental' | 'Acapella' | 'Intro';
  imageUrl: string;
  previewUrl: string;
  downloadUrl: string;
  releaseDate: string; // Formato YYYY-MM-DD
};

const todayDate = new Date().toISOString().split('T')[0];
const rebekaImage = 'https://i.ibb.co/5qVv4TK/20250603-1839-Capa-Sertanejo-Rom-ntico-simple-compose-01jwvvpxkaet6b797dee9nr3py.png';

const newTracks: Track[] = [
    { id: 13, songName: 'VERSACE ON THE FLOOR (Bruno Mars vs. David Guetta)', artist: 'BRUNO MARS', style: 'Eletronica', version: 'Remix', imageUrl: 'https://placehold.co/64x64/A52A2A/ffffff?text=BM', previewUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', downloadUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', releaseDate: todayDate },
    { id: 7, songName: 'Coração em Silêncio', artist: 'Rebeka Sanches', style: 'Sertanejo', version: 'Original', imageUrl: rebekaImage, previewUrl: 'https://files.catbox.moe/59s0sn.mp3', downloadUrl: 'https://files.catbox.moe/59s0sn.mp3', releaseDate: todayDate },
    { id: 8, songName: 'Coração que Não Esquece', artist: 'Rebeka Sanches', style: 'Sertanejo', version: 'Original', imageUrl: rebekaImage, previewUrl: 'https://files.catbox.moe/bmm8uo.mp3', downloadUrl: 'https://files.catbox.moe/bmm8uo.mp3', releaseDate: todayDate },
    { id: 9, songName: 'Foi Deus Quem Fez', artist: 'Rebeka Sanches', style: 'Sertanejo', version: 'Original', imageUrl: rebekaImage, previewUrl: 'https://files.catbox.moe/nojq78.mp3', downloadUrl: 'https://files.catbox.moe/nojq78.mp3', releaseDate: todayDate },
];

const oldTracks: Track[] = [
  { id: 1, songName: 'TÚ ME DAS TUM TUM', artist: 'Dj Jéssika Luana', style: 'House', version: 'Remix', imageUrl: 'https://i.ibb.co/Y7K8ksd2/1b96dfec-11da-4705-8b51-6a55ea03dd62.png', previewUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3', downloadUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3', releaseDate: '2025-07-16' },
  { id: 2, songName: 'Out Of Sight Of You', artist: 'Interview', style: 'Pop', version: 'Original', imageUrl: 'https://i.ibb.co/L6vjWd3/img-1.jpg', previewUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3', downloadUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3', releaseDate: '2025-07-16' },
  { id: 3, songName: 'Jigga Boo', artist: 'Tyrell The God', style: 'Trap Hip Hop', version: 'Dirty', imageUrl: 'https://i.ibb.co/hH4vjJg/img-2.jpg', previewUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3', downloadUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3', releaseDate: '2025-07-15' },
];

const mockTracks: Track[] = [...newTracks, ...oldTracks];

// --- Componentes ---

const Header = memo(function Header({ onSearchChange }: { onSearchChange: (query: string) => void }) {
    const pathname = usePathname();
  
    const navLinks = [
      { href: '/new', label: 'New' },
      { href: '/featured', label: 'Featured' },
      { href: '/trending', label: 'Trending' },
      { href: '/charts', label: 'Charts' },
    ];
  
    return (
      <header className="w-full bg-white/80 backdrop-blur-sm p-4 flex justify-between items-center border-b border-gray-200 sticky top-0 z-30">
        <div className="flex items-center gap-4">
          <Link href="/new" className="flex items-center gap-4">
            <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center">
              <Music size={16} className="text-white" />
            </div>
            <h1 className="text-xl font-bold text-gray-900 hidden sm:block">
              DJ Pool
            </h1>
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
            {navLinks.map((link) => (
                <Link
                key={link.href}
                href={link.href}
                className={`font-semibold transition-colors pb-2 ${
                    pathname === link.href
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-600 hover:text-blue-600'
                }`}
                >
                {link.label}
                </Link>
            ))}
            </nav>

            <div className="flex items-center gap-4">
                <ClerkLoading>
                    <div className="h-8 w-28 bg-gray-200 rounded-md animate-pulse"></div>
                </ClerkLoading>
                <ClerkLoaded>
                    <SignedIn>
                        <Link href="/profile" className={`font-semibold transition-colors pb-2 hidden md:block ${
                            pathname === '/profile'
                            ? 'text-blue-600 border-b-2 border-blue-600'
                            : 'text-gray-600 hover:text-blue-600'
                        }`}>
                            Meu Perfil
                        </Link>
                        <UserButton afterSignOutUrl="/new"/>
                    </SignedIn>
                    <SignedOut>
                        <SignInButton mode="modal">
                        <button className="font-semibold px-3 py-2 rounded-md transition-colors text-gray-600 hover:text-blue-600">
                            Entrar
                        </button>
                        </SignInButton>
                        <SignUpButton mode="modal">
                        <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors text-sm font-medium">
                            Cadastrar
                        </button>
                        </SignUpButton>
                    </SignedOut>
                </ClerkLoaded>
            </div>
        </div>
      </header>
    );
});

const Alert = memo(function Alert({ message, onClose }: { message: string, onClose: () => void }) {
  if (!message) return null;
  return (
    <div className="fixed top-24 right-6 bg-blue-600 text-white p-4 rounded-lg shadow-lg flex items-center gap-4 z-50 animate-fade-in-down">
      <Info size={24} />
      <span>{message}</span>
      <button onClick={onClose} className="p-1 rounded-full hover:bg-white/20">
        <X size={18} />
      </button>
    </div>
  );
});

const SidebarFilters = memo(function SidebarFilters({ tracks, onFilterChange }: { tracks: Track[], onFilterChange: (filters: any) => void }) {
    const availableGenres = useMemo(() => [...new Set(tracks.map(t => t.style))], [tracks]);
    const availableVersions = useMemo(() => [...new Set(tracks.map(t => t.version))], [tracks]);
  
    const handleFilterChange = (type: 'genres' | 'versions', value: string) => {
      onFilterChange((prevFilters: any) => {
          const currentFilter = prevFilters[type];
          const newFilter = currentFilter.includes(value)
              ? currentFilter.filter((item: string) => item !== value)
              : [...currentFilter, value];
          return { ...prevFilters, [type]: newFilter };
      });
    };
    
    return (
      <aside className="w-64 flex-shrink-0 border-r border-gray-200 p-6 hidden lg:block">
        <h2 className="text-xl font-bold text-gray-800 mb-6">Filtros</h2>
        <div className="space-y-8">
          <div>
            <h3 className="font-semibold text-gray-800 mb-3">Gênero</h3>
            <div className="space-y-2">
              {availableGenres.map(genre => (
                <label key={genre} className="flex items-center space-x-3 text-gray-600 cursor-pointer">
                  <input type="checkbox" onChange={() => handleFilterChange('genres', genre)} className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                  <span>{genre}</span>
                </label>
              ))}
            </div>
          </div>
          <div>
            <h3 className="font-semibold text-gray-800 mb-3">Versão</h3>
            <div className="space-y-2">
              {availableVersions.map(version => (
                <label key={version} className="flex items-center space-x-3 text-gray-600 cursor-pointer">
                  <input type="checkbox" onChange={() => handleFilterChange('versions', version)} className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                  <span>{version}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </aside>
    );
});

const MusicTable = memo(function MusicTable({ tracks, onPlay, onLike, onDownload, likedTracks, downloadedTracks, currentTrackId }: { tracks: Track[], onPlay: (track: Track) => void, onLike: (trackId: number) => void, onDownload: (track: Track) => void, likedTracks: number[], downloadedTracks: number[], currentTrackId: number | null }) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-sm table-fixed">
        <colgroup>
          <col style={{ width: '10%' }} />
          <col style={{ width: '35%' }} />
          <col style={{ width: '20%' }} />
          <col style={{ width: '15%' }} />
          <col style={{ width: '20%' }} />
        </colgroup>
        <tbody>
          {tracks.map((track) => {
            const isLiked = likedTracks.includes(track.id);
            const isDownloaded = downloadedTracks.includes(track.id);
            const isPlaying = track.id === currentTrackId;

            return (
              <tr key={track.id} className="border-b border-gray-200 group">
                <td className="p-3">
                  <div className={`relative w-14 h-14 rounded-lg overflow-hidden cursor-pointer shadow-lg ${isPlaying ? 'ring-2 ring-blue-500' : ''}`} onClick={() => onPlay(track)}>
                    <img src={track.imageUrl} alt={track.songName} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      {isPlaying ? <span className="text-white text-xs font-bold">TOCANDO</span> : <Play size={24} className="text-white" />}
                    </div>
                  </div>
                </td>
                <td className="p-3 truncate">
                  <div className="font-bold text-gray-800 truncate">{track.songName}</div>
                </td>
                <td className="p-3 truncate text-gray-500">{track.artist}</td>
                <td className="p-3">
                  <span className="bg-gray-200 text-gray-700 text-xs font-semibold px-2.5 py-1 rounded-full">{track.version}</span>
                </td>
                <td className="p-3">
                  <div className="flex justify-end items-center gap-3">
                    <button onClick={() => onLike(track.id)} className="p-2 rounded-full hover:bg-blue-500/10" title="Like">
                      <ThumbsUp size={18} className={`transition-colors ${isLiked ? 'text-blue-500 fill-current' : 'text-gray-500'}`} />
                    </button>
                    <button onClick={() => onDownload(track)} className="p-2 rounded-full hover:bg-green-500/10" title="Download">
                      <Download size={18} className={isDownloaded ? 'text-green-500' : 'text-blue-600'} />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
});

const FooterPlayer = memo(function FooterPlayer({ track, onNext, onPrevious, onLike, onDownload }: { track: Track | null, onNext: () => void, onPrevious: () => void, onLike: (trackId: number) => void, onDownload: (track: Track) => void }) {
    const waveformRef = useRef<HTMLDivElement>(null);
    const wavesurfer = useRef<any>(null);
    const [isPlaying, setIsPlaying] = useState(false);

    useEffect(() => {
        const createWaveSurfer = async () => {
            if (waveformRef.current) {
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
                    responsive: true,
                    hideScrollbar: true,
                });

                if (track) {
                    wavesurfer.current.load(track.previewUrl);
                    wavesurfer.current.on('ready', () => wavesurfer.current.play());
                    wavesurfer.current.on('play', () => setIsPlaying(true));
                    wavesurfer.current.on('pause', () => setIsPlaying(false));
                    wavesurfer.current.on('finish', onNext);
                }
            }
        };

        if (track) createWaveSurfer();
        return () => wavesurfer.current?.destroy();
    }, [track, onNext]);

    if (!track) return null;
    
    const handlePlayPause = () => wavesurfer.current?.playPause();

    return (
        <footer className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-20 shadow-[0_-4px_15px_rgba(0,0,0,0.08)]">
            <div className="container mx-auto px-6 py-3 flex items-center gap-4">
                <img src={track.imageUrl} alt={track.songName} className="w-14 h-14 rounded-lg shadow-sm flex-shrink-0" />
                <div className="flex items-center gap-4 flex-shrink-0">
                    <button onClick={onPrevious} className="p-2 rounded-full bg-gray-100 hover:bg-gray-200"><SkipBack size={20} className="text-gray-700" /></button>
                    <button onClick={handlePlayPause} className="w-12 h-12 flex items-center justify-center rounded-full bg-blue-600 text-white hover:bg-blue-700 transition-colors">
                        {isPlaying ? <Pause size={24} /> : <Play size={24} />}
                    </button>
                    <button onClick={onNext} className="p-2 rounded-full bg-gray-100 hover:bg-gray-200"><SkipForward size={20} className="text-gray-700" /></button>
                </div>
                <div className="flex-grow flex flex-col justify-center gap-1 w-full min-w-0">
                    <div className="truncate">
                        <p className="font-bold text-gray-900 truncate">{track.songName}</p>
                        <p className="text-sm text-gray-500 truncate">{track.artist}</p>
                    </div>
                    <div ref={waveformRef} className="w-full h-[40px]"></div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button onClick={() => onLike(track.id)} className="p-3 rounded-full hover:bg-blue-500/10" title="Like">
                    <ThumbsUp size={20} className="text-blue-500" />
                  </button>
                  <button onClick={() => onDownload(track)} className="p-3 rounded-full hover:bg-green-500/10" title="Download">
                    <Download size={20} className="text-green-500" />
                  </button>
                </div>
            </div>
        </footer>
    );
});

const SiteFooter = memo(function SiteFooter() {
    return (
        <footer className="bg-white border-t border-gray-200 mt-auto">
            <div className="max-w-screen-xl mx-auto py-8 px-6 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
                <div className="text-center md:text-left">
                    <p className="text-sm text-gray-500">&copy; {new Date().getFullYear()} DJ Pool. Todos os direitos reservados.</p>
                </div>

                <div className="flex items-center gap-2">
                    <span className="relative flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                    </span>
                    <p className="text-sm text-green-600 font-semibold">Todos os serviços online</p>
                </div>

                <div className="flex space-x-6">
                    <a href="#" className="text-gray-400 hover:text-gray-500">
                        <Instagram size={24} />
                    </a>
                    <a href="#" className="text-gray-400 hover:text-gray-500">
                        <Twitter size={24} />
                    </a>
                    <a href="#" className="text-gray-400 hover:text-gray-500">
                        <Facebook size={24} />
                    </a>
                </div>
            </div>
        </footer>
    );
});


// --- Página Principal ---

export default function NewPage() {
  const { user, isLoaded } = useUser();
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [alertMessage, setAlertMessage] = useState('');
  const [filters, setFilters] = useState({ genres: [], versions: [] });
  const [searchTerm, setSearchTerm] = useState('');
  
  const [likedTracks, setLikedTracks] = useState<number[]>([]);
  const [downloadedTracks, setDownloadedTracks] = useState<number[]>([]);
  const [downloadCount, setDownloadCount] = useState(0);

  const [isUserDataLoaded, setIsUserDataLoaded] = useState(false);

  useEffect(() => {
    if (isLoaded && user) {
      const fetchUserData = async () => {
        try {
          const response = await fetch('/api/user-data');
          if (!response.ok) {
            const errorText = await response.text();
            console.error(`API Error: Status ${response.status}`, errorText);
            throw new Error(`Falha ao buscar dados do usuário. Status: ${response.status}`);
          }
          const data = await response.json();
          setLikedTracks(data.likedTrackIds || []);
          setDownloadedTracks(data.downloadedTrackIds || []);
          setDownloadCount(data.downloadCount || 0);
        } catch (error) {
          console.error("Erro ao buscar dados do usuário:", error);
          handleAuthAction("Não foi possível carregar seus dados. Tente recarregar a página.");
        } finally {
          setIsUserDataLoaded(true);
        }
      };
      fetchUserData();
    } else if (isLoaded && !user) {
      setLikedTracks([]);
      setDownloadedTracks([]);
      setDownloadCount(0);
      setIsUserDataLoaded(true);
    }
  }, [user, isLoaded]);

  const handleAuthAction = useCallback((message: string) => {
    setAlertMessage(message);
    setTimeout(() => setAlertMessage(''), 4000);
  }, []);

  const handleLike = useCallback((trackId: number) => {
    if (!user) {
        handleAuthAction("Faça login para curtir músicas.");
        return;
    }
    const newLikedTracks = likedTracks.includes(trackId)
        ? likedTracks.filter(id => id !== trackId)
        : [...likedTracks, trackId];
    setLikedTracks(newLikedTracks);
    
    fetch('/api/likes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trackId }),
    }).catch(error => {
        console.error("Falha ao salvar like:", error);
        setLikedTracks(likedTracks); // Reverte em caso de erro
    });
  }, [user, likedTracks, handleAuthAction]);

  const handleDownload = useCallback((track: Track) => {
    if (!user) {
      handleAuthAction("Faça login para baixar músicas.");
      return;
    }
    
    const hasActivePlan = false; 
    const DOWNLOAD_LIMIT = 5;

    if (hasActivePlan || downloadedTracks.includes(track.id)) {
      window.open(track.downloadUrl, '_blank');
    } else {
      if (downloadCount < DOWNLOAD_LIMIT) {
        const newCount = downloadCount + 1;
        const newDownloadedTracks = [...downloadedTracks, track.id];
        
        setDownloadCount(newCount);
        setDownloadedTracks(newDownloadedTracks);
        
        fetch('/api/downloads', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ trackId: track.id }),
        }).catch(error => {
            console.error("Falha ao registrar download:", error);
            setDownloadCount(downloadCount);
            setDownloadedTracks(downloadedTracks);
        });

        window.open(track.downloadUrl, '_blank');
        handleAuthAction(`Download realizado! Você tem ${DOWNLOAD_LIMIT - newCount} downloads restantes.`);
      } else {
        handleAuthAction(`Você atingiu seu limite de ${DOWNLOAD_LIMIT} downloads gratuitos. Assine um plano para continuar.`);
      }
    }
  }, [user, downloadCount, downloadedTracks, handleAuthAction]);

  const filteredTracks = useMemo(() => {
    return mockTracks.filter(track => {
      const genreMatch = filters.genres.length === 0 || filters.genres.includes(track.style);
      const versionMatch = filters.versions.length === 0 || filters.versions.includes(track.version);
      const searchMatch = searchTerm === '' || 
                          track.songName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          track.artist.toLowerCase().includes(searchTerm.toLowerCase());
      return genreMatch && versionMatch && searchMatch;
    });
  }, [filters, searchTerm]);

  const handleNextTrack = useCallback(() => {
    if (!currentTrack) return;
    const currentIndex = filteredTracks.findIndex(t => t.id === currentTrack.id);
    if (currentIndex !== -1) {
      const nextIndex = (currentIndex + 1) % filteredTracks.length;
      if (filteredTracks[nextIndex]) setCurrentTrack(filteredTracks[nextIndex]);
    }
  }, [currentTrack, filteredTracks]);

  const handlePreviousTrack = useCallback(() => {
    if (!currentTrack) return;
    const currentIndex = filteredTracks.findIndex(t => t.id === currentTrack.id);
    if (currentIndex !== -1) {
      const prevIndex = (currentIndex - 1 + filteredTracks.length) % filteredTracks.length;
      if (filteredTracks[prevIndex]) setCurrentTrack(filteredTracks[prevIndex]);
    }
  }, [currentTrack, filteredTracks]);

  const groupedTracks = useMemo(() => {
    const groups: { [key: string]: Track[] } = {};
    filteredTracks.forEach(track => {
      const date = track.releaseDate;
      if (!groups[date]) groups[date] = [];
      groups[date].push(track);
    });
    return Object.entries(groups).sort((a, b) => new Date(b[0]).getTime() - new Date(a[0]).getTime());
  }, [filteredTracks]);

  const formatDateHeader = (dateString: string) => {
    const today = new Date(new Date().toLocaleString("en-US", {timeZone: "America/Sao_Paulo"}));
    const trackDate = new Date(new Date(dateString).toLocaleString("en-US", {timeZone: "America/Sao_Paulo"}));
    
    today.setHours(0,0,0,0);
    trackDate.setHours(0,0,0,0);

    const dateOptions: Intl.DateTimeFormatOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const formattedDate = new Intl.DateTimeFormat('pt-BR', dateOptions).format(new Date(dateString + 'T00:00:00'));

    return { isToday: today.getTime() === trackDate.getTime(), date: formattedDate };
  };
  
  return (
    <>
      <Head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800&display=swap" rel="stylesheet" />
      </Head>
      <div className="bg-gray-50 text-gray-800 font-nunito min-h-screen flex flex-col">
        <Header onSearchChange={setSearchTerm} />
        <Alert message={alertMessage} onClose={() => setAlertMessage('')} />

        <div className="flex max-w-screen-2xl mx-auto w-full flex-grow">
          <SidebarFilters tracks={mockTracks} onFilterChange={setFilters} />
          <main className="flex-grow p-8 pb-40">
            <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight mb-6">New Music</h2>
            
            {!isUserDataLoaded ? (
              <div className="p-16 text-center text-gray-500">
                <p>Carregando músicas...</p>
              </div>
            ) : groupedTracks.length > 0 ? (
              groupedTracks.map(([date, tracks]) => {
                const { isToday, date: formattedDate } = formatDateHeader(date);
                return (
                  <div key={date} className="mb-8">
                    <div className="flex items-baseline gap-3 mb-3">
                      {isToday ? (
                        <>
                          <strong className="font-bold text-lg text-gray-900">Hoje</strong>
                          <span className="text-red-500 font-semibold">{formattedDate}</span>
                        </>
                      ) : (
                        <span className="font-semibold text-lg text-gray-700">{formattedDate}</span>
                      )}
                    </div>
                    <hr className="border-gray-200 mb-4" />
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                      <MusicTable tracks={tracks} onPlay={setCurrentTrack} onLike={handleLike} onDownload={handleDownload} likedTracks={likedTracks} downloadedTracks={downloadedTracks} currentTrackId={currentTrack?.id || null} />
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="p-16 text-center text-gray-500">
                <p className="font-semibold">Nenhuma música encontrada.</p>
                <p className="text-sm">Tente ajustar seus filtros ou a pesquisa.</p>
              </div>
            )}
          </main>
        </div>

        <SiteFooter />
        <FooterPlayer 
            track={currentTrack} 
            onNext={handleNextTrack}
            onPrevious={handlePreviousTrack}
            onLike={handleLike}
            onDownload={handleDownload}
        />
      </div>
    </>
  );
}
