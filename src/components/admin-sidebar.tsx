"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Link, useRouter } from "@/i18n/navigation";
import { authClient } from "@/lib/auth-client";
import { righteous } from "@/web/fonts";
import { Logo } from "@/web/logo";
import { api } from "@convex/_generated/api";
import { useQuery } from "convex-helpers/react/cache";
import {
  BarChart,
  Briefcase,
  Building,
  ChevronsUpDown,
  LayoutDashboard,
  LogOut,
  Settings,
  ShieldAlert,
  ShieldCheck,
  User,
  Users,
} from "lucide-react";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import * as React from "react";

export function AdminSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const t = useTranslations("admin");
  const router = useRouter();
  const pathname = usePathname();
  const { isMobile, setOpenMobile } = useSidebar();
  const user = useQuery(api.auth.auth.getCurrentUser);
  const userName = user?.name ?? t("sidebar.loadingUser");
  const userImage =
    user?.image?.startsWith("http") || user?.image?.startsWith("/")
      ? user.image
      : "";

  const navGroups = [
    {
      label: t("sidebar.main"),
      items: [
        { title: t("sidebar.dashboard"), url: "/admin", icon: LayoutDashboard },
        { title: t("sidebar.users"), url: "/admin/users", icon: Users },
        { title: t("sidebar.moderation"), url: "/admin/moderation", icon: ShieldAlert, badge: "5" },
      ],
    },
    {
      label: t("sidebar.content"),
      items: [
        { title: t("sidebar.jobs"), url: "/admin/jobs", icon: Briefcase },
        { title: t("sidebar.listing"), url: "/admin/listing", icon: Building },
        { title: t("sidebar.communities"), url: "/admin/communities", icon: Users },
      ],
    },
    {
      label: t("sidebar.system"),
      items: [
        { title: t("sidebar.statistics"), url: "/admin/statistics", icon: BarChart },
        { title: t("sidebar.settings"), url: "/admin/settings", icon: Settings },
        { title: t("sidebar.audit"), url: "/admin/audit", icon: ShieldCheck },
      ],
    },
  ];

  const handleLogOut = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push("/login");
        },
      },
    });
  };

  return (
    <Sidebar variant="inset" collapsible="icon" className="border-r-0" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link
                href="/admin"
                onClick={() => isMobile && setOpenMobile(false)}
                className="hover:opacity-80 transition"
              >
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <Logo className="size-6 text-primary-foreground" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className={`${righteous.className} text-lg text-primary leading-none`}>
                    Hallo Hallo
                  </span>
                  <span className="text-xs text-muted-foreground">{t("panel")}</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        {navGroups.map((group) => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel className="text-xs font-semibold text-muted-foreground/70 uppercase tracking-wider">
              {group.label}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => {
                  const isActive = pathname.endsWith(item.url) || (item.url === "/admin" && pathname.endsWith("/admin"));
                  
                  return (
                    <SidebarMenuItem key={item.url}>
                      <SidebarMenuButton
                        asChild
                        isActive={isActive}
                        tooltip={item.title}
                        className={isActive ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground hover:text-foreground"}
                      >
                        <Link
                          href={item.url}
                          onClick={() => isMobile && setOpenMobile(false)}
                          className="flex items-center justify-between w-full"
                        >
                          <div className="flex items-center gap-2">
                            <item.icon className="size-4" />
                            <span>{item.title}</span>
                          </div>
                          {item.badge && (
                            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-destructive/10 text-[10px] font-medium text-destructive">
                              {item.badge}
                            </span>
                          )}
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                >
                  <Avatar className="h-8 w-8 rounded-lg bg-primary/20">
                    <AvatarImage src={userImage} alt={userName} />
                    <AvatarFallback className="rounded-lg text-primary font-semibold">
                      {userName.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">{userName}</span>
                    <span className="truncate text-xs text-muted-foreground">
                      {user?.email ?? ""}
                    </span>
                  </div>
                  <ChevronsUpDown className="ml-auto size-4" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                side={isMobile ? "bottom" : "right"}
                className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                align="end"
                sideOffset={4}
              >
                <DropdownMenuItem asChild>
                  <Link
                    href={`/`}
                    className="cursor-pointer flex items-center w-full"
                    onClick={() => isMobile && setOpenMobile(false)}
                  >
                    <User className="mr-2 size-4" />
                    {t("sidebar.returnSite")}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleLogOut}
                  className="cursor-pointer text-destructive focus:bg-destructive focus:text-destructive-foreground focus:opacity-90"
                >
                  <LogOut className="mr-2 size-4" />
                  <span>{t("sidebar.logout")}</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
