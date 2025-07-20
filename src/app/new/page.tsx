// src/app/new/page.tsx
"use client";

import React, { useState, useMemo, useEffect, useCallback, memo, useRef } from 'react';
import { useUser, UserButton, SignedIn, SignedOut, SignInButton, SignUpButton, ClerkLoaded, ClerkLoading } from '@clerk/nextjs';
import Head from 'next/head';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Play, Download, ThumbsUp, X, Info, Music, Search, Loader2, Instagram, Twitter, Facebook, ChevronDown, Menu as MenuIcon, Copyright as CopyrightIcon, Bug as BugIcon } from 'lucide-react';
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
};

// Interface para os filtros (definida aqui para uso no SidebarFilters e NewPage)
interface Filters {
  genres: string[];
  versions: string[];
  uploadDate: string;
}

// --- Componentes ---

// ReportConfirmationModal: Estilizado e horizontal
const ReportConfirmationModal = memo(function ReportConfirmationModal({ isOpen, trackName, onConfirm, onCancel }: { isOpen: boolean, trackName: string | undefined, onConfirm: () => void, onCancel: () => void }) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
            <div className="bg-white p-8 sm:p-10 rounded-lg shadow-xl max-w-sm sm:max-w-md md:max-w-xl lg:max-w-2xl w-full h-auto max-h-[70vh] overflow-y-auto text-center border border-gray-200 animate-fade-in-scale">
                <h3 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-5 tracking-tight">
                    <CopyrightIcon size={32} className="inline-block text-red-600 mr-3" />
                    Denúncia de Direitos Autorais
                </h3>
                <p className="text-base sm:text-lg text-gray-700 leading-relaxed mb-8">
                    Você está prestes a denunciar a música &quot;<strong className="text-red-700 font-bold">{trackName || 'esta música'}</strong>&quot;
                    por violação de direitos autorais.
                    <br />
                    Esta ação é séria e será investigada. Por favor, confirme se deseja prosseguir.
                </p>
                <div className="flex flex-col sm:flex-row justify-center gap-4 sm:gap-6">
                    <button onClick={onConfirm} className="bg-red-600 text-white px-8 py-3 rounded-full hover:bg-red-700 transition-colors font-bold text-lg w-full sm:w-auto shadow-md hover:shadow-lg">
                        Sim, Denunciar Agora
                    </button>
                    <button onClick={onCancel} className="bg-gray-200 text-gray-800 px-8 py-3 rounded-full hover:bg-gray-300 transition-colors font-semibold text-lg w-full sm:w-auto shadow-md hover:shadow-lg">
                        Não, Cancelar
                    </button>
                </div>
                <p className="text-xs text-gray-500 mt-6">
                    Ao denunciar, você ajuda a manter a plataforma legal e justa.
                </p>
            </div>
        </div>
    );
});

// ConfirmationModal (para re-download)
const ConfirmationModal = memo(function ConfirmationModal({ isOpen, title, message, onConfirm, onCancel }: { isOpen: boolean, title: string, message: string, onConfirm: () => void, onCancel: () => void }) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
            <div className="bg-white p-8 rounded-lg shadow-xl max-w-sm w-full text-center border border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-4">{title}</h3>
                <p className="text-gray-700 mb-6">{message}</p>
                <div className="flex flex-col sm:flex-row justify-center gap-4">
                    <button onClick={onConfirm} className="bg-blue-600 text-white px-6 py-3 rounded-full hover:bg-blue-700 transition-colors font-semibold w-full sm:w-auto">
                        Sim, Baixar Novamente
                    </button>
                    <button onClick={onCancel} className="bg-gray-200 text-gray-800 px-6 py-3 rounded-full hover:bg-gray-300 transition-colors font-semibold w-full sm:w-auto">
                        Não
                    </button>
                </div>
            </div>
        </div>
    );
});

