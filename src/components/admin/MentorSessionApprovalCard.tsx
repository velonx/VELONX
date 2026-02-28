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
import { Calendar, Clock, User, BookOpen, CheckCircle, XCircle, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

interface MentorSessionApprovalCardProps {
  session: {
    id: string;
    student: { name: string; email: string };
    mentor: { name: string; expertise: string[] };
    title: string;
    date: Date;
    duration: number;
    notes?: string;
    createdAt: Date;
  };
  onApprove: (id: string) => Promise<void>;
  onReject: (id: string, reason: string) => Promise<void>;
}

export default function MentorSessionApprovalCard({
  session,
  onApprove,
  onReject,
}: MentorSessionApprovalCardProps) {
  const [loading, setLoading] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [reasonError, setReasonError] = useState("");

  const handleApprove = async () => {
    setLoading(true);
    try {
      await onApprove(session.id);
      toast.success("Mentor session approved successfully");
      setShowApproveDialog(false);
    } catch (error) {
      toast.error("Failed to approve session");
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    // Validate rejection reason
    if (rejectionReason.trim().length < 10) {
      setReasonError("Rejection reason must be at least 10 characters");
      return;
    }

    setLoading(true);
    try {
      await onReject(session.id, rejectionReason);
      toast.success("Mentor session rejected");
      setShowRejectDialog(false);
      setRejectionReason("");
      setReasonError("");
    } catch (error) {
      toast.error("Failed to reject session");
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
                {session.title}
              </CardTitle>
              <div className="flex flex-wrap gap-2">
                {session.mentor.expertise.slice(0, 3).map((skill) => (
                  <Badge key={skill} variant="secondary" className="text-xs">
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>
            <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
              PENDING
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Student Info */}
          <div className="flex items-center gap-3 p-3 bg-muted rounded-xl">
            <User className="w-5 h-5 text-[#219EBC]" />
            <div>
              <p className="text-sm font-semibold text-[#023047]">Student</p>
              <p className="text-sm text-muted-foreground">{session.student.name}</p>
              <p className="text-xs text-muted-foreground">{session.student.email}</p>
            </div>
          </div>

          {/* Mentor Info */}
          <div className="flex items-center gap-3 p-3 bg-muted rounded-xl">
            <BookOpen className="w-5 h-5 text-[#219EBC]" />
            <div>
              <p className="text-sm font-semibold text-[#023047]">Mentor</p>
              <p className="text-sm text-muted-foreground">{session.mentor.name}</p>
            </div>
          </div>

          {/* Session Details */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2 p-3 bg-muted rounded-xl">
              <Calendar className="w-4 h-4 text-[#219EBC]" />
              <div>
                <p className="text-xs font-semibold text-[#023047]">Date</p>
                <p className="text-sm text-muted-foreground">
                  {new Date(session.date).toLocaleDateString('en-US', {
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
                <p className="text-xs font-semibold text-[#023047]">Duration</p>
                <p className="text-sm text-muted-foreground">{session.duration} min</p>
              </div>
            </div>
          </div>

          {/* Notes */}
          {session.notes && (
            <div className="p-3 bg-muted rounded-xl">
              <p className="text-xs font-semibold text-[#023047] mb-1">Notes</p>
              <p className="text-sm text-muted-foreground">{session.notes}</p>
            </div>
          )}

          {/* Request Date */}
          <div className="text-xs text-muted-foreground">
            Requested {new Date(session.createdAt).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric'
            })} at {new Date(session.createdAt).toLocaleTimeString('en-US', {
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
            <DialogTitle>Approve Mentor Session</DialogTitle>
            <DialogDescription>
              Are you sure you want to approve this mentor session? The student and mentor will be notified.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="space-y-2 text-sm">
              <p><strong>Student:</strong> {session.student.name}</p>
              <p><strong>Mentor:</strong> {session.mentor.name}</p>
              <p><strong>Topic:</strong> {session.title}</p>
              <p><strong>Date:</strong> {new Date(session.date).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
              })}</p>
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
            <DialogTitle>Reject Mentor Session</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this session. The student will receive this feedback.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="reason" className="text-sm font-semibold">
              Rejection Reason *
            </Label>
            <Textarea
              id="reason"
              placeholder="Enter reason for rejection (minimum 10 characters)"
              value={rejectionReason}
              onChange={(e) => {
                setRejectionReason(e.target.value);
                if (e.target.value.trim().length >= 10) {
                  setReasonError("");
                }
              }}
              className="mt-2 min-h-[100px]"
            />
            {reasonError && (
              <p className="text-sm text-red-600 mt-2">{reasonError}</p>
            )}
            <p className="text-xs text-muted-foreground mt-2">
              {rejectionReason.length}/10 characters minimum
            </p>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowRejectDialog(false);
                setRejectionReason("");
                setReasonError("");
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
