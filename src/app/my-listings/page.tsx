"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Building2,
  Loader2,
  MapPin,
  Pencil,
  Plus,
  RefreshCw,
  Trash2,
} from "lucide-react";

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
import { toast } from "@/components/ui/toast";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

type Studio = {
  _id: string;
  title: string;
  category: string;
  hourlyRate: number;
  location: string;
  imageUrl: string;
  securityDeposit?: number;
  capacity?: number;
};

const MyListingsPage = () => {
  const [studios, setStudios] = useState<Studio[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [deleteTarget, setDeleteTarget] = useState<Studio | null>(null);

  useEffect(() => {
    let ignore = false;

    fetch(`${API_BASE}/all-studio`, { cache: "no-store" })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Request failed with status ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        if (ignore) return;
        setStudios(Array.isArray(data) ? data : []);
        setError(null);
        setIsLoading(false);
      })
      .catch((err: unknown) => {
        if (ignore) return;
        setError(
          err instanceof Error ? err.message : "Could not load your studios.",
        );
        setIsLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, [reloadKey]);

  const retry = () => {
    setIsLoading(true);
    setError(null);
    setReloadKey((key) => key + 1);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;

    const deletedTitle = deleteTarget.title;
    try {
      const response = await fetch(`/api/studios/${deleteTarget._id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Studio could not be deleted.");

      setStudios((prev) =>
        prev.filter((studio) => studio._id !== deleteTarget._id),
      );
      setDeleteTarget(null);
      toast.add({
        type: "success",
        title: "Studio deleted",
        description: `"${deletedTitle}" has been removed from your listings.`,
      });
    } catch (requestError) {
      toast.add({
        type: "error",
        title: "Could not delete studio",
        description: requestError instanceof Error ? requestError.message : "Please try again.",
      });
    }
  };

  return (
    <main className="container mx-auto max-w-6xl px-4 py-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
            My Studio Listings
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {isLoading
              ? "Loading your studios..."
              : `${studios.length} ${
                  studios.length === 1 ? "studio" : "studios"
                } listed`}
          </p>
        </div>

        <Button
          size="lg"
          nativeButton={false}
          render={<Link href="/add-studio" />}
        >
          <Plus />
          Add New Studio
        </Button>
      </div>

      {isLoading && (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2].map((item) => (
            <div
              key={item}
              className="overflow-hidden rounded-xl border border-border dark:border-zinc-800"
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
        <div className="mt-16 flex flex-col items-center justify-center gap-4 text-center">
          <div className="flex size-14 items-center justify-center rounded-full bg-destructive/10 text-destructive">
            <RefreshCw className="size-6" />
          </div>
          <div>
            <h2 className="font-semibold text-foreground">
              Could not load studios
            </h2>
            <p className="mt-1 max-w-md text-sm text-muted-foreground">
              {error}. Make sure your backend is running on {API_BASE}.
            </p>
          </div>
          <Button variant="outline" onClick={retry}>
            <RefreshCw />
            Try again
          </Button>
        </div>
      )}

  
      {!isLoading && !error && studios.length === 0 && (
        <div className="mt-16 flex flex-col items-center justify-center gap-4 text-center">
          <div className="flex size-14 items-center justify-center rounded-full bg-muted text-muted-foreground dark:bg-zinc-900">
            <Building2 className="size-7" />
          </div>
          <div>
            <h2 className="font-semibold text-foreground">No studios yet</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              List your first production space and start taking bookings.
            </p>
          </div>
          <Button nativeButton={false} render={<Link href="/add-studio" />}>
            <Plus />
            Add New Studio
          </Button>
        </div>
      )}

    
      {!isLoading && !error && studios.length > 0 && (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {studios.map((studio) => (
            <Card
              key={studio._id}
              className="gap-0 overflow-hidden py-0 transition-shadow duration-200 hover:shadow-md dark:bg-zinc-900 dark:ring-zinc-800"
            >
              <div
                role="img"
                aria-label={studio.title}
                className="h-44 w-full bg-zinc-900 bg-cover bg-center bg-no-repeat"
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
                  <MapPin className="size-3.5 shrink-0" />
                  {studio.location}
                </p>

                <p className="mt-3 text-sm text-muted-foreground">
                  <span className="text-lg font-semibold text-foreground">
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
                >
                  <Pencil />
                  Update
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  className="ml-auto"
                  onClick={() => setDeleteTarget(studio)}
                >
                  <Trash2 />
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
              &quot;{deleteTarget?.title}&quot; will be permanently removed from
              your listings. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              <Trash2 />
              Delete Studio
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

  
      {isLoading && (
        <span className="sr-only">
          <Loader2 className="animate-spin" />
          Loading
        </span>
      )}
    </main>
  );
};

export default MyListingsPage;
