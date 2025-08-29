/** @type {import('next').NextConfig} */
const nextConfig = {
    // Configurações de imagens
    images: {
        unoptimized: true,
        remotePatterns: [
            {
                protocol: 'http',
                hostname: 'localhost',
                port: '3000',
                pathname: '/storage/**',
            },
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

    // Configurações experimentais
    experimental: {
        isrMemoryCacheSize: 0,
    },

    // Headers para CORS e segurança
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

export default nextConfig;
