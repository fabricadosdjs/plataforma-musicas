"use client";

import { useState } from 'react';
import { Lock, Mail, User, Eye, EyeOff, Shield } from 'lucide-react';
import { TurnstileWidget } from './TurnstileDynamic';
import { useTurnstile } from '@/hooks/useTurnstile';

interface SignInFormProps {
  onSubmit: (email: string, password: string, turnstileToken: string) => void;
  loading: boolean;
  error: string | null;
}

export function SignInForm({ onSubmit, loading, error }: SignInFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  // Hook do Turnstile
  const { token, isVerified, error: turnstileError, isClient, handleVerify, handleError, handleExpire } = useTurnstile();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Verificar se o captcha foi completado (apenas no cliente)
    if (isClient && (!isVerified || !token)) {
      return;
    }

    onSubmit(email, password, token);
  };

  return (
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

      {/* Turnstile Widget */}
      {isClient && (
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-300 mb-1">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-blue-400" />
              Verificação de Segurança
            </div>
          </label>
          
          <TurnstileWidget
            onVerify={handleVerify}
            onError={handleError}
            onExpire={handleExpire}
            theme="dark"
            language="pt-BR"
            size="normal"
          />
          
          {turnstileError && (
            <div className="text-red-400 text-xs flex items-center gap-1">
              <Shield className="w-3 h-3" />
              {turnstileError}
            </div>
          )}
        </div>
      )}

      <button
        type="submit"
        disabled={loading || (isClient && !isVerified)}
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
  );
}
