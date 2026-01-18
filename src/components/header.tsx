"use client";

import { Menu, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Button } from "./ui/button";
import { ThemeToggle } from "./theme-toggle";
import { righteous } from "@/web/fonts";
import { Logo } from "@/web/logo";
import { AuthNavClient } from "./auth-nav-client";
import { useConvexAuth } from "convex/react";

export function Header() {
  const { isAuthenticated } = useConvexAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  // Header transparent et fixe sur la page d'accueil, sticky sur les autres
  const isFixedHeaderPage =
    pathname === "/" ||
    pathname === "/jobs" ||
    pathname === "/realestates" ||
    pathname === "/communities";
  const headerClasses = isFixedHeaderPage
    ? "fixed top-0 z-50 w-full bg-transparent backdrop-blur-lg"
    : "sticky top-0 z-50 w-full bg-transparent backdrop-blur-lg";

  return (
    <header className={`${headerClasses} + h-16`}>
      <div className="mx-auto flex lg:gap-10 gap-2 items-center p-4 relative">
        <Link
          href="/"
          className="flex items-center gap-2 text-lg text-primary font-bold hover:opacity-80 transition"
        >
          <Logo />
          <span className={`${righteous.className} leading-none`}>Hallo</span>
        </Link>

        {/* Navigation Desktop */}
        <nav className="hidden lg:flex gap-4 relative">
          {/* Accueil */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="relative"
          >
            <Link
              href="/"
              className={`text-accent-foreground/60 font-medium transition-colors relative z-10 ${
                pathname === "/" ? "text-foreground" : "hover:text-foreground"
              }`}
            >
              Accueil
            </Link>
            {pathname === "/" && (
              <motion.div
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                layoutId="activeTab"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              />
            )}
          </motion.div>

          {/* Communauté */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            className="relative"
          >
            <Link
              href="/communities"
              className={`text-accent-foreground/60 font-medium transition-colors relative z-10 ${
                pathname === "/communities"
                  ? "text-foreground"
                  : "hover:text-foreground"
              }`}
            >
              Communauté
            </Link>
            {pathname === "/communities" && (
              <motion.div
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                layoutId="activeTab"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              />
            )}
          </motion.div>

          {/* Opportunités */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
            className="relative"
          >
            <Link
              href="/jobs"
              className={`text-accent-foreground/60 font-medium transition-colors relative z-10 ${
                pathname === "/jobs"
                  ? "text-foreground"
                  : "hover:text-foreground"
              }`}
            >
              Opportunités
            </Link>
            {pathname === "/jobs" && (
              <motion.div
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                layoutId="activeTab"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              />
            )}
          </motion.div>

          {/* Immobilier */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.4 }}
            className="relative"
          >
            <Link
              href="/realestates"
              className={`text-accent-foreground/60 font-medium transition-colors relative z-10 ${
                pathname === "/realestates"
                  ? "text-foreground"
                  : "hover:text-foreground"
              }`}
            >
              Immobilier
            </Link>
            {pathname === "/realestates" && (
              <motion.div
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                layoutId="activeTab"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              />
            )}
          </motion.div>

          {/* Premium - Hidden when not logged in */}
          {isAuthenticated && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: 0.5 }}
              className="relative"
            >
              <Link
                href="/pricing"
                className={`font-medium transition-all relative z-10 px-3 py-1.5 rounded-full border-2 ${
                  pathname === "/pricing"
                    ? "text-white bg-linear-to-r from-purple-500 to-pink-500 border-transparent shadow-lg"
                    : "text-transparent bg-linear-to-r from-purple-500 to-pink-500 bg-clip-text border-gradient-to-r hover:shadow-lg hover:scale-105"
                }`}
                style={{
                  borderImage:
                    pathname !== "/pricing"
                      ? "linear-gradient(to right, #a855f7, #ec4899) 1"
                      : undefined,
                }}
              >
                Passer au Premium
              </Link>
            </motion.div>
          )}
        </nav>

        {/* Bouton hamburger mobile */}
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          <AnimatePresence mode="wait">
            {mobileMenuOpen ? (
              <motion.div
                key="close"
                initial={{ opacity: 0, rotate: -90 }}
                animate={{ opacity: 1, rotate: 0 }}
                exit={{ opacity: 0, rotate: 90 }}
                transition={{ duration: 0.2, ease: "easeInOut" }}
              >
                <X size={24} strokeWidth={3.5} />
              </motion.div>
            ) : (
              <motion.div
                key="menu"
                initial={{ opacity: 0, rotate: 90 }}
                animate={{ opacity: 1, rotate: 0 }}
                exit={{ opacity: 0, rotate: -90 }}
                transition={{ duration: 0.2, ease: "easeInOut" }}
              >
                <Menu size={24} strokeWidth={3.5} />
              </motion.div>
            )}
          </AnimatePresence>
        </Button>

        <span className="flex-1" />

        <div className="flex items-center sm:gap-4 gap-2">
          <AuthNavClient />
          <ThemeToggle />
        </div>
      </div>

      {/* Menu mobile */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            className="absolute top-full left-0 right-0 md:hidden border-t bg-background/95 backdrop-blur-sm shadow-lg z-40"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            <motion.nav
              className="flex flex-col p-4 gap-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2, delay: 0.1 }}
            >
              {/* Navigation mobile */}
              {[
                { href: "/", label: "Accueil" },
                { href: "/communaute", label: "Communauté" },
                { href: "/jobs", label: "Opportunités" },
                { href: "/immobilier", label: "Immobilier" },
                ...(isAuthenticated
                  ? [{ href: "/pricing", label: "Passer au Premium" }]
                  : []),
              ].map((item, index) => (
                <motion.div
                  key={item.href}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.1 * (index + 1) }}
                  className="relative"
                >
                  <Link
                    href={item.href}
                    className={`font-medium transition-colors p-2 rounded-md block relative z-10 ${
                      pathname === item.href
                        ? "text-foreground bg-accent"
                        : "text-accent-foreground/60 hover:text-foreground hover:bg-accent"
                    } ${
                      item.href === "/pricing"
                        ? "text-transparent bg-linear-to-r from-purple-500 to-pink-500 bg-clip-text"
                        : ""
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item.label}
                  </Link>
                </motion.div>
              ))}
            </motion.nav>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            className="fixed inset-0 z-40 md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setMobileMenuOpen(false)}
          />
        )}
      </AnimatePresence>
    </header>
  );
}
