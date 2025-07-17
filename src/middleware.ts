// src/middleware.ts
// Importar clerkMiddleware em vez de authMiddleware
import { clerkMiddleware } from "@clerk/nextjs/server"; // <--- MUDANÇA AQUI!

export default clerkMiddleware({
    publicRoutes: ["/", "/new", "/trending", "/charts", "/featured", "/pro"],
});

export const config = {
    matcher: ["/((?!_next|.*\\..*).*)"],
};
