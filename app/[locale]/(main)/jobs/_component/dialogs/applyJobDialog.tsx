"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { formatBytes, useFileUpload } from "@/hooks/use-file-upload";
import { useUploadFile } from "@convex-dev/r2/react";
import { api } from "@convex/_generated/api";
import { useAction, useMutation, useQuery } from "convex/react";
import {
  AlertCircleIcon,
  Loader2,
  PaperclipIcon,
  UploadIcon,
  XIcon,
} from "lucide-react";
import { useState, useTransition } from "react";
import { toast } from "sonner";

export function ApplyJobDialog({
  jobOffer,
  children,
}: {
  jobOffer: any; // Using any for simplicity here or could type it properly
  children: React.ReactNode;
}) {
  const user = useQuery(api.auth.auth.getCurrentUser);
  const applyToJob = useAction(api.jobs.actions.applyToJob);
  const updateUserCv = useMutation(api.auth.users.updateUser);
  const uploadFile = useUploadFile(api.integrations.r2);

  const [isOpen, setIsOpen] = useState(false);
  const [coverLetter, setCoverLetter] = useState("");
  const [isPending, startTransition] = useTransition();

  const maxSize = 5 * 1024 * 1024; // 5MB max

  const [
    { files, isDragging, errors },
    {
      handleDragEnter,
      handleDragLeave,
      handleDragOver,
      handleDrop,
      openFileDialog,
      removeFile,
      getInputProps,
    },
  ] = useFileUpload({
    accept: "application/pdf",
    maxSize,
    multiple: false,
  });

  const file = files[0];
  const hasProfileCv = !!user?.cv;

  async function handleApply() {
    if (!file && !hasProfileCv) {
      toast.error("Veuillez fournir un CV.");
      return;
    }

    startTransition(async () => {
      try {
        let cvStorageId = user?.cv;

        // If user uploaded a new file, we upload it
        if (file && file.file instanceof File) {
          const uploadedStorageId = await uploadFile(file.file);
          if (!uploadedStorageId) {
            throw new Error("Erreur lors de l'upload du CV.");
          }
          cvStorageId = uploadedStorageId;

          // If they didn't have a CV before, we can set it as default in profile
          if (!hasProfileCv && user) {
            await updateUserCv({
              id: user._id,
              patch: { cv: cvStorageId },
            });
          }
        }

        if (!cvStorageId) {
          throw new Error("CV introuvable.");
        }

        await applyToJob({
          jobId: jobOffer._id,
          cvStorageId: cvStorageId,
          coverLetter: coverLetter.trim() || undefined,
        });

        toast.success("Candidature envoyée avec succès !");
        setIsOpen(false);
      } catch (e: any) {
        toast.error(e.message || "Erreur lors de l'envoi de la candidature.");
      }
    });
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="text-xs font-semibold text-primary mb-1 uppercase tracking-wider">
            CANDIDATURE
          </div>
          <DialogTitle className="text-xl">{jobOffer.title}</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            {jobOffer.company}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-2">
          {/* Section CV */}
          <div className="space-y-3">
            <label className="text-sm font-semibold uppercase tracking-wider">
              CV *{" "}
              <span className="text-muted-foreground font-normal normal-case">
                (PDF, max 5 MB)
              </span>
            </label>

            {!hasProfileCv && !file && (
              <div className="flex gap-2 items-start text-sm text-amber-600 bg-amber-50 dark:bg-amber-500/10 dark:text-amber-500 p-3 rounded-lg border border-amber-200 dark:border-amber-500/20">
                <AlertCircleIcon className="w-5 h-5 shrink-0 mt-0.5" />
                <p>
                  Vous n'avez pas encore de CV sur votre profil. Veuillez en
                  télécharger un pour postuler.
                </p>
              </div>
            )}

            {hasProfileCv && !file && (
              <div className="flex gap-2 items-center text-sm text-green-700 bg-green-50 dark:bg-green-500/10 dark:text-green-500 p-3 rounded-lg border border-green-200 dark:border-green-500/20">
                <PaperclipIcon className="w-5 h-5 shrink-0" />
                <p>Votre CV de profil sera utilisé par défaut.</p>
              </div>
            )}

            {!hasProfileCv || (hasProfileCv && !file) ? (
              <div
                className="flex flex-col items-center justify-center min-h-32 rounded-xl border border-input border-dashed p-4 transition-colors hover:bg-accent/50 cursor-pointer data-[dragging=true]:bg-accent/50"
                data-dragging={isDragging || undefined}
                onClick={openFileDialog}
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
              >
                <input {...getInputProps()} className="sr-only" />
                <UploadIcon className="w-5 h-5 text-muted-foreground mb-2" />
                <p className="text-sm font-medium">
                  Déposez votre PDF ici ou{" "}
                  <span className="text-primary underline">parcourir</span>
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  PDF uniquement • max 5 Mo
                </p>
              </div>
            ) : null}

            {file && (
              <div className="flex items-center justify-between gap-2 rounded-xl border px-4 py-3 bg-card">
                <div className="flex items-center gap-3 overflow-hidden">
                  <PaperclipIcon className="w-4 h-4 text-muted-foreground shrink-0" />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">
                      {file.file.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatBytes(file.file.size)}
                    </p>
                  </div>
                </div>

                <Button
                  type="button"
                  aria-label="Remove file"
                  variant="ghost"
                  size="icon"
                  className="text-muted-foreground hover:text-foreground shrink-0"
                  onClick={() => removeFile(file.id)}
                >
                  <XIcon className="w-4 h-4" />
                </Button>
              </div>
            )}

            {errors.length > 0 && (
              <div className="flex items-center gap-1 text-destructive text-xs">
                <AlertCircleIcon className="w-3 h-3 shrink-0" />
                <span>{errors[0]}</span>
              </div>
            )}
          </div>

          {/* Section Motivation */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <label className="text-sm font-semibold uppercase tracking-wider">
                LETTRE DE MOTIVATION
              </label>
              <span className="text-xs text-muted-foreground">Optionnel</span>
            </div>
            <Textarea
              placeholder="Expliquez au recruteur pourquoi vous correspondez à ce poste..."
              value={coverLetter}
              onChange={(e) => setCoverLetter(e.target.value)}
              rows={4}
              className="resize-none"
            />
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={() => setIsOpen(false)}
            disabled={isPending}
          >
            Annuler
          </Button>
          <Button
            onClick={handleApply}
            disabled={isPending || (!file && !hasProfileCv)}
            className="gap-2"
          >
            {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
            Soumettre la candidature
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
