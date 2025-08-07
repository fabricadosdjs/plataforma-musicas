// src/app/charts/page.tsx
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Charts - Rankings Musicais',
    description: 'Confira os rankings oficiais e charts musicais. Top 100 das músicas mais tocadas, baixadas e curtidas por DJs profissionais.',
    keywords: 'charts, rankings, top 100, música mais tocada, top songs, dj charts, electronic charts, house charts',
    openGraph: {
        title: 'Charts - Rankings Musicais para DJs',
        description: 'Confira os rankings oficiais e charts musicais. Top 100 das músicas mais tocadas e curtidas.',
        images: ['/images/og/charts.jpg'],
    },
    alternates: {
        canonical: '/charts',
    }
};

export default function ChartsPage() {
    return (
        <div className="min-h-screen flex items-center justify-center text-white text-2xl font-bold p-4 z-0" style={{ backgroundColor: '#1B1C1D', zIndex: 0 }}>
            Página de Rankings (Charts)
        </div>
    );
}
