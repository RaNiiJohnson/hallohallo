import { Resend } from "@convex-dev/resend";
import { components } from "./_generated/api";
import { type ActionCtx } from "./_generated/server";
import {
  buildResetPasswordEmailHtml,
  buildVerificationEmailHtml,
  emailVerificationTranslations,
  resetPasswordTranslations,
} from "./utils/auth.utils";

export const resend = new Resend(components.resend, {
  testMode: false,
});

export const sendEmailVerification = async (
  ctx: ActionCtx,
  {    to,
    url,
    name,
  }: {
    to: string;
    url: string;
    name?: string | null;
  },
) => {
  const callbackURL = new URL(url).searchParams.get("callbackURL") ?? "/";
  const localeMatch = callbackURL.match(/^\/(fr|en|de)/);
  const locale = (localeMatch?.[1] as "fr" | "en" | "de") ?? "en";

  const t = emailVerificationTranslations[locale];
  const displayName = name ?? to;
  await resend.sendEmail(ctx, {
    from: "HalloHallo <noreply@hallomada.de>",
    to,
    subject: t.subject,
    html: buildVerificationEmailHtml({ displayName, url, t }),
  });
};

export const sendResetPasswordEmail = async (
  ctx: ActionCtx,
  {
    to,
    url,
    name,
  }: {
    to: string;
    url: string;
    name?: string | null;
  },
) => {
  const callbackURL = new URL(url).searchParams.get("callbackURL") ?? "/";
  const localeMatch = callbackURL.match(/^\/(fr|en|de)/);
  const locale = (localeMatch?.[1] as "fr" | "en" | "de") ?? "en";

  const t = resetPasswordTranslations[locale];
  const displayName = name ?? to;
  await resend.sendEmail(ctx, {
    from: "HalloHallo <noreply@hallomada.de>",
    to,
    subject: t.subject,
    html: buildResetPasswordEmailHtml({ displayName, url, t }),
  });
};
