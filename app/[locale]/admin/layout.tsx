import { AdminSidebar } from "@/components/admin-sidebar";
import LocaleSwitcher from "@/components/locale-switcher";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Locale } from "@/i18n/routing";
import { setRequestLocale } from "next-intl/server";

export default async function AdminLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;
  setRequestLocale(locale as Locale);

  // TODO: Add Better-Auth Guard here. Example:
  // const user = await auth.getCurrentUser();
  // if (!user || user.role !== "admin") redirect("/");

  return (
    <SidebarProvider>
      <AdminSidebar />
      <SidebarInset className="bg-background text-foreground">
        {/* Sticky top bar */}
        <header className="sticky top-0 z-40 flex h-14 shrink-0 items-center gap-2 bg-background/80 backdrop-blur-md px-4 justify-between border-b border-border/40">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="-ml-1" />
            <h1 className="text-sm font-semibold tracking-wide ml-2 hidden sm:block">Admin Panel</h1>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <input 
                type="text" 
                placeholder="Recherche globale..." 
                className="hidden md:block h-8 w-64 rounded-md border border-border bg-muted/50 px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              />
            </div>
            <LocaleSwitcher />
            <ThemeToggle />
          </div>
        </header>

        <main className="flex-1 w-full p-4 md:p-6 min-h-screen">
          <TooltipProvider>{children}</TooltipProvider>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
