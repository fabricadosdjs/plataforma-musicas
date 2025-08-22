// src/app/layout.tsx
import DynamicGradientBackground from '@/components/layout/DynamicGradientBackground';
import { GlobalPlayerProvider } from '@/context/GlobalPlayerContext';
import MusicRouteHandler from '@/components/layout/MusicRouteHandler';
import AudioPlayerRoot from '@/components/player/AudioPlayerRoot';
import FooterPlayerNew from '@/components/player/FooterPlayerNew';

import { AppProvider } from '@/context/AppContext';
import AuthProvider from '@/context/AuthProvider';
import { LoadingProvider } from '@/context/LoadingContext';
import { PageTransitionLoading } from '@/components/ui/PageTransitionLoading';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google'; // Inter como fonte principal
import './globals.css';
import '../styles/beatport-effects.css';
import '../styles/mobile-optimizations.css';
import '../styles/profile-modern.css';
import '../styles/whmcs-custom.css';
import { ExtensionDetector } from '@/components/layout/ExtensionDetector';
import { GlobalToastManager } from '@/components/layout/GlobalToastManager';
import { ToastProvider } from '@/context/ToastContext';
import { TrackingProvider } from '@/context/TrackingContext';
import BrowserExtensionHandler from '@/components/layout/BrowserExtensionHandler';
import { GlobalImageErrorInterceptor } from '@/components/ui/ImageErrorBoundary';

// Configura a fonte Inter como a fonte principal
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
    <html lang="pt-BR" className={`${inter.variable}`}>
      <body suppressHydrationWarning={true}>
        {/* Meta tags para melhorar downloads - movido para head.tsx ou metadata */}
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no"
        />
        <AuthProvider>
          <AppProvider>
            <ToastProvider>
              <TrackingProvider>
                <LoadingProvider>
                  <GlobalPlayerProvider>
                    <BrowserExtensionHandler />
                    <MusicRouteHandler />
                    <ExtensionDetector />
                    <GlobalToastManager />
                    <GlobalImageErrorInterceptor />
                    <DynamicGradientBackground />
                    <PageTransitionLoading>
                      {children}
                    </PageTransitionLoading>
                    {/* Player global sempre renderizado */}
                    <FooterPlayerNew />
                  </GlobalPlayerProvider>
                </LoadingProvider>
              </TrackingProvider>
            </ToastProvider>
          </AppProvider>
        </AuthProvider>

        {/* Tawk.to Script com proteção e carga após hydration, neutraliza i18next não existente */}
        <script
          type="text/javascript"
          dangerouslySetInnerHTML={{
            __html: `
              (function(){
                if (typeof window === 'undefined') return;
                // Prevenir erros de i18next esperado por Tawk (algumas builds):
                try {
                  window.Tawk_API = window.Tawk_API || {};
                  window.Tawk_API.i18next = window.Tawk_API.i18next || function(k){ return k; };
                } catch(e) {}
                function loadTawk(){
                  if (window.Tawk_API && window.Tawk_API.onLoad) return; // já carregado
                  var s1=document.createElement('script'), s0=document.getElementsByTagName('script')[0];
                  s1.async=true;
                  s1.src='https://embed.tawk.to/6872e7e08a0a5f1914737f11/1j00dji02';
                  s1.charset='UTF-8';
                  s1.setAttribute('crossorigin','*');
                  s1.onerror=function(){ console.warn('[tawk] falha ao carregar'); };
                  s0.parentNode.insertBefore(s1,s0);
                }
                if (document.readyState === 'complete') { loadTawk(); }
                else { window.addEventListener('load', loadTawk, { once:true }); }
              })();
            `
          }}
        />

        {/* Script de proteção de imagens - executa antes do React */}
        <script
          type="text/javascript"
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                'use strict';
                
                // Proteger imagens imediatamente (modo não-agressivo)
                function protectImages() {
                  try {
                    const images = document.querySelectorAll('img');
                    images.forEach(function(img) {
                      // Marcar como protegida para extensões
                      img.setAttribute('data-protected', 'true');
                      img.setAttribute('data-no-process', 'true');
                      
                      // Se já está quebrada E tem src, marcar para extensões
                      if (img.complete && img.naturalWidth === 0 && img.src && img.src !== '') {
                        img.setAttribute('data-error', 'true');
                        img.setAttribute('data-cleaned', 'true');
                        // NÃO esconder a imagem - deixar o fallback funcionar
                      }
                      
                      // Adicionar listener de erro (apenas para extensões)
                      img.addEventListener('error', function() {
                        // Marcar para extensões não processarem
                        this.setAttribute('data-error', 'true');
                        this.setAttribute('data-cleaned', 'true');
                        // NÃO esconder - deixar o fallback funcionar
                      });
                    });
                    
                    console.log('[Image Protection] Proteção ativada para', images.length, 'imagens (modo não-agressivo)');
                  } catch (e) {
                    console.warn('[Image Protection] Erro ao proteger imagens:', e);
                  }
                }
                
                // Executar proteção imediatamente
                if (document.readyState === 'loading') {
                  document.addEventListener('DOMContentLoaded', protectImages);
                } else {
                  protectImages();
                }
                
                // Executar novamente após um delay para pegar imagens carregadas dinamicamente
                setTimeout(protectImages, 100);
                setTimeout(protectImages, 500);
                setTimeout(protectImages, 1000);
                
              })();
            `
          }}
        />
      </body>
    </html>
  );
}