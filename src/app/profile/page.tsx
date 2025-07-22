"use client";

import { AlertCircle, Camera, Download, Facebook, Instagram, Loader2, Music, Pause, Play, Search, SkipBack, SkipForward, ThumbsUp, Twitter } from 'lucide-react';
import { useSession } from 'next-auth/react';
import Head from 'next/head';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { memo, useEffect, useRef, useState } from 'react';

type Track = {
  id: number;
  songName: string;
  artist: string;
  imageUrl: string;
  downloadUrl: string;
  actionDate?: string;
  previewUrl: string;
  style: string;
  version: string;
  releaseDate: string;
};

// --- COMPONENTES ---

const Header = memo(function Header({ onSearchChange }: { onSearchChange: (query: string) => void }) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const user = session?.user;
  const navLinks = [
    { href: '/new', label: 'New' }, { href: '/featured', label: 'Featured' },
    { href: '/trending', label: 'Trending' }, { href: '/charts', label: 'Charts' },
  ];

  return (
    <header className="w-full bg-white/80 backdrop-blur-sm p-4 flex justify-between items-center border-b border-gray-200 sticky top-0 z-30">
      <div className="flex items-center gap-4">
        <Link href="/new" className="flex items-center gap-4">
          <div className="w-8 h-8 bg-[#202124] rounded-full flex items-center justify-center">
            <Music size={16} className="text-white" />
          </div>
          <h1 className="text-xl font-bold text-gray-900 hidden sm:block">DJ Pool</h1>
        </Link>
      </div>
      <div className="relative w-full max-w-md mx-4 hidden lg:block">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
        <input type="text" placeholder="Pesquisar por música ou artista..." onChange={(e) => onSearchChange(e.target.value)} className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors" />
      </div>
      <div className="flex items-center gap-8">
        <nav className="hidden md:flex items-center space-x-8">
          {navLinks.map((link) => (<Link key={link.href} href={link.href} className={`font-semibold transition-colors pb-2 ${pathname === link.href ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600 hover:text-blue-600'}`}>{link.label}</Link>))}
          {user && (
            <Link href="/profile" className={`font-semibold transition-colors pb-2 ${pathname === '/profile' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600 hover:text-blue-600'}`}>
              Meu Perfil
            </Link>
          )}
        </nav>
        <div className="flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-2">
              <span className="font-semibold text-gray-700">{user.name || user.email}</span>
              <button onClick={() => { }} className="text-sm text-gray-600 hover:text-gray-800">Sair</button>
            </div>
          ) : (
            <>
              <Link href="/auth/sign-in"><button className="font-semibold px-3 py-2 rounded-md transition-colors text-gray-600 hover:text-blue-600">Entrar</button></Link>
              <Link href="/auth/sign-up"><button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors text-sm font-medium">Cadastrar</button></Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
});

const SiteFooter = memo(function SiteFooter() {
  return (
    <footer className="bg-white border-t border-gray-200 mt-auto">
      <div className="max-w-screen-xl mx-auto py-8 px-6 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
        <div className="text-center md:text-left"><p className="text-sm text-gray-500">&copy; {new Date().getFullYear()} DJ Pool. Todos os direitos reservados.</p></div>
        <div className="flex items-center gap-2"><span className="relative flex h-3 w-3"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span><span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span></span><p className="text-sm text-green-600 font-semibold">Todos os serviços online</p></div>
        <div className="flex space-x-6">
          <a href="#" className="text-gray-400 hover:text-gray-500"><Instagram size={24} /></a>
          <a href="#" className="text-gray-400 hover:text-gray-500"><Twitter size={24} /></a>
          <a href="#" className="text-gray-400 hover:text-gray-500"><Facebook size={24} /></a>
        </div>
      </div>
    </footer>
  );
});

