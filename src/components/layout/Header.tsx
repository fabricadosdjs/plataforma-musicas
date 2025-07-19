// Header.tsx
"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { UserButton, SignedIn, SignedOut, SignInButton, SignUpButton } from '@clerk/nextjs';
import { Music, Search } from 'lucide-react';

export default function Header({ onSearchChange }: { onSearchChange: (query: string) => void }) {
  const pathname = usePathname();

  const navLinks = [
    { href: '/new', label: 'New' },
    { href: '/featured', label: 'Featured' },
    { href: '/trending', label: 'Trending' },
    { href: '/charts', label: 'Charts' },
  ];

  return (
    <header className="w-full bg-white/80 backdrop-blur-sm p-4 flex justify-between items-center border-b border-gray-200 sticky top-0 z-30">
      <div className="flex items-center gap-4">
        <Link href="/new" className="flex items-center gap-4">
          <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center">
            <Music size={16} className="text-white" />
          </div>
          {/* A fonte Dosis será aplicada globalmente via CSS */}
          <h1 className="text-xl font-bold text-gray-900 hidden sm:block">
            DJ Pool
          </h1>
        </Link>
      </div>

      <div className="relative w-full max-w-md mx-4 hidden lg:block">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
        <input
          type="text"
          placeholder="Pesquisar por música ou artista..."
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
        />
      </div>

      <nav className="hidden md:flex items-center space-x-8">
        {navLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`font-semibold transition-colors pb-2 ${
              pathname === link.href
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-blue-600'
            }`}
          >
            {link.label}
          </Link>
        ))}
         {/* Link de Perfil para usuários logados */}
         <SignedIn>
            <Link href="/profile" className={`font-semibold transition-colors pb-2 ${
                pathname === '/profile'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-blue-600'
            }`}>
              Meu Perfil
            </Link>
        </SignedIn>
      </nav>
      <div className="flex items-center gap-2">
          <SignedIn>
              <UserButton afterSignOutUrl="/new"/>
          </SignedIn>
          <SignedOut>
              <SignInButton mode="modal">
                <button className="font-semibold px-3 py-2 rounded-md transition-colors text-gray-600 hover:text-blue-600">
                    Entrar
                </button>
              </SignInButton>
              <SignUpButton mode="modal">
                <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors text-sm font-medium">
                    Cadastrar
                </button>
              </SignUpButton>
          </SignedOut>
      </div>
    </header>
  );
}