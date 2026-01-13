"use client";

import { useState } from "react";
import { Calendar, Plus, BarChart3, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet";

interface EventsSidebarProps {
    onViewChange: (view: "events" | "calendar" | "analytics") => void;
    currentView: "events" | "calendar" | "analytics";
    onAddEvent?: () => void;
    isAdmin?: boolean;
}

export default function EventsSidebar({
    onViewChange,
    currentView,
    onAddEvent,
    isAdmin = false,
}: EventsSidebarProps) {
    const [isOpen, setIsOpen] = useState(false);

    const menuItems = [
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
        {
            id: "events",
            label: "Event Cards",
            icon: Menu,
            action: () => {
                onViewChange("events");
                setIsOpen(false);
            },
            active: currentView === "events",
        },
    ];

    const adminItems = isAdmin
        ? [
            {
                id: "add-event",
                label: "Add Event",
                icon: Plus,
                action: () => {
                    onAddEvent?.();
                    setIsOpen(false);
                },
                active: false,
                highlight: true,
            },
            {
                id: "analytics",
                label: "Analytics",
                icon: BarChart3,
                action: () => {
                    onViewChange("analytics");
                    setIsOpen(false);
                },
                active: currentView === "analytics",
            },
        ]
        : [];

    const allItems = [...menuItems, ...adminItems];

    const SidebarContent = () => (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h3 className="text-white font-bold text-lg mb-2">Events Navigation</h3>
                <p className="text-gray-400 text-sm">Manage your events and schedule</p>
            </div>

            {/* Menu Items */}
            <div className="space-y-2">
                <h4 className="text-gray-500 text-xs uppercase tracking-wider mb-3">Views</h4>
                {menuItems.map((item) => {
                    const Icon = item.icon;
                    return (
                        <button
                            key={item.id}
                            onClick={item.action}
                            className={`
                w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all
                ${item.active
                                    ? "glass-strong border border-cyan-500/30 bg-cyan-500/10 text-cyan-400"
                                    : "glass border border-white/10 text-gray-300 hover:bg-white/5 hover:border-cyan-500/20"
                                }
              `}
                        >
                            <Icon className="w-5 h-5" />
                            <span className="font-medium">{item.label}</span>
                            {item.active && (
                                <div className="ml-auto w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                            )}
                        </button>
                    );
                })}
            </div>

            {/* Admin Section */}
            {isAdmin && adminItems.length > 0 && (
                <div className="space-y-2">
                    <h4 className="text-gray-500 text-xs uppercase tracking-wider mb-3">Admin</h4>
                    {adminItems.map((item) => {
                        const Icon = item.icon;
                        return (
                            <button
                                key={item.id}
                                onClick={item.action}
                                className={`
                  w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all
                  ${item.highlight
                                        ? "glow-button text-black font-semibold hover:shadow-2xl"
                                        : "glass border border-white/10 text-gray-300 hover:bg-white/5"
                                    }
                `}
                            >
                                <Icon className="w-5 h-5" />
                                <span className="font-medium">{item.label}</span>
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );

    return (
        <>
            {/* Desktop Sidebar */}
            <div className="hidden lg:block sticky top-24 self-start">
                <div className="glass-strong rounded-2xl p-6 border border-white/10 w-64">
                    <SidebarContent />
                </div>
            </div>

            {/* Mobile Sheet */}
            <div className="lg:hidden fixed bottom-6 right-6 z-50">
                <Sheet open={isOpen} onOpenChange={setIsOpen}>
                    <SheetTrigger asChild>
                        <Button
                            size="icon"
                            className="w-14 h-14 rounded-full glow-button text-black shadow-2xl"
                        >
                            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="bg-[#0a0a0f] border-white/10 p-6">
                        <SheetHeader>
                            <SheetTitle className="text-white text-left">Events Navigation</SheetTitle>
                        </SheetHeader>
                        <div className="mt-6">
                            <SidebarContent />
                        </div>
                    </SheetContent>
                </Sheet>
            </div>
        </>
    );
}
