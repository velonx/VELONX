"use client";

import { useState } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Menu, User, LogOut, LayoutDashboard, Settings, Bell, Search, Sparkles } from "lucide-react";
import toast from "react-hot-toast";

const navLinks = [
    { href: "/events", label: "Events" },
    { href: "/projects", label: "Projects" },
    { href: "/resources", label: "Resources" },
    { href: "/mentors", label: "Mentors" },
    { href: "/career", label: "Career" },
    { href: "/blog", label: "Blog" },
    { href: "/leaderboard", label: "Leaderboard" },
];

export function Navbar() {
    const [open, setOpen] = useState(false);
    const { data: session, status } = useSession();

    const handleLogout = async () => {
        toast.loading("Logging out...", { id: "logout" });
        await signOut({ callbackUrl: "/" });
        toast.success("Successfully logged out!", { id: "logout" });
    };

    const handleLinkClick = (label: string) => {
        setOpen(false); // Close mobile menu if open
    };

    // Get dashboard link based on user role
    const dashboardLink = session?.user?.role === "admin"
        ? "/dashboard/admin"
        : "/dashboard/student";

    const displayAvatar = session?.user?.image || "";

    return (
        <header className="fixed top-0 left-0 right-0 z-50">
            <div className="mx-4 mt-4">
                <div className="bg-white/95 backdrop-blur-xl rounded-2xl border border-gray-200 shadow-sm transition-all hover:bg-white hover:shadow-md">
                    <div className="container mx-auto px-6 h-20 flex items-center justify-between">
                        {/* Logo */}
                        <Link href="/" className="flex items-center gap-2 font-bold text-xl group">
                            <div className="flex items-center gap-2">
                                <img src="/logo.png" alt="Velonx" className="h-8 w-auto" />
                                <span className="text-[#023047] font-outfit font-bold text-xl tracking-tight">Velonx</span>
                            </div>
                        </Link>

                        {/* Desktop Navigation */}
                        <nav className="hidden lg:flex items-center gap-8 text-sm font-medium">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    onClick={() => handleLinkClick(link.label)}
                                    className="text-gray-600 hover:text-[#023047] transition-all duration-300 relative group"
                                >
                                    {link.label}
                                </Link>
                            ))}
                        </nav>

                        {/* Desktop Auth Section */}
                        <div className="hidden lg:flex items-center gap-4">
                            {status === "loading" ? (
                                <div className="w-10 h-10 rounded-full bg-gray-100 animate-pulse" />
                            ) : session?.user ? (
                                <div className="flex items-center gap-3">
                                    <Link
                                        href="/notifications"
                                        className="p-2 text-gray-400 hover:text-[#219EBC] transition-colors"
                                    >
                                        <Bell className="w-5 h-5" />
                                    </Link>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <button className="flex items-center gap-3 pl-2 pr-4 py-1.5 rounded-full border border-gray-100 hover:border-[#219EBC]/30 hover:bg-gray-50 transition-all shadow-sm">
                                                <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-[#219EBC] ring-4 ring-[#219EBC]/10">
                                                    {session.user.image ? (
                                                        <img
                                                            src={session.user.image}
                                                            alt={session.user.name || "User"}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full bg-gradient-to-br from-[#219EBC] to-[#E9C46A] flex items-center justify-center text-white font-black text-lg">
                                                            {session.user.name?.charAt(0) || "U"}
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="text-left hidden md:block">
                                                    <div className="text-gray-900 text-sm font-black tracking-tight leading-none mb-1">
                                                        {session.user.name?.split(" ")[0] || "User"}
                                                    </div>
                                                    <div className="text-[#219EBC] text-[10px] font-black uppercase flex items-center gap-1">
                                                        <Sparkles className="w-2.5 h-2.5" /> 2.4k XP
                                                    </div>
                                                </div>
                                            </button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="w-64 p-2 bg-white border border-gray-200 shadow-xl rounded-2xl">
                                            <div className="px-4 py-3 border-b border-gray-50 mb-1">
                                                <p className="text-gray-900 font-black">{session.user.name}</p>
                                                <p className="text-gray-500 text-xs truncate">{session.user.email}</p>
                                                <Badge className={`mt-2 font-black uppercase text-[10px] tracking-widest ${session.user.role === "admin" ? "bg-orange-50 text-orange-600" : "bg-blue-50 text-[#219EBC]"
                                                    }`}>
                                                    {session.user.role === "admin" ? "Admin Access" : "Student Member"}
                                                </Badge>
                                            </div>
                                            <DropdownMenuItem asChild className="cursor-pointer rounded-xl py-3 focus:bg-blue-50 focus:text-[#219EBC]">
                                                <Link href={dashboardLink} className="flex items-center gap-3 font-bold">
                                                    <LayoutDashboard className="w-4 h-4" />
                                                    My Dashboard
                                                </Link>
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => toast.success("Settings coming soon!")} className="cursor-pointer rounded-xl py-3 focus:bg-blue-50 focus:text-[#219EBC]">
                                                <div className="flex items-center gap-3 font-bold">
                                                    <Settings className="w-4 h-4" />
                                                    Account Settings
                                                </div>
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator className="bg-gray-50 mx-2" />
                                            <DropdownMenuItem
                                                onClick={handleLogout}
                                                className="cursor-pointer rounded-xl py-3 text-red-500 focus:text-red-500 focus:bg-red-50 font-bold"
                                            >
                                                <LogOut className="w-4 h-4 mr-3" />
                                                Sign Out
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            ) : (
                                <div className="flex items-center gap-3">
                                    <Link href="/auth/login">
                                        <button className="text-[#023047] border border-[#023047] hover:bg-[#023047]/5 font-semibold text-sm rounded-full px-6 py-2 transition-all">
                                            Log In
                                        </button>
                                    </Link>
                                    <Link href="/auth/signup">
                                        <button className="coral-gradient coral-gradient-hover text-white font-semibold text-sm rounded-full px-6 py-2.5 transition-all shadow-md shadow-coral-500/20 active:scale-95">
                                            Join Now
                                        </button>
                                    </Link>
                                </div>
                            )}
                        </div>

                        {/* Mobile Navigation Trigger */}
                        <div className="lg:hidden flex items-center gap-2">
                            {session?.user && (
                                <Link href={dashboardLink}>
                                    <Avatar className="w-10 h-10 border-2 border-[#219EBC]">
                                        <AvatarImage src={displayAvatar} />
                                        <AvatarFallback className="bg-[#219EBC] text-white">{session.user.name?.[0]}</AvatarFallback>
                                    </Avatar>
                                </Link>
                            )}
                            <Sheet open={open} onOpenChange={setOpen}>
                                <SheetTrigger asChild>
                                    <Button variant="ghost" size="icon" className="text-gray-600 hover:bg-gray-100 rounded-full">
                                        <Menu className="w-6 h-6" />
                                    </Button>
                                </SheetTrigger>
                                <SheetContent side="right" className="bg-white border-l border-gray-100 w-[300px]">
                                    <div className="flex flex-col gap-8 mt-10">
                                        <Link href="/" onClick={() => setOpen(false)} className="px-4">
                                            <img src="/logo.png" alt="Velonx" className="h-12 w-auto" />
                                        </Link>
                                        <nav className="flex flex-col gap-4">
                                            {navLinks.map((link) => (
                                                <Link
                                                    key={link.href}
                                                    href={link.href}
                                                    onClick={() => setOpen(false)}
                                                    className="px-6 py-3 text-lg font-black text-gray-500 hover:text-[#219EBC] hover:bg-blue-50/50 rounded-2xl transition-all uppercase tracking-wide"
                                                >
                                                    {link.label}
                                                </Link>
                                            ))}
                                        </nav>
                                        {!session && (
                                            <div className="mt-auto p-4 space-y-3">
                                                <Link href="/auth/login" onClick={() => setOpen(false)}>
                                                    <Button className="w-full bg-gray-900 hover:bg-black text-white rounded-2xl py-6 font-bold uppercase tracking-widest text-xs">Login</Button>
                                                </Link>
                                                <Link href="/auth/signup" onClick={() => setOpen(false)}>
                                                    <Button className="w-full bg-[#219EBC] hover:bg-[#1a7a94] text-white rounded-2xl py-6 font-bold uppercase tracking-widest text-xs shadow-lg shadow-[#219EBC]/20">Join Community</Button>
                                                </Link>
                                            </div>
                                        )}
                                        {session && (
                                            <div className="mt-auto p-4">
                                                <Button
                                                    onClick={handleLogout}
                                                    variant="outline"
                                                    className="w-full border-red-100 text-red-500 hover:bg-red-50 rounded-2xl py-6 font-bold uppercase tracking-widest text-xs"
                                                >
                                                    <LogOut className="w-4 h-4 mr-2" /> Sign Out
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                </SheetContent>
                            </Sheet>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
}