// NOVO Componente: BugReportConfirmationModal
const BugReportConfirmationModal = memo(function BugReportConfirmationModal({ isOpen, trackName, onConfirm, onCancel }: { isOpen: boolean, trackName: string | undefined, onConfirm: () => void, onCancel: () => void }) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
            <div className="bg-white p-8 sm:p-10 rounded-lg shadow-xl max-w-sm sm:max-w-md md:max-w-xl lg:max-w-2xl w-full h-auto max-h-[70vh] overflow-y-auto text-center border border-gray-200 animate-fade-in-scale">
                <h3 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-5 tracking-tight">
                    <BugIcon size={32} className="inline-block text-orange-600 mr-3" />
                    Reportar Problema na Música
                </h3>
                <p className="text-base sm:text-lg text-gray-700 leading-relaxed mb-8">
                    Você está prestes a reportar um problema com a música &quot;<strong className="text-orange-700 font-bold">{trackName || 'esta música'}</strong>&quot;.
                    <br />
                    Isso nos ajudará a corrigir links quebrados ou falhas de reprodução. Confirme sua denúncia.
                </p>
                <div className="flex flex-col sm:flex-row justify-center gap-4 sm:gap-6">
                    <button onClick={onConfirm} className="bg-orange-600 text-white px-8 py-3 rounded-full hover:bg-orange-700 transition-colors font-bold text-lg w-full sm:w-auto shadow-md hover:shadow-lg">
                        Sim, Reportar Erro
                    </button>
                    <button onClick={onCancel} className="bg-gray-200 text-gray-800 px-8 py-3 rounded-full hover:bg-gray-300 transition-colors font-semibold text-lg w-full sm:w-auto shadow-md hover:shadow-lg">
                        Não, Cancelar
                    </button>
                </div>
                <p className="text-xs text-gray-500 mt-6">
                    Agradecemos sua ajuda para manter a qualidade da plataforma.
                </p>
            </div>
        </div>
    );
});


const MobileMenu = memo(function MobileMenu({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
    const { user, isLoaded } = useUser();
    const pathname = usePathname();
    const navLinks = [
        { href: '/new', label: 'New' }, { href: '/featured', label: 'Featured' },
        { href: '/trending', label: 'Trending' }, { href: '/charts', label: 'Charts' },
        { href: '/profile', label: 'Meu Perfil', authRequired: true }
    ];

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-40 lg:hidden">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose}></div>

            <div className="absolute left-0 top-0 h-full w-64 bg-white shadow-lg p-6 flex flex-col transform transition-transform duration-300 ease-in-out">
                <div className="flex justify-end mb-8">
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-200 text-gray-700 hover:text-gray-900">
                        <X size={24} />
                    </button>
                </div>

                <div className="mb-8 border-b border-gray-200 pb-6">
                    <ClerkLoading>
                        <div className="h-10 w-10 rounded-full bg-gray-200 animate-pulse"></div>
                        <div className="h-4 w-32 bg-gray-200 rounded animate-pulse"></div>
                    </ClerkLoading>
                    <ClerkLoaded>
                        <SignedIn>
                            <div className="flex items-center gap-3 mb-4">
                                <UserButton afterSignOutUrl="/new" />
                                <span className="text-gray-900 font-semibold">{user?.fullName || user?.emailAddresses[0]?.emailAddress || "Usuário"}</span>
                            </div>
                            <Link href="/profile" className="text-blue-600 hover:text-blue-700 text-sm" onClick={onClose}>Ver Perfil</Link>
                        </SignedIn>
                        <SignedOut>
                            <div className="flex flex-col gap-4">
                                <SignInButton mode="modal" afterSignInUrl="/new" afterSignUpUrl="/new">
                                    <button className="w-full text-left font-semibold px-4 py-2 rounded-md transition-colors text-gray-700 hover:text-gray-900 bg-gray-200 hover:bg-gray-300" onClick={onClose}>Entrar</button>
                                </SignInButton>
                                <SignUpButton mode="modal" afterSignInUrl="/new" afterSignUpUrl="/new">
                                    <button className="w-full text-left bg-blue-600 text-white px-4 py-2 rounded-full hover:bg-blue-700 transition-colors text-sm font-bold" onClick={onClose}>Cadastrar</button>
                                </SignUpButton>
                            </div>
                        </SignedOut>
                    </ClerkLoaded>
                </div>

                <nav className="flex flex-col space-y-4 flex-grow">
                    {navLinks.map((link) => (
                        (!link.authRequired || (link.authRequired && user)) && (
                            <Link key={link.href} href={link.href} className={`text-lg font-semibold transition-colors ${pathname === link.href ? 'text-gray-900' : 'text-gray-600 hover:text-gray-900'}`} onClick={onClose}>
                                {link.label}
                            </Link>
                        )
                    ))}
                </nav>

                <div className="mt-auto flex justify-center space-x-6 pt-6 border-t border-gray-200">
                    <a href="#" className="text-gray-600 hover:text-gray-900"><Instagram size={24} /></a>
                    <a href="#" className="text-gray-600 hover:text-gray-900"><Twitter size={24} /></a>
                    <a href="#" className="text-gray-600 hover:text-gray-900"><Facebook size={24} /></a>
                </div>
            </div>
        </div>
    );
});


