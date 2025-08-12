'use client';

import { SessionProvider } from 'next-auth/react';

interface AuthProviderProps {
  children: React.ReactNode;
}

const AuthProvider = ({ children }: AuthProviderProps) => {
  return (
    <SessionProvider
      // Adicionar configurações para melhorar a estabilidade
      refetchInterval={5 * 60} // Refetch a cada 5 minutos
      refetchOnWindowFocus={false} // Não refetch quando a janela ganha foco
      refetchWhenOffline={false} // Não refetch quando offline
    >
      {children}
    </SessionProvider>
  );
};

export default AuthProvider;
