"use client";

import { Suspense } from "react";
import { ButtonGroup } from "./ui/button-group";
import { Button } from "./ui/button";
import Link from "next/link";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { LogOut } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Authenticated, AuthLoading, Unauthenticated } from "convex/react";
import { authClient } from "@/lib/auth-client";
import { useQuery } from "convex-helpers/react/cache";
import { api } from "@convex/_generated/api";

export type UserShape =
  | {
      name?: string | null;
      email?: string | null;
      image?: string | null;
    }
  | null
  | undefined;

export function AuthNavClient() {
  const user = useQuery(api.auth.getCurrentUser);

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
    <>
      <Unauthenticated>
        <div className="flex items-center gap-2">
          <ButtonGroup className="hidden sm:flex">
            <Button asChild>
              <Link href="/register">S&apos;inscrire</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/login">Se connecter</Link>
            </Button>
          </ButtonGroup>
          <Button asChild className="sm:hidden" size="sm">
            <Link href="/login">Connexion</Link>
          </Button>
        </div>
      </Unauthenticated>
      <Authenticated>
        {user && (
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <div className="flex items-center sm:space-x-2 hover:bg-accent rounded-lg sm:py-2 sm:px-4 transition-colors cursor-pointer">
                  <Suspense>
                    <Button
                      variant="outline"
                      className="relative h-8 w-8 rounded-full"
                    >
                      <Avatar className="h-8 w-8">
                        <AvatarImage
                          src={user.image || ""}
                          alt={user.name || ""}
                        />
                        <AvatarFallback>
                          {user.name?.charAt(0)?.toUpperCase() ||
                            user.email?.charAt(0)?.toUpperCase() ||
                            "U"}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </Suspense>
                  <span className="hidden sm:block text-sm font-medium">
                    {user.name || user.email}
                  </span>
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <div className="flex items-center justify-start gap-2 p-2">
                  <div className="flex flex-col space-y-1 leading-none">
                    {user.name && <p className="font-medium">{user.name}</p>}
                    {user.email && (
                      <p className="w-[200px] truncate text-sm text-muted-foreground">
                        {user.email}
                      </p>
                    )}
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="cursor-pointer"
                  onClick={handleLogOut}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Se déconnecter</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </Authenticated>
    </>
  );
}
