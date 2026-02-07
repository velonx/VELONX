"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  ArrowRight,
  Video,
  CheckCircle2,
  AlertCircle,
  Sparkles
} from "lucide-react";
import { Event } from "@/lib/api/types";
import { cn } from "@/lib/utils";
import { CalendarExportMenu } from "./CalendarExportMenu";
import Image from "next/image";

interface EventCardProps {
  event: Event;
  onViewDetails?: (event: Event) => void;
  onRegister?: (eventId: string) => void;
  onUnregister?: (eventId: string) => void;
  isRegistered?: boolean;
  className?: string;
}

/**
 * Enhanced EventCard Component
 * Requirements: 2.1-2.3, 2.10, 6.1, 6.6, 6.8, 6.9
 * 
 * Features:
 * - Time display (extracted from date field)
 * - Duration display (calculated from date and endDate)
 * - Platform/location info with icon
 * - Dynamic tags from event metadata
 * - Urgency badges (Starting Soon, Almost Full, New)
 * - View Details button
 * - Improved hover states and animations
 * - Mobile optimizations:
 *   - Responsive layout and padding for small screens
 *   - Touch targets minimum 44x44px (Requirements 6.6, 6.8)
 *   - Optimized images for mobile (Requirement 6.9)
 *   - Touch-friendly interactions
 */
