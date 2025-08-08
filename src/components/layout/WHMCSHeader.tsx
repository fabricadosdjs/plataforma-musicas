// src/components/layout/WHMCSHeader.tsx
"use client";

import { useSession, signOut } from "next-auth/react";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
    User,
    Bell,
    Search,
    Menu,
    ChevronDown,
    LogOut,
    Settings,
    Crown,
    X,
    Home,
    Mail,
    Shield
} from "lucide-react";

const WHMCSHeader = () => {
    const { data: session } = useSession();
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [showMobileMenu, setShowMobileMenu] = useState(false);

    return (
        <header className="whmcs-header">
            <div className="whmcs-container">
                {/* Logo Section */}
                <div className="whmcs-header-brand">
                    <Link href="/" className="whmcs-brand-link">
                        <Image
                            src="https://i.ibb.co/Y7WKPY57/logo-nexor.png"
                            alt="Nexor Records"
                            width={180}
                            height={45}
                            className="h-10 w-auto"
                        />
                    </Link>
                </div>

                {/* Desktop Navigation */}
                <nav className="whmcs-nav-desktop">
                    <Link href="/" className="whmcs-nav-item">
                        <Home className="h-4 w-4" />
                        Início
                    </Link>
                    <Link href="/profile" className="whmcs-nav-item active">
                        <User className="h-4 w-4" />
                        Minha Conta
                    </Link>
                    <Link href="/plans" className="whmcs-nav-item">
                        <Crown className="h-4 w-4" />
                        Planos VIP
                    </Link>
                    <Link href="/community" className="whmcs-nav-item">
                        <Mail className="h-4 w-4" />
                        Comunidade
                    </Link>
                </nav>

                {/* User Menu */}
                <div className="whmcs-header-actions">
                    {session?.user ? (
                        <>
                            {/* Notifications */}
                            <button className="whmcs-icon-btn">
                                <Bell className="h-5 w-5" />
                                <span className="whmcs-badge">3</span>
                            </button>

                            {/* User Dropdown */}
                            <div className="whmcs-user-menu">
                                <button
                                    onClick={() => setShowUserMenu(!showUserMenu)}
                                    className="whmcs-user-btn"
                                >
                                    <div className="whmcs-user-avatar">
                                        <User className="h-5 w-5" />
                                    </div>
                                    <div className="whmcs-user-info">
                                        <span className="whmcs-user-name">
                                            {session.user.name || 'Usuário'}
                                        </span>
                                        <span className="whmcs-user-role">
                                            {session.user.is_vip ? 'VIP Member' : 'Free User'}
                                        </span>
                                    </div>
                                    <ChevronDown className="h-4 w-4" />
                                </button>

                                {showUserMenu && (
                                    <div className="whmcs-dropdown">
                                        <Link href="/profile" className="whmcs-dropdown-item">
                                            <User className="h-4 w-4" />
                                            Meu Perfil
                                        </Link>
                                        <Link href="/profile/dados" className="whmcs-dropdown-item">
                                            <Settings className="h-4 w-4" />
                                            Configurações
                                        </Link>
                                        <hr className="whmcs-dropdown-divider" />
                                        <button
                                            onClick={() => signOut()}
                                            className="whmcs-dropdown-item text-red-600"
                                        >
                                            <LogOut className="h-4 w-4" />
                                            Sair
                                        </button>
                                    </div>
                                )}
                            </div>
                        </>
                    ) : (
                        <Link href="/auth/sign-in" className="whmcs-btn-primary">
                            Fazer Login
                        </Link>
                    )}

                    {/* Mobile Menu Button */}
                    <button
                        onClick={() => setShowMobileMenu(!showMobileMenu)}
                        className="whmcs-mobile-btn"
                    >
                        <Menu className="h-6 w-6" />
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            {showMobileMenu && (
                <div className="whmcs-mobile-menu">
                    <div className="whmcs-mobile-header">
                        <h3>Menu</h3>
                        <button onClick={() => setShowMobileMenu(false)}>
                            <X className="h-6 w-6" />
                        </button>
                    </div>
                    <nav className="whmcs-mobile-nav">
                        <Link href="/" className="whmcs-mobile-item">Início</Link>
                        <Link href="/profile" className="whmcs-mobile-item active">Minha Conta</Link>
                        <Link href="/plans" className="whmcs-mobile-item">Planos VIP</Link>
                        <Link href="/community" className="whmcs-mobile-item">Comunidade</Link>
                    </nav>
                </div>
            )}
        </header>
    );
};

export default WHMCSHeader;

