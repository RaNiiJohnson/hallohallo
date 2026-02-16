"use client";

import { useState } from "react";
import { ButtonGroup } from "./ui/button-group";
import { Button } from "./ui/button";
import Link from "next/link";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { LogOut } from "lucide-react";
import { Avatar, AvatarImage } from "./ui/avatar";
import { Authenticated, Unauthenticated } from "convex/react";
import { authClient } from "@/lib/auth-client";
import { useQuery } from "convex-helpers/react/cache";
import { api } from "@convex/_generated/api";

export type UserShape =
  | {
      name?: string | null;
      email?: string | null;
      image?: string | null;
      slug?: string | null;
    }
  | null
  | undefined;

export function AuthNavClient() {
  const user = useQuery(api.auth.getCurrentUser);

  const [open, setOpen] = useState(false);

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
            <DropdownMenu open={open} onOpenChange={setOpen}>
              <DropdownMenuTrigger asChild>
                <div className="flex items-center xl:space-x-2 hover:bg-accent rounded-lg xl:py-2 xl:px-4 transition-colors cursor-pointer">
                  <Button
                    variant="outline"
                    className="relative h-8 w-8 rounded-full"
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarImage
                        src={user.imageUrl || "/random-user.png"}
                        alt={user.name || ""}
                      />
                    </Avatar>
                  </Button>
                  <span className="hidden xl:block text-sm font-medium">
                    {user.name || user.email}
                  </span>
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <Link
                  href={`/hl/${user.slug}`}
                  className="flex items-center justify-start gap-2 p-2 cursor-pointer hover:bg-accent rounded-t-md"
                  onClick={() => setOpen(false)}
                >
                  <div className="flex flex-col space-y-1 leading-none">
                    {user.name && <p className="font-medium">{user.name}</p>}
                    {user.email && (
                      <p className="w-[200px] truncate text-sm text-muted-foreground">
                        {user.email}
                      </p>
                    )}
                  </div>
                </Link>
                <DropdownMenuSeparator />
                <div
                  onClick={handleLogOut}
                  className="flex items-center justify-start gap-2 p-2 cursor-pointer text-destructive hover:text-destructive/80 bg-destructive/15 hover:bg-destructive/10 rounded-b-md w-full text-sm"
                >
                  <LogOut className="size-4" />
                  <span>Se déconnecter</span>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </Authenticated>
    </>
  );
}
