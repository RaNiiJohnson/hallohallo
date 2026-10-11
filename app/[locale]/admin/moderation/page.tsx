"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "@/i18n/navigation";
import { api } from "@convex/_generated/api";
import { usePaginatedQuery } from "convex-helpers/react/cache";
import { useMutation } from "convex/react";
import { Check, ExternalLink, Flag, Loader2 } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import { toast } from "sonner";

const PAGE_SIZE = 20;
type QueueFilter = "new" | "handled" | "all";

function ModerationSkeleton({ label }: { label: string }) {
  return (
    <div className="space-y-6" aria-label={label}>
      <div className="space-y-2">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-96 max-w-full" />
      </div>
      <div className="grid gap-3">
        {Array.from({ length: 5 }, (_, index) => (
          <Skeleton key={index} className="h-40 w-full rounded-xl" />
        ))}
      </div>
    </div>
  );
}

export default function ModerationPage() {
  const t = useTranslations("reports.queue");
  const locale = useLocale();
  const [filter, setFilter] = useState<QueueFilter>("new");
  const [pendingId, setPendingId] = useState<string | null>(null);
  const markHandled = useMutation(api.reports.markHandled);
  const queryArgs = filter === "all" ? {} : { status: filter };
  const { results, status, loadMore } = usePaginatedQuery(
    api.reports.list,
    queryArgs,
    { initialNumItems: PAGE_SIZE },
  );
  const dateFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat(locale, {
        dateStyle: "medium",
        timeStyle: "short",
      }),
    [locale],
  );

  const handleReport = async (reportId: (typeof results)[number]["_id"]) => {
    setPendingId(reportId);
    try {
      await markHandled({ reportId });
      toast.success(t("handledSuccess"));
    } catch {
      toast.error(t("handledError"));
    } finally {
      setPendingId(null);
    }
  };

  if (status === "LoadingFirstPage") {
    return <ModerationSkeleton label={t("loading")} />;
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">{t("title")}</h2>
          <p className="text-muted-foreground">{t("description")}</p>
        </div>
        <div className="flex flex-wrap gap-2" aria-label={t("filters.label")}>
          {(["new", "handled", "all"] as const).map((value) => (
            <Button
              key={value}
              type="button"
              size="sm"
              variant={filter === value ? "default" : "outline"}
              onClick={() => setFilter(value)}
            >
              {t(`filters.${value}`)}
            </Button>
          ))}
        </div>
      </div>

      {results.length === 0 ? (
        <div className="flex min-h-72 items-center justify-center rounded-xl border border-dashed bg-card p-8 text-center">
          <div className="max-w-md">
            <div className="mx-auto flex size-11 items-center justify-center rounded-full bg-muted">
              <Flag className="size-5 text-muted-foreground" />
            </div>
            <h3 className="mt-4 font-semibold">{t("emptyTitle")}</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              {t("emptyDescription")}
            </p>
          </div>
        </div>
      ) : (
        <div className="grid gap-3">
          {results.map((report) => (
            <article key={report._id} className="rounded-xl border bg-card p-4">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0 space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge
                      variant={report.status === "new" ? "default" : "secondary"}
                    >
                      {t(`statuses.${report.status}`)}
                    </Badge>
                    <Badge variant="outline">
                      {t(`targetTypes.${report.targetType}`)}
                    </Badge>
                    <Badge variant="outline">
                      {t(`reasons.${report.reason}`)}
                    </Badge>
                  </div>

                  <div>
                    <Link
                      href={report.targetHref}
                      className="inline-flex max-w-full items-center gap-1.5 font-semibold text-primary hover:underline"
                    >
                      <span className="truncate">{report.targetLabel}</span>
                      <ExternalLink className="size-3.5 shrink-0" />
                    </Link>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {t("reportedBy", {
                        name: report.reporterName ?? report.reporterId,
                      })}{" "}
                      · {dateFormatter.format(new Date(report.reportedAt))}
                    </p>
                  </div>

                  {report.details ? (
                    <p className="whitespace-pre-wrap text-sm leading-relaxed">
                      {report.details}
                    </p>
                  ) : null}

                  {report.status === "handled" && report.handledAt ? (
                    <p className="text-xs text-muted-foreground">
                      {t("handledBy", {
                        name: report.handledByName ?? report.handledById ?? "—",
                        date: dateFormatter.format(new Date(report.handledAt)),
                      })}
                    </p>
                  ) : null}
                </div>

                {report.status === "new" ? (
                  <Button
                    type="button"
                    size="sm"
                    className="shrink-0 gap-2"
                    disabled={pendingId === report._id}
                    onClick={() => handleReport(report._id)}
                  >
                    {pendingId === report._id ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <Check className="size-4" />
                    )}
                    {t("markHandled")}
                  </Button>
                ) : null}
              </div>
            </article>
          ))}
        </div>
      )}

      {status === "CanLoadMore" || status === "LoadingMore" ? (
        <div className="flex justify-center">
          <Button
            variant="outline"
            onClick={() => loadMore(PAGE_SIZE)}
            disabled={status === "LoadingMore"}
            className="gap-2"
          >
            {status === "LoadingMore" ? (
              <Loader2 className="size-4 animate-spin" />
            ) : null}
            {t(status === "LoadingMore" ? "loadingMore" : "loadMore")}
          </Button>
        </div>
      ) : null}
    </div>
  );
}
