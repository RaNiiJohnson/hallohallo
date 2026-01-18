"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";
import { cn } from "@/lib/utils";

interface ImageCarouselProps {
  images: string[];
  coverPhoto: string;
  title: string;
}

export function ImageCarousel({
  images,
  coverPhoto,
  title,
}: ImageCarouselProps) {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);

  // Combiner la photo de couverture avec les autres photos
  const allImages = [coverPhoto, ...images];

  // Écouter les changements du carousel pour mettre à jour l'index actuel
  useEffect(() => {
    if (!api) {
      return;
    }

    const onSelect = () => {
      setCurrent(api.selectedScrollSnap());
    };

    // Initialiser l'index actuel
    onSelect();

    // S'abonner aux changements
    api.on("select", onSelect);

    // Nettoyer l'abonnement
    return () => {
      api.off("select", onSelect);
    };
  }, [api]);

  return (
    <>
      {/* Carrousel principal avec shadcn/ui */}
      <div className="relative group mb-6">
        <Carousel setApi={setApi} className="w-full">
          <CarouselContent>
            {allImages.map((image, index) => (
              <CarouselItem key={index}>
                <div className="relative h-80 w-full rounded-xl overflow-hidden bg-muted">
                  <Image
                    src={image}
                    alt={`${title} - Image ${index + 1}`}
                    fill
                    className="object-cover transition-transform duration-300 hover:scale-105"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                  {/* Overlay gradient */}
                  <div className="absolute inset-0 bg-linear-to-t from-black/20 via-transparent to-transparent" />
                  {/* Bouton plein écran */}

                  {/* Compteur d'images */}
                  <div className="absolute top-3 left-3 bg-black/50 text-white text-xs px-2 py-1 rounded-md">
                    {index + 1} / {allImages.length}
                  </div>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>

          {/* Navigation personnalisée */}
          <CarouselPrevious className="absolute left-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-black/50 hover:bg-black/70 text-white border-0" />
          <CarouselNext className="absolute right-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-black/50 hover:bg-black/70 text-white border-0" />
        </Carousel>

        {/* Miniatures */}
        {allImages.length > 1 && (
          <div className="flex gap-2 mt-3 overflow-x-auto pb-2">
            {allImages.map((image, index) => (
              <button
                key={index}
                className={cn(
                  "relative shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all duration-200 cursor-pointer",
                  index === current
                    ? "border-primary scale-105"
                    : "border-transparent hover:border-muted-foreground/50"
                )}
                onClick={() => api?.scrollTo(index)}
              >
                <Image
                  src={image}
                  alt={`Miniature ${index + 1}`}
                  fill
                  className="object-cover"
                  sizes="64px"
                />
                {index === current && (
                  <div className="absolute inset-0 bg-primary/20" />
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
