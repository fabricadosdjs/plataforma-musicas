export default function generateOGImage(
    title: string,
    subtitle?: string,
    backgroundImage?: string
): string {
    // Esta seria uma função para gerar imagens OG dinâmicas
    // Por enquanto, retorna URLs estáticas, mas pode ser expandida
    // para usar serviços como @vercel/og ou similar

    const params = new URLSearchParams({
        title: title,
        subtitle: subtitle || '',
        bg: backgroundImage || 'default'
    });

    // URL que poderia gerar imagens dinâmicas
    return `/api/og?${params.toString()}`;
}

// URLs para imagens estáticas pré-definidas
export const OG_IMAGES = {
    home: '/images/og/home.jpg',
    new: '/images/og/new-music.jpg',
    trending: '/images/og/trending.jpg',
    charts: '/images/og/charts.jpg',
    featured: '/images/og/featured.jpg',
    profile: '/images/og/profile.jpg',
    admin: '/images/og/admin.jpg',
    auth: '/images/og/auth.jpg',
    pro: '/images/og/pro.jpg',
    default: '/images/og/default.jpg'
};
