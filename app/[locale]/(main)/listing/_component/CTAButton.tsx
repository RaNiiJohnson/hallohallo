"use client";

import { Button } from "@/components/ui/button";
import { useAuthRequiredAction } from "@/hooks/use-auth-required-action";
import { useConvexAuth } from "convex/react";
import { useTranslations } from "next-intl";
import { PublishListingDialog } from "./dialogs/publishListingDialog";

export function CTAButton() {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const requireAuthentication = useAuthRequiredAction();
  const t = useTranslations("listing");

  if (isLoading) {
    return <div className="h-11 w-40 bg-muted rounded-md animate-pulse" />;
  }

  if (isAuthenticated) {
    return (
      <PublishListingDialog
        trigger={<Button size="lg">{t("cta.publish")}</Button>}
      />
    );
  }

  return (
    <Button size="lg" onClick={requireAuthentication}>
      {t("cta.registerToPublish")}
    </Button>
  );
}
