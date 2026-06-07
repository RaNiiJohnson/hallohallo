"use client";

import { Button, buttonVariants } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { useConvexAuth } from "convex/react";
import { useTranslations } from "next-intl";
import { PublishJobDialog } from "./dialogs/publishJobDialog";

export function JobCTAButton() {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const t = useTranslations("jobs");

  if (isLoading) {
    return <div className="h-11 w-40 bg-muted rounded-md animate-pulse" />;
  }

  if (isAuthenticated) {
    return (
      <PublishJobDialog
        trigger={<Button size="lg">{t("publish")}</Button>}
      />
    );
  }

  return (
    <Link href="/register" className={buttonVariants({ size: "lg" })}>
      {t("signIn")}
    </Link>
  );
}
