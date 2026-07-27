"use client";

import Link from "next/link";
import { useEvents } from "@/lib/api/hooks";
import { Calendar } from "lucide-react";

export default function UpcomingEventsWidget() {
  const { data: events, loading } = useEvents({ status: "UPCOMING", pageSize: 3 });

  return (
    <div className="bg-card border border-border rounded-2xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-foreground">Upcoming Events</h3>
        <Link href="/events" className="text-xs font-bold text-primary hover:underline">
          View all
        </Link>
      </div>

      {loading ? (
        <div className="space-y-3 animate-pulse">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-14 rounded-xl bg-muted/50" />
          ))}
        </div>
      ) : !events || events.length === 0 ? (
        <p className="text-muted-foreground text-sm">No upcoming events right now. Check back soon.</p>
      ) : (
        <div className="space-y-3">
          {events.map((event) => {
            const date = new Date(event.date);
            return (
              <Link
                key={event.id}
                href={`/events/${event.slug || event.id}`}
                className="flex items-start gap-3 p-2 -mx-2 rounded-xl hover:bg-muted/50 transition-colors"
              >
                <div className="shrink-0 w-12 h-12 rounded-xl bg-primary/10 text-primary flex flex-col items-center justify-center leading-none">
                  <span className="text-[9px] font-extrabold uppercase">
                    {date.toLocaleDateString("en-US", { month: "short" })}
                  </span>
                  <span className="text-base font-black">{date.getDate()}</span>
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-foreground truncate">{event.title}</p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                    <Calendar className="w-3 h-3" />
                    {event.location || "Online"} ·{" "}
                    {date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
