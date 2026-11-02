import Link from "next/link";
import { ArrowUpRight, Camera, Clapperboard, Headphones, Mic2, Palette } from "lucide-react";

const categories = [
  {
    name: "Photo Studio",
    filter: "Photo Studio",
    description: "Daylight lofts, fashion sets, and product spaces.",
    icon: Camera,
    image: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&w=900&q=80",
  },
  {
    name: "Sound Stage",
    filter: "Sound Stage",
    description: "Production-ready sets and cinematic sound stages.",
    icon: Clapperboard,
    image: "https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=900&q=80",
  },
  {
    name: "Podcast Lounge",
    filter: "Podcast Lounge",
    description: "Broadcast setups made for clear conversation.",
    icon: Mic2,
    image: "https://images.unsplash.com/photo-1478737270239-2f02b77fc618?auto=format&fit=crop&w=900&q=80",
  },
  {
    name: "Music Suite",
    filter: "Music Suite",
    description: "Acoustically treated rooms for music and voice.",
    icon: Headphones,
    image: "https://images.unsplash.com/photo-1520523839897-bd0b52f945a0?auto=format&fit=crop&w=900&q=80",
  },
  {
    name: "Art Workshop",
    filter: "Art Workshop",
    description: "Flexible spaces for teams, workshops, and shoots.",
    icon: Palette,
    image: "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=900&q=80",
  },
];

const StudioCategories = () => (
  <section className="bg-background py-20 dark:bg-zinc-950 sm:py-24">
    <div className="container mx-auto px-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-amber-500">Find your space</p>
          <h2 className="mt-3 font-heading text-3xl font-bold sm:text-4xl">Explore by category</h2>
        </div>
        <Link href="/studios" className="text-sm font-semibold text-amber-500 transition-colors hover:text-amber-400">
          View all studios
        </Link>
      </div>

      <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map(({ name, filter, description, icon: Icon, image }) => (
          <Link
            key={name}
            href={{ pathname: "/studios", query: { category: filter } }}
            className="group relative min-h-64 overflow-hidden rounded-2xl bg-zinc-900 shadow-sm"
          >
            <div className="absolute inset-0 bg-cover bg-center transition duration-700 group-hover:scale-105" style={{ backgroundImage: `url("${image}")` }} />
            <div className="absolute inset-0 bg-linear-to-t from-black via-black/35 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-6 text-white">
              <div className="flex items-end justify-between gap-4">
                <div>
                  <Icon className="size-5 text-amber-400" />
                  <h3 className="mt-3 font-heading text-2xl font-bold">{name}</h3>
                  <p className="mt-1 max-w-xs text-sm text-zinc-300">{description}</p>
                </div>
                <span className="flex size-10 shrink-0 items-center justify-center rounded-full border border-white/25 bg-white/10 backdrop-blur transition group-hover:border-amber-400 group-hover:bg-amber-400 group-hover:text-zinc-950">
                  <ArrowUpRight className="size-5" />
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  </section>
);

export default StudioCategories;
