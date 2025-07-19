// src/app/admin/page.tsx
"use client";

import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useUser, UserButton, SignedIn, SignedOut, SignInButton, SignUpButton, ClerkLoaded, ClerkLoading } from '@clerk/nextjs';
import { Music, Search, Instagram, Twitter, Facebook, LayoutDashboard, PlusCircle } from 'lucide-react';

// --- Componentes ---
// Para garantir a consistência e evitar erros de importação,
// o Header e o Footer estão definidos aqui.

const Header = React.memo(function Header() {
    const pathname = usePathname();
    const navLinks = [
      { href: '/new', label: 'New' }, { href: '/featured', label: 'Featured' },
      { href: '/trending', label: 'Trending' }, { href: '/charts', label: 'Charts' },
    ];
  
    return (
      <header className="w-full bg-[#121212]/80 backdrop-blur-sm p-4 flex justify-between items-center border-b border-gray-800 sticky top-0 z-30">
        <div className="flex items-center gap-4">
          <Link href="/new" className="flex items-center gap-4">
            <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
              <Music size={16} className="text-black" />
            </div>
            <h1 className="text-xl font-bold text-white hidden sm:block">DJ Pool</h1>
          </Link>
        </div>
        <div className="flex items-center gap-8">
            <nav className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (<Link key={link.href} href={link.href} className={`font-semibold transition-colors pb-2 ${pathname === link.href ? 'text-white border-b-2 border-white' : 'text-gray-400 hover:text-white'}`}>{link.label}</Link>))}
            </nav>
            <div className="flex items-center gap-4">
                <ClerkLoading><div className="h-8 w-28 bg-gray-700 rounded-md animate-pulse"></div></ClerkLoading>
                <ClerkLoaded>
                    <SignedIn>
                        <Link href="/profile" className={`font-semibold transition-colors pb-2 hidden md:block ${pathname === '/profile' ? 'text-white border-b-2 border-white' : 'text-gray-400 hover:text-white'}`}>Meu Perfil</Link>
                        <UserButton afterSignOutUrl="/new"/>
                    </SignedIn>
                    <SignedOut>
                        <SignInButton mode="modal"><button className="font-semibold px-3 py-2 rounded-md transition-colors text-gray-300 hover:text-white">Entrar</button></SignInButton>
                        <SignUpButton mode="modal"><button className="bg-white text-black px-4 py-2 rounded-full hover:bg-gray-200 transition-colors text-sm font-bold">Cadastrar</button></SignUpButton>
                    </SignedOut>
                </ClerkLoaded>
            </div>
        </div>
      </header>
    );
});

const SiteFooter = React.memo(function SiteFooter() {
    return (
        <footer className="bg-[#121212] border-t border-gray-800 mt-auto">
            <div className="max-w-screen-xl mx-auto py-8 px-8 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
                <div className="text-center md:text-left"><p className="text-sm text-gray-500">&copy; {new Date().getFullYear()} DJ Pool. Todos os direitos reservados.</p></div>
                <div className="flex items-center gap-2"><span className="relative flex h-3 w-3"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span><span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span></span><p className="text-sm text-green-400 font-semibold">Todos os serviços online</p></div>
                <div className="flex space-x-6">
                    <a href="#" className="text-gray-400 hover:text-white"><Instagram size={24} /></a>
                    <a href="#" className="text-gray-400 hover:text-white"><Twitter size={24} /></a>
                    <a href="#" className="text-gray-400 hover:text-white"><Facebook size={24} /></a>
                </div>
            </div>
        </footer>
    );
});


// --- Página de Administração ---
export default function AdminDashboardPage() {
  const { user } = useUser();

  return (
    <>
      <Head>
        <title>Painel Administrativo - DJ Pool</title>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      </Head>
      <div className="bg-[#121212] text-gray-300 font-inter min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow container mx-auto p-8">
          <div className="mb-8">
            <h1 className="text-4xl font-extrabold text-white">Painel Administrativo</h1>
            <p className="text-gray-400 mt-2">Bem-vindo, {user?.firstName || 'Admin'}. Aqui você pode gerir o conteúdo do site.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Card para Adicionar Músicas */}
            <Link href="/admin/add-music" className="bg-[#181818] p-6 rounded-lg border border-gray-800 hover:bg-[#2a2b2c] hover:border-blue-500 transition-all group">
                <div className="flex items-center gap-4">
                    <div className="bg-blue-500/10 p-3 rounded-lg">
                        <PlusCircle size={24} className="text-blue-400" />
                    </div>
                    <div>
                        <h2 className="font-bold text-lg text-white">Adicionar Músicas</h2>
                        <p className="text-sm text-gray-400">Injetar um lote de novas músicas no banco de dados.</p>
                    </div>
                </div>
            </Link>

            {/* Placeholder para futuras funcionalidades */}
            <div className="bg-[#181818] p-6 rounded-lg border border-gray-800 opacity-50">
                <div className="flex items-center gap-4">
                    <div className="bg-gray-700 p-3 rounded-lg">
                        <LayoutDashboard size={24} className="text-gray-500" />
                    </div>
                    <div>
                        <h2 className="font-bold text-lg text-gray-500">Gerir Utilizadores</h2>
                        <p className="text-sm text-gray-600">(Em breve)</p>
                    </div>
                </div>
            </div>

          </div>
        </main>
        <SiteFooter />
      </div>
    </>
  );
}