"use client";

import { HeroSection } from "@/components/hero-section";
import { api } from "@convex/_generated/api";
import { useQuery } from "convex-helpers/react/cache";
import { Button } from "@/components/ui/button";
import { EmploisFilters } from "./_component/jobFilters";
import { PublishJobDialog } from "./_component/dialogs/publishJobDialog";
import { JobList } from "./_component/jobList";

export default function JobsPage() {
  const user = useQuery(api.auth.getCurrentUser);
  const jobs = useQuery(api.jobs.getJobs, {});

  if (jobs === undefined) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-background pb-12">
      <HeroSection
        title="Votre avenir en Allemagne commence ici"
        subtitle="Au pair, Formation, Emploi, Volontariat. Trouvez l'opportunité idéale pour votre projet de vie."
        backgroundImage="/images/jobs-bg.png"
      ></HeroSection>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <EmploisFilters user={user} />

        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 my-8">
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold">Opportunités</h2>
          </div>
          <PublishJobDialog />
        </div>
        <div className="min-h-screen bg-background pb-12">
          <JobList jobs={jobs} user={user} />
          {/* Call to action */}
          <div className="text-center mt-16 p-8 bg-card border rounded-xl shadow-sm">
            <h3 className="text-2xl font-bold mb-4">
              Vous avez une opportunité à partager ?
            </h3>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              Rejoignez des centaines d&apos;entreprises et recruteurs qui font
              confiance à notre plateforme pour trouver leurs futurs talents.
            </p>
            {user ? (
              <PublishJobDialog
                trigger={<Button size="lg">Publier une offre</Button>}
              />
            ) : (
              <Button size="lg">S&apos;inscrire pour publier</Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
