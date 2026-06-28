import { Button } from "@/components/ui/button";
import { Plus, Users, Settings } from "lucide-react";

export default function CommunitiesPage() {
  const communities = [
    { id: "1", name: "Malagasy in Berlin", members: 342, posts: 1205, admins: ["Rivo", "Tiana"] },
    { id: "2", name: "Etudiants Malagasy en Allemagne", members: 856, posts: 3450, admins: ["Fara"] },
    { id: "3", name: "Malagasy in Munich", members: 124, posts: 432, admins: ["Haja"] },
  ];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Communautés</h2>
          <p className="text-muted-foreground">Gérez les groupes et leurs administrateurs.</p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" /> Créer une communauté
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {communities.map((comm) => (
          <div key={comm.id} className="rounded-xl border bg-card p-6 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary font-bold">
                  {comm.name.charAt(0)}
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Settings className="h-4 w-4 text-muted-foreground" />
                </Button>
              </div>
              <h3 className="font-semibold text-lg leading-tight mb-1">{comm.name}</h3>
              <p className="text-xs text-muted-foreground mb-4">
                Admins: {comm.admins.join(', ')}
              </p>
            </div>
            
            <div className="flex items-center gap-4 text-sm pt-4 border-t">
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Users className="h-4 w-4" />
                <span>{comm.members} membres</span>
              </div>
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <span className="font-medium">{comm.posts}</span> posts
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
