"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { Button } from "../ui/button";
import {
  Aperture,
  CalendarDays,
  ChevronDown,
  LayoutDashboard,
  LogOut,
  Menu,
  Plus,
  Store,
  UserRound,
  X,
} from "lucide-react";
import ThemeToggle from "./ThemeToggle";
import { NavLinks, NavLinksFallback } from "./NavLinks";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

const authButtons = (onNavigate?: () => void) => (
  <>
    <Button
      variant="outline"
      nativeButton={false}
      render={<Link href="/login" onClick={onNavigate} />}
      className="transition-colors duration-200 dark:border-primary/60 dark:text-primary dark:hover:bg-primary/10"
    >
      Login
    </Button>
    <Button
      nativeButton={false}
      render={<Link href="/register" onClick={onNavigate} />}
      className="transition-colors duration-200"
    >
      Register
    </Button>
  </>
);

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const router = useRouter();
  const { data: session } = authClient.useSession();
  const user = session?.user;

  const closeMenus = () => {
    setIsOpen(false);
    setIsProfileOpen(false);
  };

  const handleLogout = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          closeMenus();
          router.push("/");
          router.refresh();
        },
      },
    });
  };

  const profileLinks = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/add-studio", label: "Add New Studio", icon: Plus },
    { href: "/my-listings", label: "My Studio Listings", icon: Store },
    { href: "/my-bookings", label: "My Bookings", icon: CalendarDays },
  ];

  return (
    <div className="border-b border-border sticky top-0 z-50 bg-background/90 backdrop-blur-md supports-backdrop-filter:bg-background/60 transition-colors duration-200 dark:border-zinc-800/80 dark:bg-zinc-950/80">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="group flex items-center gap-2" aria-label="StudioSpace home">
          <span className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm transition-transform group-hover:rotate-12">
            <Aperture className="size-5" strokeWidth={2.2} />
          </span>
          <span className="font-heading text-xl font-bold tracking-tight text-foreground sm:text-2xl">
            Studio<span className="text-primary">Space</span>
          </span>
        </Link>

        {/* Desktop: nav links */}
        <ul className="hidden lg:flex items-center gap-5">
          <Suspense fallback={<NavLinksFallback />}>
            <NavLinks />
          </Suspense>
        </ul>

        {/* Desktop: buttons + theme toggle */}
        <div className="hidden lg:flex items-center gap-3">
          <ThemeToggle />
          {user ? (
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsProfileOpen((previous) => !previous)}
                className="flex items-center gap-2 rounded-full border border-border py-1 pr-2 pl-1 transition-colors hover:border-primary/50 dark:border-zinc-800"
                aria-expanded={isProfileOpen}
              >
                {user.image ? (
                  <img src={user.image} alt="" className="size-8 rounded-full object-cover" />
                ) : (
                  <span className="flex size-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <UserRound className="size-4" />
                  </span>
                )}
                <ChevronDown className="size-4 text-muted-foreground" />
              </button>

              {isProfileOpen && (
                <div className="absolute right-0 mt-3 w-64 rounded-2xl border border-border bg-popover p-2 shadow-xl dark:border-zinc-800 dark:bg-zinc-900">
                  <div className="border-b border-border px-3 py-2.5 dark:border-zinc-800">
                    <p className="truncate text-sm font-semibold text-foreground">{user.name}</p>
                    <p className="truncate text-xs text-muted-foreground">{user.email}</p>
                  </div>
                  <nav className="mt-2 space-y-1">
                    {profileLinks.map(({ href, label, icon: Icon }) => (
                      <Link
                        key={href}
                        href={href}
                        onClick={closeMenus}
                        className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-foreground transition-colors hover:bg-primary/10 hover:text-primary"
                      >
                        <Icon className="size-4" />
                        {label}
                      </Link>
                    ))}
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-destructive transition-colors hover:bg-destructive/10"
                    >
                      <LogOut className="size-4" />
                      Logout
                    </button>
                  </nav>
                </div>
              )}
            </div>
          ) : (
            authButtons()
          )}
        </div>

        {/* Mobile / Tablet: theme toggle + hamburger */}
        <div className="lg:hidden flex items-center gap-2">
          <ThemeToggle />
          <button
            type="button"
            onClick={() => setIsOpen((prev) => !prev)}
            aria-label={isOpen ? "Close menu" : "Open menu"}
            aria-expanded={isOpen}
            className="inline-flex size-9 items-center justify-center rounded-lg border border-border text-foreground transition-colors duration-200 hover:border-primary/50 hover:text-primary dark:border-zinc-800 dark:text-zinc-400 dark:hover:border-primary/50 dark:hover:text-primary"
          >
            {isOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {/* Mobile / Tablet: dropdown panel */}
      {isOpen && (
        <div className="lg:hidden border-t border-border bg-background transition-colors duration-200 dark:border-zinc-800 dark:bg-zinc-900">
          <div className="container mx-auto flex flex-col gap-4 px-4 py-4">
            <ul className="flex flex-col gap-1 text-sm [&_a]:block [&_a]:rounded-lg [&_a]:px-3 [&_a]:py-2 dark:[&_a]:text-zinc-100 dark:[&_a:hover]:bg-zinc-800/70">
              <Suspense fallback={<NavLinksFallback />}>
                <NavLinks onNavigate={() => setIsOpen(false)} />
              </Suspense>
            </ul>
            <div className="flex flex-col gap-2 border-t border-border pt-4 transition-colors duration-200 dark:border-zinc-800 [&_a]:w-full [&_button]:w-full">
              {user ? (
                <>
                  <div className="flex items-center gap-3 rounded-xl bg-muted/60 px-3 py-3 dark:bg-zinc-800/60">
                    {user.image ? (
                      <img src={user.image} alt="" className="size-10 rounded-full object-cover" />
                    ) : (
                      <span className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                        <UserRound className="size-5" />
                      </span>
                    )}
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold">{user.name}</p>
                      <p className="truncate text-xs text-muted-foreground">{user.email}</p>
                    </div>
                  </div>
                  {profileLinks.map(({ href, label, icon: Icon }) => (
                    <Link
                      key={href}
                      href={href}
                      onClick={closeMenus}
                      className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm hover:bg-primary/10 hover:text-primary"
                    >
                      <Icon className="size-4" />
                      {label}
                    </Link>
                  ))}
                  <Button variant="outline" className="text-destructive" onClick={handleLogout}>
                    <LogOut />
                    Logout
                  </Button>
                </>
              ) : (
                authButtons(() => setIsOpen(false))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Navbar;
