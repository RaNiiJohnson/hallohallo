"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "@/i18n/navigation";
import { ArrowLeftIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { SignupForm } from "./signup-form";

export default function SignupPage() {
  const t = useTranslations("auth.register");

  return (
    <div>
      <Button variant="outline" className="absolute top-4 left-4">
        <Link href="/" className="flex items-center">
          <ArrowLeftIcon className="mr-2 h-4 w-4" /> {t("back")}
        </Link>
      </Button>
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-xl border-0 ">
          <CardHeader className="space-y-4 pb-8 text-center">
            <div className="space-y-2">
              <CardTitle className="text-2xl font-bold">{t("title")}</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <SignupForm />
            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                {t("hasAccount")}{" "}
                <Link
                  href="/login"
                  className="font-medium text-primary hover:underline"
                >
                  {t("login")}
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
