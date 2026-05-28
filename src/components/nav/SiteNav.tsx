"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth, useUser, useClerk } from "@clerk/nextjs";
import { Menu, LogOut, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import { ThemeToggle } from "@/components/theme-toggle";

const NAV_LINKS = [
  { label: "How it works", href: "/how-it-works" },
  { label: "For vendors", href: "/for-vendors" },
  { label: "About", href: "/about" },
] as const;

// TODO Phase 1: move SiteNav into the (public) route group layout once route groups land (AD-005)

export function SiteNav() {
  const [isScrolled, setIsScrolled] = useState(false);
  const { isLoaded, isSignedIn } = useAuth();
  const { user } = useUser();
  const { signOut } = useClerk();

  useEffect(() => {
    const handler = () =>
      setIsScrolled(
        (window.scrollY || document.documentElement.scrollTop) > 10,
      );
    handler();
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  const userInitials = user?.fullName
    ? user.fullName
        .split(" ")
        .map((n) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : (user?.primaryEmailAddress?.emailAddress?.[0]?.toUpperCase() ?? "U");

  return (
    <nav
      aria-label="Main navigation"
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-300",
        isScrolled
          ? "border-b border-border bg-background/80 backdrop-blur-md"
          : "bg-transparent",
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 md:px-6">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-md"
          aria-label="Sphene Events — Home"
        >
          <span className="font-display text-xl font-black tracking-tight text-foreground">
            Sphene
          </span>
          <span className="font-display text-xl font-black tracking-tight text-primary">
            Events
          </span>
        </Link>

        {/* Desktop centre links */}
        <div className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-muted-foreground transition-colors duration-150 hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Desktop right — theme + auth */}
        <div className="hidden items-center gap-2 md:flex">
          <ThemeToggle />

          {/* Reserve space to prevent layout shift while Clerk loads */}
          <div
            className={cn(
              "flex items-center justify-end gap-2 transition-opacity duration-150",
              !isLoaded ? "pointer-events-none opacity-0" : "opacity-100",
            )}
            style={{ minWidth: "148px" }}
          >
            {isLoaded && !isSignedIn && (
              <>
                <Link
                  href="/sign-in"
                  className="text-sm font-medium text-muted-foreground transition-colors duration-150 hover:text-foreground"
                >
                  Sign in
                </Link>
                <Button asChild size="sm">
                  <Link href="/sign-up">Sign up</Link>
                </Button>
              </>
            )}

            {isLoaded && isSignedIn && user && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    className="rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                    aria-label="Account menu"
                  >
                    <Avatar className="h-9 w-9">
                      <AvatarImage
                        src={user.imageUrl}
                        alt={user.fullName ?? "Your account"}
                      />
                      <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                        {userInitials}
                      </AvatarFallback>
                    </Avatar>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel className="font-normal">
                    <p className="font-semibold text-foreground leading-none truncate">
                      {user.fullName ?? "Account"}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground truncate">
                      {user.primaryEmailAddress?.emailAddress}
                    </p>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard" className="cursor-pointer">
                      <User className="mr-2 h-4 w-4" />
                      My account
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="cursor-pointer text-destructive focus:text-destructive"
                    onSelect={() => void signOut({ redirectUrl: "/" })}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>

        {/* Mobile right — theme + hamburger */}
        <div className="flex items-center gap-2 md:hidden">
          <ThemeToggle />
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Open menu">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72">
              <SheetHeader>
                <SheetTitle className="text-left">
                  <span className="font-display text-lg font-black text-foreground">
                    Sphene
                  </span>
                  <span className="font-display text-lg font-black text-primary">
                    {" "}Events
                  </span>
                </SheetTitle>
              </SheetHeader>

              <nav aria-label="Mobile navigation" className="mt-6 flex flex-col gap-1">
                {NAV_LINKS.map((link) => (
                  <SheetClose asChild key={link.href}>
                    <Link
                      href={link.href}
                      className="rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors duration-150 hover:bg-accent hover:text-accent-foreground"
                    >
                      {link.label}
                    </Link>
                  </SheetClose>
                ))}
              </nav>

              <div className="mt-6 border-t border-border pt-6">
                {isLoaded && !isSignedIn && (
                  <div className="flex flex-col gap-2">
                    <SheetClose asChild>
                      <Button asChild variant="outline" className="w-full">
                        <Link href="/sign-in">Sign in</Link>
                      </Button>
                    </SheetClose>
                    <SheetClose asChild>
                      <Button asChild className="w-full">
                        <Link href="/sign-up">Sign up</Link>
                      </Button>
                    </SheetClose>
                  </div>
                )}

                {isLoaded && isSignedIn && user && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 px-1">
                      <Avatar className="h-9 w-9 shrink-0">
                        <AvatarImage
                          src={user.imageUrl}
                          alt={user.fullName ?? "Account"}
                        />
                        <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                          {userInitials}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-foreground">
                          {user.fullName ?? "Account"}
                        </p>
                        <p className="truncate text-xs text-muted-foreground">
                          {user.primaryEmailAddress?.emailAddress}
                        </p>
                      </div>
                    </div>
                    <SheetClose asChild>
                      <Button
                        variant="outline"
                        className="w-full text-destructive hover:text-destructive"
                        onClick={() => void signOut({ redirectUrl: "/" })}
                      >
                        <LogOut className="mr-2 h-4 w-4" />
                        Sign out
                      </Button>
                    </SheetClose>
                  </div>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
}
