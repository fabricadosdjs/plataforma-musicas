import { ClerkProvider } from '@clerk/nextjs';
import { Inter } from 'next/font/google';
import type { Metadata } from 'next';
import { AppProvider } from '@/context/AppContext'; // Importa o novo Provider
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'DJ Pool Platform',
  description: 'Sua plataforma de músicas para DJs.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <AppProvider> {/* Envolve a aplicação com o AppProvider */}
        <html lang="pt-BR">
          <body className={inter.className}>{children}</body>
        </html>
      </AppProvider>
    </ClerkProvider>
  );
}
