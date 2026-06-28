import { Button } from "@/components/ui/button";
import { Download, TrendingUp, Users, Activity, Target } from "lucide-react";

export default function StatisticsPage() {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Statistiques</h2>
          <p className="text-muted-foreground">Visualisez les données et l'activité de la plateforme.</p>
        </div>
        <Button variant="outline" className="gap-2">
          <Download className="h-4 w-4" /> Exporter (CSV)
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Users className="h-5 w-5 text-blue-500" />
            <h3 className="font-semibold">Nouveaux membres</h3>
          </div>
          <div className="text-3xl font-bold">142</div>
          <p className="text-sm text-emerald-500 mt-1 flex items-center">
            <TrendingUp className="h-3 w-3 mr-1" /> +12% ce mois
          </p>
        </div>
        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="h-5 w-5 text-purple-500" />
            <h3 className="font-semibold">Activité globale</h3>
          </div>
          <div className="text-3xl font-bold">4.2k</div>
          <p className="text-sm text-emerald-500 mt-1 flex items-center">
            <TrendingUp className="h-3 w-3 mr-1" /> +5% ce mois
          </p>
        </div>
        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Target className="h-5 w-5 text-amber-500" />
            <h3 className="font-semibold">Taux d'approbation</h3>
          </div>
          <div className="text-3xl font-bold">87%</div>
          <p className="text-sm text-muted-foreground mt-1">
            Sur 450 éléments modérés
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-xl border bg-card p-6 shadow-sm min-h-[300px] flex flex-col items-center justify-center text-muted-foreground bg-muted/10">
          <TrendingUp className="h-10 w-10 mb-4 opacity-50" />
          <p>Graphique des inscriptions dans le temps</p>
          <p className="text-xs">(Mockup de graphique à implémenter avec Recharts/Chart.js)</p>
        </div>
        <div className="rounded-xl border bg-card p-6 shadow-sm min-h-[300px] flex flex-col items-center justify-center text-muted-foreground bg-muted/10">
          <Users className="h-10 w-10 mb-4 opacity-50" />
          <p>Répartition par ville (Pie chart)</p>
          <p className="text-xs">Berlin 40%, Munich 30%, Hamburg 20%, Autres 10%</p>
        </div>
      </div>
    </div>
  );
}
