import { Link } from "@/i18n/navigation";
import { Mail, MapPin } from "lucide-react";
import { getTranslations } from "next-intl/server";

export default async function Footer() {
  const t = await getTranslations("footer");

  return (
    <footer className="bg-muted/30 border-t mt-16">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Logo et description */}
          <div className="md:col-span-2">
            <Link
              href="/"
              className="text-2xl font-bold text-primary mb-4 block"
            >
              Hallo Hallo
            </Link>
            <p className="text-muted-foreground mb-4 max-w-md">
              {t("description")}
            </p>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>{t("tagline")}</span>
            </div>
          </div>

          {/* Navigation */}
          <div>
            <h3 className="font-semibold mb-4">{t("nav.title")}</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  {t("nav.home")}
                </Link>
              </li>
              <li>
                <Link
                  href="/communities"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  {t("nav.community")}
                </Link>
              </li>
              <li>
                <Link
                  href="/jobs"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  {t("nav.opportunities")}
                </Link>
              </li>
              <li>
                <Link
                  href="/listing"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  {t("nav.housing")}
                </Link>
              </li>
              <li>
                <Link
                  href="/faq"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  {t("nav.faq")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold mb-4">{t("contact.title")}</h3>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2 text-muted-foreground">
                <Mail className="h-4 w-4" />
                <span>contact@hallohallo.de</span>
              </li>
              <li className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>{t("contact.location")}</span>
              </li>
            </ul>

            <div className="mt-6">
              <h4 className="font-semibold mb-2 text-sm">
                {t("social.title")}
              </h4>
              <div className="flex gap-2">
                <Link
                  href="#"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Facebook
                </Link>
                <span className="text-muted-foreground">•</span>
                <Link
                  href="#"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Instagram
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t mt-8 pt-8 text-center text-sm text-muted-foreground">
          <p>
            © {new Date().getFullYear()} Hallo Hallo. {t("copyright")}
          </p>
        </div>
      </div>
    </footer>
  );
}
