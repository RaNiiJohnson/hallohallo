"use client";

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import type { CarouselApi } from "@/components/ui/carousel";

interface ImageGridProps {
  images: string[];
  coverPhoto: string;
  title: string;
}

export function ImageGrid({ images, coverPhoto, title }: ImageGridProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [fullscreenIndex, setFullscreenIndex] = useState(0);
  const [api, setApi] = useState<CarouselApi>();

  // Combiner la photo de couverture avec les autres photos
  const allImages = [coverPhoto, ...images];
  const visibleImages = allImages.slice(0, 3);
  const remainingCount = Math.max(0, allImages.length - 3);

  const openFullscreen = (index: number) => {
    setFullscreenIndex(index);
    setIsFullscreen(true);
  };

  // Synchroniser l'index avec le carousel
  useEffect(() => {
    if (!api) return;

    api.on("select", () => {
      setFullscreenIndex(api.selectedScrollSnap());
    });
  }, [api]);

  // Aller à l'index spécifique quand on ouvre le fullscreen
  useEffect(() => {
    if (api && isFullscreen) {
      // Utiliser un petit délai pour s'assurer que le carousel est monté
      setTimeout(() => {
        api.scrollTo(fullscreenIndex, false); // false pour une transition fluide
      }, 50);
    }
  }, [api, isFullscreen, fullscreenIndex]);

  // Navigation au clavier
  useEffect(() => {
    if (!isFullscreen || !api) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        api.scrollPrev();
      }
      if (e.key === "ArrowRight") {
        api.scrollNext();
      }
      if (e.key === "Escape") {
        setIsFullscreen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isFullscreen, api]);

  return (
    <>
      {/* Grille d'images */}
      <div className="grid grid-cols-3 gap-2 h-96 rounded-xl overflow-hidden">
        {/* Image principale (2x2) */}
        <div
          className="col-span-2 row-span-2 relative cursor-pointer group"
          onClick={() => openFullscreen(0)}
        >
          <Image
            src={coverPhoto}
            alt={`${title} - Image principale`}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105 group-hover:z-10"
            sizes="(max-width: 768px) 50vw, 25vw"
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
        </div>

        {/* Images secondaires */}
        {visibleImages.slice(1, 3).map((image, index) => (
          <div
            key={index + 1}
            className="relative cursor-pointer group"
            onClick={() => openFullscreen(index + 1)}
          >
            <Image
              src={image}
              alt={`${title} - Image ${index + 2}`}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 768px) 25vw, 12.5vw"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />

            {/* Overlay pour les images supplémentaires */}
            {index === 1 && remainingCount > 0 && (
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                <span className="text-white font-semibold text-lg">
                  +{remainingCount}
                </span>
              </div>
            )}
          </div>
        ))}

        {/* Si moins de 3 images, remplir avec des placeholders */}
        {visibleImages.length < 3 &&
          Array.from({ length: 3 - visibleImages.length }).map((_, index) => (
            <div
              key={`placeholder-${index}`}
              className="bg-muted flex items-center justify-center"
            >
              <div className="text-muted-foreground text-sm">
                Pas d&apos;image
              </div>
            </div>
          ))}
      </div>

      {/* Modal plein écran avec Carousel */}
      <Dialog open={isFullscreen} onOpenChange={setIsFullscreen}>
        <DialogContent className="max-w-[95vw] md:max-w-[97vw] max-h-[95vh] p-0 bg-black/90 border-0">
          <DialogTitle className="sr-only">
            Galerie d&apos;images - {title}
          </DialogTitle>

          <Carousel
            className="w-full h-[90vh]"
            setApi={setApi}
            opts={{
              loop: false,
              startIndex: fullscreenIndex,
              align: "center",
              skipSnaps: false,
              dragFree: false,
              duration: 30, // Durée de la transition en frames
              containScroll: "trimSnaps",
              inViewThreshold: 0.7, // Seuil pour déclencher le snap
            }}
          >
            <CarouselContent
              className="h-full ml-0"
              style={{
                transition:
                  "transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
              }}
            >
              {allImages.map((image, index) => (
                <CarouselItem
                  key={index}
                  className="flex items-center justify-center pl-0"
                >
                  <div className="relative w-full h-[90vh]">
                    <Image
                      src={image}
                      alt={`${title} - Image ${index + 1}`}
                      fill
                      className="object-contain"
                      sizes="95vw"
                      priority={index === fullscreenIndex}
                    />
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>

            {/* Boutons de navigation personnalisés */}
            {fullscreenIndex > 0 && (
              <CarouselPrevious className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20 bg-black/50 border-0 h-12 w-12">
                <ChevronLeft className="h-8 w-8" />
              </CarouselPrevious>
            )}

            {fullscreenIndex < allImages.length - 1 && (
              <CarouselNext className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20 bg-black/50 border-0 h-12 w-12">
                <ChevronRight className="h-8 w-8" />
              </CarouselNext>
            )}

            {/* Compteur */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/70 text-white px-4 py-2 rounded-lg z-10">
              {fullscreenIndex + 1} / {allImages.length}
            </div>

            {/* Indicateurs */}
            {allImages.length > 1 && (
              <div className="absolute bottom-16 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                {allImages.map((_, index) => (
                  <button
                    key={index}
                    className={cn(
                      "w-3 h-3 rounded-full transition-all duration-200",
                      index === fullscreenIndex
                        ? "bg-white scale-125"
                        : "bg-white/50 hover:bg-white/75"
                    )}
                    onClick={() => api?.scrollTo(index)}
                  />
                ))}
              </div>
            )}
          </Carousel>
        </DialogContent>
      </Dialog>
    </>
  );
}
