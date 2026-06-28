import { Input } from "@/components/ui/input";
import { Search, History, User } from "lucide-react";

export default function AuditLogPage() {
  const logs = [
    {
      id: 1,
      action: "Suspension d'utilisateur",
      admin: "Super Admin",
      target: "Haja Vola (User #3)",
      time: "Aujourd'hui à 14:30",
      type: "warning",
    },
    {
      id: 2,
      action: "Approbation d'offre",
      admin: "Modérateur 1",
      target: "Développeur Full Stack (Job #12)",
      time: "Aujourd'hui à 11:15",
      type: "success",
    },
    {
      id: 3,
      action: "Rejet d'annonce",
      admin: "Super Admin",
      target: "Colocation louche (Immo #45)",
      time: "Hier à 16:45",
      type: "danger",
    },
    {
      id: 4,
      action: "Changement de rôle",
      admin: "Super Admin",
      target: "Fara Miora -> Modérateur",
      time: "Hier à 10:00",
      type: "info",
    },
    {
      id: 5,
      action: "Création de communauté",
      admin: "Modérateur 1",
      target: "Malagasy in Frankfurt",
      time: "Le 10 Mars 2024",
      type: "success",
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Audit log</h2>
        <p className="text-muted-foreground">
          Historique de toutes les actions d'administration.
        </p>
      </div>

      <div className="flex items-center gap-4 bg-card p-4 rounded-xl border">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Chercher une action, un admin..."
            className="pl-9"
          />
        </div>
      </div>

      <div className="rounded-xl border bg-card p-6 shadow-sm">
        <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-linear-to-b before:from-transparent before:via-border before:to-transparent">
          {logs.map((log) => (
            <div
              key={log.id}
              className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active"
            >
              <div
                className={`flex items-center justify-center w-10 h-10 rounded-full border-4 border-background shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-sm z-10 ${
                  log.type === "warning"
                    ? "bg-amber-500"
                    : log.type === "success"
                      ? "bg-emerald-500"
                      : log.type === "danger"
                        ? "bg-destructive"
                        : "bg-blue-500"
                }`}
              >
                <History className="h-4 w-4 text-white" />
              </div>

              <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-card border rounded-xl p-4 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold">{log.action}</h3>
                  <span className="text-xs text-muted-foreground">
                    {log.time}
                  </span>
                </div>
                <div className="text-sm space-y-1">
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <User className="h-3.5 w-3.5" />
                    Par:{" "}
                    <span className="font-medium text-foreground">
                      {log.admin}
                    </span>
                  </div>
                  <div className="text-muted-foreground">
                    Cible: <span className="font-medium">{log.target}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
