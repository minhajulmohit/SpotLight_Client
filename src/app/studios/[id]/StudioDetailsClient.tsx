"use client";

import { useState } from "react";
import Image from "next/image";
import {
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  MapPin,
  ShieldCheck,
  Star,
  UserRound,
  UsersRound,
} from "lucide-react";
import BookingModal from "@/components/studios/BookingModal";
import { Button } from "@/components/ui/button";

export type StudioDetails = {
  _id?: string;
  id?: string;
  title: string;
  category?: string;
  location?: string;
  description?: string;
  overview?: string;
  rules?: string;
  hourlyRate?: number;
  rate?: number;
  securityDeposit?: number;
  deposit?: number;
  capacity?: number;
  maxCapacity?: number;
  amenities?: string[];
  rating?: number;
  reviews?: Array<{
    _id?: string;
    user?: string;
    name?: string;
    rating?: number;
    comment?: string;
    review?: string;
  }>;
  images?: string[];
  imageUrl?: string;
  image?: string;
  bannerImage?: string;
  host?: {
    name?: string;
    email?: string;
    image?: string;
    avatar?: string;
  };
  hostName?: string;
  hostEmail?: string;
};

const StudioDetailsClient = ({ studio }: { studio: StudioDetails }) => {
  const [bookingOpen, setBookingOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);

  let images: string[] = [];

  if (studio.images && studio.images.length > 0) {
    images = studio.images;
  } else {
    const fallbackList = [studio.imageUrl, studio.image, studio.bannerImage];
    images = fallbackList.filter(Boolean) as string[];
  }

  if (images.length === 0) {
    images = ["/studio-placeholder.jpg"];
  }

  const hourlyRate = studio.hourlyRate ?? studio.rate ?? 0;
  const securityDeposit = studio.securityDeposit ?? studio.deposit ?? 0;
  const capacity = studio.capacity ?? studio.maxCapacity ?? 0;
  const amenities = studio.amenities ?? [];
  const rating = studio.rating ?? 0;
  const hostName =
    studio.host?.name ?? studio.hostName ?? "SpotLight Studio Host";
  const hostEmail = studio.host?.email ?? studio.hostEmail;
  const hostInitial = hostName.trim().charAt(0).toUpperCase() || "S";
  const description = studio.overview ?? studio.description;
  const moveImage = (direction: number) =>
    setSelectedImage(
      (current) => (current + direction + images.length) % images.length,
    );

  return (
    <div className="bg-background pb-20">
      <div className="container mx-auto max-w-6xl px-4 py-8 sm:py-12">
        <div className="group relative aspect-16/8 overflow-hidden rounded-2xl bg-zinc-100 dark:bg-zinc-900">
          <Image
            key={images[selectedImage]}
            src={images[selectedImage]}
            alt={`${studio.title} view ${selectedImage + 1}`}
            fill
            sizes="(max-width: 1280px) 100vw, 1152px"
            className="object-cover"
            priority
            unoptimized={images[selectedImage].startsWith("http")}
          />
          <div className="absolute inset-x-0 bottom-0 h-32 bg-linear-to-t from-black/50 to-transparent" />
          {images.length > 1 && (
            <>
              <button
                type="button"
                onClick={() => moveImage(-1)}
                aria-label="Previous image"
                className="absolute top-1/2 left-4 flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/55 text-white backdrop-blur transition hover:bg-amber-400 hover:text-zinc-950"
              >
                <ChevronLeft className="size-5" />
              </button>
              <button
                type="button"
                onClick={() => moveImage(1)}
                aria-label="Next image"
                className="absolute top-1/2 right-4 flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/55 text-white backdrop-blur transition hover:bg-amber-400 hover:text-zinc-950"
              >
                <ChevronRight className="size-5" />
              </button>
            </>
          )}
        </div>

        {images.length > 1 && (
          <div className="mt-3 flex gap-3 overflow-x-auto pb-2">
            {images.map((image, index) => (
              <button
                type="button"
                key={`${image}-${index}`}
                onClick={() => setSelectedImage(index)}
                className={`relative h-16 w-24 shrink-0 overflow-hidden rounded-lg border-2 transition ${selectedImage === index ? "border-amber-400" : "border-transparent opacity-70 hover:opacity-100"}`}
                aria-label={`Show image ${index + 1}`}
              >
                <Image
                  src={image}
                  alt=""
                  fill
                  unoptimized={image.startsWith("http")}
                  className="object-cover"
                  sizes="96px"
                />
              </button>
            ))}
          </div>
        )}

        <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,1fr)_340px]">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-3">
              <span className="rounded-full bg-amber-400 px-3 py-1 text-xs font-bold text-zinc-950">
                {studio.category ?? "Creative Studio"}
              </span>
              <span className="flex items-center gap-1.5 rounded-full border border-border px-3 py-1 text-sm font-semibold dark:border-zinc-800">
                <Star className="size-4 fill-amber-400 text-amber-400" />
                {rating > 0 ? rating.toFixed(1) : "New"}
              </span>
            </div>
            <h1 className="mt-4 font-heading text-3xl font-bold sm:text-5xl">
              {studio.title}
            </h1>
            <p className="mt-3 flex items-center gap-2 text-muted-foreground">
              <MapPin className="size-5 text-amber-500" />
              {studio.location ?? "Location available on booking"}
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              {[
                {
                  icon: Clock3,
                  label: "Hourly rate",
                  value: `$${hourlyRate}/hr`,
                },
                {
                  icon: ShieldCheck,
                  label: "Security deposit",
                  value: `$${securityDeposit}`,
                },
                {
                  icon: UsersRound,
                  label: "Maximum capacity",
                  value: `${capacity} people`,
                },
              ].map(({ icon: Icon, label, value }) => (
                <div
                  key={label}
                  className="rounded-xl border border-border bg-card p-5 dark:border-zinc-800 dark:bg-zinc-900"
                >
                  <Icon className="size-5 text-amber-500" />
                  <p className="mt-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    {label}
                  </p>
                  <p className="mt-1 text-lg font-bold">{value}</p>
                </div>
              ))}
            </div>

            <section className="mt-10">
              <h2 className="font-heading text-2xl font-bold">Amenities</h2>
              {amenities.length ? (
                <div className="mt-4 flex flex-wrap gap-2">
                  {amenities.map((amenity) => (
                    <span
                      key={amenity}
                      className="flex items-center gap-1.5 rounded-full border border-amber-400/30 bg-amber-400/10 px-3 py-2 text-sm font-medium"
                    >
                      <CheckCircle2 className="size-4 text-amber-500" />
                      {amenity}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="mt-3 text-sm text-muted-foreground">
                  No amenities have been listed for this studio.
                </p>
              )}
            </section>

            <section className="mt-10">
              <h2 className="font-heading text-2xl font-bold">
                About this workspace
              </h2>
              <p className="mt-4 leading-7 text-muted-foreground">
                {description}
              </p>
              {studio.rules && (
                <div className="mt-6 rounded-xl border border-border bg-muted/30 p-5 dark:border-zinc-800 dark:bg-zinc-900">
                  <h3 className="font-heading text-lg font-semibold">
                    Studio rules
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    {studio.rules}
                  </p>
                </div>
              )}
            </section>

            <section className="mt-10">
              <h2 className="font-heading text-2xl font-bold">Hosted by</h2>
              <div className="mt-4 flex items-center gap-4 rounded-xl border border-border p-5 dark:border-zinc-800 dark:bg-zinc-900">
                <div
                  aria-label={`${hostName} profile`}
                  className="flex size-14 shrink-0 items-center justify-center rounded-full bg-amber-400 text-xl font-bold text-zinc-950"
                >
                  {hostInitial}
                </div>
                <div>
                  <p className="font-semibold">{hostName}</p>
                  {hostEmail && (
                    <p className="mt-1 text-sm text-muted-foreground">
                      {hostEmail}
                    </p>
                  )}
                </div>
              </div>
            </section>

            <section className="mt-10">
              <h2 className="font-heading text-2xl font-bold">Reviews</h2>
              {studio.reviews?.length ? (
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  {studio.reviews.map((review, index) => (
                    <article
                      key={
                        review._id ?? `${review.user ?? review.name}-${index}`
                      }
                      className="rounded-xl border border-border p-5 dark:border-zinc-800 dark:bg-zinc-900"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2 font-semibold">
                          <UserRound className="size-4 text-amber-500" />
                          {review.name ?? review.user ?? "Verified guest"}
                        </div>
                        <span className="flex items-center gap-1 text-sm font-semibold">
                          <Star className="size-4 fill-amber-400 text-amber-400" />
                          {Number(review.rating ?? 0).toFixed(1)}
                        </span>
                      </div>
                      <p className="mt-3 text-sm leading-6 text-muted-foreground">
                        {review.comment ?? review.review}
                      </p>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="mt-4 rounded-xl border border-dashed border-border p-6 text-sm text-muted-foreground dark:border-zinc-800">
                  No guest reviews have been published yet.
                </div>
              )}
            </section>
          </div>

          <aside>
            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm lg:sticky lg:top-24 dark:border-zinc-800 dark:bg-zinc-900">
              <p className="text-sm font-medium text-muted-foreground">
                Workspace price
              </p>
              <p className="mt-1 font-heading text-4xl font-bold text-amber-500">
                ${hourlyRate}
                <span className="text-base font-medium text-muted-foreground">
                  {" "}
                  / hr
                </span>
              </p>
              <div className="mt-6 space-y-3 border-y border-border py-5 text-sm dark:border-zinc-800">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Hourly rate</span>
                  <span className="font-semibold">${hourlyRate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    Security deposit
                  </span>
                  <span className="font-semibold">${securityDeposit}</span>
                </div>
              </div>
              <Button
                className="mt-6 w-full bg-amber-400 text-zinc-950 hover:bg-amber-300 dark:text-zinc-950"
                onClick={() => setBookingOpen(true)}
              >
                <CalendarDays />
                Book Workspace Now
              </Button>
            </div>
          </aside>
        </div>
      </div>

      <BookingModal
        open={bookingOpen}
        onOpenChange={setBookingOpen}
        studio={studio}
        hourlyRate={hourlyRate}
        securityDeposit={securityDeposit}
      />
    </div>
  );
};

export default StudioDetailsClient;
