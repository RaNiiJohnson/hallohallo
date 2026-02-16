"use client";

import { Button } from "@/components/ui/button";
import { ArrowLeft, Heart, Share2 } from "lucide-react";
import Link from "next/link";
import { notFound, useParams } from "next/navigation";
import { PropertyDetails } from "./components/PropertyDetails";
import { PropertyPageSkeleton } from "../_component/skeleton";
import { ButtonGroup } from "@/components/ui/button-group";
import { useQuery } from "convex-helpers/react/cache";
import { api } from "@convex/_generated/api";
import { SimilarListings } from "./components/SimilarListings";

export default function PropertyPage() {
  const params = useParams<{ id: string }>();

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
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <Share2 className="h-4 w-4" />
              <span className="max-sm:hidden">Partager</span>
            </Button>
            <Button
              variant="secondary"
              size="sm"
              className="flex items-center gap-2"
            >
              <Heart className="h-4 w-4" />
              <span className="max-sm:hidden">Favoris</span>
            </Button>
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
