// app/auth/sign-in/page.tsx
'use client';

import { Lock, Mail, MessageCircle, User, Eye, EyeOff } from 'lucide-react';
import NewFooter from '@/components/layout/NewFooter';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

// Note: Metadata não pode ser exportada de componentes "use client"

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1" htmlFor="email">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="email"
                  name="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="seu.email@exemplo.com"
                  className="w-full pl-9 pr-3 py-2.5 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  style={{
                    backgroundColor: '#1a1a1a',
                    borderColor: '#3a3a3a'
                  }}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1" htmlFor="password">
                Senha
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full pl-9 pr-12 py-2.5 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  style={{
                    backgroundColor: '#1a1a1a',
                    borderColor: '#3a3a3a'
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300 focus:outline-none transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-2.5 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02]"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Entrando...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <User className="w-4 h-4" />
                  <span>Entrar na Plataforma</span>
                </div>
              )}
            </button>
          </form>

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
