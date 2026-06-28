import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Save, Shield, Settings2, Mail } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Paramètres</h2>
        <p className="text-muted-foreground">Configurez les options globales de la plateforme.</p>
      </div>

      <div className="grid gap-6">
        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4 border-b pb-4">
            <Settings2 className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold">Général</h3>
          </div>
          
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">Mode Maintenance</Label>
                <p className="text-sm text-muted-foreground">Désactive l'accès au site pour tous les utilisateurs non-admin.</p>
              </div>
              <Switch />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">Inscriptions Ouvertes</Label>
                <p className="text-sm text-muted-foreground">Permet aux nouveaux utilisateurs de créer un compte.</p>
              </div>
              <Switch defaultChecked />
            </div>
          </div>
        </div>

        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4 border-b pb-4">
            <Shield className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold">Modération</h3>
          </div>
          
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">Auto-approbation des offres</Label>
                <p className="text-sm text-muted-foreground">Les offres des utilisateurs de confiance sont publiées sans modération.</p>
              </div>
              <Switch defaultChecked />
            </div>
            
            <div className="space-y-2">
              <Label>Mots interdits (séparés par des virgules)</Label>
              <Input defaultValue="spam, arnaque, insult1, insult2" />
            </div>
          </div>
        </div>

        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4 border-b pb-4">
            <Mail className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold">Emails</h3>
          </div>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Email de contact (Support)</Label>
              <Input type="email" defaultValue="support@hallohallo.com" />
            </div>
            <div className="space-y-2">
              <Label>Email système (No-reply)</Label>
              <Input type="email" defaultValue="noreply@hallohallo.com" />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-4">
          <Button variant="outline">Annuler</Button>
          <Button className="gap-2">
            <Save className="h-4 w-4" /> Sauvegarder les modifications
          </Button>
        </div>
      </div>
    </div>
  );
}
