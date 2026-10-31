"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Filter, RotateCcw, Search, SlidersHorizontal } from "lucide-react";

import StudioCard, {
  type StudioCardData,
} from "@/components/studios/StudioCard";
import { Button } from "@/components/ui/button";

const DEFAULT_CATEGORIES = [
  "Photo Studio",
  "Sound Stage",
  "Podcast Lounge",
  "Music Suite",
  "Art Workshop",
];

const toStudioList = (
  data: StudioCardData[] | { studios?: StudioCardData[] },
) => (Array.isArray(data) ? data : data.studios ?? []);

const normalizeCategory = (value: string) => {
  const trimmed = value.trim().toLowerCase();
  if (trimmed === "workshop" || trimmed === "workshops") return "art workshop";
  return trimmed
    .replace(/&/g, "and")
    .replace(/[-_/]/g, " ")
    .replace(/\b(photos?|studios?|rooms?|lounges?|stages?|suites?|workshops?)\b/g, (word) =>
      word,
    )
    .replace(/\s+/g, " ");
};

const categoriesMatch = (studioCategory: string, selectedCategory: string) => {
  if (!selectedCategory) return true;
  const studio = normalizeCategory(studioCategory);
  const selected = normalizeCategory(selectedCategory);
  const aliases: Record<string, string[]> = {
    "photo studio": ["photo studios", "photo", "photography studio", "photography studios"],
    "sound stage": ["film video", "sound stages", "film studio", "video studio"],
    "podcast lounge": ["podcast rooms", "podcast", "podcast studio"],
    "music suite": ["recording studios", "music suites", "recording studio", "music studio"],
    "art workshop": ["creative offices", "live events", "art workshops", "creative office"],
  };
  return (
    studio === selected ||
    studio.includes(selected) ||
    selected.includes(studio) ||
    (aliases[studio] ?? []).includes(selected)
  );
};

