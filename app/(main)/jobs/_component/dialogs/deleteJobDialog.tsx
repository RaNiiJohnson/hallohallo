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
import { Trash } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

function DeleteJobDialog({ jobId }: { jobId: string }) {
  const router = useRouter();
  async function handleDelete() {
    // try {
    //   await client.jobOffer.deleteJobOffer({ jobId });
    //   toast.success("Offre supprimée avec succès");
    //   router.push("/jobs");
    // } catch {
    //   toast.error("Erreur lors de la suppression de l'offre");
    // }
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
            <Button variant="destructive" onClick={handleDelete}>
              <Trash className="size-4" />
              Supprimer
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default DeleteJobDialog;
