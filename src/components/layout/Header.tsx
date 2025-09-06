"use client";

import React, { useState, useRef, useEffect } from 'react';
import { useSession, signOut, signIn } from 'next-auth/react';
import { User, ChevronDown, LogOut, Settings, X, Mail, Lock, Phone, Crown, Calendar, CreditCard, ListMusic } from 'lucide-react';
import Link from 'next/link';

export default function Header() {
  const { data: session, status } = useSession();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showUserInfoModal, setShowUserInfoModal] = useState(false);
  const [showHomeSubmenu, setShowHomeSubmenu] = useState(false);
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [isLoading, setIsLoading] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const homeSubmenuRef = useRef<HTMLDivElement>(null);

  // Close menus when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
      if (homeSubmenuRef.current && !homeSubmenuRef.current.contains(event.target as Node)) {
        setShowHomeSubmenu(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/' });
    setShowProfileMenu(false);
  };

  const formatDate = (dateString: string | Date): string => {
    if (!dateString) return 'Não informado';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Data inválida';
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await signIn('credentials', {
        email: loginForm.email,
        password: loginForm.password,
        redirect: false,
      });

      if (result?.error) {
        alert('Erro no login: Email ou senha incorretos');
      } else {
        setShowLoginModal(false);
        setLoginForm({ email: '', password: '' });
      }
    } catch (error) {
      alert('Erro no login. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  if (status === "loading") {
    return (
      <nav className="fixed top-0 left-0 right-0 z-50 bg-black border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-8">
              <img
                src="https://i.ibb.co/Y7WKPY57/logo-nexor.png"
                alt="Nexor Records"
                className="h-8 sm:h-10 w-auto"
              />
              <div className="hidden md:flex items-center space-x-6">
                <div className="w-16 h-4 bg-gray-700 rounded animate-pulse"></div>
                <div className="w-12 h-4 bg-gray-700 rounded animate-pulse"></div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="w-6 h-6 bg-gray-700 rounded border"></div>
              <div className="w-20 h-4 bg-gray-700 rounded animate-pulse"></div>
              <div className="w-24 h-8 bg-gray-700 rounded animate-pulse"></div>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <>
      {/* Navigation Bar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-black border-b-2 border-gradient-to-r from-purple-600 via-blue-600 to-purple-600 shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Left Side - Logo and Navigation */}
            <div className="flex items-center space-x-8">
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl blur-xl opacity-0 group-hover:opacity-80 transition-opacity duration-500"></div>
                <div className="relative bg-gray-900 rounded-xl p-2 border border-gray-700 group-hover:border-purple-500 transition-all duration-300">
                  <img
                    src="https://i.ibb.co/Y7WKPY57/logo-nexor.png"
                    alt="Nexor Records"
                    className="h-10 sm:h-12 w-auto transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
              </div>

              {/* Navigation Items */}
              <div className="hidden md:flex items-center space-x-4">
                <Link href="/" className="relative px-4 py-2 rounded-lg bg-gray-900 border border-emerald-600 hover:border-emerald-400 hover:bg-emerald-600 text-emerald-300 hover:text-white transition-all duration-300 group shadow-lg hover:shadow-emerald-500/25">
                  <span className="font-semibold text-sm tracking-wide group-hover:tracking-wider transition-all duration-300">HOME</span>
                </Link>

                <div className="relative" ref={homeSubmenuRef}>
                  <button
                    onClick={() => setShowHomeSubmenu(!showHomeSubmenu)}
                    className="relative px-4 py-2 rounded-lg bg-gray-900 border border-purple-600 hover:border-purple-400 hover:bg-purple-600 text-purple-300 hover:text-white transition-all duration-300 group shadow-lg hover:shadow-purple-500/25 flex items-center space-x-2"
                  >
                    <span className="font-semibold text-sm tracking-wide group-hover:tracking-wider transition-all duration-300">MÚSICA</span>
                    <ChevronDown className="w-3 h-3 group-hover:rotate-180 transition-transform duration-300" />
                  </button>

                  {/* Music Submenu */}
                  {showHomeSubmenu && (
                    <div className="absolute top-full left-0 mt-2 w-64 bg-black rounded-2xl shadow-2xl border-2 border-purple-600 py-4 z-50">
                      <div className="space-y-1">
                        <Link
                          href="/new-releases"
                          className="block px-6 py-3 text-sm text-gray-300 hover:text-white hover:bg-emerald-600 hover:border-l-4 hover:border-emerald-400 transition-all duration-300 group font-semibold"
                          onClick={() => setShowHomeSubmenu(false)}
                        >
                          <span className="group-hover:tracking-wide transition-all duration-300">NEW RELEASES</span>
                        </Link>
                        <Link
                          href="/most-popular"
                          className="block px-6 py-3 text-sm text-gray-300 hover:text-white hover:bg-orange-600 hover:border-l-4 hover:border-orange-400 transition-all duration-300 group font-semibold"
                          onClick={() => setShowHomeSubmenu(false)}
                        >
                          <span className="group-hover:tracking-wide transition-all duration-300">MOST POPULAR</span>
                        </Link>
                        <Link
                          href="exclusives"
                          className="block px-6 py-3 text-sm text-gray-300 hover:text-white hover:bg-purple-600 hover:border-l-4 hover:border-purple-400 transition-all duration-300 group font-semibold"
                          onClick={() => setShowHomeSubmenu(false)}
                        >
                          <span className="group-hover:tracking-wide transition-all duration-300">EXCLUSIVES</span>
                        </Link>
                        <Link
                          href="/playlists"
                          className="block px-6 py-3 text-sm text-gray-300 hover:text-white hover:bg-blue-600 hover:border-l-4 hover:border-blue-400 transition-all duration-300 group font-semibold"
                          onClick={() => setShowHomeSubmenu(false)}
                        >
                          <span className="group-hover:tracking-wide transition-all duration-300">PLAYLISTS</span>
                        </Link>
                        <Link
                          href="/genres"
                          className="block px-6 py-3 text-sm text-gray-300 hover:text-white hover:bg-blue-600 hover:border-l-4 hover:border-blue-400 transition-all duration-300 group font-semibold"
                          onClick={() => setShowHomeSubmenu(false)}
                        >
                          <span className="group-hover:tracking-wide transition-all duration-300">GÊNEROS</span>
                        </Link>
                      </div>
                    </div>
                  )}
                </div>

                <Link href="/record_label" className="relative px-4 py-2 rounded-lg bg-gray-900 border border-blue-600 hover:border-blue-400 hover:bg-blue-600 text-blue-300 hover:text-white transition-all duration-300 group shadow-lg hover:shadow-blue-500/25">
                  <span className="font-semibold text-sm tracking-wide group-hover:tracking-wider transition-all duration-300">LABEL</span>
                </Link>

                <button className="relative px-4 py-2 rounded-lg bg-gray-900 border border-orange-600 hover:border-orange-400 hover:bg-orange-600 text-orange-300 hover:text-white transition-all duration-300 group shadow-lg hover:shadow-orange-500/25">
                  <span className="font-semibold text-sm tracking-wide group-hover:tracking-wider transition-all duration-300">MAIS</span>
                </button>
              </div>
            </div>


            {/* Right Side - User, Join */}
            <div className="flex items-center space-x-6">

              {session?.user ? (
                // User is logged in - show user info and dropdown
                <div className="relative" ref={profileMenuRef}>
                  <button
                    onClick={() => setShowProfileMenu(!showProfileMenu)}
                    className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-gray-900 border border-gray-700 hover:border-purple-500 hover:bg-purple-600 text-gray-300 hover:text-white transition-all duration-300 group shadow-lg hover:shadow-purple-500/25"
                  >
                    <User className="w-4 h-4" />
                    <span className="hidden sm:inline font-semibold text-sm">{session.user.name || 'Usuário'}</span>
                    <ChevronDown className="w-3 h-3 group-hover:rotate-180 transition-transform duration-300" />
                  </button>

                  {/* Profile Dropdown Menu */}
                  {showProfileMenu && (
                    <div className="absolute right-0 mt-2 w-64 bg-black rounded-2xl shadow-2xl border-2 border-purple-600 py-4 z-50">
                      <div className="px-6 py-3 border-b border-gray-700">
                        <p className="text-sm text-gray-300 font-medium">{(session.user as any)?.whatsapp || 'WhatsApp não informado'}</p>
                      </div>

                      <div className="space-y-1">
                        <button
                          onClick={() => {
                            setShowUserInfoModal(true);
                            setShowProfileMenu(false);
                          }}
                          className="w-full text-left px-6 py-3 text-sm text-gray-300 hover:text-white hover:bg-purple-600 hover:border-l-4 hover:border-purple-400 transition-all duration-300 group font-semibold"
                        >
                          <CreditCard className="w-4 h-4 inline mr-3" />
                          <span className="group-hover:tracking-wide transition-all duration-300">Informações da Conta</span>
                        </button>

                        <a
                          href="/profile"
                          className="block px-6 py-3 text-sm text-gray-300 hover:text-white hover:bg-blue-600 hover:border-l-4 hover:border-blue-400 transition-all duration-300 group font-semibold"
                          onClick={() => setShowProfileMenu(false)}
                        >
                          <Settings className="w-4 h-4 inline mr-3" />
                          <span className="group-hover:tracking-wide transition-all duration-300">Your Account</span>
                        </a>

                        <a
                          href="/library"
                          className="block px-6 py-3 text-sm text-gray-300 hover:text-white hover:bg-emerald-600 hover:border-l-4 hover:border-emerald-400 transition-all duration-300 group font-semibold"
                          onClick={() => setShowProfileMenu(false)}
                        >
                          <ListMusic className="w-4 h-4 inline mr-3" />
                          <span className="group-hover:tracking-wide transition-all duration-300">Biblioteca</span>
                        </a>

                        <button
                          onClick={handleLogout}
                          className="w-full text-left px-6 py-3 text-sm text-gray-300 hover:text-white hover:bg-red-600 hover:border-l-4 hover:border-red-400 transition-all duration-300 group font-semibold"
                        >
                          <LogOut className="w-4 h-4 inline mr-3" />
                          <span className="group-hover:tracking-wide transition-all duration-300">Logout</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                // User is not logged in - show JOIN NOW button
                <button
                  onClick={() => setShowLoginModal(true)}
                  className="px-6 py-2 rounded-lg bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold transition-all duration-300 shadow-lg hover:shadow-red-500/25 border border-red-500/30 hover:border-red-400/50"
                >
                  <span className="text-sm tracking-wide">JOIN NOW</span>
                </button>
              )}
            </div>
          </div>
        </div>

      </nav>

      {/* Login Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-[9999] p-4 backdrop-blur-sm">
          <div className="bg-black rounded-2xl shadow-2xl w-full max-w-md border-2 border-purple-600">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b-2 border-purple-600">
              <h2 className="text-xl font-bold text-white bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">Entrar na Conta</h2>
              <button
                onClick={() => setShowLoginModal(false)}
                className="text-gray-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-gray-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleLogin} className="p-6 space-y-4">
              {/* Email Field */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="email"
                    required
                    value={loginForm.email}
                    onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 bg-gray-900 border-2 border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 transition-all duration-300"
                    placeholder="seu@email.com"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Senha
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="password"
                    required
                    value={loginForm.password}
                    onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 bg-gray-900 border-2 border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 transition-all duration-300"
                    placeholder="Sua senha"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:bg-gray-600 text-white font-bold py-3 px-4 rounded-lg transition-all duration-300 flex items-center justify-center shadow-lg hover:shadow-purple-500/25 border border-purple-500/30"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                    Entrando...
                  </>
                ) : (
                  'Entrar'
                )}
              </button>

              {/* Additional Info */}
              <div className="text-center">
                <p className="text-sm text-gray-400">
                  Não tem uma conta?{' '}
                  <a href="/plans" className="text-red-500 hover:text-red-400 transition-colors">
                    Ver planos disponíveis
                  </a>
                </p>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* User Info Modal */}
      {showUserInfoModal && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-[9999] p-4 backdrop-blur-sm">
          <div className="bg-black rounded-2xl shadow-2xl w-full max-w-lg border-2 border-purple-600">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b-2 border-purple-600">
              <h2 className="text-xl font-bold text-white flex items-center">
                <Crown className="w-6 h-6 text-yellow-500 mr-3" />
                <span className="bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">Informações da Conta</span>
              </h2>
              <button
                onClick={() => setShowUserInfoModal(false)}
                className="text-gray-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-gray-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">
              {/* User Info Cards */}
              <div className="grid gap-4">
                {/* WhatsApp Card */}
                <div className="bg-gray-900 rounded-xl p-4 border-2 border-green-600 hover:border-green-400 transition-all duration-300 group">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                      <Phone className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-400 font-medium">WhatsApp</p>
                      <p className="text-white font-bold text-lg">{(session?.user as any)?.whatsapp || 'Não informado'}</p>
                    </div>
                  </div>
                </div>

                {/* Plan Card */}
                <div className="bg-gray-900 rounded-xl p-4 border-2 border-yellow-600 hover:border-yellow-400 transition-all duration-300 group">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                      <Crown className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-400 font-medium">Plano Atual</p>
                      <p className="text-yellow-300 font-bold text-lg">
                        {(session?.user as any)?.planName ||
                          ((session?.user as any)?.is_vip ? 'VIP' : 'FREE')}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Next Payment Card */}
                <div className="bg-gray-900 rounded-xl p-4 border-2 border-purple-600 hover:border-purple-400 transition-all duration-300 group">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                      <Calendar className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-400 font-medium">Próximo Vencimento</p>
                      <p className="text-white font-bold text-lg">
                        {(session?.user as any)?.vencimento ?
                          formatDate((session?.user as any).vencimento) :
                          'Não informado'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Status Badge */}
              <div className="text-center">
                <div className="inline-flex items-center px-6 py-3 bg-gray-900 text-green-300 rounded-xl border-2 border-green-600 shadow-lg">
                  <div className="w-3 h-3 bg-green-500 rounded-full mr-3 animate-pulse shadow-lg"></div>
                  <span className="font-bold text-lg">Conta Ativa</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-4">
                <button
                  onClick={() => setShowUserInfoModal(false)}
                  className="flex-1 bg-gray-900 hover:bg-gray-700 text-white font-bold py-3 px-4 rounded-xl transition-all duration-300 border-2 border-gray-700 hover:border-gray-500 shadow-lg"
                >
                  <span className="text-sm tracking-wide">Fechar</span>
                </button>
                <a
                  href="/plans"
                  className="flex-1 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold py-3 px-4 rounded-xl transition-all duration-300 text-center shadow-lg hover:shadow-red-500/25 border-2 border-red-500/30 hover:border-red-400/50"
                >
                  <span className="text-sm tracking-wide">Gerenciar Plano</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}