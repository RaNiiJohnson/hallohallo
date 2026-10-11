"use client";

import { ShareButton } from "@/components/ShareButton";
import { ReportDialog } from "@/components/report-dialog";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import { useAuthRequiredAction } from "@/hooks/use-auth-required-action";
import { Link } from "@/i18n/navigation";
import { api } from "@convex/_generated/api";
import { Id } from "@convex/_generated/dataModel";
import { useQuery } from "convex-helpers/react/cache";
import { useConvexAuth, useMutation } from "convex/react";
import { ArrowLeft, Heart } from "lucide-react";
import { useTranslations } from "next-intl";
import { notFound, useParams } from "next/navigation";
import { toast } from "sonner";
import { ListingLifecycleActions } from "../_component/listingLifecycleActions";
import { PropertyPageSkeleton } from "../_component/skeleton";
import { EditListingDialog } from "./components/EditListingDialog";
import { PropertyDetails } from "./components/PropertyDetails";
import { SimilarListings } from "./components/SimilarListings";

export default function PropertyPage() {
  const params = useParams<{ id: string }>();
  const { isAuthenticated, isLoading } = useConvexAuth();
  const requireAuthentication = useAuthRequiredAction();
  const t = useTranslations("listing");
  const toggleBookmark = useMutation(api.bookmarks.mutations.toggleBookmark);
  const user = useQuery(api.auth.auth.getCurrentUser);

  const property = useQuery(api.listings.queries.getListingWithContact, {
    slug: params.id,
  });

  if (property === undefined) {
    return <PropertyPageSkeleton />;
  }

  if (property === null) {
    notFound();
  }

  const canManage = !isLoading && user?._id === property.authorId;

  return (
    <div className="min-h-screen bg-background">
      {/* Header avec navigation */}
      <div className="flex flex-col gap-2 border-b max-w-full mx-auto px-4 py-2 sm:flex-row sm:items-center sm:justify-between sm:py-4">
        <Link href="/listing">
          <Button variant="ghost" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            {t("details.backBtn")}
          </Button>
        </Link>

        <div className="flex w-full items-center gap-2 sm:w-auto">
          <ButtonGroup className="max-w-full flex-wrap justify-center gap-2 [&>*]:rounded-md! [&>*]:border! max-sm:grid max-sm:w-full max-sm:grid-cols-2">
            {canManage && (
              <ListingLifecycleActions
                listingId={property._id}
                status={property.status}
              />
            )}
            <ShareButton text={property.title} showLabel />
            {user !== undefined && user?._id !== property.authorId ? (
              <ReportDialog
                target={{ type: "listing", id: property._id }}
                showLabel
                size="sm"
                variant="outline"
              />
            ) : null}
            {canManage ? (
              <EditListingDialog listing={property} />
            ) : (
                <Button
                  variant="secondary"
                  size="sm"
                  className={`flex items-center gap-2 ${property.isBookmarked ? "text-red-500 hover:text-red-600 bg-red-500/10 hover:bg-red-500/20" : ""}`}
                  onClick={async () => {
                    if (!isAuthenticated) {
                      requireAuthentication();
                      return;
                    }

                    try {
                      await toggleBookmark({
                        resourceId: property._id as Id<"RealestateListing">,
                        resourceType: "realEstate",
                      });
                      toast.success(
                        property.isBookmarked
                          ? t("details.bookmarkRemove")
                          : t("details.bookmarkAdd"),
                      );
                    } catch {
                      toast.error(t("details.bookmarkError"));
                    }
                  }}
                >
                  <Heart
                    className={`h-4 w-4 ${property.isBookmarked ? "fill-current" : ""}`}
                  />
                  <span>
                    {property.isBookmarked
                      ? t("details.bookmarkRemoveLabel")
                      : t("details.bookmarkAddLabel")}
                  </span>
                </Button>
            )}
          </ButtonGroup>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="max-w-5xl mx-auto py-8 px-4">
        <PropertyDetails property={property} />
        {/* Section des annonces similaires */}
        <div className="mt-16">
          <SimilarListings slug={params.id} property={property} />
        </div>
      </div>
    </div>
  );
}
