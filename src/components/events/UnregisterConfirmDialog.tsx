"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Calendar,
  Clock,
  MapPin,
  Video,
  AlertTriangle,
  XCircle,
  Loader2
} from "lucide-react";
import { Event } from "@/lib/api/types";
import { cn } from "@/lib/utils";

interface UnregisterConfirmDialogProps {
  event: Event | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoading?: boolean;
}

/**
 * UnregisterConfirmDialog Component
 * Requirements: 3.4, 3.5
 * 
 * Features:
 * - Confirmation dialog before unregistering
 * - Shows event details (title, date, time, platform)
 * - Shows warning message about unregistering
 * - "Confirm" and "Cancel" buttons
 * - Loading state during unregistration
 */
export default function UnregisterConfirmDialog({
  event,
  isOpen,
  onClose,
  onConfirm,
  isLoading = false
}: UnregisterConfirmDialogProps) {
  if (!event) return null;

  // Format event date and time
  const eventDate = new Date(event.date);
  const dateString = eventDate.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });
  const timeString = eventDate.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });

  // Calculate duration
  const duration = event.endDate
    ? Math.round((new Date(event.endDate).getTime() - eventDate.getTime()) / (1000 * 60 * 60))
    : null;

  // Get platform info
  const getPlatformInfo = () => {
    if (!event.location) return null;

    const location = event.location.toLowerCase();
    if (location.includes('google meet') || location.includes('meet.google')) {
      return { icon: Video, name: 'Google Meet', color: 'text-green-500' };
    }
    if (location.includes('zoom')) {
      return { icon: Video, name: 'Zoom', color: 'text-blue-500' };
    }
    if (location.includes('teams') || location.includes('microsoft')) {
      return { icon: Video, name: 'Microsoft Teams', color: 'text-purple-500' };
    }
    if (location.includes('discord')) {
      return { icon: Video, name: 'Discord', color: 'text-indigo-500' };
    }
    // Physical location
    return { icon: MapPin, name: event.location, color: 'text-orange-500' };
  };

  const platformInfo = getPlatformInfo();

  // Get event type color
  const getTypeColor = () => {
    switch (event.type) {
      case 'HACKATHON':
        return 'from-red-500 to-rose-600';
      case 'WORKSHOP':
        return 'from-blue-600 to-cyan-500';
      case 'WEBINAR':
        return 'from-indigo-600 to-blue-700';
      default:
        return 'from-purple-600 to-pink-600';
    }
  };

  // Get event type icon
  const getTypeIcon = () => {
    switch (event.type) {
      case 'HACKATHON':
        return '🏆';
      case 'WORKSHOP':
        return '🛠️';
      case 'WEBINAR':
        return '📺';
      default:
        return '✨';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className={cn(
          "bg-[#0f172a] border-0 text-white p-0 gap-0 overflow-hidden",
          "max-w-2xl",
          "sm:rounded-[24px]"
        )}
      >
        {/* Header with Gradient */}
        <div className={cn(
          "relative bg-gradient-to-br",
          getTypeColor(),
          "p-6 pb-8"
        )}>
          {/* Event Type Badge */}
          <div className="flex justify-center mb-4">
            <Badge className="bg-white/20 text-white border-0 uppercase text-[10px] font-bold tracking-widest px-3 py-1 backdrop-blur-md">
              {event.type}
            </Badge>
          </div>

          {/* Event Icon */}
          <div className="flex justify-center mb-4">
            <div className="text-6xl">
              {getTypeIcon()}
            </div>
          </div>

          {/* Dialog Header */}
          <DialogHeader className="text-center space-y-2">
            <DialogTitle className="text-2xl font-bold text-white leading-tight">
              Unregister from Event
            </DialogTitle>
            <DialogDescription className="text-white/80 text-base">
              Are you sure you want to unregister?
            </DialogDescription>
          </DialogHeader>
        </div>

        {/* Event Summary */}
        <div className="p-6 space-y-6">
          {/* Event Title */}
          <div className="text-center">
            <h3 className="text-xl font-bold text-white mb-2">
              {event.title}
            </h3>
            <p className="text-gray-400 text-sm line-clamp-2">
              {event.description}
            </p>
          </div>

          <Separator className="bg-white/10" />

          {/* Event Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Date */}
            <div className="flex items-start gap-3 p-3 bg-white/5 rounded-xl border border-white/10">
              <div className="p-2 bg-[#219EBC]/20 rounded-lg flex-shrink-0">
                <Calendar className="w-4 h-4 text-[#219EBC]" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-1">
                  Date
                </p>
                <p className="text-white text-sm font-medium truncate">
                  {dateString}
                </p>
              </div>
            </div>

            {/* Time */}
            <div className="flex items-start gap-3 p-3 bg-white/5 rounded-xl border border-white/10">
              <div className="p-2 bg-[#219EBC]/20 rounded-lg flex-shrink-0">
                <Clock className="w-4 h-4 text-[#219EBC]" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-1">
                  Time
                </p>
                <p className="text-white text-sm font-medium">
                  {timeString}
                  {duration && <span className="text-gray-400 ml-1">({duration}h)</span>}
                </p>
              </div>
            </div>

            {/* Platform/Location */}
            {platformInfo && (
              <div className="flex items-start gap-3 p-3 bg-white/5 rounded-xl border border-white/10 sm:col-span-2">
                <div className={cn(
                  "p-2 rounded-lg flex-shrink-0",
                  platformInfo.color.replace('text-', 'bg-') + '/20'
                )}>
                  <platformInfo.icon className={cn("w-4 h-4", platformInfo.color)} />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-1">
                    Platform
                  </p>
                  <p className="text-white text-sm font-medium truncate">
                    {platformInfo.name}
                  </p>
                </div>
              </div>
            )}
          </div>

          <Separator className="bg-white/10" />

          {/* Warning Message */}
          <div className="p-4 bg-red-500/10 rounded-xl border border-red-500/20">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <div className="space-y-2">
                <h4 className="text-white font-semibold text-sm">
                  Please Confirm Unregistration
                </h4>
                <p className="text-gray-300 text-sm leading-relaxed">
                  By unregistering, you will lose your spot in this event. 
                  If the event is popular, you may not be able to register again if it fills up. 
                  This action will free up a spot for other attendees.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer - Action Buttons */}
        <DialogFooter className="p-6 pt-0 flex-col sm:flex-row gap-3">
          <Button
            onClick={onClose}
            disabled={isLoading}
            variant="outline"
            className="flex-1 h-11 border-2 border-white/10 hover:border-white/20 text-white hover:text-white font-semibold rounded-xl transition-all bg-transparent"
          >
            Cancel
          </Button>
          <Button
            onClick={onConfirm}
            disabled={isLoading}
            className={cn(
              "flex-1 h-11 font-bold rounded-xl flex items-center justify-center gap-2 transition-all",
              isLoading
                ? "bg-red-600 cursor-wait"
                : "bg-gradient-to-r from-red-600 to-rose-600 hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-red-600/20"
            )}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Unregistering...
              </>
            ) : (
              <>
                <XCircle className="w-4 h-4" />
                Confirm Unregistration
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
