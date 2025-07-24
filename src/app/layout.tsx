// src/app/layout.tsx
import DynamicGradientBackground from '@/components/layout/DynamicGradientBackground';
import PWAInstaller from '@/components/pwa/PWAInstaller';
import { AppProvider } from '@/context/AppContext';
import AuthProvider from '@/context/AuthProvider';
import type { Metadata } from 'next';
import { Ubuntu } from 'next/font/google'; // Ubuntu Light como fonte principal
import './globals.css';

// Configura a fonte Ubuntu Light como a fonte principal
const ubuntu = Ubuntu({
  subsets: ['latin'],
  weight: ['300', '400', '500'], // Incluindo light (300), regular (400) e medium (500)
  variable: '--font-ubuntu', // Define uma variável CSS para Ubuntu
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
    'eletrônica',
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
    <html lang="pt-BR" className={ubuntu.className}>
      <body>
        {/* Meta tags para melhorar downloads - movido para head.tsx ou metadata */}
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
            `,
          }}
        />
        <AuthProvider>
          <AppProvider>
            <DynamicGradientBackground />
            {children}
            <PWAInstaller />
          </AppProvider>
        </AuthProvider>
      </body>
    </html>
  );
}