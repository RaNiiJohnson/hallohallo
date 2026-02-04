"use client";

import { useState } from "react";
import { api } from "@convex/_generated/api";
import { Preloaded, usePreloadedQuery } from "convex/react";
import { useQuery } from "convex-helpers/react/cache";
import Image from "next/image";
import {
  MapPin,
  Building2,
  Briefcase,
  Calendar,
  Globe,
  Mail,
  Sparkles,
  GraduationCap,
  Pencil,
} from "lucide-react";
import { ImageUploadModal } from "./component/ImageUploadModal";
import { notFound } from "next/navigation";

export default function UserClient({
  preloadedUser,
}: {
  preloadedUser: Preloaded<typeof api.users.getUserBySlug>;
}) {
  const user = usePreloadedQuery(preloadedUser);
  const currentUser = useQuery(api.auth.getCurrentUser);

  // Modal states for image uploads - must be before early return
  const [profileImageModalOpen, setProfileImageModalOpen] = useState(false);
  const [coverImageModalOpen, setCoverImageModalOpen] = useState(false);

  if (!user) {
    return notFound();
  }

  const isOwnProfile = currentUser?.email === user.email;

  // Format date helper
  const formatDate = (timestamp: number | null | undefined) => {
    if (!timestamp) return null;
    return new Date(timestamp).toLocaleDateString("fr-FR", {
      month: "long",
      year: "numeric",
    });
  };

  return (
    <div className="lg:max-w-4xl mx-auto my-4 lg:space-y-4 sm:space-y-2 space-y-1.5 lg:px-0">
      {/* === HEADER SECTION === */}
      <section className="bg-card lg:rounded-lg overflow-hidden">
        {/* Cover Image */}
        <div className="relative">
          <Image
            src={user.coverImageUrl || "/default-cover.jpg"}
            alt="Photo de couverture"
            height={200}
            width={800}
            priority
            className="w-full h-32 sm:h-40 lg:h-48 object-cover"
            unoptimized={!!user.coverImageUrl}
          />
          {isOwnProfile && (
            <button
              type="button"
              onClick={() => setCoverImageModalOpen(true)}
              className="absolute top-3 right-3 bg-card/80 backdrop-blur-sm p-2 rounded-full hover:bg-card transition-colors"
              title="Modifier la photo de couverture"
            >
              <Pencil className="size-4" />
            </button>
          )}
        </div>
        {/* Profile Info */}
        <div className="relative px-6 pb-6">
          {/* Avatar */}
          <div className="relative -mt-16 sm:-mt-20 mb-4">
            <div className="relative inline-block">
              <Image
                src={user.imageUrl || "/random-user.png"}
                alt={user.name || "Photo de profil"}
                height={140}
                width={140}
                className="size-28 sm:size-36 object-cover rounded-full border-4 border-card"
                unoptimized={!!user.imageUrl}
              />
              {isOwnProfile && (
                <button
                  type="button"
                  onClick={() => setProfileImageModalOpen(true)}
                  className="absolute bottom-1 right-1 bg-primary p-2 rounded-full hover:bg-primary/90 transition-colors"
                  title="Modifier la photo de profil"
                >
                  <Pencil className="size-3.5 text-primary-foreground" />
                </button>
              )}
            </div>
          </div>

          {/* Name & Headline */}
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div className="flex-1">
              <h1 className="text-2xl sm:text-3xl font-bold">{user.name}</h1>
              {user.headline && (
                <p className="text-muted-foreground mt-1 text-base sm:text-lg">
                  {user.headline}
                </p>
              )}

              {/* Location & Industry */}
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-3 text-sm text-muted-foreground">
                {(user.city || user.country) && (
                  <span className="flex items-center gap-1.5">
                    <MapPin className="size-4" />
                    {[user.city, user.country].filter(Boolean).join(", ")}
                  </span>
                )}
                {user.industry && (
                  <span className="flex items-center gap-1.5">
                    <Building2 className="size-4" />
                    {user.industry}
                  </span>
                )}
                {/* {user.lastActiveAt && getRelativeTime(user.lastActiveAt) && (
                  <span className="flex items-center gap-1.5 text-primary">
                    <Clock className="size-4" />
                    {getRelativeTime(user.lastActiveAt)}
                  </span>
                )} */}
              </div>

              {/* Service Provider Badge */}
              {user.isServiceProvider && (
                <span className="inline-flex items-center gap-1.5 mt-3 px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">
                  <Sparkles className="size-4" />
                  Prestataire de services
                </span>
              )}
            </div>

            {/* Action Buttons - Only for own profile */}
            {isOwnProfile && (
              <div className="flex gap-2">
                <button className="px-4 py-2 bg-primary text-primary-foreground rounded-full text-sm font-medium hover:bg-primary/90 transition-colors">
                  Modifier le profil
                </button>
              </div>
            )}
          </div>

          {/* Company info */}
          {user.company && (
            <div className="mt-4 flex items-center gap-2 text-sm">
              <Briefcase className="size-4 text-muted-foreground" />
              <span className="font-medium">{user.company}</span>
              {user.field && (
                <span className="text-muted-foreground">• {user.field}</span>
              )}
            </div>
          )}
        </div>
      </section>

      {/* === À PROPOS SECTION === */}
      {user.bio && (
        <section className="bg-card lg:rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">À propos</h2>
            {isOwnProfile && (
              <button
                className="p-2 hover:bg-accent rounded-full transition-colors"
                title="Modifier"
              >
                <Pencil className="size-4" />
              </button>
            )}
          </div>
          <p className="text-muted-foreground whitespace-pre-line leading-relaxed">
            {user.bio}
          </p>
        </section>
      )}

      {/* === EXPÉRIENCE SECTION === */}
      {(user.experienceYears || user.roles?.length || user.arrivalDate) && (
        <section className="bg-card lg:rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Expérience</h2>
            {isOwnProfile && (
              <button
                className="p-2 hover:bg-accent rounded-full transition-colors"
                title="Modifier"
              >
                <Pencil className="size-4" />
              </button>
            )}
          </div>

          <div className="space-y-4">
            {/* Experience Years */}
            {user.experienceYears && (
              <div className="flex items-start gap-4">
                <div className="p-2 bg-secondary lg:rounded-lg">
                  <Briefcase className="size-5 text-muted-foreground" />
                </div>
                <div>
                  <h3 className="font-medium">
                    {user.experienceYears} ans d&apos;expérience
                  </h3>
                  {user.field && (
                    <p className="text-sm text-muted-foreground">
                      {user.field}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Roles */}
            {user.roles && user.roles.length > 0 && (
              <div className="flex items-start gap-4">
                <div className="p-2 bg-secondary lg:rounded-lg">
                  <GraduationCap className="size-5 text-muted-foreground" />
                </div>
                <div>
                  <h3 className="font-medium">Rôles</h3>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {user.roles?.map((role: string, index: number) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-secondary text-secondary-foreground rounded-full text-sm"
                      >
                        {role}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Arrival Date */}
            {user.arrivalDate && (
              <div className="flex items-start gap-4">
                <div className="p-2 bg-secondary lg:rounded-lg">
                  <Calendar className="size-5 text-muted-foreground" />
                </div>
                <div>
                  <h3 className="font-medium">
                    Depuis {formatDate(user.arrivalDate)}
                  </h3>
                  {user.company && (
                    <p className="text-sm text-muted-foreground">
                      chez {user.company}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* === COMPÉTENCES SECTION === */}
      {user.skills && user.skills.length > 0 && (
        <section className="bg-card lg:rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Compétences</h2>
            {isOwnProfile && (
              <button
                className="p-2 hover:bg-accent rounded-full transition-colors"
                title="Modifier"
              >
                <Pencil className="size-4" />
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {user.skills?.map((skill: string, index: number) => (
              <span
                key={index}
                className="px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium hover:bg-primary/20 transition-colors"
              >
                {skill}
              </span>
            ))}
          </div>
        </section>
      )}

      {/* === PARCOURS SECTION === */}
      {user.journey && user.journey.length > 0 && (
        <section className="bg-card lg:rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Parcours</h2>
            {isOwnProfile && (
              <button
                className="p-2 hover:bg-accent rounded-full transition-colors"
                title="Modifier"
              >
                <Pencil className="size-4" />
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-3">
            {user.journey?.map((step: string, index: number) => (
              <div key={index} className="flex items-center gap-2">
                <span className="px-4 py-2 bg-secondary text-secondary-foreground lg:rounded-lg text-sm">
                  {step}
                </span>
                {index < user.journey!.length - 1 && (
                  <span className="text-muted-foreground">→</span>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* === CONTACT INFO SECTION (Own Profile Only) === */}
      {isOwnProfile && (
        <section className="bg-card lg:rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Informations de contact</h2>
            <button
              className="p-2 hover:bg-accent rounded-full transition-colors"
              title="Modifier"
            >
              <Pencil className="size-4" />
            </button>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Mail className="size-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium">{user.email}</p>
                <p className="text-xs text-muted-foreground">
                  {user.showEmail ? "Visible sur le profil" : "Masqué"}
                </p>
              </div>
            </div>

            {/* Profile Visibility Status */}
            <div className="flex items-center gap-3 mt-4 pt-4 border-t">
              <Globe className="size-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">
                  Visibilité du profil
                </p>
                <p className="font-medium">
                  {user.isPublic ? "Profil public" : "Profil privé"}
                </p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* === STATUS SECTION (if looking for job, etc.) === */}
      {user.status && user.status !== "active" && (
        <section className="bg-card lg:rounded-lg p-6">
          <div className="flex items-center gap-3">
            <div
              className={`w-3 h-3 rounded-full ${
                user.status === "looking_for_job"
                  ? "bg-green-500"
                  : user.status === "on_sabbatical"
                    ? "bg-yellow-500"
                    : "bg-gray-500"
              }`}
            />
            <span className="font-medium">
              {user.status === "looking_for_job"
                ? "Ouvert aux opportunités"
                : user.status === "on_sabbatical"
                  ? "En sabbatique"
                  : user.status === "inactive"
                    ? "Profil inactif"
                    : user.status}
            </span>
          </div>
        </section>
      )}

      {/* === EMPTY STATE FOR OWN PROFILE === */}
      {isOwnProfile &&
        !user.bio &&
        !user.skills?.length &&
        !user.experienceYears && (
          <section className="bg-card lg:rounded-lg p-8 text-center">
            <div className="max-w-md mx-auto">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Pencil className="size-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">
                Complétez votre profil
              </h3>
              <p className="text-muted-foreground mb-4">
                Ajoutez plus d&apos;informations pour que les autres puissent
                mieux vous connaître.
              </p>
              <button className="px-6 py-2 bg-primary text-primary-foreground rounded-full text-sm font-medium hover:bg-primary/90 transition-colors">
                Modifier le profil
              </button>
            </div>
          </section>
        )}

      {/* Image Upload Modals */}
      <ImageUploadModal
        userId={user._id}
        imageType="profile"
        open={profileImageModalOpen}
        onOpenChange={setProfileImageModalOpen}
        currentImageUrl={user.imageUrl}
      />
      <ImageUploadModal
        userId={user._id}
        imageType="cover"
        open={coverImageModalOpen}
        onOpenChange={setCoverImageModalOpen}
        currentImageUrl={user.coverImageUrl}
      />
    </div>
  );
}
