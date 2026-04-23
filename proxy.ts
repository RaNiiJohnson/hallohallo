import createMiddleware from "next-intl/middleware";
import { routing } from "./src/i18n/routing";

export const proxy = createMiddleware(routing);

export const config = {
  // Match only internationalized pathnames
  matcher: ["/", "/(fr|en|de)/:path*"],
};
