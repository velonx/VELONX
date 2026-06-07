"use client";

import { Event } from "@/lib/api/types";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { computeRegistrationStatus, getRegistrationButtonText } from "@/lib/utils/event-helpers";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import Link from "next/link";

interface EventCardProps {
  event: Event;
  onRegister?: (eventId: string) => void;
  onUnregister?: (eventId: string) => void;
  isRegistered?: boolean;
  className?: string;
}

/**
 * Enhanced EventCard Component
 * Requirements: 2.1-2.3, 2.10, 6.1, 6.6, 6.8, 6.9
 */
export default function EventCard({
  event,
  onRegister,
  onUnregister,
  isRegistered = false,
  className
}: EventCardProps) {
  // Calculate attendee percentage
  const attendeeCount = event._count?.attendees || 0;
  const hasMaxSeats = event.maxSeats !== null && event.maxSeats !== undefined;
  const attendeePercentage = hasMaxSeats ? (attendeeCount / (event.maxSeats || 1)) * 100 : 0;
  const isFull = hasMaxSeats && attendeeCount >= (event.maxSeats || 0);
  const isAlmostFull = hasMaxSeats && attendeePercentage >= 80;

  // Compute registration status using utility function
  const registrationStatus = computeRegistrationStatus(event, attendeeCount);
  const isRegistrationClosed = !registrationStatus.isOpen;
  const buttonText = getRegistrationButtonText(isRegistered, registrationStatus);

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

  // Helper function to format date range
  const formatEventDate = (startDateStr: string, endDateStr?: string | null) => {
    const start = new Date(startDateStr);
    const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', year: 'numeric' };
    
    if (!endDateStr) {
      return start.toLocaleDateString('en-US', options);
    }
    
    const end = new Date(endDateStr);
    if (start.toDateString() === end.toDateString()) {
      return start.toLocaleDateString('en-US', options);
    }
    
    if (start.getMonth() === end.getMonth() && start.getFullYear() === end.getFullYear()) {
      return `${start.toLocaleDateString('en-US', { month: 'short' })} ${start.getDate()}-${end.getDate()}, ${start.getFullYear()}`;
    }
    
    if (start.getFullYear() === end.getFullYear()) {
      return `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}, ${start.getFullYear()}`;
    }
    
    return `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} - ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
  };

  const dateString = formatEventDate(event.date, event.endDate);
  const timeString = eventDate.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });

  const displayLocation = event.location
    ? (event.location.toLowerCase().includes('zoom')
      ? 'Zoom'
      : (event.location.toLowerCase().includes('google meet')
        ? 'Google Meet'
        : event.location))
    : 'Online';

  const displayButtonText = (buttonText === 'Register Now' && event.type === 'WEBINAR') ? 'Set Reminder' : buttonText;

  return (
    <div
      className={cn(
        "event-card event-card-hover relative transition-all duration-300 ease-out cursor-pointer block no-underline",
        "active:scale-[0.98] touch-manipulation",
        isRegistrationClosed ? "opacity-90" : "opacity-100",
        className
      )}
      role="article"
      aria-label={`Event: ${event.title}. ${registrationStatus.message}`}
      aria-describedby={`event-status-${event.id}`}
    >
      {/* Absolute overlay link to avoid nested <a> tags */}
      <Link
        href={`/events/${event.slug || event.id}`}
        className="absolute inset-0 z-10"
        tabIndex={-1}
        aria-hidden="true"
      />

      {/* Event Banner */}
      <div className="event-banner relative w-full overflow-hidden">
        {event.imageUrl ? (
          <>
            <Image
              src={event.imageUrl}
              alt={`Banner image for ${event.title}`}
              fill
              className="object-cover object-center"
              sizes="(max-width: 640px) 100vw, 33vw"
              quality={90}
              loading="lazy"
            />
            {/* Subtle bottom overlay */}
            <div className="absolute inset-0 bg-black/30" />
          </>
        ) : (
          <div className="event-banner-label">
            {event.type === 'HACKATHON' ? 'V-HACK' : event.type === 'WORKSHOP' ? 'WORKSHOP' : 'WEBINAR'}
          </div>
        )}

        {/* Registration Closed Badge */}
        {isRegistrationClosed && (
          <span
            className={cn(
              "badge shadow-sm absolute top-2 left-2 z-10 text-white px-2.5 py-1 rounded-md text-xs font-semibold border-none",
              registrationStatus.reason === 'capacity' ? "bg-red-700/90" :
              registrationStatus.reason === 'deadline' ? "bg-amber-700/90" :
              "bg-gray-700/90"
            )}
            aria-label="Registration closed"
          >
            {registrationStatus.reason === 'capacity' ? 'Full' : 'Closed'}
          </span>
        )}

        {/* Event Status Tag Badge */}
        <div className="absolute top-2 right-2 flex flex-col gap-1 items-end z-10">
          <span className={cn(
            "badge event-tag shadow-sm",
            event.status === 'ONGOING' ? "badge-green badge-live" :
            event.status === 'UPCOMING' ? "badge-cyan" :
            "bg-gray-400/10 border border-gray-400/20 text-gray-400"
          )}>
            {event.status === 'ONGOING' ? 'LIVE' : event.status}
          </span>
          {isNew && (
            <span className="badge bg-blue-500 text-white font-semibold px-2 py-0.5 rounded text-xs border-none">
              New
            </span>
          )}
          {isStartingSoon && (
            <span className="badge bg-orange-500 text-white font-semibold px-2 py-0.5 rounded text-xs border-none">
              Starting Soon
            </span>
          )}
          {isAlmostFull && !isFull && (
            <span className="badge bg-yellow-500 text-black font-semibold px-2 py-0.5 rounded text-xs border-none">
              Almost Full
            </span>
          )}
        </div>
      </div>

      {/* Event Meta */}
      <div className="event-meta flex flex-wrap gap-x-4 gap-y-2 text-xs text-muted-foreground mt-2">
        <span className="flex items-center gap-1">
          <span>📅</span>
          <span>{dateString}</span>
        </span>
        <span className="flex items-center gap-1">
          <span>🕒</span>
          <span>{timeString}</span>
        </span>
        {duration && (
          <span className="flex items-center gap-1">
            <span>⏱️</span>
            <span>{duration}h</span>
          </span>
        )}
        <span className="flex items-center gap-1">
          <span>📍</span>
          <span>{displayLocation}</span>
        </span>
      </div>

      {/* Creator Tag */}
      {event.creator?.name && (
        <div className="text-xs text-muted-foreground mt-2">
          By {event.creator.name}
        </div>
      )}

      {/* Event Title */}
      <h2 className="event-title mt-2">
        {event.title}
      </h2>

      {/* Event Description */}
      <p className="event-desc line-clamp-3">
        {event.description}
      </p>

      {/* Attendee Progress Bar */}
      {hasMaxSeats && (
        <div className="event-progress-container mt-3 space-y-1">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Seats</span>
            <span>{attendeeCount}/{event.maxSeats}</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-blue-600 h-1.5 rounded-full"
              style={{ width: `${Math.min(100, attendeePercentage)}%` }}
            />
          </div>
        </div>
      )}

      {/* Event Footer */}
      <div className="event-footer mt-4 relative z-20" onClick={(e) => e.preventDefault()}>
        <div className="event-price">
          FREE
          {event.type === 'HACKATHON' ? (
            <span>₹499</span>
          ) : event.type === 'WORKSHOP' ? (
            <span>₹999</span>
          ) : null}
        </div>

        {/* View Details Link */}
        <Link
          href={`/events/${event.slug || event.id}`}
          target="_blank"
          className="text-xs text-blue-600 hover:text-blue-800 font-semibold underline"
          aria-label={`View details for ${event.title}`}
          onClick={(e) => { e.stopPropagation(); }}
        >
          View Details
        </Link>

        {/* Action Button */}
        {isRegistered ? (
          <button
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); onUnregister?.(event.id); }}
            className="px-5 py-2 rounded-full text-xs font-bold transition-all duration-200 cursor-pointer bg-[#10B981] hover:bg-[#059669] text-white border-none shadow-sm shadow-[#10B981]/20"
            aria-label={`You are registered for ${event.title}. Click to unregister`}
          >
            Registered
          </button>
        ) : (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); !isRegistrationClosed && onRegister?.(event.id); }}
                  disabled={isRegistrationClosed}
                  className={cn(
                    "px-5 py-2 rounded-full text-xs font-bold transition-all duration-200 cursor-pointer text-white border-none",
                    isRegistrationClosed
                      ? "bg-gray-400 dark:bg-gray-700 cursor-not-allowed opacity-50 shadow-none"
                      : "bg-[#F0771A] hover:bg-[#e0650d] active:scale-95 shadow-sm shadow-[#F0771A]/20"
                  )}
                  aria-label={isRegistrationClosed ? `${event.title}: ${registrationStatus.message}` : `Register for ${event.title}`}
                  aria-disabled={isRegistrationClosed}
                >
                  {isRegistrationClosed ? buttonText : displayButtonText}
                </button>
              </TooltipTrigger>
              {isRegistrationClosed && (
                <TooltipContent>
                  <p>{registrationStatus.message}</p>
                </TooltipContent>
              )}
            </Tooltip>
          </TooltipProvider>
        )}
      </div>

      <div id={`event-status-${event.id}`} className="sr-only">
        {isRegistrationClosed ? `Registration is closed. ${registrationStatus.message}` : `Registration is open. ${registrationStatus.message}`}
      </div>
    </div>
  );
}

export function EventCardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("event-card animate-pulse", className)}>
      <div className="event-banner bg-muted/30 mb-4 rounded-[14px]" />
      <div className="h-3.5 w-2/5 bg-muted/40 mb-2.5 rounded" />
      <div className="h-5 w-3/4 bg-muted/50 mb-2 rounded" />
      <div className="h-3.5 w-full bg-muted/30 mb-1.5 rounded" />
      <div className="h-3.5 w-5/6 bg-muted/30 mb-1.5 rounded" />
      <div className="h-3.5 w-4/6 bg-muted/30 mb-5 rounded" />
      <div className="flex justify-between items-center border-t border-border pt-3.5 mt-auto">
        <div className="h-4 w-16 bg-muted/40 rounded" />
        <div className="h-8 w-24 bg-muted/50 rounded-full" />
      </div>
    </div>
  );
}
