// Header.tsx
"use client";

import MobileMenu from '@/components/layout/MobileMenu';
import { Bell, Filter, Menu, Search, User, X } from 'lucide-react';
import { signOut, useSession } from 'next-auth/react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface HeaderProps {
  // Props para pesquisa e filtros (opcionais)
  showSearchAndFilters?: boolean;
  searchQuery?: string;
  onSearchChange?: (value: string) => void;
  onSearchSubmit?: () => void;
  onFiltersClick?: () => void;
  hasActiveFilters?: boolean;
}

export default function Header({
  showSearchAndFilters = false,
  searchQuery = '',
  onSearchChange,
  onSearchSubmit,
  onFiltersClick,
  hasActiveFilters = false
}: HeaderProps) {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const isSignedIn = status === 'authenticated';
  const [showNotification, setShowNotification] = useState(false);
  const [daysUntilExpiry, setDaysUntilExpiry] = useState<number | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const router = useRouter();

  // Verificar vencimento do usuário
  useEffect(() => {
    console.log('🔔 Verificando vencimento:', session?.user?.vencimento);
    console.log('🔔 User VIP:', session?.user?.is_vip);
    console.log('🔔 Session completa:', session?.user);

    if (session?.user?.is_vip) {
      if (session?.user?.vencimento) {
        const expiryDate = new Date(session.user.vencimento);
        const today = new Date();
        const diffTime = expiryDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        console.log(`⏰ Data de hoje: ${today.toISOString()}`);
        console.log(`⏰ Data de vencimento: ${expiryDate.toISOString()}`);
        console.log(`⏰ Dias até vencimento: ${diffDays}`);
        setDaysUntilExpiry(diffDays);
      } else {
        console.log('🔔 VIP sem data de vencimento definida');
        setDaysUntilExpiry(999); // Valor alto para indicar sem vencimento
      }
    } else {
      console.log('🔔 Usuário não é VIP');
      setDaysUntilExpiry(null);
    }
  }, [session?.user?.vencimento, session?.user?.is_vip, session]);

  const navLinks = [
    { href: '/new', label: 'New' },
    { href: '/featured', label: 'Featured' },
    { href: '/trending', label: 'Trending' },
    { href: '/charts', label: 'Charts' },
  ];

  return (
    <>
      <header className="w-full p-4 flex justify-between items-center border-b border-gray-700/50 sticky top-0 z-30 bg-black/20 backdrop-blur-md" style={{ color: 'var(--foreground)' }}>
        <div className="flex items-center gap-6">
          {/* Logo */}
          <Link href="/new" className="flex items-center">
            <img
              src="https://i.ibb.co/Y7WKPY57/logo-nexor.png"
              alt="Nextor Records"
              className="h-8 w-auto"
            />
          </Link>

          {/* Navegação ao lado da logo - desktop */}
          <nav className="hidden md:flex items-center space-x-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`font-light font-semibold transition-colors pb-2 tracking-wide text-sm ${pathname === link.href
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-400 hover:text-blue-500'
                  }`}
              >
                {link.label}
              </Link>
            ))}
            {/* Link de Perfil para usuários logados */}
            {isSignedIn && (
              <Link href="/profile-manager" className={`font-sans font-semibold transition-colors pb-2 tracking-wide ${pathname === '/profile-manager'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-400 hover:text-blue-500'
                }`}>
                Meu Perfil
              </Link>
            )}
          </nav>

          {/* Barra de Pesquisa e Filtros - quando habilitada */}
          {showSearchAndFilters && (
            <div className="hidden lg:flex items-center space-x-3 ml-8">
              {/* Campo de Pesquisa */}
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => onSearchChange?.(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && onSearchSubmit?.()}
                  placeholder="Buscar músicas..."
                  className="w-64 px-3 py-2 pl-9 border rounded-lg text-white text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  style={{
                    backgroundColor: '#1a1a1a',
                    borderColor: '#3a3a3a'
                  }}
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                {searchQuery && (
                  <button
                    onClick={() => onSearchChange?.('')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
              </div>

              {/* Botão de Filtros */}
              <button
                onClick={onFiltersClick}
                className={`p-2 rounded-lg transition-colors ${hasActiveFilters
                  ? 'bg-blue-600/20 text-blue-400 border border-blue-600/30'
                  : 'bg-gray-800/50 text-gray-400 hover:text-white hover:bg-gray-700/50'
                  }`}
                title="Filtros"
              >
                <Filter className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>

        <div className="flex items-center gap-4">
          {/* Botão do Menu Mobile */}
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="md:hidden p-2 hover:bg-gray-800/50 rounded-lg transition-colors"
          >
            <Menu className="w-6 h-6 text-white" />
          </button>

          {/* Sininho de notificação para usuários VIP - SEMPRE VISÍVEL */}
          {isSignedIn && session?.user?.is_vip && (
            <div className="relative">
              <button
                onClick={() => setShowNotification(!showNotification)}
                className={`flex items-center justify-center w-8 h-8 rounded-full transition-colors relative text-white shadow-lg ${daysUntilExpiry === null || daysUntilExpiry === 999
                  ? 'bg-gray-600 hover:bg-gray-700' // Sem data de vencimento
                  : daysUntilExpiry <= 0
                    ? 'bg-red-600 hover:bg-red-700' // Vencido
                    : daysUntilExpiry <= 3
                      ? 'bg-red-500 hover:bg-red-600' // Crítico (0-3 dias)
                      : daysUntilExpiry <= 7
                        ? 'bg-yellow-500 hover:bg-yellow-600' // Alerta (4-7 dias)
                        : daysUntilExpiry <= 30
                          ? 'bg-green-500 hover:bg-green-600' // OK (8-30 dias)
                          : 'bg-blue-500 hover:bg-blue-600' // Muito longe (30+ dias)
                  }`}
                title={
                  daysUntilExpiry === null || daysUntilExpiry === 999
                    ? 'Plano VIP ativo - sem data de vencimento'
                    : daysUntilExpiry <= 0
                      ? '🚨 Plano vencido!'
                      : daysUntilExpiry <= 3
                        ? `🚨 CRÍTICO: Plano vence em ${daysUntilExpiry} ${daysUntilExpiry === 1 ? 'dia' : 'dias'}!`
                        : daysUntilExpiry <= 7
                          ? `⚠️ ATENÇÃO: Plano vence em ${daysUntilExpiry} dias`
                          : daysUntilExpiry <= 30
                            ? `✅ Plano OK - vence em ${daysUntilExpiry} dias`
                            : `✅ Plano em dia - vence em ${daysUntilExpiry} dias`
                }
              >
                <Bell size={16} />
                {/* Ponto de alerta para situações críticas */}
                {daysUntilExpiry !== null && daysUntilExpiry !== 999 && daysUntilExpiry <= 7 && (
                  <span className={`absolute -top-1 -right-1 w-3 h-3 rounded-full animate-pulse ${daysUntilExpiry <= 0
                    ? 'bg-white' // Vencido - ponto branco
                    : daysUntilExpiry <= 3
                      ? 'bg-white' // Crítico - ponto branco
                      : 'bg-red-500' // Alerta - ponto vermelho
                    }`}></span>
                )}
              </button>

              {/* Popup de informações */}
              {showNotification && (
                <div className="absolute right-0 top-10 bg-gray-800 border border-gray-600 rounded-lg p-4 w-72 shadow-xl z-50">
                  {daysUntilExpiry === null || daysUntilExpiry === 999 ? (
                    <>
                      <p className="text-sm text-blue-400 font-medium">
                        ✅ Plano VIP Ativo
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        Sem data de vencimento definida. Aproveite todos os benefícios!
                      </p>
                    </>
                  ) : daysUntilExpiry <= 0 ? (
                    <>
                      <p className="text-sm text-red-400 font-medium">
                        🚨 SEU PLANO VENCEU!
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        Renove agora para continuar aproveitando os benefícios VIP.
                      </p>
                      <div className="mt-2 p-2 bg-red-900/30 rounded text-xs text-red-300">
                        ⚠️ Acesso aos downloads pode estar limitado
                      </div>
                    </>
                  ) : daysUntilExpiry <= 3 ? (
                    <>
                      <p className="text-sm text-red-400 font-medium">
                        🚨 RENOVAÇÃO URGENTE!
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        Seu plano vence em {daysUntilExpiry} {daysUntilExpiry === 1 ? 'dia' : 'dias'}!
                      </p>
                      <div className="mt-2 p-2 bg-red-900/30 rounded text-xs text-red-300">
                        🔥 Renove hoje para evitar interrupção
                      </div>
                    </>
                  ) : daysUntilExpiry <= 7 ? (
                    <>
                      <p className="text-sm text-yellow-400 font-medium">
                        ⚠️ ATENÇÃO: Vencimento próximo
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        Seu plano vence em {daysUntilExpiry} dias
                      </p>
                      <div className="mt-2 p-2 bg-yellow-900/30 rounded text-xs text-yellow-300">
                        💡 Considere renovar em breve
                      </div>
                    </>
                  ) : daysUntilExpiry <= 30 ? (
                    <>
                      <p className="text-sm text-green-400 font-medium">
                        ✅ Plano em dia!
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        Vence em {daysUntilExpiry} dias. Tudo funcionando perfeitamente!
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="text-sm text-blue-400 font-medium">
                        💎 Plano Premium
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        Vence em {daysUntilExpiry} dias. Aproveite todos os benefícios!
                      </p>
                    </>
                  )}

                  <button
                    onClick={() => setShowNotification(false)}
                    className="text-xs text-blue-400 hover:text-blue-300 mt-3 underline"
                  >
                    Fechar
                  </button>
                </div>
              )}
            </div>
          )}

          {isSignedIn ? (
            <div className="relative">
              <button
                onClick={() => setShowUserMenu((v) => !v)}
                className="flex items-center gap-2 font-sans font-semibold px-3 py-2 rounded-full transition-colors text-gray-300 hover:text-white hover:bg-gray-800/80 tracking-wide bg-gray-900"
                title="Menu do usuário"
              >
                <User size={20} />
              </button>
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-40 bg-[#18181b] border border-gray-700 rounded-xl shadow-lg z-50">
                  <button
                    onClick={() => { setShowUserMenu(false); router.push('/profile'); }}
                    className="w-full text-left px-4 py-3 text-gray-200 hover:bg-gray-800 hover:text-white rounded-t-xl transition-colors"
                  >
                    Perfil
                  </button>
                  <button
                    onClick={() => { setShowUserMenu(false); signOut({ callbackUrl: '/auth/sign-in' }); }}
                    className="w-full text-left px-4 py-3 text-gray-200 hover:bg-red-600/60 hover:text-white rounded-b-xl transition-colors"
                  >
                    Sair
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link href="/auth/sign-in">
                <button className="font-sans font-semibold px-3 py-2 rounded-md transition-colors text-gray-400 hover:text-white tracking-wide">
                  Entrar
                </button>
              </Link>
              <Link href="/auth/sign-up">
                <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors text-sm font-sans font-medium tracking-wide">
                  Cadastrar
                </button>
              </Link>
            </>
          )}
        </div>
      </header>

      {/* Menu Mobile */}
      <MobileMenu
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      />
    </>
  );
}