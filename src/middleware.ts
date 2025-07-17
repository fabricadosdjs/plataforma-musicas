import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextRequest } from 'next/server';

// Define quais rotas são protegidas e exigem login
const isProtectedRoute = createRouteMatcher([
  '/admin(.*)', // Exemplo: protege a rota /admin e suas sub-rotas
]);

export default clerkMiddleware((auth, req: NextRequest) => {
  if (isProtectedRoute(req)) {
    // CORREÇÃO: Chamamos o método protect() diretamente no objeto auth.
    // Forma incorreta: auth().protect()
    // Forma correta: auth.protect()
    auth.protect();
  }
});

export const config = {
  matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)'],
};