const FooterPlayer = memo(function FooterPlayer({ track, onNext, onPrevious, onLike, onDownload, isPlaying, onPlayPause }: { track: Track | null, onNext: () => void, onPrevious: () => void, onLike: (trackId: number) => void, onDownload: (track: Track) => void, isPlaying: boolean, onPlayPause: (state: boolean) => void }) {
  const waveformRef = useRef<HTMLDivElement>(null);
  const wavesurfer = useRef<any>(null);

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
          hideScrollbar: true
        });
        if (track) {
          wavesurfer.current.load(track.previewUrl);
          wavesurfer.current.on('ready', () => wavesurfer.current.play());
          wavesurfer.current.on('play', () => onPlayPause(true));
          wavesurfer.current.on('pause', () => onPlayPause(false));
          wavesurfer.current.on('finish', onNext);
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

function ProfileMusicList({ tracks, onPlay, onLike, onDownload, likedTracks, downloadedTracks, currentTrackId, isPlaying }: any) {
  if (tracks.length === 0) {
    return <p className="text-gray-500 mt-8 text-center">Nenhuma música encontrada nesta lista.</p>;
  }

  return (
    <div className="space-y-2 mt-6">
      {tracks.map((track: Track) => {
        const isLiked = likedTracks.includes(track.id);
        const isDownloaded = downloadedTracks.includes(track.id);
        const isCurrentlyPlaying = track.id === currentTrackId;

        return (
          <div key={track.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-100 group transition-colors">
            <div className="flex items-center gap-4">
              <div className={`relative w-12 h-12 rounded-md overflow-hidden cursor-pointer shadow-sm ${isCurrentlyPlaying ? 'ring-2 ring-blue-500' : ''}`} onClick={() => onPlay(track, tracks)}>
                <img src={track.imageUrl} alt={track.songName} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-[#202124]/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  {isCurrentlyPlaying && isPlaying ? <Pause size={20} className="text-white" /> : <Play size={20} className="text-white" />}
                </div>
              </div>
              <div>
                <p className="font-semibold text-gray-800">{track.songName}</p>
                <p className="text-sm text-gray-500">{track.artist}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button onClick={() => onLike(track.id)} className="p-2 rounded-full hover:bg-blue-100" title="Like">
                <ThumbsUp size={18} className={`transition-colors ${isLiked ? 'text-blue-500 fill-current' : 'text-gray-500'}`} />
              </button>
              <button onClick={() => onDownload(track)} className="p-2 rounded-full hover:bg-green-100" title="Download">
                <Download size={18} className={isDownloaded ? 'text-green-500' : 'text-blue-600'} />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

import { useAppContext } from '@/context/AppContext';

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const user = session?.user;
  const isLoaded = status !== 'loading';

  const {
    playTrack,
    nextTrack,
    previousTrack,
    currentTrack,
    likedTracks: likedTrackIds,
    downloadedTracks: downloadedTrackIds,
    handleLike,
    handleDownload,
    isPlaying,
    setIsPlaying
  } = useAppContext();

  const [activeTab, setActiveTab] = useState<'likes' | 'downloads'>('likes');
  const [profileLikes, setProfileLikes] = useState<Track[]>([]);
  const [profileDownloads, setProfileDownloads] = useState<Track[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isLoaded && user) {
      const fetchUserData = async () => {
        setIsLoading(true);
        try {
          const res = await fetch('/api/user-data');
          if (!res.ok) {
            throw new Error('Falha ao buscar dados do usuário');
          }
          const data = await res.json();
          setProfileLikes(data.likes || []);
          setProfileDownloads(data.downloads || []);
        } catch (error) {
          console.error("Erro no perfil:", error);
        } finally {
          setIsLoading(false);
        }
      };
      fetchUserData();
    } else if (isLoaded && !user) {
      setIsLoading(false);
    }
  }, [user, isLoaded]);

  const handlePlayFromProfile = (track: Track, trackList: Track[]) => {
    playTrack(track, trackList);
  };

  const showProfileNotice = isLoaded && user && !user.name;

  return (
    <>
      <Head>
        <title>Meu Perfil - DJ Pool</title>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,100..900;1,100..900&display=swap" rel="stylesheet" />
      </Head>
      <div className="bg-gray-50 text-gray-800 min-h-screen flex flex-col">
        <Header onSearchChange={() => { }} />
        <main className="flex-grow">
          <div className="h-[350px] bg-gray-200 relative">
            <img src="https://placehold.co/1500x350/cccccc/999999?text=Capa+do+Perfil" alt="Capa do Perfil" className="w-full h-full object-cover" />
            <Link href="/manage-profile" className="absolute top-4 right-4 bg-white/80 p-2 rounded-full shadow-md hover:bg-white transition-colors">
              <Camera size={20} className="text-gray-700" />
            </Link>
          </div>
          <div className="container mx-auto max-w-5xl px-8">
            <div className="flex items-end -mt-20">
              <div className="relative w-40 h-40 bg-white rounded-full border-4 border-white shadow-lg flex-shrink-0 flex items-center justify-center">
                {user?.image ? <img src={user.image} alt="Foto do Perfil" className="w-full h-full rounded-full object-cover" /> : <span className="text-6xl font-bold text-gray-400">{user?.name?.[0] || user?.email?.[0]}</span>}
                <Link href="/manage-profile" className="absolute bottom-2 right-2 bg-gray-200/80 p-2 rounded-full hover:bg-gray-300 transition-colors">
                  <Camera size={16} className="text-gray-700" />
                </Link>
              </div>
              <div className="ml-6 flex-grow">
                <h1 className="text-3xl font-extrabold text-gray-900">{user?.name || user?.email || 'Nome do Usuário'}</h1>
                <p className="text-md text-gray-500">{user?.email}</p>
              </div>
              <Link href="/manage-profile" className="bg-blue-500 text-white px-5 py-2 rounded-lg font-semibold hover:bg-blue-600 transition-colors">
                Editar Perfil
              </Link>
            </div>

            {showProfileNotice && (
              <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 rounded-md my-8" role="alert">
                <div className="flex">
                  <div className="py-1"><AlertCircle className="h-5 w-5 text-yellow-500 mr-3" /></div>
                  <div>
                    <p className="font-bold">Complete seu perfil!</p>
                    <p className="text-sm">Parece que seu nome completo não está definido. Clique em "Editar Perfil" para atualizá-lo.</p>
                  </div>
                </div>
              </div>
            )}

            <div className="mt-8 border-b border-gray-200">
              <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                <button onClick={() => setActiveTab('likes')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'likes' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>
                  Músicas Curtidas
                </button>
                <button onClick={() => setActiveTab('downloads')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'downloads' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>
                  Histórico de Downloads
                </button>
              </nav>
            </div>

            <div className="mt-8">
              {isLoading ? (
                <div className="flex justify-center p-16"><Loader2 className="animate-spin text-blue-500" size={32} /></div>
              ) : (
                <>
                  {activeTab === 'likes' && <ProfileMusicList tracks={profileLikes} onPlay={handlePlayFromProfile} onLike={handleLike} onDownload={handleDownload} likedTracks={likedTrackIds} downloadedTracks={downloadedTrackIds} currentTrackId={currentTrack?.id} isPlaying={isPlaying} />}
                  {activeTab === 'downloads' && <ProfileMusicList tracks={profileDownloads} onPlay={handlePlayFromProfile} onLike={handleLike} onDownload={handleDownload} likedTracks={likedTrackIds} downloadedTracks={downloadedTrackIds} currentTrackId={currentTrack?.id} isPlaying={isPlaying} />}

                  {!isLoading && profileLikes.length === 0 && activeTab === 'likes' && (
                    <div className="text-center text-gray-500 p-16 border-2 border-dashed border-gray-300 rounded-lg">
                      <h3 className="text-xl font-semibold">Nenhuma música curtida ainda!</h3>
                      <p className="mt-2">Suas músicas favoritas aparecerão aqui.</p>
                    </div>
                  )}
                  {!isLoading && profileDownloads.length === 0 && activeTab === 'downloads' && (
                    <div className="text-center text-gray-500 p-16 border-2 border-dashed border-gray-300 rounded-lg">
                      <h3 className="text-xl font-semibold">Nenhum download realizado!</h3>
                      <p className="mt-2">Seu histórico de downloads aparecerá aqui.</p>
                    </div>
                  )}
                </>
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
    </>
  );
}
