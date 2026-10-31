import { CheckCircle, Clock, HeartHandshake, Shield, Sparkles, UserCheck } from "lucide-react";

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

const HostGuarantee = () => {
  return (
    <section
      id="about-us"
      className="scroll-mt-16 bg-background py-20 sm:py-24"
    >
      <div className="container mx-auto px-4">
        {/* Header / About Spotlight Story */}
        <div className="mx-auto max-w-3xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-primary">
            <Sparkles className="size-3.5" />
            About Spotlight &amp; Our Guarantee
          </div>
          <h2 className="mt-4 font-heading text-3xl font-bold text-foreground sm:text-4xl lg:text-5xl">
            Built for creators, backed by total host protection
          </h2>
          <p className="mt-4 text-base leading-relaxed text-muted-foreground sm:text-lg">
            Spotlight is a premier peer-to-peer workspace marketplace empowering filmmakers,
            photographers, podcasters, and musicians to access exceptional creative spaces.
            We remove booking friction with transparent pricing, instant scheduling, and
            unmatched platform assurances.
          </p>
        </div>

        {/* 4 Platform Assurances */}
        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
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

        {/* Trust Stats Bar */}
        <div className="mt-14 grid grid-cols-2 gap-4 rounded-2xl border border-border bg-card p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/80 sm:grid-cols-4 sm:p-8">
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
      </div>
    </section>
  );
};

export default HostGuarantee;

