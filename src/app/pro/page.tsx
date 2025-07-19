// src/app/pro/page.tsx
"use client"; // Este componente precisa ser um Client Component para interatividade

import React, { useState, useEffect, memo } from 'react'; // REMOVIDO useCallback (não utilizado)
import { useUser, UserButton, SignedIn, SignedOut, SignInButton, SignUpButton, ClerkLoaded, ClerkLoading } from '@clerk/nextjs'; // Importe componentes do Clerk
import Head from 'next/head'; // Importe Head para metadados e fontes
import Link from 'next/link'; // Importe Link
import { usePathname } from 'next/navigation'; // Importe usePathname
// REMOVIDOS ícones não utilizados: SkipBack, SkipForward, Play, Pause, ThumbsUp, Download, Loader2
import { X, Info, Music, Search, Instagram, Twitter, Facebook } from 'lucide-react'; 
import { loadStripe } from '@stripe/stripe-js'; // ADICIONADO: Importação de loadStripe

// --- Componentes Reutilizados de /new/page.tsx ---

// Componente de Cabeçalho (copiado de new/page.tsx)
const Header = memo(function Header({ onSearchChange }: { onSearchChange: (query: string) => void }) {
  const pathname = usePathname();

  const navLinks = [
    { href: '/new', label: 'New' },
    { href: '/featured', label: 'Featured' },
    { href: '/trending', label: 'Trending' },
    { href: '/charts', label: 'Charts' },
    { href: '/pro', label: 'PRO' }, // Adicionado link para PRO
  ];

  return (
    <header className="w-full bg-white/80 backdrop-blur-sm p-4 flex justify-between items-center border-b border-gray-200 sticky top-0 z-30">
      <div className="flex items-center gap-4">
        <Link href="/new" className="flex items-center gap-4">
          <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center">
            <Music size={16} className="text-white" />
          </div>
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

      <div className="flex items-center gap-8">
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
        </nav>

        <div className="flex items-center gap-4">
          <ClerkLoading>
            <div className="h-8 w-28 bg-gray-200 rounded-md animate-pulse"></div>
          </ClerkLoading>
          <ClerkLoaded>
            <SignedIn>
              <Link href="/profile" className={`font-semibold transition-colors pb-2 hidden md:block ${
                  pathname === '/profile'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-blue-600'
              }`}>
                Meu Perfil
              </Link>
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
          </ClerkLoaded>
        </div>
      </div>
    </header>
  );
});

// Componente de Alerta (copiado de new/page.tsx)
const Alert = memo(function Alert({ message, onClose }: { message: string, onClose: () => void }) {
  if (!message) return null;
  return (
    <div className="fixed top-24 right-6 bg-blue-600 text-white p-4 rounded-lg shadow-lg flex items-center gap-4 z-50 animate-fade-in-down">
      <Info size={24} />
      <span>{message}</span>
      <button onClick={onClose} className="p-1 rounded-full hover:bg-white/20">
        <X size={18} />
      </button>
    </div>
  );
});

