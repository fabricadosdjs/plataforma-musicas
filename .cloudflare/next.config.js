// .cloudflare/next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
    // Desabilitar build estático para componentes client-side
    experimental: {
        isrMemoryCacheSize: 0,
        nodeMiddleware: true,
    },

    // Configurações específicas para Cloudflare Pages
    output: 'export',
    trailingSlash: true,

    // Desabilitar otimizações que podem causar problemas
    swcMinify: false,

    // Configurações de imagens
    images: {
        unoptimized: true,
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'i.ibb.co',
            },
            {
                protocol: 'https',
                hostname: 'files.catbox.moe',
            },
        ],
    },

    // Headers para Cloudflare
    async headers() {
        return [
            {
                source: '/(.*)',
                headers: [
                    {
                        key: 'Cross-Origin-Embedder-Policy',
                        value: 'unsafe-none'
                    },
                    {
                        key: 'Cross-Origin-Opener-Policy',
                        value: 'same-origin-allow-popups'
                    },
                ],
            },
        ];
    },
};

module.exports = nextConfig;
