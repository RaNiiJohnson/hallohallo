"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { PriceDisplay } from "../../_component/price";
import { Id } from "@convex/_generated/dataModel";
import { useQuery } from "convex-helpers/react/cache";
import { api } from "@convex/_generated/api";
import { ListingListDetails } from "@/lib/convexTypes";
import { listingTypeLabels } from "../../_component/forms/listingForm";

export function SimilarListings({
  id,
  property,
}: {
  id: Id<"RealestateListing">;
  property: ListingListDetails;
}) {
  const properties = useQuery(api.listings.getSimilarRealEstateListings, {
    excludeId: id,
    city: property.city,
    propertyType: property.propertyType,
    limit: 6,
  });

  if (
    properties === null ||
    properties === undefined ||
    properties.length === 0
  ) {
    return null;
  }

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Annonces similaires</h2>
        <Link href="listing">
          <Button variant="outline">Voir toutes les annonces</Button>
        </Link>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {properties.map((list) => (
          <Link
            key={list._id}
            href={`/listing/${list._id}`}
            className="relative group cursor-pointer transition-all duration-300 h-fit block"
          >
            <div className="relative h-80 w-full rounded-xl overflow-hidden shadow-xl">
              <Image
                src={list.images?.[0]?.secureUrl || "/default-cover.jpg"}
                alt={list.title}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <Badge className="absolute top-2 left-2 z-10">
                {listingTypeLabels[list.propertyType]}
              </Badge>

              {/* Indicateur de photos multiples */}
              {list.images && list.images.length > 1 && (
                <div className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded-md z-10">
                  {list.images.length} photos
                </div>
              )}

              <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <div className="absolute inset-x-3 bottom-3 p-3 bg-background/95 backdrop-blur-sm rounded-lg border">
              <h3 className="font-semibold mb-1 line-clamp-1">{list.title}</h3>
              <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
                <MapPin className="size-3" />
                {list.city}
              </div>
              <PriceDisplay
                price={list.price}
                listingMode={list.listingMode}
                className="text-primary"
              />
            </div>
          </Link>
        ))}
      </div>

      {/* Message si peu d'annonces similaires */}
      {properties.length < 3 && (
        <div className="text-center py-8">
          <p className="text-muted-foreground mb-4">
            Pas assez d&apos;annonces similaires dans cette zone ?
          </p>
          <Link href="/listing">
            <Button variant="outline">Découvrir toutes nos annonces</Button>
          </Link>
        </div>
      )}
    </section>
  );
}
