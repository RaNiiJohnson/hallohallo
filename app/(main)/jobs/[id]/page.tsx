"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  MapPin,
  Building2,
  Mail,
  Briefcase,
  FileText,
  Award,
  Share2,
  Bookmark,
  ChevronRight,
} from "lucide-react";
import { notFound, useParams } from "next/navigation";
import Link from "next/link";
import { getRelativeTime, formatDateLong } from "@/lib/date";
import { Separator } from "@/components/ui/separator";
import { ButtonGroup } from "@/components/ui/button-group";
import DeleteJobDialog from "../_component/dialogs/deleteJobDialog";
import { SalaryDisplay } from "../_component/salary";
import { useQuery } from "convex-helpers/react/cache";
import { api } from "@convex/_generated/api";
import { Id } from "@convex/_generated/dataModel";
import { EditJobDialog } from "./_component/editJobDialog";
import { JobDetailsSkeleton } from "../_component/skeleton";

export default function JobDetailsPage() {
  const user = useQuery(api.auth.getCurrentUser);
  const params = useParams<{ id: Id<"JobOffer"> }>();
  console.log(params);
  const jobOffer = useQuery(api.jobs.getJobWithContact, {
    id: params.id,
  });

  if (jobOffer === undefined) {
    return <JobDetailsSkeleton />;
  }

  if (!jobOffer) {
    return notFound();
  }

  const isAuthor = user?._id === jobOffer.authorId;

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Hero Section without image */}
      <div className="relative w-full bg-background">
        <div className="max-w-6xl mx-auto px-4 pt-8 sm:pt-12">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6 sm:mb-8">
            <Link
              href="/jobs"
              className="hover:text-foreground transition-colors"
            >
              Opportunités
            </Link>
            <span>
              <ChevronRight className="w-4 h-4" />
            </span>
            <span className="text-foreground font-medium line-clamp-1">
              {jobOffer.title}
            </span>
          </div>

          {/* Job Header */}
          <div className="text-center mb-8">
            {/* Company Icon/Logo placeholder */}
            <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-primary/10 rounded-2xl mb-6">
              <Building2 className="w-8 h-8 sm:w-10 sm:h-10 text-primary" />
            </div>

            {/* Job Title */}
            <div className="mb-4 flex justify-center">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight">
                {jobOffer.title}
              </h1>
            </div>

            {/* Posted by */}
            <p className="text-sm sm:text-base text-muted-foreground mb-6">
              <span className="font-semibold text-foreground">
                {jobOffer.contact?.name || "Anonyme"}
              </span>{" "}
              a publié cette offre {getRelativeTime(jobOffer.createdAt)}
            </p>

            {/* Divider */}
            <Separator className="w-20 h-1 bg-primary mx-auto mb-8" />

            <div className="flex lg:flex-row flex-col justify-between items-center gap-4">
              {/* Job Meta Information */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-x-6 gap-y-3 text-sm sm:text-base">
                {/* Company */}
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground/60" />
                  <span className="font-medium">{jobOffer.company}</span>
                </div>

                {/* Role */}
                <div className="flex items-center gap-2">
                  <Briefcase className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground/60" />
                  <span className="font-medium">{jobOffer.contractType}</span>
                </div>

                {/* Location */}
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-primary/60" />
                  <span className="font-medium">{jobOffer.city}</span>
                </div>
              </div>

              {/* Company Links / Edit Button */}
              <div className="flex flex-wrap items-center justify-center gap-3">
                {isAuthor ? (
                  <>
                    <DeleteJobDialog jobId={jobOffer._id} />
                    <EditJobDialog jobOffer={jobOffer} />
                  </>
                ) : (
                  <ButtonGroup>
                    <Button
                      variant="default"
                      size="sm"
                      className="gap-2"
                      asChild
                    >
                      <a href={`mailto:${jobOffer.contact}`}>
                        <Mail className="w-4 h-4" />
                        Postuler
                      </a>
                    </Button>

                    <Button variant="outline" size="sm" className="gap-2">
                      <Share2 className="w-4 h-4" />
                      Partager
                    </Button>

                    <Button variant="outline" size="sm">
                      <Bookmark className="w-4 h-4" />
                    </Button>
                  </ButtonGroup>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Job Overview */}
            <div className="bg-card border rounded-lg shadow-sm">
              <div className="p-6 border-b">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Aperçu de l&apos;offre
                </h2>
              </div>
              <div className="p-6">
                <div className="grid sm:grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">
                      Date de publication
                    </p>
                    <p className="font-semibold">
                      {formatDateLong(jobOffer.createdAt)}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">
                      Type d&apos;emploi
                    </p>
                    <Badge variant="secondary" className="font-semibold">
                      {jobOffer.type}
                    </Badge>
                  </div>

                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Salaire</p>
                    <SalaryDisplay showIcon={false} salary={jobOffer.salary} />
                  </div>

                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Durée</p>
                    <p className="font-semibold">{jobOffer.duration}</p>
                  </div>

                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">
                      Localisation
                    </p>
                    <p className="font-semibold">{jobOffer.city}</p>
                  </div>

                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">
                      Type de contrat
                    </p>
                    <Badge variant="outline" className="font-semibold">
                      {jobOffer.contractType}
                    </Badge>
                  </div>

                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">
                      Date de début
                    </p>
                    <p className="font-semibold">{jobOffer.startDate}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Job Description */}
            <div className="bg-card border rounded-lg shadow-sm">
              <div className="p-6 border-b">
                <h2 className="text-xl font-semibold">Description du poste</h2>
              </div>
              <div className="p-6">
                <div className="prose prose-sm sm:prose-base max-w-none dark:prose-invert">
                  <p className="whitespace-pre-wrap text-foreground/90 leading-relaxed">
                    {jobOffer.description}
                  </p>
                </div>
              </div>
            </div>

            {/* Certificates */}
            {jobOffer.certificates && jobOffer.certificates.length > 0 && (
              <div className="bg-card border rounded-lg shadow-sm">
                <div className="p-6 border-b">
                  <h2 className="text-xl font-semibold flex items-center gap-2">
                    <Award className="w-5 h-5" />
                    Certificats requis
                  </h2>
                </div>
                <div className="p-6">
                  <div className="flex flex-wrap gap-2">
                    {jobOffer.certificates.map((cert, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="text-sm"
                      >
                        {cert}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Contact Information */}
            <div className="bg-primary/5 border border-primary/20 rounded-lg shadow-sm">
              <div className="p-6 border-b border-primary/20">
                <h2 className="text-xl font-semibold">Comment postuler</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Intéressé par ce poste ? Envoyez votre candidature au contact
                  ci-dessous.
                </p>
              </div>
              <div className="p-6">
                <div className="flex items-center gap-4 p-4 bg-background rounded-lg border">
                  <div className="p-3 bg-primary/10 rounded-lg">
                    <Mail className="w-6 h-6 text-primary" />
                  </div>
                  <div className="space-y-1 flex-1 min-w-0">
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">
                      Contact
                    </p>
                    <a
                      href={`mailto:${jobOffer.contact}`}
                      className="font-semibold text-primary hover:underline break-all"
                    >
                      {jobOffer.contact?.email}
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Company Info */}
            <div className="bg-card border rounded-lg shadow-sm">
              <div className="p-6 border-b">
                <h2 className="text-xl font-semibold">
                  Informations sur l&apos;entreprise
                </h2>
              </div>
              <div className="p-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-primary/10 rounded-lg">
                    <Building2 className="w-8 h-8 text-primary" />
                  </div>
                  <div className="space-y-1 flex-1 min-w-0">
                    <p className="font-semibold text-lg">
                      {jobOffer.company || "Nom de l&apos;entreprise"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {jobOffer.city}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Publisher Info */}
            <div className="bg-card border rounded-lg shadow-sm">
              <div className="p-6 border-b">
                <h2 className="text-xl font-semibold">Publié par</h2>
              </div>
              <div className="p-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                    <span className="text-lg font-semibold text-primary">
                      {jobOffer.contact?.name?.[0]?.toUpperCase() || "A"}
                    </span>
                  </div>
                  <div className="space-y-1">
                    <p className="font-semibold">
                      {jobOffer.contact?.name || "Anonyme"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {getRelativeTime(jobOffer.createdAt)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Summary */}
            <div className="bg-muted/30 border rounded-lg shadow-sm">
              <div className="p-6 border-b">
                <h2 className="text-xl font-semibold">Résumé rapide</h2>
              </div>
              <div className="p-6 space-y-3">
                <div className="flex items-center justify-between py-3 border-b">
                  <span className="text-sm text-muted-foreground">
                    Type d&apos;emploi
                  </span>
                  <Badge variant="secondary">{jobOffer.type}</Badge>
                </div>

                <div className="flex items-center justify-between py-3 border-b">
                  <span className="text-sm text-muted-foreground">Contrat</span>
                  <span className="font-semibold text-sm">
                    {jobOffer.contractType}
                  </span>
                </div>

                <div className="flex items-center justify-between py-3 border-b">
                  <span className="text-sm text-muted-foreground">Durée</span>
                  <span className="font-semibold text-sm">
                    {jobOffer.duration}
                  </span>
                </div>

                <div className="flex items-center justify-between py-3 border-b">
                  <span className="text-sm text-muted-foreground">Salaire</span>
                  <SalaryDisplay showIcon={false} salary={jobOffer.salary} />
                </div>

                <div className="flex items-center justify-between py-3">
                  <span className="text-sm text-muted-foreground">Publié</span>
                  <span className="font-semibold text-sm">
                    {getRelativeTime(jobOffer.createdAt)}
                  </span>
                </div>
              </div>
            </div>

            {/* Apply CTA */}
            <div className="bg-primary text-primary-foreground border rounded-lg shadow-sm">
              <div className="p-6">
                <h3 className="font-bold text-lg mb-2">Prêt à postuler ?</h3>
                <p className="text-sm text-primary-foreground/90 mb-4">
                  Ne manquez pas cette opportunité. Postulez maintenant !
                </p>
                <Button
                  variant="secondary"
                  className="w-full"
                  size="lg"
                  asChild
                >
                  <a href={`mailto:${jobOffer.contact}`}>Postuler maintenant</a>
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Back to jobs link */}
        <div className="mt-12 text-center">
          <Button variant="outline" asChild>
            <Link href="/jobs" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Retour aux offres
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
