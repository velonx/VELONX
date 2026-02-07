"use client";

import { motion } from "framer-motion";
import { Bell, Calendar, Award, Star, ArrowLeft, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { notificationsApi } from "@/lib/api/client";
import { useRouter } from "next/navigation";

type NotificationType = {
    id: string;
    userId: string;
    title: string;
    description: string;
    type: 'INFO' | 'SUCCESS' | 'AWARD' | 'EVENT' | 'WARNING';
    read: boolean;
    actionUrl: string | null;
    metadata: Record<string, any> | null;
    createdAt: string;
    updatedAt: string;
};

export default function NotificationsPage() {
    const router = useRouter();
    const [notifications, setNotifications] = useState<NotificationType[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Fetch notifications on page load
    useEffect(() => {
        fetchNotifications();
    }, []);

    const fetchNotifications = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await notificationsApi.list();
            setNotifications(response.data.notifications);
            setUnreadCount(response.data.unreadCount);
        } catch (err: any) {
            setError(err.message || "Failed to load notifications");
            toast.error("Failed to load notifications");
        } finally {
            setLoading(false);
        }
    };

    const markAllRead = async () => {
        try {
            await notificationsApi.markAllAsRead();
            setNotifications(notifications.map(n => ({ ...n, read: true })));
            setUnreadCount(0);
            toast.success("All notifications marked as read");

            // Trigger unread count update in navbar
            if (typeof window !== "undefined" && (window as any).refetchUnreadCount) {
                (window as any).refetchUnreadCount();
            }
        } catch (err: any) {
            toast.error("Failed to mark notifications as read");
        }
    };

    const clearAll = async () => {
        try {
            await notificationsApi.clearAll();
            setNotifications([]);
            setUnreadCount(0);
            toast.success("Notifications cleared");

            // Trigger unread count update in navbar
            if (typeof window !== "undefined" && (window as any).refetchUnreadCount) {
                (window as any).refetchUnreadCount();
            }
        } catch (err: any) {
            toast.error("Failed to clear notifications");
        }
    };

    const handleNotificationClick = async (notification: NotificationType) => {
        // Mark as read if not already read
        if (!notification.read) {
            try {
                await notificationsApi.markAsRead(notification.id);
                setNotifications(notifications.map(n =>
                    n.id === notification.id ? { ...n, read: true } : n
                ));
                setUnreadCount(prev => Math.max(0, prev - 1));

                // Trigger unread count update in navbar
                if (typeof window !== "undefined" && (window as any).refetchUnreadCount) {
                    (window as any).refetchUnreadCount();
                }
            } catch (err: any) {
                // Silently fail - user can still navigate
            }
        }

        // Navigate to action URL if provided
        if (notification.actionUrl) {
            router.push(notification.actionUrl);
        }
    };

    const getTypeIcon = (type: string) => {
        switch (type) {
            case "AWARD": return <Award className="w-5 h-5 text-amber-500" />;
            case "EVENT": return <Calendar className="w-5 h-5 text-[#219EBC]" />;
            case "SUCCESS": return <Star className="w-5 h-5 text-green-500" />;
            case "WARNING": return <Bell className="w-5 h-5 text-orange-500" />;
            default: return <Bell className="w-5 h-5 text-blue-500" />;
        }
    };

    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);

        if (diffMins < 1) return "Just now";
        if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
        if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
        if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
        return date.toLocaleDateString();
    };

    return (
        <div className="min-h-screen pt-24 bg-background">
            <div className="container mx-auto px-4 max-w-3xl pb-20">
                <div className="flex items-center justify-between mb-12">
                    <div className="flex items-center gap-4">
                        <Link href="/" className="w-10 h-10 rounded-xl bg-background border border-border flex items-center justify-center hover:bg-muted transition-all text-muted-foreground">
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <h1 className="text-3xl font-black text-foreground tracking-tight">Notifications</h1>
                    </div>
                    <div className="flex gap-2">
                        <Button
                            variant="ghost"
                            onClick={markAllRead}
                            className="text-sm font-bold text-[#219EBC] hover:bg-accent rounded-xl"
                            disabled={loading || unreadCount === 0}
                        >
                            Mark all as read
                        </Button>
                        <Button
                            variant="ghost"
                            onClick={clearAll}
                            className="text-sm font-bold text-destructive hover:bg-destructive/10 rounded-xl"
                            disabled={loading || notifications.length === 0}
                        >
                            <Trash2 className="w-4 h-4 mr-2" /> Clear
                        </Button>
                    </div>
                </div>

                {loading ? (
                    <div className="text-center py-20 bg-card rounded-[48px] border border-border">
                        <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-6 text-muted-foreground animate-pulse">
                            <Bell className="w-10 h-10" />
                        </div>
                        <h2 className="text-xl font-bold text-foreground mb-2">Loading notifications...</h2>
                        <p className="text-muted-foreground">Please wait while we fetch your notifications.</p>
                    </div>
                ) : error ? (
                    <div className="text-center py-20 bg-card rounded-[48px] border border-destructive/20">
                        <div className="w-20 h-20 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-6 text-destructive/60">
                            <Bell className="w-10 h-10" />
                        </div>
                        <h2 className="text-xl font-bold text-foreground mb-2">Failed to load notifications</h2>
                        <p className="text-muted-foreground mb-4">{error}</p>
                        <Button
                            onClick={fetchNotifications}
                            className="bg-[#219EBC] hover:bg-[#1a7a94] text-white rounded-xl"
                        >
                            Try Again
                        </Button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {notifications.length > 0 ? (
                            notifications.map((notif, i) => (
                                <motion.div
                                    key={notif.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.05 }}
                                    onClick={() => handleNotificationClick(notif)}
                                    className={`p-6 rounded-[32px] border transition-all flex gap-5 ${notif.actionUrl ? 'cursor-pointer hover:shadow-lg' : ''
                                        } ${notif.read
                                            ? "bg-card border-border"
                                            : "bg-[#219EBC]/5 border-[#219EBC]/20 shadow-lg shadow-[#219EBC]/5"
                                        }`}
                                >
                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${notif.read ? "bg-muted text-muted-foreground" : "bg-card shadow-md"
                                        }`}>
                                        {getTypeIcon(notif.type)}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between mb-1">
                                            <h3 className="font-bold text-foreground leading-none">{notif.title}</h3>
                                            <span className="text-xs font-bold text-muted-foreground">{formatTime(notif.createdAt)}</span>
                                        </div>
                                        <p className="text-muted-foreground text-sm leading-relaxed">{notif.description}</p>
                                    </div>
                                    {!notif.read && (
                                        <div className="w-2.5 h-2.5 rounded-full bg-[#219EBC] mt-2 shadow-lg shadow-[#219EBC]/40" />
                                    )}
                                </motion.div>
                            ))
                        ) : (
                            <div className="text-center py-20 bg-card rounded-[48px] border border-dashed border-border">
                                <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-6 text-muted-foreground">
                                    <Bell className="w-10 h-10" />
                                </div>
                                <h2 className="text-xl font-bold text-foreground mb-2">No notifications yet</h2>
                                <p className="text-muted-foreground">We'll notify you when something important happens.</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
