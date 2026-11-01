"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  ArrowRight,
  Calendar,
  Clock,
  Compass,
  LayoutDashboard,
  LoaderCircle,
  Plus,
  ShieldCheck,
  Store,
  UserRound,
} from "lucide-react";

import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export default function DashboardPage() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const user = session?.user;

  const [stats, setStats] = useState({
    myStudiosCount: 0,
    myBookingsCount: 0,
    pendingBookingsCount: 0,
  });
  const [isLoadingStats, setIsLoadingStats] = useState(true);

  useEffect(() => {
    if (!isPending && user?.email) {

      Promise.all([
        fetch(`${API_BASE}/all-studio`, { cache: "no-store" })
          .then((r) => r.json())
          .catch(() => []),
        fetch(`${API_BASE}/bookings?email=${encodeURIComponent(user.email)}`, { cache: "no-store" })
          .then((r) => r.json())
          .catch(() => []),
      ]).then(([studiosData, bookingsData]) => {
        const allStudios = Array.isArray(studiosData) ? studiosData : studiosData.studios ?? [];
        const userStudios = allStudios.filter(
          (s: { hostEmail?: string; ownerEmail?: string }) =>
            s.hostEmail?.toLowerCase() === user.email?.toLowerCase() ||
            s.ownerEmail?.toLowerCase() === user.email?.toLowerCase()
        );
        const allBookings = Array.isArray(bookingsData) ? bookingsData : [];
        const pendingBookings = allBookings.filter(
          (b: { status?: string }) => b.status === "Pending"
        );

        setStats({
          myStudiosCount: userStudios.length,
          myBookingsCount: allBookings.length,
          pendingBookingsCount: pendingBookings.length,
        });
        setIsLoadingStats(false);
      });
    }
  }, [user?.email, isPending]);

  if (isPending) {
    return (
      <div className="container mx-auto flex min-h-[60vh] items-center justify-center px-4">
        <LoaderCircle className="size-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto max-w-md px-4 py-24 text-center">
        <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-500">
          <AlertCircle className="size-7" />
        </div>
        <h2 className="mt-4 font-heading text-2xl font-bold">Sign In Required</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Please log in to your account to view your creator dashboard.
        </p>
        <Button
          nativeButton={false}
          render={<Link href="/login" />}
          className="mt-6 w-full"
        >
          Go to Login
        </Button>
      </div>
    );
  }

  return (
    <div className="bg-background pb-20">
      {/* Dashboard Header */}
      <section className="border-b border-border bg-muted/40 py-12 text-foreground dark:bg-zinc-950 dark:text-white sm:py-16">
        <div className="container mx-auto px-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              {user.image ? (
                <img
                  src={user.image}
                  alt={user.name || "User avatar"}
                  className="size-16 rounded-2xl border-2 border-primary object-cover shadow-sm sm:size-20"
                />
              ) : (
                <div className="flex size-16 items-center justify-center rounded-2xl border-2 border-primary/40 bg-primary/10 text-primary sm:size-20">
                  <UserRound className="size-8" />
                </div>
              )}
              <div>
                <div className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                  <ShieldCheck className="size-3.5" />
                  Verified Creator Account
                </div>
                <h1 className="mt-1 font-heading text-2xl font-bold sm:text-3xl">
                  {user.name || "Creator"}
                </h1>
                <p className="text-xs text-muted-foreground sm:text-sm">
                  {user.email}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Button
                nativeButton={false}
                render={<Link href="/add-studio" />}
                className="gap-1.5"
              >
                <Plus className="size-4" />
                Host New Space
              </Button>
              <Button
                variant="outline"
                nativeButton={false}
                render={<Link href="/studios" />}
                className="gap-1.5"
              >
                <Compass className="size-4" />
                Explore Studios
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Cards */}
      <main className="container mx-auto px-4 py-10">
        <h2 className="font-heading text-xl font-bold">Workspace &amp; Reservation Overview</h2>
        <div className="mt-4 grid gap-5 sm:grid-cols-3">
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                My Studio Listings
              </span>
              <span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Store className="size-5" />
              </span>
            </div>
            <p className="mt-4 font-heading text-3xl font-bold text-foreground">
              {isLoadingStats ? "-" : stats.myStudiosCount}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Spaces published for creators
            </p>
            <Link
              href="/my-listings"
              className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
            >
              Manage listings <ArrowRight className="size-3" />
            </Link>
          </div>

          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Total Bookings Made
              </span>
              <span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Calendar className="size-5" />
              </span>
            </div>
            <p className="mt-4 font-heading text-3xl font-bold text-foreground">
              {isLoadingStats ? "-" : stats.myBookingsCount}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              All reserved production sessions
            </p>
            <Link
              href="/my-bookings"
              className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
            >
              View bookings <ArrowRight className="size-3" />
            </Link>
          </div>

          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Pending Approvals
              </span>
              <span className="flex size-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500">
                <Clock className="size-5" />
              </span>
            </div>
            <p className="mt-4 font-heading text-3xl font-bold text-amber-500">
              {isLoadingStats ? "-" : stats.pendingBookingsCount}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Awaiting host confirmation
            </p>
            <Link
              href="/my-bookings"
              className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-amber-500 hover:underline"
            >
              Check pending slots <ArrowRight className="size-3" />
            </Link>
          </div>
        </div>

        {/* Quick Navigation Cards */}
        <h2 className="mt-12 font-heading text-xl font-bold">Quick Navigation</h2>
        <div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <Link
            href="/my-listings"
            className="group rounded-2xl border border-border bg-card p-5 shadow-sm transition hover:border-primary/50 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900"
          >
            <Store className="size-6 text-primary" />
            <h3 className="mt-3 font-semibold text-foreground group-hover:text-primary">
              My Studio Listings
            </h3>
            <p className="mt-1 text-xs text-muted-foreground">
              Edit, update, or remove your listed production spaces.
            </p>
          </Link>

          <Link
            href="/add-studio"
            className="group rounded-2xl border border-border bg-card p-5 shadow-sm transition hover:border-primary/50 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900"
          >
            <Plus className="size-6 text-primary" />
            <h3 className="mt-3 font-semibold text-foreground group-hover:text-primary">
              Add New Studio
            </h3>
            <p className="mt-1 text-xs text-muted-foreground">
              List a daylight studio, podcast lounge, or sound stage.
            </p>
          </Link>

          <Link
            href="/my-bookings"
            className="group rounded-2xl border border-border bg-card p-5 shadow-sm transition hover:border-primary/50 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900"
          >
            <Calendar className="size-6 text-primary" />
            <h3 className="mt-3 font-semibold text-foreground group-hover:text-primary">
              My Bookings
            </h3>
            <p className="mt-1 text-xs text-muted-foreground">
              Track reserved shoot times, download invoices and receipts.
            </p>
          </Link>

          <Link
            href="/studios"
            className="group rounded-2xl border border-border bg-card p-5 shadow-sm transition hover:border-primary/50 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900"
          >
            <Compass className="size-6 text-primary" />
            <h3 className="mt-3 font-semibold text-foreground group-hover:text-primary">
              Explore Studios
            </h3>
            <p className="mt-1 text-xs text-muted-foreground">
              Discover sound stages, cyc walls, and photo lofts.
            </p>
          </Link>
        </div>
      </main>
    </div>
  );
}

