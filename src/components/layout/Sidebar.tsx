"use client";

import { AlertCircle, CheckCircle, Crown, Search, X, User, Wrench, Link2, Download, Star, Menu, Bell, UserCircle, Users, Home, ChevronLeft, ChevronRight } from 'lucide-react';
import { useSession, signOut } from 'next-auth/react';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState, useRef } from 'react';
import { useAppContext } from '@/context/AppContext';
import { getSignInUrl } from '@/lib/utils';

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

const NEW_LOGO_URL = 'https://i.ibb.co/Y7WKPY57/logo-nexor.png';

const Sidebar = ({ isCollapsed, onToggle }: SidebarProps) => {
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

      // Verificar vencimento VIP
      if (
        session.user.is_vip &&
        session.user.vencimento
      ) {
        let vencimentoDate: Date | null = null;

        // Tentar converter para Date de forma segura
        try {
          if (typeof session.user.vencimento === 'string' || typeof session.user.vencimento === 'number') {
            vencimentoDate = new Date(session.user.vencimento);
          } else if (session.user.vencimento && typeof session.user.vencimento === 'object' && 'getTime' in session.user.vencimento) {
            vencimentoDate = session.user.vencimento as Date;
          }

          if (vencimentoDate && !isNaN(vencimentoDate.getTime())) {
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
        } catch (error) {
          console.warn('Erro ao processar data de vencimento:', error);
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

  const navItems = [
    { href: '/', icon: Home, label: 'HOME', color: 'red' },
    { href: '/new', icon: CheckCircle, label: 'NOVIDADES', color: 'emerald' },
    { href: '/community', icon: Users, label: 'COMUNIDADE', color: 'purple' },
    { href: '/trending', icon: Star, label: 'TRENDING', color: 'orange' },
    { href: '/plans', icon: Crown, label: 'PLANOS VIP', color: 'yellow' },
  ];

  const toolItems = [
    { href: '/debridlink', icon: Link2, label: 'DEBRIDLINK', color: 'green' },
    { href: '/allavsoft', icon: Download, label: 'ALLAVSOFT', color: 'red' },
    { href: '/deemix', icon: Wrench, label: 'DEEMIX', color: 'purple' },
  ];

  const getColorClasses = (color: string, isHover: boolean = false) => {
    const colors = {
      red: isHover ? 'hover:text-red-400 hover:bg-red-500/10 hover:border-red-500/30 hover:shadow-red-500/20' : 'text-red-400',
      emerald: isHover ? 'hover:text-emerald-400 hover:bg-emerald-500/10 hover:border-emerald-500/30 hover:shadow-emerald-500/20' : 'text-emerald-400',
      purple: isHover ? 'hover:text-purple-400 hover:bg-purple-500/10 hover:border-purple-500/30 hover:shadow-purple-500/20' : 'text-purple-400',
      orange: isHover ? 'hover:text-orange-400 hover:bg-orange-500/10 hover:border-orange-500/30 hover:shadow-orange-500/20' : 'text-orange-400',
      yellow: isHover ? 'hover:text-yellow-400 hover:bg-yellow-500/10 hover:border-yellow-500/30 hover:shadow-yellow-500/20' : 'text-yellow-400',
      green: isHover ? 'hover:text-green-400 hover:bg-green-500/10 hover:border-green-500/30 hover:shadow-green-500/20' : 'text-green-400',
    };
    return colors[color as keyof typeof colors] || colors.red;
  };

  return (
    <>
      {/* Sidebar Desktop - SEMPRE ABERTO */}
      <div className="hidden lg:flex fixed left-0 top-0 h-full z-50 w-64">
        {/* Sidebar Background */}
        <div className="w-full h-full bg-gradient-to-b from-gray-900 via-gray-800 to-black border-r border-gray-700/50 shadow-2xl">
          {/* Header do Sidebar - SEM BOTÃO TOGGLE */}
          <div className="flex items-center justify-center p-4 border-b border-gray-700/50">
            <Link href="/" className="flex items-center">
              <Image
                src={NEW_LOGO_URL}
                alt="NextorDJ Logo"
                width={120}
                height={32}
                priority
                className="h-8 w-auto object-contain"
              />
            </Link>
          </div>

          {/* Navegação Principal - FONTE MENOR PARA SEMPRE VISÍVEL */}
          <nav className="flex-1 py-6 px-4 space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl font-semibold tracking-wide text-xs transition-all duration-300 hover:scale-105 border border-transparent hover:border-gray-600/30 ${getColorClasses(item.color, true)}`}
              >
                <item.icon className={`h-4 w-4 flex-shrink-0 ${getColorClasses(item.color)}`} />
                <span className="text-xs">{item.label}</span>
              </Link>
            ))}

            {/* Admin Link */}
            {Boolean((session?.user as any)?.isAdmin) && (
              <Link
                href="/admin/users"
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl font-semibold tracking-wide text-xs transition-all duration-300 hover:scale-105 border border-transparent hover:border-red-500/30 hover:text-red-400 hover:bg-red-500/10 hover:shadow-red-500/20"
              >
                <Crown className="h-4 w-4 text-red-400" />
                <span className="text-xs">ADMIN</span>
              </Link>
            )}

            {/* Separador */}
            <div className="border-t border-gray-700/50 my-4"></div>

            {/* Seção de Ferramentas */}
            <div className="px-3 mb-3">
              <h4 className="text-gray-400 text-xs uppercase tracking-wider font-bold">FERRAMENTAS</h4>
            </div>

            {toolItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl font-semibold tracking-wide text-xs transition-all duration-300 hover:scale-105 border border-transparent hover:border-gray-600/30 ${getColorClasses(item.color, true)}`}
              >
                <item.icon className={`h-4 w-4 flex-shrink-0 ${getColorClasses(item.color)}`} />
                <span className="text-xs">{item.label}</span>
              </Link>
            ))}
          </nav>

          {/* Footer do Sidebar */}
          <div className="p-4 border-t border-gray-700/50">
            {session?.user ? (
              <div className="space-y-3">
                {/* Notificações */}
                <div className="relative" ref={notificationsMenuRef}>
                  <button
                    className="relative w-full p-2.5 text-gray-300 hover:text-white hover:bg-gray-700/50 rounded-xl transition-all duration-200 flex items-center gap-3"
                    onClick={() => setShowNotifications((prev) => !prev)}
                  >
                    <Bell className="h-4 w-4" />
                    <span className="text-xs">Notificações</span>
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center font-bold">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </button>

                  {/* Menu de Notificações */}
                  {showNotifications && (
                    <div className="absolute bottom-full left-0 mb-2 w-80 bg-gray-900 border border-gray-700 rounded-xl shadow-2xl z-50 max-h-96 overflow-hidden">
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
                              className={`p-4 border-b border-gray-800 hover:bg-gray-800/50 cursor-pointer transition-colors ${!notification.read ? 'bg-blue-500/5 border-l-4 border-l-blue-500' : ''}`}
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

                {/* Perfil do Usuário */}
                <div className="relative" ref={profileMenuRef}>
                  <button
                    className="w-full p-2.5 text-gray-300 hover:text-white hover:bg-gray-700/50 rounded-xl transition-all duration-200 flex items-center gap-3"
                    onClick={() => setShowProfileMenu((prev) => !prev)}
                  >
                    <div className="relative">
                      <UserCircle className="h-4 w-4" />
                      {session.user.is_vip && (
                        <Crown className="h-2.5 w-2.5 text-yellow-400 absolute -top-1 -right-1 bg-gray-900 rounded-full p-0.5" />
                      )}
                    </div>
                    <div className="flex-1 text-left">
                      <div className="font-medium text-xs truncate">{session.user.name || 'Usuário'}</div>
                      <div className="text-xs text-gray-400 truncate">
                        {session.user.is_vip ? 'VIP' : 'Free'}
                      </div>
                    </div>
                  </button>

                  {/* Menu do Perfil */}
                  {showProfileMenu && (
                    <div className="absolute bottom-full left-0 mb-2 w-72 bg-gray-900 border border-gray-700 rounded-xl shadow-2xl z-50 p-4">
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
                            <div className="text-white font-semibold">
                              {typeof session.user.vencimento === 'string' || typeof session.user.vencimento === 'number'
                                ? formatDate(session.user.vencimento)
                                : 'Data inválida'
                              }
                            </div>
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
                          onClick={() => signOut({ callbackUrl: getSignInUrl() })}
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
              <Link
                href="/auth/sign-in"
                className="w-full px-4 py-2.5 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl font-semibold hover:from-red-700 hover:to-red-800 transition-all shadow-lg text-center text-xs"
              >
                Entrar na Conta
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Botão Mobile para abrir sidebar */}
      <button
        className="lg:hidden fixed top-4 left-4 z-50 p-3 bg-gray-900/90 backdrop-blur-sm border border-gray-700/50 rounded-xl text-white hover:bg-gray-800/90 transition-all duration-200"
        onClick={() => setMobileMenuOpen(true)}
      >
        <Menu className="h-6 w-6" />
      </button>

      {/* Sidebar Mobile */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          {/* Overlay */}
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Sidebar Mobile */}
          <div className="absolute left-0 top-0 h-full w-80 bg-gradient-to-b from-gray-900 via-gray-800 to-black border-r border-gray-700/50 shadow-2xl">
            {/* Header Mobile */}
            <div className="flex items-center justify-between p-4 border-b border-gray-700/50">
              <Link href="/" onClick={() => setMobileMenuOpen(false)}>
                <Image
                  src={NEW_LOGO_URL}
                  alt="NextorDJ Logo"
                  width={120}
                  height={32}
                  priority
                  className="h-8 w-auto object-contain"
                />
              </Link>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-700/50 transition-all duration-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Navegação Mobile */}
            <nav className="flex-1 py-4 px-4 space-y-1 overflow-y-auto">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl font-semibold tracking-wide text-sm transition-all duration-300 hover:scale-105 border border-transparent hover:border-gray-600/30 ${getColorClasses(item.color, true)}`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <item.icon className={`h-4 w-4 flex-shrink-0 ${getColorClasses(item.color)}`} />
                  <span className="text-sm">{item.label}</span>
                </Link>
              ))}

              {/* Admin Link Mobile */}
              {Boolean((session?.user as any)?.isAdmin) && (
                <Link
                  href="/admin/users"
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl font-semibold tracking-wide text-sm transition-all duration-300 hover:scale-105 border border-transparent hover:border-red-500/30 hover:text-red-400 hover:bg-red-500/10 hover:shadow-red-500/20"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Crown className="h-4 w-4 text-red-400" />
                  <span className="text-sm">ADMIN</span>
                </Link>
              )}

              {/* Separador Mobile */}
              <div className="border-t border-gray-700/50 my-4"></div>

              {/* Ferramentas Mobile */}
              <div className="mb-3">
                <h4 className="text-gray-400 text-xs uppercase tracking-wider font-bold mb-3">FERRAMENTAS</h4>
              </div>

              {toolItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl font-semibold tracking-wide text-sm transition-all duration-300 hover:scale-105 border border-transparent hover:border-gray-600/30 ${getColorClasses(item.color, true)}`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <item.icon className={`h-4 w-4 flex-shrink-0 ${getColorClasses(item.color)}`} />
                  <span className="text-sm">{item.label}</span>
                </Link>
              ))}
            </nav>

            {/* Footer Mobile */}
            <div className="p-4 border-t border-gray-700/50">
              {session?.user ? (
                <button
                  className="w-full py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl font-semibold tracking-wider hover:from-red-700 hover:to-red-800 transition-all duration-300 shadow-lg hover:shadow-red-500/30 hover:scale-105 border border-red-500/30 text-sm"
                  onClick={() => { setMobileMenuOpen(false); signOut({ callbackUrl: getSignInUrl() }); }}
                >
                  SAIR DA CONTA
                </button>
              ) : (
                <Link
                  href="/auth/sign-in"
                  className="w-full block py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white text-center rounded-xl font-semibold tracking-wider hover:from-blue-700 hover:to-blue-800 transition-all duration-300 shadow-lg hover:shadow-blue-500/30 hover:scale-105 border border-blue-500/30 text-sm"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  ENTRAR NA CONTA
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;
