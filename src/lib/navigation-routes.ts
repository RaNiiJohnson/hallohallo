export function getAccountNavigation(slug: string | null | undefined) {
  return slug ? [{ key: "profile" as const, href: `/hl/${slug}` }] : [];
}

export const sitemapRoutes = ["", "/jobs", "/listing", "/communities"] as const;
