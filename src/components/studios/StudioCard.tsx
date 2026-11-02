"use client";

import Link from "next/link";
import Image from "next/image";
import { MapPin, Star } from "lucide-react";

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
  const studioId = studio._id ?? studio.id ?? "";
  const hourlyRate = studio.hourlyRate ?? studio.rate ?? 0;
  const rating = studio.rating ?? 0;
  const image =
    studio.images?.find(Boolean) ??
    studio.imageUrl ??
    studio.image ??
    studio.bannerImage ??
    "/studio-placeholder.jpg";
  const canOptimizeImage =
    !image.startsWith("http") ||
    /^https:\/\/(?:i\.ibb\.co|images\.unsplash\.com|media\.istockphoto\.com)\//i.test(
      image,
    );
  const category =
    studio.category?.trim().toLowerCase() === "workshop"
      ? "Art Workshop"
      : studio.category;

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-xl border border-border bg-card shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-xl dark:border-zinc-800 dark:bg-zinc-900">
      <div className="relative aspect-video overflow-hidden bg-muted">
        <Image
          src={image}
          alt={`${studio.title} interior`}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
          loading="lazy"
          unoptimized={!canOptimizeImage}
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-x-0 bottom-0 h-24 bg-linear-to-t from-black/60 to-transparent" />
        
        {/* Category badge */}
        <span className="absolute top-3.5 left-3.5 rounded-full bg-background/95 px-3 py-1 text-xs font-semibold text-foreground shadow-sm backdrop-blur">
          {category}
        </span>

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
