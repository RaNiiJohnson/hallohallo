"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Link } from "@/i18n/navigation";
import { api } from "@convex/_generated/api";
import { UserWithRoleType } from "@convex/auth/users";
import { useQuery } from "convex-helpers/react/cache";
import { useMutation } from "convex/react";
import {
  CheckCircle2,
  Loader2,
  MoreHorizontal,
  Search,
  SlidersHorizontal,
  XCircle,
} from "lucide-react";
import { useTransition } from "react";
import { toast } from "sonner";

export default function UsersPage() {
  const users = useQuery(api.auth.admin.listUsers);
  const banUser = useMutation(api.auth.admin.banUser);
  const unbanUser = useMutation(api.auth.admin.unbanUser);
  const deleteUser = useMutation(api.auth.admin.deleteUser);

  const [isPending, startTransition] = useTransition();

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
        // rien à faire ici : la subscription Convex met déjà `users` à jour
      } catch (error: any) {
        toast.error(error.message || "Erreur lors de l'opération");
      }
    });
  };

  const handleDeleteUser = (user: UserWithRoleType) => {
    startTransition(async () => {
      try {
        await deleteUser({ userId: user.id });
        toast.success(`Utilisateur ${user.name} rétiré`);
      } catch (error: any) {
        toast.error(error.message || "Erreur lors de l'opération");
      }
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Utilisateurs</h2>
          <p className="text-muted-foreground">
            Gérez les membres de la plateforme.
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between gap-4 bg-card p-4 rounded-xl border">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Rechercher par nom, email..." className="pl-9" />
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
                    <td className="p-4 align-middle capitalize">
                      {user.role || "user"}
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
                            onClick={() => handleBanUser(user)}
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
                            onClick={() => handleDeleteUser(user)}
                            disabled={isPending}
                          >
                            rétirer
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
  );
}
