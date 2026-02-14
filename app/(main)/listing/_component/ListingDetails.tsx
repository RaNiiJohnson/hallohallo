"use client";

import { Button } from "@/components/ui/button";
import { ExternalLink, MapPin, X } from "lucide-react";
import Link from "next/link";
import { PriceDisplay, parsePrice } from "./price";
import { ImageCarousel } from "./ImageCarousel";
import { ListingListItem } from "@/lib/convexTypes";

export function ListingDetails({
  listing,
  onClose,
  showCloseButton = true,
}: {
  listing: ListingListItem;
  onClose: () => void;
  showCloseButton?: boolean;
}) {
  return (
    <div className="bg-card border rounded-xl p-6 shadow-lg">
      {showCloseButton && (
        <div className="flex items-start justify-between mb-4">
          <h2 className="text-2xl font-bold pr-4">{listing.title}</h2>
          <Button
            variant="ghost"
            size="icon"
            className="shrink-0"
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
          >
            <X className="size-4" />
          </Button>
        </div>
      )}

      {/* Carrousel d'images */}
      <ImageCarousel
        images={listing.photos}
        coverPhoto={listing.coverPhoto}
        title={listing.title}
      />

      <div className="space-y-4">
        {/* Bouton vers les détails complets */}
        <Link href={`/listing/${listing._id}`} className="block mt-4">
          <Button className="w-full flex items-center gap-2">
            <ExternalLink className="size-4" />
            Voir tous les détails
          </Button>
        </Link>
      </div>
    </div>
  );
}

// Composant pour le contenu des détails (sans wrapper, pour le dialog)
export function ListingDetailsContent({
  listing,
}: {
  listing: ListingListItem;
}) {
  return (
    <div className="space-y-4">
      {/* Carrousel d'images */}
      <ImageCarousel
        images={listing.photos}
        coverPhoto={listing.coverPhoto}
        title={listing.title}
      />

      {/* Prix */}
      <div className="space-y-2">
        <PriceDisplay price={listing.price} className="text-3xl" />
        {parsePrice(listing.deposit).amount && (
          <div className="text-sm text-muted-foreground">
            Caution : <PriceDisplay price={listing.deposit} />
          </div>
        )}
      </div>

      {/* Localisation */}
      <div className="flex items-center gap-2 text-muted-foreground">
        <MapPin className="size-4" />
        <span>{listing.city}</span>
      </div>

      {/* Bouton vers les détails complets */}
      <Link href={`/listing/${listing._id}`} className="block mt-4">
        <Button className="w-full flex items-center gap-2">
          <ExternalLink className="size-4" />
          Voir tous les détails
        </Button>
      </Link>
    </div>
  );
}
