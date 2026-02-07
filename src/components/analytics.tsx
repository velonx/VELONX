'use client';

import Script from 'next/script';

export function GoogleAnalytics() {
    const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

    // If no GA ID is set, don't render analytics
    if (!GA_MEASUREMENT_ID) {
        return null;
    }

    return (
        <>
            <Script
                src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
                strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
                {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_MEASUREMENT_ID}', {
            page_path: window.location.pathname,
          });
        `}
            </Script>
        </>
    );
}

// Helper functions for tracking custom events
export const trackEvent = (
    action: string,
    category: string,
    label?: string,
    value?: number
) => {
    if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', action, {
            event_category: category,
            event_label: label,
            value: value,
        });
    }
};

// Pre-defined event trackers
export const analytics = {
    // User events
    signUp: () => trackEvent('sign_up', 'user'),
    login: () => trackEvent('login', 'user'),

    // Project events
    projectView: (projectId: string) =>
        trackEvent('view_item', 'project', projectId),
    projectSubmit: () => trackEvent('submit_project', 'project'),

    // Event events
    eventView: (eventId: string) =>
        trackEvent('view_item', 'event', eventId),
    eventRegister: (eventId: string) =>
        trackEvent('register_event', 'event', eventId),

    // Mentor events
    mentorView: (mentorId: string) =>
        trackEvent('view_item', 'mentor', mentorId),
    sessionBook: (mentorId: string) =>
        trackEvent('book_session', 'mentor', mentorId),

    // Resource events
    resourceView: (resourceId: string) =>
        trackEvent('view_item', 'resource', resourceId),

    // Social events
    share: (method: string, contentType: string, contentId: string) =>
        trackEvent('share', 'social', `${method}_${contentType}_${contentId}`),
};
