import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
    const response = NextResponse.next();

    // Headers de performance para APIs
    if (request.nextUrl.pathname.startsWith('/api/')) {
        // Compression hints
        response.headers.set('Accept-Encoding', 'gzip, deflate, br');
        
        // Cache otimizado para APIs específicas
        if (request.nextUrl.pathname.includes('/api/tracks/')) {
            // APIs de tracks podem ser cacheadas por mais tempo
            response.headers.set('Cache-Control', 'public, max-age=120, stale-while-revalidate=240');
        }

        // Headers de performance
        response.headers.set('X-Content-Type-Options', 'nosniff');
        response.headers.set('X-Frame-Options', 'DENY');
        
        // Preload hint para próximas páginas
        if (request.nextUrl.pathname === '/api/tracks/new') {
            const currentPage = parseInt(request.nextUrl.searchParams.get('page') || '1');
            const nextPage = currentPage + 1;
            response.headers.set('Link', `</api/tracks/new?page=${nextPage}>; rel=prefetch`);
        }
    }

    // Headers para páginas estáticas
    if (request.nextUrl.pathname.startsWith('/_next/static/')) {
        response.headers.set('Cache-Control', 'public, max-age=31536000, immutable');
    }

    // Headers para imagens
    if (request.nextUrl.pathname.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i)) {
        response.headers.set('Cache-Control', 'public, max-age=86400, stale-while-revalidate=172800');
    }

    return response;
}

export const config = {
    matcher: [
        '/api/:path*',
        '/_next/static/:path*',
        '/((?!api|_next/static|_next/image|favicon.ico).*)',
    ],
};
