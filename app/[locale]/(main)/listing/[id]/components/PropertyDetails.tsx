"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Bath,
  Bed,
  Calendar,
  Mail,
  MapPin,
  PawPrint,
  Phone,
  Square,
  User,
} from "lucide-react";
import { useState } from "react";
import { ImageGrid } from "./ImageGrid";
import { Item, ItemContent, ItemSeparator } from "@/components/ui/item";
import { PriceDisplay } from "../../_component/price";
import { truncateText } from "@/lib/utils";
import { ListingListDetails } from "@/lib/convexTypes";

import { LocationMap } from "@/lib/LocationMap";
import { useLocale, useTranslations } from "next-intl";
import { formatDateWithFallback } from "@/lib/date";

interface PropertyDetailsProps {
  property: ListingListDetails;
}

export function PropertyDetails({ property }: PropertyDetailsProps) {
  const [showFullDescription, setShowFullDescription] = useState(false);
  const locale = useLocale();
  const t = useTranslations("common");
  const tListing = useTranslations("listing");

  return (
    <div className="space-y-8">
      {/* Galerie d'images */}
      <div className="w-full">
        <ImageGrid images={property.images} title={property.title} />
      </div>
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="flex-1">
            <h1 className="text-2xl sm:text-3xl font-bold">{property.title}</h1>
            <div className="flex items-center gap-2 text-muted-foreground mt-2">
              <MapPin className="h-4 w-4 shrink-0" />
              <span className="text-sm sm:text-base">{property.city}</span>
            </div>
            <div className="flex gap-2 mt-2">
              <Badge variant="secondary">
                {tListing(`labels.listingTypes.${property.propertyType}` as Parameters<typeof tListing>[0])}
              </Badge>
              <Badge
                variant={
                  property.listingMode === "rent" ? "default" : "outline"
                }
              >
                {tListing(`labels.listingModes.${property.listingMode}` as Parameters<typeof tListing>[0])}
              </Badge>
            </div>
          </div>

          <div className="sm:text-right">
            <PriceDisplay
              price={property.price}
              listingMode={property.listingMode}
              className="text-2xl sm:text-4xl"
            />
            {property.listingMode === "rent" &&
              property.deposit !== undefined && (
                <div className="text-sm text-muted-foreground mt-1">
                  {tListing("details.deposit")} : <PriceDisplay price={property.deposit} />
                </div>
              )}
            {property.listingMode === "rent" &&
              property.charges !== undefined && (
                <div className="text-sm text-muted-foreground mt-1">
                  {tListing("details.charges")} : <PriceDisplay price={property.charges} /> /mois
                </div>
              )}
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Colonne principale */}
        <div className="lg:col-span-2 space-y-8">
          {/* Caractéristiques principales */}

          <ItemSeparator />
          <div>
            <div className="py-6">
              <h2 className="text-xl font-semibold mb-4">{tListing("details.featuresTitle")}</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                  <Bed className="h-5 w-5 text-primary" />
                  <div>
                    <div className="font-medium">{property.bedrooms}</div>
                    <div className="text-xs text-muted-foreground">
                      {tListing("details.bedrooms")}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                  <Bath className="h-5 w-5 text-primary" />
                  <div>
                    <div className="font-medium">{property.bathrooms}</div>
                    <div className="text-xs text-muted-foreground">
                      {tListing("details.bathrooms")}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                  <Square className="h-5 w-5 text-primary" />
                  <div>
                    <div className="font-medium">{property.area}m²</div>
                    <div className="text-xs text-muted-foreground">{tListing("details.area")}</div>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                  <div className="h-5 w-5 text-primary font-bold text-sm flex items-center justify-center">
                    {property.floor}
                  </div>
                  <div>
                    <div className="font-medium">{tListing("details.floor", { floor: property.floor })}</div>
                    <div className="text-xs text-muted-foreground">{tListing("details.level")}</div>
                  </div>
                </div>
              </div>

              {/* Disponibilité et animaux */}
              <div className="mt-6 space-y-3">
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-primary" />
                  <span className="font-medium">{tListing("details.available")}</span>
                  <span>
                    {formatDateWithFallback(
                      property.availableFrom,
                      locale,
                      t("availableNow"),
                    )}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <PawPrint className="h-5 w-5 text-primary" />
                  <span className="font-medium">{tListing("details.pets")}</span>
                  <Badge variant={property.pets ? "default" : "secondary"}>
                    {property.pets ? tListing("details.petsAllowed") : tListing("details.petsDenied")}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
          <ItemSeparator />
          {/* Description */}
          <div>
            <div className="py-6">
              <h2 className="text-xl font-semibold mb-4">{tListing("details.descTitle")}</h2>
              <div className="prose prose-sm max-w-none">
                <p
                  className={`text-muted-foreground leading-relaxed ${
                    !showFullDescription && property.description.length > 300
                      ? "line-clamp-4"
                      : ""
                  }`}
                >
                  {property.description}
                </p>

                {property.description.length > 300 && (
                  <Button
                    variant="link"
                    className="p-0 h-auto mt-2"
                    onClick={() => setShowFullDescription(!showFullDescription)}
                  >
                    {showFullDescription ? tListing("details.seeLess") : tListing("details.seeMore")}
                  </Button>
                )}
              </div>
            </div>
          </div>

          <ItemSeparator />
          {/* Location Map - Only show if coordinates exist */}
          <div>
            <div className="py-6">
              <h2 className="text-xl font-semibold mb-4">{tListing("details.locationTitle")}</h2>
              <p className="text-sm text-muted-foreground mt-1">
                {property.city}
              </p>
            </div>
            {property.location && (
              <LocationMap
                location={property.location}
                city={property.city}
                listing={true}
              />
            )}
          </div>

          <ItemSeparator />
          {/* Équipements et services */}
          {property.extras.length > 0 && (
            <div>
              <div className="py-6">
                <h2 className="text-xl font-semibold mb-4">
                  {tListing("details.extrasTitle")}
                </h2>
                <div className="flex flex-wrap gap-2">
                  {property.extras.map((extra, index) => (
                    <Badge key={index} variant="outline">
                      {extra}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Colonne latérale - Contact */}
        <div className="space-y-6">
          <Item variant="outline" className="sticky top-24">
            <ItemContent className="">
              <h2 className="text-xl font-semibold mb-4">{tListing("details.contactTitle")}</h2>

              {/* Informations du propriétaire */}
              <div className="flex items-center gap-3 mb-6">
                <div className="relative h-12 w-12 rounded-full overflow-hidden bg-muted">
                  <div className="h-full w-full flex items-center justify-center">
                    <User className="h-6 w-6 text-muted-foreground" />
                  </div>
                </div>
                <div>
                  <div className="font-medium">
                    {property.authorName || tListing("details.anonymous")}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {tListing("details.ownerRole")}
                  </div>
                </div>
              </div>

              <Separator className="my-4" />

              {/* Boutons de contact */}
              <div className="space-y-3">
                {property.contact?.phone && (
                  <Button className="w-full flex items-center gap-2" size="lg">
                    <Phone className="h-4 w-4" />
                    {tListing("details.call")}
                  </Button>
                )}

                {property.contact?.email && (
                  <Button
                    variant="outline"
                    className="w-full flex items-center gap-2"
                    size="lg"
                  >
                    <Mail className="h-4 w-4" />
                    {tListing("details.sendMessage")}
                  </Button>
                )}

                {!property.contact?.phone && !property.contact?.email && (
                  <Button
                    variant="outline"
                    className="w-full flex items-center gap-2"
                    size="lg"
                  >
                    <Mail className="h-4 w-4" />
                    {tListing("details.contactOwner")}
                  </Button>
                )}
              </div>

              {/* Informations de contact */}
              {(property.contact?.phone || property.contact?.email) && (
                <div className="mt-4 pt-4 border-t space-y-2">
                  {property.contact.phone && (
                    <div className="text-sm text-muted-foreground">
                      <span className="font-medium">{tListing("details.phone")}</span>{" "}
                      {property.contact.phone}
                    </div>
                  )}
                  {property.contact.email && (
                    <div className="text-sm text-muted-foreground">
                      <span className="font-medium">{tListing("details.email")}</span>{" "}
                      {truncateText(property.contact.email, 20)}
                    </div>
                  )}
                </div>
              )}
            </ItemContent>
          </Item>
        </div>
      </div>
    </div>
  );
}
