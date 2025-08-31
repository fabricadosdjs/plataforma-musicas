// src/middleware.ts
import { getToken } from 'next-auth/jwt';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

// Forçar uso do runtime Node.js para compatibilidade
export const runtime = 'nodejs';

// This function can be marked `async` if using `await` inside
export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request });

  // Rotas que precisam de verificação VIP
  const vipProtectedPaths = [
    '/api/download',
    '/pro',
    '/charts',
    '/trending',
    '/featured',
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
  // Verificar tanto isVip (camelCase do token) quanto is_vip (snake_case do banco)
  const isVipUser = userFromToken.isVip || userFromToken.is_vip || false;

  // Para rotas críticas, fazer verificação em tempo real na API
  // O middleware apenas verifica o token, a validação VIP é feita na API
  if (isVipProtected && !isVipUser && !isAdmin) {
    console.log('❌ Middleware: Acesso VIP negado', {
      email: userFromToken.email,
      isVip: userFromToken.isVip,
      is_vip: userFromToken.is_vip,
      isVipUser,
      isAdmin,
      path: request.nextUrl.pathname
    });
    return NextResponse.redirect(new URL('/access-denied?reason=vip', request.url));
  }

  // Para rotas Deemix, assumir que usuários VIP têm acesso (admin tem acesso total)
  // (validação específica será feita na API)
  if (isDeemixProtected && !isVipUser && !isAdmin) {
    console.log('❌ Middleware: Acesso Deemix negado', {
      email: userFromToken.email,
      isVip: userFromToken.isVip,
      is_vip: userFromToken.is_vip,
      isAdmin,
      path: request.nextUrl.pathname
    });
    return NextResponse.redirect(new URL('/access-denied?reason=deemix', request.url));
  }

  // Log de acesso permitido para debug
  if (isVipProtected || isDeemixProtected) {
    console.log('✅ Middleware: Acesso permitido', {
      email: userFromToken.email,
      isVip: userFromToken.isVip,
      is_vip: userFromToken.is_vip,
      isAdmin,
      path: request.nextUrl.pathname
    });
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