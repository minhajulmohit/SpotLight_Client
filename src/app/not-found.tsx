import Link from "next/link";
import { Aperture, Clapperboard, Compass, Home, VideoOff } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-[75vh] flex-col items-center justify-center bg-background px-4 py-16 text-center">
      <div className="relative mx-auto flex size-32 items-center justify-center rounded-3xl border border-primary/20 bg-primary/10 shadow-inner sm:size-40">
        {/* Studio spotlight glow */}
        <div className="absolute inset-0 rounded-3xl bg-primary/10 blur-xl" />
        <Aperture
          className="size-16 text-primary sm:size-20"
          strokeWidth={1.8}
        />

        {/* Small floating creative badges */}
        <span className="absolute -top-2 -right-2 flex size-9 items-center justify-center rounded-full border border-border bg-card shadow-sm dark:border-zinc-800">
          <Clapperboard className="size-4 text-amber-500" />
        </span>
        <span className="absolute -bottom-2 -left-2 flex size-9 items-center justify-center rounded-full border border-border bg-card shadow-sm dark:border-zinc-800">
          <VideoOff className="size-4 text-destructive" />
        </span>
      </div>

      <p className="mt-8 font-heading text-6xl font-black tracking-tight text-primary sm:text-7xl">
        404
      </p>

      <h1 className="mt-2 font-heading text-2xl font-bold text-foreground sm:text-3xl">
        Scene Not Found
      </h1>

      <p className="mx-auto mt-3 max-w-md text-sm text-muted-foreground sm:text-base">
        The studio space or scene you are trying to reach doesn&apos;t exist,
        has been packed up, or was moved to another sound stage.
      </p>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Button
          nativeButton={false}
          render={<Link href="/" />}
          size="lg"
          className="gap-2"
        >
          <Home className="size-4" />
          Return to Home
        </Button>
        <Button
          variant="outline"
          nativeButton={false}
          render={<Link href="/studios" />}
          size="lg"
          className="gap-2"
        >
          <Compass className="size-4" />
          Explore Available Studios
        </Button>
      </div>
    </div>
  );
}
