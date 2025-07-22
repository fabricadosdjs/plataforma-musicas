// src/app/layout.tsx
import { AppProvider } from '@/context/AppContext';
import AuthProvider from '@/context/AuthProvider';
import type { Metadata } from 'next';
import { Montserrat } from 'next/font/google'; // Montserrat similar ao Spotify
import './globals.css';

// Configura a fonte Montserrat como a fonte principal
const montserrat = Montserrat({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800', '900'],
  variable: '--font-montserrat', // Define uma variável CSS para Montserrat
});

export const metadata: Metadata = {
  title: 'DJ Pool Platform',
  description: 'Sua plataforma de músicas para DJs.',
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
    <html lang="pt-BR" className={montserrat.className}>
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
            {children}
          </AppProvider>
        </AuthProvider>
      </body>
    </html>
  );
}