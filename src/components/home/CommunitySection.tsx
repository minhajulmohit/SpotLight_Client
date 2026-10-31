import Link from "next/link";
import { Building2, Quote, Star } from "lucide-react";

const CommunitySection = () => (
  <section className="bg-zinc-50 py-20 dark:bg-zinc-950 sm:py-24">
    <div className="container mx-auto px-4">
      <div className="grid overflow-hidden rounded-3xl border border-border bg-card dark:border-zinc-800 dark:bg-zinc-900 lg:grid-cols-[1fr_1.05fr]">
        <div className="p-8 sm:p-12">
          <div className="flex gap-1 text-amber-400">
            {Array.from({ length: 5 }).map((_, index) => (
              <Star key={index} className="size-5 fill-current" />
            ))}
          </div>
          <Quote className="mt-10 size-8 text-amber-400" />
          <blockquote className="mt-4 font-heading text-2xl font-semibold leading-snug sm:text-3xl">
            “SpotLight made finding the right production space effortless. We found a studio that matched our look, budget, and schedule in one evening.”
          </blockquote>
          <div className="mt-7">
            <p className="font-semibold">Nadia Rahman</p>
            <p className="mt-1 text-sm text-muted-foreground">Creative Director, Northlight Films</p>
          </div>
        </div>

        <div className="relative flex min-h-96 items-end overflow-hidden bg-[url('https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=1200&q=80')] bg-cover bg-center p-8 text-white sm:p-12">
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/45 to-transparent" />
          <div className="relative max-w-md">
            <Building2 className="size-7 text-amber-400" />
            <h2 className="mt-5 font-heading text-3xl font-bold sm:text-4xl">Have a space worth sharing?</h2>
            <p className="mt-4 leading-7 text-zinc-300">
              Join the Spotlight community and turn your studio into a productive space for creative teams.
            </p>
            <Link href="/add-studio" className="mt-6 inline-flex h-11 items-center rounded-lg bg-amber-400 px-6 text-sm font-semibold text-zinc-950 transition-colors hover:bg-amber-500">
              List your studio
            </Link>
          </div>
        </div>
      </div>
    </div>
  </section>
);

export default CommunitySection;
