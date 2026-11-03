"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
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
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/studios", label: "Explore Studios" },
  { href: "/how-it-works", label: "How it Works" },
  { href: "/about-us", label: "About Us" },
];

const profileLinks = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/add-studio", label: "Add New Studio", icon: Plus },
  { href: "/my-listings", label: "My Studio Listings", icon: Store },
  { href: "/my-bookings", label: "My Bookings", icon: CalendarDays },
];

const NavbarContent = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const profileMenuRef = useRef<HTMLDivElement | null>(null);

  const pathname = usePathname();

  const router = useRouter();

  const sessionData = authClient.useSession();
  const user = sessionData.data?.user;

  useEffect(() => {
    if (isProfileOpen === false) {
      return;
    }

    const handleOutsideClick = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node;

      if (!profileMenuRef.current) {
        return;
      }

      if (!profileMenuRef.current.contains(target)) {
        setIsProfileOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsProfileOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);

    document.addEventListener("touchstart", handleOutsideClick);

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);

      document.removeEventListener("touchstart", handleOutsideClick);

      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isProfileOpen]);

  const closeMenus = () => {
    setIsOpen(false);

    setIsProfileOpen(false);
  };

  const handleLogout = async () => {
    try {
      const result = await authClient.signOut();
      if (result.error) {
        throw new Error(result.error.message ?? "Logout failed.");
      }

      const response = await fetch("/api/auth/api-token", {
        method: "DELETE",
        credentials: "same-origin",
      });
      if (!response.ok) {
        throw new Error("Could not clear the secure API session.");
      }

      toast.success("You have been logged out.");
      closeMenus();
      router.push("/");
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Logout failed. Please try again.",
      );
    }
  };

  const isLinkActive = (href: string) => {
    if (href === "/") {
      if (pathname === "/") {
        return true;
      } else {
        return false;
      }
    }

    if (pathname === href) {
      return true;
    } else {
      return false;
    }
  };

  const linkClass = (href: string) => {
    const commonClass = "relative py-2 text-sm font-medium tracking-wide";

    if (isLinkActive(href)) {
      return commonClass + " text-primary after:scale-x-100";
    } else {
      return commonClass + " text-muted-foreground after:scale-x-0";
    }
  };

  return (
    <div className="border-b border-border sticky top-0 z-50 bg-background/90 backdrop-blur-md supports-backdrop-filter:bg-background/60 transition-colors duration-200 dark:border-zinc-800/80 dark:bg-zinc-950/80">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" aria-label="SpotLight home">
          <div>
            <h1 className="flex text-2xl sm:text-3xl font-bold items-center text-foreground transition-colors duration-200 dark:text-zinc-50">
              Sp
              <Aperture
                size={23}
                strokeWidth={2}
                className="slow-spin text-primary"
              />
              tLight
            </h1>
          </div>
        </Link>

        {/* Desktop: nav links */}
        <ul className="hidden lg:flex items-center gap-5">
          {navLinks.map(({ href, label }) => (
            <li key={href}>
              <Link href={href} className={linkClass(href)}>
                {label}
              </Link>
            </li>
          ))}
        </ul>

        {/* Desktop: theme toggle + auth */}
        <div className="hidden lg:flex items-center gap-3">
          <ThemeToggle />
          {user ? (
            <div className="relative" ref={profileMenuRef}>
              <button
                type="button"
                onClick={() => setIsProfileOpen((prev) => !prev)}
                className="flex items-center gap-2 rounded-full border border-border py-1 pr-2 pl-1 transition-colors hover:border-primary/50 dark:border-zinc-800"
                aria-expanded={isProfileOpen}
                aria-haspopup="menu"
                aria-label="Open profile menu"
              >
                {user.image ? (
                  <img
                    src={user.image}
                    alt=""
                    className="size-8 rounded-full object-cover"
                  />
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
                    <p className="truncate text-sm font-semibold text-foreground">
                      {user.name}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {user.email}
                    </p>
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
            <>
              <Button
                variant="outline"
                nativeButton={false}
                render={<Link href="/login" />}
                className="transition-colors duration-200 dark:border-primary/60 dark:text-primary dark:hover:bg-primary/10"
              >
                Login
              </Button>
              <Button
                nativeButton={false}
                render={<Link href="/register" />}
                className="transition-colors duration-200"
              >
                Register
              </Button>
            </>
          )}
        </div>

        {/* Mobile: theme toggle + hamburger */}
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

      {/* Mobile: dropdown panel */}
      {isOpen && (
        <div className="lg:hidden border-t border-border bg-background transition-colors duration-200 dark:border-zinc-800 dark:bg-zinc-900">
          <div className="container mx-auto flex flex-col gap-4 px-4 py-4">
            <ul className="flex flex-col gap-1 text-sm">
              {navLinks.map(({ href, label }) => (
                <li key={href}>
                  <Link
                    href={href}
                    onClick={closeMenus}
                    className="block rounded-lg px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-primary/10 hover:text-primary dark:text-zinc-100 dark:hover:bg-zinc-800/70"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="flex flex-col gap-2 border-t border-border pt-4 dark:border-zinc-800">
              {user ? (
                <>
                  <div className="flex items-center gap-3 rounded-xl bg-muted/60 px-3 py-3 dark:bg-zinc-800/60">
                    {user.image ? (
                      <img
                        src={user.image}
                        alt=""
                        className="size-10 rounded-full object-cover"
                      />
                    ) : (
                      <span className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                        <UserRound className="size-5" />
                      </span>
                    )}
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold">
                        {user.name}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {user.email}
                      </p>
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
                  <Button
                    variant="outline"
                    className="text-destructive"
                    onClick={handleLogout}
                  >
                    <LogOut />
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="outline"
                    nativeButton={false}
                    render={<Link href="/login" onClick={closeMenus} />}
                    className="w-full dark:border-primary/60 dark:text-primary dark:hover:bg-primary/10"
                  >
                    Login
                  </Button>
                  <Button
                    nativeButton={false}
                    render={<Link href="/register" onClick={closeMenus} />}
                    className="w-full"
                  >
                    Register
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const Navbar = () => {
  return (
    <Suspense
      fallback={
        <div className="h-16 w-full border-b border-border bg-background/90" />
      }
    >
      <NavbarContent />
    </Suspense>
  );
};

export default Navbar;
