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

const propertyTypeLabels: Record<string, string> = {
  room: "Chambre",
  apartment: "Appartement",
  house: "Maison",
  studio: "Studio",
  shared: "Colocation",
};

const listingModeLabels: Record<string, string> = {
  rent: "À louer",
  sale: "À vendre",
};

interface PropertyDetailsProps {
  property: ListingListDetails;
}

export function PropertyDetails({ property }: PropertyDetailsProps) {
  const [showFullDescription, setShowFullDescription] = useState(false);

  const formatDate = (date: number | undefined) => {
    if (!date) return "Disponible immédiatement";
    return new Intl.DateTimeFormat("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(new Date(date));
  };

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
                {propertyTypeLabels[property.propertyType] ||
                  property.propertyType}
              </Badge>
              <Badge
                variant={
                  property.listingMode === "rent" ? "default" : "outline"
                }
              >
                {listingModeLabels[property.listingMode]}
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
                  Caution : <PriceDisplay price={property.deposit} />
                </div>
              )}
            {property.listingMode === "rent" &&
              property.charges !== undefined && (
                <div className="text-sm text-muted-foreground mt-1">
                  Charges : <PriceDisplay price={property.charges} /> /mois
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
              <h2 className="text-xl font-semibold mb-4">Caractéristiques</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                  <Bed className="h-5 w-5 text-primary" />
                  <div>
                    <div className="font-medium">{property.bedrooms}</div>
                    <div className="text-xs text-muted-foreground">
                      Chambres
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                  <Bath className="h-5 w-5 text-primary" />
                  <div>
                    <div className="font-medium">{property.bathrooms}</div>
                    <div className="text-xs text-muted-foreground">
                      Salles de bain
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                  <Square className="h-5 w-5 text-primary" />
                  <div>
                    <div className="font-medium">{property.area}m²</div>
                    <div className="text-xs text-muted-foreground">Surface</div>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                  <div className="h-5 w-5 text-primary font-bold text-sm flex items-center justify-center">
                    {property.floor}
                  </div>
                  <div>
                    <div className="font-medium">Étage {property.floor}</div>
                    <div className="text-xs text-muted-foreground">Niveau</div>
                  </div>
                </div>
              </div>

              {/* Disponibilité et animaux */}
              <div className="mt-6 space-y-3">
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-primary" />
                  <span className="font-medium">Disponible :</span>
                  <span>{formatDate(property.availableFrom)}</span>
                </div>

                <div className="flex items-center gap-3">
                  <PawPrint className="h-5 w-5 text-primary" />
                  <span className="font-medium">Animaux :</span>
                  <Badge variant={property.pets ? "default" : "secondary"}>
                    {property.pets ? "Acceptés" : "Non acceptés"}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
          <ItemSeparator />
          {/* Description */}
          <div>
            <div className="py-6">
              <h2 className="text-xl font-semibold mb-4">Description</h2>
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
                    {showFullDescription ? "Voir moins" : "Voir plus"}
                  </Button>
                )}
              </div>
            </div>
          </div>

          <ItemSeparator />
          {/* Équipements et services */}
          {property.extras.length > 0 && (
            <div>
              <div className="py-6">
                <h2 className="text-xl font-semibold mb-4">
                  Équipements et services
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
              <h2 className="text-xl font-semibold mb-4">Contact</h2>

              {/* Informations du propriétaire */}
              <div className="flex items-center gap-3 mb-6">
                <div className="relative h-12 w-12 rounded-full overflow-hidden bg-muted">
                  <div className="h-full w-full flex items-center justify-center">
                    <User className="h-6 w-6 text-muted-foreground" />
                  </div>
                </div>
                <div>
                  <div className="font-medium">
                    {property.authorName || "Anonyme"}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Propriétaire
                  </div>
                </div>
              </div>

              <Separator className="my-4" />

              {/* Boutons de contact */}
              <div className="space-y-3">
                {property.contact?.phone && (
                  <Button className="w-full flex items-center gap-2" size="lg">
                    <Phone className="h-4 w-4" />
                    Appeler
                  </Button>
                )}

                {property.contact?.email && (
                  <Button
                    variant="outline"
                    className="w-full flex items-center gap-2"
                    size="lg"
                  >
                    <Mail className="h-4 w-4" />
                    Envoyer un message
                  </Button>
                )}

                {!property.contact?.phone && !property.contact?.email && (
                  <Button
                    variant="outline"
                    className="w-full flex items-center gap-2"
                    size="lg"
                  >
                    <Mail className="h-4 w-4" />
                    Contacter le propriétaire
                  </Button>
                )}
              </div>

              {/* Informations de contact */}
              {(property.contact?.phone || property.contact?.email) && (
                <div className="mt-4 pt-4 border-t space-y-2">
                  {property.contact.phone && (
                    <div className="text-sm text-muted-foreground">
                      <span className="font-medium">Téléphone :</span>{" "}
                      {property.contact.phone}
                    </div>
                  )}
                  {property.contact.email && (
                    <div className="text-sm text-muted-foreground">
                      <span className="font-medium">Email :</span>{" "}
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
