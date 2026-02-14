"use client";

import { HeroSection } from "@/components/hero-section";
import { Button, buttonVariants } from "@/components/ui/button";
import { useConvexAuth } from "convex/react";
import { Plus } from "lucide-react";
import { RealEstatesFilters } from "./_component/listingFilters";
import { ListingList } from "./_component/List/listingList";
import Link from "next/link";
import { PublishListingDialog } from "./_component/dialogs/publishListingDialog";

export default function ListingPageContent() {
  const { isAuthenticated } = useConvexAuth();
  return (
    <div className="min-h-screen bg-background pb-12">
      <HeroSection
        title="Immobilier"
        subtitle="Trouvez votre logement ou partagez le vôtre avec la communauté"
        backgroundImage="/images/real-estate-bg.png"
      />
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="relative">
          <RealEstatesFilters isAuthenticated={isAuthenticated} />

          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 my-8">
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-bold">Immobilier</h2>
            </div>
            {isAuthenticated && (
              <PublishListingDialog
                trigger={
                  <Button className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    <span>Publier une annonce</span>
                  </Button>
                }
              />
            )}
          </div>
          {/* <ListingList isAuthenticated={isAuthenticated} /> */}
        </div>
        <div className="text-center flex flex-col items-center mt-16 p-8 bg-card border rounded-xl shadow-sm">
          <h3 className="text-2xl font-bold mb-4">
            Vous avez un bien immobilier à proposer ?
          </h3>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            Rejoignez des centaines de propriétaires qui font confiance à notre
            plateforme pour proposer leurs biens immobiliers et trouver leurs
            futurs locataires.
          </p>
          {isAuthenticated ? (
            <PublishListingDialog
              trigger={<Button size="lg">Publier une annonce</Button>}
            />
          ) : (
            <Link href="/register" className={buttonVariants({ size: "lg" })}>
              S&apos;inscrire pour publier
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
