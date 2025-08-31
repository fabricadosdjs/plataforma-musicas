import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Minhas Músicas - Plataforma de Músicas',
    description: 'Gerencie suas músicas, faça upload de novas faixas e compartilhe com a comunidade. Central de upload para artistas e produtores.',
    keywords: 'minhas músicas, upload música, gerenciar músicas, comunidade musical, produtor, artista, upload faixas',
    openGraph: {
        title: 'Minhas Músicas - Plataforma de Músicas',
        description: 'Gerencie suas músicas, faça upload de novas faixas e compartilhe com a comunidade.',
        type: 'website',
        locale: 'pt_BR',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Minhas Músicas - Plataforma de Músicas',
        description: 'Gerencie suas músicas, faça upload de novas faixas e compartilhe com a comunidade.',
    },
};

export default function MyMusicLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return children;
}

