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

export default function PropertyPage() {
  const params = useParams<{ id: string }>();
  const { isAuthenticated } = useConvexAuth();
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
            Retour aux annonces
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
                        ? "Retiré des favoris"
                        : "Ajouté aux favoris",
                    );
                  } catch {
                    toast.error("Erreur lors de la mise à jour du favori");
                  }
                }}
              >
                <Heart
                  className={`h-4 w-4 ${property.isBookmarked ? "fill-current" : ""}`}
                />
                <span className="max-sm:hidden">Favoris</span>
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
