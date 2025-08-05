// src/app/layout.tsx
import DynamicGradientBackground from '@/components/layout/DynamicGradientBackground';
import { GlobalPlayerProvider } from '@/context/GlobalPlayerContext';
import MusicRouteHandler from '@/components/layout/MusicRouteHandler';
import AudioPlayerRoot from '@/components/player/AudioPlayerRoot';
import FooterPlayerNew from '@/components/player/FooterPlayerNew';
import PWAInstaller from '@/components/pwa/PWAInstaller';
import { AppProvider } from '@/context/AppContext';
import AuthProvider from '@/context/AuthProvider';
import type { Metadata } from 'next';
import { Lato, Inter } from 'next/font/google'; // Lato como fonte principal, Inter para elementos específicos
import './globals.css';
import '../styles/beatport-effects.css';
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
    default: 'DJ Pool Platform - Sua Plataforma de Músicas para DJs',
    template: '%s - DJ Pool Platform'
  },
  description: 'Descubra, ouça e baixe as melhores músicas para DJs. Acesso VIP com downloads ilimitados, catálogo premium com house, techno, eletrônica e remixes exclusivos.',
  keywords: [
    'música para dj',
    'download música',
    'streaming dj',
    'house music',
    'techno',
    'big room',
    'remix',
    'versão club',
    'dj pool',
    'música eletrônica',
    'beats',
    'mixing',
    'djing'
  ],
  authors: [{ name: 'DJ Pool Platform' }],
  creator: 'DJ Pool Platform',
  publisher: 'DJ Pool Platform',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://dj-pool.netlify.app'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    url: 'https://dj-pool.netlify.app',
    title: 'DJ Pool Platform - Sua Plataforma de Músicas para DJs',
    description: 'Descubra, ouça e baixe as melhores músicas para DJs. Acesso VIP com downloads ilimitados e catálogo premium.',
    siteName: 'DJ Pool Platform',
    images: [
      {
        url: '/images/og/home.jpg',
        width: 1200,
        height: 630,
        alt: 'DJ Pool Platform - Plataforma de Músicas para DJs',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'DJ Pool Platform - Sua Plataforma de Músicas para DJs',
    description: 'Descubra, ouça e baixe as melhores músicas para DJs. Acesso VIP com downloads ilimitados e catálogo premium.',
    images: ['/images/og/home.jpg'],
    creator: '@djpool',
    site: '@djpool',
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
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
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
                <PWAInstaller />
                {children}
                {/* Player global sempre renderizado */}
                <FooterPlayerNew />
                <Footer />
              </GlobalPlayerProvider>
            </ToastProvider>
          </AppProvider>
        </AuthProvider>
      </body>
    </html>
  );
}