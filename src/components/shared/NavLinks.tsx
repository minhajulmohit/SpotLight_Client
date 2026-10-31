"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navLinkClass = (isActive: boolean) =>
  `relative py-2 text-sm font-medium tracking-wide transition-colors duration-200 after:absolute after:right-0 after:bottom-0 after:left-0 after:h-0.5 after:origin-left after:rounded-full after:bg-primary after:transition-transform ${
    isActive
      ? "text-primary after:scale-x-100"
      : "text-muted-foreground after:scale-x-0 hover:text-foreground hover:after:scale-x-100 dark:text-zinc-400 dark:hover:text-primary"
  }`;

function NavLinksList({
  pathname,
  onNavigate,
}: {
  pathname?: string;
  onNavigate?: () => void;
}) {
  return (
    <>
      <Link
        href="/"
        className={navLinkClass(pathname === "/")}
        onClick={onNavigate}
      >
        <li>Home</li>
      </Link>
      <Link
        href="/studios"
        className={navLinkClass(pathname === "/studios")}
        onClick={onNavigate}
      >
        <li>Explore Studios</li>
      </Link>
      <Link href="/#how-it-works" className={navLinkClass(false)} onClick={onNavigate}>
        <li>How it Works</li>
      </Link>
      <Link href="/#about-us" className={navLinkClass(false)} onClick={onNavigate}>
        <li>About Us</li>
      </Link>
    </>
  );
}

/**
 * Reads the pathname to highlight the active link. Kept in its own component
 * so the root Navbar can wrap it in a Suspense boundary (required by Next.js
 * Cache Components for routes with dynamic params).
 */
export function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return <NavLinksList pathname={pathname} onNavigate={onNavigate} />;
}

/** Static nav links used as the Suspense fallback. */
export function NavLinksFallback() {
  return <NavLinksList />;
}
