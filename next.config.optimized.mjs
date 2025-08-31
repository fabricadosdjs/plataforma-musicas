/** @type {import('next').NextConfig} */
const nextConfig = {
    // Configurações de imagens otimizadas
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

    // Configurações experimentais para performance
    experimental: {
        isrMemoryCacheSize: 0,
        optimizeCss: true,
        optimizePackageImports: ['lucide-react', '@radix-ui/react-icons'],
        turbo: {
            rules: {
                '*.svg': {
                    loaders: ['@svgr/webpack'],
                    as: '*.js',
                },
            },
        },
    },

    // Compilação otimizada
    swcMinify: true,
    compiler: {
        removeConsole: process.env.NODE_ENV === 'production',
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
                    // Headers de cache para melhorar performance
                    {
                        key: 'Cache-Control',
                        value: 'public, max-age=31536000, immutable'
                    },
                ],
            },
            // Headers específicos para assets estáticos
            {
                source: '/_next/static/(.*)',
                headers: [
                    {
                        key: 'Cache-Control',
                        value: 'public, max-age=31536000, immutable'
                    },
                ],
            },
            {
                source: '/images/(.*)',
                headers: [
                    {
                        key: 'Cache-Control',
                        value: 'public, max-age=31536000, immutable'
                    },
                ],
            },
        ];
    },

    // Webpack otimizado
    webpack: (config, { dev, isServer }) => {
        // Otimizações para produção
        if (!dev && !isServer) {
            config.optimization = {
                ...config.optimization,
                splitChunks: {
                    chunks: 'all',
                    cacheGroups: {
                        vendor: {
                            test: /[\\/]node_modules[\\/]/,
                            name: 'vendors',
                            chunks: 'all',
                        },
                        common: {
                            name: 'common',
                            minChunks: 2,
                            chunks: 'all',
                            enforce: true,
                        },
                    },
                },
            };
        }

        // Otimizações para SVG
        config.module.rules.push({
            test: /\.svg$/,
            use: ['@svgr/webpack'],
        });

        return config;
    },

    // Configurações de performance
    poweredByHeader: false,
    generateEtags: false,

    // Configurações de compressão
    compress: true,

    // Configurações de bundle analyzer (opcional)
    ...(process.env.ANALYZE === 'true' && {
        webpack: (config) => {
            const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
            config.plugins.push(
                new BundleAnalyzerPlugin({
                    analyzerMode: 'static',
                    openAnalyzer: false,
                })
            );
            return config;
        },
    }),
};

export default nextConfig;

