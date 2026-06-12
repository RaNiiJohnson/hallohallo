import { createClient, type GenericCtx } from "@convex-dev/better-auth";
import { convex } from "@convex-dev/better-auth/plugins";
import { requireActionCtx } from "@convex-dev/better-auth/utils";
import { betterAuth, type BetterAuthOptions } from "better-auth/minimal";
import { generatedSlug } from "../../src/lib/utils";
import { components } from "../_generated/api";
import { DataModel } from "../_generated/dataModel";
import { query } from "../_generated/server";
import authConfig from "../auth.config";
import authSchema from "../betterAuth/schema";
import { resend } from "../sendEmails";

const siteUrl = process.env.SITE_URL!;

// ─── Email verification i18n ────────────────────────────────────────────────

type EmailLocale = "fr" | "en" | "de";

interface VerificationEmailStrings {
  subject: string;
  greeting: (name: string) => string;
  intro: string;
  buttonLabel: string;
  expiry: string;
  ignore: string;
}

const emailVerificationTranslations: Record<
  EmailLocale,
  VerificationEmailStrings
> = {
  fr: {
    subject: "V\u00e9rifiez votre adresse e-mail \u2013 HalloHallo",
    greeting: (name) => `Bonjour ${name}`,
    intro:
      "Merci de vous \u00eatre inscrit sur HalloHallo. Cliquez sur le bouton ci-dessous pour v\u00e9rifier votre adresse e-mail et activer votre compte.",
    buttonLabel: "V\u00e9rifier mon e-mail",
    expiry: "Ce lien est valable 24\u00a0heures.",
    ignore:
      "Si vous n'\u00eates pas \u00e0 l'origine de cette demande, ignorez cet e-mail.",
  },
  en: {
    subject: "Verify your email address \u2013 HalloHallo",
    greeting: (name) => `Hi ${name}`,
    intro:
      "Thanks for signing up on HalloHallo. Click the button below to verify your email address and activate your account.",
    buttonLabel: "Verify my email",
    expiry: "This link is valid for 24\u00a0hours.",
    ignore:
      "If you didn\u2019t create an account, you can safely ignore this email.",
  },
  de: {
    subject: "Bitte best\u00e4tige deine E-Mail-Adresse \u2013 HalloHallo",
    greeting: (name) => `Hallo ${name}`,
    intro:
      "Danke, dass du dich bei HalloHallo angemeldet hast. Klicke auf den Button unten, um deine E-Mail-Adresse zu best\u00e4tigen und dein Konto zu aktivieren.",
    buttonLabel: "E-Mail best\u00e4tigen",
    expiry: "Dieser Link ist 24\u00a0Stunden g\u00fcltig.",
    ignore:
      "Falls du kein Konto erstellt hast, kannst du diese E-Mail ignorieren.",
  },
};

function buildVerificationEmailHtml({
  displayName,
  url,
  t,
}: {
  displayName: string;
  url: string;
  t: VerificationEmailStrings;
}): string {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:40px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;max-width:600px;width:100%;">

        <!-- Header -->
        <tr>
          <td style="background:#000000;padding:28px 40px;text-align:center;">
            <span style="color:#ffffff;font-size:22px;font-weight:700;letter-spacing:-0.5px;">HalloHallo</span>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:40px 40px 32px;">
            <h1 style="margin:0 0 12px;font-size:22px;font-weight:700;color:#111;">
              ${t.greeting(displayName)}
            </h1>
            <p style="margin:0 0 32px;font-size:15px;line-height:1.6;color:#555;">
              ${t.intro}
            </p>

            <!-- CTA button -->
            <table cellpadding="0" cellspacing="0" style="margin:0 0 32px;">
              <tr>
                <td style="border-radius:8px;background:#2563eb;">
                  <a href="${url}"
                     style="display:inline-block;padding:16px 36px;font-size:16px;font-weight:700;
                            color:#ffffff;text-decoration:none;letter-spacing:0.2px;
                            border-radius:8px;background:#2563eb;">
                    \u2709\ufe0f&nbsp;&nbsp;${t.buttonLabel}
                  </a>
                </td>
              </tr>
            </table>

            <p style="margin:0 0 6px;font-size:13px;color:#888;">${t.expiry}</p>
            <p style="margin:0;font-size:13px;color:#aaa;">${t.ignore}</p>
          </td>
        </tr>

        <!-- Divider + footer -->
        <tr>
          <td style="border-top:1px solid #eee;padding:20px 40px;text-align:center;">
            <p style="margin:0;font-size:12px;color:#bbb;">HalloHallo &middot; hallomada.de</p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

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
        trustedProviders: ["google"],
      },
    },

    emailAndPassword: {
      enabled: true,
      requireEmailVerification: true,
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
