"use client";

import * as React from "react";
import { Link } from "@/i18n/navigation";
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
  SidebarGroupLabel,
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
import { useTranslations } from "next-intl";

export function MainSidebar({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();
  const user = useQuery(api.auth.getCurrentUser);
  const myCommunities = useQuery(api.communities.getMyCommunities);
  const topCommunities = useQuery(api.communities.getTopCommunities);
  const { isMobile, setOpenMobile } = useSidebar();
  const t = useTranslations("sidebar");

  const navItems = [
    { title: t("nav.home"), url: "/", icon: Home },
    { title: t("nav.community"), url: "/communities", icon: Users },
    { title: t("nav.opportunities"), url: "/jobs", icon: Briefcase },
    { title: t("nav.housing"), url: "/listing", icon: Building },
  ];

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
                <SidebarMenuItem key={item.url}>
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
                    tooltip={t("premium.tooltip")}
                  >
                    <Link
                      href="/pricing"
                      onClick={() => isMobile && setOpenMobile(false)}
                    >
                      <Sparkles className="text-purple-500" />
                      <span className="font-semibold bg-linear-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
                        {t("premium.label")}
                      </span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </Authenticated>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>{t("communities.label")}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <Authenticated>
                {myCommunities?.map((community) => (
                  <SidebarMenuItem key={community?._id}>
                    <SidebarMenuButton
                      asChild
                      isActive={pathname === `/communities/${community?.slug}`}
                    >
                      <Link
                        href={`/communities/${community?.slug}`}
                        onClick={() => isMobile && setOpenMobile(false)}
                      >
                        <span className="truncate">{community?.name}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </Authenticated>
              <Unauthenticated>
                {topCommunities?.map((community) => (
                  <SidebarMenuItem key={community._id}>
                    <SidebarMenuButton
                      asChild
                      isActive={pathname === `/communities/${community.slug}`}
                    >
                      <Link
                        href={`/communities/${community.slug}`}
                        onClick={() => isMobile && setOpenMobile(false)}
                      >
                        <Users className="size-4" />
                        <span className="truncate">{community.name}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </Unauthenticated>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === `/communities/explore`}
                >
                  <Link
                    href="/communities/explore"
                    onClick={() => isMobile && setOpenMobile(false)}
                    className="text-muted-foreground mt-2"
                  >
                    <span className="truncate w-full text-center text-sm font-medium">
                      {t("communities.explore")}
                    </span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
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
                  {t("auth.register")}
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild size="lg" tooltip={t("auth.login")}>
                <Link
                  href="/login"
                  onClick={() => isMobile && setOpenMobile(false)}
                  className="justify-center border border-border mt-1 group-data-[collapsible=icon]:mt-0 group-data-[collapsible=icon]:border-none"
                >
                  <LogIn className="hidden group-data-[collapsible=icon]:block size-4" />
                  <span className="group-data-[collapsible=icon]:hidden">
                    {t("auth.login")}
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
                        {t("auth.profile")}
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link
                        href="/settings"
                        className="cursor-pointer flex items-center w-full"
                        onClick={() => isMobile && setOpenMobile(false)}
                      >
                        <Settings className="mr-2 size-4" />
                        {t("auth.settings")}
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={handleLogOut}
                      className="cursor-pointer text-destructive focus:bg-destructive focus:text-destructive-foreground focus:opacity-90"
                    >
                      <LogOut className="mr-2 size-4" />
                      <span>{t("auth.logout")}</span>
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
