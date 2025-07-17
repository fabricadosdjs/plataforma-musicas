import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

// Define quais rotas são protegidas e exigem login
const isProtectedRoute = createRouteMatcher([
  '/admin(.*)', // Exemplo: protege a rota /admin e suas sub-rotas
]);

export default clerkMiddleware((auth, req) => {
  if (isProtectedRoute(req)) {
    auth().protect();
  }
});

export const config = {
  matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)'],
};
