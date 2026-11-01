"use client";

import Link from "next/link";
import { Heart, MapPin, Star } from "lucide-react";

import { useWishlist } from "@/providers/WishlistProvider";
import { Button } from "@/components/ui/button";

export type StudioCardData = {
  _id?: string;
  id?: string;
  title: string;
  category: string;
  location: string;
  hourlyRate?: number;
  rate?: number;
  rating?: number;
  images?: string[];
  imageUrl?: string;
  image?: string;
  bannerImage?: string;
};

type StudioCardProps = {
  studio: StudioCardData;
};

const StudioCard = ({ studio }: StudioCardProps) => {
  const { isSaved, toggleWishlist } = useWishlist();

  const studioId = studio._id ?? studio.id ?? "";
  const hourlyRate = studio.hourlyRate ?? studio.rate ?? 0;
  const rating = studio.rating ?? 0;
  const image =
    studio.images?.find(Boolean) ??
    studio.imageUrl ??
    studio.image ??
    studio.bannerImage ??
    "/studio-placeholder.jpg";
  const category =
    studio.category?.trim().toLowerCase() === "workshop"
      ? "Art Workshop"
      : studio.category;

  const saved = isSaved(studioId);

  const handleToggleWishlist = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    void toggleWishlist(studio);
  };

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-xl border border-border bg-card shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-xl dark:border-zinc-800 dark:bg-zinc-900">
      <div className="relative aspect-video overflow-hidden bg-muted">
        <div
          role="img"
          aria-label={`${studio.title} interior`}
          className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
          style={{ backgroundImage: `url("${image}")` }}
        />
        <div className="absolute inset-x-0 bottom-0 h-24 bg-linear-to-t from-black/60 to-transparent" />
        
        {/* Category badge */}
        <span className="absolute top-3.5 left-3.5 rounded-full bg-background/95 px-3 py-1 text-xs font-semibold text-foreground shadow-sm backdrop-blur">
          {category}
        </span>

        {/* Wishlist Heart Icon (Optional Requirement) */}
        <button
          type="button"
          onClick={handleToggleWishlist}
          aria-label={saved ? "Remove from wishlist" : "Save to wishlist"}
          aria-pressed={saved}
          className={`absolute top-3.5 right-3.5 flex size-8 items-center justify-center rounded-full backdrop-blur-md transition-all ${
            saved
              ? "bg-rose-500 text-white shadow-md scale-105"
              : "bg-black/40 text-white/90 hover:bg-black/60 hover:text-white"
          }`}
        >
          <Heart className={`size-4 ${saved ? "fill-white" : ""}`} />
        </button>

        {/* Rating badge */}
        <span className="absolute right-3.5 bottom-3.5 flex items-center gap-1 rounded-full bg-zinc-950/85 px-2.5 py-1 text-xs font-semibold text-white backdrop-blur-sm">
          <Star className="size-3.5 fill-amber-400 text-amber-400" />
          {rating > 0 ? rating.toFixed(1) : "New"}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <h3 className="font-heading text-xl font-semibold leading-tight text-foreground">
          {studio.title}
        </h3>
        <p className="mt-2 flex items-center gap-1.5 text-sm text-muted-foreground">
          <MapPin className="size-4 shrink-0 text-primary" />
          {studio.location}
        </p>

        <div className="mt-auto border-t border-border pt-4 dark:border-zinc-800">
          <p className="font-heading text-2xl font-bold text-primary">
            ${hourlyRate}
            <span className="ml-1 text-sm font-medium text-muted-foreground">
              / hr
            </span>
          </p>
          <Button nativeButton={false} render={<Link href={`/studios/${studioId}`} />} className="mt-4 w-full">
            View Details
          </Button>
        </div>
      </div>
    </article>
  );
};

export default StudioCard;
