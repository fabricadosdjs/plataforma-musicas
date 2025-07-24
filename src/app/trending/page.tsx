// src/app/trending/page.tsx
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Trending - Músicas em Alta',
    description: 'Descubra as músicas mais populares e em alta no momento. Rankings atualizados diariamente com os hits que estão dominando as pistas.',
    keywords: 'trending, música em alta, popular, hits, top charts, música popular, dj hits, club music',
    openGraph: {
        title: 'Trending - Músicas em Alta para DJs',
        description: 'Descubra as músicas mais populares e em alta no momento. Rankings atualizados diariamente.',
        images: ['/images/og/trending.jpg'],
    },
    alternates: {
        canonical: '/trending',
    }
};

export default function TrendingPage() {
    return (
        <div className="min-h-screen flex items-center justify-center text-white text-2xl font-bold p-4">
            Página de Músicas em Alta
        </div>
    );
}
