"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Calendar,
  Clock,
  Video,
  Star,
  Users,
  Briefcase,
  Plus,
  Search,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface ActivitySessionsListProps {
  userId: string;
  mentorSessions: any[];
  loadingSessions: boolean;
  onReviewSession: (sessionId: string) => void;
  onCancelSession?: (sessionId: string) => void;
}

export default function ActivitySessionsList({
  userId,
  mentorSessions,
  loadingSessions,
  onReviewSession,
  onCancelSession,
}: ActivitySessionsListProps) {
  const router = useRouter();
  const [filter, setFilter] = useState<"ALL" | "CONFIRMED" | "COMPLETED" | "INTERVIEWS">("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [mockInterviews, setMockInterviews] = useState<any[]>([]);
  const [loadingInterviews, setLoadingInterviews] = useState(false);

  // Fetch mock interviews
  useEffect(() => {
    if (!userId) return;
    const fetchInterviews = async () => {
      setLoadingInterviews(true);
      try {
        const res = await fetch("/api/mock-interviews");
        const data = await res.json();
        if (data.success) {
          setMockInterviews(data.data || []);
        }
      } catch (err) {
        console.error("Failed to load mock interviews:", err);
      } finally {
        setLoadingInterviews(false);
      }
    };
    fetchInterviews();
  }, [userId]);

  const filteredSessions = useMemo(() => {
    if (filter === "INTERVIEWS") return [];

    return mentorSessions.filter((s) => {
      const matchesSearch =
        s.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.mentor?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.mentor?.company?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus =
        filter === "ALL"
          ? true
          : filter === "CONFIRMED"
          ? s.status === "CONFIRMED" || s.status === "PENDING"
          : s.status === "COMPLETED";

      return matchesSearch && matchesStatus;
    });
  }, [mentorSessions, filter, searchQuery]);

  const filteredInterviews = useMemo(() => {
    if (filter !== "ALL" && filter !== "INTERVIEWS") return [];

    return mockInterviews.filter((i) => {
      return (
        i.interviewType?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        i.experienceLevel?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    });
  }, [mockInterviews, filter, searchQuery]);

  const counts = useMemo(() => {
    return {
      all: mentorSessions.length + mockInterviews.length,
      confirmed: mentorSessions.filter((s) => s.status === "CONFIRMED" || s.status === "PENDING").length,
      completed: mentorSessions.filter((s) => s.status === "COMPLETED").length,
      interviews: mockInterviews.length,
    };
  }, [mentorSessions, mockInterviews]);

  return (
    <div className="space-y-6">
      {/* Top Filter Pills & Search */}
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
            All Engagements ({counts.all})
          </button>
          <button
            onClick={() => setFilter("CONFIRMED")}
            className={`px-4 py-2 rounded-xl font-bold text-xs transition-all cursor-pointer whitespace-nowrap ${
              filter === "CONFIRMED"
                ? "bg-[#F0771A] text-white shadow-md shadow-[#F0771A]/20"
                : "bg-card border border-border/70 text-muted-foreground hover:bg-muted/50"
            }`}
          >
            Upcoming ({counts.confirmed})
          </button>
          <button
            onClick={() => setFilter("COMPLETED")}
            className={`px-4 py-2 rounded-xl font-bold text-xs transition-all cursor-pointer whitespace-nowrap ${
              filter === "COMPLETED"
                ? "bg-[#F0771A] text-white shadow-md shadow-[#F0771A]/20"
                : "bg-card border border-border/70 text-muted-foreground hover:bg-muted/50"
            }`}
          >
            Completed ({counts.completed})
          </button>
          <button
            onClick={() => setFilter("INTERVIEWS")}
            className={`px-4 py-2 rounded-xl font-bold text-xs transition-all cursor-pointer whitespace-nowrap ${
              filter === "INTERVIEWS"
                ? "bg-[#F0771A] text-white shadow-md shadow-[#F0771A]/20"
                : "bg-card border border-border/70 text-muted-foreground hover:bg-muted/50"
            }`}
          >
            Mock Interviews ({counts.interviews})
          </button>
        </div>

        {/* Search & Book CTA */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search sessions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-10 pl-9 pr-4 rounded-xl bg-card border border-border/70 text-xs font-medium focus:ring-2 focus:ring-[#F0771A] outline-none"
            />
          </div>
          <Button
            onClick={() => router.push("/mentors")}
            className="h-10 px-4 rounded-xl bg-[#F0771A] hover:bg-[#e0650d] text-white font-bold text-xs shrink-0 flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" /> Book Session
          </Button>
        </div>
      </div>

      {/* List Container */}
      {filteredSessions.length === 0 && filteredInterviews.length === 0 ? (
        <div className="rounded-3xl bg-muted/20 border border-dashed border-border/80 p-12 text-center">
          <Users className="w-12 h-12 text-muted-foreground/50 mx-auto mb-3" />
          <h4 className="text-base font-extrabold text-foreground mb-1">
            No sessions found
          </h4>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto mb-5">
            Book 1-on-1 sessions with industry mentors from top tech companies to review your resume, code, or career roadmap.
          </p>
          <Button
            onClick={() => router.push("/mentors")}
            className="rounded-xl bg-[#F0771A] hover:bg-[#e0650d] text-white font-bold text-xs"
          >
            Browse Verified Mentors
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Mentor Sessions List */}
          {filteredSessions.map((session) => {
            const date = new Date(session.date);
            const isUpcoming = session.status === "CONFIRMED" || session.status === "PENDING";
            const isDone = session.status === "COMPLETED";

            return (
              <div
                key={session.id}
                className="group bg-card border border-border/70 rounded-2xl p-5 hover:border-[#F0771A]/50 hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-5"
              >
                {/* Left: Mentor Info & Session Meta */}
                <div className="flex items-start gap-4 min-w-0 flex-1">
                  <div className="w-13 h-13 rounded-2xl bg-linear-to-br from-emerald-500/10 to-teal-500/10 border border-border/60 flex items-center justify-center font-black text-lg text-emerald-600 dark:text-emerald-400 shrink-0">
                    {session.mentor?.name?.[0] || "M"}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span
                        className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                          isDone
                            ? "bg-emerald-500/10 text-emerald-500"
                            : isUpcoming
                            ? "bg-blue-500/10 text-blue-500"
                            : "bg-red-500/10 text-red-500"
                        }`}
                      >
                        {session.status}
                      </span>
                      <span className="text-[10px] font-bold text-muted-foreground uppercase px-2 py-0.5 rounded-full bg-muted">
                        {session.duration || 45} mins
                      </span>
                    </div>

                    <h3 className="text-base font-extrabold text-foreground truncate group-hover:text-[#F0771A] transition-colors">
                      {session.title}
                    </h3>
                    <p className="text-xs text-muted-foreground truncate mt-0.5">
                      with <strong className="text-foreground">{session.mentor?.name}</strong> • {session.mentor?.company || "Tech Mentor"}
                    </p>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground mt-3 font-semibold">
                      <span className="flex items-center gap-1 text-foreground">
                        <Calendar className="w-3.5 h-3.5 text-[#F0771A]" />
                        {date.toLocaleDateString("en-US", {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
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
                  {isUpcoming && session.meetingLink && (
                    <a
                      href={session.meetingLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="h-9 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white flex items-center gap-1.5 text-xs font-bold transition-colors shadow-xs"
                    >
                      <Video className="w-3.5 h-3.5" /> Join Call
                    </a>
                  )}

                  {isDone && !session.review && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onReviewSession(session.id)}
                      className="h-9 px-3 rounded-xl text-xs font-bold text-[#F0771A] border-[#F0771A]/30 hover:bg-[#F0771A]/10"
                    >
                      <Star className="w-3.5 h-3.5 mr-1" /> Leave Review
                    </Button>
                  )}

                  {session.review && (
                    <span className="flex items-center gap-1 text-xs font-bold text-amber-500 bg-amber-500/10 px-3 py-1.5 rounded-xl">
                      <Star className="w-3.5 h-3.5 fill-current" /> {session.review.rating}/5 Rated
                    </span>
                  )}
                </div>
              </div>
            );
          })}

          {/* Mock Interviews List */}
          {filteredInterviews.map((interview) => {
            const date = interview.scheduledDate || interview.preferredDate;
            const formattedDate = date
              ? new Date(date).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })
              : "Date Pending";

            return (
              <div
                key={interview.id}
                className="group bg-card border border-border/70 rounded-2xl p-5 hover:border-purple-500/50 hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-5"
              >
                <div className="flex items-start gap-4 min-w-0 flex-1">
                  <div className="w-13 h-13 rounded-2xl bg-purple-500/10 border border-border/60 flex items-center justify-center font-black text-lg text-purple-600 dark:text-purple-400 shrink-0">
                    <Briefcase className="w-6 h-6" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-500">
                        Mock Interview
                      </span>
                      <span className="text-[10px] font-bold text-muted-foreground uppercase px-2 py-0.5 rounded-full bg-muted">
                        {interview.experienceLevel || "Student"}
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-muted text-foreground">
                        {interview.status}
                      </span>
                    </div>

                    <h3 className="text-base font-extrabold text-foreground truncate group-hover:text-purple-500 transition-colors">
                      {interview.interviewType} Interview Simulation
                    </h3>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground mt-3 font-semibold">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-purple-500" />
                        {formattedDate}
                      </span>
                      {interview.preferredTime && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-purple-500" />
                          {interview.preferredTime}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right: Meeting link if scheduled */}
                <div className="flex items-center gap-2 self-end md:self-center shrink-0 pt-3 md:pt-0 border-t md:border-t-0 border-border/40 w-full md:w-auto justify-end">
                  {interview.meetingLink && (
                    <a
                      href={interview.meetingLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="h-9 px-4 rounded-xl bg-purple-600 hover:bg-purple-700 text-white flex items-center gap-1.5 text-xs font-bold transition-colors shadow-xs"
                    >
                      <Video className="w-3.5 h-3.5" /> Join Interview
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
