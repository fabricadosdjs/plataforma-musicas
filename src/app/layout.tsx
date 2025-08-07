// src/app/layout.tsx
import DynamicGradientBackground from '@/components/layout/DynamicGradientBackground';
import { GlobalPlayerProvider } from '@/context/GlobalPlayerContext';
import MusicRouteHandler from '@/components/layout/MusicRouteHandler';
import AudioPlayerRoot from '@/components/player/AudioPlayerRoot';
import FooterPlayerNew from '@/components/player/FooterPlayerNew';

import { AppProvider } from '@/context/AppContext';
import AuthProvider from '@/context/AuthProvider';
import type { Metadata } from 'next';
import { Lato, Inter } from 'next/font/google'; // Lato como fonte principal, Inter para elementos específicos
import './globals.css';
import '../styles/beatport-effects.css';
import '../styles/mobile-optimizations.css';
import '../styles/profile-modern.css';
import { ExtensionDetector } from '@/components/layout/ExtensionDetector';
import { GlobalToastManager } from '@/components/layout/GlobalToastManager';
import { ToastProvider } from '@/context/ToastContext';
import Footer from '@/components/layout/Footer';
import BrowserExtensionHandler from '@/components/layout/BrowserExtensionHandler';

// Configura a fonte Lato como a fonte principal
const lato = Lato({
  subsets: ['latin'],
  weight: ['300', '400', '700', '900'], // Incluindo light (300), regular (400), bold (700) e black (900)
  variable: '--font-lato', // Define uma variável CSS para Lato
});

// Configura a fonte Inter para elementos específicos
const inter = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-inter', // Define uma variável CSS para Inter
});

export const metadata: Metadata = {
  title: {
    default: 'Nexor Records Pools - Sua Plataforma de música Eletrônicas',
    template: '%s - Nexor Records Pools'
  },
  description: 'A melhor plataforma de músicas eletrônicas para DJs, com downloads exclusivos, streaming e lançamentos atualizados diariamente.',
  keywords: [
    'música eletrônica',
    'DJ',
    'download',
    'streaming',
    'house',
    'techno',
    'trance',
    'remix',
    'versão',
    'club mix',
    'nexor records',
    'pools',
    'música para dj',
    'download música',
    'streaming dj',
    'big room',
    'beats',
    'mixing',
    'djing'
  ],
  authors: [{ name: 'Nexor Records' }],
  creator: 'Nexor Records',
  publisher: 'Nexor Records',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://djpools.nexorrecords.com.br'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    url: 'https://djpools.nexorrecords.com.br',
    title: 'Nexor Records Pools - Sua Plataforma de música Eletrônicas',
    description: 'A melhor plataforma de músicas eletrônicas para DJs, com downloads exclusivos, streaming e lançamentos atualizados diariamente.',
    siteName: 'Nexor Records Pools',
    images: [
      {
        url: '/images/cover-picture_l.webp',
        width: 1200,
        height: 630,
        alt: 'Nexor Records Pools - Plataforma de Músicas Eletrônicas',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Nexor Records Pools - Sua Plataforma de música Eletrônicas',
    description: 'A melhor plataforma de músicas eletrônicas para DJs, com downloads exclusivos, streaming e lançamentos atualizados diariamente.',
    images: ['/images/cover-picture_l.webp'],
    creator: '@nexorrecords',
    site: '@nexorrecords',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
  },
  manifest: '/site.webmanifest',
  referrer: 'no-referrer',
  other: {
    'Content-Security-Policy': "default-src 'self' 'unsafe-inline' 'unsafe-eval' data: blob: https: wss:; img-src 'self' data: https: blob:;"
  }
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className={`${lato.variable} ${inter.variable}`}>
      <body suppressHydrationWarning={true}>
        {/* Meta tags para melhorar downloads - movido para head.tsx ou metadata */}
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no"
        />
        <AuthProvider>
          <AppProvider>
            <ToastProvider>
              <GlobalPlayerProvider>
                <BrowserExtensionHandler />
                <MusicRouteHandler />
                <ExtensionDetector />
                <GlobalToastManager />
                <DynamicGradientBackground />
                {children}
                {/* Player global sempre renderizado */}
                <FooterPlayerNew />
                <Footer />
              </GlobalPlayerProvider>
            </ToastProvider>
          </AppProvider>
        </AuthProvider>

        {/* Tawk.to Script */}
        <script
          type="text/javascript"
          dangerouslySetInnerHTML={{
            __html: `
              var Tawk_API=Tawk_API||{}, Tawk_LoadStart=new Date();
              (function(){
                var s1=document.createElement("script"),s0=document.getElementsByTagName("script")[0];
                s1.async=true;
                s1.src='https://embed.tawk.to/6872e7e08a0a5f1914737f11/1j00dji02';
                s1.charset='UTF-8';
                s1.setAttribute('crossorigin','*');
                s0.parentNode.insertBefore(s1,s0);
              })();
            `
          }}
        />
      </body>
    </html>
  );
}