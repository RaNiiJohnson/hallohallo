import { describe, expect, it } from "vitest";
import {
  buildResetPasswordEmailHtml,
  buildVerificationEmailHtml,
  emailVerificationTranslations,
  resetPasswordTranslations,
} from "./auth.utils";

describe("authentication email templates", () => {
  it("declares the selected locale in password reset emails", () => {
    const html = buildResetPasswordEmailHtml({
      displayName: "Ada",
      locale: "de",
      url: "https://hallomada.de/api/auth/reset-password/token",
      t: resetPasswordTranslations.de,
    });

    expect(html).toContain('<html lang="de">');
    expect(html).toContain("Passwort zurücksetzen");
  });

  it("escapes user-controlled names and link attributes", () => {
    const html = buildVerificationEmailHtml({
      displayName: '<img src=x onerror="alert(1)">',
      locale: "fr",
      url: 'https://hallomada.de/verify?next="profile"&source=email',
      t: emailVerificationTranslations.fr,
    });

    expect(html).toContain('<html lang="fr">');
    expect(html).not.toContain('<img src=x onerror="alert(1)">');
    expect(html).toContain(
      "&lt;img src=x onerror=&quot;alert(1)&quot;&gt;",
    );
    expect(html).toContain(
      "https://hallomada.de/verify?next=&quot;profile&quot;&amp;source=email",
    );
  });
});
