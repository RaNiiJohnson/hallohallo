import { Button } from "@/components/ui/button";
import { Check, X, Flag, Briefcase, Building } from "lucide-react";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";

export default function ModerationPage() {
  const queues = [
    {
      id: 1,
      type: "job",
      icon: Briefcase,
      title: "Développeur Full Stack - Berlin",
      author: "Rivo Rakoto",
      time: "il y a 1h",
      content: "Nous recherchons un développeur pour rejoindre notre équipe à Berlin...",
      color: "bg-blue-500/10 text-blue-500",
    },
    {
      id: 2,
      type: "listing",
      icon: Building,
      title: "Colocation 3P à Munich centre",
      author: "Fara Miora",
      time: "il y a 3h",
      content: "Je propose une chambre dans une colocation sympa au centre de Munich.",
      color: "bg-emerald-500/10 text-emerald-500",
    },
    {
      id: 3,
      type: "report",
      icon: Flag,
      title: "Signalement : contenu inapproprié",
      author: "Anonyme",
      time: "il y a 6h",
      content: "Ce commentaire contient des propos injurieux.",
      color: "bg-destructive/10 text-destructive",
      target: "Commentaire par Haja V",
    }
  ];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">File de modération</h2>
        <p className="text-muted-foreground">Traitez les éléments en attente d'approbation ou signalés.</p>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-4 max-w-[500px]">
          <TabsTrigger value="all">Tout (3)</TabsTrigger>
          <TabsTrigger value="jobs">Offres (1)</TabsTrigger>
          <TabsTrigger value="listings">Immobilier (1)</TabsTrigger>
          <TabsTrigger value="reports">Signalements (1)</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="mt-6 space-y-4">
          {queues.map((item) => (
            <div key={item.id} className="rounded-xl border bg-card p-5 shadow-sm flex flex-col md:flex-row gap-4">
              <div className={`flex size-12 shrink-0 items-center justify-center rounded-lg ${item.color}`}>
                <item.icon className="size-6" />
              </div>
              <div className="flex-1 space-y-2">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-lg">{item.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      Par <span className="font-medium text-foreground">{item.author}</span> • {item.time}
                    </p>
                    {item.target && (
                      <div className="mt-1 text-xs bg-muted/50 p-1.5 rounded inline-block text-muted-foreground border">
                        Cible: {item.target}
                      </div>
                    )}
                  </div>
                </div>
                <div className="bg-muted/30 p-3 rounded-md text-sm border">
                  {item.content}
                </div>
              </div>
              <div className="flex flex-row md:flex-col gap-2 shrink-0 justify-center">
                <Button className="w-full md:w-32 bg-emerald-600 hover:bg-emerald-700">
                  <Check className="mr-2 h-4 w-4" /> Approuver
                </Button>
                <Button variant="outline" className="w-full md:w-32 text-destructive border-destructive/30 hover:bg-destructive/10">
                  <X className="mr-2 h-4 w-4" /> Rejeter
                </Button>
              </div>
            </div>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}
