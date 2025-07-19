"use client";

import React, { useState, useMemo, useEffect, useCallback, memo, useRef } from 'react';
import { useUser, UserButton, SignedIn, SignedOut, SignInButton, SignUpButton, ClerkLoaded, ClerkLoading } from '@clerk/nextjs';
import Head from 'next/head';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Play, Download, ThumbsUp, X, Info, Pause, SkipBack, SkipForward, Music, Search, Loader2, Instagram, Twitter, Facebook, ChevronDown, Copyright } from 'lucide-react';
import { useAppContext } from '@/context/AppContext';

// --- Tipos ---
type Track = {
  id: number;
  songName: string;
  artist: string;
  style: string;
  version: string;
  imageUrl: string;
  previewUrl: string;
  downloadUrl: string;
  releaseDate: string;
  duration: string;
  fileSize: string;
  hasCopyright?: boolean;
};

// --- Componentes ---

const Header = memo(function Header({ onSearchChange }: { onSearchChange: (query: string) => void }) {
    const pathname = usePathname();
    const navLinks = [
      { href: '/new', label: 'New' }, { href: '/featured', label: 'Featured' },
      { href: '/trending', label: 'Trending' }, { href: '/charts', label: 'Charts' },
    ];
    return (
      <header className="w-full bg-[#121212]/80 backdrop-blur-sm p-4 flex justify-between items-center border-b border-gray-800 sticky top-0 z-30">
        <div className="flex items-center gap-4"><Link href="/new" className="flex items-center gap-4"><div className="w-8 h-8 bg-white rounded-full flex items-center justify-center"><Music size={16} className="text-black" /></div><h1 className="text-xl font-bold text-white hidden sm:block">DJ Pool</h1></Link></div>
        <div className="relative w-full max-w-md mx-4 hidden lg:block"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} /><input type="text" placeholder="Pesquisar por música ou artista..." onChange={(e) => onSearchChange(e.target.value)} className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-700 bg-gray-800 text-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"/></div>
        <div className="flex items-center gap-8">
            <nav className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (<Link key={link.href} href={link.href} className={`font-semibold transition-colors pb-2 ${pathname === link.href ? 'text-white border-b-2 border-white' : 'text-gray-400 hover:text-white'}`}>{link.label}</Link>))}
            </nav>
            <div className="flex items-center gap-4">
                <ClerkLoading><div className="h-8 w-28 bg-gray-700 rounded-md animate-pulse"></div></ClerkLoading>
                <ClerkLoaded>
                    <SignedIn>
                        <Link href="/profile" className={`font-semibold transition-colors pb-2 hidden md:block ${pathname === '/profile' ? 'text-white border-b-2 border-white' : 'text-gray-400 hover:text-white'}`}>Meu Perfil</Link>
                        <UserButton afterSignOutUrl="/new"/>
                    </SignedIn>
                    <SignedOut>
                        <SignInButton mode="modal"><button className="font-semibold px-3 py-2 rounded-md transition-colors text-gray-300 hover:text-white">Entrar</button></SignInButton>
                        <SignUpButton mode="modal"><button className="bg-white text-black px-4 py-2 rounded-full hover:bg-gray-200 transition-colors text-sm font-bold">Cadastrar</button></SignUpButton>
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
    <div className="fixed top-24 right-6 bg-blue-500 text-white p-4 rounded-lg shadow-lg flex items-center gap-4 z-50 animate-fade-in-down">
      <Info size={24} /><span>{message}</span><button onClick={onClose} className="p-1 rounded-full hover:bg-white/20"><X size={18} /></button>
    </div>
  );
});

