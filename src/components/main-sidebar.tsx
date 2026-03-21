"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useQuery } from "convex-helpers/react/cache";
import { api } from "@convex/_generated/api";
import { Authenticated, Unauthenticated } from "convex/react";
import { authClient } from "@/lib/auth-client";
import {
  Home,
  Users,
  Briefcase,
  Building,
  Sparkles,
  LogOut,
  ChevronsUpDown,
  User,
  Settings,
  LogIn,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Logo } from "@/web/logo";
import { righteous } from "@/web/fonts";

const navItems = [
  { title: "Accueil", url: "/", icon: Home },
  { title: "Communauté", url: "/communities", icon: Users },
  { title: "Opportunités", url: "/jobs", icon: Briefcase },
  { title: "Immobilier", url: "/listing", icon: Building },
];

export function MainSidebar({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();
  const user = useQuery(api.auth.getCurrentUser);
  const { isMobile, setOpenMobile } = useSidebar();

  const handleLogOut = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          location.reload();
        },
      },
    });
  };

  return (
    <Sidebar variant="inset" collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link
                href="/"
                onClick={() => isMobile && setOpenMobile(false)}
                className="hover:opacity-80 transition"
              >
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg text-primary-foreground">
                  <Logo className="size-7" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span
                    className={`${righteous.className} text-lg text-primary leading-none`}
                  >
                    Hallo
                  </span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.url}
                    tooltip={item.title}
                  >
                    <Link
                      href={item.url}
                      onClick={() => isMobile && setOpenMobile(false)}
                    >
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}

              <Authenticated>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === "/pricing"}
                    className="mt-2 bg-linear-to-r from-purple-500/10 to-pink-500/10 hover:from-purple-500/20 hover:to-pink-500/20 text-purple-600 dark:text-purple-400"
                    tooltip="Passer au Premium"
                  >
                    <Link
                      href="/pricing"
                      onClick={() => isMobile && setOpenMobile(false)}
                    >
                      <Sparkles className="text-purple-500" />
                      <span className="font-semibold bg-linear-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
                        Passer au Premium
                      </span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </Authenticated>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <Unauthenticated>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                size="lg"
                className="group-data-[collapsible=icon]:hidden"
              >
                <Link
                  href="/register"
                  onClick={() => isMobile && setOpenMobile(false)}
                  className="bg-primary text-primary-foreground hover:bg-primary/90 justify-center font-medium"
                >
                  S&apos;inscrire
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild size="lg" tooltip="Se connecter">
                <Link
                  href="/login"
                  onClick={() => isMobile && setOpenMobile(false)}
                  className="justify-center border border-border mt-1 group-data-[collapsible=icon]:mt-0 group-data-[collapsible=icon]:border-none"
                >
                  <LogIn className="hidden group-data-[collapsible=icon]:block size-4" />
                  <span className="group-data-[collapsible=icon]:hidden">
                    Se connecter
                  </span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </Unauthenticated>

        <Authenticated>
          {user && (
            <SidebarMenu>
              <SidebarMenuItem>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <SidebarMenuButton
                      size="lg"
                      className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                    >
                      <Avatar className="h-8 w-8 rounded-lg">
                        <AvatarImage
                          src={user.imageUrl || ""}
                          alt={user.name || ""}
                        />
                        <AvatarFallback className="rounded-lg">
                          {user.name?.charAt(0) || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="grid flex-1 text-left text-sm leading-tight">
                        <span className="truncate font-semibold">
                          {user.name}
                        </span>
                        <span className="truncate text-xs text-muted-foreground">
                          {user.email}
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
                        href={`/hl/${user.slug}`}
                        className="cursor-pointer flex items-center w-full"
                        onClick={() => isMobile && setOpenMobile(false)}
                      >
                        <User className="mr-2 size-4" />
                        Mon Profil
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link
                        href="/settings"
                        className="cursor-pointer flex items-center w-full"
                        onClick={() => isMobile && setOpenMobile(false)}
                      >
                        <Settings className="mr-2 size-4" />
                        Paramètres
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={handleLogOut}
                      className="cursor-pointer text-destructive focus:bg-destructive focus:text-destructive-foreground focus:opacity-90"
                    >
                      <LogOut className="mr-2 size-4" />
                      <span>Se déconnecter</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </SidebarMenuItem>
            </SidebarMenu>
          )}
        </Authenticated>
      </SidebarFooter>
    </Sidebar>
  );
}
