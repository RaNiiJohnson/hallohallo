import { ChatWidget } from "@/components/ChatWidget";
import Footer from "@/components/footer";
import LocaleSwitcher from "@/components/locale-switcher";
import { MainSidebar } from "@/components/main-sidebar";
import { NotificationWidget } from "@/components/notificationBell";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
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
    <SidebarProvider>
      <MainSidebar />
      <SidebarInset>
        {/* Sticky top bar with SidebarTrigger and ThemeToggle */}
        <header className="sticky top-0 z-40 flex h-10 shrink-0 items-center gap-2 bg-transparent backdrop-blur-sm px-4 justify-between">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="-ml-1" />
          </div>
          <div className="flex items-center gap-1">
            <LocaleSwitcher />
            <ThemeToggle />
          </div>
        </header>

        <main className="mx-auto w-full min-h-screen">
          <TooltipProvider>{children}</TooltipProvider>
        </main>
        <Footer />
        <WidgetProvider>
          <ChatWidget />
          <NotificationWidget />
        </WidgetProvider>
      </SidebarInset>
    </SidebarProvider>
  );
}
