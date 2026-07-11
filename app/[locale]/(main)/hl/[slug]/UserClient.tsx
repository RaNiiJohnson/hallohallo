"use client";

import { api } from "@convex/_generated/api";
import { useQuery } from "convex-helpers/react/cache";
import { Preloaded, usePreloadedQuery } from "convex/react";
import { Briefcase, Building2, MapPin, Pencil, Sparkles } from "lucide-react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { notFound } from "next/navigation";
import { useState } from "react";
import { ImageUploadModal } from "./component/ImageUploadModal";
import { ProfileEditForm } from "./component/ProfilEditForm";
import { ProfileView } from "./component/ProfilView";

export default function UserClient({
  preloadedUser,
}: {
  preloadedUser: Preloaded<typeof api.auth.users.getUserBySlug>;
}) {
  const user = usePreloadedQuery(preloadedUser);
  const currentUser = useQuery(api.auth.auth.getCurrentUser);
  const t = useTranslations("profile");

  const [profileImageModalOpen, setProfileImageModalOpen] = useState(false);
  const [coverImageModalOpen, setCoverImageModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  if (!user) {
    return notFound();
  }

  const isOwnProfile = currentUser?.email === user.email;

  return (
    <div className="lg:max-w-4xl mx-auto my-4 lg:space-y-4 sm:space-y-2 space-y-1.5 sm:px-0">
      {/* === HEADER SECTION (pdp / pdc - inchangé) === */}
      <section className="bg-card lg:rounded-lg overflow-hidden">
        <div className="relative">
          <Image
            src={user.coverImage || "/default-cover.jpg"}
            alt={t("coverAlt")}
            height={200}
            width={800}
            priority
            className="w-full h-32 sm:h-40 lg:h-48 object-cover"
          />
          {isOwnProfile && (
            <button
              type="button"
              onClick={() => setCoverImageModalOpen(true)}
              className="absolute top-3 right-3 bg-card/80 backdrop-blur-sm p-2 rounded-full hover:bg-card transition-colors"
              title={t("editCover")}
            >
              <Pencil className="size-4" />
            </button>
          )}
        </div>

        <div className="relative px-6 pb-6">
          <div className="relative -mt-16 sm:-mt-20 mb-4">
            <div className="relative inline-block">
              <Image
                src={user.image || "/random-user.png"}
                alt={user.name || t("profileAlt")}
                height={140}
                width={140}
                className="size-28 sm:size-36 object-cover rounded-full border-4 border-card"
              />
              {isOwnProfile && (
                <button
                  type="button"
                  onClick={() => setProfileImageModalOpen(true)}
                  className="absolute bottom-1 right-1 bg-primary p-2 rounded-full hover:bg-primary/90 transition-colors"
                  title={t("editProfile")}
                >
                  <Pencil className="size-3.5 text-primary-foreground" />
                </button>
              )}
            </div>
          </div>

          {/* Name / headline + toggle vue/édition */}
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div className="flex-1">
              <h1 className="text-2xl sm:text-3xl font-bold">{user.name}</h1>
              {!isEditing && user.headline && (
                <p className="text-muted-foreground mt-1 text-base sm:text-lg">
                  {user.headline}
                </p>
              )}
              {isEditing && (
                <p className="text-sm text-muted-foreground mt-1">
                  @{user.slug || "—"}
                </p>
              )}
            </div>

            {isOwnProfile && (
              <button
                type="button"
                onClick={() => setIsEditing((v) => !v)}
                className="px-4 py-2 border rounded-full text-sm font-medium hover:bg-accent transition-colors whitespace-nowrap"
              >
                {isEditing ? t("viewProfile") : t("editProfileButton")}
              </button>
            )}
          </div>

          {/* Localisation / industrie / badge / société - masqués en mode édition (déjà éditables dans le form) */}
          {!isEditing && (
            <>
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
              </div>

              {user.isServiceProvider && (
                <span className="inline-flex items-center gap-1.5 mt-3 px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">
                  <Sparkles className="size-4" />
                  {t("serviceProvider")}
                </span>
              )}

              {user.company && (
                <div className="mt-4 flex items-center gap-2 text-sm">
                  <Briefcase className="size-4 text-muted-foreground" />
                  <span className="font-medium">{user.company}</span>
                  {user.field && (
                    <span className="text-muted-foreground">
                      • {user.field}
                    </span>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* === CONTENU : vue en lecture seule OU formulaire d'édition === */}
      {isOwnProfile && isEditing ? (
        <ProfileEditForm user={user} onSaved={() => setIsEditing(false)} />
      ) : (
        <ProfileView user={user} />
      )}

      {/* Image Upload Modals - inchangé */}
      <ImageUploadModal
        userId={user._id}
        imageType="profile"
        open={profileImageModalOpen}
        onOpenChange={setProfileImageModalOpen}
        currentImageUrl={user.image}
      />
      <ImageUploadModal
        userId={user._id}
        imageType="cover"
        open={coverImageModalOpen}
        onOpenChange={setCoverImageModalOpen}
        currentImageUrl={user.coverImage}
      />
    </div>
  );
}
