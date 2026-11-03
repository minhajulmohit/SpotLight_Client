import Link from "next/link";
import { ArrowRight } from "lucide-react";

import StudioCard, {
  type StudioCardData,
} from "@/components/studios/StudioCard";

const backendUrl = process.env.NEXT_PUBLIC_API_URL;

export const FeaturedStudiosSkeleton = () => (
  <section className="bg-background py-20 sm:py-24">
    <div className="container mx-auto px-4">
      <div className="mb-10 space-y-3">
        <div className="h-4 w-32 animate-pulse rounded bg-muted" />
        <div className="h-10 w-72 max-w-full animate-pulse rounded bg-muted" />
        <div className="h-5 w-96 max-w-full animate-pulse rounded bg-muted" />
      </div>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }, (_, index) => (
          <div
            key={index}
            className="overflow-hidden rounded-xl border border-border bg-card dark:border-zinc-800 dark:bg-zinc-900"
          >
            <div className="aspect-video animate-pulse bg-muted" />
            <div className="space-y-4 p-5">
              <div className="h-5 w-3/4 animate-pulse rounded bg-muted" />
              <div className="h-4 w-1/2 animate-pulse rounded bg-muted" />
              <div className="h-8 w-1/3 animate-pulse rounded bg-muted" />
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

const FeaturedStudios = async () => {
  let studios: StudioCardData[] = [];
  let error: string | null = null;

  try {
    const response = await fetch(`${backendUrl}/featured-studio`, {
      next: { revalidate: 60 },
    });

    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`);
    }

    const data = (await response.json()) as
      | StudioCardData[]
      | { studios?: StudioCardData[] };
    studios = (Array.isArray(data) ? data : (data.studios ?? [])).slice(0, 6);
  } catch (requestError: unknown) {
    error =
      requestError instanceof Error
        ? requestError.message
        : "Could not load featured studios.";
  }

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

        {error && (
          <div className="rounded-xl border border-destructive/30 bg-destructive/5 px-5 py-10 text-center text-sm text-destructive">
            {error}
          </div>
        )}

        {!error && studios.length === 0 && (
          <div className="rounded-xl border border-dashed border-border px-5 py-10 text-center text-muted-foreground dark:border-zinc-800">
            Featured studios are not available yet.
          </div>
        )}

        {!error && studios.length > 0 && (
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