const Header = memo(function Header({ onSearchChange, onMobileMenuToggle }: { onSearchChange: (query: string) => void, onMobileMenuToggle: () => void }) {
    const pathname = usePathname();
    const navLinks = [
      { href: '/new', label: 'New' }, { href: '/featured', label: 'Featured' },
      { href: '/trending', label: 'Trending' }, { href: '/charts', label: 'Charts' },
    ];
    return (
      <header className="w-full bg-white/80 backdrop-blur-sm p-4 flex flex-col sm:flex-row justify-between items-center border-b border-gray-200 sticky top-0 z-30">
        <div className="flex justify-between items-center w-full sm:w-auto mb-2 sm:mb-0">
          <div className="flex items-center gap-3 sm:gap-4">
            <button onClick={onMobileMenuToggle} className="p-1 sm:p-2 rounded-md hover:bg-gray-100 text-gray-800 lg:hidden">
                <MenuIcon size={20} />
            </button>
            <Link href="/new" className="flex items-center gap-2 sm:gap-4">
              <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gray-900 rounded-full flex items-center justify-center">
                <Music size={16} className="text-white" />
              </div>
              <h1 className="text-lg sm:text-xl font-bold text-gray-900">DJ Pool</h1>
            </Link>
          </div>
          <div className="flex items-center gap-2 sm:hidden">
              <ClerkLoading><div className="h-7 w-20 bg-gray-200 rounded-md animate-pulse"></div></ClerkLoading>
              <ClerkLoaded>
                  <SignedIn>
                      <UserButton afterSignOutUrl="/new">
                         {/* UserIcon removido daqui, pois UserButton não aceita filhos personalizados */}
                      </UserButton>
                  </SignedIn>
                  <SignedOut>
                      <SignInButton mode="modal" afterSignInUrl="/new" afterSignUpUrl="/new"><button className="font-semibold px-2 py-1 rounded-md transition-colors text-gray-700 hover:text-gray-900 text-sm">Entrar</button></SignInButton>
                      <SignUpButton mode="modal" afterSignInUrl="/new" afterSignUpUrl="/new"><button className="bg-blue-600 text-white px-3 py-1.5 rounded-full hover:bg-blue-700 transition-colors text-xs font-bold">Cadastrar</button></SignUpButton>
                  </SignedOut>
              </ClerkLoaded>
          </div>
        </div>
        <div className="relative w-full sm:max-w-md mx-0 sm:mx-4 lg:mx-4 mt-2 sm:mt-0">
          <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input type="text" placeholder="Pesquisar por música ou artista..." onChange={(e) => onSearchChange(e.target.value)} className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 bg-gray-100 text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-sm sm:text-base"/>
        </div>
        <div className="hidden sm:flex items-center gap-4 lg:gap-8 mt-2 sm:mt-0">
            <nav className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (<Link key={link.href} href={link.href} className={`font-semibold transition-colors pb-2 ${pathname === link.href ? 'text-gray-900 border-b-2 border-gray-900' : 'text-gray-600 hover:text-gray-900'}`}>{link.label}</Link>))}
            </nav>
            <div className="hidden sm:flex items-center gap-4">
                <ClerkLoading><div className="h-8 w-28 bg-gray-200 rounded-md animate-pulse"></div></ClerkLoading>
                <ClerkLoaded>
                    <SignedIn>
                        <Link href="/profile" className={`font-semibold transition-colors pb-2 hidden md:block ${pathname === '/profile' ? 'text-gray-900 border-b-2 border-gray-900' : 'text-gray-600 hover:text-gray-900'}`}>Meu Perfil</Link>
                        <UserButton afterSignOutUrl="/new"/>
                    </SignedIn>
                    <SignedOut>
                        <SignInButton mode="modal" afterSignInUrl="/new" afterSignUpUrl="/new"><button className="font-semibold px-3 py-2 rounded-md transition-colors text-gray-700 hover:text-gray-900">Entrar</button></SignInButton>
                        <SignUpButton mode="modal" afterSignInUrl="/new" afterSignUpUrl="/new"><button className="bg-blue-600 text-white px-4 py-2 rounded-full hover:bg-blue-700 transition-colors text-sm font-bold">Cadastrar</button></SignUpButton>
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

const SidebarFilters = memo(function SidebarFilters({ tracks, onFilterChange, currentFilters }: { tracks: Track[], onFilterChange: (filters: Filters) => void, currentFilters: Filters }) => {
    const availableGenres = useMemo(() => [...new Set(tracks.map(t => t.style))], [tracks]);
    const availableVersions = useMemo(() => [...new Set(tracks.map(t => t.version))], [tracks]);
    const availableDates = useMemo(() => {
        const dates = new Set<string>();
        const now = new Date(new Date().toLocaleString("en-US", {timeZone: "America/Sao_Paulo"})); 
        const start = new Date('2025-07-01');
        while (start <= now) {
            dates.add(start.toISOString().slice(0, 7));
            start.setMonth(start.getMonth() + 1);
        }
        return Array.from(dates).sort().reverse();
    }, []);

    const handleFilterChange = (type: 'genres' | 'versions' | 'uploadDate', value: string) => {
      onFilterChange((prevFilters: Filters) => {
          if (type === 'genres' || type === 'versions') {
            const currentFilter = prevFilters[type];
            const newFilter = currentFilter.includes(value) ? currentFilter.filter((item: string) => item !== value) : [...currentFilter, value];
            return { ...prevFilters, [type]: newFilter };
          }
          return { ...prevFilters, [type]: value };
      });
    };
    
    return (
      <aside className="w-64 flex-shrink-0 bg-gray-50 p-6 hidden lg:block h-full border-r border-gray-200">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Filtros</h2>
        <div className="space-y-8">
          <div>
            <h3 className="font-semibold text-gray-800 mb-3 flex justify-between items-center">Data <ChevronDown size={16} /></h3>
            <select value={currentFilters.uploadDate} onChange={(e) => handleFilterChange('uploadDate', e.target.value)} className="w-full p-2 rounded-md border border-gray-300 bg-gray-100 text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-sm">
                <option value="all">Todos os Meses</option>
                {availableDates.map(date => (<option key={date} value={date}>{new Date(date + '-02').toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}</option>))}
            </select>
          </div>
          <div>
            <h3 className="font-semibold text-gray-800 mb-3">Gênero</h3>
            <div className="space-y-2 text-sm">
              {availableGenres.map(genre => (
                <label key={genre} className="flex items-center space-x-3 text-gray-700 cursor-pointer hover:text-gray-900">
                  <input type="checkbox" checked={currentFilters.genres.includes(genre)} onChange={() => handleFilterChange('genres', genre)} className="h-4 w-4 rounded border-gray-400 bg-gray-200 text-blue-500 focus:ring-blue-500 focus:ring-offset-white" />
                  <span>{genre}</span>
                </label>
              ))}
            </div>
          </div>
          <div>
            <h3 className="font-semibold text-gray-800 mb-3">Versão</h3>
            <div className="space-y-2 text-sm">
              {availableVersions.map(version => (
                <label key={version} className="flex items-center space-x-3 text-gray-700 cursor-pointer hover:text-gray-900">
                  <input type="checkbox" checked={currentFilters.versions.includes(version)} onChange={() => handleFilterChange('versions', version)} className="h-4 w-4 rounded border-gray-400 bg-gray-200 text-blue-500 focus:ring-blue-500 focus:ring-offset-white" />
                  <span>{version}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </aside>
    );
});

// Componente MusicTable
const MusicTable = memo(function MusicTable({ tracks, onPlay, onLike, onDownload, onReportCopyright, onReportBug, likedTracks, downloadedTracks, currentTrackId, isPlaying }: { tracks: Track[], onPlay: (track: Track) => void, onLike: (trackId: number) => void, onDownload: (track: Track) => void, onReportCopyright: (track: Track) => void, onReportBug: (track: Track) => void, likedTracks: number[], downloadedTracks: number[], currentTrackId: number | null, isPlaying: boolean }) {
    return (
        <div className="flex flex-col gap-4 sm:gap-6">
          {tracks.map((track) => {
            const isLiked = likedTracks.includes(track.id);
            const isDownloaded = downloadedTracks.includes(track.id);
            const isCurrentlyPlaying = track.id === currentTrackId;

            return (
              <div key={track.id} className="border-b border-gray-200 pb-4 sm:pb-6 last:border-b-0 bg-white rounded-xl shadow-md p-3 sm:p-4 md:p-5">
                {/* Contêiner principal da linha: flex-col em mobile/sm, flex-row em md+ */}
                <div className="flex flex-col md:flex-row items-center md:items-start gap-3 md:gap-4">
                  {/* Imagem e Botão Play/Pause - TAMANHO DA THUMBNAIL AJUSTADO */}
                  <div className="relative flex-shrink-0 w-14 h-14 sm:w-16 sm:h-16 rounded-lg overflow-hidden cursor-pointer shadow-md" onClick={() => onPlay(track)}>
                    <img src={track.imageUrl} alt={track.songName} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      {isCurrentlyPlaying && isPlaying ? (
                        <div className="w-7 h-7 sm:w-8 sm:h-8 bg-white rounded-full animate-spin-slow flex items-center justify-center">
                            <div className="w-2 h-2 bg-black rounded-full"></div>
                        </div>
                      ) : (
                        <Play size={24} className="text-white" />
                      )}
                    </div>
                  </div>
                  {/* Informações da Música (Nome, Artista, Gênero) - REVISADO PARA ESTILO EM LINHA EM MD+ */}
                  <div className="flex-grow flex flex-col justify-center min-w-0 text-center md:text-left">
                      {/* SongName e Style: flex-col em mobile/sm, flex-row em md+ com justify-between */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-center sm:justify-start md:justify-between gap-1 sm:gap-2">
                          {/* FONTE DO TÍTULO DA MÚSICA AJUSTADA */}
                          <div className="font-bold text-sm sm:text-base text-gray-900 truncate">
                              {track.songName}
                          </div>
                          {/* Estilo: visível em todas as telas, empurrado para direita em md+ */}
                          <div className="text-xs sm:text-sm text-gray-600 mt-1 sm:mt-0 md:ml-auto">
                              <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full font-semibold">{track.style}</span>
                          </div>
                      </div>
                      {/* Artista: Sempre abaixo do SongName e Style */}
                      <div className="text-sm sm:text-base text-gray-600 truncate font-bold font-mono mt-1 text-center sm:text-left">
                          {track.artist}
                      </div>
                  </div>
                  {/* Ícones de Ação: Centralizados abaixo do conteúdo em mobile, à direita em md+ */}
                  <div className="flex justify-center md:justify-end items-center gap-3 md:gap-4 mt-4 md:mt-0 md:ml-auto">
                    <button onClick={() => onReportCopyright(track)} className="p-2 sm:p-2.5 rounded-full hover:bg-red-100/50" title="Denunciar Copyright">
                      <CopyrightIcon size={18} className="text-red-500 hover:text-red-700" />
                    </button>
                    <button onClick={() => onReportBug(track)} className="p-2 sm:p-2.5 rounded-full hover:bg-orange-100/50" title="Reportar Erro">
                      <BugIcon size={18} className="text-orange-500 hover:text-orange-700" />
                    </button>
                    <button onClick={() => onLike(track.id)} className="p-2 sm:p-2.5 rounded-full hover:bg-blue-100/50" title="Like"><ThumbsUp size={18} className={`transition-colors ${isLiked ? 'text-blue-600 fill-current' : 'text-gray-500 hover:text-gray-900'}`} /></button>
                    <button onClick={() => onDownload(track)} className="p-2 sm:p-2.5 rounded-full hover:bg-green-100/50" title="Download">
                        <Download size={18} className={isDownloaded ? 'text-green-600' : 'text-blue-500 hover:text-gray-900'} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      );
});

const SiteFooter = memo(function SiteFooter() {
    return (
        <footer className="bg-gray-100 border-t border-gray-200 mt-auto">
            <div className="max-w-screen-xl mx-auto py-8 px-4 sm:px-8 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
                <div className="text-center md:text-left"><p className="text-sm text-gray-600">&copy; {new Date().getFullYear()} DJ Pool. Todos os direitos reservados.</p></div>
                <div className="flex items-center gap-2"><span className="relative flex h-3 w-3"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span><span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span></span><p className="text-sm text-green-600 font-semibold">Todos os serviços online</p></div>
                <div className="flex space-x-3 sm:space-x-4">
                    <a href="#" className="text-gray-500 hover:text-gray-800"><Instagram size={20} /></a>
                    <a href="#" className="text-gray-500 hover:text-gray-800"><Twitter size={20} /></a>
                    <a href="#" className="text-gray-500 hover:text-gray-800"><Facebook size={20} /></a>
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
            pages.push(<button key={1} onClick={() => onPageChange(1)} className="px-3 py-1.5 rounded-md text-xs font-semibold bg-gray-200 text-gray-700 hover:bg-gray-300 border border-gray-300">1</button>);
            if (start > 2) pages.push(<span key="start-ellipsis" className="px-1 text-gray-500">...</span>);
        }
        for (let i = start; i <= end; i++) {
            pages.push(<button key={i} onClick={() => onPageChange(i)} className={`px-3 py-1.5 rounded-md text-xs font-semibold ${currentPage === i ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300 border border-gray-300'}`}>{i}</button>);
        }
        if (end < totalPages) {
            if (end < totalPages - 1) pages.push(<span key="end-ellipsis" className="px-1 text-gray-500">...</span>);
            pages.push(<button key={totalPages} onClick={() => onPageChange(totalPages)} className="px-3 py-1.5 rounded-md text-xs font-semibold bg-gray-200 text-gray-700 hover:bg-gray-300 border border-gray-300">{totalPages}</button>);
        }
        return pages;
    };

    return <nav className="flex justify-center items-center space-x-1 sm:space-x-2 mt-8 px-2">
{renderPages()}</nav>;
}


// --- Página Principal ---
export default function NewPage() {
  const { playTrack, nextTrack, currentTrack, likedTracks, downloadedTracks, handleLike, handleDownload, alertMessage, closeAlert, isUserDataLoaded, isPlaying, setIsPlaying,
    showReDownloadConfirmation, trackToConfirm, confirmReDownload, cancelReDownload,
    showReportConfirmation, trackToReport, confirmReport, cancelReport,
    handleReportCopyright,
    showBugReportConfirmation, trackToBugReport, confirmBugReport, cancelBugReport,
    handleReportBug
  } = useAppContext();
  
  const [allTracks, setAllTracks] = useState<Track[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState({ genres: [], versions: [], uploadDate: 'all' });
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const tracksPerPage = 100;
  const audioRef = useRef<HTMLAudioElement>(null);

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const toggleMobileMenu = useCallback(() => {
    setIsMobileMenuOpen(prev => !prev);
  }, []);


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
    if (audioRef.current && currentTrack) {
        if (isPlaying) {
            audioRef.current.src = currentTrack.previewUrl;
            audioRef.current.play().catch(e => console.error("Erro ao tocar áudio:", e));
        } else {
            audioRef.current.pause();
        }
    }
  }, [isPlaying, currentTrack]);

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

  const handleNextTrackWithContext = useCallback(() => {
    if (currentTrack) nextTrack();
  }, [currentTrack, nextTrack]);

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
    <div className="bg-white text-gray-900 font-inter min-h-screen flex flex-col">
      <Head>
        <style>{`
            .animate-spin-slow {
                animation: spin 3s linear infinite;
            }
            @keyframes spin {
                from { transform: rotate(0deg); }
                to { transform: rotate(360deg); }
            }
            /* Adicionado para a animação do modal */
            .animate-fade-in-scale {
              animation: fadeInScale 0.3s ease-out forwards;
            }
            @keyframes fadeInScale {
              from { opacity: 0; transform: scale(0.95); }
              to { opacity: 1; transform: scale(1); }
            }
        `}</style>
      </Head>
      <Header onSearchChange={setSearchTerm} onMobileMenuToggle={toggleMobileMenu} />
      <Alert message={alertMessage} onClose={closeAlert} />
      
      <MobileMenu isOpen={isMobileMenuOpen} onClose={toggleMobileMenu} />

      <ConfirmationModal
        isOpen={showReDownloadConfirmation}
        title="Baixar Novamente?"
        message={`Você já baixou "${trackToConfirm?.songName}" hoje. Deseja baixar novamente? Isso não contará para seu limite diário.`}
        onConfirm={confirmReDownload}
        onCancel={cancelReDownload}
      />

      <ReportConfirmationModal
        isOpen={showReportConfirmation}
        trackName={trackToReport?.songName}
        onConfirm={confirmReport}
        onCancel={cancelReport}
      />
      {/* Modal de Confirmação de Reporte de Bug */}
      <BugReportConfirmationModal
        isOpen={showBugReportConfirmation}
        trackName={trackToBugReport?.songName}
        onConfirm={confirmBugReport}
        onCancel={cancelBugReport}
      />

      <div className="flex max-w-screen-2xl mx-auto w-full flex-grow flex-col lg:flex-row p-4 sm:p-8">
        <SidebarFilters tracks={allTracks} onFilterChange={setFilters} currentFilters={filters} />
        <main className="flex-grow p-0 sm:p-0 mt-4 lg:mt-0">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight mb-4 sm:mb-6">New Music</h2>
          
          {isLoading || !isUserDataLoaded ? (
            <div className="p-16 text-center text-gray-500"><Loader2 className="animate-spin text-blue-500 mx-auto" size={32} /></div>
          ) : groupedTracks.length > 0 ? (
            groupedTracks.map(([date, tracks]) => {
              const { isToday, date: formattedDate } = formatDateHeader(date);
              return (
                <div key={date} className="mb-6 sm:mb-8">
                  <div className="flex items-baseline gap-2 sm:gap-3 mb-2 sm:mb-3">
                    {isToday ? ( <> <strong className="font-bold text-lg text-gray-900">Hoje</strong> <span className="text-red-600 font-semibold text-sm sm:text-base">{formattedDate}</span> </> ) : ( <span className="font-semibold text-lg text-gray-700 text-sm sm:text-base">{formattedDate}</span> )}
                  </div>
                  <hr className="border-gray-200 mb-4" />
                  <div className="bg-white rounded-xl overflow-hidden shadow-md">
                    <MusicTable tracks={tracks} onPlay={handlePlay} onLike={handleLike} onDownload={handleDownload} onReportCopyright={handleReportCopyright} onReportBug={handleReportBug} likedTracks={likedTracks} downloadedTracks={downloadedTracks} currentTrackId={currentTrack?.id || null} isPlaying={isPlaying} />
                  </div>
                </div>
              );
            })
          ) : (
            <div className="p-16 text-center text-gray-600">
              <p className="font-semibold">Nenhuma música encontrada.</p>
              <p className="text-sm">Tente ajustar seus filtros ou a pesquisa.</p>
            </div>
          )}
          <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
        </main>
      </div>
      <SiteFooter />
      <audio ref={audioRef} onEnded={handleNextTrackWithContext} onPlay={() => setIsPlaying(true)} onPause={() => setIsPlaying(false)} />
    </div>
  );
}