"use client";

import { Button } from "@/components/ui/button";
import { ExternalLink, MapPin, X } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { PriceDisplay } from "./price";
import { ImageCarousel } from "./ImageCarousel";
import { ListingListItem } from "@/lib/convexTypes";
import { useTranslations } from "next-intl";

export function ListingDetails({
  listing,
  onClose,
  showCloseButton = true,
}: {
  listing: ListingListItem;
  onClose: () => void;
  showCloseButton?: boolean;
}) {
  const t = useTranslations("listing");

  return (
    <div className="relative overflow-hidden rounded-xl border bg-card shadow-lg">
      {showCloseButton && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-3 top-3 z-10 size-8 bg-black/50 text-white hover:bg-black/70 hover:text-white"
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
        >
          <X className="size-4" />
        </Button>
      )}

      {/* Carrousel d'images */}
      <ImageCarousel
        images={listing.images}
        title={listing.title}
        compact
        showTitleOverlay
      />

      <div className="px-4 pb-4">
        {/* Bouton vers les détails complets */}
        <Link href={`/listing/${listing.slug}`} className="block mt-3">
          <Button className="w-full flex items-center gap-2">
            <ExternalLink className="size-4" />
            {t("details.seeDetails")}
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
  const t = useTranslations("listing");

  return (
    <div className="space-y-4">
      {/* Carrousel d'images */}
      <ImageCarousel images={listing.images} title={listing.title} />

      {/* Prix */}
      <div className="space-y-2">
        <PriceDisplay
          price={listing.price}
          listingMode={listing.listingMode}
          className="text-3xl"
        />
        {listing.deposit !== undefined && listing.listingMode === "rent" && (
          <div className="text-sm text-muted-foreground">
            {t("details.deposit")} : <PriceDisplay price={listing.deposit} />
          </div>
        )}
      </div>

      {/* Localisation */}
      <div className="flex items-center gap-2 text-muted-foreground">
        <MapPin className="size-4" />
        <span>{listing.city}</span>
      </div>

      {/* Bouton vers les détails complets */}
      <Link href={`/listing/${listing.slug}`} className="block mt-4">
        <Button className="w-full flex items-center gap-2">
          <ExternalLink className="size-4" />
          {t("details.seeDetails")}
        </Button>
      </Link>
    </div>
  );
}
