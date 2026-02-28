"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import MentorSessionApprovalCard from "./MentorSessionApprovalCard";
import MockInterviewApprovalCard from "./MockInterviewApprovalCard";
import { Calendar, Briefcase, Loader2, AlertCircle } from "lucide-react";
import toast from "react-hot-toast";
import { secureFetch } from "@/lib/utils/csrf";

interface AdminBookingApprovalPanelProps {
  initialTab?: 'mentor-sessions' | 'mock-interviews';
}

interface MentorSession {
  id: string;
  student: { name: string; email: string };
  mentor: { name: string; expertise: string[] };
  title: string;
  date: Date;
  duration: number;
  notes?: string;
  createdAt: Date;
}

interface MockInterview {
  id: string;
  user: { name: string; email: string };
  preferredDate: Date;
  preferredTime: string;
  interviewType: string;
  experienceLevel: string;
  createdAt: Date;
}

export default function AdminBookingApprovalPanel({
  initialTab = 'mentor-sessions'
}: AdminBookingApprovalPanelProps) {
  const [activeTab, setActiveTab] = useState<'mentor-sessions' | 'mock-interviews'>(initialTab);
  const [pendingSessions, setPendingSessions] = useState<MentorSession[]>([]);
  const [pendingInterviews, setPendingInterviews] = useState<MockInterview[]>([]);
  const [loadingSessions, setLoadingSessions] = useState(true);
  const [loadingInterviews, setLoadingInterviews] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch pending mentor sessions
  const fetchPendingSessions = async () => {
    setLoadingSessions(true);
    setError(null);
    try {
      const response = await fetch('/api/mentor-sessions?status=PENDING');
      const data = await response.json();
      
      if (!response.ok) {
        const errorMessage = data.error?.message || data.error || 'Failed to fetch pending sessions';
        throw new Error(errorMessage);
      }

      if (data.success && Array.isArray(data.data)) {
        // Sort by createdAt descending (newest first)
        const sorted = data.data.sort((a: MentorSession, b: MentorSession) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        setPendingSessions(sorted);
      } else {
        setPendingSessions([]);
      }
    } catch (error) {
      console.error('Error fetching pending sessions:', error);
      setError('Failed to load pending mentor sessions');
      toast.error('Failed to load pending mentor sessions');
      setPendingSessions([]);
    } finally {
      setLoadingSessions(false);
    }
  };

  // Fetch pending mock interviews
  const fetchPendingInterviews = async () => {
    setLoadingInterviews(true);
    setError(null);
    try {
      const response = await fetch('/api/mock-interviews?status=PENDING');
      const data = await response.json();
      
      if (!response.ok) {
        const errorMessage = data.error?.message || data.error || 'Failed to fetch pending interviews';
        throw new Error(errorMessage);
      }

      if (data.success && Array.isArray(data.data)) {
        // Sort by createdAt descending (newest first)
        const sorted = data.data.sort((a: MockInterview, b: MockInterview) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        setPendingInterviews(sorted);
      } else {
        setPendingInterviews([]);
      }
    } catch (error) {
      console.error('Error fetching pending interviews:', error);
      setError('Failed to load pending mock interviews');
      toast.error('Failed to load pending mock interviews');
      setPendingInterviews([]);
    } finally {
      setLoadingInterviews(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchPendingSessions();
    fetchPendingInterviews();
  }, []);

  // Handle mentor session approval
  const handleApproveSession = async (id: string) => {
    try {
      const response = await secureFetch(`/api/mentor-sessions/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'approve' }),
      });

      const data = await response.json();

      if (!response.ok) {
        const errorMessage = data.error?.message || data.error || 'Failed to approve session';
        throw new Error(errorMessage);
      }

      // Remove from pending list (optimistic update)
      setPendingSessions(prev => prev.filter(session => session.id !== id));
      
      // Refetch to ensure consistency
      await fetchPendingSessions();
    } catch (error) {
      console.error('Error approving session:', error);
      throw error;
    }
  };

  // Handle mentor session rejection
  const handleRejectSession = async (id: string, reason: string) => {
    try {
      const response = await secureFetch(`/api/mentor-sessions/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'reject', reason }),
      });

      const data = await response.json();

      if (!response.ok) {
        const errorMessage = data.error?.message || data.error || 'Failed to reject session';
        throw new Error(errorMessage);
      }

      // Remove from pending list (optimistic update)
      setPendingSessions(prev => prev.filter(session => session.id !== id));
      
      // Refetch to ensure consistency
      await fetchPendingSessions();
    } catch (error) {
      console.error('Error rejecting session:', error);
      throw error;
    }
  };

  // Handle mock interview approval
  const handleApproveInterview = async (id: string) => {
    try {
      const response = await secureFetch(`/api/mock-interviews/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'approve' }),
      });

      const data = await response.json();

      if (!response.ok) {
        const errorMessage = data.error?.message || data.error || 'Failed to approve interview';
        throw new Error(errorMessage);
      }

      // Remove from pending list (optimistic update)
      setPendingInterviews(prev => prev.filter(interview => interview.id !== id));
      
      // Refetch to ensure consistency
      await fetchPendingInterviews();
    } catch (error) {
      console.error('Error approving interview:', error);
      throw error;
    }
  };

  // Handle mock interview rejection
  const handleRejectInterview = async (id: string, feedback: string) => {
    try {
      const response = await secureFetch(`/api/mock-interviews/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'reject', feedback }),
      });

      const data = await response.json();

      if (!response.ok) {
        const errorMessage = data.error?.message || data.error || 'Failed to reject interview';
        throw new Error(errorMessage);
      }

      // Remove from pending list (optimistic update)
      setPendingInterviews(prev => prev.filter(interview => interview.id !== id));
      
      // Refetch to ensure consistency
      await fetchPendingInterviews();
    } catch (error) {
      console.error('Error rejecting interview:', error);
      throw error;
    }
  };

  return (
    <Card className="bg-background border-0 shadow-2xl shadow-black/[0.03] rounded-[48px] overflow-hidden">
      <CardHeader className="p-12 border-b border-gray-50">
        <CardTitle className="text-3xl font-black text-[#023047] mb-2">
          Booking Approvals
        </CardTitle>
        <CardDescription className="text-muted-foreground">
          Review and approve pending mentor sessions and mock interview requests
        </CardDescription>
      </CardHeader>

      <CardContent className="p-12">
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'mentor-sessions' | 'mock-interviews')}>
          <TabsList className="mb-8 bg-muted p-1 rounded-2xl">
            <TabsTrigger 
              value="mentor-sessions" 
              className="px-6 py-3 rounded-xl data-[state=active]:bg-[#023047] data-[state=active]:text-white font-bold text-sm flex items-center gap-2"
            >
              <Calendar className="w-4 h-4" />
              Mentor Sessions
              {pendingSessions.length > 0 && (
                <Badge className="ml-2 bg-[#219EBC] text-white">
                  {pendingSessions.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger 
              value="mock-interviews" 
              className="px-6 py-3 rounded-xl data-[state=active]:bg-[#023047] data-[state=active]:text-white font-bold text-sm flex items-center gap-2"
            >
              <Briefcase className="w-4 h-4" />
              Mock Interviews
              {pendingInterviews.length > 0 && (
                <Badge className="ml-2 bg-[#219EBC] text-white">
                  {pendingInterviews.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          {/* Mentor Sessions Tab */}
          <TabsContent value="mentor-sessions">
            {loadingSessions ? (
              <div className="flex flex-col items-center justify-center py-16">
                <Loader2 className="w-12 h-12 text-[#219EBC] animate-spin mb-4" />
                <p className="text-muted-foreground font-medium">Loading pending sessions...</p>
              </div>
            ) : error && activeTab === 'mentor-sessions' ? (
              <div className="flex flex-col items-center justify-center py-16">
                <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
                <p className="text-red-600 font-semibold mb-2">Error Loading Sessions</p>
                <p className="text-muted-foreground text-sm">{error}</p>
              </div>
            ) : pendingSessions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16">
                <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mb-4">
                  <Calendar className="w-10 h-10 text-muted-foreground" />
                </div>
                <p className="text-xl font-bold text-[#023047] mb-2">No pending mentor sessions</p>
                <p className="text-muted-foreground">All mentor session requests have been processed</p>
              </div>
            ) : (
              <div className="grid gap-6">
                {pendingSessions.map((session) => (
                  <MentorSessionApprovalCard
                    key={session.id}
                    session={session}
                    onApprove={handleApproveSession}
                    onReject={handleRejectSession}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          {/* Mock Interviews Tab */}
          <TabsContent value="mock-interviews">
            {loadingInterviews ? (
              <div className="flex flex-col items-center justify-center py-16">
                <Loader2 className="w-12 h-12 text-[#219EBC] animate-spin mb-4" />
                <p className="text-muted-foreground font-medium">Loading pending interviews...</p>
              </div>
            ) : error && activeTab === 'mock-interviews' ? (
              <div className="flex flex-col items-center justify-center py-16">
                <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
                <p className="text-red-600 font-semibold mb-2">Error Loading Interviews</p>
                <p className="text-muted-foreground text-sm">{error}</p>
              </div>
            ) : pendingInterviews.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16">
                <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mb-4">
                  <Briefcase className="w-10 h-10 text-muted-foreground" />
                </div>
                <p className="text-xl font-bold text-[#023047] mb-2">No pending mock interviews</p>
                <p className="text-muted-foreground">All mock interview requests have been processed</p>
              </div>
            ) : (
              <div className="grid gap-6">
                {pendingInterviews.map((interview) => (
                  <MockInterviewApprovalCard
                    key={interview.id}
                    interview={interview}
                    onApprove={handleApproveInterview}
                    onReject={handleRejectInterview}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
