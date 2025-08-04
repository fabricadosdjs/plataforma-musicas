// src/components/layout/Header.tsx
"use client";

import { AlertCircle, CheckCircle, Crown, Search, X, User, Wrench, Link2, Download, Star, Menu, Bell, UserCircle, Users, Home } from 'lucide-react';
import { useSession, signOut } from 'next-auth/react';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState, useRef } from 'react';
import { useAppContext } from '@/context/AppContext';
import { Filter } from 'lucide-react'; // Certifique-se de que Filter está importado aqui
import { getSignInUrl } from '@/lib/utils';

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
  const [showNotifications, setShowNotifications] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState<Array<{
    id: string;
    type: 'warning' | 'error' | 'info';
    title: string;
    message: string;
    timestamp: Date;
    read: boolean;
  }>>([]);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const notificationsMenuRef = useRef<HTMLDivElement>(null);
  // Fecha os menus ao clicar fora
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
      if (notificationsMenuRef.current && !notificationsMenuRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    }
    if (showProfileMenu || showNotifications) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showProfileMenu, showNotifications]);

  // Usando a função de alerta do AppContext
  const { showAlert } = useAppContext();

  const formatDate = (dateString: string | Date): string => {
    if (!dateString) return '';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '';
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  // Verificar vencimento do usuário e atualizar notificações
  useEffect(() => {
    if (session?.user) {
      const newNotifications: typeof notifications = [];

      // Verificar vencimento VIP - REMOVIDO O ALERTA AUTOMÁTICO
      if (session.user.is_vip && session.user.vencimento) {
        const vencimentoDate = new Date(session.user.vencimento);
        const now = new Date();
        const diffTime = vencimentoDate.getTime() - now.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays <= 3 && diffDays >= 0) {
          newNotifications.push({
            id: 'vip-expiring',
            type: 'warning',
            title: 'Plano VIP Vencendo',
            message: `Seu plano VIP vence em ${diffDays} dias. Renove para manter seus benefícios!`,
            timestamp: new Date(),
            read: false
          });
          // REMOVIDO: showAlert(`Sua assinatura VIP vence em ${diffDays} dias!`);
        } else if (diffDays < 0) {
          newNotifications.push({
            id: 'vip-expired',
            type: 'error',
            title: 'Plano VIP Expirado',
            message: `Seu plano VIP venceu em ${formatDate(vencimentoDate)}. Renove agora!`,
            timestamp: new Date(),
            read: false
          });
        }
      }

      setNotifications(newNotifications);
    }
  }, [session]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = (notificationId: string) => {
    setNotifications(prev => prev.map(n => n.id === notificationId ? { ...n, read: true } : n));
  };

  const clearAllNotifications = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearchSubmit) {
      onSearchSubmit();
    }
  };

  return (
    <header className="fixed top-0 left-0 w-full z-40 bg-gradient-to-r from-gray-900/95 via-gray-800/95 to-black/95 backdrop-blur-md shadow-lg border-b border-gray-700/30 py-3">
      <div className="container mx-auto px-4 flex items-center justify-between">
        <div className="flex items-center space-x-4 md:space-x-6">
          {/* Mobile menu button */}
          <button className="md:hidden flex items-center justify-center p-2 rounded-lg text-gray-200 hover:bg-[#374151] focus:outline-none" onClick={() => setMobileMenuOpen(true)} aria-label="Abrir menu">
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
          {/* Professional Desktop Navigation */}
          <nav className="hidden md:flex space-x-2 text-gray-300 font-medium items-center">
            <Link
              href="/"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold tracking-wide text-sm transition-all duration-300 hover:text-blue-400 hover:bg-blue-500/10 hover:scale-105 border border-transparent hover:border-blue-500/30 shadow-lg hover:shadow-blue-500/20"
            >
              <Home className="h-4 w-4" />
              HOME
            </Link>

            <Link
              href="/new"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold tracking-wide text-sm transition-all duration-300 hover:text-emerald-400 hover:bg-emerald-500/10 hover:scale-105 border border-transparent hover:border-emerald-500/30 shadow-lg hover:shadow-emerald-500/20"
            >
              <CheckCircle className="h-4 w-4" />
              NOVIDADES
            </Link>

            <Link
              href="/community"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold tracking-wide text-sm transition-all duration-300 hover:text-purple-400 hover:bg-purple-500/10 hover:scale-105 border border-transparent hover:border-purple-500/30 shadow-lg hover:shadow-purple-500/20"
            >
              <Users className="h-4 w-4" />
              COMUNIDADE
            </Link>

            <Link
              href="/trending"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold tracking-wide text-sm transition-all duration-300 hover:text-orange-400 hover:bg-orange-500/10 hover:scale-105 border border-transparent hover:border-orange-500/30 shadow-lg hover:shadow-orange-500/20"
            >
              <Star className="h-4 w-4" />
              TRENDING
            </Link>

            <Link
              href="/plans"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold tracking-wide text-sm transition-all duration-300 hover:text-yellow-400 hover:bg-yellow-500/10 hover:scale-105 border border-transparent hover:border-yellow-500/30 shadow-lg hover:shadow-yellow-500/20"
            >
              <Crown className="h-4 w-4" />
              PLANOS VIP
            </Link>

            {session?.user?.isAdmin && (
              <Link
                href="/admin/users"
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold tracking-wide text-sm transition-all duration-300 hover:text-red-400 hover:bg-red-500/10 hover:scale-105 border border-transparent hover:border-red-500/30 shadow-lg hover:shadow-red-500/20"
              >
                <Crown className="h-4 w-4" />
                ADMIN
              </Link>
            )}

            {/* Professional Tools Dropdown */}
            <div className="relative group" tabIndex={0}>
              <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold tracking-wide text-sm transition-all duration-300 hover:text-cyan-400 hover:bg-cyan-500/10 hover:scale-105 border border-transparent hover:border-cyan-500/30 shadow-lg hover:shadow-cyan-500/20 focus:outline-none group-hover:bg-cyan-500/20" tabIndex={-1}>
                <Wrench className="h-4 w-4" />
                FERRAMENTAS
                <svg className="ml-1 h-3 w-3 transition-transform duration-300 group-hover:rotate-180" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <div className="absolute left-0 mt-2 w-56 bg-gradient-to-br from-gray-900/95 via-gray-800/95 to-black/95 backdrop-blur-xl border border-gray-600/30 rounded-xl shadow-2xl z-50 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 group-hover:pointer-events-auto group-focus-within:pointer-events-auto transition-all duration-300 pointer-events-none overflow-hidden" tabIndex={0} onMouseDown={e => e.preventDefault()}>
                <Link
                  href="/debridlink"
                  className="flex items-center gap-3 px-4 py-3.5 text-gray-200 hover:bg-gradient-to-r hover:from-green-600/20 hover:to-green-700/20 border-b border-gray-700/50 transition-all duration-300 font-semibold tracking-wide hover:text-green-300 hover:scale-[1.02] transform"
                >
                  <Link2 className="h-4 w-4 text-green-400" />
                  DEBRIDLINK
                </Link>
                <Link
                  href="/allavsoft"
                  className="flex items-center gap-3 px-4 py-3.5 text-gray-200 hover:bg-gradient-to-r hover:from-blue-600/20 hover:to-blue-700/20 border-b border-gray-700/50 transition-all duration-300 font-semibold tracking-wide hover:text-blue-300 hover:scale-[1.02] transform"
                >
                  <Download className="h-4 w-4 text-blue-400" />
                  ALLAVSOFT
                </Link>
                <Link
                  href="/deemix"
                  className="flex items-center gap-3 px-4 py-3.5 text-gray-200 hover:bg-gradient-to-r hover:from-purple-600/20 hover:to-purple-700/20 transition-all duration-300 font-semibold tracking-wide hover:text-purple-300 hover:scale-[1.02] transform"
                >
                  <Wrench className="h-4 w-4 text-purple-400" />
                  DEEMIX
                </Link>
              </div>
            </div>
          </nav>
        </div>
        {/* Professional Mobile Drawer */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 flex">
            {/* Enhanced Overlay */}
            <div className="fixed inset-0 bg-black/70 backdrop-blur-md" onClick={() => setMobileMenuOpen(false)}></div>
            {/* Professional Drawer */}
            <div className="relative bg-gradient-to-br from-gray-900/98 via-gray-800/98 to-black/98 backdrop-blur-xl w-80 max-w-[85vw] h-full shadow-2xl border-r border-gray-600/30 animate-slideInLeft flex flex-col overflow-hidden">
              {/* Header with Close Button */}
              <div className="relative p-6 border-b border-gray-700/30 bg-gradient-to-r from-gray-800/50 via-gray-900/50 to-black/50">
                <button
                  className="absolute top-4 right-4 p-2 rounded-xl text-gray-400 hover:bg-gray-700/50 hover:text-white transition-all duration-300 hover:scale-110"
                  onClick={() => setMobileMenuOpen(false)}
                  aria-label="Fechar menu"
                >
                  <X className="h-6 w-6" />
                </button>

                {/* Professional Logo Section */}
                <div className="flex flex-col items-center mb-4">
                  <Image src={NEW_LOGO_URL} alt="Logo" width={140} height={36} className="mb-3 drop-shadow-lg" />
                  <div className="text-center">
                    <h3 className="text-white font-bold text-lg tracking-wider">PLATAFORMA DJ</h3>
                    <p className="text-gray-400 text-sm font-medium">Sua música, seu estilo</p>
                  </div>
                </div>
              </div>

              {/* Professional Navigation */}
              <nav className="flex flex-col gap-2 px-6 py-4 flex-1">
                <Link
                  href="/"
                  className="flex items-center gap-4 py-4 px-4 rounded-xl text-gray-200 hover:bg-gradient-to-r hover:from-blue-600/20 hover:to-blue-700/20 text-base font-bold tracking-wider transition-all duration-300 hover:text-blue-300 hover:scale-[1.02] transform border border-transparent hover:border-blue-500/30 shadow-lg hover:shadow-blue-500/20"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Home className="h-5 w-5" />
                  HOME
                </Link>

                <Link
                  href="/new"
                  className="flex items-center gap-4 py-4 px-4 rounded-xl text-gray-200 hover:bg-gradient-to-r hover:from-emerald-600/20 hover:to-emerald-700/20 text-base font-bold tracking-wider transition-all duration-300 hover:text-emerald-300 hover:scale-[1.02] transform border border-transparent hover:border-emerald-500/30 shadow-lg hover:shadow-emerald-500/20"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <CheckCircle className="h-5 w-5" />
                  NOVIDADES
                </Link>

                <Link
                  href="/community"
                  className="flex items-center gap-4 py-4 px-4 rounded-xl text-gray-200 hover:bg-gradient-to-r hover:from-purple-600/20 hover:to-purple-700/20 text-base font-bold tracking-wider transition-all duration-300 hover:text-purple-300 hover:scale-[1.02] transform border border-transparent hover:border-purple-500/30 shadow-lg hover:shadow-purple-500/20"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Users className="h-5 w-5" />
                  COMUNIDADE
                </Link>

                <Link
                  href="/trending"
                  className="flex items-center gap-4 py-4 px-4 rounded-xl text-gray-200 hover:bg-gradient-to-r hover:from-orange-600/20 hover:to-orange-700/20 text-base font-bold tracking-wider transition-all duration-300 hover:text-orange-300 hover:scale-[1.02] transform border border-transparent hover:border-orange-500/30 shadow-lg hover:shadow-orange-500/20"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Star className="h-5 w-5" />
                  TRENDING
                </Link>

                <Link
                  href="/plans"
                  className="flex items-center gap-4 py-4 px-4 rounded-xl text-gray-200 hover:bg-gradient-to-r hover:from-yellow-600/20 hover:to-yellow-700/20 text-base font-bold tracking-wider transition-all duration-300 hover:text-yellow-300 hover:scale-[1.02] transform border border-transparent hover:border-yellow-500/30 shadow-lg hover:shadow-yellow-500/20"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Crown className="h-5 w-5" />
                  PLANOS VIP
                </Link>

                {session?.user?.isAdmin && (
                  <Link
                    href="/admin/users"
                    className="flex items-center gap-4 py-4 px-4 rounded-xl text-gray-200 hover:bg-gradient-to-r hover:from-red-600/20 hover:to-red-700/20 text-base font-bold tracking-wider transition-all duration-300 hover:text-red-300 hover:scale-[1.02] transform border border-transparent hover:border-red-500/30 shadow-lg hover:shadow-red-500/20"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Crown className="h-5 w-5" />
                    ADMIN
                  </Link>
                )}

                {/* Tools Section */}
                <div className="border-t border-gray-700/50 my-4 pt-4">
                  <h4 className="text-gray-400 text-xs uppercase tracking-wider font-bold mb-3 px-4">FERRAMENTAS</h4>

                  <Link
                    href="/debridlink"
                    className="flex items-center gap-4 py-4 px-4 rounded-xl text-gray-200 hover:bg-gradient-to-r hover:from-green-600/20 hover:to-green-700/20 text-base font-bold tracking-wider transition-all duration-300 hover:text-green-300 hover:scale-[1.02] transform border border-transparent hover:border-green-500/30 shadow-lg hover:shadow-green-500/20"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Link2 className="h-5 w-5 text-green-400" />
                    DEBRIDLINK
                  </Link>

                  <Link
                    href="/allavsoft"
                    className="flex items-center gap-4 py-4 px-4 rounded-xl text-gray-200 hover:bg-gradient-to-r hover:from-blue-600/20 hover:to-blue-700/20 text-base font-bold tracking-wider transition-all duration-300 hover:text-blue-300 hover:scale-[1.02] transform border border-transparent hover:border-blue-500/30 shadow-lg hover:shadow-blue-500/20"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Download className="h-5 w-5 text-blue-400" />
                    ALLAVSOFT
                  </Link>

                  <Link
                    href="/deemix"
                    className="flex items-center gap-4 py-4 px-4 rounded-xl text-gray-200 hover:bg-gradient-to-r hover:from-purple-600/20 hover:to-purple-700/20 text-base font-bold tracking-wider transition-all duration-300 hover:text-purple-300 hover:scale-[1.02] transform border border-transparent hover:border-purple-500/30 shadow-lg hover:shadow-purple-500/20"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Wrench className="h-5 w-5 text-purple-400" />
                    DEEMIX
                  </Link>
                </div>
              </nav>

              {/* Professional Footer */}
              <div className="p-6 border-t border-gray-700/50 bg-gradient-to-r from-gray-800/30 to-gray-900/50">
                {session?.user ? (
                  <button
                    className="w-full py-3.5 rounded-xl bg-gradient-to-r from-red-600 to-red-700 text-white font-bold tracking-wider hover:from-red-700 hover:to-red-800 transition-all duration-300 shadow-lg hover:shadow-red-500/30 hover:scale-[1.02] transform border border-red-500/30"
                    onClick={() => { setMobileMenuOpen(false); signOut({ callbackUrl: getSignInUrl() }); }}
                  >
                    SAIR DA CONTA
                  </button>
                ) : (
                  <Link
                    href="/auth/sign-in"
                    className="w-full block py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 text-white text-center font-bold tracking-wider hover:from-blue-700 hover:to-blue-800 transition-all duration-300 shadow-lg hover:shadow-blue-500/30 hover:scale-[1.02] transform border border-blue-500/30"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    ENTRAR NA CONTA
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="flex items-center space-x-4">
          {session?.user ? (
            <div className="flex items-center space-x-3">
              {/* Sino de Notificações */}
              <div className="relative" ref={notificationsMenuRef}>
                <button
                  className="relative p-2 text-gray-300 hover:text-white focus:outline-none transition-colors"
                  onClick={() => setShowNotifications((prev) => !prev)}
                  aria-label="Ver notificações"
                >
                  <Bell className="h-6 w-6" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>

                {/* Menu de Notificações */}
                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 bg-gray-900 border border-gray-700 rounded-xl shadow-2xl z-50 max-h-96 overflow-hidden">
                    <div className="p-4 border-b border-gray-700 flex items-center justify-between">
                      <h3 className="font-bold text-white">Notificações</h3>
                      {notifications.length > 0 && (
                        <button
                          onClick={clearAllNotifications}
                          className="text-xs text-gray-400 hover:text-white transition-colors"
                        >
                          Limpar Tudo
                        </button>
                      )}
                    </div>

                    <div className="max-h-80 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="p-6 text-center text-gray-400">
                          <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                          <p>Nenhuma notificação</p>
                        </div>
                      ) : (
                        notifications.map((notification) => (
                          <div
                            key={notification.id}
                            className={`p-4 border-b border-gray-800 hover:bg-gray-800/50 cursor-pointer transition-colors ${!notification.read ? 'bg-blue-500/5 border-l-4 border-l-blue-500' : ''
                              }`}
                            onClick={() => markAsRead(notification.id)}
                          >
                            <div className="flex items-start gap-3">
                              <div className={`p-2 rounded-lg ${notification.type === 'error' ? 'bg-red-500/20 text-red-400' :
                                notification.type === 'warning' ? 'bg-yellow-500/20 text-yellow-400' :
                                  'bg-blue-500/20 text-blue-400'
                                }`}>
                                {notification.type === 'error' ? <X className="h-4 w-4" /> :
                                  notification.type === 'warning' ? <AlertCircle className="h-4 w-4" /> :
                                    <Bell className="h-4 w-4" />}
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="font-semibold text-white text-sm">{notification.title}</h4>
                                <p className="text-gray-300 text-xs mt-1 leading-relaxed">{notification.message}</p>
                                <p className="text-gray-500 text-xs mt-2">
                                  {notification.timestamp.toLocaleTimeString('pt-BR', {
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </p>
                              </div>
                              {!notification.read && (
                                <div className="w-2 h-2 bg-blue-500 rounded-full mt-1"></div>
                              )}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Menu do Perfil */}
              <div className="relative" ref={profileMenuRef}>
                <button
                  className="flex items-center space-x-3 text-white font-medium hover:text-blue-400 transition-colors focus:outline-none bg-gray-800/50 rounded-xl px-3 py-2 border border-gray-700 hover:border-gray-600"
                  onClick={() => setShowProfileMenu((prev) => !prev)}
                  aria-label="Abrir menu de perfil"
                >
                  <div className="relative">
                    <UserCircle className="h-8 w-8" />
                    {session.user.is_vip && (
                      <Crown className="h-4 w-4 text-yellow-400 absolute -top-1 -right-1 bg-gray-900 rounded-full p-0.5" />
                    )}
                  </div>
                </button>
                {showProfileMenu && (
                  <div className="absolute right-0 mt-2 w-72 bg-gray-900 border border-gray-700 rounded-xl shadow-2xl z-50 p-6">
                    <div className="mb-4 text-white">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="relative">
                          <UserCircle className="h-12 w-12 text-gray-300" />
                          {session.user.is_vip && (
                            <Crown className="h-5 w-5 text-yellow-400 absolute -top-1 -right-1 bg-gray-900 rounded-full p-0.5" />
                          )}
                        </div>
                        <div>
                          <div className="font-bold text-lg">{session.user.name || 'Usuário'}</div>
                          <div className="text-gray-400 text-sm">
                            {session.user.whatsapp || 'WhatsApp não informado'}
                          </div>
                        </div>
                      </div>

                      <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold ${session.user.is_vip
                        ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30'
                        : 'bg-red-500/20 text-red-300 border border-red-500/30'
                        }`}>
                        {session.user.is_vip ? (
                          <><Crown className="h-4 w-4" /> VIP</>
                        ) : (
                          <><AlertCircle className="h-4 w-4" /> Free</>
                        )}
                      </div>

                      {session.user.vencimento && (
                        <div className="mt-3 p-3 bg-gray-800/50 rounded-lg border border-gray-700">
                          <div className="text-gray-400 text-xs mb-1">Vencimento:</div>
                          <div className="text-white font-semibold">{formatDate(session.user.vencimento)}</div>
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Link
                        href="/profile"
                        className="flex items-center gap-3 px-4 py-3 text-white hover:bg-gray-800 rounded-lg transition-colors font-medium"
                        onClick={() => setShowProfileMenu(false)}
                      >
                        <UserCircle className="h-5 w-5" />
                        Meu Perfil
                      </Link>
                      <button
                        className="flex items-center gap-3 w-full text-left px-4 py-3 text-red-300 hover:bg-red-500/10 rounded-lg transition-colors font-medium"
                        onClick={() => signOut({
                          callbackUrl: getSignInUrl()
                        })}
                      >
                        <X className="h-5 w-5" />
                        Sair da Conta
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <Link href="/auth/sign-in" className="px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-cyan-700 transition-all shadow-lg">
              Entrar
            </Link>
          )}
        </div>
      </div>

      {/* Não há notificações locais aqui, elas são gerenciadas pelo AppContext */}
    </header>
  );
};

export default Header;