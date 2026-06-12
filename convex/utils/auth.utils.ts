export type EmailLocale = "fr" | "en" | "de";

export interface VerificationEmailStrings {
  subject: string;
  greeting: (name: string) => string;
  intro: string;
  buttonLabel: string;
  expiry: string;
  ignore: string;
}

export interface ResetPasswordEmailStrings {
  subject: string;
  greeting: (name: string) => string;
  intro: string;
  buttonLabel: string;
  expiry: string;
  ignore: string;
}

export const emailVerificationTranslations: Record<
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

export const resetPasswordTranslations: Record<
  EmailLocale,
  ResetPasswordEmailStrings
> = {
  fr: {
    subject: "Réinitialisation de votre mot de passe – HalloHallo",
    greeting: (name) => `Bonjour ${name}`,
    intro:
      "Vous avez demandé à réinitialiser votre mot de passe sur HalloHallo. Cliquez sur le bouton ci-dessous pour choisir un nouveau mot de passe.",
    buttonLabel: "Réinitialiser mon mot de passe",
    expiry: "Ce lien est valable 1\u00a0heure.",
    ignore:
      "Si vous n'êtes pas à l'origine de cette demande, ignorez cet e-mail. Votre mot de passe ne sera pas modifié.",
  },
  en: {
    subject: "Reset your password – HalloHallo",
    greeting: (name) => `Hi ${name}`,
    intro:
      "You requested a password reset for your HalloHallo account. Click the button below to choose a new password.",
    buttonLabel: "Reset my password",
    expiry: "This link is valid for 1\u00a0hour.",
    ignore:
      "If you didn't request this, you can safely ignore this email. Your password won't change.",
  },
  de: {
    subject: "Passwort zurücksetzen – HalloHallo",
    greeting: (name) => `Hallo ${name}`,
    intro:
      "Du hast eine Passwortzurücksetzung für dein HalloHallo-Konto angefordert. Klicke auf den Button unten, um ein neues Passwort zu wählen.",
    buttonLabel: "Passwort zurücksetzen",
    expiry: "Dieser Link ist 1\u00a0Stunde gültig.",
    ignore:
      "Falls du dies nicht angefordert hast, kannst du diese E-Mail ignorieren. Dein Passwort bleibt unverändert.",
  },
};

export function buildResetPasswordEmailHtml({
  displayName,
  url,
  t,
}: {
  displayName: string;
  url: string;
  t: ResetPasswordEmailStrings;
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
                <td style="border-radius:8px;background:#dc2626;">
                  <a href="${url}"
                     style="display:inline-block;padding:16px 36px;font-size:16px;font-weight:700;
                            color:#ffffff;text-decoration:none;letter-spacing:0.2px;
                            border-radius:8px;background:#dc2626;">
                    &#128274;&nbsp;&nbsp;${t.buttonLabel}
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

export function buildVerificationEmailHtml({
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