// Componente de Rodapé do Site (copiado de new/page.tsx)
const SiteFooter = memo(function SiteFooter() {
  return (
    <footer className="bg-white border-t border-gray-200 mt-auto">
      <div className="max-w-screen-xl mx-auto py-8 px-6 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
        <div className="text-center md:text-left">
          <p className="text-sm text-gray-500">&copy; {new Date().getFullYear()} DJ Pool. Todos os direitos reservados.</p>
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

// --- Página Principal PRO ---

// Carrega a chave publicável do Stripe.
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '');

export default function ProPage() {
  const { user, isLoaded, isSignedIn } = useUser();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubscribe = async () => {
    if (!isSignedIn) {
      setMessage('🔒 Faça login para assinar um plano.');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Erro desconhecido' }));
        throw new Error(`HTTP error! status: ${response.status} - ${errorData.message || response.statusText}`);
      }

      const session = await response.json();

      const stripe = await stripePromise;
      if (stripe) {
        // CORREÇÃO AQUI: Extrair apenas o sessionId da URL
        // A lógica de extração parece um pouco complexa e talvez não seja necessária se 'session.id' já estiver disponível
        // Se 'session' do backend já retornar { id: 'cs_test_xyz' } ou { url: 'https://checkout.stripe.com/c/pay/cs_test_xyz...' }
        // Se a sessão tem a propriedade 'id', use-a diretamente. Ex: sessionId: session.id
        // Se for apenas 'session.url' e o Stripe precise do ID, sua lógica atual de parsear a string pode funcionar,
        // mas é mais seguro ter o ID retornado diretamente do seu backend.
        // Por hora, manterei sua lógica de extração, mas saiba que pode ser simplificada.
        const sessionId = session.url.split('cs_test_')[1] ? 'cs_test_' + session.url.split('cs_test_')[1].split('?')[0] : '';
        if (!sessionId) {
            throw new Error('Could not extract session ID from Stripe URL.');
        }

        const { error } = await stripe.redirectToCheckout({
          sessionId: sessionId
        });

        if (error) {
          console.error('Erro ao redirecionar para o checkout:', error);
          setMessage(`Erro: ${error.message}`);
        }
      } else {
        setMessage('Erro ao carregar o Stripe. Por favor, tente novamente.');
      }

    } catch (error) { // CORRIGIDO: Removido ': any'
      // CORRIGIDO: Adicionada verificação de tipo para acessar a propriedade 'message' com segurança
      console.error('Erro ao criar sessão de checkout:', error);
      setMessage(`Erro ao iniciar o pagamento: ${error instanceof Error ? error.message : 'Ocorreu um erro desconhecido.'}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const query = new URLSearchParams(window.location.search);
    if (query.get('success')) {
      setMessage('🎉 Assinatura realizada com sucesso! Seu acesso PRO será liberado em breve.');
    }
    if (query.get('canceled')) {
      setMessage('Assinatura cancelada. Você pode tentar novamente.');
    }
  }, []);

  return (
    <>
      <Head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800&display=swap" rel="stylesheet" />
      </Head>
      <div className="bg-gray-50 text-gray-800 font-nunito min-h-screen flex flex-col">
        {/* Passa uma função vazia para onSearchChange, pois a página PRO não tem pesquisa */}
        <Header onSearchChange={() => {}} />
        <Alert message={message} onClose={() => setMessage('')} />

        <main className="flex-grow container mx-auto p-4 md:p-8 flex items-center justify-center">
          {/* Conteúdo existente da página PRO */}
          <div className="bg-gray-50 rounded-lg shadow-lg p-8 md:p-10 max-w-md w-full text-center border border-gray-200">
            <h2 className="text-3xl font-bold text-primary mb-6">Assinar Plano PRO</h2>

            {message && (
              <div className={`px-4 py-2 rounded-md mb-4 ${message.includes('sucesso') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {message}
              </div>
            )}

            {!isLoaded ? (
              <div className="text-center text-xl text-gray-600">
                A carregar informações do utilizador...
              </div>
            ) : (
              <>
                {isSignedIn && user?.emailAddresses?.[0]?.emailAddress && (
                  <p className="text-lg text-gray-700 mb-6">
                    Olá, <span className="font-semibold">{user.emailAddresses[0].emailAddress}</span>!
                    <br />
                    {user.publicMetadata?.isPro ? (
                      <span className="text-green-600 font-bold">Você já é um membro PRO!</span>
                    ) : (
                      <span>Liberte downloads ilimitados e recursos exclusivos.</span>
                    )}
                  </p>
                )}

                {!isSignedIn && (
                  <p className="text-lg text-gray-700 mb-6">
                    Faça login para assinar um plano e ter acesso PRO!
                  </p>
                )}

                {(!user?.publicMetadata?.isPro || !isLoaded) && (
                  <button
                    onClick={handleSubscribe}
                    disabled={loading || !isSignedIn}
                    className="bg-blue-600 text-white px-6 py-3 rounded-full hover:bg-blue-700 transition-colors text-lg font-medium shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'A processar...' : 'Assinar Plano PRO (R$ 29,90/mês)'}
                  </button>
                )}
              </>
            )}

            <p className="text-sm text-gray-500 mt-6">
              Pagamento seguro via Stripe.
            </p>
          </div>
        </main>

        <SiteFooter />
      </div>
    </>
  );
}