import type { Metadata } from "next";
import { Suspense } from "react";
import { Oswald, Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/shared/Navbar";
import Footer from "@/components/shared/Footer";
import AuthTokenSync from "@/components/shared/AuthTokenSync";
import ThemeProvider from "@/providers/ThemeProvider";
import WishlistProvider from "@/providers/WishlistProvider";
import { Toaster } from "@/components/ui/toast";
import { Toaster as SonnerToaster } from "sonner";

const oswald = Oswald({
  variable: "--font-heading",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-body",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SpotLight — Creative Studio & Production Space Marketplace",
  description:
    "Discover and book photo studios, sound stages, podcast lounges, music suites, and art workshops from trusted hosts — or list your own creative space.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem("theme");var d=t==="dark"||(t!=="light"&&window.matchMedia("(prefers-color-scheme: dark)").matches);document.documentElement.classList.toggle("dark",d);}catch(e){}})();`,
          }}
        />
      </head>
      <body
        className={`${oswald.variable} ${inter.variable} min-h-screen antialiased font-sans flex flex-col`}
      >
        <ThemeProvider>
          <WishlistProvider>
            <AuthTokenSync />
            <Suspense
              fallback={
                <div className="h-16 w-full border-b border-border bg-background" />
              }
            >
              <Navbar />
            </Suspense>

            <main className="flex-1">{children}</main>
            <Footer />
          </WishlistProvider>
          <Toaster />
          <SonnerToaster position="top-right" richColors closeButton />
        </ThemeProvider>
      </body>
    </html>
  );
}
