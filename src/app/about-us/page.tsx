import Link from "next/link";
import { ArrowRight, CheckCircle, Clock, HeartHandshake, Shield, Sparkles, UserCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

const assurances = [
  {
    title: "Liability Protection",
    description:
      "Comprehensive liability coverage on every confirmed reservation, giving hosts and production teams total peace of mind.",
    icon: Shield,
    badge: "$1M Coverage",
  },
  {
    title: "Verified Profiles & Spaces",
    description:
      "Every studio and host profile undergoes identity verification and manual space inspection before being published on Spotlight.",
    icon: UserCheck,
    badge: "100% Verified",
  },
  {
    title: "Equipment Safety Standards",
    description:
      "Clear on-set protocols, secure gear custody, and damage safeguards ensure your cameras, lights, and audio setups stay protected.",
    icon: HeartHandshake,
    badge: "Gear Safe",
  },
  {
    title: "24/7 Creator Support",
    description:
      "Around-the-clock live support team standing by to resolve scheduling questions, access codes, or on-site studio requirements.",
    icon: Clock,
    badge: "Always On",
  },
];

const stats = [
  { label: "Curated Creative Spaces", value: "250+" },
  { label: "Verified Production Hosts", value: "180+" },
  { label: "Successful Booked Hours", value: "12,000+" },
  { label: "Creator Satisfaction", value: "4.9 / 5" },
];

export default function AboutUsPage() {
  return (
    <div className="bg-background pb-20">
      {/* Hero Header */}
      <section className="border-b border-border bg-zinc-950 py-16 text-white dark:border-zinc-800 sm:py-24">
        <div className="container mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-400/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-amber-400">
            <Sparkles className="size-3.5" />
            Our Mission &amp; Vision
          </div>
          <h1 className="mt-4 font-heading text-4xl font-bold sm:text-5xl lg:text-6xl">
            About Spot<span className="text-amber-400">Light</span>
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base text-zinc-300 sm:text-lg">
            A peer-to-peer marketplace uniting creative filmmakers, photographers,
            musicians, and podcasters with extraordinary production spaces.
          </p>
        </div>
      </section>

      {/* Main Story */}
      <section className="container mx-auto px-4 py-16 sm:py-20">
        <div className="mx-auto max-w-3xl space-y-6 text-base leading-relaxed text-muted-foreground sm:text-lg">
          <p>
            Founded with the belief that creative vision shouldn&apos;t be bottlenecked by studio
            accessibility, <strong className="text-foreground">Spotlight</strong> bridges the gap between
            creative workspace hosts and independent producers.
          </p>
          <p>
            Whether you need a photo cyc wall bathed in natural light, a soundproof cinema sound
            stage, a multi-camera podcast lounge, or a music recording suite, Spotlight offers
            transparent hourly pricing, dynamic availability, and real-time booking management.
          </p>
        </div>

        {/* Host Guarantee Section */}
        <div className="mt-16">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-heading text-3xl font-bold text-foreground sm:text-4xl">
              Host Guarantee &amp; Creator Support
            </h2>
            <p className="mt-3 text-muted-foreground">
              Four ironclad platform assurances designed for worry-free shoots.
            </p>
          </div>

          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {assurances.map(({ title, description, icon: Icon, badge }) => (
              <div
                key={title}
                className="group relative flex flex-col rounded-2xl border border-border bg-card p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/50 hover:shadow-xl dark:border-zinc-800 dark:bg-zinc-900"
              >
                <div className="flex items-center justify-between">
                  <span className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                    <Icon className="size-6" />
                  </span>
                  <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-foreground dark:bg-zinc-800">
                    {badge}
                  </span>
                </div>

                <h3 className="mt-5 font-heading text-xl font-bold text-foreground">
                  {title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {description}
                </p>

                <div className="mt-auto pt-4 flex items-center gap-1.5 text-xs font-medium text-primary">
                  <CheckCircle className="size-3.5" />
                  <span>Guaranteed Standard</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="mt-16 grid grid-cols-2 gap-4 rounded-2xl border border-border bg-card p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/80 sm:grid-cols-4 sm:p-8">
          {stats.map(({ label, value }) => (
            <div key={label} className="text-center">
              <p className="font-heading text-2xl font-bold text-primary sm:text-3xl lg:text-4xl">
                {value}
              </p>
              <p className="mt-1 text-xs font-medium text-muted-foreground sm:text-sm">
                {label}
              </p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-16 text-center">
          <div className="inline-flex flex-wrap items-center justify-center gap-4">
            <Button nativeButton={false} render={<Link href="/studios" />} size="lg" className="bg-primary text-primary-foreground">
              Explore Available Studios
              <ArrowRight />
            </Button>
            <Button nativeButton={false} render={<Link href="/add-studio" />} variant="outline" size="lg">
              Host Your Space
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
