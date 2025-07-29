// src/components/layout/Header.tsx
"use client";

import { AlertCircle, CheckCircle, Crown, Search, X, User, Wrench, Link2, Download, Star, Menu } from 'lucide-react';
import { useSession, signOut } from 'next-auth/react';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState, useRef } from 'react';
import { useAppContext } from '@/context/AppContext';
import { Filter } from 'lucide-react'; // Certifique-se de que Filter está importado aqui

interface HeaderProps {
  showSearchAndFilters?: boolean;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  onSearchSubmit?: () => void;
  onFiltersClick?: () => void;
  hasActiveFilters?: boolean;
}

const NEW_LOGO_URL = 'https://i.ibb.co/Y7WKPY57/logo-nexor.png';

const Header = ({
  showSearchAndFilters = false,
  searchQuery,
  onSearchChange,
  onSearchSubmit,
  onFiltersClick,
  hasActiveFilters = false, // Garante que hasActiveFilters sempre seja um booleano
}: HeaderProps) => {
  const { data: session } = useSession();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  // Fecha o menu ao clicar fora
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
    }
    if (showProfileMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showProfileMenu]);

  // Usando as funções de alerta do AppContext
  const { showAlert, showVipAlert } = useAppContext();

  const formatDate = (dateString: string | Date): string => {
    if (!dateString) return '';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '';
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  // Verificar vencimento do usuário e usar o sistema de alerta do AppContext
  useEffect(() => {
    if (session?.user?.is_vip && session.user.vencimento) {
      const vencimentoDate = new Date(session.user.vencimento);
      const now = new Date();
      const diffTime = vencimentoDate.getTime() - now.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays <= 3 && diffDays >= 0) {
        showVipAlert(`Sua assinatura VIP vence em ${diffDays} dias!`);
      } else if (diffDays < 0) {
        showAlert(`Sua assinatura VIP venceu em ${formatDate(vencimentoDate)}!`, 15000);
      }
    }
  }, [session, showAlert, showVipAlert]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearchSubmit) {
      onSearchSubmit();
    }
  };

  return (
    <header className="fixed top-0 left-0 w-full z-40 bg-gradient-to-r from-[#1B1C1D] to-[#2a2a2e] shadow-lg border-b border-gray-700/50 py-3 font-bebas-neue">
      <div className="container mx-auto px-4 flex items-center justify-between">
        <div className="flex items-center space-x-4 md:space-x-6">
          {/* Mobile menu button */}
          <button className="md:hidden flex items-center justify-center p-2 rounded-lg text-gray-200 hover:bg-gray-800 focus:outline-none" onClick={() => setMobileMenuOpen(true)} aria-label="Abrir menu">
            <Menu className="h-7 w-7" />
          </button>
          <Link href="/">
            <div className="relative h-10 w-auto">
              <Image
                src={NEW_LOGO_URL}
                alt="NextorDJ Logo"
                width={150}
                height={40}
                priority
                className="h-full w-auto object-contain"
              />
            </div>
          </Link>
          {/* Desktop nav */}
          <nav className="hidden md:flex space-x-6 text-gray-300 font-medium items-center">
            <Link href="/new" className="flex items-center gap-1 hover:text-blue-400 transition-colors"><CheckCircle className="h-4 w-4" />Novidades</Link>
            <Link href="/trending" className="flex items-center gap-1 hover:text-blue-400 transition-colors"><Star className="h-4 w-4" />Trending</Link>
            <Link href="/charts" className="flex items-center gap-1 hover:text-blue-400 transition-colors"><Crown className="h-4 w-4" />Charts</Link>
            <Link href="/featured" className="flex items-center gap-1 hover:text-blue-400 transition-colors"><AlertCircle className="h-4 w-4" />Featured</Link>
            <Link href="/pro" className="flex items-center gap-1 hover:text-blue-400 transition-colors"><User className="h-4 w-4" />Pro</Link>
            <Link href="/relatorios" className="flex items-center gap-1 hover:text-blue-400 transition-colors"><Search className="h-4 w-4" />Relatórios</Link>
            {session?.user?.isAdmin && (
              <Link href="/admin/users" className="flex items-center gap-1 hover:text-blue-400 transition-colors"><Crown className="h-4 w-4" />Admin</Link>
            )}
            {/* Ferramentas Dropdown */}
            <div className="relative group" tabIndex={0}>
              <button className="flex items-center gap-1 hover:text-green-400 transition-colors focus:outline-none" tabIndex={-1}>
                <Wrench className="h-4 w-4" /> Ferramentas
                <svg className="ml-1 h-3 w-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
              </button>
              <div className="absolute left-0 mt-2 w-48 bg-gray-900 border border-gray-700 rounded-lg shadow-lg z-50 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 group-hover:pointer-events-auto group-focus-within:pointer-events-auto transition-opacity duration-200 pointer-events-none" tabIndex={0} onMouseDown={e => e.preventDefault()}>
                <Link href="/debridlink" className="flex items-center gap-2 px-4 py-2 text-gray-200 hover:bg-gray-800 rounded-t-lg"><Link2 className="h-4 w-4 text-green-400" />DebridLink</Link>
                <Link href="/allavsoft" className="flex items-center gap-2 px-4 py-2 text-gray-200 hover:bg-gray-800 rounded-b-lg"><Download className="h-4 w-4 text-blue-400" />Allavsoft</Link>
              </div>
            </div>
          </nav>
        </div>
        {/* Mobile Drawer */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 flex">
            {/* Overlay */}
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)}></div>
            {/* Drawer */}
            <div className="relative bg-[#18181b] w-72 max-w-[80vw] h-full shadow-2xl border-r border-gray-800 animate-slideInLeft flex flex-col">
              <button className="absolute top-4 right-4 p-2 rounded-full text-gray-400 hover:bg-gray-800" onClick={() => setMobileMenuOpen(false)} aria-label="Fechar menu">
                <X className="h-7 w-7" />
              </button>
              <div className="flex flex-col items-center mt-10 mb-6">
                <Image src={NEW_LOGO_URL} alt="Logo" width={120} height={32} className="mb-2" />
              </div>
              <nav className="flex flex-col gap-2 px-6">
                <Link href="/new" className="flex items-center gap-2 py-3 px-2 rounded-lg text-gray-200 hover:bg-blue-900/30 text-base font-semibold" onClick={() => setMobileMenuOpen(false)}><CheckCircle className="h-5 w-5" />Novidades</Link>
                <Link href="/trending" className="flex items-center gap-2 py-3 px-2 rounded-lg text-gray-200 hover:bg-blue-900/30 text-base font-semibold" onClick={() => setMobileMenuOpen(false)}><Star className="h-5 w-5" />Trending</Link>
                <Link href="/charts" className="flex items-center gap-2 py-3 px-2 rounded-lg text-gray-200 hover:bg-blue-900/30 text-base font-semibold" onClick={() => setMobileMenuOpen(false)}><Crown className="h-5 w-5" />Charts</Link>
                <Link href="/featured" className="flex items-center gap-2 py-3 px-2 rounded-lg text-gray-200 hover:bg-blue-900/30 text-base font-semibold" onClick={() => setMobileMenuOpen(false)}><AlertCircle className="h-5 w-5" />Featured</Link>
                <Link href="/pro" className="flex items-center gap-2 py-3 px-2 rounded-lg text-gray-200 hover:bg-blue-900/30 text-base font-semibold" onClick={() => setMobileMenuOpen(false)}><User className="h-5 w-5" />Pro</Link>
                <Link href="/relatorios" className="flex items-center gap-2 py-3 px-2 rounded-lg text-gray-200 hover:bg-blue-900/30 text-base font-semibold" onClick={() => setMobileMenuOpen(false)}><Search className="h-5 w-5" />Relatórios</Link>
                {session?.user?.isAdmin && (
                  <Link href="/admin/users" className="flex items-center gap-2 py-3 px-2 rounded-lg text-gray-200 hover:bg-blue-900/30 text-base font-semibold" onClick={() => setMobileMenuOpen(false)}><Crown className="h-5 w-5" />Admin</Link>
                )}
                <div className="border-t border-gray-700 my-2"></div>
                <Link href="/debridlink" className="flex items-center gap-2 py-3 px-2 rounded-lg text-gray-200 hover:bg-green-900/30 text-base font-semibold" onClick={() => setMobileMenuOpen(false)}><Link2 className="h-5 w-5 text-green-400" />DebridLink</Link>
                <Link href="/allavsoft" className="flex items-center gap-2 py-3 px-2 rounded-lg text-gray-200 hover:bg-blue-900/30 text-base font-semibold" onClick={() => setMobileMenuOpen(false)}><Download className="h-5 w-5 text-blue-400" />Allavsoft</Link>
              </nav>
              <div className="flex-1"></div>
              <div className="p-6 border-t border-gray-700">
                {session?.user ? (
                  <button className="w-full py-2 rounded-lg bg-red-600 text-white font-bold hover:bg-red-700 transition" onClick={() => { setMobileMenuOpen(false); signOut(); }}>Sair</button>
                ) : (
                  <Link href="/auth/sign-in" className="w-full block py-2 rounded-lg bg-blue-600 text-white text-center font-bold hover:bg-blue-700 transition" onClick={() => setMobileMenuOpen(false)}>Entrar</Link>
                )}
              </div>
            </div>
          </div>
        )}

        {showSearchAndFilters && (
          <form onSubmit={handleSearchSubmit} className="flex items-center w-full max-w-md mx-4 bg-gray-800 rounded-full px-4 py-2 border border-gray-700 focus-within:border-blue-500 transition-all duration-200">
            <Search className="h-5 w-5 text-gray-400 mr-3" />
            <input
              type="text"
              placeholder="Buscar músicas, artistas, estilos..."
              className="flex-grow bg-transparent outline-none text-white placeholder-gray-400 text-sm"
              value={searchQuery}
              onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
            />
            {onFiltersClick && (
              <button type="button" onClick={onFiltersClick} className="ml-3 p-2 bg-gray-700 rounded-full hover:bg-gray-600 transition-colors relative">
                {/* O componente Filter é importado do lucide-react - SEM COMENTÁRIOS DE LINHA JS AQUI */}
                <Filter className={`h-4 w-4 ${hasActiveFilters ? 'text-blue-400' : 'text-gray-300'}`} />
                {hasActiveFilters && (
                  <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-blue-500 ring-2 ring-gray-800"></span>
                )}
              </button>
            )}
          </form>
        )}

        <div className="flex items-center space-x-4">
          {session?.user ? (
            <div className="relative" ref={profileMenuRef}>
              <button
                className="flex items-center space-x-2 text-white font-medium hover:text-blue-400 transition-colors focus:outline-none"
                onClick={() => setShowProfileMenu((prev) => !prev)}
                aria-label="Abrir menu de perfil"
              >
                <User className="h-8 w-8" />
                {session.user.is_vip && <Crown className="h-5 w-5 text-yellow-400 ml-1" />}
              </button>
              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-64 bg-gray-900 border border-gray-700 rounded-lg shadow-lg z-50 p-4">
                  <div className="mb-2 text-white text-sm">
                    <div className="font-bold text-base mb-1">{session.user.name || 'Usuário'}</div>
                    <div className="text-gray-400 mb-1">{session.user.email}</div>
                    <div className="flex items-center gap-2 mb-1">
                      {session.user.is_vip ? (
                        <><Crown className="h-4 w-4 text-yellow-400" /> <span className="text-yellow-300 font-semibold">VIP</span></>
                      ) : (
                        <><AlertCircle className="h-4 w-4 text-red-400" /> <span className="text-red-300 font-semibold">Free</span></>
                      )}
                    </div>
                    {session.user.vencimento && (
                      <div className="text-gray-400 text-xs">Vencimento: <span className="text-white font-semibold">{formatDate(session.user.vencimento)}</span></div>
                    )}
                  </div>
                  <Link href="/profile/page.tsx" className="block px-4 py-2 text-white hover:bg-gray-800 rounded-lg mb-2">Perfil</Link>
                  <button
                    className="block w-full text-left px-4 py-2 text-white hover:bg-gray-800 rounded-lg"
                    onClick={() => signOut()}
                  >Sair</button>
                </div>
              )}
            </div>
          ) : (
            <Link href="/auth/sign-in" className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors shadow">Entrar</Link>
          )}
        </div>
      </div>

      {/* Não há notificações locais aqui, elas são gerenciadas pelo AppContext */}
    </header>
  );
};

export default Header;