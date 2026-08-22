"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Calendar,
  Clock,
  MapPin,
  Trophy,
  ExternalLink,
  Search,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEvents } from "@/lib/api/hooks";

interface ActivityEventsListProps {
  userId?: string;
}

export default function ActivityEventsList({ userId }: ActivityEventsListProps) {
  const router = useRouter();
  const [filter, setFilter] = useState<"ALL" | "UPCOMING" | "PAST">("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  const { data: events, loading } = useEvents({ pageSize: 50 });

  const filteredEvents = useMemo(() => {
    if (!events) return [];

    return events.filter((e) => {
      const matchesSearch =
        e.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.type?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.location?.toLowerCase().includes(searchQuery.toLowerCase());

      const eventDate = new Date(e.date).getTime();
      const now = Date.now();
      const isPast = eventDate < now;

      const matchesStatus =
        filter === "ALL" ? true : filter === "UPCOMING" ? !isPast : isPast;

      return matchesSearch && matchesStatus;
    });
  }, [events, filter, searchQuery]);

  const counts = useMemo(() => {
    if (!events) return { all: 0, upcoming: 0, past: 0 };
    const now = Date.now();
    return {
      all: events.length,
      upcoming: events.filter((e) => new Date(e.date).getTime() >= now).length,
      past: events.filter((e) => new Date(e.date).getTime() < now).length,
    };
  }, [events]);

  return (
    <div className="space-y-6">
      {/* Search & Filter Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <button
            onClick={() => setFilter("ALL")}
            className={`px-4 py-2 rounded-xl font-bold text-xs transition-all cursor-pointer whitespace-nowrap ${
              filter === "ALL"
                ? "bg-[#F0771A] text-white shadow-md shadow-[#F0771A]/20"
                : "bg-card border border-border/70 text-muted-foreground hover:bg-muted/50"
            }`}
          >
            All Events ({counts.all})
          </button>
          <button
            onClick={() => setFilter("UPCOMING")}
            className={`px-4 py-2 rounded-xl font-bold text-xs transition-all cursor-pointer whitespace-nowrap ${
              filter === "UPCOMING"
                ? "bg-[#F0771A] text-white shadow-md shadow-[#F0771A]/20"
                : "bg-card border border-border/70 text-muted-foreground hover:bg-muted/50"
            }`}
          >
            Upcoming ({counts.upcoming})
          </button>
          <button
            onClick={() => setFilter("PAST")}
            className={`px-4 py-2 rounded-xl font-bold text-xs transition-all cursor-pointer whitespace-nowrap ${
              filter === "PAST"
                ? "bg-[#F0771A] text-white shadow-md shadow-[#F0771A]/20"
                : "bg-card border border-border/70 text-muted-foreground hover:bg-muted/50"
            }`}
          >
            Past Events ({counts.past})
          </button>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search hackathons & events..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-10 pl-9 pr-4 rounded-xl bg-card border border-border/70 text-xs font-medium focus:ring-2 focus:ring-[#F0771A] outline-none"
            />
          </div>
          <Button
            onClick={() => router.push("/events")}
            className="h-10 px-4 rounded-xl bg-[#F0771A] hover:bg-[#e0650d] text-white font-bold text-xs shrink-0 flex items-center gap-1.5"
          >
            <Trophy className="w-4 h-4" /> Explore All
          </Button>
        </div>
      </div>

      {/* Events List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-28 rounded-2xl bg-card border border-border/60 animate-pulse" />
          ))}
        </div>
      ) : filteredEvents.length === 0 ? (
        <div className="rounded-3xl bg-muted/20 border border-dashed border-border/80 p-12 text-center">
          <Trophy className="w-12 h-12 text-muted-foreground/50 mx-auto mb-3" />
          <h4 className="text-base font-extrabold text-foreground mb-1">
            No events found
          </h4>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto mb-5">
            Participate in tech hackathons, workshops, and coding challenges to earn badges and XP.
          </p>
          <Button
            onClick={() => router.push("/events")}
            className="rounded-xl bg-[#F0771A] hover:bg-[#e0650d] text-white font-bold text-xs"
          >
            Explore Events & Hackathons
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredEvents.map((event) => {
            const date = new Date(event.date);
            const isPast = date.getTime() < Date.now();

            return (
              <div
                key={event.id}
                className="group bg-card border border-border/70 rounded-2xl p-5 hover:border-[#F0771A]/50 hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-5"
              >
                {/* Left: Date Badge & Details */}
                <div className="flex items-start gap-4 min-w-0 flex-1">
                  <div className="w-14 h-14 rounded-2xl bg-linear-to-br from-[#F0771A]/15 to-orange-500/15 border border-[#F0771A]/30 text-[#F0771A] flex flex-col items-center justify-center font-black leading-none shrink-0">
                    <span className="text-[10px] font-extrabold uppercase">
                      {date.toLocaleDateString("en-US", { month: "short" })}
                    </span>
                    <span className="text-xl font-black mt-0.5">{date.getDate()}</span>
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-500">
                        {event.type || "Hackathon"}
                      </span>
                      {isPast ? (
                        <span className="text-[10px] font-bold text-muted-foreground uppercase px-2 py-0.5 rounded-full bg-muted">
                          Concluded
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500">
                          Active
                        </span>
                      )}
                    </div>

                    <h3 className="text-base font-extrabold text-foreground truncate group-hover:text-[#F0771A] transition-colors">
                      {event.title}
                    </h3>
                    <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                      {event.description || "Compete, collaborate, and build with the developer community."}
                    </p>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground mt-3 font-semibold">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-[#F0771A]" />
                        {event.location || "Online Platform"}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-[#F0771A]" />
                        {date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-2 self-end md:self-center shrink-0 pt-3 md:pt-0 border-t md:border-t-0 border-border/40 w-full md:w-auto justify-end">
                  <Link
                    href={`/events/${event.slug || event.id}`}
                    className="h-9 px-4 rounded-xl bg-muted/60 hover:bg-muted text-foreground flex items-center gap-1.5 text-xs font-bold transition-colors"
                  >
                    View Details <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
