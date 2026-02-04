"use client";

import { Briefcase, MapPin, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { SalaryDisplay } from "./salary";
import { getRelativeTime } from "@/lib/date";
import { JobPageSkeleton } from "./skeleton";
import { api } from "@convex/_generated/api";
import { usePaginatedQuery } from "convex-helpers/react/cache";
import { parseAsString, useQueryStates } from "nuqs";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import clsx from "clsx";

export function JobList() {
  const [filters] = useQueryStates({
    search: parseAsString,
    type: parseAsString,
    contract: parseAsString,
  });
  const {
    results: jobs,
    status,
    loadMore,
  } = usePaginatedQuery(
    api.jobs.getJobs,
    {
      contractType: filters.contract || undefined,
      searchTerm: filters.search || undefined,
      type: filters.type || undefined,
    },
    { initialNumItems: 5 },
  );

  if (status === "LoadingFirstPage") {
    return <JobPageSkeleton />;
  }
  if (jobs.length === 0) {
    return (
      <div className="text-center px-4">
        <div className="max-w-md mx-auto">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
            <Briefcase className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-semibold mb-2">Aucune offre trouvée</h3>
          <p className="text-muted-foreground mb-6">
            Essayez de modifier vos critères de recherche ou supprimez certains
            filtres
          </p>
        </div>
      </div>
    );
  }

  function loadMoreJobs() {
    if (status === "CanLoadMore") {
      loadMore(1);
    } else {
      toast.info("Toutes les offres ont été chargées");
    }
  }

  return (
    <div className="space-y-3">
      {jobs.map((job) => (
        <Link key={job._id} href={`/jobs/${job._id}`} className="block group">
          <div className="bg-card border border-border rounded-lg p-4 hover:shadow-md transition-all duration-200 hover:border-primary/30">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                {/* Title */}
                <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors mb-1 line-clamp-1">
                  {job.title}
                </h3>

                {/* Company */}
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm font-medium text-foreground">
                    {job.company}
                  </span>
                </div>

                {/* Location & Type */}
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground mb-3">
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    <span>{job.city}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Briefcase className="h-4 w-4" />
                    <span>{job.type}</span>
                  </div>
                  {job.salary && (
                    <div className="flex items-center gap-1">
                      <SalaryDisplay
                        salary={job.salary}
                        className="text-foreground"
                      />
                    </div>
                  )}
                </div>

                {/* Badges */}
                <div className="flex flex-wrap items-center gap-2">
                  <Badge
                    variant="secondary"
                    className="bg-secondary/50 hover:bg-secondary/70 text-xs font-normal"
                  >
                    {job.contractType}
                  </Badge>
                  {job.duration && (
                    <Badge variant="outline" className="text-xs font-normal">
                      <Clock className="h-3 w-3 mr-1" />
                      {job.duration}
                    </Badge>
                  )}
                </div>
              </div>

              {/* Date */}
              <div className="flex flex-col items-end gap-1">
                <div className="text-xs text-muted-foreground whitespace-nowrap">
                  {getRelativeTime(job._creationTime)}
                </div>
                {/* {user && (
                  // <JobBookmarkButton
                  //   jobId={job._id}
                  //   initialIsBookmarked={job.isBookmarked}
                  // />
                )} */}
              </div>
            </div>
          </div>
        </Link>
      ))}
      <Button
        variant="outline"
        onClick={loadMoreJobs}
        className={clsx("mx-auto flex items-center mt-5", {
          "cursor-not-allowed opacity-50": status !== "CanLoadMore",
        })}
      >
        {status === "LoadingMore" ? "Chargement..." : "Voir plus d'offres"}
      </Button>
    </div>
  );
}
