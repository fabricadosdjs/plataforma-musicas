
"use client";
// Função auxiliar para checar se é um objeto Date válido
function isValidDate(val: unknown): val is Date {
  return Object.prototype.toString.call(val) === '[object Date]' && !isNaN((val as Date).getTime());
}
// src/components/layout/Header.tsx

import { AlertCircle, CheckCircle, Crown, Search, X, User, Wrench, Link2, Download, Star, Menu, Bell, UserCircle, Users, Home } from 'lucide-react';
import { useSession, signOut } from 'next-auth/react';
import { SafeImage } from '@/components/ui/SafeImage';
import Link from 'next/link';
import { useEffect, useState, useRef } from 'react';
import { useAppContext } from '@/context/AppContext';
import { Filter } from 'lucide-react'; // Certifique-se de que Filter está importado aqui
import { getSignInUrl } from '@/lib/utils';
import { useNotifications } from '@/hooks/useNotifications';
import { NotificationItem } from '@/components/ui/NotificationItem';

interface HeaderProps {
}

const NEW_LOGO_URL = 'https://i.ibb.co/Y7WKPY57/logo-nexor.png';

const Header = ({ }: HeaderProps) => {
  const { data: session } = useSession();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const {
    notifications,
    unreadCount,
    markAsRead,
    clearAllNotifications,
    removeNotification,
    cleanOldNotifications
  } = useNotifications();

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

  // Previne scroll quando menu móvel está aberto
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
      console.log('🔍 Menu móvel aberto - z-index:', 'z-[999999]');
    } else {
      document.body.style.overflow = 'unset';
      document.body.style.position = '';
      document.body.style.width = '';
    }

    return () => {
      document.body.style.overflow = 'unset';
      document.body.style.position = '';
      document.body.style.width = '';
    };
  }, [mobileMenuOpen]);



  // Usando a função de alerta do AppContext
  const { showAlert } = useAppContext();

  const formatDate = (dateString: string | Date): string => {
    if (!dateString) return '';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '';
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };







  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Search functionality removed - handled by individual pages
  };

  return (
    <header className="fixed top-0 left-0 w-full z-[9998] bg-gradient-to-r from-gray-900/95 via-gray-800/95 to-black/95 backdrop-blur-md shadow-lg border-b border-gray-700/30 py-2">
      <div className="container mx-auto px-4 flex items-center justify-between">
        <div className="flex items-center space-x-4 md:space-x-6">
          {/* Mobile menu button */}
          <button
            className="md:hidden flex items-center justify-center p-2 rounded-lg text-gray-200 hover:bg-gray-700/50 hover:text-white focus:outline-none focus:ring-2 focus:ring-red-500/50 transition-all duration-200 bg-gray-800/50"
            onClick={() => {
              console.log('🔘 Botão do menu clicado');
              setMobileMenuOpen(true);
            }}
            aria-label="Abrir menu"
          >
            <Menu className="h-6 w-6" />
          </button>
          <Link href="/">
            <div className="relative h-10 w-auto">
              <SafeImage
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
          <nav className="hidden md:flex space-x-1 text-gray-300 font-medium items-center">
            <Link
              href="/"
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg font-bold tracking-wide text-xs transition-all duration-300 hover:text-red-400 hover:bg-red-500/10 hover:scale-105 border border-transparent hover:border-red-500/30 shadow-lg hover:shadow-red-500/20"
            >
              <Home className="h-3.5 w-3.5" />
              HOME
            </Link>

            <Link
              href="/new"
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg font-bold tracking-wide text-xs transition-all duration-300 hover:text-emerald-400 hover:bg-emerald-500/10 hover:scale-105 border border-transparent hover:border-emerald-500/30 shadow-lg hover:shadow-emerald-500/20"
            >
              <CheckCircle className="h-3.5 w-3.5" />
              NOVIDADES
            </Link>

            <Link
              href="/community"
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg font-bold tracking-wide text-xs transition-all duration-300 hover:text-purple-400 hover:bg-purple-500/10 hover:scale-105 border border-transparent hover:border-purple-500/30 shadow-lg hover:shadow-purple-500/20"
            >
              <Users className="h-3.5 w-3.5" />
              COMUNIDADE
            </Link>

            <Link
              href="/trending"
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg font-bold tracking-wide text-xs transition-all duration-300 hover:text-orange-400 hover:bg-orange-500/10 hover:scale-105 border border-transparent hover:border-orange-500/30 shadow-lg hover:shadow-orange-500/20"
            >
              <Star className="h-3.5 w-3.5" />
              TRENDING
            </Link>

            <Link
              href="/plans"
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg font-bold tracking-wide text-xs transition-all duration-300 hover:text-yellow-400 hover:bg-yellow-500/10 hover:scale-105 border border-transparent hover:border-yellow-500/30 shadow-lg hover:shadow-yellow-500/20"
            >
              <Crown className="h-3.5 w-3.5" />
              PLANOS VIP
            </Link>

            {Boolean((session?.user as any)?.isAdmin) && (
              <Link
                href="/admin/users"
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg font-bold tracking-wide text-xs transition-all duration-300 hover:text-red-400 hover:bg-red-500/10 hover:scale-105 border border-transparent hover:border-red-500/30 shadow-lg hover:shadow-red-500/20"
              >
                <Crown className="h-3.5 w-3.5" />
                ADMIN
              </Link>
            )}

            {/* Professional Tools Dropdown */}
            <div className="relative group" tabIndex={0}>
              <button className="flex items-center gap-1.5 px-3 py-2 rounded-lg font-bold tracking-wide text-xs transition-all duration-300 hover:text-cyan-400 hover:bg-cyan-500/10 hover:scale-105 border border-transparent hover:border-cyan-500/30 shadow-lg hover:shadow-cyan-500/20 focus:outline-none group-hover:bg-cyan-500/20" tabIndex={-1}>
                <Wrench className="h-3.5 w-3.5" />
                FERRAMENTAS
                <svg className="ml-1 h-2.5 w-2.5 transition-transform duration-300 group-hover:rotate-180" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <div className="absolute left-0 mt-2 w-48 bg-gradient-to-br from-gray-900/95 via-gray-800/95 to-black/95 backdrop-blur-xl border border-gray-600/30 rounded-xl shadow-2xl z-50 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 group-hover:pointer-events-auto group-focus-within:pointer-events-auto transition-all duration-300 pointer-events-none overflow-hidden" tabIndex={0} onMouseDown={e => e.preventDefault()}>
                <Link
                  href="/debridlink"
                  className="flex items-center gap-2 px-3 py-2.5 text-gray-200 hover:bg-gradient-to-r hover:from-green-600/20 hover:to-green-700/20 border-b border-gray-700/50 transition-all duration-300 font-semibold tracking-wide hover:text-green-300 hover:scale-[1.02] transform text-sm"
                >
                  <Link2 className="h-3.5 w-3.5 text-green-400" />
                  DEBRIDLINK
                </Link>
                <Link
                  href="/allavsoft"
                  className="flex items-center gap-2 px-3 py-2.5 text-gray-200 hover:bg-gradient-to-r hover:from-red-600/20 hover:to-red-700/20 border-b border-gray-700/50 transition-all duration-300 font-semibold tracking-wide hover:text-red-300 hover:scale-[1.02] transform text-sm"
                >
                  <Download className="h-3.5 w-3.5 text-red-400" />
                  ALLAVSOFT
                </Link>
                <Link
                  href="/deemix"
                  className="flex items-center gap-2 px-3 py-2.5 text-gray-200 hover:bg-gradient-to-r hover:from-purple-600/20 hover:to-purple-700/20 transition-all duration-300 font-semibold tracking-wide hover:text-purple-300 hover:scale-[1.02] transform text-sm"
                >
                  <Wrench className="h-3.5 w-3.5 text-purple-400" />
                  DEEMIX
                </Link>
              </div>
            </div>
          </nav>
        </div>
        {/* Professional Mobile Drawer */}
        {mobileMenuOpen && (
          <div className="mobile-menu-overlay flex">
            {/* Enhanced Overlay */}
            <div
              className="mobile-menu-overlay bg-black/70 backdrop-blur-md animate-fadeIn"
              onClick={() => setMobileMenuOpen(false)}
            />
            {/* Professional Drawer */}
            <div className="mobile-menu-drawer bg-gradient-to-br from-gray-900/98 via-gray-800/98 to-black/98 backdrop-blur-xl shadow-2xl border-r border-gray-600/30 animate-slideInLeft flex flex-col overflow-hidden">
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
                  <SafeImage src={NEW_LOGO_URL} alt="Logo" width={140} height={36} className="mb-3 drop-shadow-lg" />
                  <div className="text-center">
                    <h3 className="text-white font-bold text-lg tracking-wider">PLATAFORMA DJ</h3>
                    <p className="text-gray-400 text-sm font-medium">Sua música, seu estilo</p>
                  </div>
                </div>
              </div>

              {/* Professional Navigation */}
              <nav className="flex flex-col gap-2 px-6 py-4 flex-1 overflow-y-auto">
                <Link
                  href="/"
                  className="flex items-center gap-4 py-4 px-4 rounded-xl text-gray-200 hover:bg-gradient-to-r hover:from-red-600/20 hover:to-red-700/20 text-base font-bold tracking-wider transition-all duration-300 hover:text-red-300 hover:scale-[1.02] transform border border-transparent hover:border-red-500/30 shadow-lg hover:shadow-red-500/20"
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

                {Boolean((session?.user as any)?.isAdmin) && (
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
                    className="flex items-center gap-4 py-4 px-4 rounded-xl text-gray-200 hover:bg-gradient-to-r hover:from-red-600/20 hover:to-red-700/20 text-base font-bold tracking-wider transition-all duration-300 hover:text-red-300 hover:scale-[1.02] transform border border-transparent hover:border-red-500/30 shadow-lg hover:shadow-red-500/20"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Download className="h-5 w-5 text-red-400" />
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
                  <div className="space-y-3">
                    <a
                      href="https://wa.me/55514935052274?text=Olá! Gostaria de solicitar informações sobre os planos de assinatura da plataforma de músicas."
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full block py-3.5 rounded-xl bg-gradient-to-r from-yellow-600 to-yellow-700 text-white text-center font-bold tracking-wider hover:from-yellow-700 hover:to-yellow-800 transition-all duration-300 shadow-lg hover:shadow-yellow-500/30 hover:scale-[1.02] transform border border-yellow-500/30"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      ASSINAR
                    </a>
                    <Link
                      href="/auth/sign-in"
                      className="w-full block py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 text-white text-center font-bold tracking-wider hover:from-blue-700 hover:to-blue-800 transition-all duration-300 shadow-lg hover:shadow-blue-500/30 hover:scale-[1.02] transform border border-blue-500/30"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      ENTRAR NA CONTA
                    </Link>
                  </div>
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
                    <span className="absolute -top-1 -right-1 bg-green-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
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
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              if (confirm('Limpar notificações antigas (mais de 30 dias)?')) {
                                cleanOldNotifications();
                                // Mostrar feedback visual
                                const button = event?.target as HTMLButtonElement;
                                if (button) {
                                  const originalText = button.textContent;
                                  button.textContent = '✓ Limpo!';
                                  button.className = 'text-xs text-green-400 transition-colors';
                                  setTimeout(() => {
                                    button.textContent = originalText;
                                    button.className = 'text-xs text-gray-400 hover:text-green-400 transition-colors';
                                  }, 2000);
                                }
                              }
                            }}
                            className="text-xs text-gray-400 hover:text-green-400 transition-colors"
                            title="Limpar notificações antigas (mais de 30 dias)"
                          >
                            Limpar Antigas
                          </button>
                          <button
                            onClick={() => {
                              if (confirm('Tem certeza que deseja limpar todas as notificações? Esta ação não pode ser desfeita.')) {
                                clearAllNotifications();
                                // Mostrar feedback visual
                                const button = event?.target as HTMLButtonElement;
                                if (button) {
                                  const originalText = button.textContent;
                                  button.textContent = '✓ Limpo!';
                                  button.className = 'text-xs text-green-400 transition-colors';
                                  setTimeout(() => {
                                    button.textContent = originalText;
                                    button.className = 'text-xs text-gray-400 hover:text-green-400 transition-colors';
                                  }, 2000);
                                }
                              }
                            }}
                            className="text-xs text-gray-400 hover:text-green-400 transition-colors"
                          >
                            Limpar Tudo
                          </button>
                          <button
                            onClick={() => {
                              console.log('🧪 Teste: Estado atual das notificações:', notifications);
                              console.log('🧪 Teste: localStorage notifications:', localStorage.getItem('notifications'));
                              console.log('🧪 Teste: localStorage excludedNotifications:', localStorage.getItem('excludedNotifications'));
                              console.log('🧪 Teste: localStorage notificationsCleared:', localStorage.getItem('notificationsCleared'));
                            }}
                            className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
                            title="Testar sistema de notificações"
                          >
                            🧪 Teste
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="max-h-80 overflow-y-auto group">
                      {notifications.length === 0 ? (
                        <div className="p-6 text-center text-gray-400">
                          <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                          <p>Nenhuma notificação</p>
                        </div>
                      ) : (
                        notifications.map((notification) => (
                          <NotificationItem
                            key={notification.id}
                            notification={notification}
                            onMarkAsRead={markAsRead}
                            onRemove={removeNotification}
                          />
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
                            {typeof (session.user as any).whatsapp === 'string' ? (session.user as any).whatsapp : 'WhatsApp não informado'}
                          </div>
                        </div>
                      </div>

                      <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold ${(() => {
                        // Lógica para determinar status VIP real
                        const isVipByField = session.user.is_vip;
                        const vencimento = (session.user as any).vencimento;
                        const hasValidVencimento = vencimento && new Date(vencimento) > new Date();
                        const isVipReal = isVipByField || hasValidVencimento;
                        return isVipReal;
                      })()
                        ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30'
                        : 'bg-red-500/20 text-red-300 border border-red-500/30'
                        }`}>
                        {(() => {
                          // Lógica para determinar status VIP real
                          const isVipByField = session.user.is_vip;
                          const vencimento = (session.user as any).vencimento;
                          const hasValidVencimento = vencimento && new Date(vencimento) > new Date();
                          const isVipReal = isVipByField || hasValidVencimento;

                          if (isVipReal) {
                            if ((session.user as any).plan) {
                              return <><Crown className="h-4 w-4" /> {(session.user as any).plan}</>;
                            } else if (hasValidVencimento) {
                              return <><Crown className="h-4 w-4" /> BÁSICO</>;
                            } else {
                              return <><Crown className="h-4 w-4" /> VIP</>;
                            }
                          } else {
                            return <><AlertCircle className="h-4 w-4" /> Free</>;
                          }
                        })()}
                      </div>

                      {session.user.vencimento && (typeof session.user.vencimento === 'string' || isValidDate(session.user.vencimento)) && (
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
            <div className="flex items-center space-x-3">
              <Link href="/plans" className="px-4 py-2.5 bg-gradient-to-r from-yellow-600 to-yellow-700 text-white rounded-lg font-semibold hover:from-yellow-700 hover:to-yellow-800 transition-all shadow-lg text-sm">
                ASSINAR
              </Link>
              <Link href="/auth/sign-in" className="px-4 py-2.5 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg font-semibold hover:from-red-700 hover:to-red-800 transition-all shadow-lg text-sm">
                ENTRAR
              </Link>
            </div>
          )}
        </div>
      </div>



      {/* Não há notificações locais aqui, elas são gerenciadas pelo AppContext */}
    </header>
  );
};

export default Header;