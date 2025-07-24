"use client";

import { Bell, Home, LogOut, Music, Star, TrendingUp, X } from 'lucide-react';
import { signOut, useSession } from 'next-auth/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

interface MobileMenuProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function MobileMenu({ isOpen, onClose }: MobileMenuProps) {
    const pathname = usePathname();
    const { data: session, status } = useSession();
    const isSignedIn = status === 'authenticated';

    // Fechar menu ao clicar fora
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }

        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    const menuItems = [
        { href: '/new', label: 'Novas', icon: Home },
        { href: '/featured', label: 'Destaque', icon: Star },
        { href: '/trending', label: 'Em Alta', icon: TrendingUp },
        { href: '/charts', label: 'Charts', icon: Music },
    ];

    const handleLinkClick = () => {
        onClose();
    };

    if (!isOpen) return null;

    return (
        <>
            {/* Overlay */}
            <div
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
                onClick={onClose}
            />

            {/* Menu */}
            <div className="fixed top-0 left-0 h-full w-80 bg-black/90 backdrop-blur-xl border-r border-gray-800/50 z-50 md:hidden transform transition-transform duration-300">
                {/* Header do Menu */}
                <div className="flex items-center justify-between p-6 border-b border-gray-800/50">
                    <div className="flex items-center gap-3">
                        <img
                            src="https://i.ibb.co/Y7WKPY57/logo-nexor.png"
                            alt="Nextor Records"
                            className="h-8 w-auto"
                        />
                        <span className="text-white font-sans font-bold text-lg tracking-wide">DJ Pool</span>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-800/50 rounded-lg transition-colors"
                    >
                        <X className="w-6 h-6 text-white" />
                    </button>
                </div>

                {/* Navegação Principal */}
                <nav className="p-6">
                    <div className="space-y-3">
                        {menuItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = pathname === item.href;

                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    onClick={handleLinkClick}
                                    className={`flex items-center gap-4 p-4 rounded-xl transition-all duration-200 ${isActive
                                        ? 'bg-blue-600/20 text-blue-400 border border-blue-600/30'
                                        : 'text-gray-300 hover:bg-gray-800/50 hover:text-white'
                                        }`}
                                >
                                    <Icon className="w-6 h-6" />
                                    <span className="font-sans font-medium text-lg tracking-wide">{item.label}</span>
                                </Link>
                            );
                        })}
                    </div>
                </nav>

                {/* Seção do Usuário */}
                {isSignedIn && (
                    <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-gray-800/50">
                        {/* Informações do Usuário */}
                        <div className="mb-4 p-4 bg-black/30 rounded-xl">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                                    <span className="text-white font-bold text-lg">
                                        {session.user?.name?.[0]?.toUpperCase() || 'U'}
                                    </span>
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-white font-sans font-medium text-lg tracking-wide">{session.user?.name}</h3>
                                    <p className="text-gray-400 text-sm font-sans">{session.user?.email}</p>
                                </div>
                            </div>

                            {/* Status VIP */}
                            {session.user?.is_vip && (
                                <div className="flex items-center gap-2 mb-3">
                                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                    <span className="text-green-400 text-sm font-sans font-medium tracking-wide">VIP ATIVO</span>
                                </div>
                            )}
                        </div>

                        {/* Links do Usuário */}
                        <div className="space-y-2 mb-4">
                            <Link
                                href="/profile"
                                onClick={handleLinkClick}
                                className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${pathname === '/profile'
                                    ? 'bg-blue-600/20 text-blue-400'
                                    : 'text-gray-300 hover:bg-gray-800/50 hover:text-white'
                                    }`}
                            >
                                <Bell className="w-5 h-5" />
                                <span className="font-sans tracking-wide">Perfil</span>
                            </Link>

                            {!session.user?.is_vip && (
                                <Link
                                    href="/pro"
                                    onClick={handleLinkClick}
                                    className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${pathname === '/pro'
                                        ? 'bg-blue-600/20 text-blue-400'
                                        : 'text-gray-300 hover:bg-gray-800/50 hover:text-white'
                                        }`}
                                >
                                    <Star className="w-5 h-5" />
                                    <span className="font-sans tracking-wide">Upgrade Pro</span>
                                </Link>
                            )}
                        </div>

                        {/* Logout */}
                        <button
                            onClick={() => signOut()}
                            className="w-full flex items-center gap-3 p-3 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg transition-colors"
                        >
                            <LogOut className="w-5 h-5" />
                            <span className="font-sans tracking-wide">Sair</span>
                        </button>
                    </div>
                )}

                {/* Se não estiver logado */}
                {!isSignedIn && (
                    <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-gray-800/50">
                        <div className="space-y-3">
                            <Link
                                href="/auth/sign-in"
                                onClick={handleLinkClick}
                                className="w-full block text-center p-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-sans font-medium transition-colors tracking-wide"
                            >
                                Entrar
                            </Link>
                            <Link
                                href="/auth/sign-up"
                                onClick={handleLinkClick}
                                className="w-full block text-center p-4 border border-gray-600 hover:bg-gray-800/50 text-gray-300 rounded-xl font-sans font-medium transition-colors tracking-wide"
                            >
                                Cadastrar
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}
