"use client";

import Image from "next/image";
import Link from "next/link";
import { GraduationCap, Trophy, Code2, Briefcase, ArrowRight } from "lucide-react";

interface DashboardHeroProps {
  firstName: string;
}

const FEATURE_CHIPS = [
  { label: "Mentorship", caption: "Learn from industry experts", href: "/mentors", icon: GraduationCap },
  { label: "Hackathons", caption: "Compete. Build. Win.", href: "/events", icon: Trophy },
  { label: "Projects", caption: "Build real-world projects", href: "/projects", icon: Code2 },
  { label: "Internships", caption: "Find the right opportunities", href: "/career", icon: Briefcase },
];

export default function DashboardHero({ firstName }: DashboardHeroProps) {
  return (
    <section className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-accent/10 via-background to-primary/5 border border-border/60 mb-8">
      <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] items-center gap-6 p-6 md:p-10">
        <div>
          <span className="inline-block px-3 py-1 rounded-full bg-accent/10 text-accent text-xs font-extrabold uppercase tracking-wider mb-4">
            Welcome back, Builder
          </span>
          <h1 className="heading-section text-3xl md:text-4xl mb-3">
            Keep Building,<br />
            <span className="text-primary">{firstName}.</span>
          </h1>
          <p className="text-muted-foreground text-sm md:text-base max-w-md mb-6">
            Opportunities, mentorship, hackathons, and projects — everything you need to grow, in one place.
          </p>
          <div className="flex flex-wrap items-center gap-3 mb-8">
            <Link
              href="/career"
              className="inline-flex items-center gap-2 h-11 px-6 rounded-2xl bg-accent hover:brightness-105 text-accent-foreground font-extrabold text-sm shadow-lg shadow-accent/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              Explore Opportunities
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/mentors"
              className="inline-flex items-center gap-2 h-11 px-6 rounded-2xl bg-card border border-border text-foreground font-extrabold text-sm hover:bg-muted transition-all"
            >
              Find a Mentor
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {FEATURE_CHIPS.map((chip) => {
              const Icon = chip.icon;
              return (
                <Link
                  key={chip.label}
                  href={chip.href}
                  className="rounded-2xl bg-card/80 border border-border/60 p-3 hover:border-primary/40 hover:-translate-y-0.5 transition-all"
                >
                  <Icon className="w-4 h-4 text-primary mb-1.5" />
                  <p className="text-xs font-bold text-foreground leading-tight">{chip.label}</p>
                  <p className="text-[10px] text-muted-foreground leading-tight mt-0.5">{chip.caption}</p>
                </Link>
              );
            })}
          </div>
        </div>

        <div className="relative hidden lg:block rounded-3xl overflow-hidden aspect-4/3">
          <Image
            src="/hero.png"
            alt=""
            fill
            className="object-cover"
            priority
          />
        </div>
      </div>
    </section>
  );
}
