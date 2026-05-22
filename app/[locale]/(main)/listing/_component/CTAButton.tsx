"use client";

import { useConvexAuth } from "convex/react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { PublishListingDialog } from "./dialogs/publishListingDialog";
import { useTranslations } from "next-intl";

export function CTAButton() {
  const { isAuthenticated } = useConvexAuth();
  const t = useTranslations("listing");

  if (isAuthenticated) {
    return (
      <PublishListingDialog
        trigger={<Button size="lg">{t("cta.publish")}</Button>}
      />
    );
  }

  return (
    <Link href="/register" className={buttonVariants({ size: "lg" })}>
      {t("cta.registerToPublish")}
    </Link>
  );
}
