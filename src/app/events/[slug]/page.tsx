import { Metadata } from "next";
import EventDetailClient from "./EventDetailClient";
import { eventService } from "@/lib/services/event.service";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const decodedSlug = decodeURIComponent(slug);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://velonx.in";
  const pageUrl = `${siteUrl}/events/${decodedSlug}`;

  try {
    const event = await eventService.getEventById(decodedSlug);
    if (event) {
      const desc = event.description.substring(0, 150) + "...";

      // Ensure absolute image URL
      const rawImageUrl = event.imageUrl?.trim();
      let finalImageUrl = `${siteUrl}/og/default.png`; // Fallback default
      if (rawImageUrl && rawImageUrl !== "null" && rawImageUrl !== "undefined") {
        if (rawImageUrl.startsWith("http://") || rawImageUrl.startsWith("https://")) {
          finalImageUrl = rawImageUrl;
        } else {
          const normalizedPath = rawImageUrl.startsWith("/") ? rawImageUrl : `/${rawImageUrl}`;
          finalImageUrl = `${siteUrl}${normalizedPath}`;
        }
      }

      return {
        metadataBase: new URL(siteUrl),
        title: `${event.title} | Velonx Events`,
        description: desc,
        alternates: { canonical: pageUrl },
        openGraph: {
          type: "article",
          url: pageUrl,
          title: `${event.title} | Velonx Events`,
          description: desc,
          images: [
            {
              url: finalImageUrl,
              width: 1200,
              height: 630,
              alt: event.title,
            },
          ],
        },
        twitter: {
          card: "summary_large_image",
          title: event.title,
          description: desc,
          images: [finalImageUrl],
        }
      };
    }
  } catch (error) {
    console.error("SEO Metadata generation error for event:", error);
  }

  return {
    title: "Event Details | Velonx",
    description: "Explore tech events, hackathons, and workshops at Velonx."
  };
}

export default async function EventDetailPage({ params }: Props) {
  const { slug } = await params;
  const decodedSlug = decodeURIComponent(slug);
  let event: any = null;

  try {
    const dbEvent = await eventService.getEventById(decodedSlug);
    if (dbEvent) {
      // Serialize Date properties to satisfy Next.js page props transition
      event = JSON.parse(JSON.stringify(dbEvent));
    }
  } catch (err) {
    console.error("Failed server-side fetch of event:", err);
  }

  // Generate JSON-LD schema search crawler script
  let jsonLd: any = null;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://velonx.in";

  if (event) {
    const isOnline = !event.location || event.location.toLowerCase() === "online";

    // Ensure absolute image URL
    const rawImageUrl = event.imageUrl?.trim();
    let finalImageUrl = `${siteUrl}/og/default.png`; // Fallback default
    if (rawImageUrl && rawImageUrl !== "null" && rawImageUrl !== "undefined") {
      if (rawImageUrl.startsWith("http://") || rawImageUrl.startsWith("https://")) {
        finalImageUrl = rawImageUrl;
      } else {
        const normalizedPath = rawImageUrl.startsWith("/") ? rawImageUrl : `/${rawImageUrl}`;
        finalImageUrl = `${siteUrl}${normalizedPath}`;
      }
    }

    jsonLd = {
      "@context": "https://schema.org",
      "@type": "Event",
      "name": event.title,
      "description": event.description,
      "startDate": event.date,
      ...(event.endDate ? { "endDate": event.endDate } : {}),
      "eventStatus": event.status === "CANCELLED" ? "https://schema.org/EventCancelled" : "https://schema.org/EventScheduled",
      "eventAttendanceMode": isOnline ? "https://schema.org/OnlineEventAttendanceMode" : "https://schema.org/OfflineEventAttendanceMode",
      "location": isOnline ? {
        "@type": "VirtualLocation",
        "url": `${siteUrl}/events/${decodedSlug}`
      } : {
        "@type": "Place",
        "name": event.location,
        "address": {
          "@type": "PostalAddress",
          "addressLocality": event.location,
          "addressCountry": "IN"
        }
      },
      "organizer": {
        "@type": "Organization",
        "name": "Velonx",
        "url": siteUrl
      },
      "image": [finalImageUrl]
    };
  }

  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }}
        />
      )}
      <EventDetailClient slug={decodedSlug} initialEvent={event} />
    </>
  );
}
