import Link from "next/link";
import { Heart, Mail, MapPin } from "lucide-react";

export default function Footer() {
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
              Nous sommes une communauté dédiée aux réseautages entre natif et
              diaspora Malagasy en Allemagne. Une plateforme d&apos;échange et
              de partage pour favoriser l&apos;entraide.
            </p>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>Fait avec</span>
              <Heart className="h-4 w-4 text-red-500" />
              <span>pour la communauté Malagasy</span>
            </div>
          </div>

          {/* Navigation */}
          <div>
            <h3 className="font-semibold mb-4">Navigation</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Accueil
                </Link>
              </li>
              <li>
                <Link
                  href="/communaute"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Communauté
                </Link>
              </li>
              <li>
                <Link
                  href="/jobs"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Opportunités
                </Link>
              </li>
              <li>
                <Link
                  href="/immobilier"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Immobilier
                </Link>
              </li>
              <li>
                <Link
                  href="/faq"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold mb-4">Contact</h3>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2 text-muted-foreground">
                <Mail className="h-4 w-4" />
                <span>contact@hallohallo.de</span>
              </li>
              <li className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>Allemagne</span>
              </li>
            </ul>

            <div className="mt-6">
              <h4 className="font-semibold mb-2 text-sm">Suivez-nous</h4>
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
          <p>&copy; 2025 Hallo Hallo. Tous droits réservés.</p>
        </div>
      </div>
    </footer>
  );
}
