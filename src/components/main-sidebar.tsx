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
import { Authenticated, AuthLoading, Unauthenticated } from "convex/react";
import {
  Briefcase,
  Building,
  ChevronsUpDown,
  Home,
  LogIn,
  LogOut,
  Settings,
  User,
  Users,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { usePathname } from "next/navigation";
import * as React from "react";
import { Skeleton } from "./ui/skeleton";

export function MainSidebar({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  const router = useRouter();
  const pathname = usePathname();
  const user = useQuery(api.auth.auth.getCurrentUser);
  const myCommunities = useQuery(api.communities.queries.getMyCommunities);
  const topCommunities = useQuery(api.communities.queries.getTopCommunities);
  const { isMobile, setOpenMobile } = useSidebar();
  const t = useTranslations("sidebar");

  const navItems = [
    { title: t("nav.home"), url: "/", icon: Home },
    { title: t("nav.communities"), url: "/communities", icon: Users },
    { title: t("nav.opportunities"), url: "/jobs", icon: Briefcase },
    { title: t("nav.housing"), url: "/listing", icon: Building },
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
              {/* <AuthLoading>
                <SidebarMenuItem>
                  <SidebarMenuButton>
                    <Skeleton className="flex-1 h-[25px]" />
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </AuthLoading>
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
              </Authenticated> */}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>{t("communities.label")}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <AuthLoading>
                <SidebarMenuItem>
                  <SidebarMenuButton>
                    <Skeleton className="size-4 rounded shrink-0" />
                    <Skeleton className="flex-1 h-4 group-data-[collapsible=icon]:hidden" />
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton>
                    <Skeleton className="size-4 rounded shrink-0" />
                    <Skeleton className="flex-1 h-4 group-data-[collapsible=icon]:hidden" />
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </AuthLoading>
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
                        <div className="flex size-4 shrink-0 items-center justify-center rounded bg-primary/10 text-[10px] font-bold text-primary group-data-[collapsible=icon]:size-4">
                          {community?.name?.charAt(0).toUpperCase()}
                        </div>
                        <span className="truncate group-data-[collapsible=icon]:hidden">
                          {community?.name}
                        </span>
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
                        <div className="flex size-4 shrink-0 items-center justify-center rounded bg-primary/10 text-[10px] font-bold text-primary group-data-[collapsible=icon]:size-4">
                          {community?.name?.charAt(0).toUpperCase()}
                        </div>
                        <span className="truncate group-data-[collapsible=icon]:hidden">
                          {community.name}
                        </span>
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
        <AuthLoading>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton className="mb-1">
                <Skeleton className="size-10 rounded-full" />
                <Skeleton className="flex-1 h-10 rounded-full" />
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </AuthLoading>
        <Unauthenticated>
          <SidebarMenu className="gap-2 px-2 py-1">
            {/* Bouton S'inscrire (Principal) */}
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                size="default"
                className="bg-primary text-sidebar hover:text-sidebar hover:bg-primary/90 justify-center font-semibold transition-colors group-data-[collapsible=icon]:hidden"
              >
                <Link
                  href="/register"
                  onClick={() => isMobile && setOpenMobile(false)}
                >
                  {t("auth.register")}
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>

            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                size="default"
                tooltip={t("auth.login")}
                className="variant-outline justify-center font-medium border border-input hover:bg-accent hover:text-accent-foreground group-data-[collapsible=icon]:p-0"
              >
                <Link
                  href="/login"
                  onClick={() => isMobile && setOpenMobile(false)}
                >
                  <span className="group-data-[collapsible=icon]:hidden">
                    {t("auth.login")}
                  </span>
                  <LogIn className="hidden group-data-[collapsible=icon]:block h-5 w-5" />
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
                          src={user.image || ""}
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
