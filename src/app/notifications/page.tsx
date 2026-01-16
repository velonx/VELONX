"use client";

import { motion } from "framer-motion";
import { Bell, Calendar, MessageSquare, Award, Star, ArrowLeft, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { useState } from "react";
import toast from "react-hot-toast";

interface Notification {
    id: string;
    title: string;
    description: string;
    time: string;
    type: "info" | "success" | "award" | "event";
    read: boolean;
}

export default function NotificationsPage() {
    const [notifications, setNotifications] = useState<Notification[]>([
        {
            id: "1",
            title: "Welcome to Velonx!",
            description: "Thanks for joining our community of innovators. Start by exploring our resource library.",
            time: "2 hours ago",
            type: "info",
            read: false
        },
        {
            id: "2",
            title: "New XP Awarded",
            description: "You earned 50 XP for completing your resume review!",
            time: "5 hours ago",
            type: "award",
            read: true
        },
        {
            id: "3",
            title: "Upcoming Event: AI Workshop",
            description: "Don't forget to attend the AI in Education workshop tomorrow at 10:00 AM.",
            time: "1 day ago",
            type: "event",
            read: true
        },
        {
            id: "4",
            title: "Project Approved",
            description: "Your project 'Smart Campus' has been approved by the admin team.",
            time: "2 days ago",
            type: "success",
            read: true
        }
    ]);

    const markAllRead = () => {
        setNotifications(notifications.map(n => ({ ...n, read: true })));
        toast.success("All notifications marked as read");
    };

    const clearAll = () => {
        setNotifications([]);
        toast.success("Notifications cleared");
    };

    const getTypeIcon = (type: string) => {
        switch (type) {
            case "award": return <Award className="w-5 h-5 text-amber-500" />;
            case "event": return <Calendar className="w-5 h-5 text-[#219EBC]" />;
            case "success": return <Star className="w-5 h-5 text-green-500" />;
            default: return <Bell className="w-5 h-5 text-blue-500" />;
        }
    };

    return (
        <div className="min-h-screen pt-24 bg-[#FAFAFA]">
            <div className="container mx-auto px-4 max-w-3xl pb-20">
                <div className="flex items-center justify-between mb-12">
                    <div className="flex items-center gap-4">
                        <Link href="/" className="w-10 h-10 rounded-xl bg-white border border-gray-100 flex items-center justify-center hover:bg-gray-50 transition-all text-gray-500">
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <h1 className="text-3xl font-black text-gray-900 tracking-tight">Notifications</h1>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="ghost" onClick={markAllRead} className="text-sm font-bold text-[#219EBC] hover:bg-blue-50 rounded-xl">
                            Mark all as read
                        </Button>
                        <Button variant="ghost" onClick={clearAll} className="text-sm font-bold text-red-500 hover:bg-red-50 rounded-xl">
                            <Trash2 className="w-4 h-4 mr-2" /> Clear
                        </Button>
                    </div>
                </div>

                <div className="space-y-4">
                    {notifications.length > 0 ? (
                        notifications.map((notif, i) => (
                            <motion.div
                                key={notif.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.05 }}
                                className={`p-6 rounded-[32px] border transition-all flex gap-5 ${notif.read ? "bg-white border-gray-100" : "bg-[#219EBC]/5 border-[#219EBC]/20 shadow-lg shadow-[#219EBC]/5"
                                    }`}
                            >
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${notif.read ? "bg-gray-50 text-gray-400" : "bg-white shadow-md"
                                    }`}>
                                    {getTypeIcon(notif.type)}
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center justify-between mb-1">
                                        <h3 className="font-bold text-gray-900 leading-none">{notif.title}</h3>
                                        <span className="text-xs font-bold text-gray-400">{notif.time}</span>
                                    </div>
                                    <p className="text-gray-500 text-sm leading-relaxed">{notif.description}</p>
                                </div>
                                {!notif.read && (
                                    <div className="w-2.5 h-2.5 rounded-full bg-[#219EBC] mt-2 shadow-lg shadow-[#219EBC]/40" />
                                )}
                            </motion.div>
                        ))
                    ) : (
                        <div className="text-center py-20 bg-white rounded-[48px] border border-dashed border-gray-200">
                            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-300">
                                <Bell className="w-10 h-10" />
                            </div>
                            <h2 className="text-xl font-bold text-gray-900 mb-2">No notifications yet</h2>
                            <p className="text-gray-400">We'll notify you when something important happens.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
