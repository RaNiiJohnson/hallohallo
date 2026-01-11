import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import Link from "next/link";

export default function PricingPage() {
  return (
    <section className="py-16 md:py-32">
      <div className="mx-auto max-w-5xl px-6">
        <div className="mx-auto max-w-2xl space-y-6 text-center">
          <h1 className="text-center text-4xl font-semibold lg:text-5xl">
            Choisissez votre plan
          </h1>
          <p>
            Rejoignez la communauté Malagasy en Allemagne avec le plan qui vous
            convient. Commencez gratuitement et évoluez selon vos besoins.
          </p>
        </div>

        <div className="mt-8 grid gap-6 md:mt-20 md:grid-cols-5 md:gap-0">
          <div className="rounded-lg flex flex-col justify-between space-y-8 border p-6 md:col-span-2 md:my-2 md:rounded-r-none md:border-r-0 lg:p-10">
            <div className="space-y-4">
              <div>
                <h2 className="font-medium">Gratuit</h2>
                <span className="my-3 block text-2xl font-semibold">
                  0€ / mois
                </span>
              </div>

              <Button asChild variant="outline" className="w-full">
                <Link href="">Commencer gratuitement</Link>
              </Button>

              <hr className="border-dashed" />

              <ul className="list-outside space-y-3 text-sm">
                {[
                  "Profil de base",
                  "Consultation des annonces",
                  "3 contacts par mois",
                  "Accès aux événements publics",
                  "Recherche simple",
                ].map((item, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="dark:bg-muted rounded-lg border p-6 shadow-lg shadow-gray-950/5 md:col-span-3 lg:p-10 dark:[--color-muted:var(--color-zinc-900)]">
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-4">
                <div>
                  <h2 className="font-medium">Pro</h2>
                  <span className="my-3 block text-2xl font-semibold">
                    9€ / mois
                  </span>
                </div>

                <Button asChild className="w-full">
                  <Link href="">Choisir Premium</Link>
                </Button>
              </div>

              <div>
                <ul className="mt-4 list-outside space-y-3 text-sm">
                  {[
                    "Contacts illimités",
                    "Profil mis en avant",
                    "Filtres avancés",
                    "Badge Premium",
                    "Accès aux événements privés",
                    "Statistiques de profil",
                    "Support prioritaire",
                  ].map((item, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-500" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* FAQ */}
      <div className="mt-16 text-center">
        <h3 className="text-2xl font-bold mb-4">Questions fréquentes</h3>
        <p className="text-muted-foreground mb-6">
          Vous avez des questions ? Nous sommes là pour vous aider.
        </p>
        <Button asChild variant="outline">
          <Link href="/faq">Voir la FAQ</Link>
        </Button>
      </div>
    </section>
  );
}