const StudiosContent = () => {
  const searchParams = useSearchParams();
  const [studios, setStudios] = useState<StudioCardData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState(searchParams.get("search") ?? "");
  const [category, setCategory] = useState(searchParams.get("category") ?? "");
  const [location, setLocation] = useState(searchParams.get("location") ?? "");
  const [maxRate, setMaxRate] = useState(searchParams.get("maxRate") ?? "");
  const [minRating, setMinRating] = useState(searchParams.get("rating") ?? "");
  const [sort, setSort] = useState("recommended");
  const [showFilters, setShowFilters] = useState(false);

  // Sync state when URL search params change (e.g. clicking category link from Home)
  useEffect(() => {
    setCategory(searchParams.get("category") ?? "");
    setSearch(searchParams.get("search") ?? "");
    setLocation(searchParams.get("location") ?? "");
    setMaxRate(searchParams.get("maxRate") ?? "");
    setMinRating(searchParams.get("rating") ?? "");
  }, [searchParams]);

  useEffect(() => {
    const controller = new AbortController();

    fetch("/api/studios", { signal: controller.signal, cache: "no-store" })
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.message ?? "Studios could not be loaded.");
        }
        setStudios(toStudioList(data));
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
            : "Studios could not be loaded.",
        );
      })
      .finally(() => setIsLoading(false));

    return () => controller.abort();
  }, []);

  const categories = useMemo(() => {
    const sanitized = studios
      .map((studio) => {
        const cat = studio.category?.trim();
        if (!cat) return "";
        if (cat.toLowerCase() === "workshop" || cat.toLowerCase() === "workshops") {
          return "Art Workshop";
        }
        return cat;
      })
      .filter(Boolean);

    return [...new Set([...DEFAULT_CATEGORIES, ...sanitized])].sort();
  }, [studios]);

  const filteredStudios = useMemo(() => {
    const query = search.trim().toLowerCase();
    const selectedLocation = location.trim().toLowerCase();
    const rateLimit = Number(maxRate);
    const ratingLimit = Number(minRating);

    const result = studios.filter((studio) => {
      const rate = studio.hourlyRate ?? studio.rate ?? 0;
      const rating = studio.rating ?? 0;
      return (
        (!query ||
          `${studio.title} ${studio.category} ${studio.location}`
            .toLowerCase()
            .includes(query)) &&
        categoriesMatch(studio.category, category) &&
        (!selectedLocation ||
          studio.location.toLowerCase().includes(selectedLocation)) &&
        (!rateLimit || rate <= rateLimit) &&
        (!ratingLimit || rating >= ratingLimit)
      );
    });

    return [...result].sort((first, second) => {
      if (sort === "price-low") {
        return (
          (first.hourlyRate ?? first.rate ?? 0) -
          (second.hourlyRate ?? second.rate ?? 0)
        );
      }
      if (sort === "price-high") {
        return (
          (second.hourlyRate ?? second.rate ?? 0) -
          (first.hourlyRate ?? first.rate ?? 0)
        );
      }
      if (sort === "rating") {
        return (second.rating ?? 0) - (first.rating ?? 0);
      }
      return 0;
    });
  }, [category, location, maxRate, minRating, search, sort, studios]);

  const resetFilters = () => {
    setSearch("");
    setCategory("");
    setLocation("");
    setMaxRate("");
    setMinRating("");
    setSort("recommended");
  };

  return (
    <div className="bg-background pb-20">
      <section className="border-b border-border bg-muted/40 py-14 text-foreground dark:bg-zinc-950 dark:text-white sm:py-20">
        <div className="container mx-auto px-4">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">
            Find your creative space
          </p>
          <h1 className="mt-3 font-heading text-4xl font-bold sm:text-5xl">
            Explore studios
          </h1>
          <p className="mt-4 max-w-2xl text-muted-foreground dark:text-zinc-300">
            Discover production-ready spaces for photography, film, music,
            podcasts, workshops, and events.
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 py-10">
        <div className="grid gap-4 lg:grid-cols-[minmax(240px,1fr)_180px_180px_auto]">
          <label className="relative">
            <span className="sr-only">Search studios</span>
            <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search studio, category, or keyword"
              className="h-11 w-full rounded-lg border border-border bg-background pr-3 pl-10 outline-none focus:border-amber-400 dark:border-zinc-800 dark:bg-zinc-900"
            />
          </label>
          <input
            value={location}
            onChange={(event) => setLocation(event.target.value)}
            placeholder="Location"
            className="h-11 rounded-lg border border-border bg-background px-3 outline-none focus:border-amber-400 dark:border-zinc-800 dark:bg-zinc-900"
          />
          <select
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            className="h-11 rounded-lg border border-border bg-background px-3 outline-none focus:border-amber-400 dark:border-zinc-800 dark:bg-zinc-900"
          >
            <option value="">All categories</option>
            {categories.map((item) => (
              <option key={item} value={item}>{item}</option>
            ))}
          </select>
          <Button
            type="button"
            variant="outline"
            onClick={() => setShowFilters((visible) => !visible)}
            className="h-11"
          >
            <SlidersHorizontal />
            Filters
          </Button>
        </div>

        {showFilters && (
          <div className="mt-4 grid gap-4 rounded-xl border border-border bg-card p-4 dark:border-zinc-800 dark:bg-zinc-900 sm:grid-cols-2 lg:grid-cols-4">
            <label className="space-y-2 text-sm font-medium">
              Maximum hourly rate
              <input
                type="number"
                min="0"
                value={maxRate}
                onChange={(event) => setMaxRate(event.target.value)}
                placeholder="Any price"
                className="h-10 w-full rounded-lg border border-border bg-background px-3 dark:border-zinc-800 dark:bg-zinc-900"
              />
            </label>
            <label className="space-y-2 text-sm font-medium">
              Minimum rating
              <select
                value={minRating}
                onChange={(event) => setMinRating(event.target.value)}
                className="h-10 w-full rounded-lg border border-border bg-background px-3 dark:border-zinc-800 dark:bg-zinc-900"
              >
                <option value="">Any rating</option>
                <option value="4">4+ stars</option>
                <option value="4.5">4.5+ stars</option>
              </select>
            </label>
            <label className="space-y-2 text-sm font-medium">
              Sort by
              <select
                value={sort}
                onChange={(event) => setSort(event.target.value)}
                className="h-10 w-full rounded-lg border border-border bg-background px-3 dark:border-zinc-800 dark:bg-zinc-900"
              >
                <option value="recommended">Recommended</option>
                <option value="rating">Highest rated</option>
                <option value="price-low">Price: low to high</option>
                <option value="price-high">Price: high to low</option>
              </select>
            </label>
            <Button
              type="button"
              variant="ghost"
              onClick={resetFilters}
              className="h-10 self-end text-muted-foreground"
            >
              <RotateCcw />
              Reset filters
            </Button>
          </div>
        )}

        <div className="mt-8 flex items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            {isLoading
              ? "Loading studios..."
              : `${filteredStudios.length} ${filteredStudios.length === 1 ? "studio" : "studios"} available`}
          </p>
          <div className="hidden items-center gap-2 text-sm text-muted-foreground sm:flex">
            <Filter className="size-4" />
            Refine your search
          </div>
        </div>

        {isLoading && (
          <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="overflow-hidden rounded-xl border border-border dark:border-zinc-800">
                <div className="aspect-video animate-pulse bg-zinc-200 dark:bg-zinc-800" />
                <div className="space-y-3 p-5">
                  <div className="h-5 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
                  <div className="h-4 w-2/3 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
                  <div className="h-9 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
                </div>
              </div>
            ))}
          </div>
        )}

        {!isLoading && error && (
          <div className="mt-6 rounded-xl border border-destructive/30 bg-destructive/5 p-10 text-center text-sm text-destructive">{error}</div>
        )}

        {!isLoading && !error && filteredStudios.length === 0 && (
          <div className="mt-6 rounded-xl border border-dashed border-border p-12 text-center dark:border-zinc-800">
            <p className="font-heading text-xl font-semibold">No matching studios</p>
            <p className="mt-2 text-sm text-muted-foreground">Try adjusting or resetting your filters.</p>
            <Button type="button" variant="outline" onClick={resetFilters} className="mt-5">Reset filters</Button>
          </div>
        )}

        {!isLoading && !error && filteredStudios.length > 0 && (
          <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredStudios.map((studio) => (
              <StudioCard
                key={studio._id ?? studio.id ?? studio.title}
                studio={studio}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const StudiosPage = () => (
  <Suspense fallback={<div className="container mx-auto px-4 py-20">Loading studios...</div>}>
    <StudiosContent />
  </Suspense>
);

export default StudiosPage;
