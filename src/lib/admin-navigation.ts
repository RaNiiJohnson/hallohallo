export type AdminNavigationKey =
  | "dashboard"
  | "users"
  | "audit"
  | "analytics";

export type AdminNavigationItem = {
  key: AdminNavigationKey;
  href: string;
  external: boolean;
};

type AdminIdentityInput = {
  name?: string | null;
  email?: string | null;
  image?: string | null;
};

export const RETIRED_ADMIN_ROUTES = [
  "/admin/moderation",
  "/admin/jobs",
  "/admin/listing",
  "/admin/communities",
  "/admin/statistics",
  "/admin/settings",
] as const;

export function getPostHogDashboardUrl(value: string | undefined) {
  if (!value) return null;

  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:"
      ? url.toString()
      : null;
  } catch {
    return null;
  }
}

export function getAdminNavigation(
  postHogDashboardUrl: string | undefined,
): AdminNavigationItem[] {
  const navigation: AdminNavigationItem[] = [
    { key: "dashboard", href: "/admin", external: false },
    { key: "users", href: "/admin/users", external: false },
    { key: "audit", href: "/admin/audit", external: false },
  ];
  const analyticsUrl = getPostHogDashboardUrl(postHogDashboardUrl);

  if (analyticsUrl) {
    navigation.push({
      key: "analytics",
      href: analyticsUrl,
      external: true,
    });
  }

  return navigation;
}

export function getAdminIdentity(
  user: AdminIdentityInput | null | undefined,
  loadingLabel: string,
) {
  const image = user?.image;

  return {
    name: user?.name || loadingLabel,
    email: user?.email || "",
    image:
      image?.startsWith("http") || image?.startsWith("/") ? image : "",
  };
}
