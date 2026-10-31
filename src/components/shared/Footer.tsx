import Link from "next/link";
import { Aperture, ArrowRight } from "lucide-react";
import { Button } from "../ui/button";


const xIcon = (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="size-4">
    <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z" />
  </svg>
);

const instagramIcon = (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="size-4">
    <path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 1 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm7.846-10.405a1.441 1.441 0 0 1-2.88 0 1.44 1.44 0 0 1 2.88 0z" />
  </svg>
);

const youtubeIcon = (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="size-4">
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
  </svg>
);

const linkedinIcon = (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="size-4">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
  </svg>
);

const socialIconClass =
  "flex size-9 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors duration-200 hover:border-primary/50 hover:text-primary dark:border-zinc-800 dark:text-zinc-400 dark:hover:border-primary/50 dark:hover:text-primary";

const socialLinks = (
  <>
    <li>
      <a
        href="https://x.com/spotlight"
        aria-label="Spotlight on X"
        target="_blank"
        rel="noopener noreferrer"
        className={socialIconClass}
      >
        {xIcon}
      </a>
    </li>
    <li>
      <a
        href="https://instagram.com/spotlight"
        aria-label="Spotlight on Instagram"
        target="_blank"
        rel="noopener noreferrer"
        className={socialIconClass}
      >
        {instagramIcon}
      </a>
    </li>
    <li>
      <a
        href="https://youtube.com/@spotlight"
        aria-label="Spotlight on YouTube"
        target="_blank"
        rel="noopener noreferrer"
        className={socialIconClass}
      >
        {youtubeIcon}
      </a>
    </li>
    <li>
      <a
        href="https://linkedin.com/company/spotlight"
        aria-label="Spotlight on LinkedIn"
        target="_blank"
        rel="noopener noreferrer"
        className={socialIconClass}
      >
        {linkedinIcon}
      </a>
    </li>
  </>
);

const linkClass =
  "text-muted-foreground transition-colors duration-200 hover:text-primary dark:text-zinc-400 dark:hover:text-primary";

const quickLinks = (
  <>
    <li>
      <Link href="/" className={linkClass}>
        Home
      </Link>
    </li>
    <li>
      <Link href="/studios" className={linkClass}>
        Explore Studios
      </Link>
    </li>
    <li>
      <a href="#how-it-works" className={linkClass}>
        How it Works
      </a>
    </li>
    <li>
      <a href="#about-us" className={linkClass}>
        About Us
      </a>
    </li>
  </>
);

const categoryLinks = (
  <>
    <li>
      <Link
        href={{ pathname: "/studios", query: { category: "Photo Studio" } }}
        className={linkClass}
      >
        Photo Studios
      </Link>
    </li>
    <li>
      <Link
        href={{ pathname: "/studios", query: { category: "Sound Stage" } }}
        className={linkClass}
      >
        Sound Stages
      </Link>
    </li>
    <li>
      <Link
        href={{ pathname: "/studios", query: { category: "Podcast Lounge" } }}
        className={linkClass}
      >
        Podcast Lounges
      </Link>
    </li>
    <li>
      <Link
        href={{ pathname: "/studios", query: { category: "Music Suite" } }}
        className={linkClass}
      >
        Music Suites
      </Link>
    </li>
    <li>
      <Link
        href={{ pathname: "/studios", query: { category: "Art Workshop" } }}
        className={linkClass}
      >
        Art Workshops
      </Link>
    </li>
  </>
);

const legalLinks = (
  <>
    <li>
      <Link href="/privacy" className={linkClass}>
        Privacy Policy
      </Link>
    </li>
    <li>
      <Link href="/terms" className={linkClass}>
        Terms of Service
      </Link>
    </li>
  </>
);

const Footer = () => {
  return (
    <footer className="border-t border-border bg-background transition-colors duration-200 dark:border-zinc-800 dark:bg-zinc-950">
      <div className="container mx-auto px-4 py-12">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
      
          <div>
            <Link href="/">
              <h2 className="flex items-center text-3xl font-bold text-foreground transition-colors duration-200 dark:text-zinc-100 sm:text-4xl">
                Sp
                <Aperture
                  size={28}
                  strokeWidth={2}
                  className="slow-spin text-primary"
                />
                tLight
              </h2>
            </Link>
            <p className="mt-4 max-w-xs text-sm text-muted-foreground transition-colors duration-200 dark:text-zinc-400">
              Spotlight connects photographers, filmmakers, and poetasters with
              high-quality production spaces built for their craft. From photo
              studios to sound stages, find the perfect space and bring your
              next project to life.
            </p>
          </div>

         
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-foreground transition-colors duration-200 dark:text-zinc-100">
              Quick Links
            </h3>
            <ul className="mt-4 space-y-3 text-sm">{quickLinks}</ul>
          </div>

          
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-foreground transition-colors duration-200 dark:text-zinc-100">
              Studio Categories
            </h3>
            <ul className="mt-4 space-y-3 text-sm">{categoryLinks}</ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-foreground transition-colors duration-200 dark:text-zinc-100">
              Stay in the Spotlight
            </h3>
            <p className="mt-4 text-sm text-muted-foreground transition-colors duration-200 dark:text-zinc-400">
              Get new studio listings and creative tips straight to your inbox.
            </p>
            <form className="mt-4 flex gap-2">
              <label htmlFor="newsletter-email" className="sr-only">
                Email address
              </label>
              <input
                id="newsletter-email"
                type="email"
                name="email"
                required
                placeholder="you@example.com"
                className="h-9 min-w-0 w-full rounded-lg border border-border bg-transparent px-3 text-sm outline-none transition-colors duration-200 placeholder:text-muted-foreground focus-visible:border-primary focus-visible:ring-3 focus-visible:ring-primary/30 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:focus-visible:border-primary dark:focus-visible:ring-primary"
              />
              <Button
                type="submit"
                size="lg"
                className="transition-colors duration-200"
              >
                Subscribe
                <ArrowRight />
              </Button>
            </form>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center gap-5 border-t border-border pt-6 transition-colors duration-200 dark:border-zinc-800 sm:flex-row sm:justify-between">
          <ul className="flex gap-2">{socialLinks}</ul>
          <p className="text-sm text-muted-foreground transition-colors duration-200 dark:text-zinc-500">
            &copy; 2026 Spotlight. All rights reserved.
          </p>
          <ul className="flex gap-4 text-sm">{legalLinks}</ul>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
