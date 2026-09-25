import Footer from "@/components/footer";
import { MainNavbar } from "@/components/main-navbar";
import { NotificationWidget } from "@/components/notificationBell";
import { RoleGuard } from "@/components/role-guard";
import { TooltipProvider } from "@/components/ui/tooltip";
import { WidgetProvider } from "@/components/WidgetContext";
import { Locale } from "@/i18n/routing";
import { setRequestLocale } from "next-intl/server";

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;
  setRequestLocale(locale as Locale);

  return (
    <div className="flex min-h-svh flex-col bg-background">
      <MainNavbar />
      <main className="mx-auto w-full min-h-screen">
        <RoleGuard>
          <TooltipProvider>{children}</TooltipProvider>
        </RoleGuard>
      </main>
      <Footer />
      <WidgetProvider>
        <NotificationWidget />
      </WidgetProvider>
    </div>
  );
}
