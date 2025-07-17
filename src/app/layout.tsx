// src/app/layout.tsx
import { ClerkProvider } from '@clerk/nextjs'; // Importe o ClerkProvider
import type { Metadata } from 'next'; // Importe Metadata
import { Inter } from 'next/font/google'; // Importe a fonte Inter
import './globals.css';

const inter = Inter({ subsets: ['latin'] }); // Inicialize a fonte Inter

// Defina os metadados para sua aplicação
export const metadata: Metadata = {
  title: 'DJ Pool App',
  description: 'Sua plataforma de músicas para DJs',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // Garanta que não há espaços ou quebras de linha entre 'return (' e a tag <html>
    <html lang="pt-BR" className={inter.className}> {/* Aplica a classe da fonte aqui */}
      <body>
        {/* Envolva sua aplicação com ClerkProvider aqui dentro do <body> */}
        <ClerkProvider>
          {children} {/* Renderiza o conteúdo das suas páginas */}
        </ClerkProvider>
      </body>
    </html>
  );
}
