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
import { useTranslations } from "next-intl";

function DeleteJobDialog({ jobId }: { jobId: Id<"JobOffer"> }) {
  const deleteJob = useMutation(api.jobs.deleteJob);
  const [isPending, startTransition] = useTransition();
  const t = useTranslations("jobs.dialogs.delete");

  const router = useRouter();
  async function handleDelete() {
    try {
      startTransition(() => {
        deleteJob({ id: jobId });
      });
      toast.success(t("successToast"));
      router.push("/jobs");
    } catch {
      toast.error(t("errorToast"));
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size="sm" variant="destructive">
          <Trash className="size-4" />
          {t("trigger")}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("title")}</DialogTitle>
          <DialogDescription>
            {t("description")}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">{t("cancel")}</Button>
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
                  {t("submiting")}
                </>
              ) : (
                <>
                  <Trash className="size-4" /> {t("trigger")}
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
