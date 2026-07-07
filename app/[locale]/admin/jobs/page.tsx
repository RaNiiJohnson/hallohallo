import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MoreHorizontal, Search, SlidersHorizontal, Plus, Briefcase } from "lucide-react";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";

export default function JobsPage() {
  const jobs = [
    { id: "1", title: "Développeur Full Stack", company: "Tech Berlin", location: "Berlin", status: "Publiée", date: "2024-03-10", featured: true },
    { id: "2", title: "Infirmier(e)", company: "Hôpital de Munich", location: "Munich", status: "Publiée", date: "2024-03-08", featured: false },
    { id: "3", title: "Ingénieur Mécanique", company: "Auto Moteur", location: "Stuttgart", status: "En attente", date: "2024-03-11", featured: false },
    { id: "4", title: "Serveur", company: "Le Petit Paris", location: "Frankfurt", status: "Expirée", date: "2024-02-01", featured: false },
  ];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Offres d'emploi</h2>
          <p className="text-muted-foreground">Gérez toutes les offres d'emploi de la plateforme.</p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" /> Créer une offre
        </Button>
      </div>

      <div className="flex items-center justify-between gap-4 bg-card p-4 rounded-xl border">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Rechercher par titre, entreprise..." className="pl-9" />
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
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Entreprise</th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Lieu</th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Date</th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Statut</th>
                <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="[&_tr:last-child]:border-0">
              {jobs.map((job) => (
                <tr key={job.id} className="border-b transition-colors hover:bg-muted/50">
                  <td className="p-4 align-middle">
                    <div className="flex items-center gap-2">
                      <Briefcase className="h-4 w-4 text-muted-foreground shrink-0" />
                      <span className="font-medium">{job.title}</span>
                      {job.featured && (
                        <span className="inline-flex items-center rounded-full bg-purple-500/15 px-2 py-0.5 text-[10px] font-semibold text-purple-700 dark:text-purple-400">
                          À la une
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="p-4 align-middle">{job.company}</td>
                  <td className="p-4 align-middle">{job.location}</td>
                  <td className="p-4 align-middle">{job.date}</td>
                  <td className="p-4 align-middle">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                      job.status === "Publiée" ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400" :
                      job.status === "En attente" ? "bg-amber-500/15 text-amber-700 dark:text-amber-400" :
                      "bg-muted text-muted-foreground"
                    }`}>
                      {job.status}
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
                        <DropdownMenuItem>Voir les détails</DropdownMenuItem>
                        <DropdownMenuItem>Éditer</DropdownMenuItem>
                        <DropdownMenuItem>Mettre à la une</DropdownMenuItem>
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
