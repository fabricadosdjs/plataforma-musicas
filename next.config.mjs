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
    // Configuração mínima para evitar problemas de webpack
    experimental: {},
    poweredByHeader: false,
};

export default nextConfig;
