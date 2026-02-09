"use client";

import { useState } from "react";
import { LayoutGrid, Calendar, Clock, RotateCcw, Plus, BarChart3, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet";

interface EventsSidebarProps {
    onViewChange: (view: "events" | "calendar" | "analytics") => void;
    currentView: "events" | "calendar" | "analytics";
    onStatusChange: (status: "upcoming" | "past") => void;
    currentStatus: "upcoming" | "past";
    onAddEvent?: () => void;
    isAdmin?: boolean;
}

export default function EventsSidebar({
    onViewChange,
    currentView,
    onStatusChange,
    currentStatus,
    onAddEvent,
    isAdmin = false,
}: EventsSidebarProps) {
    const [isOpen, setIsOpen] = useState(false);

    const menuItems = [
        {
            id: "events",
            label: "Card View",
            icon: LayoutGrid,
            action: () => {
                onViewChange("events");
                setIsOpen(false);
            },
            active: currentView === "events",
        },
        {
            id: "calendar",
            label: "Calendar View",
            icon: Calendar,
            action: () => {
                onViewChange("calendar");
                setIsOpen(false);
            },
            active: currentView === "calendar",
        },
    ];

    const statusItems = [
        {
            id: "upcoming",
            label: "Upcoming Events",
            icon: Clock,
            action: () => {
                onStatusChange("upcoming");
                setIsOpen(false);
            },
            active: currentStatus === "upcoming",
        },
        {
            id: "past",
            label: "Past Events",
            icon: RotateCcw,
            action: () => {
                onStatusChange("past");
                setIsOpen(false);
            },
            active: currentStatus === "past",
        },
    ];

     
    const SidebarContent = () => (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <div className="flex items-center gap-2 mb-2">
                    <LayoutGrid className="w-5 h-5 text-cyan-400" />
                    <h3 className="text-white font-bold text-lg">Events Navigation</h3>
                </div>
                <p className="text-gray-400 text-xs leading-relaxed">Filter events by type and choose your preferred view options.</p>
            </div>

            {/* View Selection */}
            <div className="space-y-3">
                {menuItems.map((item) => (
                    <button
                        key={item.id}
                        onClick={item.action}
                        className={`
                            w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all border
                            ${item.active
                                ? "bg-[#1e293b] border-cyan-500/50 text-white shadow-lg shadow-cyan-500/10"
                                : "bg-transparent border-white/5 text-gray-400 hover:bg-white/5 hover:border-white/10"
                            }
                        `}
                    >
                        <item.icon className="w-4 h-4" />
                        <span className="text-sm font-medium">{item.label}</span>
                        {item.active && (
                            <div className="ml-auto w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
                        )}
                    </button>
                ))}
            </div>

            {/* Status Section */}
            <div className="space-y-3">
                <div className="flex items-center gap-2 mb-1 px-1">
                    <BarChart3 className="w-4 h-4 text-gray-500" />
                    <h4 className="text-gray-100 text-xs font-bold uppercase tracking-wider">Status</h4>
                </div>
                {statusItems.map((item) => (
                    <button
                        key={item.id}
                        onClick={item.action}
                        className={`
                            w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all border
                            ${item.active
                                ? "bg-[#1e293b] border-cyan-500/50 text-white shadow-lg shadow-cyan-500/10"
                                : "bg-transparent border-white/5 text-gray-400 hover:bg-white/5 hover:border-white/10"
                            }
                        `}
                    >
                        <item.icon className="w-4 h-4" />
                        <span className="text-sm font-medium">{item.label}</span>
                        {item.active && (
                            <div className="ml-auto w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
                        )}
                    </button>
                ))}
            </div>

            {/* Admin Section */}
            {isAdmin && (
                <div className="pt-6 border-t border-white/10">
                    <button
                        onClick={onAddEvent}
                        className="w-full h-12 coral-gradient text-white font-bold rounded-xl flex items-center justify-center gap-2 hover:scale-[1.02] transition-all shadow-lg shadow-orange-500/20"
                    >
                        <Plus className="w-5 h-5" /> Add Event
                    </button>
                </div>
            )}
        </div>
    );

    return (
        <>
            {/* Desktop Sidebar */}
            <div className="hidden lg:block sticky top-24 self-start">
                <div className="bg-[#0f172a] rounded-[24px] p-6 border border-white/10 w-72 shadow-2xl">
                    <SidebarContent />
                </div>
            </div>

            {/* Mobile Sheet */}
            <div className="lg:hidden fixed bottom-6 right-6 z-50">
                <Sheet open={isOpen} onOpenChange={setIsOpen}>
                    <SheetTrigger asChild>
                        <Button
                            size="icon"
                            className="w-14 h-14 rounded-full coral-gradient text-white shadow-2xl hover:scale-110 active:scale-95 transition-all"
                        >
                            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="bg-[#0f172a] border-white/10 p-6">
                        <SheetHeader>
                            <SheetTitle className="text-white text-left font-bold">Events Navigation</SheetTitle>
                        </SheetHeader>
                        <div className="mt-8">
                            <SidebarContent />
                        </div>
                    </SheetContent>
                </Sheet>
            </div>
        </>
    );
}
