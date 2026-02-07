"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Video, X, Star, MessageCircle } from "lucide-react";
import toast from "react-hot-toast";

interface SessionCardProps {
  session: {
    id: string;
    title: string;
    description?: string;
    date: string;
    duration: number;
    status: string;
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
  };
  onCancel?: (id: string) => void;
  onReview?: (id: string) => void;
}

export default function SessionCard({ session, onCancel, onReview }: SessionCardProps) {
  const [cancelling, setCancelling] = useState(false);

  const sessionDate = new Date(session.date);
  const now = new Date();
  const isPast = sessionDate < now;
  const isUpcoming = sessionDate > now;
  const canJoin = sessionDate <= now && sessionDate > new Date(now.getTime() - session.duration * 60000);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-orange-50 text-orange-600';
      case 'CONFIRMED':
        return 'bg-blue-50 text-blue-600';
      case 'COMPLETED':
        return 'bg-green-50 text-green-600';
      case 'CANCELLED':
        return 'bg-red-50 text-red-600';
      case 'NO_SHOW':
        return 'bg-gray-50 text-gray-600';
      default:
        return 'bg-gray-50 text-gray-600';
    }
  };

  const handleCancel = async () => {
    if (!confirm('Are you sure you want to cancel this session?')) {
      return;
    }

    setCancelling(true);
    try {
      const response = await fetch(`/api/mentor-sessions/${session.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Session cancelled successfully');
        if (onCancel) onCancel(session.id);
      } else {
        const data = await response.json();
        toast.error(data.error?.message || 'Failed to cancel session');
      }
    } catch (error) {
      toast.error('Failed to cancel session');
    } finally {
      setCancelling(false);
    }
  };

  return (
    <Card className="bg-white border border-gray-200 hover:border-[#219EBC] hover:shadow-lg transition-all">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4 flex-1">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#219EBC] to-[#023047] flex items-center justify-center text-white font-black text-lg shadow-lg">
              {session.mentor.name.split(' ').map(n => n[0]).join('')}
            </div>
            <div className="flex-1">
              <CardTitle className="text-lg text-[#023047] mb-1">{session.title}</CardTitle>
              <p className="text-sm text-gray-500 mb-2">
                with <span className="font-bold">{session.mentor.name}</span> • {session.mentor.company}
              </p>
              <div className="flex flex-wrap gap-1">
                {session.mentor.expertise.slice(0, 3).map((skill, idx) => (
                  <span key={idx} className="text-xs bg-gray-100 px-2 py-0.5 rounded-lg text-gray-600">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>
          <Badge className={`${getStatusColor(session.status)} border-0 font-bold text-xs`}>
            {session.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Session Details */}
        <div className="bg-gray-50 rounded-xl p-4 space-y-2">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Calendar className="w-4 h-4" />
            <span>
              {sessionDate.toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Clock className="w-4 h-4" />
            <span>
              {sessionDate.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
              })}{' '}
              • {session.duration} minutes
            </span>
          </div>
        </div>

        {/* Description */}
        {session.description && (
          <p className="text-sm text-gray-600 leading-relaxed">{session.description}</p>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          {/* Join Meeting Button */}
          {canJoin && session.meetingLink && session.status === 'CONFIRMED' && (
            <Button
              onClick={() => window.open(session.meetingLink, '_blank')}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl"
            >
              <Video className="w-4 h-4 mr-2" />
              Join Meeting
            </Button>
          )}

          {/* Review Button */}
          {session.status === 'COMPLETED' && !session.review && onReview && (
            <Button
              onClick={() => onReview(session.id)}
              className="flex-1 bg-[#219EBC] hover:bg-[#1a7a94] text-white font-bold rounded-xl"
            >
              <Star className="w-4 h-4 mr-2" />
              Leave Review
            </Button>
          )}

          {/* Already Reviewed */}
          {session.status === 'COMPLETED' && session.review && (
            <div className="flex-1 bg-green-50 rounded-xl p-3 flex items-center justify-center gap-2">
              <Star className="w-4 h-4 text-green-600 fill-green-600" />
              <span className="text-sm font-bold text-green-600">
                Reviewed ({session.review.rating}/5)
              </span>
            </div>
          )}

          {/* Cancel Button */}
          {(session.status === 'PENDING' || session.status === 'CONFIRMED') && isUpcoming && (
            <Button
              onClick={handleCancel}
              disabled={cancelling}
              variant="outline"
              className="border-2 border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 font-bold rounded-xl"
            >
              {cancelling ? (
                <>Cancelling...</>
              ) : (
                <>
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </>
              )}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
