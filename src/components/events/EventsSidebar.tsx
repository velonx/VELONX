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
                    <LayoutGrid className="w-5 h-5 text-[#226CE0]" />
                    <h3 className="text-[#1A234A] dark:text-white font-bold text-lg">Events Navigation</h3>
                </div>
                <p className="text-[#7582B3] dark:text-gray-400 text-xs leading-relaxed">Filter events by type and choose your preferred view options.</p>
            </div>

            {/* View Selection */}
            <div className="space-y-3">
                {menuItems.map((item) => (
                    <button
                        key={item.id}
                        onClick={item.action}
                        className={`
                            w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all border text-left cursor-pointer
                            ${item.active
                                ? "bg-[#226CE0]/10 border-[#226CE0]/30 text-[#226CE0] dark:text-[#226CE0] shadow-sm"
                                : "bg-transparent border-transparent text-[#7582B3] dark:text-gray-400 hover:bg-[#226CE0]/5 hover:text-[#226CE0]"
                            }
                        `}
                    >
                        <item.icon className="w-4 h-4" />
                        <span className="text-sm font-medium">{item.label}</span>
                        {item.active && (
                            <div className="ml-auto w-1.5 h-1.5 rounded-full bg-[#226CE0] shadow-[0_0_8px_rgba(34,108,224,0.6)]" />
                        )}
                    </button>
                ))}
            </div>

            {/* Status Section */}
            <div className="space-y-3">
                <div className="flex items-center gap-2 mb-1 px-1">
                    <BarChart3 className="w-4 h-4 text-[#7582B3]" />
                    <h4 className="text-[#1A234A] dark:text-white text-xs font-bold uppercase tracking-wider">Status</h4>
                </div>
                {statusItems.map((item) => (
                    <button
                        key={item.id}
                        onClick={item.action}
                        className={`
                            w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all border text-left cursor-pointer
                            ${item.active
                                ? "bg-[#226CE0]/10 border-[#226CE0]/30 text-[#226CE0] dark:text-[#226CE0] shadow-sm"
                                : "bg-transparent border-transparent text-[#7582B3] dark:text-gray-400 hover:bg-[#226CE0]/5 hover:text-[#226CE0]"
                            }
                        `}
                    >
                        <item.icon className="w-4 h-4" />
                        <span className="text-sm font-medium">{item.label}</span>
                        {item.active && (
                            <div className="ml-auto w-1.5 h-1.5 rounded-full bg-[#226CE0] shadow-[0_0_8px_rgba(34,108,224,0.6)]" />
                        )}
                    </button>
                ))}
            </div>

            {/* Admin Section */}
            {isAdmin && (
                <div className="pt-6 border-t border-border">
                    <button
                        onClick={onAddEvent}
                        className="w-full h-12 bg-[#F0771A] hover:bg-[#e0650d] text-white font-bold rounded-xl flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-[#F0771A]/20 cursor-pointer"
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
                <div className="card-glass-redesign rounded-3xl p-6 border w-72 shadow-2xl">
                    <SidebarContent />
                </div>
            </div>

            {/* Mobile Sheet */}
            <div className="lg:hidden fixed bottom-6 right-6 z-50">
                <Sheet open={isOpen} onOpenChange={setIsOpen}>
                    <SheetTrigger asChild>
                        <Button
                            size="icon"
                            className="w-14 h-14 rounded-full bg-[#F0771A] hover:bg-[#e0650d] text-white shadow-2xl hover:scale-110 active:scale-95 transition-all cursor-pointer"
                        >
                            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="card-glass-redesign border-border p-6 text-foreground">
                        <SheetHeader>
                            <SheetTitle className="text-[#1A234A] dark:text-white text-left font-bold">Events Navigation</SheetTitle>
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
