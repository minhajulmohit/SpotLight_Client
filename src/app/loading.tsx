import { Aperture } from "lucide-react";

export default function Loading() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center gap-5 bg-background px-4">
      <span className="relative flex size-16 items-center justify-center">
        <span className="absolute inset-0 animate-ping rounded-full bg-primary/20" />
        <span className="relative flex size-16 items-center justify-center rounded-full border border-primary/30 bg-primary/10">
          <Aperture className="slow-spin size-8 text-primary" />
        </span>
      </span>
      <p className="text-sm font-medium text-muted-foreground">
        Preparing your spotlight...
      </p>
    </div>
  );
}
