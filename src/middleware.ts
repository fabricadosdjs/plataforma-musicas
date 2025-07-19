// src/middleware.ts
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

const isAdminRoute = createRouteMatcher([
  '/admin(.*)', // Protege a rota /admin e todas as suas sub-rotas
]);

export default clerkMiddleware((auth, req) => {
  // Verifica se o utilizador está a tentar aceder a uma rota de admin
  if (isAdminRoute(req)) {
    // Primeiro, protege a rota para garantir que o utilizador está logado
    auth.protect(); // CORREÇÃO APLICADA AQUI

    // Depois, verifica se o utilizador logado tem a permissão de admin
    const { sessionClaims } = auth();
    if (sessionClaims?.publicMetadata?.role !== 'admin') {
      // Se não for admin, redireciona para a página inicial
      const homeUrl = new URL('/new', req.url);
      return NextResponse.redirect(homeUrl);
    }
  }
  
  // Permite o acesso a todas as outras rotas
  return NextResponse.next();
});

export const config = {
  matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)'],
};