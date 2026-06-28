import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "@/i18n/navigation";
import { MoreHorizontal, Search, SlidersHorizontal, CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";

export default function UsersPage() {
  const users = [
    { id: "1", name: "Rivo Rakoto", email: "rivo@example.com", city: "Berlin", joined: "2023-10-12", status: "Actif", role: "Membre" },
    { id: "2", name: "Fara Miora", email: "fara@example.com", city: "Munich", joined: "2023-11-05", status: "Actif", role: "Modérateur" },
    { id: "3", name: "Haja Vola", email: "haja@example.com", city: "Hamburg", joined: "2024-01-20", status: "Suspendu", role: "Membre" },
    { id: "4", name: "Tiana Andriana", email: "tiana@example.com", city: "Frankfurt", joined: "2024-02-15", status: "Banni", role: "Membre" },
    { id: "5", name: "Njaka Rasolo", email: "njaka@example.com", city: "Stuttgart", joined: "2024-03-01", status: "Actif", role: "Membre" },
  ];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Utilisateurs</h2>
          <p className="text-muted-foreground">Gérez les membres de la plateforme.</p>
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
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Nom</th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Ville</th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Inscription</th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Statut</th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Rôle</th>
                <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="[&_tr:last-child]:border-0">
              {users.map((user) => (
                <tr key={user.id} className="border-b transition-colors hover:bg-muted/50">
                  <td className="p-4 align-middle">
                    <div className="flex flex-col">
                      <span className="font-medium">{user.name}</span>
                      <span className="text-xs text-muted-foreground">{user.email}</span>
                    </div>
                  </td>
                  <td className="p-4 align-middle">{user.city}</td>
                  <td className="p-4 align-middle">{user.joined}</td>
                  <td className="p-4 align-middle">
                    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                      user.status === "Actif" ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400" :
                      user.status === "Suspendu" ? "bg-amber-500/15 text-amber-700 dark:text-amber-400" :
                      "bg-destructive/15 text-destructive"
                    }`}>
                      {user.status === "Actif" && <CheckCircle2 className="h-3 w-3" />}
                      {user.status === "Suspendu" && <AlertCircle className="h-3 w-3" />}
                      {user.status === "Banni" && <XCircle className="h-3 w-3" />}
                      {user.status}
                    </span>
                  </td>
                  <td className="p-4 align-middle">{user.role}</td>
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
                          <Link href={`/admin/users/${user.id}`}>Voir le profil</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-amber-600 focus:text-amber-600 focus:bg-amber-100 dark:focus:bg-amber-900/20">
                          Suspendre
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive focus:text-destructive focus:bg-destructive/10">
                          Bannir
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
