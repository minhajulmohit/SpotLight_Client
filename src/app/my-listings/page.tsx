"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  Building2,
  LoaderCircle,
  MapPin,
  Pencil,
  Plus,
  RefreshCw,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";

import { authClient } from "@/lib/auth-client";
import { apiFetch } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type Studio = {
  _id: string;
  title: string;
  category: string;
  hourlyRate: number;
  location: string;
  imageUrl: string;
  securityDeposit?: number;
  capacity?: number;
  ownerEmail?: string;
};

const MyListingsPage = () => {
  const { data: session, isPending: isAuthPending } = authClient.useSession();
  const user = session?.user;
  const userEmail = user?.email;

  const [studios, setStudios] = useState<Studio[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [deleteTarget, setDeleteTarget] = useState<Studio | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const fetchStudios = async () => {
      setIsLoading(true);

      try {
        const response = await apiFetch("/api/studios");

        if (!response.ok) {
          throw new Error(`Request failed with status ${response.status}`);
        }

        const data = await response.json();

        if (isMounted) {
          setStudios(Array.isArray(data) ? data : []);
          setError(null);
        }
      } catch (err: unknown) {
        if (isMounted) {
          const message =
            err instanceof Error ? err.message : "Could not load your studios.";
          setError(message);
        }
      } finally {
       
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchStudios();

  
    return () => {
      isMounted = false;
    };
  }, [reloadKey]);


  const myListings = useMemo(() => {
    if (!userEmail) return [];
    const currentEmail = userEmail.trim().toLowerCase();
    return studios.filter((studio) => {
      const studioEmail = (studio.ownerEmail || "").trim().toLowerCase();
      return studioEmail === currentEmail;
    });
  }, [studios, userEmail]);

  const retry = () => {
    setIsLoading(true);
    setError(null);
    setReloadKey((key) => key + 1);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;

    setIsDeleting(true);
    const deletedTitle = deleteTarget.title;
    try {
      const response = await apiFetch(`/api/studios/${deleteTarget._id}`, {
        method: "DELETE",
      });
      const data = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(
          data?.message ?? data?.msg ?? "Studio could not be deleted.",
        );
      }

      setStudios((prev) =>
        prev.filter((studio) => studio._id !== deleteTarget._id),
      );
      setDeleteTarget(null);
      toast.success(`"${deletedTitle}" has been deleted successfully.`);
    } catch (requestError) {
      toast.error(
        requestError instanceof Error
          ? requestError.message
          : "Please try again.",
      );
    } finally {
      setIsDeleting(false);
    }
  };

  if (isAuthPending) {
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
        <h2 className="mt-4 font-heading text-2xl font-bold">
          Sign In Required
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Please log in to your account to view and manage your studio listings.
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
   
      <section className="border-b border-border bg-muted/40 py-12 text-foreground dark:bg-zinc-950 dark:text-white sm:py-16">
        <div className="container mx-auto px-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">
                Owner Management
              </p>
              <h1 className="mt-2 font-heading text-3xl font-bold sm:text-4xl">
                My Studio Listings
              </h1>
              <p className="mt-1 text-sm text-muted-foreground dark:text-zinc-300">
                {isLoading
                  ? "Loading your studios..."
                  : `${myListings.length} ${
                      myListings.length === 1 ? "studio" : "studios"
                    } listed by you`}
              </p>
            </div>

            <Button
              size="lg"
              nativeButton={false}
              render={<Link href="/add-studio" />}
              className="gap-2 self-start sm:self-auto"
            >
              <Plus className="size-4" />
              Add New Studio
            </Button>
          </div>
        </div>
      </section>

      <main className="container mx-auto max-w-6xl px-4 py-10">
        {isLoading && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[0, 1, 2].map((item) => (
              <div
                key={item}
                className="overflow-hidden rounded-xl border border-border bg-card dark:border-zinc-800 dark:bg-zinc-900"
              >
                <div className="h-44 w-full animate-pulse bg-muted dark:bg-zinc-800" />
                <div className="space-y-3 p-4">
                  <div className="h-4 w-3/4 animate-pulse rounded bg-muted dark:bg-zinc-800" />
                  <div className="h-3 w-1/2 animate-pulse rounded bg-muted dark:bg-zinc-800" />
                  <div className="h-3 w-1/3 animate-pulse rounded bg-muted dark:bg-zinc-800" />
                </div>
              </div>
            ))}
          </div>
        )}

        {!isLoading && error && (
          <div className="mt-12 flex flex-col items-center justify-center gap-4 text-center">
            <div className="flex size-14 items-center justify-center rounded-full bg-destructive/10 text-destructive">
              <RefreshCw className="size-6" />
            </div>
            <div>
              <h2 className="font-semibold text-foreground">
                Could not load studios
              </h2>
              <p className="mt-1 max-w-md text-sm text-muted-foreground">
                {error}. Make sure your backend is running.
              </p>
            </div>
            <Button variant="outline" onClick={retry}>
              <RefreshCw className="size-4" />
              Try again
            </Button>
          </div>
        )}

        {!isLoading && !error && myListings.length === 0 && (
          <div className="rounded-2xl border border-dashed border-border p-12 text-center dark:border-zinc-800">
            <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Building2 className="size-7" />
            </div>
            <h2 className="mt-4 font-heading text-2xl font-bold text-foreground">
              No Studio Listings Yet
            </h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
              You haven&apos;t listed any studios under your account (
              {user.email}). Publish your first creative space to start listing!
            </p>
            <Button
              nativeButton={false}
              render={<Link href="/add-studio" />}
              className="mt-6 gap-2"
            >
              <Plus className="size-4" />
              List Your First Studio
            </Button>
          </div>
        )}

        {!isLoading && !error && myListings.length > 0 && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {myListings.map((studio) => (
              <Card
                key={studio._id}
                className="gap-0 overflow-hidden py-0 transition-shadow duration-200 hover:shadow-md dark:bg-zinc-900 dark:ring-zinc-800"
              >
                <div
                  role="img"
                  aria-label={studio.title}
                  className="h-44 w-full bg-muted bg-cover bg-center bg-no-repeat dark:bg-zinc-800"
                  style={{ backgroundImage: `url('${studio.imageUrl}')` }}
                />

                <CardContent className="flex flex-1 flex-col p-4">
                  <div className="flex items-start justify-between gap-2">
                    <h2 className="truncate font-semibold text-foreground">
                      {studio.title}
                    </h2>
                    <Badge
                      variant="outline"
                      className="shrink-0 border-primary/30 bg-primary/10 text-primary"
                    >
                      {studio.category}
                    </Badge>
                  </div>

                  <p className="mt-2 flex items-center gap-1 text-sm text-muted-foreground">
                    <MapPin className="size-3.5 shrink-0 text-primary" />
                    {studio.location}
                  </p>

                  <p className="mt-3 text-sm text-muted-foreground">
                    <span className="text-lg font-semibold text-foreground font-heading">
                      ${studio.hourlyRate}
                    </span>
                    /hr
                  </p>
                </CardContent>

                <div className="flex items-center gap-2 border-t border-border p-4 dark:border-zinc-800">
                  <Button
                    variant="outline"
                    size="sm"
                    nativeButton={false}
                    render={<Link href={`/studios/edit/${studio._id}`} />}
                    className="gap-1.5"
                  >
                    <Pencil className="size-3.5" />
                    Update
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    className="ml-auto gap-1.5"
                    onClick={() => setDeleteTarget(studio)}
                  >
                    <Trash2 className="size-3.5" />
                    Delete
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}

        
        <Dialog
          open={deleteTarget !== null}
          onOpenChange={(open) => {
            if (!open) setDeleteTarget(null);
          }}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete this studio?</DialogTitle>
              <DialogDescription>
                &quot;{deleteTarget?.title}&quot; will be permanently removed
                from your listings in MongoDB. This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                disabled={isDeleting}
                onClick={() => setDeleteTarget(null)}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                disabled={isDeleting}
                onClick={handleDelete}
                className="gap-1.5"
              >
                {isDeleting ? (
                  <LoaderCircle className="size-4 animate-spin" />
                ) : (
                  <Trash2 className="size-4" />
                )}
                Confirm Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
};

export default MyListingsPage;
