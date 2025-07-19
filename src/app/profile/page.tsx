// src/app/profile/page.tsx
"use client";

import React, { useState, useEffect, memo, useRef } from 'react';
import { useUser, UserButton, SignedIn, SignedOut, SignInButton, SignUpButton, ClerkLoaded, ClerkLoading } from '@clerk/nextjs';
import { useAppContext } from '@/context/AppContext';
import { Loader2, Camera, ThumbsUp, Download, Play, AlertCircle, Music, Search, Instagram, Twitter, Facebook, SkipBack, SkipForward, Pause } from 'lucide-react';
import Link from 'next/link';
import Head from 'next/head';
import { usePathname } from 'next/navigation';
import Image from 'next/image';

type Track = {
  id: number;
  songName: string;
  artist: string;
  imageUrl: string;
  downloadUrl: string;
  actionDate: string;
  previewUrl: string;
};

interface WaveSurferInstance {
  load: (url: string) => void;
  play: () => void;
  pause: () => void;
  playPause: () => void;
  destroy: () => void;
  on: (event: string, callback: (...args: unknown[]) => void) => void;
}

const Header = memo(function Header({ onSearchChange }: { onSearchChange: (query: string) => void }) {
  const pathname = usePathname();
  const navLinks = [
    { href: '/new', label: 'New' },
    { href: '/featured', label: 'Featured' },
    { href: '/trending', label: 'Trending' },
    { href: '/charts', label: 'Charts' },
    { href: '/pro', label: 'PRO' },
  ];

  return (
    <header className="w-full bg-white/80 backdrop-blur-sm p-4 flex justify-between items-center border-b border-gray-200 sticky top-0 z-30">
      <div className="flex items-center gap-4">
        <Link href="/new" className="flex items-center gap-4">
          <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center">
            <Music size={16} className="text-white" />
          </div>
          <h1 className="text-xl font-bold text-gray-900 hidden sm:block">DJ Pool</h1>
        </Link>
      </div>
      <div className="relative w-full max-w-md mx-4 hidden lg:block">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
        <input type="text" placeholder="Pesquisar por música ou artista..." onChange={(e) => onSearchChange(e.target.value)} className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors" />
      </div>
      <div className="flex items-center gap-8">
        <nav className="hidden md:flex items-center space-x-8">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href} className={`font-semibold transition-colors pb-2 ${pathname === link.href ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600 hover:text-blue-600'}`}>
              {link.label}
            </Link>
          ))}
          <ClerkLoaded>
            <SignedIn>
              <Link href="/profile" className={`font-semibold transition-colors pb-2 ${pathname === '/profile' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600 hover:text-blue-600'}`}>
                Meu Perfil
              </Link>
            </SignedIn>
          </ClerkLoaded>
        </nav>
        <div className="flex items-center gap-4">
          <ClerkLoading><div className="h-8 w-28 bg-gray-200 rounded-md animate-pulse"></div></ClerkLoading>
          <ClerkLoaded>
            <SignedIn><UserButton afterSignOutUrl="/new" /></SignedIn>
            <SignedOut>
              <SignInButton mode="modal"><button className="font-semibold px-3 py-2 rounded-md transition-colors text-gray-600 hover:text-blue-600">Entrar</button></SignInButton>
              <SignUpButton mode="modal"><button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors text-sm font-medium">Cadastrar</button></SignUpButton>
            </SignedOut>
          </ClerkLoaded>
        </div>
      </div>
    </header>
  );
});

const SiteFooter = memo(function SiteFooter() {
  return (
    <footer className="bg-white border-t border-gray-200">
      <div className="max-w-screen-2xl mx-auto py-8 px-8 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
        <div className="text-center md:text-left"><p className="text-sm text-gray-500">&copy; {new Date().getFullYear()} DJ Pool. Todos os direitos reservados.</p></div>
        <div className="flex items-center gap-2">
          <span className="relative flex h-3 w-3"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span><span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span></span>
          <p className="text-sm text-green-600 font-semibold">Todos os serviços online</p>
        </div>
        <div className="flex space-x-6">
          <a href="#" className="text-gray-400 hover:text-gray-500"><Instagram size={24} /></a>
          <a href="#" className="text-gray-400 hover:text-gray-500"><Twitter size={24} /></a>
          <a href="#" className="text-gray-400 hover:text-gray-500"><Facebook size={24} /></a>
        </div>
      </div>
    </footer>
  );
});
