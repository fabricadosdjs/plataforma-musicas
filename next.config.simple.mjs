/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        unoptimized: true,
        remotePatterns: [
            { protocol: 'http', hostname: 'localhost', port: '3000', pathname: '/storage/**' },
            { protocol: 'https', hostname: 'i.ibb.co' },
            { protocol: 'https', hostname: 'files.catbox.moe' },
        ],
    },
    // Configurações experimentais para performance
    experimental: {
        optimizePackageImports: ['lucide-react', 'framer-motion'],
    },
    poweredByHeader: false,
    eslint: {
        ignoreDuringBuilds: true,
    },
    // Compilação otimizada
    compiler: {
        removeConsole: process.env.NODE_ENV === 'production',
    },
    // Webpack otimizado (versão simplificada)
    webpack: (config, { isServer }) => {
        // Otimizar imports de bibliotecas pesadas
        if (!isServer) {
            config.resolve.alias = {
                ...config.resolve.alias,
                // Evitar carregar dependências pesadas no frontend
                'puppeteer': false,
                '@foobar404/wave': false,
                'drizzle-orm': false,
                'cheerio': false,
                'ffmpeg-static': false,
                'archiver': false,
                'jszip': false,
                'fs-extra': false,
                'nodemailer': false,
                'resend': false,
                'oci-sdk': false,
                'pg': false,
                'postgres': false,
                'bcrypt': false,
                'bcryptjs': false,
                'uuid': false,
                'cookies-next': false,
                'dotenv': false,
                'node-fetch': false,
                'turnstile': false,
                'wavesurfer.js': false,
                'react-slick': false,
                'slick-carousel': false,
                'embla-carousel-react': false,
            };
        }

        return config;
    },
    // Compressão e otimizações
    compress: true,
    generateEtags: false,
    // Otimizar imports
    modularizeImports: {
        'lucide-react': {
            transform: 'lucide-react/dist/esm/icons/{{member}}',
        },
    },
    // Headers para cache
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
            {
                source: '/_next/static/(.*)',
                headers: [
                    {
                        key: 'Cache-Control',
                        value: 'public, max-age=31536000, immutable'
                    },
                ],
            },
        ];
    },
};

export default nextConfig;
