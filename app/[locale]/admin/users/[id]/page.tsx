import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { ArrowLeft, User, Mail, MapPin, Calendar, Shield, Activity, Ban } from "lucide-react";

export default function UserDetailPage() {
  const user = {
    id: "1",
    name: "Rivo Rakoto",
    email: "rivo@example.com",
    city: "Berlin",
    joined: "2023-10-12",
    status: "Actif",
    role: "Membre",
    bio: "Développeur passionné, originaire de Tana. En Allemagne depuis 3 ans.",
    stats: {
      posts: 12,
      comments: 45,
      reports: 0,
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/admin/users">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Profil de {user.name}</h2>
          <p className="text-muted-foreground">ID: {user.id}</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Profile Card */}
        <div className="md:col-span-1 space-y-6">
          <div className="rounded-xl border bg-card p-6 text-center shadow-sm">
            <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-primary/10 text-3xl font-bold text-primary mb-4">
              {user.name.split(' ').map(n => n[0]).join('')}
            </div>
            <h3 className="text-xl font-semibold">{user.name}</h3>
            <span className="inline-flex mt-2 items-center rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
              {user.status}
            </span>

            <div className="mt-6 space-y-3 text-sm text-left">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Mail className="h-4 w-4 shrink-0" />
                <span className="truncate">{user.email}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="h-4 w-4 shrink-0" />
                <span>{user.city}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="h-4 w-4 shrink-0" />
                <span>Inscrit le {user.joined}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Shield className="h-4 w-4 shrink-0" />
                <span>Rôle: {user.role}</span>
              </div>
            </div>

            <div className="mt-6 space-y-2">
              <Button className="w-full bg-amber-600 hover:bg-amber-700 text-white" variant="outline">
                <Activity className="mr-2 h-4 w-4" /> Suspendre
              </Button>
              <Button className="w-full text-destructive border-destructive/30 hover:bg-destructive/10" variant="outline">
                <Ban className="mr-2 h-4 w-4" /> Bannir
              </Button>
            </div>
          </div>
        </div>

        {/* Activity & Stats */}
        <div className="md:col-span-2 space-y-6">
          <div className="grid gap-4 grid-cols-3">
            <div className="rounded-xl border bg-card p-4 shadow-sm text-center">
              <div className="text-3xl font-bold">{user.stats.posts}</div>
              <div className="text-xs text-muted-foreground mt-1">Posts</div>
            </div>
            <div className="rounded-xl border bg-card p-4 shadow-sm text-center">
              <div className="text-3xl font-bold">{user.stats.comments}</div>
              <div className="text-xs text-muted-foreground mt-1">Commentaires</div>
            </div>
            <div className="rounded-xl border bg-card p-4 shadow-sm text-center">
              <div className="text-3xl font-bold text-destructive">{user.stats.reports}</div>
              <div className="text-xs text-muted-foreground mt-1">Signalements reçus</div>
            </div>
          </div>

          <div className="rounded-xl border bg-card shadow-sm">
            <div className="border-b p-4">
              <h3 className="font-semibold">Activité Récente</h3>
            </div>
            <div className="p-4 text-center text-muted-foreground py-8 text-sm">
              Aucune activité récente à afficher.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
