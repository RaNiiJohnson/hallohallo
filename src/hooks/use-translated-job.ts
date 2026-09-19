import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import { useQuery } from "convex-helpers/react/cache";
import { useAction } from "convex/react";
import { useLocale } from "next-intl";
import { useEffect, useRef } from "react";

const SUPPORTED = ["fr", "en", "de"] as const;
type SupportedLang = (typeof SUPPORTED)[number];

function useSupportedLang(): SupportedLang | null {
  const locale = useLocale();
  return (SUPPORTED as readonly string[]).includes(locale)
    ? (locale as SupportedLang)
    : null;
}

/**
 * Logique commune : si le cache est chargé mais absent/périmé,
 * on lance la traduction UNE seule fois par (ressource, langue, version).
 */
function useAutoTranslate<T extends { sourceUpdatedAt: number }>({
  resourceKey,
  sourceUpdatedAt,
  cached,
  run,
}: {
  resourceKey: string | null; // null = rien à traduire (pas chargé / locale non supportée)
  sourceUpdatedAt: number | undefined;
  cached: T | null | undefined; // undefined = query en chargement
  run: (() => Promise<unknown>) | null;
}) {
  const requested = useRef<string | null>(null);
  const runRef = useRef(run);

  useEffect(() => {
    runRef.current = run;
  });

  const isFresh =
    !!cached &&
    sourceUpdatedAt !== undefined &&
    cached.sourceUpdatedAt === sourceUpdatedAt;

  useEffect(() => {
    if (!resourceKey || sourceUpdatedAt === undefined) return;
    if (cached === undefined || isFresh) return;

    const key = `${resourceKey}:${sourceUpdatedAt}`;
    if (requested.current === key) return;
    requested.current = key;

    runRef.current?.().catch(() => {
      requested.current = null; // permettra de réessayer plus tard
    });
  }, [resourceKey, sourceUpdatedAt, cached, isFresh]);

  return {
    translation: isFresh ? (cached as T) : null,
    isTranslating: !!resourceKey && !isFresh,
  };
}

// ---------------- JOB ----------------
type JobInput = {
  _id: Id<"JobOffer">;
  title: string;
  description: string;
  city: string;
  updatedAt: number;
};

export function useTranslatedJob(job: JobInput | null | undefined) {
  const lang = useSupportedLang();
  const translateJob = useAction(api.jobs.translate.translateJob);
  const cached = useQuery(
    api.jobs.translate.getTranslation,
    job && lang ? { jobId: job._id, language: lang } : "skip",
  );

  const { translation, isTranslating } = useAutoTranslate({
    resourceKey: job && lang ? `${job._id}:${lang}` : null,
    sourceUpdatedAt: job?.updatedAt,
    cached,
    run:
      job && lang
        ? () => translateJob({ jobId: job._id, targetLanguage: lang })
        : null,
  });

  return {
    title: translation?.title ?? job?.title,
    description: translation?.description ?? job?.description,
    city: translation?.city ?? job?.city,
    isTranslating,
  };
}

// ---------------- LISTING ----------------
type ListingInput = {
  _id: Id<"RealestateListing">;
  title: string;
  description: string;
  city: string;
  updatedAt: number;
};

export function useTranslatedListing(listing: ListingInput | null | undefined) {
  const lang = useSupportedLang();
  const translateListing = useAction(api.listings.translate.translateListing);
  const cached = useQuery(
    api.listings.translate.getTranslation,
    listing && lang ? { listingId: listing._id, language: lang } : "skip",
  );

  const { translation, isTranslating } = useAutoTranslate({
    resourceKey: listing && lang ? `${listing._id}:${lang}` : null,
    sourceUpdatedAt: listing?.updatedAt,
    cached,
    run:
      listing && lang
        ? () =>
            translateListing({ listingId: listing._id, targetLanguage: lang })
        : null,
  });

  return {
    title: translation?.title ?? listing?.title,
    description: translation?.description ?? listing?.description,
    city: translation?.city ?? listing?.city,
    isTranslating,
  };
}

// ---------------- POST ----------------
type PostInput = {
  _id: Id<"posts">;
  title: string;
  content: string;
  _creationTime: number;
  updatedAt?: number;
};

export function useTranslatedPost(post: PostInput | null | undefined) {
  const lang = useSupportedLang();
  const translatePost = useAction(api.posts.translate.translatePost);
  const cached = useQuery(
    api.posts.translate.getTranslation,
    post && lang ? { postId: post._id, language: lang } : "skip",
  );

  const { translation, isTranslating } = useAutoTranslate({
    resourceKey: post && lang ? `${post._id}:${lang}` : null,
    // même règle que côté serveur : updatedAt ?? _creationTime
    sourceUpdatedAt: post ? (post.updatedAt ?? post._creationTime) : undefined,
    cached,
    run:
      post && lang
        ? () => translatePost({ postId: post._id, targetLanguage: lang })
        : null,
  });

  return {
    title: translation?.title ?? post?.title,
    content: translation?.content ?? post?.content,
    isTranslating,
  };
}
