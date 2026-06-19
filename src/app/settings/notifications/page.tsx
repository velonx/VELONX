/**
 * Notification Preferences Settings Page
 * Route: /settings/notifications
 *
 * Server component — fetches current preferences server-side and passes to
 * the NotificationPreferencesForm client component for interactive editing.
 */

import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { EmailPreferenceService } from '@/lib/services/email-preference.service';
import NotificationPreferencesForm from '@/components/settings/NotificationPreferencesForm';
import Link from 'next/link';
import { Bell, ArrowLeft, Settings } from 'lucide-react';

export const metadata = {
    title: 'Notification Preferences | VELONX',
    description: 'Control which emails you receive from VELONX and how often you receive them.',
};

export default async function NotificationPreferencesPage() {
    const session = await auth();

    if (!session?.user?.id) {
        redirect('/auth/login');
    }

    const preferences = await EmailPreferenceService.getAllPreferences(session.user.id);

    return (
        <div className="min-h-screen bg-background pt-20">
            <div className="container mx-auto px-4 py-12 max-w-3xl">

                {/* Breadcrumb */}
                <div className="flex items-center gap-3 mb-8">
                    <Link
                        href="/settings"
                        className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors text-muted-foreground"
                    >
                        <ArrowLeft className="w-4 h-4" />
                    </Link>
                    <div>
                        <p className="text-xs text-muted-foreground font-medium uppercase tracking-widest">
                            Settings
                        </p>
                        <h1 className="text-2xl font-black text-foreground leading-none">
                            Email Notifications
                        </h1>
                    </div>
                </div>

                {/* Description card */}
                <div className="bg-[#226CE0]/5 border border-[#226CE0]/20 rounded-2xl p-5 flex gap-4 mb-8">
                    <div className="w-10 h-10 rounded-xl bg-[#226CE0]/10 flex items-center justify-center shrink-0">
                        <Bell className="w-5 h-5 text-[#226CE0]" />
                    </div>
                    <div>
                        <p className="font-bold text-foreground mb-1">Choose what you hear about</p>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            For each category below, pick whether to receive emails{' '}
                            <strong>instantly</strong>, as a <strong>daily digest</strong>,
                            a <strong>weekly digest</strong>, or <strong>not at all</strong>.
                            Instant emails go out the moment the event happens — digests bundle
                            everything up into one email so your inbox stays clean.
                        </p>
                    </div>
                </div>

                {/* Preferences form */}
                <div className="bg-card border border-border rounded-3xl shadow-lg overflow-hidden">
                    <div className="p-6 border-b border-border flex items-center gap-3">
                        <Settings className="w-5 h-5 text-muted-foreground" />
                        <h2 className="font-bold text-foreground">Notification Categories</h2>
                    </div>
                    <NotificationPreferencesForm initialPreferences={preferences} />
                </div>

                {/* Global unsubscribe note */}
                <p className="text-xs text-muted-foreground text-center mt-6">
                    To stop all VELONX emails at once, go to{' '}
                    <Link href="/settings" className="text-[#226CE0] underline hover:no-underline">
                        Account Settings
                    </Link>{' '}
                    and disable "Email Notifications".
                </p>
            </div>
        </div>
    );
}
