"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
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

interface UpcomingSessionsProps {
  sessions: MentorSession[];
  loading: boolean;
  onCancel: (sessionId: string) => void;
  onReview: (sessionId: string) => void;
}

export default function UpcomingSessions({ sessions, loading, onCancel, onReview }: UpcomingSessionsProps) {
  const router = useRouter();

  const upcomingSessions = sessions.filter(
    s => new Date(s.date) > new Date() && s.status !== 'CANCELLED'
  );

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#219EBC] mx-auto mb-4"></div>
        <p className="text-gray-600">Loading sessions...</p>
      </div>
    );
  }

  if (upcomingSessions.length === 0) {
    return (
      <Card className="bg-white border-0 rounded-[32px] p-12 text-center shadow-sm">
        <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-gray-900 mb-2">No Upcoming Sessions</h3>
        <p className="text-gray-500 mb-6">
          Book a mentorship session to get started
        </p>
        <Button
          onClick={() => router.push('/mentors')}
          className="bg-[#219EBC] hover:bg-[#1a7a94] text-white font-bold rounded-xl"
        >
          <Plus className="w-4 h-4 mr-2" />
          Book New Session
        </Button>
      </Card>
    );
  }

  return (
    <div>
      <h3 className="text-lg font-bold text-[#023047] mb-4">Upcoming Sessions</h3>
      <div className="space-y-4">
        {upcomingSessions.map(session => (
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
