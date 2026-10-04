"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useConvexAuth } from "convex/react";
import { ChevronDown, FilePlus2, Plus, UsersRound } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { CreateCommunityDialog } from "./_component/dialogs/createComDialog";
import { CreatePostDialog } from "./_component/dialogs/createPostDialog";
import ComList from "./_component/List/comList";

export default function Page() {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const t = useTranslations("communities");
  const [createPostOpen, setCreatePostOpen] = useState(false);
  const [createCommunityOpen, setCreateCommunityOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background pb-12">
      {/* Header */}
      <div className="max-w-4xl mx-auto px-4 pt-5">
        <div className="flex items-center justify-between gap-3 mb-3">
          <h1 className="text-xl font-bold">{t("title")}</h1>
          {isAuthenticated && !isLoading && (
            <>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button size="sm" className="gap-1.5 rounded-full">
                    <Plus className="size-4" />
                    <span>{t("createActionShort")}</span>
                    <ChevronDown className="size-3.5" />
                    <span className="sr-only">
                      {t("dialogs.createPost.trigger")} /{" "}
                      {t("dialogs.createCommunity.trigger")}
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="min-w-52">
                  <DropdownMenuItem onSelect={() => setCreatePostOpen(true)}>
                    <FilePlus2 className="size-4" />
                    {t("dialogs.createPost.trigger")}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onSelect={() => setCreateCommunityOpen(true)}
                  >
                    <UsersRound className="size-4" />
                    {t("dialogs.createCommunity.trigger")}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <CreatePostDialog
                trigger={null}
                open={createPostOpen}
                onOpenChange={setCreatePostOpen}
              />
              <CreateCommunityDialog
                trigger={null}
                open={createCommunityOpen}
                onOpenChange={setCreateCommunityOpen}
              />
            </>
          )}
        </div>
      </div>

      {/* Feed */}
      <ComList />
    </div>
  );
}
