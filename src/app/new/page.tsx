// src/app/new/page.tsx
"use client";

import React, { useState, useMemo, useEffect, useCallback, memo, useRef } from 'react';
import { UserButton, SignedIn, SignedOut, SignInButton, SignUpButton, ClerkLoaded, ClerkLoading } from '@clerk/nextjs';
import Head from 'next/head';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Play, Download, ThumbsUp, X, Info, Pause, SkipBack, SkipForward, Music, Search, Loader2, Instagram, Twitter, Facebook, ChevronDown } from 'lucide-react';
import Image from 'next/image';
import { useAppContext } from '@/context/AppContext';

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

interface FiltersState {
  genres: string[];
  versions: string[];
  uploadDate: string;
}

interface WaveSurferInstance {
  load: (url: string) => void;
  play: () => void;
  pause: () => void;
  playPause: () => void;
  destroy: () => void;
  on: (event: string, callback: (...args: unknown[]) => void) => void;
}

const Header = memo(function Header({ onSearchChange }: { onSearchChange: (query: string) => void }) {
  const pathname = usePathname();
  const navLinks = [
    { href: '/new', label: 'New' },
    { href: '/featured', label: 'Featured' },
    { href: '/trending', label: 'Trending' },
    { href: '/charts', label: 'Charts' },
    { href: '/pro', label: 'PRO' }
  ];
  return (
    <header className="w-full bg-[#121212]/80 backdrop-blur-sm p-4 flex justify-between items-center border-b border-gray-800 sticky top-0 z-30">
      <div className="flex items-center gap-4">
        <Link href="/new" className="flex items-center gap-4">
          <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center"><Music size={16} className="text-black" /></div>
          <h1 className="text-xl font-bold text-white hidden sm:block">DJ Pool</h1>
        </Link>
      </div>
      <div className="relative w-full max-w-md mx-4 hidden lg:block">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
        <input type="text" placeholder="Pesquisar por música ou artista..." onChange={(e) => onSearchChange(e.target.value)} className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-700 bg-gray-800 text-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors" />
      </div>
      <div className="flex items-center gap-8">
        <nav className="hidden md:flex items-center space-x-8">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href} className={`font-semibold transition-colors pb-2 ${pathname === link.href ? 'text-white border-b-2 border-white' : 'text-gray-400 hover:text-white'}`}>
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-4">
          <ClerkLoading><div className="h-8 w-28 bg-gray-700 rounded-md animate-pulse"></div></ClerkLoading>
          <ClerkLoaded>
            <SignedIn>
              <Link href="/profile" className={`font-semibold transition-colors pb-2 hidden md:block ${pathname === '/profile' ? 'text-white border-b-2 border-white' : 'text-gray-400 hover:text-white'}`}>Meu Perfil</Link>
              <UserButton afterSignOutUrl="/new" />
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

const Alert = memo(function Alert({ message, onClose }: { message: string; onClose: () => void }) {
  if (!message) return null;
  return (
    <div className="fixed top-24 right-6 bg-blue-500 text-white p-4 rounded-lg shadow-lg flex items-center gap-4 z-50 animate-fade-in-down">
      <Info size={24} /><span>{message}</span><button onClick={onClose} className="p-1 rounded-full hover:bg-white/20"><X size={18} /></button>
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

function Pagination({ currentPage, totalPages, onPageChange }: { currentPage: number; totalPages: number; onPageChange: (page: number) => void }) {
  if (totalPages <= 1) return null;
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
  return (
    <nav className="flex justify-center items-center space-x-2 mt-8">
      {pages.map(page => (
        <button key={page} onClick={() => onPageChange(page)} className={`px-4 py-2 rounded-md text-sm font-semibold ${currentPage === page ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700 border border-gray-700'}`}>
          {page}
        </button>
      ))}
    </nav>
  );
}

export default function NewPage() {
  const {
    playTrack, nextTrack, previousTrack, currentTrack,
    likedTracks, downloadedTracks, handleLike, handleDownload,
    alertMessage, closeAlert, isUserDataLoaded, isPlaying, setIsPlaying
  } = useAppContext();

  const [allTracks, setAllTracks] = useState<Track[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState<FiltersState>({ genres: [], versions: [], uploadDate: 'all' });
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
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchTracks();
  }, []);

  const filteredTracks = useMemo(() => {
    return allTracks.filter(track => {
      const genreMatch = filters.genres.length === 0 || filters.genres.includes(track.style);
      const versionMatch = filters.versions.length === 0 || filters.versions.includes(track.version);
      const dateMatch = filters.uploadDate === 'all' || track.releaseDate.startsWith(filters.uploadDate);
      const searchMatch = searchTerm === '' || track.songName.toLowerCase().includes(searchTerm.toLowerCase()) || track.artist.toLowerCase().includes(searchTerm.toLowerCase());
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

  return (
    <div className="bg-[#121212] text-gray-300 font-inter min-h-screen flex flex-col">
      <Head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Roboto+Mono:wght@400;500&display=swap" rel="stylesheet" />
      </Head>
      <Header onSearchChange={setSearchTerm} />
      <Alert message={alertMessage} onClose={closeAlert} />
      <main className="flex-grow p-8 pb-40">
        <h2 className="text-3xl font-extrabold text-white tracking-tight mb-6">New Music</h2>
        {isLoading || !isUserDataLoaded ? (
          <div className="p-16 text-center text-gray-500"><Loader2 className="animate-spin text-blue-500 mx-auto" size={32} /></div>
        ) : paginatedTracks.length > 0 ? (
          <div className="bg-[#181818] rounded-xl overflow-hidden">
            {/* Substitua isso pelo componente de MusicTable que você já possui */}
          </div>
        ) : (
          <div className="p-16 text-center text-gray-500">
            <p className="font-semibold">Nenhuma música encontrada.</p>
            <p className="text-sm">Tente ajustar seus filtros ou a pesquisa.</p>
          </div>
        )}
        <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
      </main>
      <SiteFooter />
      {/* Substitua por seu FooterPlayer */}
    </div>
  );
}
