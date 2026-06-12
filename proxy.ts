import createMiddleware from "next-intl/middleware";
import { NextRequest, NextResponse } from "next/server";
import { routing } from "./src/i18n/routing";

const intlProxy = createMiddleware(routing);

/** Pages inaccessibles si l'utilisateur est déjà connecté */
const AUTH_ONLY_PAGES = ["/login", "/register", "/verify-email"];

export default function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Fix CVE-2026-44573 — bloquer les routes /_next/data sans préfixe de locale
  const dataRouteWithoutLocale = /^\/_next\/data\/[^/]+\/(?!(fr|en|de)\/)/;
  if (dataRouteWithoutLocale.test(pathname)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Rediriger vers l'accueil si l'utilisateur est connecté et tente d'accéder à une page auth
  const bare = pathname.replace(/^\/(fr|en|de)/, "") || "/";
  if (AUTH_ONLY_PAGES.some((p) => bare.startsWith(p))) {
    const hasSession =
      req.cookies.has("better-auth.session_token") ||
      req.cookies.has("__Secure-better-auth.session_token");

    if (hasSession) {
      const locale =
        pathname.match(/^\/(fr|en|de)/)?.[1] ?? routing.defaultLocale;
      return NextResponse.redirect(new URL(`/${locale}`, req.url));
    }
  }

  return intlProxy(req);
}

export const config = {
  matcher: [
    // Intercepter les routes _next/data (fix CVE)
    "/_next/data/:path*",
    // Pages normales
    "/",
    "/(fr|en|de)/:path*",
    // Exclure les fichiers statiques
    // Exclude API routes (e.g. NextAuth) and static assets from the middleware
    "/((?!api|_next/static|_next/image|favicon.ico|.*\.(?:svg|png|jpg|jpeg|gif|webp|html|xml|txt)$).*)",
  ],
};
