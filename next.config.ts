// next.config.ts
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    domains: ['placehold.co', 'i.ibb.co', 'files.catbox.moe'],
  },
  serverExternalPackages: ['@prisma/client'],
  async headers() {
    return [
      {
        // Configurações para downloads
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
