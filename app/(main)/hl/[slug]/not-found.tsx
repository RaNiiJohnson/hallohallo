import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, User } from "lucide-react";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen p-4 flex items-center justify-center">
      <Card className="max-w-md w-full text-center">
        <CardHeader>
          <div className="mx-auto mb-4">
            <User className="h-16 w-16 text-muted-foreground" />
          </div>
          <CardTitle className="text-2xl">Profil introuvable</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Ce profil n&apos;existe pas ou a été supprimé.
          </p>
          <Link href="/community">
            <Button className="w-full">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour aux communautés
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
