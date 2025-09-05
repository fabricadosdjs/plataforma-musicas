// Função para gerar slug a partir do nome da playlist
export function generatePlaylistSlug(name: string): string {
    return name
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '') // Remove caracteres especiais
        .replace(/\s+/g, '-') // Substitui espaços por hífens
        .replace(/-+/g, '-') // Remove hífens duplicados
        .trim();
}

// Função para extrair ID do slug
export function extractIdFromSlug(slug: string): number | null {
    const match = slug.match(/(\d+)$/);
    return match ? parseInt(match[1]) : null;
}

// Função para gerar URL da playlist
export function generatePlaylistUrl(playlist: { id: number; name: string }): string {
    const slug = generatePlaylistSlug(playlist.name);
    return `/playlists/${slug}-${playlist.id}`;
}

// Função para gerar URL de gerenciamento da playlist
export function generateManagerPlaylistUrl(playlist: { id: number; name: string }): string {
    const slug = generatePlaylistSlug(playlist.name);
    return `/manager/playlist/${slug}-${playlist.id}`;
}


