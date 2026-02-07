"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Star, Loader2, CheckCircle2 } from "lucide-react";
import toast from "react-hot-toast";

interface ReviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  session: {
    id: string;
    title: string;
    mentor: {
      name: string;
      company: string;
    };
  };
  onSuccess?: () => void;
}

export default function ReviewDialog({ open, onOpenChange, session, onSuccess }: ReviewDialogProps) {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (rating === 0) {
      toast.error('Please select a rating');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`/api/mentor-sessions/${session.id}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rating,
          comment: comment.trim() || undefined,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSubmitted(true);
        if (onSuccess) onSuccess();
      } else {
        toast.error(data.error?.message || 'Failed to submit review');
      }
    } catch (error) {
      console.error('Review error:', error);
      toast.error('Failed to submit review');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setRating(0);
    setComment('');
    setSubmitted(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md bg-white rounded-[32px]">
        {!submitted ? (
          <>
            <DialogHeader>
              <DialogTitle className="text-2xl font-black text-[#023047]">
                Rate Your Session
              </DialogTitle>
            </DialogHeader>

            {/* Session Info */}
            <div className="bg-gray-50 rounded-2xl p-4 mb-4">
              <h4 className="font-bold text-[#023047] mb-1">{session.title}</h4>
              <p className="text-sm text-gray-500">
                with {session.mentor.name} • {session.mentor.company}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Star Rating */}
              <div className="space-y-3">
                <Label className="text-sm font-bold text-gray-700">
                  How was your experience? *
                </Label>
                <div className="flex gap-2 justify-center py-4">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoveredRating(star)}
                      onMouseLeave={() => setHoveredRating(0)}
                      className="transition-transform hover:scale-110"
                    >
                      <Star
                        className={`w-12 h-12 ${
                          star <= (hoveredRating || rating)
                            ? 'fill-[#E9C46A] text-[#E9C46A]'
                            : 'text-gray-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>
                {rating > 0 && (
                  <p className="text-center text-sm font-bold text-[#219EBC]">
                    {rating === 5 && 'Excellent!'}
                    {rating === 4 && 'Great!'}
                    {rating === 3 && 'Good'}
                    {rating === 2 && 'Fair'}
                    {rating === 1 && 'Poor'}
                  </p>
                )}
              </div>

              {/* Comment */}
              <div className="space-y-2">
                <Label htmlFor="comment" className="text-sm font-bold text-gray-700">
                  Share your feedback (Optional)
                </Label>
                <textarea
                  id="comment"
                  placeholder="What did you learn? How was the mentor?"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  maxLength={1000}
                  className="w-full h-32 bg-gray-50 border-0 rounded-xl p-4 outline-none focus:ring-2 focus:ring-[#219EBC] resize-none"
                />
                <p className="text-xs text-gray-400 text-right">
                  {comment.length}/1000 characters
                </p>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={loading || rating === 0}
                className="w-full h-12 bg-[#219EBC] hover:bg-[#1a7a94] text-white font-bold rounded-xl"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  'Submit Review'
                )}
              </Button>
            </form>
          </>
        ) : (
          <div className="text-center py-8">
            <div className="w-20 h-20 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-10 h-10 text-green-600" />
            </div>
            <h3 className="text-2xl font-black text-[#023047] mb-2">
              Thank You!
            </h3>
            <p className="text-gray-500 mb-6">
              Your review has been submitted successfully. It helps other students find great mentors!
            </p>
            <Button
              onClick={handleClose}
              className="w-full h-12 bg-[#219EBC] hover:bg-[#1a7a94] text-white font-bold rounded-xl"
            >
              Done
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
