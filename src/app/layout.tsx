// src/app/layout.tsx
import { ClerkProvider } from '@clerk/nextjs';
import { Inter } from 'next/font/google'; // Apenas Inter
import type { Metadata } from 'next';
import { AppProvider } from '@/context/AppContext';
import './globals.css';

// Configura a fonte Inter como a única fonte do tema
const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-inter', // Define uma variável CSS para Inter
});

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
      <AppProvider>
        {/* Aplica a variável CSS da fonte Inter no elemento html */}
        <html lang="pt-BR" className={`${inter.variable}`}>
          {/* Define o background global como branco e o texto padrão como cinza-900 (quase preto) */}
          <body className={`bg-white text-gray-900 font-inter`}>
            {children}
          </body>
        </html>
      </AppProvider>
    </ClerkProvider>
  );
}