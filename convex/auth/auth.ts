import { createClient, type GenericCtx } from "@convex-dev/better-auth";
import { convex } from "@convex-dev/better-auth/plugins";
import { requireActionCtx } from "@convex-dev/better-auth/utils";
import { betterAuth, type BetterAuthOptions } from "better-auth/minimal";
import { GenericActionCtx, GenericDataModel } from "convex/server";
import { generatedSlug } from "../../src/lib/utils";
import { components } from "../_generated/api";
import { DataModel } from "../_generated/dataModel";
import { query } from "../_generated/server";
import authConfig from "../auth.config";
import authSchema from "../betterAuth/schema";
import { resend } from "../sendEmails";
import {
  buildResetPasswordEmailHtml,
  buildVerificationEmailHtml,
  EmailLocale,
  emailVerificationTranslations,
  resetPasswordTranslations,
} from "../utils/auth.utils";

const siteUrl = process.env.SITE_URL!;

type ActionCtx = Pick<
  GenericActionCtx<GenericDataModel>,
  "runQuery" | "runMutation" | "runAction"
>;

// The component client has methods needed for integrating Convex with Better Auth,
// as well as helper methods for general use.
export const authComponent = createClient<DataModel, typeof authSchema>(
  components.betterAuth,
  {
    local: {
      schema: authSchema,
    },
  },
);

export const createAuthOptions = (ctx: GenericCtx<DataModel>) => {
  return {
    baseURL: siteUrl,
    database: authComponent.adapter(ctx),
    socialProviders: {
      google: {
        clientId: process.env.GOOGLE_CLIENT_ID as string,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      },
    },
    account: {
      accountLinking: {
        enabled: true,
      },
    },

    emailAndPassword: {
      enabled: true,
      requireEmailVerification: true,
      sendResetPassword: async ({
        user,
        url,
      }: {
        user: { email: string; name?: string | null };
        url: string;
      }) => {
        const callbackURL = new URL(url).searchParams.get("callbackURL") ?? "/";
        const localeMatch = callbackURL.match(/^\/(fr|en|de)/);
        const locale = (localeMatch?.[1] as EmailLocale) ?? "en";

        const t = resetPasswordTranslations[locale];
        const displayName = user.name ?? user.email;

        await resend.sendEmail(requireActionCtx(ctx), {
          from: "HalloHallo <noreply@hallomada.de>",
          to: user.email,
          subject: t.subject,
          html: buildResetPasswordEmailHtml({ displayName, url, t }),
        });
      },
      onPasswordReset: async ({ user }) => {
        console.log(`Mot de passe réinitialisé pour ${user.email}`);
      },
    },
    emailVerification: {
      autoSignInAfterVerification: true,
      sendVerificationEmail: async ({
        user,
        url,
      }: {
        user: { email: string; name?: string | null };
        url: string;
      }) => {
        // Extract locale from the callbackURL embedded in the verification URL
        const callbackURL = new URL(url).searchParams.get("callbackURL") ?? "/";
        const localeMatch = callbackURL.match(/^\/(fr|en|de)/);
        const locale = (localeMatch?.[1] as "fr" | "en" | "de") ?? "en";

        const t = emailVerificationTranslations[locale];
        const displayName = user.name ?? user.email;

        await resend.sendEmail(requireActionCtx(ctx), {
          from: "HalloHallo <noreply@hallomada.de>",
          to: user.email,
          subject: t.subject,
          html: buildVerificationEmailHtml({ displayName, url, t }),
        });
      },
    },
    databaseHooks: {
      user: {
        create: {
          before: async (user) => {
            return {
              data: {
                ...user,
                slug: generatedSlug(user.name),
              },
            };
          },
        },
      },
    },
    user: {
      additionalFields: {
        // === INFORMATIONS DE BASE ===
        coverImage: {
          type: "string",
          required: false,
        },
        slug: {
          type: "string",
          required: false,
        },

        // === PROFIL PROFESSIONNEL ===
        headline: {
          type: "string",
          required: false,
          // Titre professionnel affiché sous le nom (ex: "Développeur Full-Stack chez Google | Expert React")
        },
        bio: {
          type: "string",
          required: false,
          // Description longue du profil, résumé professionnel (500-2000 caractères)
        },

        // === LOCALISATION ===
        city: {
          type: "string",
          required: false,
        },
        country: {
          type: "string",
          required: false,
        },

        // === DOMAINE PROFESSIONNEL ===
        industry: {
          type: "string",
          required: false,
          // Secteur d'activité (ex: "Technologies de l'information", "Finance", "Santé")
        },
        roles: {
          type: "string[]",
          required: false,
        },
        company: {
          type: "string",
          required: false,
        },
        field: {
          type: "string",
          required: false,
          // Domaine de spécialisation (ex: "Développement Web", "Data Science")
        },
        skills: {
          type: "string[]",
          required: false,
          // Compétences techniques et soft skills (ex: ["React", "TypeScript", "Leadership"])
        },

        // === EXPÉRIENCE ET PARCOURS ===
        experienceYears: {
          type: "number",
          required: false,
          // Années d'expérience totales dans le domaine (ex: 5)
        },
        arrivalDate: {
          type: "number",
          required: false,
          // Date d'arrivée dans l'entreprise actuelle (timestamp en millisecondes)
        },
        journey: {
          type: "string[]",
          required: false,
          // Parcours rapide ou étapes clés (ex: ["Startup", "Scale-up", "Big Tech"])
        },

        // === PRÉFÉRENCES ET STATUT ===
        status: {
          type: "string",
          required: false,
          // Statut du profil (ex: "active", "inactive", "looking_for_job", "on_sabbatical")
        },
        isServiceProvider: {
          type: "boolean",
          required: false,
        },

        // === VISIBILITÉ ET CONFIDENTIALITÉ ===
        isPublic: {
          type: "boolean",
          required: false,
          // true si le profil est visible publiquement (sans connexion)
        },
        showEmail: {
          type: "boolean",
          required: false,
          // true si l'email est visible sur le profil public
        },
        showPhone: {
          type: "boolean",
          required: false,
          // true si le téléphone est visible sur le profil public
        },

        // === DONNÉES SYSTÈME ===
        lastActiveAt: {
          type: "number",
          required: false,
          // Date de dernière activité (connexion, post, like) - timestamp en millisecondes
        },
      },
    },
    plugins: [
      // The Convex plugin is required for Convex compatibility
      convex({ authConfig }),
    ],
    session: {
      cookieCache: {
        enabled: true,
        maxAge: 5 * 60,
      },
    },
  } satisfies BetterAuthOptions;
};

export const createAuth = (ctx: GenericCtx<DataModel>) => {
  return betterAuth(createAuthOptions(ctx));
};

export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    const user = await authComponent.safeGetAuthUser(ctx);

    if (!user) return null;

    return user;
  },
});
