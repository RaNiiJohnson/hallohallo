"use client";

import Link from "next/link";
import { ThemeToggle } from "./theme-toggle";
import { Button, buttonVariants } from "./ui/button";
import { ButtonGroup } from "./ui/button-group";
import { useConvexAuth } from "convex/react";
import { authClient } from "@/lib/auth-client";

export const Header = () => {
  const { isAuthenticated } = useConvexAuth();
  return (
    <nav className="w-full py-5 flex items-center justify-between">
      <div className="flex items-center gap-8">
        <Link href="/">
          <h1 className="text-xl font-bold">Demo</h1>
        </Link>
        <div className="flex items-center gap-2">
          <Link href="/">Home</Link>
          <Link href="/blog">Blog</Link>
          <Link href="/create">Create</Link>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {isAuthenticated ? (
          <div>
            <Link href="/dashboard">
              <Button onClick={() => authClient.signOut()}>Log out</Button>
            </Link>
          </div>
        ) : (
          <ButtonGroup>
            <Link
              className={buttonVariants({ variant: "default" })}
              href="/auth/login"
            >
              Login
            </Link>
            <Link
              className={buttonVariants({ variant: "outline" })}
              href="/auth/register"
            >
              Register
            </Link>
          </ButtonGroup>
        )}
        <ThemeToggle />
      </div>
    </nav>
  );
};
