"use client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, Trash } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { Id } from "@convex/_generated/dataModel";
import { useTransition } from "react";

function DeleteJobDialog({ jobId }: { jobId: Id<"JobOffer"> }) {
  const deleteJob = useMutation(api.jobs.deleteJob);
  const [isPending, startTransition] = useTransition();

  const router = useRouter();
  async function handleDelete() {
    try {
      startTransition(() => {
        deleteJob({ id: jobId });
      });
      toast.success("Offre supprimée avec succès");
      router.push("/jobs");
    } catch {
      toast.error("Erreur lors de la suppression de l'offre");
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="destructive">
          <Trash className="size-4" />
          Supprimer
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Supprimer l&apos;offre</DialogTitle>
          <DialogDescription>
            Voulez-vous vraiment supprimer cette offre ?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Annuler</Button>
          </DialogClose>
          <DialogClose asChild>
            <Button
              variant="destructive"
              disabled={isPending}
              onClick={handleDelete}
            >
              {isPending ? (
                <>
                  <Loader2 className="size-4 animate-spin mr-2" />
                  Suppression...
                </>
              ) : (
                <>
                  <Trash className="size-4" /> Supprimer
                </>
              )}
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default DeleteJobDialog;
