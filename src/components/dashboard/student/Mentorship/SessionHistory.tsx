"use client";

import SessionCard from "@/components/dashboard/SessionCard";

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
  review?: {
    id: string;
    rating: number;
    comment?: string;
  };
}

interface SessionHistoryProps {
  sessions: MentorSession[];
  onCancel: (sessionId: string) => void;
  onReview: (sessionId: string) => void;
}

export default function SessionHistory({ sessions, onCancel, onReview }: SessionHistoryProps) {
  const pastSessions = sessions.filter(
    s => new Date(s.date) <= new Date() || s.status === 'COMPLETED'
  );

  if (pastSessions.length === 0) {
    return null;
  }

  return (
    <div>
      <h3 className="text-lg font-bold text-[#023047] mb-4">Past Sessions</h3>
      <div className="space-y-4">
        {pastSessions.map(session => (
          <SessionCard
            key={session.id}
            session={session}
            onCancel={onCancel}
            onReview={onReview}
          />
        ))}
      </div>
    </div>
  );
}
