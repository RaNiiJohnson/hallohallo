import { redirect } from "@/i18n/navigation";
import { getToken } from "@/lib/auth-server";

export default async function AuthLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const token = await getToken();
  
  // Si le token est valide (l'utilisateur est VRAIMENT connecté), on le redirige.
  // Sinon, s'il a un vieux cookie expiré, token sera null et on le laisse voir la page.
  if (token) {
    const { locale } = await params;
    redirect({ href: "/", locale });
  }

  return <>{children}</>;
}
