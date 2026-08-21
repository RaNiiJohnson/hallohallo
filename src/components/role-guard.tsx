"use client";

import { useMutation, useQuery } from "convex/react";
import { Building2, Search } from "lucide-react";
import { useTransition } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { authClient } from "@/lib/auth-client";
import { UserType } from "@/types/userType";
import { api } from "@convex/_generated/api";
import { useTranslations } from "next-intl";
import posthog from "posthog-js";

export function RoleGuard({ children }: { children: React.ReactNode }) {
  const t = useTranslations("auth.roleGuard");
  const { data: session, isPending } = authClient.useSession();
  const currentUser = useQuery(
    api.auth.auth.getCurrentUser,
    session?.user ? {} : "skip",
  );
  const [isUpdating, startTransition] = useTransition();
  const updateUser = useMutation(api.auth.users.updateUser);

  // If loading or no session, just render children
  if (isPending || !session?.user) {
    return <>{children}</>;
  }

  // Check if role is missing using real-time database state (fallback to session)
  const needsRole = !!currentUser && !currentUser.userType;

  const handleSelectRole = (
    userType: Extract<UserType, "seeker" | "provider">,
  ) => {
    startTransition(async () => {
      try {
        await updateUser({
          id: session.user.id,
          patch: {
            userType,
          },
        });
        posthog.capture("user_role_selected", { role: userType });
      } catch (e) {
        console.error("Failed to update userType", e);
      }
    });
  };

  return (
    <>
      {children}
      <Dialog open={needsRole}>
        <DialogContent
          className="sm:max-w-[425px]"
          onInteractOutside={(e) => e.preventDefault()}
          onEscapeKeyDown={(e) => e.preventDefault()}
          showCloseButton={false}
        >
          <DialogHeader>
            <DialogTitle>{t("title")}</DialogTitle>
            <DialogDescription>{t("description")}</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4 mt-4">
            <Button
              variant="outline"
              className="h-auto py-6 flex flex-col items-center gap-3 hover:border-primary hover:bg-primary/5 transition-all text-left"
              onClick={() => handleSelectRole("seeker")}
              disabled={isUpdating}
            >
              <div className="p-3 bg-primary/10 rounded-full">
                <Search className="h-6 w-6 text-primary" />
              </div>
              <div className="flex flex-col items-center gap-1">
                <span className="font-semibold text-lg">
                  {t("seeker.title")}
                </span>
                <span className="text-sm text-muted-foreground text-center">
                  {t("seeker.subtitle")}
                </span>
              </div>
            </Button>

            <Button
              variant="outline"
              className="h-auto py-6 flex flex-col items-center gap-3 hover:border-primary hover:bg-primary/5 transition-all text-left"
              onClick={() => handleSelectRole("provider")}
              disabled={isUpdating}
            >
              <div className="p-3 bg-primary/10 rounded-full">
                <Building2 className="h-6 w-6 text-primary" />
              </div>
              <div className="flex flex-col items-center gap-1">
                <span className="font-semibold text-lg">
                  {t("provider.title")}
                </span>
                <span className="text-sm text-muted-foreground text-center">
                  {t("provider.subtitle")}
                </span>
              </div>
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
