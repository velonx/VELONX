"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Calendar, Clock, User, Briefcase, TrendingUp, CheckCircle, XCircle, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

interface MockInterviewApprovalCardProps {
  interview: {
    id: string;
    user: { name: string; email: string };
    preferredDate: Date;
    preferredTime: string;
    interviewType: string;
    experienceLevel: string;
    createdAt: Date;
  };
  onApprove: (id: string) => Promise<void>;
  onReject: (id: string, feedback: string) => Promise<void>;
}

const interviewTypeLabels: Record<string, string> = {
  TECHNICAL_FRONTEND: "Frontend",
  TECHNICAL_BACKEND: "Backend",
  DSA: "Data Structures & Algorithms",
  SYSTEM_DESIGN: "System Design",
  BEHAVIORAL: "Behavioral",
};

const experienceLevelLabels: Record<string, string> = {
  INTERN: "Intern",
  JUNIOR: "Junior",
  SENIOR: "Senior",
};

const interviewTypeColors: Record<string, string> = {
  TECHNICAL_FRONTEND: "bg-blue-100 text-blue-800 border-blue-200",
  TECHNICAL_BACKEND: "bg-purple-100 text-purple-800 border-purple-200",
  DSA: "bg-green-100 text-green-800 border-green-200",
  SYSTEM_DESIGN: "bg-orange-100 text-orange-800 border-orange-200",
  BEHAVIORAL: "bg-pink-100 text-pink-800 border-pink-200",
};

export default function MockInterviewApprovalCard({
  interview,
  onApprove,
  onReject,
}: MockInterviewApprovalCardProps) {
  const [loading, setLoading] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [feedbackError, setFeedbackError] = useState("");

  const handleApprove = async () => {
    setLoading(true);
    try {
      await onApprove(interview.id);
      toast.success("Mock interview approved successfully");
      setShowApproveDialog(false);
    } catch (error) {
      toast.error("Failed to approve interview");
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    // Validate feedback
    if (feedback.trim().length < 10) {
      setFeedbackError("Feedback must be at least 10 characters");
      return;
    }

    setLoading(true);
    try {
      await onReject(interview.id, feedback);
      toast.success("Mock interview rejected");
      setShowRejectDialog(false);
      setFeedback("");
      setFeedbackError("");
    } catch (error) {
      toast.error("Failed to reject interview");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Card className="bg-background border border-border rounded-2xl shadow-sm hover:shadow-md transition-shadow">
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-lg font-bold text-[#023047] mb-2">
                Mock Interview Request
              </CardTitle>
              <div className="flex flex-wrap gap-2">
                <Badge className={interviewTypeColors[interview.interviewType] || "bg-gray-100 text-gray-800"}>
                  {interviewTypeLabels[interview.interviewType] || interview.interviewType}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {experienceLevelLabels[interview.experienceLevel] || interview.experienceLevel} Level
                </Badge>
              </div>
            </div>
            <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
              PENDING
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* User Info */}
          <div className="flex items-center gap-3 p-3 bg-muted rounded-xl">
            <User className="w-5 h-5 text-[#219EBC]" />
            <div>
              <p className="text-sm font-semibold text-[#023047]">Candidate</p>
              <p className="text-sm text-muted-foreground">{interview.user.name}</p>
              <p className="text-xs text-muted-foreground">{interview.user.email}</p>
            </div>
          </div>

          {/* Interview Details */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2 p-3 bg-muted rounded-xl">
              <Briefcase className="w-4 h-4 text-[#219EBC]" />
              <div>
                <p className="text-xs font-semibold text-[#023047]">Type</p>
                <p className="text-sm text-muted-foreground">
                  {interviewTypeLabels[interview.interviewType] || interview.interviewType}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 p-3 bg-muted rounded-xl">
              <TrendingUp className="w-4 h-4 text-[#219EBC]" />
              <div>
                <p className="text-xs font-semibold text-[#023047]">Level</p>
                <p className="text-sm text-muted-foreground">
                  {experienceLevelLabels[interview.experienceLevel] || interview.experienceLevel}
                </p>
              </div>
            </div>
          </div>

          {/* Preferred Schedule */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2 p-3 bg-muted rounded-xl">
              <Calendar className="w-4 h-4 text-[#219EBC]" />
              <div>
                <p className="text-xs font-semibold text-[#023047]">Preferred Date</p>
                <p className="text-sm text-muted-foreground">
                  {new Date(interview.preferredDate).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 p-3 bg-muted rounded-xl">
              <Clock className="w-4 h-4 text-[#219EBC]" />
              <div>
                <p className="text-xs font-semibold text-[#023047]">Preferred Time</p>
                <p className="text-sm text-muted-foreground">{interview.preferredTime}</p>
              </div>
            </div>
          </div>

          {/* Request Date */}
          <div className="text-xs text-muted-foreground">
            Requested {new Date(interview.createdAt).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric'
            })} at {new Date(interview.createdAt).toLocaleTimeString('en-US', {
              hour: 'numeric',
              minute: '2-digit'
            })}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <Button
              onClick={() => setShowApproveDialog(true)}
              disabled={loading}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  Approve
                </>
              )}
            </Button>
            <Button
              onClick={() => setShowRejectDialog(true)}
              disabled={loading}
              variant="destructive"
              className="flex-1 font-bold rounded-xl"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <XCircle className="w-4 h-4" />
                  Reject
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Approve Confirmation Dialog */}
      <Dialog open={showApproveDialog} onOpenChange={setShowApproveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve Mock Interview</DialogTitle>
            <DialogDescription>
              Are you sure you want to approve this mock interview request? The candidate will be notified.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="space-y-2 text-sm">
              <p><strong>Candidate:</strong> {interview.user.name}</p>
              <p><strong>Type:</strong> {interviewTypeLabels[interview.interviewType] || interview.interviewType}</p>
              <p><strong>Level:</strong> {experienceLevelLabels[interview.experienceLevel] || interview.experienceLevel}</p>
              <p><strong>Preferred Date:</strong> {new Date(interview.preferredDate).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
              })}</p>
              <p><strong>Preferred Time:</strong> {interview.preferredTime}</p>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowApproveDialog(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleApprove}
              disabled={loading}
              className="bg-green-600 hover:bg-green-700"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Approving...
                </>
              ) : (
                "Confirm Approval"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Mock Interview</DialogTitle>
            <DialogDescription>
              Please provide feedback for rejecting this interview request. The candidate will receive this message.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="feedback" className="text-sm font-semibold">
              Rejection Feedback *
            </Label>
            <Textarea
              id="feedback"
              placeholder="Enter feedback for rejection (minimum 10 characters)"
              value={feedback}
              onChange={(e) => {
                setFeedback(e.target.value);
                if (e.target.value.trim().length >= 10) {
                  setFeedbackError("");
                }
              }}
              className="mt-2 min-h-[100px]"
            />
            {feedbackError && (
              <p className="text-sm text-red-600 mt-2">{feedbackError}</p>
            )}
            <p className="text-xs text-muted-foreground mt-2">
              {feedback.length}/10 characters minimum
            </p>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowRejectDialog(false);
                setFeedback("");
                setFeedbackError("");
              }}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleReject}
              disabled={loading}
              variant="destructive"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Rejecting...
                </>
              ) : (
                "Confirm Rejection"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
