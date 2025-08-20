// app/auth/sign-in/page.tsx
'use client';

import { MessageCircle, Lock } from 'lucide-react';
import NewFooter from '@/components/layout/NewFooter';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { SignInForm } from '@/components/auth/SignInForm';

// Força renderização dinâmica para evitar build estático
export const dynamic = 'force-dynamic';

// Note: Metadata não pode ser exportada de componentes "use client"

export default function SignInPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (email: string, password: string) => {
    setError(null);
    setLoading(true);

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        if (result.error === 'CredentialsSignin') {
          setError('Parece que não encontramos os seus dados');
        } else {
          setError(result.error);
        }
      } else {
        router.push('/new');
        router.refresh();
      }
    } catch (err) {
      setError('Ocorreu um erro inesperado.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 overflow-hidden z-0"
      style={{ backgroundColor: '#212121', zIndex: 0 }}
    >
      <div className="w-full max-w-xl">
        {/* Logo/Header */}
        <div className="text-center mb-4">
          {/* Logo Real da Nextor Records */}
          <div className="inline-flex items-center justify-center mb-3 w-full">
            <img
              src="https://i.ibb.co/Y7WKPY57/logo-nexor.png"
              alt="Nextor Records"
              className="object-contain h-20 sm:h-28 w-full max-w-xs sm:max-w-lg"
              style={{}}
            />
          </div>
          <h1 className="text-xl font-bold text-white mb-1">Plataforma de Músicas</h1>
          <p className="text-gray-400 text-sm">Acesse sua conta VIP</p>
        </div>

        {/* Form Card */}
        <div
          className="backdrop-blur-sm rounded-xl p-6 shadow-2xl border"
          style={{
            backgroundColor: '#2a2a2a',
            borderColor: '#3a3a3a'
          }}
        >
          <div className="text-center mb-4">
            <h2 className="text-lg font-bold text-white mb-1">Bem-vindo de volta</h2>
            <p className="text-gray-400 text-sm">Entre com suas credenciais VIP</p>
          </div>

          {error && (
            <div className="bg-red-900/30 border border-red-700 text-red-300 p-3 rounded-lg mb-4 text-sm flex items-center gap-2">
              <Lock className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          <SignInForm
            onSubmit={handleSubmit}
            loading={loading}
            error={error}
          />

          {/* WhatsApp Button */}
          <div className="mt-6 text-center">
            <a
              href="https://wa.me/5551935052274?text=Olá! Preciso dos meus dados de acesso VIP para a Plataforma de Músicas."
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-[1.02]"
            >
              <MessageCircle className="w-5 h-5" />
              Solicitar Dados via WhatsApp
            </a>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-4">
          <p className="text-gray-500 text-xs">
            © 2025 Nextor Records. Acesso exclusivo para membros VIP.
          </p>
        </div>

        {/* Novo Footer */}
        <NewFooter />
      </div>
    </div>
  );
}
