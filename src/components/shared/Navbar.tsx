"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "../ui/button";
import { Aperture, Menu, X } from "lucide-react";
import ThemeToggle from "./ThemeToggle";

const navLinkClass = (isActive: boolean) =>
  `transition-colors duration-200 ${
    isActive
      ? "text-primary"
      : "text-foreground hover:text-primary dark:text-zinc-400 dark:hover:text-primary"
  }`;

const navLinks = (pathname: string) => (
  <>
    <Link href={"/"} className={navLinkClass(pathname === "/")}>
      <li>Home</li>
    </Link>
    <Link
      href={"/studios"}
      className={navLinkClass(pathname === "/studios")}
    >
      <li>Explore Studios</li>
    </Link>
    <a href="#how-it-works" className={navLinkClass(false)}>
      <li>How it Works</li>
    </a>
    <a href="#about-us" className={navLinkClass(false)}>
      <li>About Us</li>
    </a>
  </>
);

const buttons = (
  <>
    <Button
      variant="outline"
      className="transition-colors duration-200 dark:border-primary/60 dark:text-primary dark:hover:bg-primary/10"
    >
      Login
    </Button>
    <Button className="transition-colors duration-200">Register</Button>
  </>
);

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  return (
    <div className="border-b border-border sticky top-0 z-50 bg-background/90 backdrop-blur-md supports-backdrop-filter:bg-background/60 transition-colors duration-200 dark:border-zinc-800/80 dark:bg-zinc-950/80">
      {" "}
      <div className=" container mx-auto px-4 py-2 flex items-center justify-between ">
        <Link href={"/"}>
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
          {navLinks(pathname)}
        </ul>

        {/* Desktop: buttons + theme toggle */}
        <div className="hidden lg:flex items-center gap-3">
          <ThemeToggle />
          {buttons}
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
              {navLinks(pathname)}
            </ul>
            <div className="flex flex-col gap-2 border-t border-border pt-4 transition-colors duration-200 dark:border-zinc-800 [&_button]:w-full">
              {buttons}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Navbar;
