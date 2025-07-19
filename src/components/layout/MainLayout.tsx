"use client";

import React, { useState, useMemo, useEffect, useCallback, memo, useRef } from 'react';
import { useUser, UserButton, SignedIn, SignedOut, SignInButton, SignUpButton, ClerkLoaded, ClerkLoading } from '@clerk/nextjs';
import Head from 'next/head';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Play, Download, ThumbsUp, X, Info, Pause, SkipBack, SkipForward, Music, Search, Loader2, Instagram, Twitter, Facebook } from 'lucide-react';

// --- Componentes Internos do Layout (Header, Player, Footer) ---

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
            <h1 className="text-xl font-bold text-gray-900 hidden sm:block">DJ Pool</h1>
          </Link>
        </div>
        <div className="relative w-full max-w-md mx-4 hidden lg:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input type="text" placeholder="Pesquisar por música ou artista..." onChange={(e) => onSearchChange(e.target.value)} className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"/>
        </div>
        <div className="flex items-center gap-8">
            <nav className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
                <Link key={link.href} href={link.href} className={`font-semibold transition-colors pb-2 ${pathname === link.href ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600 hover:text-blue-600'}`}>
                {link.label}
                </Link>
            ))}
            </nav>
            <div className="flex items-center gap-4">
                <ClerkLoading><div className="h-8 w-28 bg-gray-200 rounded-md animate-pulse"></div></ClerkLoading>
                <ClerkLoaded>
                    <SignedIn>
                        <Link href="/profile" className={`font-semibold transition-colors pb-2 hidden md:block ${pathname === '/profile' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600 hover:text-blue-600'}`}>Meu Perfil</Link>
                        <UserButton afterSignOutUrl="/new"/>
                    </SignedIn>
                    <SignedOut>
                        <SignInButton mode="modal"><button className="font-semibold px-3 py-2 rounded-md transition-colors text-gray-600 hover:text-blue-600">Entrar</button></SignInButton>
                        <SignUpButton mode="modal"><button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors text-sm font-medium">Cadastrar</button></SignUpButton>
                    </SignedOut>
                </ClerkLoaded>
            </div>
        </div>
      </header>
    );
});

const FooterPlayer = memo(function FooterPlayer({ track, onNext, onPrevious, onLike, onDownload }: { track: any | null, onNext: () => void, onPrevious: () => void, onLike: (trackId: number) => void, onDownload: (track: any) => void }) {
    const waveformRef = useRef<HTMLDivElement>(null);
    const wavesurfer = useRef<any>(null);
    const [isPlaying, setIsPlaying] = useState(false);

    useEffect(() => {
        const createWaveSurfer = async () => {
            if (waveformRef.current) {
                const WaveSurfer = (await import('wavesurfer.js')).default;
                if (wavesurfer.current) wavesurfer.current.destroy();
                wavesurfer.current = WaveSurfer.create({ container: waveformRef.current, waveColor: '#E2E8F0', progressColor: '#007BFF', cursorWidth: 1, barWidth: 2, barGap: 2, barRadius: 2, height: 40, responsive: true, hideScrollbar: true });
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
                    <button onClick={handlePlayPause} className="w-12 h-12 flex items-center justify-center rounded-full bg-blue-600 text-white hover:bg-blue-700 transition-colors">{isPlaying ? <Pause size={24} /> : <Play size={24} />}</button>
                    <button onClick={onNext} className="p-2 rounded-full bg-gray-100 hover:bg-gray-200"><SkipForward size={20} className="text-gray-700" /></button>
                </div>
                <div className="flex-grow flex flex-col justify-center gap-1 w-full min-w-0">
                    <div className="truncate"><p className="font-bold text-gray-900 truncate">{track.songName}</p><p className="text-sm text-gray-500 truncate">{track.artist}</p></div>
                    <div ref={waveformRef} className="w-full h-[40px]"></div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button onClick={() => onLike(track.id)} className="p-3 rounded-full hover:bg-blue-500/10" title="Like"><ThumbsUp size={20} className="text-blue-500" /></button>
                  <button onClick={() => onDownload(track)} className="p-3 rounded-full hover:bg-green-500/10" title="Download"><Download size={20} className="text-green-500" /></button>
                </div>
            </div>
        </footer>
    );
});

const SiteFooter = memo(function SiteFooter() {
    return (
        <footer className="bg-white border-t border-gray-200">
            <div className="max-w-screen-2xl mx-auto py-8 px-8 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
                <div className="text-center md:text-left"><p className="text-sm text-gray-500">&copy; {new Date().getFullYear()} DJ Pool. Todos os direitos reservados.</p></div>
                <div className="flex items-center gap-2">
                    <span className="relative flex h-3 w-3"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span><span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span></span>
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


// --- O Layout Principal ---
export default function MainLayout({ children }: { children: (props: any) => React.ReactNode }) {
  const { user, isLoaded } = useUser();
  const [currentTrack, setCurrentTrack] = useState<any | null>(null);
  const [alertMessage, setAlertMessage] = useState('');
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
          if (!response.ok) throw new Error('Falha ao buscar dados do usuário');
          const data = await response.json();
          setLikedTracks(data.likedTrackIds || []);
          setDownloadedTracks(data.downloadedTrackIds || []);
          setDownloadCount(data.downloadCount || 0);
        } catch (error) { console.error("Erro:", error); } 
        finally { setIsUserDataLoaded(true); }
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
    if (!user) { handleAuthAction("Faça login para curtir músicas."); return; }
    const newLikedTracks = likedTracks.includes(trackId) ? likedTracks.filter(id => id !== trackId) : [...likedTracks, trackId];
    setLikedTracks(newLikedTracks);
    fetch('/api/likes', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ trackId }) })
      .catch(error => { console.error("Falha ao salvar like:", error); setLikedTracks(likedTracks); });
  }, [user, likedTracks, handleAuthAction]);

  const handleDownload = useCallback((track: any) => {
    if (!user) { handleAuthAction("Faça login para baixar músicas."); return; }
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
        fetch('/api/downloads', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ trackId: track.id }) })
          .catch(error => { console.error("Falha:", error); setDownloadCount(downloadCount); setDownloadedTracks(downloadedTracks); });
        window.open(track.downloadUrl, '_blank');
        handleAuthAction(`Download realizado! Você tem ${DOWNLOAD_LIMIT - newCount} downloads restantes.`);
      } else {
        handleAuthAction(`Você atingiu seu limite de ${DOWNLOAD_LIMIT} downloads gratuitos.`);
      }
    }
  }, [user, downloadCount, downloadedTracks, handleAuthAction]);

  const sharedProps = {
    isUserDataLoaded,
    likedTracks,
    downloadedTracks,
    currentTrackId: currentTrack?.id || null,
    onPlay: setCurrentTrack,
    onLike: handleLike,
    onDownload: handleDownload,
    searchTerm,
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
        <div className="flex-grow">
            {children(sharedProps)}
        </div>
        <SiteFooter />
        <FooterPlayer 
            track={currentTrack} 
            onNext={() => {}} // A lógica de next/prev precisa ser passada pela página específica
            onPrevious={() => {}}
            onLike={handleLike}
            onDownload={handleDownload}
        />
      </div>
    </>
  );
}
