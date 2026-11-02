"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import StudioCard, {
  type StudioCardData,
} from "@/components/studios/StudioCard";
import { API_BASE } from "@/lib/api";

const FeaturedStudios = () => {
  const [studios, setStudios] = useState<StudioCardData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    fetch(`${API_BASE}/featured-studio`, { signal: controller.signal })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Request failed with status ${response.status}`);
        }
        return response.json();
      })
      .then((data: StudioCardData[] | { studios?: StudioCardData[] }) => {
        const studiosData = Array.isArray(data) ? data : data.studios ?? [];
        setStudios(studiosData.slice(0, 6));
      })
      .catch((requestError: unknown) => {
        if (
          requestError instanceof DOMException &&
          requestError.name === "AbortError"
        ) {
          return;
        }
        setError(
          requestError instanceof Error
            ? requestError.message
            : "Could not load featured studios.",
        );
      })
      .finally(() => setIsLoading(false));

    return () => controller.abort();
  }, []);

  return (
    <section className="bg-background py-20 sm:py-24">
      <div className="container mx-auto px-4">
        <div className="mb-10 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mb-3 text-xs font-semibold tracking-[0.22em] text-primary uppercase">
              Featured spaces
            </p>
            <h2 className="font-heading text-3xl font-bold text-foreground sm:text-4xl">
              Featured creative spaces
            </h2>
            <p className="mt-3 max-w-xl text-muted-foreground">
              Book remarkable studios trusted by photographers, filmmakers and
              sound artists.
            </p>
          </div>
          <Link
            href="/studios"
            className="group inline-flex items-center gap-2 text-sm font-semibold text-primary"
          >
            View all studios
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {isLoading && (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="overflow-hidden rounded-xl border border-border bg-card dark:border-zinc-800 dark:bg-zinc-900"
              >
                <div className="aspect-video animate-pulse bg-zinc-200 dark:bg-zinc-800" />
                <div className="space-y-4 p-5">
                  <div className="h-5 w-3/4 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
                  <div className="h-4 w-1/2 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
                  <div className="h-8 w-1/3 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
                  <div className="h-9 animate-pulse rounded-lg bg-zinc-200 dark:bg-zinc-800" />
                </div>
              </div>
            ))}
          </div>
        )}

        {error && !isLoading && (
          <div className="rounded-xl border border-destructive/30 bg-destructive/5 px-5 py-10 text-center text-sm text-destructive">
            {error}
          </div>
        )}

        {!isLoading && !error && studios.length === 0 && (
          <div className="rounded-xl border border-dashed border-border px-5 py-10 text-center text-muted-foreground dark:border-zinc-800">
            Featured studios are not available yet.
          </div>
        )}

        {!isLoading && !error && studios.length > 0 && (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {studios.map((studio) => (
              <StudioCard
                key={studio._id ?? studio.id ?? studio.title}
                studio={studio}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default FeaturedStudios;
