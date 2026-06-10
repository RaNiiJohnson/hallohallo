"use client";

import { authClient } from "@/lib/auth-client";
import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, isPending } = authClient.useSession();
  const router = useRouter();
  const locale = useLocale();

  useEffect(() => {
    if (!isPending && session) {
      router.replace(`/${locale}`);
    }
  }, [session, isPending, router, locale]);

  // Still checking session → render nothing to avoid flash
  if (isPending) return null;

  // Already authenticated → render nothing while redirect happens
  if (session) return null;

  return <>{children}</>;
}
