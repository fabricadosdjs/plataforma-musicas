// src/middleware.ts
import { getToken } from 'next-auth/jwt';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

// This function can be marked `async` if using `await` inside
export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request });

  // Rotas que precisam de verificação VIP
  const vipProtectedPaths = [
    '/api/download',
    // '/api/tracks', // Temporariamente removido para teste
    '/pro',
    '/charts',
    '/trending',
    '/featured',
    // '/new'  // Temporariamente removido para permitir acesso sem login
  ];

  // Rotas que precisam de verificação Deemix
  const deemixProtectedPaths = [
    '/api/extract'
  ];

  const isVipProtected = vipProtectedPaths.some(path =>
    request.nextUrl.pathname.startsWith(path)
  );

  const isDeemixProtected = deemixProtectedPaths.some(path =>
    request.nextUrl.pathname.startsWith(path)
  );

  // Se não é uma rota protegida, continua normalmente
  if (!isVipProtected && !isDeemixProtected) {
    return NextResponse.next();
  }

  // Se não está logado, redireciona para login
  if (!token?.sub) {
    const loginUrl = new URL('/auth/sign-in', request.url);
    loginUrl.searchParams.set('callbackUrl', request.url);
    return NextResponse.redirect(loginUrl);
  }

  // Usar dados do token JWT em vez de consultar o banco
  // (as validações em tempo real serão feitas nas próprias APIs)
  const userFromToken = token as any;

  // Verificar se é admin
  const isAdmin = userFromToken.email === 'edersonleonardo@nexorrecords.com.br';

  // Verifica acesso VIP baseado no token (admin tem acesso total)
  if (isVipProtected && !userFromToken.is_vip && !isAdmin) {
    return NextResponse.redirect(new URL('/access-denied?reason=vip', request.url));
  }

  // Para rotas Deemix, assumir que usuários VIP têm acesso (admin tem acesso total)
  // (validação específica será feita na API)
  if (isDeemixProtected && !userFromToken.is_vip && !isAdmin) {
    return NextResponse.redirect(new URL('/access-denied?reason=deemix', request.url));
  }

  return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: [
    // Proteger rotas específicas em vez de usar regex complexa
    '/pro/:path*',
    '/charts/:path*',
    '/trending/:path*',
    '/featured/:path*',
    '/new/:path*',
    '/api/download/:path*',
    '/api/tracks/:path*',
    '/api/extract/:path*'
  ],
};