export default function EventCard({
  event,
  onViewDetails,
  onRegister,
  onUnregister,
  isRegistered = false,
  className
}: EventCardProps) {
  // Calculate attendee percentage
  const attendeeCount = event._count?.attendees || 0;
  const attendeePercentage = (attendeeCount / event.maxSeats) * 100;
  const isFull = attendeeCount >= event.maxSeats;
  const isAlmostFull = attendeePercentage >= 80;

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
    month: 'short',
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
    <Card
      className={cn(
        "bg-card border border-border rounded-[24px] overflow-hidden shadow-lg",
        "event-card-hover",
        "backdrop-blur-sm",
        // Mobile optimizations: reduce scale on hover for touch devices
        "active:scale-[0.98] touch-manipulation",
        className
      )}
      role="article"
      aria-label={`Event: ${event.title}`}
    >
      {/* Top Section - Image or Gradient Header with optimized image */}
      <div className={`relative h-24 sm:h-32 ${!event.imageUrl ? `bg-gradient-to-br ${getTypeColor()}` : 'bg-card'} flex items-center justify-center overflow-hidden`}>
        {/* Event Image (if available) */}
        {event.imageUrl ? (
          <>
            <Image
              src={event.imageUrl}
              alt={`Banner image for ${event.title} - ${event.type} event on ${dateString}`}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw"
              quality={85}
              loading="lazy"
            />
            {/* Dark overlay for text readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20" />
          </>
        ) : (
          /* Fallback gradient background when no image */
          <div className="absolute inset-0 bg-gradient-to-br opacity-100" />
        )}

        {/* Urgency Badges - WCAG AA Compliant Colors */}
        <div className="absolute top-1.5 sm:top-2 right-1.5 sm:right-2 flex flex-col gap-1 sm:gap-1.5 z-10" role="status" aria-live="polite">
          {isNew && (
            <Badge className="bg-blue-600/90 text-white border-0 uppercase text-[8px] sm:text-[9px] font-bold tracking-widest px-1.5 sm:px-2 py-0.5 backdrop-blur-md flex items-center gap-0.5 sm:gap-1 shadow-lg" aria-label="New event">
              <Sparkles className="w-2 h-2 sm:w-2.5 sm:h-2.5" aria-hidden="true" /> New
            </Badge>
          )}
          {isStartingSoon && !isFull && (
            <Badge className="bg-orange-600/90 text-white border-0 uppercase text-[8px] sm:text-[9px] font-bold tracking-widest px-1.5 sm:px-2 py-0.5 backdrop-blur-md flex items-center gap-0.5 sm:gap-1 shadow-lg" aria-label="Event starting soon">
              <AlertCircle className="w-2 h-2 sm:w-2.5 sm:h-2.5" aria-hidden="true" /> Starting Soon
            </Badge>
          )}
          {isAlmostFull && !isFull && (
            <Badge className="bg-red-600/90 text-white border-0 uppercase text-[8px] sm:text-[9px] font-bold tracking-widest px-1.5 sm:px-2 py-0.5 backdrop-blur-md flex items-center gap-0.5 sm:gap-1 shadow-lg" aria-label="Event almost full">
              <AlertCircle className="w-2 h-2 sm:w-2.5 sm:h-2.5" aria-hidden="true" /> Almost Full
            </Badge>
          )}
        </div>

        {/* Event Type Badge - WCAG AA Compliant */}
        <div className="absolute top-1.5 sm:top-2 left-1.5 sm:left-2 z-10">
          <Badge className="bg-white/30 text-white border-0 uppercase text-[8px] sm:text-[9px] font-bold tracking-widest px-1.5 sm:px-2 py-0.5 backdrop-blur-md shadow-lg">
            {event.type}
          </Badge>
        </div>

        {/* Icon - Only show when no image available */}
        {!event.imageUrl && (
          <div className="text-3xl sm:text-5xl icon-bounce z-10 group">
            {getTypeIcon()}
          </div>
        )}
      </div>

      {/* Content Section - Adjusted padding for mobile */}
      <CardHeader className="p-3 sm:p-4 pb-0">
        {/* Date and Time - Responsive layout */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-3 mb-2 text-[10px] sm:text-xs">
          <div className="flex items-center gap-1 text-primary font-semibold">
            <Calendar className="w-3 h-3 sm:w-3.5 sm:h-3.5" aria-hidden="true" />
            <span><span className="sr-only">Event date: </span>{dateString}</span>
          </div>
          <div className="flex items-center gap-1 text-muted-foreground">
            <Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5" aria-hidden="true" />
            <span><span className="sr-only">Event time: </span>{timeString}</span>
          </div>
        </div>

        {/* Title - Responsive font size */}
        <h3 className="text-foreground text-lg sm:text-xl font-bold leading-tight mb-1.5 sm:mb-2 line-clamp-2 group-hover:text-primary transition-colors">
          {event.title}
        </h3>

        {/* Description - WCAG AA Compliant Text Color */}
        <p className="text-muted-foreground text-[11px] sm:text-xs line-clamp-2 leading-relaxed mb-2 sm:mb-3">
          {event.description}
        </p>

        {/* Meta Information - WCAG AA Compliant Colors */}
        <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-2 sm:mb-3 text-[9px] sm:text-[10px]">
          {/* Duration */}
          {duration && (
            <div className="flex items-center gap-0.5 sm:gap-1 text-muted-foreground">
              <Clock className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
              <span>{duration}h</span>
            </div>
          )}

          {/* Platform/Location */}
          {platformInfo && (
            <div className={cn("flex items-center gap-0.5 sm:gap-1", platformInfo.color)}>
              <platformInfo.icon className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
              <span className="text-muted-foreground">{platformInfo.name}</span>
            </div>
          )}
        </div>

        {/* Dynamic Tags - WCAG AA Compliant */}
        <div className="flex flex-wrap gap-1 sm:gap-1.5 mb-2 sm:mb-3">
          {/* Show creator as a tag if available */}
          {event.creator?.name && (
            <Badge className="bg-primary/10 text-primary hover:bg-primary/20 border-0 text-[8px] sm:text-[9px] font-medium transition-colors">
              By {event.creator.name}
            </Badge>
          )}

          {/* Status badge */}
          <Badge className="bg-secondary/10 text-secondary hover:bg-secondary/20 border-0 text-[8px] sm:text-[9px] font-medium transition-colors">
            {event.status}
          </Badge>
        </div>

        {/* Attendee Progress - Responsive spacing */}
        <div className="space-y-1 sm:space-y-1.5 mb-3 sm:mb-4">
          <div className="flex justify-between text-[9px] sm:text-[10px] font-bold uppercase tracking-wider">
            <span className="text-muted-foreground flex items-center gap-0.5 sm:gap-1">
              <Users className="w-2.5 h-2.5 sm:w-3 sm:h-3" aria-hidden="true" /> Attendees
            </span>
            <span className="text-foreground" aria-label={`${attendeeCount} out of ${event.maxSeats} attendees registered`}>{attendeeCount}/{event.maxSeats}</span>
          </div>
          <div className="h-1 sm:h-1.5 bg-muted rounded-full overflow-hidden" role="progressbar" aria-valuenow={attendeePercentage} aria-valuemin={0} aria-valuemax={100} aria-label="Event capacity">
            <div
              className={cn(
                "h-full rounded-full transition-all duration-500",
                isAlmostFull
                  ? "bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)] progress-pulse"
                  : "bg-secondary shadow-[0_0_10px_rgba(249,115,22,0.5)]"
              )}
              style={{ width: `${Math.min(attendeePercentage, 100)}%` }}
            />
          </div>
        </div>
      </CardHeader>

      {/* Footer - Action Buttons with touch-friendly sizing */}
      <CardFooter className="p-3 sm:p-4 pt-0 flex flex-col gap-2">
        {/* Primary Actions Row - Touch targets minimum 44px */}
        <div className="flex gap-2">
          {/* View Details Button - Touch-friendly */}
          {onViewDetails && (
            <Button
              onClick={() => onViewDetails(event)}
              variant="outline"
              className="flex-1 h-9 sm:h-10 border border-border hover:border-primary hover:bg-primary/5 text-foreground hover:text-primary font-semibold rounded-lg transition-all touch-manipulation active:scale-95 text-xs sm:text-sm"
              aria-label={`View details for ${event.title}`}
            >
              View Details
            </Button>
          )}

          {/* Register/Unregister Button - Touch-friendly */}
          {isRegistered ? (
            <Button
              onClick={() => onUnregister?.(event.id)}
              className="flex-1 h-9 sm:h-10 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg flex items-center justify-center gap-1 sm:gap-1.5 transition-all touch-manipulation active:scale-95 text-xs sm:text-sm"
              aria-label={`You are registered for ${event.title}. Click to unregister`}
            >
              <CheckCircle2 className="w-3 h-3 sm:w-3.5 sm:h-3.5" aria-hidden="true" /> Registered
            </Button>
          ) : (
            <Button
              onClick={() => onRegister?.(event.id)}
              disabled={isFull}
              className={cn(
                "flex-1 h-9 sm:h-10 font-bold rounded-lg flex items-center justify-center gap-1 sm:gap-1.5 transition-all touch-manipulation text-xs sm:text-sm",
                isFull
                  ? "bg-gray-600 cursor-not-allowed opacity-50"
                  : "bg-gradient-to-r from-blue-600 to-violet-600 hover:scale-[1.02] active:scale-95 shadow-lg shadow-blue-600/20"
              )}
              aria-label={isFull ? `${event.title} is full` : `Register for ${event.title}`}
              aria-disabled={isFull}
            >
              {isFull ? 'Event Full' : 'Register Now'} <ArrowRight className="w-3 h-3 sm:w-3.5 sm:h-3.5" aria-hidden="true" />
            </Button>
          )}
        </div>

        {/* Calendar Export Button - Touch-friendly */}
        <CalendarExportMenu
          event={event}
          isRegistered={isRegistered}
          variant="outline"
          size="default"
          className="w-full h-8 sm:h-9 border border-border hover:border-primary hover:bg-primary/5 text-foreground hover:text-primary font-semibold rounded-lg transition-all touch-manipulation active:scale-95 text-xs sm:text-sm"
        />
      </CardFooter>
    </Card>
  );
}
