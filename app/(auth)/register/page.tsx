import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { SignupForm } from "./signup-form";
import { Button } from "@/components/ui/button";
import { ArrowLeftIcon } from "lucide-react";

export default async function SignupPage() {
  return (
    <div>
      <Button variant="outline" className="absolute top-4 left-4">
        <Link href="/" className="flex items-center">
          <ArrowLeftIcon className="mr-2 h-4 w-4" /> Retour
        </Link>
      </Button>
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-xl border-0 ">
          <CardHeader className="space-y-4 pb-8 text-center">
            <div className="space-y-2">
              <CardTitle className="text-2xl font-bold">
                Créez votre compte
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <SignupForm />
            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                Vous avez déjà un compte ?{" "}
                <Link
                  href="/auth/login"
                  className="font-medium text-primary hover:underline"
                >
                  Se connecter
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
