import { Resend } from "@convex-dev/resend";
import { v } from "convex/values";
import { components } from "./_generated/api";
import { internalMutation } from "./_generated/server";

export const resend: Resend = new Resend(components.resend, {
  testMode: false,
});

export const sendTestEmail = internalMutation({
  handler: async (ctx) => {
    await resend.sendEmail(ctx, {
      from: "Me <test@hallomada.de>",
      to: "johnsontolotriniavo@gmail.com",
      subject: "Hi there",
      html: "This is a test email",
    });
  },
});

export const sendVerificationEmail = internalMutation({
  args: {
    to: v.string(),
    name: v.string(),
    url: v.string(),
  },
  handler: async (ctx, { to, name, url }) => {
    await resend.sendEmail(ctx, {
      from: "HalloHallo <noreply@hallomada.de>",
      to,
      subject: "Vérifiez votre adresse e-mail / Verify your email",
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
          <h1 style="font-size: 24px; font-weight: bold; margin-bottom: 16px;">Bonjour ${name} 👋</h1>
          <p style="color: #555; margin-bottom: 24px;">
            Merci de vous être inscrit sur <strong>HalloHallo</strong>.<br/>
            Cliquez sur le bouton ci-dessous pour vérifier votre adresse e-mail et activer votre compte.
          </p>
          <a href="${url}"
             style="display: inline-block; background-color: #000; color: #fff; padding: 12px 24px;
                    border-radius: 6px; text-decoration: none; font-weight: 600; margin-bottom: 24px;">
            Vérifier mon e-mail
          </a>
          <p style="color: #999; font-size: 13px;">
            Ce lien expire dans 24 heures. Si vous n'êtes pas à l'origine de cette demande, ignorez cet e-mail.
          </p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;"/>
          <p style="color: #bbb; font-size: 12px;">HalloHallo · hallomada.de</p>
        </div>
      `,
    });
  },
});
