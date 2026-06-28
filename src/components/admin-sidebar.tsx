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
import * as React from "react";

export function AdminSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const router = useRouter();
  const pathname = usePathname();
  const { isMobile, setOpenMobile } = useSidebar();

  // Mocked user for now
  const user = {
    name: "Admin",
    email: "super_admin@hallo.com",
    image: "",
    role: "super_admin",
  };

  const navGroups = [
    {
      label: "PRINCIPAL",
      items: [
        { title: "Dashboard", url: "/admin", icon: LayoutDashboard },
        { title: "Utilisateurs", url: "/admin/users", icon: Users },
        { title: "Modération", url: "/admin/moderation", icon: ShieldAlert, badge: "5" },
      ],
    },
    {
      label: "CONTENU",
      items: [
        { title: "Offres d'emploi", url: "/admin/jobs", icon: Briefcase },
        { title: "Immobilier", url: "/admin/listing", icon: Building },
        { title: "Communautés", url: "/admin/communities", icon: Users },
      ],
    },
    {
      label: "SYSTÈME",
      items: [
        { title: "Statistiques", url: "/admin/statistics", icon: BarChart },
        { title: "Paramètres", url: "/admin/settings", icon: Settings },
        { title: "Audit log", url: "/admin/audit", icon: ShieldCheck },
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
                  <span className="text-xs text-muted-foreground">Admin panel</span>
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
                    <AvatarImage src={user.image || ""} alt={user.name || ""} />
                    <AvatarFallback className="rounded-lg text-primary font-semibold">
                      {user.name.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">{user.name}</span>
                    <span className="truncate text-xs text-muted-foreground">{user.role}</span>
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
                    Retour au site
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleLogOut}
                  className="cursor-pointer text-destructive focus:bg-destructive focus:text-destructive-foreground focus:opacity-90"
                >
                  <LogOut className="mr-2 size-4" />
                  <span>Déconnexion</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
