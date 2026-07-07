import createMiddleware from "next-intl/middleware";
import { NextRequest, NextResponse } from "next/server";
import { routing } from "./src/i18n/routing";

const intlProxy = createMiddleware(routing);

/** Pages inaccessibles si l'utilisateur est déjà connecté */
const AUTH_ONLY_PAGES = ["/login", "/register", "/verify-email"];

/** Nom du cookie marqueur : "l'utilisateur connecté a déjà été redirigé vers /community" */
const HOME_REDIRECT_COOKIE = "home_redirected";

export default async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const hostname = req.headers.get("host") || "";
  const isAdmin = hostname.startsWith("admin.");

  // Fix CVE-2026-44573 — bloquer les routes /_next/data sans préfixe de locale
  const dataRouteWithoutLocale = /^\/_next\/data\/[^/]+\/(?!(fr|en|de)\/)/;
  if (dataRouteWithoutLocale.test(pathname)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const bare = pathname.replace(/^\/(fr|en|de)/, "") || "/";

  const hasSession =
    req.cookies.has("better-auth.session_token") ||
    req.cookies.has("__Secure-better-auth.session_token");

  const locale = pathname.match(/^\/(fr|en|de)/)?.[1] ?? routing.defaultLocale;

  // Rediriger vers l'accueil si l'utilisateur est connecté et tente d'accéder à une page auth
  if (AUTH_ONLY_PAGES.some((p) => bare.startsWith(p))) {
    if (hasSession) {
      return NextResponse.redirect(new URL(`/${locale}`, req.url));
    }
  }

  // Connecté + arrive sur la page d'accueil ("/", "/fr", "/en", "/de")
  // -> redirection vers /communities UNIQUEMENT lors de la première ouverture du site
  //    (tant que le cookie marqueur n'est pas présent).
  if (hasSession && bare === "/") {
    const alreadyRedirected = req.cookies.has(HOME_REDIRECT_COOKIE);

    if (!alreadyRedirected) {
      const response = NextResponse.redirect(
        new URL(`/${locale}/communities`, req.url),
      );

      // Cookie de session (pas de maxAge/expires) : il expire à la fermeture
      // du navigateur, donc "première ouverture" redeviendra vrai à layy prochaine session.
      response.cookies.set(HOME_REDIRECT_COOKIE, "1", {
        path: "/",
        sameSite: "lax",
      });

      return response;
    }

    // Cookie déjà présent -> on laisse l'utilisateur voir "/" normalement
    return intlProxy(req);
  }

  if (isAdmin) {
    // Determine the main domain by removing "admin." from the hostname
    const mainDomainUrl = req.nextUrl.clone();
    mainDomainUrl.hostname = hostname.replace(/^admin\./, "");

    if (!hasSession) {
      mainDomainUrl.pathname = "/login";
      return NextResponse.redirect(mainDomainUrl);
    }

    // Use Better Auth's get-session endpoint
    const sessionRes = await fetch(`${mainDomainUrl.origin}/api/auth/get-session`, {
      headers: { cookie: req.headers.get("cookie") || "" },
    });

    if (!sessionRes.ok) {
      mainDomainUrl.pathname = "/";
      return NextResponse.redirect(mainDomainUrl);
    }

    const sessionData = await sessionRes.json();
    if (sessionData?.user?.role !== "admin") {
      mainDomainUrl.pathname = "/";
      return NextResponse.redirect(mainDomainUrl);
    }

    return NextResponse.rewrite(
      new URL(`/admin${req.nextUrl.pathname}`, req.url),
    );
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
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|html|xml|txt)$).*)",
  ],
};
