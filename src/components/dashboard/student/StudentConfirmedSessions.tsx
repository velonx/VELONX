"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, Video, Users, ExternalLink } from "lucide-react";
import { useRouter } from "next/navigation";

interface MentorSession {
  id: string;
  title: string;
  description?: string;
  date: string;
  duration: number;
  status: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW';
  meetingLink?: string;
  mentor: {
    id: string;
    name: string;
    company: string;
    imageUrl?: string;
    expertise: string[];
  };
}

interface StudentConfirmedSessionsProps {
  userId: string;
}

export default function StudentConfirmedSessions({ userId }: StudentConfirmedSessionsProps) {
  const router = useRouter();
  const [sessions, setSessions] = useState<MentorSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchConfirmedSessions = async () => {
      if (!userId) return;

      setLoading(true);
      setError(null);

      try {
        const response = await fetch('/api/mentor-sessions?status=CONFIRMED&viewAs=student');
        const data = await response.json();

        if (data.success) {
          // Sort by scheduledAt ascending (soonest first)
          const sortedSessions = (data.data || []).sort((a: MentorSession, b: MentorSession) => {
            return new Date(a.date).getTime() - new Date(b.date).getTime();
          });
          setSessions(sortedSessions);
        } else {
          setError(data.error?.message || 'Failed to load sessions');
        }
      } catch (err) {
        console.error('Failed to fetch confirmed sessions:', err);
        setError('Failed to load sessions');
      } finally {
        setLoading(false);
      }
    };

    fetchConfirmedSessions();
  }, [userId]);

  // Loading skeleton
  if (loading) {
    return (
      <section className="mb-12">
        <h3 className="text-2xl font-black text-[#023047] mb-6">Upcoming Mentor Sessions</h3>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="bg-background border-0 rounded-[24px] p-6 shadow-sm animate-pulse">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gray-200 rounded-full" />
                <div className="flex-1 space-y-3">
                  <div className="h-5 bg-gray-200 rounded w-1/3" />
                  <div className="h-4 bg-gray-200 rounded w-1/2" />
                  <div className="h-4 bg-gray-200 rounded w-2/3" />
                </div>
              </div>
            </Card>
          ))}
        </div>
      </section>
    );
  }

  // Error state
  if (error) {
    return (
      <section className="mb-12">
        <h3 className="text-2xl font-black text-[#023047] mb-6">Upcoming Mentor Sessions</h3>
        <Card className="bg-background border-0 rounded-[24px] p-8 text-center shadow-sm">
          <p className="text-red-500 mb-4">{error}</p>
          <Button
            onClick={() => window.location.reload()}
            variant="outline"
            className="rounded-xl"
          >
            Try Again
          </Button>
        </Card>
      </section>
    );
  }

  // Empty state
  if (sessions.length === 0) {
    return (
      <section className="mb-12">
        <h3 className="text-2xl font-black text-[#023047] mb-6">Upcoming Mentor Sessions</h3>
        <Card className="bg-background border-0 rounded-[32px] p-12 text-center shadow-sm">
          <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h4 className="text-xl font-bold text-foreground mb-2">No upcoming mentor sessions</h4>
          <p className="text-muted-foreground mb-6">
            Book a session with a mentor to get personalized guidance
          </p>
          <Button
            onClick={() => router.push('/mentors')}
            className="bg-[#219EBC] hover:bg-[#1a7a94] text-white font-bold rounded-xl"
          >
            Book a session
          </Button>
        </Card>
      </section>
    );
  }

  // Format date and time
  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    const dateStr = date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
    const timeStr = date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
    return { dateStr, timeStr };
  };

  return (
    <section className="mb-12">
      <h3 className="text-2xl font-black text-[#023047] mb-6">Upcoming Mentor Sessions</h3>
      <div className="space-y-4">
        {sessions.map((session) => {
          const { dateStr, timeStr } = formatDateTime(session.date);

          return (
            <Card
              key={session.id}
              className="bg-background border-0 rounded-[24px] p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex flex-col md:flex-row md:items-start gap-4">
                {/* Mentor Avatar */}
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-full border-2 border-[#219EBC] p-0.5">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={session.mentor.imageUrl || "/avatars/default.png"}
                      alt={session.mentor.name}
                      className="w-full h-full rounded-full object-cover"
                    />
                  </div>
                </div>

                {/* Session Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div>
                      <h4 className="text-lg font-bold text-[#023047] mb-1">
                        {session.title}
                      </h4>
                      <p className="text-sm text-muted-foreground font-medium">
                        with {session.mentor.name} • {session.mentor.company}
                      </p>
                    </div>
                  </div>

                  {/* Session Info */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="w-4 h-4 text-[#219EBC]" />
                      <span className="font-medium">{dateStr}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="w-4 h-4 text-[#219EBC]" />
                      <span className="font-medium">{timeStr} • {session.duration} min</span>
                    </div>
                  </div>

                  {/* Mentor Expertise */}
                  {session.mentor.expertise && session.mentor.expertise.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {session.mentor.expertise.slice(0, 3).map((skill, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1 bg-[#219EBC]/10 text-[#219EBC] text-xs font-bold rounded-full"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Meeting Link */}
                  {session.meetingLink && (
                    <div className="flex items-center gap-2">
                      <Button
                        onClick={() => window.open(session.meetingLink, '_blank')}
                        className="bg-[#219EBC] hover:bg-[#1a7a94] text-white font-bold rounded-xl"
                        size="sm"
                      >
                        <Video className="w-4 h-4 mr-2" />
                        Join Meeting
                        <ExternalLink className="w-3 h-3 ml-2" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </section>
  );
}
