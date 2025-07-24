// src/app/page.tsx
"use client";

import PermissionStatus from '@/components/ui/PermissionStatus';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function HomePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    // Se não estiver logado, redireciona para login
    if (status === 'unauthenticated') {
      router.push('/auth/sign-in');
    }
    // Se estiver logado, redireciona para /new após um delay para mostrar o status
    else if (status === 'authenticated') {
      const timer = setTimeout(() => {
        router.push('/new');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [status, router]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-pulse text-white">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-2">
            Sistema de Controle de Acesso
          </h1>
          <p className="text-gray-400 mb-6">
            Demonstração do controle em tempo real
          </p>
        </div>

        <PermissionStatus />

        <div className="text-center">
          <p className="text-sm text-gray-500">
            Redirecionando para as músicas em 3 segundos...
          </p>
        </div>
      </div>
    </div>
  );
}
