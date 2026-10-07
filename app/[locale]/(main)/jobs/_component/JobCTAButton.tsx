"use client";

import { Button } from "@/components/ui/button";
import { useAuthRequiredAction } from "@/hooks/use-auth-required-action";
import { useConvexAuth } from "convex/react";
import { useTranslations } from "next-intl";
import { PublishJobDialog } from "./dialogs/publishJobDialog";

export function JobCTAButton() {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const requireAuthentication = useAuthRequiredAction();
  const t = useTranslations("jobs");

  if (isLoading) {
    return <div className="h-11 w-40 bg-muted rounded-md animate-pulse" />;
  }

  if (isAuthenticated) {
    return (
      <PublishJobDialog trigger={<Button size="lg">{t("publish")}</Button>} />
    );
  }

  return (
    <Button size="lg" onClick={requireAuthentication}>
      {t("signIn")}
    </Button>
  );
}
