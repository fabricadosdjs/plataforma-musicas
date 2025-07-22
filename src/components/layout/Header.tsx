// Header.tsx
"use client";

import { LogOut, Music, Search } from 'lucide-react';
import { signOut, useSession } from 'next-auth/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Header({ onSearchChange }: { onSearchChange?: (query: string) => void }) {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const isSignedIn = status === 'authenticated';

  const navLinks = [
    { href: '/new', label: 'New' },
    { href: '/featured', label: 'Featured' },
    { href: '/trending', label: 'Trending' },
    { href: '/charts', label: 'Charts' },
  ];

  return (
    <header className="w-full p-4 flex justify-between items-center border-b border-gray-700 sticky top-0 z-30" style={{ background: '#202124', color: 'var(--foreground)' }}>
      <div className="flex items-center gap-4">
        <Link href="/new" className="flex items-center gap-4">
          <div className="w-8 h-8 bg-blue-900 rounded-full flex items-center justify-center">
            <Music size={16} className="text-white" />
          </div>
          {/* A fonte Dosis será aplicada globalmente via CSS */}
          <h1 className="text-xl font-bold text-white hidden sm:block">
            DJ Pool
          </h1>
        </Link>
      </div>

      <div className="relative w-full max-w-md mx-4 hidden lg:block">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
        <input
          type="text"
          placeholder="Pesquisar por música ou artista..."
          onChange={(e) => onSearchChange?.(e.target.value)}
          className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-600 bg-gray-800 text-gray-200 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
        />
      </div>

      <nav className="hidden md:flex items-center space-x-8">
        {navLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`font-semibold transition-colors pb-2 ${pathname === link.href
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-400 hover:text-blue-500'
              }`}
          >
            {link.label}
          </Link>
        ))}
        {/* Link de Perfil para usuários logados */}
        {isSignedIn && (
          <Link href="/profile" className={`font-semibold transition-colors pb-2 ${pathname === '/profile'
            ? 'text-blue-600 border-b-2 border-blue-600'
            : 'text-gray-400 hover:text-blue-500'
            }`}>
            Meu Perfil
          </Link>
        )}
      </nav>
      <div className="flex items-center gap-4">
        {isSignedIn ? (
          <>
            <span className="text-sm font-medium text-gray-300 hidden sm:block">
              Olá, {session.user?.name?.split(' ')[0] || 'DJ'}
            </span>
            <button
              onClick={() => signOut({ callbackUrl: '/auth/sign-in' })}
              className="flex items-center gap-2 font-semibold px-3 py-2 rounded-md transition-colors text-gray-400 hover:text-white hover:bg-red-600/50"
              title="Sair"
            >
              <LogOut size={16} />
              <span className="hidden sm:inline">Sair</span>
            </button>
          </>
        ) : (
          <>
            <Link href="/auth/sign-in">
              <button className="font-semibold px-3 py-2 rounded-md transition-colors text-gray-400 hover:text-white">
                Entrar
              </button>
            </Link>
            <Link href="/auth/sign-up">
              <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors text-sm font-medium">
                Cadastrar
              </button>
            </Link>
          </>
        )}
      </div>
    </header>
  );
}