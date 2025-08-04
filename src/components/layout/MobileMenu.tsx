"use client";

import { Bell, Home, LogOut, Music, Star, TrendingUp, X, Crown, Wrench, Disc, Link as LinkIcon, Download, User } from 'lucide-react';
import { signOut, useSession } from 'next-auth/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

interface MobileMenuProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function MobileMenu({ isOpen, onClose }: MobileMenuProps) {
    const pathname = usePathname();
    const { data: session, status } = useSession();
    const isSignedIn = status === 'authenticated';
    const [showTools, setShowTools] = useState(false);

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
        { href: '/plans', label: 'Planos', icon: Crown },
    ];

    const toolsItems = [
        { href: '/deemix', label: 'Deemix', icon: Disc },
        { href: '/debridlink', label: 'Debridlink', icon: LinkIcon },
        { href: '/allavsoft', label: 'Allavsoft', icon: Download },
    ];

    const handleLinkClick = () => {
        onClose();
    };

    if (!isOpen) return null;

    return (
        <>
            {/* Overlay */}
            <div
                className="fixed inset-0 bg-[#374151]/60 backdrop-blur-sm z-40 md:hidden"
                onClick={onClose}
            />

            {/* Menu */}
            <div className="fixed top-0 left-0 h-full w-80 bg-[#374151]/90 backdrop-blur-xl border-r border-gray-800/50 z-50 md:hidden transform transition-transform duration-300 flex flex-col">
                {/* Header do Menu */}
                <div className="flex items-center justify-between p-6 border-b border-gray-800/50">
                    <div className="flex items-center gap-3">
                        <img
                            src="https://i.ibb.co/Y7WKPY57/logo-nexor.png"
                            alt="Nextor Records"
                            className="h-8 w-auto"
                        />
                        <span className="text-white font-bold text-lg">DJ Pool</span>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-800/50 rounded-lg transition-colors"
                    >
                        <X className="w-6 h-6 text-white" />
                    </button>
                </div>

                {/* Info do Usuário no Topo */}
                {isSignedIn && (
                    <div className="p-4 border-b border-gray-800/50">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                                <span className="text-white font-bold">
                                    {session.user?.name?.[0]?.toUpperCase() || 'U'}
                                </span>
                            </div>
                            <div className="flex-1">
                                <h3 className="text-white font-medium">{session.user?.name}</h3>
                                <p className="text-gray-400 text-sm">{session.user?.email}</p>
                            </div>
                            {session.user?.is_vip && (
                                <div className="bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded text-xs font-bold">
                                    VIP
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Navegação Principal - Flexível */}
                <nav className="flex-1 p-4 overflow-y-auto">
                    <div className="space-y-2">
                        {menuItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = pathname === item.href;

                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    onClick={handleLinkClick}
                                    className={`flex items-center gap-3 p-3 rounded-lg transition-all duration-200 ${isActive
                                        ? 'bg-blue-600/20 text-blue-400 border border-blue-600/30'
                                        : 'text-gray-300 hover:bg-gray-800/50 hover:text-white'
                                        }`}
                                >
                                    <Icon className="w-5 h-5" />
                                    <span className="font-medium">{item.label}</span>
                                </Link>
                            );
                        })}

                        {/* Ferramentas - Expansível */}
                        <div className="mt-4">
                            <button
                                onClick={() => setShowTools(!showTools)}
                                className="w-full flex items-center justify-between gap-3 p-3 text-gray-300 hover:bg-gray-800/50 hover:text-white rounded-lg transition-all duration-200"
                            >
                                <div className="flex items-center gap-3">
                                    <Wrench className="w-5 h-5" />
                                    <span className="font-medium">Ferramentas</span>
                                </div>
                                <div className={`transform transition-transform duration-200 ${showTools ? 'rotate-90' : ''}`}>
                                    ▶
                                </div>
                            </button>

                            {showTools && (
                                <div className="ml-8 mt-2 space-y-1">
                                    {toolsItems.map((tool) => {
                                        const Icon = tool.icon;
                                        const isActive = pathname === tool.href;

                                        return (
                                            <Link
                                                key={tool.href}
                                                href={tool.href}
                                                onClick={handleLinkClick}
                                                className={`flex items-center gap-3 p-2 rounded-lg transition-all duration-200 ${isActive
                                                    ? 'bg-blue-600/20 text-blue-400'
                                                    : 'text-gray-400 hover:bg-gray-800/50 hover:text-white'
                                                    }`}
                                            >
                                                <Icon className="w-4 h-4" />
                                                <span className="text-sm font-medium">{tool.label}</span>
                                            </Link>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        {/* Link para Perfil se logado */}
                        {isSignedIn && (
                            <Link
                                href="/profile"
                                onClick={handleLinkClick}
                                className={`flex items-center gap-3 p-3 rounded-lg transition-colors mt-4 ${pathname === '/profile'
                                    ? 'bg-blue-600/20 text-blue-400'
                                    : 'text-gray-300 hover:bg-gray-800/50 hover:text-white'
                                    }`}
                            >
                                <User className="w-5 h-5" />
                                <span className="font-medium">Meu Perfil</span>
                            </Link>
                        )}
                    </div>
                </nav>

                {/* Seção Inferior - Fixa */}
                <div className="p-4 border-t border-gray-800/50">
                    {isSignedIn ? (
                        <button
                            onClick={() => signOut()}
                            className="w-full flex items-center gap-3 p-3 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg transition-colors"
                        >
                            <LogOut className="w-5 h-5" />
                            <span className="font-medium">Sair</span>
                        </button>
                    ) : (
                        <div className="space-y-2">
                            <Link
                                href="/auth/sign-in"
                                onClick={handleLinkClick}
                                className="w-full block text-center p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                            >
                                Entrar
                            </Link>
                            <Link
                                href="/auth/sign-up"
                                onClick={handleLinkClick}
                                className="w-full block text-center p-3 border border-gray-600 hover:bg-gray-800/50 text-gray-300 rounded-lg font-medium transition-colors"
                            >
                                Cadastrar
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
