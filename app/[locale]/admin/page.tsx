import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { Briefcase, Building, Flag, ShieldAlert, ArrowRight, Check, X } from "lucide-react";

export default function AdminDashboardPage() {
  const kpis = [
    {
      title: "Membres",
      value: "1 284",
      subtext: "+12 ce mois",
      trend: "up",
    },
    {
      title: "Offres actives",
      value: "47",
      subtext: "+3 cette semaine",
      trend: "up",
    },
    {
      title: "Annonces immo",
      value: "23",
      subtext: "-2 expirées",
      trend: "down",
    },
    {
      title: "Signalements",
      value: "5",
      subtext: "à traiter",
      trend: "neutral",
      isAlert: true,
    },
  ];

  const recentUsers = [
    { initials: "RR", name: "Rivo Rakoto", location: "Berlin", time: "il y a 2h", status: "actif" },
    { initials: "FM", name: "Fara Miora", location: "Munich", time: "il y a 5h", status: "actif" },
    { initials: "HV", name: "Haja Vola", location: "Hamburg", time: "hier", status: "en attente" },
    { initials: "TA", name: "Tiana Andriana", location: "Frankfurt", time: "hier", status: "actif" },
  ];

  const moderationItems = [
    {
      id: 1,
      type: "job",
      icon: Briefcase,
      title: "Développeur Full Stack - Berlin",
      meta: "Offre • soumise il y a 1h",
      actions: ["Approuver", "Rejeter"],
      color: "bg-blue-500/10 text-blue-500",
    },
    {
      id: 2,
      type: "listing",
      icon: Building,
      title: "Colocation 3P à Munich centre",
      meta: "Immobilier • soumise il y a 3h",
      actions: ["Approuver", "Rejeter"],
      color: "bg-emerald-500/10 text-emerald-500",
    },
    {
      id: 3,
      type: "report",
      icon: Flag,
      title: "Signalement : contenu inapproprié",
      meta: "Forum • signalé il y a 6h",
      actions: ["Ignorer", "Supprimer"],
      color: "bg-destructive/10 text-destructive",
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground">Vue d'ensemble de l'activité sur Hallo Hallo.</p>
      </div>

      {/* KPIs */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {kpis.map((kpi, i) => (
          <div
            key={i}
            className="rounded-xl border bg-card p-6 shadow-sm flex flex-col justify-between"
          >
            <h3 className="text-sm font-medium text-muted-foreground">{kpi.title}</h3>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-bold">{kpi.value}</span>
            </div>
            <p
              className={`text-xs mt-1 ${
                kpi.trend === "up" ? "text-emerald-500" : kpi.isAlert ? "text-destructive" : "text-muted-foreground"
              }`}
            >
              {kpi.subtext}
            </p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Derniers Inscrits */}
        <div className="rounded-xl border bg-card p-6 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold">Derniers inscrits</h3>
            <Button variant="ghost" size="sm" asChild className="text-sm text-primary">
              <Link href="/admin/users">
                Voir tout <ArrowRight className="ml-1 size-3" />
              </Link>
            </Button>
          </div>
          
          <div className="space-y-4">
            {recentUsers.map((user, i) => (
              <div key={i} className="flex items-center justify-between group">
                <div className="flex items-center gap-3">
                  <div className={`flex size-10 items-center justify-center rounded-full text-sm font-medium ${
                    user.status === "en attente" ? "bg-amber-500/10 text-amber-600 dark:text-amber-400" : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                  }`}>
                    {user.initials}
                  </div>
                  <div>
                    <p className="text-sm font-medium leading-none">{user.name}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {user.location} • {user.time}
                    </p>
                  </div>
                </div>
                <div>
                  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                    user.status === "actif" 
                      ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400" 
                      : "bg-amber-500/15 text-amber-700 dark:text-amber-400"
                  }`}>
                    {user.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* File de modération */}
        <div className="rounded-xl border bg-card p-6 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              File de modération
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-destructive/10 text-[10px] font-medium text-destructive">
                5
              </span>
            </h3>
            <Button variant="ghost" size="sm" asChild className="text-sm text-primary">
              <Link href="/admin/moderation">
                Tout traiter <ArrowRight className="ml-1 size-3" />
              </Link>
            </Button>
          </div>
          
          <div className="space-y-4">
            {moderationItems.map((item) => (
              <div key={item.id} className="flex items-start gap-4 rounded-lg border p-4 bg-background/50 transition-colors hover:bg-muted/50">
                <div className={`mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-md ${item.color}`}>
                  <item.icon className="size-4" />
                </div>
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium leading-none">{item.title}</p>
                  <p className="text-xs text-muted-foreground">{item.meta}</p>
                  
                  <div className="flex items-center gap-2 pt-2">
                    <Button size="sm" variant="outline" className="h-7 text-xs">
                      {item.actions[0] === "Approuver" && <Check className="mr-1 size-3 text-emerald-500" />}
                      {item.actions[0]}
                    </Button>
                    <Button size="sm" variant="outline" className="h-7 text-xs border-destructive/20 text-destructive hover:bg-destructive/10">
                      {item.actions[1] === "Rejeter" || item.actions[1] === "Supprimer" ? <X className="mr-1 size-3" /> : null}
                      {item.actions[1]}
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
