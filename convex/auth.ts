import { createClient, type GenericCtx } from "@convex-dev/better-auth";
import { convex } from "@convex-dev/better-auth/plugins";
import { components } from "./_generated/api";
import { DataModel } from "./_generated/dataModel";
import { query } from "./_generated/server";
import { betterAuth, type BetterAuthOptions } from "better-auth/minimal";
import authConfig from "./auth.config";
import authSchema from "./betterAuth/schema";

const siteUrl = process.env.SITE_URL!;

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
    // Configure simple, non-verified email/password to get started
    emailAndPassword: {
      enabled: true,
      requireEmailVerification: false,
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
  } satisfies BetterAuthOptions;
};

export const createAuth = (ctx: GenericCtx<DataModel>) => {
  return betterAuth(createAuthOptions(ctx));
};

// Example function for getting the current user
// Feel free to edit, omit, etc.
export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    const user = await authComponent.safeGetAuthUser(ctx);
    // user === null si non authentifié, pas d’exception
    return user;
  },
});
