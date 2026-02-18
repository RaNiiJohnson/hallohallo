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

interface CloudinaryImage {
  publicId: string;
  secureUrl: string;
}

interface ImageGridProps {
  images?: CloudinaryImage[];
  title: string;
}

export function ImageGrid({ images, title }: ImageGridProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [fullscreenIndex, setFullscreenIndex] = useState(0);
  const [api, setApi] = useState<CarouselApi>();

  const allImages = images && images.length > 0 ? images : [];
  const visibleImages = allImages.slice(0, 3);
  const remainingCount = Math.max(0, allImages.length - 3);

  const openFullscreen = (index: number) => {
    setFullscreenIndex(index);
    setIsFullscreen(true);
    // Ajoute une entrée dans l'historique pour intercepter le bouton retour mobile
    window.history.pushState({ modal: "image-gallery" }, "");
  };

  const closeFullscreen = () => {
    setIsFullscreen(false);
  };

  // Intercepte le bouton retour du navigateur (mobile)
  useEffect(() => {
    const handlePopState = () => {
      if (isFullscreen) {
        setIsFullscreen(false);
      }
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [isFullscreen]);

  // Quand le dialog est fermé via onOpenChange (croix, overlay),
  // on retire l'entrée history qu'on avait poussée
  const handleOpenChange = (open: boolean) => {
    if (!open && isFullscreen) {
      // L'utilisateur a fermé via la croix ou l'overlay (pas via popstate)
      // On revient en arrière dans l'historique pour ne pas laisser une entrée orpheline
      window.history.back();
      closeFullscreen();
    }
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
      setTimeout(() => {
        api.scrollTo(fullscreenIndex, false);
      }, 50);
    }
  }, [api, isFullscreen, fullscreenIndex]);

  // Navigation au clavier
  // useEffect(() => {
  //   if (!isFullscreen || !api) return;

  //   const handleKeyDown = (e: KeyboardEvent) => {
  //     if (e.key === "ArrowLeft") api.scrollPrev();
  //     if (e.key === "ArrowRight") api.scrollNext();
  //     if (e.key === "Escape") closeFullscreen();
  //   };

  //   window.addEventListener("keydown", handleKeyDown);
  //   return () => window.removeEventListener("keydown", handleKeyDown);
  // }, [isFullscreen, api]);

  if (allImages.length === 0) {
    return (
      <div className="relative h-96 w-full rounded-xl overflow-hidden bg-muted">
        <Image
          src="/default-cover.jpg"
          alt={title}
          fill
          className="object-cover"
        />
      </div>
    );
  }

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
            src={allImages[0].secureUrl}
            alt={`${title} - Image principale`}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 50vw, 25vw"
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
        </div>

        {/* Images secondaires */}
        {visibleImages.slice(1, 3).map((image, index) => (
          <div
            key={image.publicId}
            className="relative cursor-pointer group"
            onClick={() => openFullscreen(index + 1)}
          >
            <Image
              src={image.secureUrl}
              alt={`${title} - Image ${index + 2}`}
              fill
              className="object-cover"
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
      <Dialog open={isFullscreen} onOpenChange={handleOpenChange}>
        <DialogContent className="max-w-[95vw] md:max-w-[97vw] max-h-[95vh] p-0 border-0 rounded-none   ">
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
              duration: 30,
              containScroll: "trimSnaps",
              inViewThreshold: 0.7,
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
                  key={image.publicId}
                  className="flex items-center justify-center pl-0"
                >
                  <div className="relative w-full h-[90vh]">
                    <Image
                      src={image.secureUrl}
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
                {allImages.map((image, index) => (
                  <button
                    key={image.publicId}
                    className={cn(
                      "w-3 h-3 rounded-full transition-all duration-200",
                      index === fullscreenIndex
                        ? "bg-white scale-125"
                        : "bg-white/50 hover:bg-white/75",
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
