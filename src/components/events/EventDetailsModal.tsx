"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Video,
  CheckCircle2,
  Download,
  ExternalLink,
  AlertCircle,
  Sparkles,
  User,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { Event } from "@/lib/api/types";
import { eventsApi } from "@/lib/api/client";
import { cn } from "@/lib/utils";
import { CalendarExportMenu } from "./CalendarExportMenu";

interface EventDetailsModalProps {
  event: Event | null;
  isOpen: boolean;
  onClose: () => void;
  onRegister?: (eventId: string) => void;
  onUnregister?: (eventId: string) => void;
  isRegistered?: boolean;
  isLoading?: boolean;
  userRole?: 'STUDENT' | 'ADMIN';
}

/**
 * EventDetailsModal Component
 * Requirements: 2.4-2.9, 2.6
 * 
 * Features:
 * - Modal layout using Dialog component
 * - Event header with gradient background and icon
 * - Full description section with proper formatting
 * - Event metadata section (date, time, location, duration, platform)
 * - Creator information section with avatar
 * - Registration button with conditional states
 * - Calendar export button
 * - Attendee list with avatars (admin only)
 * - "See all attendees" expansion for long lists
 * - Mobile-optimized (full-screen on mobile)
 */
export default function EventDetailsModal({
  event,
  isOpen,
  onClose,
  onRegister,
  onUnregister,
  isRegistered = false,
  isLoading = false,
  userRole
}: EventDetailsModalProps) {
  const [attendees, setAttendees] = useState<Array<{
    id: string;
    user: {
      id: string;
      name: string | null;
      image: string | null;
    };
  }>>([]);
  const [isLoadingAttendees, setIsLoadingAttendees] = useState(false);
  const [showAllAttendees, setShowAllAttendees] = useState(false);
  const [attendeesError, setAttendeesError] = useState<string | null>(null);

  const isAdmin = userRole === 'ADMIN';
  const INITIAL_ATTENDEES_DISPLAY = 12;

  // Fetch attendees when modal opens (admin only)
   
  useEffect(() => {
    if (isOpen && event && isAdmin) {
      setIsLoadingAttendees(true);
      setAttendeesError(null);

      eventsApi.getAttendees(event.id)
        .then((response) => {
          if (response.success) {
            setAttendees(response.data.attendees.map(a => ({
              id: a.id,
              user: a.user
            })));
          }
        })
        .catch((error) => {
          console.error('Failed to fetch attendees:', error);
          setAttendeesError('Failed to load attendees');
        })
        .finally(() => {
          setIsLoadingAttendees(false);
        });
    } else {
      // Reset attendees when modal closes or user is not admin
      setAttendees([]);
      setShowAllAttendees(false);
      setAttendeesError(null);
    }
  }, [isOpen, event, isAdmin]);

  if (!event) return null;

  // Calculate attendee information
  const attendeeCount = event._count?.attendees || 0;
  const attendeePercentage = (attendeeCount / event.maxSeats) * 100;
  const isFull = attendeeCount >= event.maxSeats;
  const isAlmostFull = attendeePercentage >= 80;
  const spotsLeft = event.maxSeats - attendeeCount;

  // Calculate time-based properties
  const eventDate = new Date(event.date);
  const now = new Date();
  const hoursUntilEvent = (eventDate.getTime() - now.getTime()) / (1000 * 60 * 60);
  const isStartingSoon = hoursUntilEvent > 0 && hoursUntilEvent < 24;

  // Calculate if event is new (created within last 7 days)
  const createdDate = new Date(event.createdAt);
  const daysOld = (now.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24);
  const isNew = daysOld < 7;

  // Calculate duration
  const duration = event.endDate
    ? Math.round((new Date(event.endDate).getTime() - eventDate.getTime()) / (1000 * 60 * 60))
    : null;

  // Format time
  const timeString = eventDate.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });

  // Format date
  const dateString = eventDate.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });

  // Get platform icon and name
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
          "bg-card border border-border text-foreground p-0 gap-0 overflow-hidden",
          "max-w-4xl max-h-[90vh]",
          // Full-screen on mobile with proper positioning
          "sm:rounded-2xl",
          "max-sm:w-screen max-sm:h-screen max-sm:max-w-full max-sm:max-h-full max-sm:rounded-none",
          "max-sm:fixed max-sm:inset-0 max-sm:translate-x-0 max-sm:translate-y-0 max-sm:top-0 max-sm:left-0"
        )}
        showCloseButton={false}
      >
        {/* Header with Image or Gradient Background */}
        <div className={cn(
          "relative",
          !event.imageUrl ? `bg-gradient-to-br ${getTypeColor()}` : 'bg-card',
          "p-6 pb-10 sm:p-8 sm:pb-12",
          "h-48 sm:h-64 flex items-end justify-center"
        )}>
          {/* Event Image (if available) */}
          {event.imageUrl ? (
            <>
              <Image
                src={event.imageUrl}
                alt={`${event.title} banner`}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 900px"
                quality={90}
                priority
              />
              {/* Dark overlay for text readability */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20" />
            </>
          ) : null}
          <button
            onClick={onClose}
            className={cn(
              "absolute top-4 right-4 z-20 rounded-full bg-black/30 hover:bg-black/50 backdrop-blur-md transition-all",
              "p-2.5 sm:p-2",
              // Minimum 44x44px touch target for mobile
              "min-w-[44px] min-h-[44px] flex items-center justify-center"
            )}
            aria-label="Close modal"
          >
            <ExternalLink className="w-5 h-5 rotate-45 text-white" />
          </button>

          {/* Urgency Badges - WCAG AA Compliant */}
          <div className="absolute top-4 left-4 z-20 flex flex-wrap gap-1.5 sm:gap-2 max-w-[calc(100%-80px)]">
            <Badge className="bg-white/30 text-white border-0 uppercase text-[9px] sm:text-[10px] font-bold tracking-widest px-2 py-1 sm:px-3 backdrop-blur-md shadow-lg">
              {event.type}
            </Badge>
            {isNew && (
              <Badge className="bg-blue-600/90 text-white border-0 uppercase text-[9px] sm:text-[10px] font-bold tracking-widest px-2 py-1 sm:px-3 backdrop-blur-md flex items-center gap-1 shadow-lg">
                <Sparkles className="w-2.5 h-2.5 sm:w-3 sm:h-3" /> New
              </Badge>
            )}
            {isStartingSoon && !isFull && (
              <Badge className="bg-orange-600/90 text-white border-0 uppercase text-[9px] sm:text-[10px] font-bold tracking-widest px-2 py-1 sm:px-3 backdrop-blur-md flex items-center gap-1 shadow-lg">
                <AlertCircle className="w-2.5 h-2.5 sm:w-3 sm:h-3" /> Starting Soon
              </Badge>
            )}
            {isAlmostFull && !isFull && (
              <Badge className="bg-red-600/90 text-white border-0 uppercase text-[9px] sm:text-[10px] font-bold tracking-widest px-2 py-1 sm:px-3 backdrop-blur-md flex items-center gap-1 shadow-lg">
                <AlertCircle className="w-2.5 h-2.5 sm:w-3 sm:h-3" /> Almost Full
              </Badge>
            )}
          </div>

          {/* Event Icon or Title - Only show icon when no image */}
          {!event.imageUrl ? (
            <div className="flex justify-center mb-4 sm:mb-6 mt-10 sm:mt-12 z-10">
              <div className="text-6xl sm:text-8xl">
                {getTypeIcon()}
              </div>
            </div>
          ) : (
            <div className="flex-1" />
          )}

          <DialogHeader className="text-center space-y-2 sm:space-y-3 px-2 z-10 relative">
            <DialogTitle className="text-2xl sm:text-4xl font-bold text-white leading-tight drop-shadow-lg">
              {event.title}
            </DialogTitle>
            <DialogDescription className="text-white/90 text-base sm:text-lg drop-shadow-md">
              {event.status}
            </DialogDescription>
          </DialogHeader>
        </div>

        {/* Scrollable Content - optimized for mobile scrolling */}
        <ScrollArea className={cn(
          "flex-1",
          "max-h-[calc(90vh-400px)] sm:max-h-[calc(90vh-400px)]",
          "max-sm:max-h-[calc(100vh-320px)]",
          // Enable smooth momentum scrolling on iOS
          "max-sm:[&>div]:overflow-y-auto max-sm:[&>div]:[-webkit-overflow-scrolling:touch]"
        )}>
          <div className="p-4 sm:p-8 space-y-6 sm:space-y-8">
            {/* Event Metadata Section - responsive grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              {/* Date */}
              <div className="flex items-start gap-3 p-3 sm:p-4 bg-muted/30 rounded-xl border border-border">
                <div className="p-2 bg-primary/20 rounded-lg flex-shrink-0">
                  <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1">Date</p>
                  <p className="text-foreground font-medium text-sm sm:text-base break-words">{dateString}</p>
                </div>
              </div>

              {/* Time */}
              <div className="flex items-start gap-3 p-3 sm:p-4 bg-white/5 rounded-xl border border-white/10">
                <div className="p-2 bg-[#219EBC]/20 rounded-lg flex-shrink-0">
                  <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-[#219EBC]" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-gray-300 uppercase tracking-wider font-semibold mb-1">Time</p>
                  <p className="text-white font-medium text-sm sm:text-base">{timeString}</p>
                </div>
              </div>

              {/* Duration */}
              {duration && (
                <div className="flex items-start gap-3 p-3 sm:p-4 bg-white/5 rounded-xl border border-white/10">
                  <div className="p-2 bg-purple-500/20 rounded-lg flex-shrink-0">
                    <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-purple-400" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-gray-300 uppercase tracking-wider font-semibold mb-1">Duration</p>
                    <p className="text-white font-medium text-sm sm:text-base">{duration} {duration === 1 ? 'hour' : 'hours'}</p>
                  </div>
                </div>
              )}

              {/* Platform/Location */}
              {platformInfo && (
                <div className="flex items-start gap-3 p-3 sm:p-4 bg-white/5 rounded-xl border border-white/10">
                  <div className={cn("p-2 rounded-lg flex-shrink-0", platformInfo.color.replace('text-', 'bg-') + '/20')}>
                    <platformInfo.icon className={cn("w-4 h-4 sm:w-5 sm:h-5", platformInfo.color)} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-gray-300 uppercase tracking-wider font-semibold mb-1">Platform</p>
                    <p className="text-white font-medium text-sm sm:text-base break-words">{platformInfo.name}</p>
                  </div>
                </div>
              )}

              {/* Attendees */}
              <div className="flex items-start gap-3 p-3 sm:p-4 bg-muted/30 rounded-xl border border-border sm:col-span-2">
                <div className="p-2 bg-orange-500/20 rounded-lg flex-shrink-0">
                  <Users className="w-4 h-4 sm:w-5 sm:h-5 text-orange-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-300 uppercase tracking-wider font-semibold mb-2">Attendees</p>
                  <div className="flex items-center justify-between mb-2 gap-2">
                    <p className="text-white font-medium text-sm sm:text-base">{attendeeCount} / {event.maxSeats} registered</p>
                    {!isFull && (
                      <p className="text-xs sm:text-sm text-gray-300 flex-shrink-0">{spotsLeft} {spotsLeft === 1 ? 'spot' : 'spots'} left</p>
                    )}
                  </div>
                  <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                    <div
                      className={cn(
                        "h-full rounded-full transition-all duration-500",
                        isAlmostFull
                          ? "bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]"
                          : "bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.5)]"
                      )}
                      style={{ width: `${Math.min(attendeePercentage, 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            <Separator className="bg-white/10" />

            {/* Description Section - WCAG AA Compliant */}
            <div>
              <h3 className="text-lg sm:text-xl font-bold text-white mb-3 sm:mb-4 flex items-center gap-2">
                <span className="text-xl sm:text-2xl">📝</span>
                About This Event
              </h3>
              <div className="prose prose-invert max-w-none">
                <p className="text-gray-200 text-sm sm:text-base leading-relaxed whitespace-pre-wrap">
                  {event.description}
                </p>
              </div>
            </div>

            <Separator className="bg-white/10" />

            {/* Creator Information Section - responsive layout */}
            {event.creator && (
              <div>
                <h3 className="text-lg sm:text-xl font-bold text-white mb-3 sm:mb-4 flex items-center gap-2">
                  <span className="text-xl sm:text-2xl">👤</span>
                  Event Organizer
                </h3>
                <div className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-white/5 rounded-xl border border-white/10">
                  <Avatar className="w-12 h-12 sm:w-16 sm:h-16 border-2 border-[#219EBC] flex-shrink-0">
                    <AvatarImage src={event.creator.image || undefined} alt={event.creator.name || 'Organizer'} />
                    <AvatarFallback className="bg-[#219EBC] text-white text-lg sm:text-xl font-bold">
                      {event.creator.name?.[0]?.toUpperCase() || <User className="w-6 h-6 sm:w-8 sm:h-8" />}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <p className="text-white font-semibold text-base sm:text-lg truncate">{event.creator.name || 'Anonymous'}</p>
                    <p className="text-gray-400 text-xs sm:text-sm">Event Organizer</p>
                  </div>
                </div>
              </div>
            )}

            {/* Meeting Link Section (Only for Registered Users) - responsive layout */}
            {isRegistered && event.meetingLink && (
              <>
                <Separator className="bg-white/10" />
                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-white mb-3 sm:mb-4 flex items-center gap-2">
                    <span className="text-xl sm:text-2xl">🔗</span>
                    Meeting Link
                  </h3>
                  <div className="p-3 sm:p-4 bg-white/5 rounded-xl border border-white/10 space-y-3">
                    <p className="text-gray-400 text-xs sm:text-sm">
                      You're registered! Use the link below to join the event.
                    </p>
                    <div className="flex items-center gap-2 p-2 sm:p-3 bg-[#0a0f1a] rounded-lg border border-white/5">
                      <Video className="w-4 h-4 sm:w-5 sm:h-5 text-[#219EBC] flex-shrink-0" />
                      <code className="text-[#219EBC] text-xs sm:text-sm flex-1 truncate">
                        {event.meetingLink}
                      </code>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Button
                        onClick={() => {
                          navigator.clipboard.writeText(event.meetingLink!);
                          // Show toast notification
                          const toast = document.createElement('div');
                          toast.className = 'fixed bottom-4 right-4 bg-green-600 text-white px-4 py-3 rounded-lg shadow-lg z-50 flex items-center gap-2 animate-in slide-in-from-bottom-5';
                          toast.innerHTML = '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg><span>Meeting link copied to clipboard!</span>';
                          document.body.appendChild(toast);
                          setTimeout(() => {
                            toast.remove();
                          }, 3000);
                        }}
                        variant="outline"
                        className="w-full h-11 sm:h-auto border-2 border-white/10 hover:border-[#219EBC] text-white hover:text-[#219EBC] font-semibold rounded-xl transition-all bg-transparent"
                      >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                        Copy Link
                      </Button>
                      <Button
                        onClick={() => {
                          window.open(event.meetingLink!, '_blank', 'noopener,noreferrer');
                        }}
                        className="w-full h-11 sm:h-auto bg-gradient-to-r from-blue-600 to-violet-600 hover:scale-[1.02] active:scale-[0.98] text-white font-semibold rounded-xl transition-all shadow-lg shadow-blue-600/20"
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Join Meeting
                      </Button>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Attendee List Section (Admin Only) - responsive grid */}
            {isAdmin && (
              <>
                <Separator className="bg-white/10" />
                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-white mb-3 sm:mb-4 flex items-center gap-2">
                    <span className="text-xl sm:text-2xl">👥</span>
                    Registered Attendees
                    <Badge className="bg-[#219EBC]/20 text-[#219EBC] border-0 ml-2 text-xs">
                      {attendees.length}
                    </Badge>
                  </h3>

                  {isLoadingAttendees ? (
                    <div className="flex items-center justify-center p-6 sm:p-8">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-8 h-8 border-4 border-[#219EBC] border-t-transparent rounded-full animate-spin" />
                        <p className="text-gray-400 text-xs sm:text-sm">Loading attendees...</p>
                      </div>
                    </div>
                  ) : attendeesError ? (
                    <div className="flex items-center justify-center p-6 sm:p-8">
                      <div className="flex flex-col items-center gap-3 text-center">
                        <AlertCircle className="w-10 h-10 sm:w-12 sm:h-12 text-red-400" />
                        <p className="text-red-400 text-xs sm:text-sm">{attendeesError}</p>
                      </div>
                    </div>
                  ) : attendees.length === 0 ? (
                    <div className="flex items-center justify-center p-6 sm:p-8">
                      <div className="flex flex-col items-center gap-3 text-center">
                        <Users className="w-10 h-10 sm:w-12 sm:h-12 text-gray-500" />
                        <p className="text-gray-400 text-xs sm:text-sm">No attendees registered yet</p>
                      </div>
                    </div>
                  ) : (
                    <div>
                      {/* Attendee Grid - responsive columns */}
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
                        {(showAllAttendees
                          ? attendees
                          : attendees.slice(0, INITIAL_ATTENDEES_DISPLAY)
                        ).map((attendee) => (
                          <div
                            key={attendee.id}
                            className="flex flex-col items-center gap-2 p-2.5 sm:p-3 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-colors"
                          >
                            <Avatar className="w-10 h-10 sm:w-12 sm:h-12 border-2 border-[#219EBC]">
                              <AvatarImage
                                src={attendee.user.image || undefined}
                                alt={attendee.user.name || 'Attendee'}
                              />
                              <AvatarFallback className="bg-[#219EBC] text-white text-xs sm:text-sm font-bold">
                                {attendee.user.name?.[0]?.toUpperCase() || <User className="w-5 h-5 sm:w-6 sm:h-6" />}
                              </AvatarFallback>
                            </Avatar>
                            <p className="text-white text-[11px] sm:text-xs font-medium text-center line-clamp-2 w-full px-1">
                              {attendee.user.name || 'Anonymous'}
                            </p>
                          </div>
                        ))}
                      </div>

                      {/* See All / Show Less Button - larger touch target on mobile */}
                      {attendees.length > INITIAL_ATTENDEES_DISPLAY && (
                        <div className="mt-4 flex justify-center">
                          <Button
                            onClick={() => setShowAllAttendees(!showAllAttendees)}
                            variant="outline"
                            className="h-11 sm:h-auto border-2 border-white/10 hover:border-[#219EBC] text-white hover:text-[#219EBC] font-semibold rounded-xl transition-all bg-transparent"
                          >
                            {showAllAttendees ? (
                              <>
                                <ChevronUp className="w-4 h-4 mr-2" />
                                Show Less
                              </>
                            ) : (
                              <>
                                <ChevronDown className="w-4 h-4 mr-2" />
                                See All {attendees.length} Attendees
                              </>
                            )}
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </ScrollArea>

        {/* Footer - Action Buttons - responsive layout with larger touch targets */}
        <div className="p-4 sm:p-6 bg-[#0a0f1a] border-t border-white/10 flex flex-col gap-2.5 sm:gap-3">
          {/* Calendar Export Button - full width on mobile */}
          <CalendarExportMenu
            event={event}
            isRegistered={isRegistered}
            variant="outline"
            size="default"
            className="w-full h-12 sm:h-12 border-2 border-white/10 hover:border-[#219EBC] text-white hover:text-[#219EBC] font-semibold rounded-xl transition-all bg-transparent"
          />

          {/* Register/Unregister Button - full width on mobile with larger touch target */}
          {isRegistered ? (
            <Button
              onClick={() => onUnregister?.(event.id)}
              disabled={isLoading}
              className="w-full h-12 sm:h-12 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all"
            >
              <CheckCircle2 className="w-5 h-5" />
              {isLoading ? 'Processing...' : 'Registered'}
            </Button>
          ) : (
            <Button
              onClick={() => onRegister?.(event.id)}
              disabled={isFull || isLoading}
              className={cn(
                "w-full h-12 sm:h-12 font-bold rounded-xl flex items-center justify-center gap-2 transition-all",
                isFull || isLoading
                  ? "bg-gray-600 cursor-not-allowed opacity-50"
                  : "bg-gradient-to-r from-blue-600 to-violet-600 hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-blue-600/20"
              )}
            >
              {isLoading ? 'Processing...' : isFull ? 'Event Full' : 'Register Now'}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
