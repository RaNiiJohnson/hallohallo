import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MoreHorizontal, Search, SlidersHorizontal, Plus, Building } from "lucide-react";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";

export default function ListingPage() {
  const listings = [
    { id: "1", title: "Colocation 3P au centre", type: "Chambre", location: "Munich", status: "Publiée", price: "600€", author: "Fara Miora" },
    { id: "2", title: "Studio meublé proche métro", type: "Appartement", location: "Berlin", status: "Publiée", price: "950€", author: "Rivo Rakoto" },
    { id: "3", title: "Maison de famille", type: "Maison", location: "Frankfurt", status: "En attente", price: "2100€", author: "Haja V" },
  ];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Immobilier</h2>
          <p className="text-muted-foreground">Gérez les annonces immobilières et colocations.</p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" /> Nouvelle annonce
        </Button>
      </div>

      <div className="flex items-center justify-between gap-4 bg-card p-4 rounded-xl border">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Rechercher une annonce..." className="pl-9" />
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
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Titre</th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Type</th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Lieu</th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Prix</th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Auteur</th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Statut</th>
                <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="[&_tr:last-child]:border-0">
              {listings.map((item) => (
                <tr key={item.id} className="border-b transition-colors hover:bg-muted/50">
                  <td className="p-4 align-middle">
                    <div className="flex items-center gap-2">
                      <Building className="h-4 w-4 text-muted-foreground shrink-0" />
                      <span className="font-medium">{item.title}</span>
                    </div>
                  </td>
                  <td className="p-4 align-middle">{item.type}</td>
                  <td className="p-4 align-middle">{item.location}</td>
                  <td className="p-4 align-middle font-semibold">{item.price}</td>
                  <td className="p-4 align-middle text-muted-foreground">{item.author}</td>
                  <td className="p-4 align-middle">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                      item.status === "Publiée" ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400" :
                      item.status === "En attente" ? "bg-amber-500/15 text-amber-700 dark:text-amber-400" :
                      "bg-muted text-muted-foreground"
                    }`}>
                      {item.status}
                    </span>
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
                        <DropdownMenuItem>Voir l'annonce</DropdownMenuItem>
                        <DropdownMenuItem>Approuver</DropdownMenuItem>
                        <DropdownMenuItem>Marquer comme expirée</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive focus:text-destructive">Supprimer</DropdownMenuItem>
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
