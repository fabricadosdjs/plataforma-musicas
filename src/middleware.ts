// src/middleware.ts
// Importar clerkMiddleware e createRouteMatcher
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// Define as rotas que devem ser públicas (acessíveis sem autenticação)
const isPublicRoute = createRouteMatcher([
    "/",
    "/new",
    "/trending",
    "/charts",
    "/featured",
    "/pro",
    // Adicione outras rotas públicas aqui, se houver (ex: /api/webhooks)
]);

// O middleware do Clerk.
// 'auth' já é o objeto de autenticação, não precisa ser chamado como função.
export default clerkMiddleware((auth, req) => { // <--- MUDANÇA AQUI: Removido 'async'
    // Se a rota NÃO for pública, protege-a (exige autenticação)
    if (!isPublicRoute(req)) {
        auth.protect(); // <--- MUDANÇA AQUI: Removido 'await' e parênteses de 'auth()'
    }
});

export const config = {
    // Define quais rotas o middleware deve aplicar.
    // Isso garante que o middleware do Clerk proteja todas as rotas, exceto as especificadas em publicRoutes.
    matcher: ["/((?!_next|.*\\..*).*)", "/(api|trpc)(.*)"],
};