"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, Briefcase, TrendingUp, Video, ExternalLink } from "lucide-react";
import { useRouter } from "next/navigation";

interface MockInterview {
  id: string;
  email: string;
  preferredDate: string;
  preferredTime: string;
  interviewType: string;
  experienceLevel: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'SCHEDULED' | 'COMPLETED';
  scheduledDate?: string;
  meetingLink?: string;
  feedback?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  createdAt: string;
  updatedAt: string;
}

interface StudentApprovedInterviewsProps {
  userId: string;
}

export default function StudentApprovedInterviews({ userId }: StudentApprovedInterviewsProps) {
  const router = useRouter();
  const [interviews, setInterviews] = useState<MockInterview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchApprovedInterviews = async () => {
      if (!userId) return;

      setLoading(true);
      setError(null);

      try {
        const response = await fetch('/api/mock-interviews');
        const data = await response.json();

        if (data.success) {
          // Filter for APPROVED or SCHEDULED interviews and sort by preferredDate ascending
          const approvedInterviews = (data.data || [])
            .filter((interview: MockInterview) => 
              interview.status === 'APPROVED' || interview.status === 'SCHEDULED'
            )
            .sort((a: MockInterview, b: MockInterview) => {
              return new Date(a.preferredDate).getTime() - new Date(b.preferredDate).getTime();
            });
          setInterviews(approvedInterviews);
        } else {
          setError(data.error?.message || 'Failed to load interviews');
        }
      } catch (err) {
        console.error('Failed to fetch approved interviews:', err);
        setError('Failed to load interviews');
      } finally {
        setLoading(false);
      }
    };

    fetchApprovedInterviews();
  }, [userId]);

  // Loading skeleton
  if (loading) {
    return (
      <section className="mb-12">
        <h3 className="text-2xl font-black text-foreground mb-6">Mock Interviews</h3>
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <Card key={i} className="bg-background border-0 rounded-[24px] p-6 shadow-sm animate-pulse">
              <div className="space-y-3">
                <div className="h-5 bg-gray-200 rounded w-1/3" />
                <div className="h-4 bg-gray-200 rounded w-1/2" />
                <div className="h-4 bg-gray-200 rounded w-2/3" />
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
        <h3 className="text-2xl font-black text-foreground mb-6">Mock Interviews</h3>
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
  if (interviews.length === 0) {
    return (
      <section className="mb-12">
        <h3 className="text-2xl font-black text-foreground mb-6">Mock Interviews</h3>
        <Card className="bg-background border-0 rounded-[32px] p-12 text-center shadow-sm">
          <Briefcase className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h4 className="text-xl font-bold text-foreground mb-2">No scheduled mock interviews</h4>
          <p className="text-muted-foreground mb-6">
            Request a mock interview to practice and improve your skills
          </p>
          <Button
            onClick={() => router.push('/career')}
            className="bg-[#219EBC] hover:bg-[#1a7a94] text-white font-bold rounded-xl"
          >
            Request interview
          </Button>
        </Card>
      </section>
    );
  }

  // Format interview type for display
  const formatInterviewType = (type: string) => {
    const typeMap: Record<string, string> = {
      'TECHNICAL_FRONTEND': 'Frontend Development',
      'TECHNICAL_BACKEND': 'Backend Development',
      'DSA': 'Data Structures & Algorithms',
      'SYSTEM_DESIGN': 'System Design',
      'BEHAVIORAL': 'Behavioral Interview'
    };
    return typeMap[type] || type;
  };

  // Format experience level for display
  const formatExperienceLevel = (level: string) => {
    const levelMap: Record<string, string> = {
      'INTERN': 'Intern',
      'JUNIOR': 'Junior',
      'SENIOR': 'Senior'
    };
    return levelMap[level] || level;
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Get status badge color
  const getStatusColor = (status: string) => {
    if (status === 'SCHEDULED') {
      return 'bg-green-100 text-green-700';
    }
    return 'bg-blue-100 text-blue-700';
  };

  return (
    <section className="mb-12">
      <h3 className="text-2xl font-black text-foreground mb-6">Mock Interviews</h3>
      <div className="space-y-4">
        {interviews.map((interview) => {
          return (
            <Card
              key={interview.id}
              className="bg-background border-0 rounded-[24px] p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex flex-col gap-4">
                {/* Header */}
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="text-lg font-bold text-foreground">
                        {formatInterviewType(interview.interviewType)}
                      </h4>
                      <span className={`px-3 py-1 text-xs font-bold rounded-full ${getStatusColor(interview.status)}`}>
                        {interview.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <TrendingUp className="w-4 h-4 text-[#219EBC]" />
                      <span className="font-medium">{formatExperienceLevel(interview.experienceLevel)} Level</span>
                    </div>
                  </div>
                </div>

                {/* Interview Details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="w-4 h-4 text-[#219EBC]" />
                    <div>
                      <span className="font-medium">Preferred Date: </span>
                      <span>{formatDate(interview.preferredDate)}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="w-4 h-4 text-[#219EBC]" />
                    <div>
                      <span className="font-medium">Preferred Time: </span>
                      <span>{interview.preferredTime}</span>
                    </div>
                  </div>
                </div>

                {/* Scheduled Date (if available) */}
                {interview.scheduledDate && (
                  <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                    <div className="flex items-center gap-2 text-sm text-green-700 mb-2">
                      <Calendar className="w-4 h-4" />
                      <span className="font-bold">Scheduled for: {formatDate(interview.scheduledDate)}</span>
                    </div>
                    {interview.meetingLink && (
                      <Button
                        onClick={() => window.open(interview.meetingLink, '_blank')}
                        className="bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl mt-2"
                        size="sm"
                      >
                        <Video className="w-4 h-4 mr-2" />
                        Join Interview
                        <ExternalLink className="w-3 h-3 ml-2" />
                      </Button>
                    )}
                  </div>
                )}

                {/* Approved but not scheduled yet */}
                {interview.status === 'APPROVED' && !interview.scheduledDate && (
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                    <p className="text-sm text-blue-700 font-medium">
                      Your interview request has been approved! Our team will contact you soon to schedule the interview.
                    </p>
                  </div>
                )}
              </div>
            </Card>
          );
        })}
      </div>
    </section>
  );
}
