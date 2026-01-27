"use client";

import { useTransition } from "react";
import { useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { Id } from "@convex/betterAuth/_generated/dataModel";
import { Camera, Upload, X, Loader2, ImageIcon } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useFileUpload } from "@/hooks/use-file-upload";
import { cn } from "@/lib/utils";
import Image from "next/image";

type ImageType = "profile" | "cover";

interface ImageUploadModalProps {
  userId: Id<"user">;
  imageType: ImageType;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentImageUrl?: string | null;
  onSuccess?: () => void;
}

export function ImageUploadModal({
  userId,
  imageType,
  open,
  onOpenChange,
  currentImageUrl,
  onSuccess,
}: ImageUploadModalProps) {
  const generateUploadUrl = useMutation(api.upload.generateUploadUrl);
  const updateUser = useMutation(api.users.updateUser);

  const [isPending, startTransition] = useTransition();

  const [
    { files, isDragging, errors },
    {
      removeFile,
      openFileDialog,
      getInputProps,
      handleDragEnter,
      handleDragLeave,
      handleDragOver,
      handleDrop,
      clearFiles,
    },
  ] = useFileUpload({
    accept: "image/*",
    maxSize: 5 * 1024 * 1024, // 5MB max
  });

  const selectedFile = files[0]?.file instanceof File ? files[0].file : null;
  const previewUrl = files[0]?.preview || null;

  const handleUpload = () => {
    if (!selectedFile) return;

    startTransition(async () => {
      try {
        // 1. Get upload URL from Convex
        const postUrl = await generateUploadUrl();

        // 2. Upload the file
        const uploadRes = await fetch(postUrl, {
          method: "POST",
          headers: { "Content-Type": selectedFile.type },
          body: selectedFile,
        });

        if (!uploadRes.ok) {
          console.error("Upload failed", await uploadRes.text());
          toast.error("Échec du téléchargement de l'image");
          return;
        }

        // 3. Get the storage ID
        const { storageId } = await uploadRes.json();

        // 4. Update user with the new image
        const patchData =
          imageType === "profile"
            ? { image: storageId }
            : { coverImage: storageId };

        await updateUser({
          id: userId,
          patch: patchData,
        });

        toast.success("Image mise à jour avec succès");

        // Clean up and close
        clearFiles();
        onOpenChange(false);
        onSuccess?.();
      } catch (error) {
        console.error("Upload error:", error);
        toast.error("Une erreur est survenue lors du téléchargement");
      }
    });
  };

  const handleClose = () => {
    if (!isPending) {
      clearFiles();
      onOpenChange(false);
    }
  };

  const isProfileImage = imageType === "profile";
  const title = isProfileImage
    ? "Modifier la photo de profil"
    : "Modifier la photo de couverture";
  const description = isProfileImage
    ? "Choisissez une photo qui vous représente"
    : "Ajoutez une image de couverture pour personnaliser votre profil";

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Camera className="size-5" />
            {title}
          </DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Drop Zone */}
          <div
            role="button"
            tabIndex={0}
            aria-label={
              previewUrl ? "Changer l'image" : "Télécharger une image"
            }
            className={cn(
              "relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed transition-all duration-200 cursor-pointer",
              isProfileImage
                ? "aspect-square mx-auto max-w-[200px]"
                : "aspect-video",
              isDragging
                ? "border-primary bg-primary/5 scale-[1.02]"
                : "border-muted-foreground/25 hover:border-primary/50 hover:bg-accent/50",
              previewUrl && "border-none",
            )}
            onClick={openFileDialog}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                openFileDialog();
              }
            }}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            {previewUrl ? (
              <>
                <Image
                  src={previewUrl}
                  alt="Aperçu"
                  className={cn(
                    "w-full h-full object-cover",
                    isProfileImage ? "rounded-full" : "rounded-xl",
                  )}
                  width={100}
                  height={100}
                />
                {/* Overlay on hover */}
                <div
                  className={cn(
                    "absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 hover:opacity-100 transition-opacity",
                    isProfileImage ? "rounded-full" : "rounded-xl",
                  )}
                >
                  <div className="text-center text-white">
                    <Upload className="mx-auto size-8 mb-2" />
                    <span className="text-sm font-medium">Changer</span>
                  </div>
                </div>
                {/* Remove button */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFile(files[0]?.id);
                  }}
                  className="absolute -top-2 -right-2 p-1.5 rounded-full bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-colors shadow-lg"
                  aria-label="Supprimer l'image"
                >
                  <X className="size-4" />
                </button>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center p-8 text-center">
                <div className="p-4 rounded-full bg-primary/10 mb-4">
                  <ImageIcon className="size-8 text-primary" />
                </div>
                <p className="text-sm font-medium mb-1">
                  Glissez-déposez une image ici
                </p>
                <p className="text-xs text-muted-foreground">
                  ou cliquez pour sélectionner
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  PNG, JPG, GIF jusqu&apos;à 5MB
                </p>
              </div>
            )}

            <input {...getInputProps()} className="sr-only" />
          </div>

          {/* Current image preview (if no new image selected) */}
          {!previewUrl && currentImageUrl && (
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-2">
                Image actuelle
              </p>
              <div
                className={cn(
                  "overflow-hidden mx-auto border",
                  isProfileImage
                    ? "rounded-full size-20"
                    : "rounded-lg max-w-[200px] aspect-video",
                )}
              >
                <Image
                  src={currentImageUrl}
                  alt="Image actuelle"
                  className="w-full h-full object-cover"
                  width={100}
                  height={300}
                />
              </div>
            </div>
          )}

          {/* Errors */}
          {errors.length > 0 && (
            <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
              {errors.map((error, index) => (
                <p key={index}>{error}</p>
              ))}
            </div>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isPending}
          >
            Annuler
          </Button>
          <Button
            type="button"
            onClick={handleUpload}
            disabled={!selectedFile || isPending}
            className="min-w-[100px]"
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                Envoi...
              </>
            ) : (
              <>
                <Upload className="mr-2 size-4" />
                Enregistrer
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