const SidebarFilters = memo(function SidebarFilters({ tracks, onFilterChange, currentFilters }: { tracks: Track[], onFilterChange: (filters: any) => void, currentFilters: any }) {
    const availableGenres = useMemo(() => [...new Set(tracks.map(t => t.style))], [tracks]);
    const availableVersions = useMemo(() => [...new Set(tracks.map(t => t.version))], [tracks]);
    const availableDates = useMemo(() => {
        const dates = new Set<string>();
        const now = new Date();
        const start = new Date('2025-07-01');
        while (start <= now) {
            dates.add(start.toISOString().slice(0, 7));
            start.setMonth(start.getMonth() + 1);
        }
        return Array.from(dates).sort().reverse();
    }, []);

    const handleFilterChange = (type: 'genres' | 'versions' | 'uploadDate', value: string) => {
      onFilterChange((prevFilters: any) => {
          if (type === 'genres' || type === 'versions') {
            const currentFilter = prevFilters[type];
            const newFilter = currentFilter.includes(value) ? currentFilter.filter((item: string) => item !== value) : [...currentFilter, value];
            return { ...prevFilters, [type]: newFilter };
          }
          return { ...prevFilters, [type]: value };
      });
    };
    
    return (
      <aside className="w-64 flex-shrink-0 bg-[#121212] p-6 hidden lg:block h-full">
        <h2 className="text-xl font-bold text-white mb-6">Filtros</h2>
        <div className="space-y-8">
          <div>
            <h3 className="font-semibold text-white mb-3 flex justify-between items-center">Data <ChevronDown size={16} /></h3>
            <select value={currentFilters.uploadDate} onChange={(e) => handleFilterChange('uploadDate', e.target.value)} className="w-full p-2 rounded-md border border-gray-700 bg-gray-800 text-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors font-mono text-sm">
                <option value="all">Todos os Meses</option>
                {availableDates.map(date => (<option key={date} value={date}>{new Date(date + '-02').toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}</option>))}
            </select>
          </div>
          <div>
            <h3 className="font-semibold text-white mb-3">Gênero</h3>
            <div className="space-y-2 font-mono text-sm">
              {availableGenres.map(genre => (
                <label key={genre} className="flex items-center space-x-3 text-gray-400 cursor-pointer hover:text-white">
                  <input type="checkbox" checked={currentFilters.genres.includes(genre)} onChange={() => handleFilterChange('genres', genre)} className="h-4 w-4 rounded border-gray-600 bg-gray-700 text-blue-500 focus:ring-blue-500 focus:ring-offset-gray-800" />
                  <span>{genre}</span>
                </label>
              ))}
            </div>
          </div>
          <div>
            <h3 className="font-semibold text-white mb-3">Versão</h3>
            <div className="space-y-2 font-mono text-sm">
              {availableVersions.map(version => (
                <label key={version} className="flex items-center space-x-3 text-gray-400 cursor-pointer hover:text-white">
                  <input type="checkbox" checked={currentFilters.versions.includes(version)} onChange={() => handleFilterChange('versions', version)} className="h-4 w-4 rounded border-gray-600 bg-gray-700 text-blue-500 focus:ring-blue-500 focus:ring-offset-gray-800" />
                  <span>{version}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </aside>
    );
});

const MusicTable = memo(function MusicTable({ tracks, onPlay, onLike, onDownload, likedTracks, downloadedTracks, currentTrackId, isPlaying }: { tracks: Track[], onPlay: (track: Track) => void, onLike: (trackId: number) => void, onDownload: (track: Track) => void, likedTracks: number[], downloadedTracks: number[], currentTrackId: number | null, isPlaying: boolean }) {
    return (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm table-fixed">
            <colgroup>
              <col style={{ width: '10%' }} />
              <col style={{ width: '40%' }} />
              <col style={{ width: '15%' }} />
              <col style={{ width: '10%' }} />
              <col style={{ width: '10%' }} />
              <col style={{ width: '15%' }} />
            </colgroup>
            <thead>
              <tr className="border-b border-gray-800 text-left text-xs text-gray-400 uppercase font-mono tracking-wider">
                <th className="p-3"></th>
                <th className="p-3">Faixa</th>
                <th className="p-3">Duração</th>
                <th className="p-3">Tamanho</th>
                <th className="p-3">Gênero</th>
                <th className="p-3"></th>
              </tr>
            </thead>
            <tbody>
              {tracks.map((track) => {
                const isLiked = likedTracks.includes(track.id);
                const isDownloaded = downloadedTracks.includes(track.id);
                const isCurrentlyPlaying = track.id === currentTrackId;

                return (
                  <tr key={track.id} className="border-b border-gray-800 hover:bg-[#2a2b2c] group">
                    <td className="p-3 text-center">
                      <button onClick={() => onPlay(track)} className="w-16 h-16 flex items-center justify-center rounded-lg bg-gray-700/20 group-hover:bg-blue-500 transition-colors relative">
                        <img src={track.imageUrl} alt={track.songName} className="w-full h-full object-cover rounded-lg" />
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            {isCurrentlyPlaying && isPlaying ? <Pause size={24} className="text-white" /> : <Play size={24} className="text-white" />}
                        </div>
                      </button>
                    </td>
                    <td className="p-3 truncate">
                      <div className="font-semibold text-white truncate">{track.songName} - {track.artist} ({track.version})</div>
                    </td>
                    <td className="p-3 truncate font-mono text-gray-400">{track.duration}</td>
                    <td className="p-3 truncate font-mono text-gray-400">{track.fileSize}</td>
                    <td className="p-3 truncate font-mono text-gray-400">{track.style}</td>
                    <td className="p-3">
                      <div className="flex justify-end items-center gap-3">
                        <button onClick={() => onLike(track.id)} className="p-2 rounded-full hover:bg-blue-500/10" title="Like"><ThumbsUp size={18} className={`transition-colors ${isLiked ? 'text-blue-500 fill-current' : 'text-gray-400 hover:text-white'}`} /></button>
                        <button onClick={() => onDownload(track)} className="p-2 rounded-full hover:bg-green-500/10" title="Download"><Download size={18} className={isDownloaded ? 'text-green-500' : 'text-blue-400 hover:text-white'} /></button>
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

const SiteFooter = memo(function SiteFooter() {
    return (
        <footer className="bg-[#121212] border-t border-gray-800 mt-auto">
            <div className="max-w-screen-xl mx-auto py-8 px-8 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
                <div className="text-center md:text-left"><p className="text-sm text-gray-500">&copy; {new Date().getFullYear()} DJ Pool. Todos os direitos reservados.</p></div>
                <div className="flex items-center gap-2"><span className="relative flex h-3 w-3"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span><span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span></span><p className="text-sm text-green-400 font-semibold">Todos os serviços online</p></div>
                <div className="flex space-x-6">
                    <a href="#" className="text-gray-400 hover:text-white"><Instagram size={24} /></a>
                    <a href="#" className="text-gray-400 hover:text-white"><Twitter size={24} /></a>
                    <a href="#" className="text-gray-400 hover:text-white"><Facebook size={24} /></a>
                </div>
            </div>
        </footer>
    );
});

function Pagination({ currentPage, totalPages, onPageChange }: { currentPage: number, totalPages: number, onPageChange: (page: number) => void }) {
    if (totalPages <= 1) return null;
    
    const renderPages = () => {
        const pages = [];
        const maxPagesToShow = 5;
        const half = Math.floor(maxPagesToShow / 2);
        let start = Math.max(1, currentPage - half);
        let end = Math.min(totalPages, currentPage + half);
        if (currentPage - half < 1) end = Math.min(totalPages, maxPagesToShow);
        if (currentPage + half > totalPages) start = Math.max(1, totalPages - maxPagesToShow + 1);
        if (start > 1) {
            pages.push(<button key={1} onClick={() => onPageChange(1)} className="px-4 py-2 rounded-md text-sm font-semibold bg-gray-800 text-gray-300 hover:bg-gray-700 border border-gray-700">1</button>);
            if (start > 2) pages.push(<span key="start-ellipsis" className="px-4 py-2 text-gray-500">...</span>);
        }
        for (let i = start; i <= end; i++) {
            pages.push(<button key={i} onClick={() => onPageChange(i)} className={`px-4 py-2 rounded-md text-sm font-semibold ${currentPage === i ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700 border border-gray-700'}`}>{i}</button>);
        }
        if (end < totalPages) {
            if (end < totalPages - 1) pages.push(<span key="end-ellipsis" className="px-4 py-2 text-gray-500">...</span>);
            pages.push(<button key={totalPages} onClick={() => onPageChange(totalPages)} className="px-4 py-2 rounded-md text-sm font-semibold bg-gray-800 text-gray-300 hover:bg-gray-700 border border-gray-700">{totalPages}</button>);
        }
        return pages;
    };

    return <nav className="flex justify-center items-center space-x-2 mt-8">{renderPages()}</nav>;
}


// --- Página Principal ---
export default function NewPage() {
  const { playTrack, currentTrack, likedTracks, downloadedTracks, handleLike, handleDownload, alertMessage, closeAlert, isUserDataLoaded, isPlaying } = useAppContext();
  
  const [allTracks, setAllTracks] = useState<Track[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState({ genres: [], versions: [], uploadDate: 'all' });
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const tracksPerPage = 100;

  useEffect(() => {
    const fetchTracks = async () => {
        setIsLoading(true);
        try {
            const res = await fetch('/api/tracks');
            if (!res.ok) throw new Error('Falha ao buscar o catálogo de músicas');
            const data = await res.json();
            setAllTracks(data);
        } catch (error) { console.error(error); } 
        finally { setIsLoading(false); }
    };
    fetchTracks();
  }, []);

  useEffect(() => {
    const handleHashChange = () => {
        const hash = window.location.hash.slice(1);
        const params = new URLSearchParams(hash);
        const uploadDate = params.get('uploadDate') || 'all';
        const page = parseInt(params.get('page') || '1', 10);
        setFilters(prev => ({ ...prev, uploadDate }));
        setCurrentPage(page);
    };
    window.addEventListener('hashchange', handleHashChange);
    handleHashChange();
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  useEffect(() => {
    const params = new URLSearchParams();
    if (filters.uploadDate !== 'all') params.set('uploadDate', filters.uploadDate);
    if (currentPage > 1) params.set('page', currentPage.toString());
    const newHash = params.toString();
    if (window.location.hash.slice(1) !== newHash) {
        window.location.hash = newHash;
    }
  }, [filters.uploadDate, currentPage]);

  const filteredTracks = useMemo(() => {
    return allTracks.filter(track => {
      const genreMatch = filters.genres.length === 0 || filters.genres.includes(track.style);
      const versionMatch = filters.versions.length === 0 || filters.versions.includes(track.version);
      const dateMatch = filters.uploadDate === 'all' || track.releaseDate.startsWith(filters.uploadDate);
      const searchMatch = searchTerm === '' || 
                          track.songName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          track.artist.toLowerCase().includes(searchTerm.toLowerCase());
      return genreMatch && versionMatch && searchMatch && dateMatch;
    });
  }, [filters, searchTerm, allTracks]);

  const paginatedTracks = useMemo(() => {
    const startIndex = (currentPage - 1) * tracksPerPage;
    return filteredTracks.slice(startIndex, startIndex + tracksPerPage);
  }, [currentPage, filteredTracks]);

  const totalPages = Math.ceil(filteredTracks.length / tracksPerPage);

  const handlePlay = useCallback((track: Track) => {
    playTrack(track, filteredTracks);
  }, [playTrack, filteredTracks]);

  const groupedTracks = useMemo(() => {
    const groups: { [key: string]: Track[] } = {};
    paginatedTracks.forEach(track => {
      const date = track.releaseDate;
      if (!groups[date]) groups[date] = [];
      groups[date].push(track);
    });
    return Object.entries(groups).sort((a, b) => new Date(b[0]).getTime() - new Date(a[0]).getTime());
  }, [paginatedTracks]);

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
    <div className="bg-[#121212] text-gray-300 font-inter min-h-screen flex flex-col">
      <Head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Roboto+Mono:wght@400;500&display=swap" rel="stylesheet" />
      </Head>
      <Header onSearchChange={setSearchTerm} />
      <Alert message={alertMessage} onClose={closeAlert} />
      <div className="flex flex-grow">
        <SidebarFilters tracks={allTracks} onFilterChange={setFilters} currentFilters={filters} />
        <main className="flex-grow p-8 pb-40 overflow-y-auto">
          <h2 className="text-3xl font-extrabold text-white tracking-tight mb-6">New Music</h2>
          
          {isLoading || !isUserDataLoaded ? (
            <div className="p-16 text-center text-gray-500"><Loader2 className="animate-spin text-blue-500 mx-auto" size={32} /></div>
          ) : groupedTracks.length > 0 ? (
            groupedTracks.map(([date, tracks]) => {
              const { isToday, date: formattedDate } = formatDateHeader(date);
              return (
                <div key={date} className="mb-8">
                  <div className="flex items-baseline gap-3 mb-3">
                    {isToday ? ( <> <strong className="font-bold text-lg text-white">Hoje</strong> <span className="text-red-500 font-semibold">{formattedDate}</span> </> ) : ( <span className="font-semibold text-lg text-gray-400">{formattedDate}</span> )}
                  </div>
                  <hr className="border-gray-800 mb-4" />
                  <div className="bg-[#181818] rounded-xl overflow-hidden">
                    <MusicTable tracks={tracks} onPlay={handlePlay} onLike={handleLike} onDownload={handleDownload} likedTracks={likedTracks} downloadedTracks={downloadedTracks} currentTrackId={currentTrack?.id || null} isPlaying={isPlaying} />
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
          <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
        </main>
      </div>
      {/* O FooterPlayer foi removido da renderização principal, pois agora é controlado pelo AppContext */}
      <SiteFooter />
    </div>
  );
}
