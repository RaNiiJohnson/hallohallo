"use client";

import { Button } from "@/components/ui/button";
import { api } from "@convex/_generated/api";
import { Id } from "@convex/_generated/dataModel";
import { Archive, CheckCircle2, Loader2, RotateCcw } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { toast } from "sonner";
import { useMutation } from "convex/react";

type JobStatus = "active" | "closed" | "archived";

export function JobLifecycleActions({
  jobId,
  status = "active",
}: {
  jobId: Id<"JobOffer">;
  status?: JobStatus;
}) {
  const setJobStatus = useMutation(api.jobs.mutations.setJobStatus);
  const [pendingStatus, setPendingStatus] = useState<JobStatus | null>(null);
  const t = useTranslations("jobs.dialogs.lifecycle");

  async function changeStatus(nextStatus: JobStatus) {
    setPendingStatus(nextStatus);
    try {
      await setJobStatus({ id: jobId, status: nextStatus });
      toast.success(t("success"));
    } catch {
      toast.error(t("error"));
    } finally {
      setPendingStatus(null);
    }
  }

  const isPending = pendingStatus !== null;
  const iconFor = (nextStatus: JobStatus) =>
    pendingStatus === nextStatus ? (
      <Loader2 className="size-4 animate-spin" />
    ) : null;

  if (status === "archived") {
    return (
      <Button
        size="sm"
        variant="outline"
        disabled={isPending}
        onClick={() => changeStatus("active")}
      >
        {iconFor("active") ?? <RotateCcw className="size-4" />}
        {t("restore")}
      </Button>
    );
  }

  if (status === "closed") {
    return (
      <>
        <Button
          size="sm"
          variant="outline"
          disabled={isPending}
          onClick={() => changeStatus("active")}
        >
          {iconFor("active") ?? <RotateCcw className="size-4" />}
          {t("reopen")}
        </Button>
        <Button
          size="sm"
          variant="destructive"
          disabled={isPending}
          onClick={() => changeStatus("archived")}
        >
          {iconFor("archived") ?? <Archive className="size-4" />}
          {t("archive")}
        </Button>
      </>
    );
  }

  return (
    <Button
      size="sm"
      variant="outline"
      disabled={isPending}
      onClick={() => changeStatus("closed")}
    >
      {iconFor("closed") ?? <CheckCircle2 className="size-4" />}
      {t("close")}
    </Button>
  );
}
