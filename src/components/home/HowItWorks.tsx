import Link from "next/link";
import { ArrowRight, CalendarCheck2, Search, Sparkles } from "lucide-react";

const steps = [
  {
    number: "01",
    title: "Discover the right space",
    description:
      "Browse curated photo studios, sound stages, podcast rooms, and creative workspaces by location and category.",
    icon: Search,
  },
  {
    number: "02",
    title: "Choose your session",
    description:
      "Compare amenities, capacity, hourly pricing, and availability, then request the time that fits your production.",
    icon: CalendarCheck2,
  },
  {
    number: "03",
    title: "Create without limits",
    description:
      "Meet your host, settle into the space, and turn your next campaign, recording, shoot, or event into reality.",
    icon: Sparkles,
  },
];

const HowItWorks = () => {
  return (
    <section className="border-y border-border bg-zinc-50 py-20 dark:border-zinc-800 dark:bg-zinc-950 sm:py-24">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-amber-500">
            Simple and seamless
          </p>
          <h2 className="mt-3 font-heading text-3xl font-bold text-foreground sm:text-4xl">
            How Spotlight Works
          </h2>
          <p className="mt-4 text-muted-foreground">
            From finding your perfect studio to starting your creative session,
            booking a professional workspace is only three steps away.
          </p>
        </div>

        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {steps.map(({ number, title, description, icon: Icon }) => (
            <article
              key={number}
              className="group relative overflow-hidden rounded-2xl border border-border bg-card p-7 transition-all duration-300 hover:-translate-y-1 hover:border-amber-400/60 hover:shadow-xl dark:border-zinc-800 dark:bg-zinc-900"
            >
              <span className="absolute top-5 right-6 font-heading text-5xl font-bold text-zinc-100 dark:text-zinc-800">
                {number}
              </span>
              <div className="relative flex size-12 items-center justify-center rounded-xl bg-amber-400 text-zinc-950 shadow-[0_8px_30px_rgba(251,191,36,0.18)]">
                <Icon className="size-5" />
              </div>
              <h3 className="mt-7 font-heading text-xl font-bold text-foreground">
                {title}
              </h3>
              <p className="mt-3 leading-7 text-muted-foreground">
                {description}
              </p>
            </article>
          ))}
        </div>

        <div className="mt-10 text-center">
          <Link
            href="/studios"
            className="group inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-amber-400 px-6 text-sm font-semibold text-zinc-950 transition-colors hover:bg-amber-500"
          >
            Explore available studios
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
