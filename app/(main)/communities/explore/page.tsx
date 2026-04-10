"use client";

import { api } from "@convex/_generated/api";
import { usePaginatedQuery } from "convex/react";
import { Users, LayoutGrid } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function ExploreCommunitiesPage() {
  const { results, status, loadMore } = usePaginatedQuery(
    api.communities.getCommunitiesPreview,
    {},
    { initialNumItems: 12 },
  );

  return (
    <div className="min-h-screen bg-background pb-12">
      <div className="max-w-6xl mx-auto lg:px-4 sm:px-2 py-8">
        <div className="mb-8 p-4">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <LayoutGrid className="size-8 text-primary" />
            Explorer les communautés
          </h1>
          <p className="text-muted-foreground mt-2">
            Découvrez et rejoignez des communautés qui partagent vos centres
            d&apos;intérêt.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 px-4">
          {results.map((community) => (
            <Link
              key={community._id}
              href={`/communities/${community.slug}`}
              className="group flex flex-col p-6 rounded-xl border bg-card dark:bg-card/35 hover:border-primary/50 hover:shadow-sm transition-all h-full"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-2 text-primary">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Users className="size-5" />
                  </div>
                  <h2 className="font-semibold text-lg line-clamp-1 group-hover:underline">
                    {community.name}
                  </h2>
                </div>
              </div>
              <p className="text-sm text-foreground/80 line-clamp-3 mb-6 flex-1">
                {community.description}
              </p>

              {/* Show recent posts stats if available */}
              <div className="flex flex-col gap-2 mb-4 pt-4 border-t border-border/50">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span className="font-medium">
                    {community.membersCount} membre(s)
                  </span>
                  <span>{community.postsCount} post(s)</span>
                </div>
              </div>

              <div className="mt-auto flex items-center justify-center py-2 w-full rounded-md bg-secondary text-secondary-foreground group-hover:bg-primary group-hover:text-primary-foreground transition-colors text-sm font-medium">
                Visiter la communauté
              </div>
            </Link>
          ))}
        </div>

        {status === "LoadingFirstPage" && (
          <div className="text-center mt-12 text-muted-foreground">
            Chargement des communautés...
          </div>
        )}

        {status === "LoadingMore" && (
          <div className="text-center mt-12 text-muted-foreground">
            Chargement...
          </div>
        )}

        {status === "CanLoadMore" && (
          <div className="flex justify-center mt-12">
            <Button onClick={() => loadMore(12)} variant="outline" size="lg">
              Charger plus
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
