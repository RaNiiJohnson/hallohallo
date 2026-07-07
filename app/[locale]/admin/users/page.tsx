"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Link } from "@/i18n/navigation";
import { api } from "@convex/_generated/api";
import { UserWithRoleType } from "@convex/auth/users";
import { useQuery } from "convex-helpers/react/cache";
import { useMutation } from "convex/react";
import {
  AlertTriangle,
  CheckCircle2,
  Loader2,
  MoreHorizontal,
  Plus,
  Search,
  SlidersHorizontal,
  XCircle,
} from "lucide-react";
import { useState, useTransition } from "react";
import { toast } from "sonner";

export default function UsersPage() {
  const users = useQuery(api.auth.admin.listUsers);
  const banUser = useMutation(api.auth.admin.banUser);
  const unbanUser = useMutation(api.auth.admin.unbanUser);
  const setUseRole = useMutation(api.auth.admin.setUserRole);
  const createUser = useMutation(api.auth.admin.createUser);
  const deleteUser = useMutation(api.auth.admin.deleteUser);

  const [isPending, startTransition] = useTransition();

  // États pour les dialogs de confirmation
  const [confirmBan, setConfirmBan] = useState<UserWithRoleType | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<UserWithRoleType | null>(
    null,
  );
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const handleCreateUser = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const name = formData.get("name") as string;
    const password = formData.get("password") as string;
    const role = formData.get("role") as "user" | "admin";

    startTransition(async () => {
      try {
        await createUser({
          userId: crypto.randomUUID(), // Temporaire car BetterAuth gère l'ID, mais requis par le schéma actuel
          email,
          name,
          password,
          role,
        });
        toast.success(`Utilisateur ${name} créé avec succès`);
        setIsCreateOpen(false);
      } catch (error: any) {
        toast.error(error.message || "Erreur lors de la création");
      }
    });
  };

  const handleBanUser = (user: UserWithRoleType) => {
    startTransition(async () => {
      try {
        if (user.banned) {
          await unbanUser({ userId: user.id });
          toast.success(`Utilisateur ${user.name} débanni`);
        } else {
          await banUser({ userId: user.id });
          toast.success(`Utilisateur ${user.name} banni`);
        }
      } catch (error: any) {
        toast.error(error.message || "Erreur lors de l'opération");
      } finally {
        setConfirmBan(null);
      }
    });
  };

  const handleSetRole = (user: UserWithRoleType, role: "user" | "admin") => {
    startTransition(async () => {
      try {
        await setUseRole({ userId: user.id, role });
        toast.success(`Rôle de ${user.name} mis à jour : ${role}`);
      } catch (error: any) {
        toast.error(error.message || "Erreur lors du changement de rôle");
      }
    });
  };

  const handleDeleteUser = (user: UserWithRoleType) => {
    startTransition(async () => {
      try {
        await deleteUser({ userId: user.id });
        toast.success(`Utilisateur ${user.name} supprimé`);
      } catch (error: any) {
        toast.error(error.message || "Erreur lors de la suppression");
      } finally {
        setConfirmDelete(null);
      }
    });
  };

  return (
    <>
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Utilisateurs</h2>
            <p className="text-muted-foreground">
              Gérez les membres de la plateforme.
            </p>
          </div>
          <Button onClick={() => setIsCreateOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Ajouter
          </Button>
        </div>

        <div className="flex items-center justify-between gap-4 bg-card p-4 rounded-xl border">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher par nom, email..."
              className="pl-9"
            />
          </div>
          <Button variant="outline" className="gap-2">
            <SlidersHorizontal className="h-4 w-4" />
            Filtres
          </Button>
        </div>

        <div className="rounded-xl border bg-card">
          <div className="relative w-full overflow-auto">
            <table className="w-full caption-bottom text-sm">
              <thead className="[&_tr]:border-b">
                <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                    Nom
                  </th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                    Ville
                  </th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                    Inscription
                  </th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                    Statut
                  </th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                    Rôle
                  </th>
                  <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody
                className={`[&_tr:last-child]:border-0 transition-opacity duration-200 ${isPending && users && users.length > 0 ? "opacity-50 pointer-events-none" : ""}`}
              >
                {isPending && users === undefined ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center">
                      <div className="flex flex-col items-center justify-center text-muted-foreground">
                        <Loader2 className="h-8 w-8 animate-spin mb-4" />
                        <p>Chargement des utilisateurs...</p>
                      </div>
                    </td>
                  </tr>
                ) : users === undefined ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center">
                      <div className="flex flex-col items-center justify-center text-muted-foreground">
                        <Loader2 className="h-8 w-8 animate-spin mb-4" />
                        <p>Aucun utilisateur trouvé.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <tr
                      key={user.id ?? user._id}
                      className="border-b transition-colors hover:bg-muted/50"
                    >
                      <td className="p-4 align-middle">
                        <div className="flex flex-col">
                          <span className="font-medium">{user.name}</span>
                          <span className="text-xs text-muted-foreground">
                            {user.email}
                          </span>
                        </div>
                      </td>
                      <td className="p-4 align-middle">{user.city || "-"}</td>
                      <td className="p-4 align-middle">
                        {user.createdAt
                          ? new Date(user.createdAt).toLocaleDateString()
                          : "-"}
                      </td>
                      <td className="p-4 align-middle">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                            !user.banned
                              ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400"
                              : "bg-destructive/15 text-destructive"
                          }`}
                        >
                          {!user.banned ? (
                            <>
                              <CheckCircle2 className="h-3 w-3" />
                              Actif
                            </>
                          ) : (
                            <>
                              <XCircle className="h-3 w-3" />
                              Banni
                            </>
                          )}
                        </span>
                      </td>
                      <td className="p-4 align-middle">
                        <Select
                          value={user.role ?? "user"}
                          onValueChange={(value) =>
                            handleSetRole(user, value as "user" | "admin")
                          }
                          disabled={isPending}
                        >
                          <SelectTrigger className="w-28 h-8 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectGroup>
                              <SelectItem value="user">User</SelectItem>
                              <SelectItem value="admin">Admin</SelectItem>
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="p-4 align-middle text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Open menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <Link href={`/hl/${user.slug}`}>
                                Voir le profil
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => setConfirmBan(user)}
                              disabled={isPending}
                              className={
                                user.banned
                                  ? "text-emerald-600 focus:text-emerald-600 focus:bg-emerald-100 dark:focus:bg-emerald-900/20"
                                  : "text-destructive focus:text-destructive focus:bg-destructive/10"
                              }
                            >
                              {user.banned ? "Débannir" : "Bannir"}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => setConfirmDelete(user)}
                              disabled={isPending}
                              className="text-destructive focus:text-destructive focus:bg-destructive/10"
                            >
                              Supprimer
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Dialog — Confirmation de bannissement */}
      <Dialog
        open={!!confirmBan}
        onOpenChange={(open) => !open && setConfirmBan(null)}
      >
        <DialogContent showCloseButton={false}>
          <DialogHeader>
            <div className="flex items-center gap-3 mb-1">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/30">
                <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              </div>
              <DialogTitle>
                {confirmBan?.banned
                  ? "Débannir cet utilisateur ?"
                  : "Bannir cet utilisateur ?"}
              </DialogTitle>
            </div>
            <DialogDescription className="space-y-2">
              <span className="block">
                Vous êtes sur le point de{" "}
                {confirmBan?.banned ? "débannir" : "bannir"}{" "}
                <strong>{confirmBan?.name}</strong>.
              </span>
              {confirmBan?.banned && (
                <span className="block text-amber-600 dark:text-amber-400 font-medium">
                  L'utilisateur ne pourra plus se connecter à la plateforme tant
                  que le bannissement est actif.
                </span>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setConfirmBan(null)}
              disabled={isPending}
            >
              Annuler
            </Button>
            <Button
              variant={confirmBan?.banned ? "default" : "destructive"}
              onClick={() => confirmBan && handleBanUser(confirmBan)}
              disabled={isPending}
            >
              {isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              {confirmBan?.banned ? "Oui, débannir" : "Oui, bannir"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog — Confirmation de suppression */}
      <Dialog
        open={!!confirmDelete}
        onOpenChange={(open) => !open && setConfirmDelete(null)}
      >
        <DialogContent showCloseButton={false}>
          <DialogHeader>
            <div className="flex items-center gap-3 mb-1">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive/15">
                <AlertTriangle className="h-5 w-5 text-destructive" />
              </div>
              <DialogTitle>Supprimer cet utilisateur ?</DialogTitle>
            </div>
            <DialogDescription className="space-y-2">
              <span className="block">
                Vous êtes sur le point de supprimer définitivement{" "}
                <strong>{confirmDelete?.name}</strong> ({confirmDelete?.email}).
              </span>
              <span className="block font-semibold text-destructive">
                ⚠️ Cette action est irréversible. Toutes les données associées à
                ce compte seront perdues.
              </span>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setConfirmDelete(null)}
              disabled={isPending}
            >
              Annuler
            </Button>
            <Button
              variant="destructive"
              onClick={() => confirmDelete && handleDeleteUser(confirmDelete)}
              disabled={isPending}
            >
              {isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              Oui, supprimer définitivement
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog — Création d'utilisateur */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ajouter un utilisateur</DialogTitle>
            <DialogDescription>
              Créez un nouveau compte utilisateur.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateUser} className="space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-medium">Nom complet</label>
              <Input name="name" required placeholder="John Doe" className="h-11" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Email</label>
              <Input
                name="email"
                type="email"
                required
                placeholder="john@example.com"
                className="h-11"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Mot de passe</label>
              <PasswordInput
                name="password"
                required
                placeholder="••••••••"
                minLength={8}
                className="h-11"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Rôle</label>
              <Select name="role" defaultValue="user">
                <SelectTrigger className="h-11">
                  <SelectValue placeholder="Sélectionnez un rôle" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">Utilisateur</SelectItem>
                  <SelectItem value="admin">Administrateur</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <DialogFooter className="pt-4">
              <Button
                type="button"
                variant="outline"
                className="h-11"
                onClick={() => setIsCreateOpen(false)}
                disabled={isPending}
              >
                Annuler
              </Button>
              <Button type="submit" className="h-11" disabled={isPending}>
                {isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : null}
                Créer l'utilisateur
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
