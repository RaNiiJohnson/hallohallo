"use client";

import { Button } from "@/components/ui/button";
import { ArrowLeft, Heart } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { notFound, useParams } from "next/navigation";
import { ShareButton } from "@/components/ShareButton";
import { PropertyDetails } from "./components/PropertyDetails";
import { PropertyPageSkeleton } from "../_component/skeleton";
import { ButtonGroup } from "@/components/ui/button-group";
import { useQuery } from "convex-helpers/react/cache";
import { SimilarListings } from "./components/SimilarListings";
import { useMutation, useConvexAuth } from "convex/react";
import { toast } from "sonner";
import { Id } from "@convex/_generated/dataModel";
import { api } from "@convex/_generated/api";
import { useTranslations } from "next-intl";

export default function PropertyPage() {
  const params = useParams<{ id: string }>();
  const { isAuthenticated } = useConvexAuth();
  const t = useTranslations("listing");
  const toggleBookmark = useMutation(api.bookmarks.toggleBookmark);

  const property = useQuery(api.listings.getListingWithContact, {
    slug: params.id,
  });

  if (property === undefined) {
    return <PropertyPageSkeleton />;
  }

  if (property === null) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header avec navigation */}
      <div className="flex items-center justify-between border-b max-w-full mx-auto px-4 py-2 sm:py-4">
        <Link href="/listing">
          <Button variant="ghost" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            {t("details.backBtn")}
          </Button>
        </Link>

        <div className="flex items-center gap-2">
          <ButtonGroup>
            <ShareButton text={property.title} />
            {isAuthenticated && (
              <Button
                variant="secondary"
                size="sm"
                className={`flex items-center gap-2 ${property.isBookmarked ? "text-red-500 hover:text-red-600 bg-red-500/10 hover:bg-red-500/20" : ""}`}
                onClick={async () => {
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
                <span className="max-sm:hidden">{t("details.bookmarkBtn")}</span>
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
