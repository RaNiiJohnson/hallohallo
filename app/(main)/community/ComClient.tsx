"use client";

import { api } from "@convex/_generated/api";
import { Preloaded, usePreloadedQuery } from "convex/react";
import Image from "next/image";
import { notFound } from "next/navigation";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin } from "lucide-react";
import Link from "next/link";

export default function ComClient({
  preloadedUsers,
}: {
  preloadedUsers: Preloaded<typeof api.users.getAllUsers>;
}) {
  const users = usePreloadedQuery(preloadedUsers);

  if (!users) {
    return notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">
          Suggestions de connexions
        </h1>
        <p className="text-muted-foreground mt-2">
          Développez votre réseau professionnel
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
        {users.map((user) => (
          <Card
            key={user._id}
            className="overflow-hidden hover:shadow-lg transition-shadow duration-300 flex flex-col p-0"
          >
            {/* Cover Image */}
            <div className="relative h-24 bg-linear-to-br from-primary/20 to-primary/5">
              <Image
                src={user.coverImageUrl || "/default-cover.jpg"}
                alt="Couverture"
                fill
                className="object-cover dark:hidden"
              />{" "}
              <Image
                src={user.coverImageUrl || "/default-cover-s.png"}
                alt="Couverture"
                fill
                className="object-cover hidden dark:block"
              />
            </div>

            <CardContent className="p-0 flex flex-col flex-1">
              {/* Avatar */}
              <div className="relative px-4 sm:px-6">
                <div className="relative -mt-12 h-24 w-24 rounded-full border-4 border-background overflow-hidden bg-muted shadow-xl">
                  <Image
                    src={user.imageUrl || "/random-user.png"}
                    alt={user.name}
                    fill
                    className="object-cover"
                  />
                </div>
              </div>

              {/* User Info - flex-1 pour pousser le bouton en bas */}
              <div className="px-4 sm:px-6 pb-6 pt-3 space-y-3 flex-1 flex flex-col">
                <div className="space-y-1 flex-1">
                  <h3 className="font-semibold text-lg line-clamp-1">
                    {user.name}
                  </h3>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {user.headline || "Aucune description"}
                  </p>
                </div>

                {user.country && (
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <MapPin className="h-3.5 w-3.5" />
                    <span className="truncate">{user.country}</span>
                  </div>
                )}

                {/* Bouton fixé en bas avec mt-auto */}
                <Link
                  href={`/hl/${user.slug}`}
                  // button variant outline using buttonVariant on classname

                  className={buttonVariants({
                    variant: "outline",
                    size: "sm",
                    className: "w-full font-medium mt-auto",
                  })}
                >
                  voir profil
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
