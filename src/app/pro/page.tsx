"use client";

import { Facebook, Info, Instagram, Music, Twitter, X } from 'lucide-react';
import { signOut, useSession } from 'next-auth/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { memo, useState } from 'react';

const Header = memo(function Header() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const user = session?.user;

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
          <div className="w-8 h-8 bg-[#202124] rounded-full flex items-center justify-center">
            <Music size={16} className="text-white" />
          </div>
          <h1 className="text-xl font-bold text-gray-900 hidden sm:block">DJ Pool</h1>
        </Link>
      </div>
      <div className="flex items-center gap-8">
        <nav className="hidden md:flex items-center space-x-8">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`font-semibold transition-colors pb-2 ${pathname === link.href
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-blue-600'
                }`}
            >
              {link.label}
            </Link>
          ))}
          {user && (
            <Link
              href="/profile"
              className={`font-semibold transition-colors pb-2 ${pathname === '/profile'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-blue-600'
                }`}
            >
              Meu Perfil
            </Link>
          )}
        </nav>
        <div className="flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-2">
              <span className="font-semibold text-gray-700">{user.name || user.email}</span>
              <button onClick={() => signOut()} className="text-sm text-gray-600 hover:text-gray-800">Sair</button>
            </div>
          ) : (
            <>
              <Link href="/auth/sign-in">
                <button className="font-semibold px-3 py-2 rounded-md transition-colors text-gray-600 hover:text-blue-600">
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
      </div>
    </header>
  );
});

const SiteFooter = memo(function SiteFooter() {
  return (
    <footer className="bg-white border-t border-gray-200 mt-auto">
      <div className="max-w-screen-xl mx-auto py-8 px-6 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
        <div className="text-center md:text-left">
          <p className="text-sm text-gray-500">
            &copy; {new Date().getFullYear()} DJ Pool. Todos os direitos reservados.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
          </span>
          <p className="text-sm text-green-600 font-semibold">Todos os serviços online</p>
        </div>
        <div className="flex space-x-6">
          <a href="#" className="text-gray-400 hover:text-gray-500">
            <Instagram size={24} />
          </a>
          <a href="#" className="text-gray-400 hover:text-gray-500">
            <Twitter size={24} />
          </a>
          <a href="#" className="text-gray-400 hover:text-gray-500">
            <Facebook size={24} />
          </a>
        </div>
      </div>
    </footer>
  );
});

export default function ProPage() {
  const { data: session } = useSession();
  const user = session?.user;
  const [showModal, setShowModal] = useState(false);

  const handleUpgrade = () => {
    // TODO: Implementar integração com Stripe quando necessário
    setShowModal(true);
  };

  return (
    <div className="bg-gray-50 text-gray-800 min-h-screen flex flex-col">
      <Header />

      <main className="flex-grow">
        <div className="container mx-auto px-8 py-16">
          <div className="text-center mb-16">
            <h1 className="text-5xl font-extrabold text-gray-900 mb-4">
              DJ Pool <span className="text-blue-600">Pro</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Desbloqueie todo o potencial da nossa plataforma com downloads ilimitados,
              acesso exclusivo e muito mais.
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-2 gap-8">
              {/* Plano Gratuito */}
              <div className="bg-white p-8 rounded-lg shadow-lg border">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Gratuito</h3>
                <div className="text-3xl font-bold text-gray-900 mb-6">
                  R$ 0<span className="text-lg font-normal text-gray-600">/mês</span>
                </div>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center gap-2">
                    <span className="text-green-500">✓</span>
                    5 downloads por dia
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-500">✓</span>
                    Acesso ao catálogo básico
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-500">✓</span>
                    Preview de 30 segundos
                  </li>
                </ul>
                <button
                  disabled
                  className="w-full bg-gray-300 text-gray-500 font-bold py-3 px-4 rounded-lg cursor-not-allowed"
                >
                  Plano Atual
                </button>
              </div>

              {/* Plano Pro */}
              <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-8 rounded-lg shadow-lg text-white relative">
                <div className="absolute top-4 right-4 bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full text-sm font-bold">
                  Mais Popular
                </div>
                <h3 className="text-2xl font-bold mb-4">Pro</h3>
                <div className="text-3xl font-bold mb-6">
                  R$ 29<span className="text-lg font-normal opacity-80">/mês</span>
                </div>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center gap-2">
                    <span className="text-yellow-300">✓</span>
                    Downloads ilimitados
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-yellow-300">✓</span>
                    Acesso a todo o catálogo
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-yellow-300">✓</span>
                    Qualidade premium
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-yellow-300">✓</span>
                    Lançamentos exclusivos
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-yellow-300">✓</span>
                    Suporte prioritário
                  </li>
                </ul>
                <button
                  onClick={handleUpgrade}
                  className="w-full bg-white text-blue-600 font-bold py-3 px-4 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  Assinar Pro
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-[#202124] bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Em Desenvolvimento</h3>
              <button onClick={() => setShowModal(false)}>
                <X size={24} />
              </button>
            </div>
            <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg">
              <Info className="text-blue-500" size={24} />
              <p className="text-gray-700">
                A funcionalidade de pagamento ainda está em desenvolvimento.
                Em breve você poderá assinar o plano Pro!
              </p>
            </div>
            <button
              onClick={() => setShowModal(false)}
              className="w-full mt-4 bg-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Entendi
            </button>
          </div>
        </div>
      )}

      <SiteFooter />
    </div>
  );
}
