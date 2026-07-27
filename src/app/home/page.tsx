"use client";

import Link from "next/link";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { useEvents } from "@/lib/api/hooks";
import { APP_NAV_ITEMS } from "@/components/app-shell/nav-items";
import { Calendar, MapPin } from "lucide-react";

// Structural pass only — visual design to be revisited later.
const TILE_LABELS = [
  "Explore Opportunities",
  "Mentorship",
  "Internships",
  "Projects",
  "Hackathons",
  "Resources",
  "Community",
  "Network",
  "Leaderboard",
];

export default function HomePage() {
  const { data: session } = useSession();
  const tiles = APP_NAV_ITEMS.filter((item) => TILE_LABELS.includes(item.label));

  const { data: events, loading: eventsLoading } = useEvents({ status: "UPCOMING", pageSize: 8 });

  return (
    <div className="container px-4 md:px-8 pb-16">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-foreground tracking-tight">
          Welcome back, {session?.user?.name?.split(" ")[0] || "Builder"}
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Jump into projects, mentorship, events, and more.
        </p>
      </div>

      {/* Action Tiles */}
      <section className="mb-10">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {tiles.map((tile) => {
            const Icon = tile.icon;
            return (
              <Link
                key={tile.href + tile.label}
                href={tile.href}
                className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-border/60 bg-card p-5 text-center hover:-translate-y-0.5 hover:shadow-md transition-all"
              >
                <span className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                  <Icon className="w-5 h-5" />
                </span>
                <p className="text-xs font-bold text-foreground">{tile.label}</p>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Featured */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-black text-foreground tracking-tight">Featured</h2>
          <Link href="/events" className="text-xs font-bold text-primary hover:underline">
            View all
          </Link>
        </div>

        {eventsLoading ? (
          <div className="flex gap-4 overflow-x-auto pb-2">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="shrink-0 w-64 h-72 rounded-2xl bg-muted/50 animate-pulse" />
            ))}
          </div>
        ) : !events || events.length === 0 ? (
          <div className="rounded-2xl border border-border/60 bg-card p-8 text-center">
            <p className="text-muted-foreground text-sm">
              No featured events right now.{" "}
              <Link href="/events" className="text-primary font-bold hover:underline">
                Browse all events
              </Link>
            </p>
          </div>
        ) : (
          <div className="flex gap-4 overflow-x-auto pb-2 snap-x snap-mandatory">
            {events.map((event) => {
              const date = new Date(event.date);
              return (
                <Link
                  key={event.id}
                  href={`/events/${event.slug || event.id}`}
                  className="shrink-0 w-64 snap-start rounded-2xl border border-border/60 bg-card overflow-hidden hover:shadow-md transition-shadow"
                >
                  <div className="relative w-full h-32 bg-muted">
                    {event.imageUrl ? (
                      <Image
                        src={event.imageUrl}
                        alt={event.title}
                        fill
                        className="object-cover"
                        sizes="256px"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs font-bold">
                        {event.type}
                      </div>
                    )}
                    <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-background/90 text-[10px] font-extrabold uppercase text-foreground">
                      {event.type}
                    </span>
                  </div>
                  <div className="p-4">
                    <p className="text-sm font-bold text-foreground line-clamp-2 mb-2">
                      {event.title}
                    </p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mb-1">
                      <Calendar className="w-3 h-3" />
                      {date.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {event.location || "Online"}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
