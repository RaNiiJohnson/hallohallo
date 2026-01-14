"use client";

import { Button } from "@/components/ui/button";
import { Briefcase, MapPin, Clock } from "lucide-react";
import { PublishJobDialog } from "./dialogs/publishJobDialog";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { SalaryDisplay } from "./salary";
import type { AuthUser, JobOfferListItem } from "@/lib/convexTypes";
import { getRelativeTime } from "@/lib/date";

interface JobListProps {
  jobs: JobOfferListItem[];
  user: AuthUser | null | undefined;
}

export function JobList({ jobs, user }: JobListProps) {
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
          {user && (
            <PublishJobDialog trigger={<Button>Publier une offre</Button>} />
          )}
        </div>
      </div>
    );
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
                  {getRelativeTime(job.createdAt)}
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
    </div>
  );
}
