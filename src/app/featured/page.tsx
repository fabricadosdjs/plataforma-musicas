// src/middleware.ts
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isPublicRoute = createRouteMatcher([
  "/",
  "/new",
  "/featured",
  "/trending",
  "/charts",
  "/api/tracks",
]);

export default clerkMiddleware((auth, req) => {
  if (!isPublicRoute(req)) {
    auth().protect();
  }

  // Protege rotas /admin para usuários com role "admin"
  if (req.nextUrl.pathname.startsWith("/admin")) {
    if (auth().userId && auth().sessionClaims?.publicMetadata?.role !== "admin") {
      return new Response(null, {
        status: 302,
        headers: { Location: "/new" },
      });
    }
  }
});

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
