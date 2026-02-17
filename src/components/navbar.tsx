"use client";

import { useState } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { VisuallyHidden } from "@/components/ui/sheet";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Menu, LogOut, LayoutDashboard, Settings, MessageSquare, Users, Rss, ChevronDown } from "lucide-react";
import toast from "react-hot-toast";
import { UnreadCountBadge } from "@/components/unread-count-badge";
import { ThemeToggle } from "@/components/theme-toggle";

const navLinks = [
    { href: "/events", label: "Events" },
    { href: "/projects", label: "Projects" },
    { href: "/resources", label: "Resources" },
    { href: "/mentors", label: "Mentors" },
    { href: "/career", label: "Career" },
    { href: "/blog", label: "Blog" },
    { href: "/leaderboard", label: "Leaderboard" },
];

const communityLinks = [
    { href: "/community/feed", label: "Feed", icon: Rss },
    { href: "/community/rooms", label: "Rooms", icon: MessageSquare },
    { href: "/community/groups", label: "Groups", icon: Users },
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
    const dashboardLink = session?.user?.role === "ADMIN"
        ? "/dashboard/admin"
        : "/dashboard/student";

    const displayAvatar = session?.user?.image || "";

    return (
        <header className="fixed top-6 left-0 right-0 z-50 flex justify-center px-4">
            <div className="flex max-w-fit border border-border rounded-full bg-card/95 backdrop-blur-xl shadow-lg pr-3 pl-6 py-2.5 items-center justify-center space-x-1">
                {/* Logo */}
                <Link
                    href="/"
                    className="flex items-center mr-2 pr-3 border-r border-border"
                    aria-label="Velonx home page"
                >
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#219EBC] via-[#4FC3F7] to-[#E9C46A] font-outfit font-bold text-lg tracking-tight">
                        Velonx
                    </span>
                </Link>

                {/* Desktop Navigation */}
                <nav className="hidden lg:flex items-center space-x-1">
                    {navLinks.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            onClick={() => handleLinkClick(link.label)}
                            className="relative flex items-center space-x-1.5 text-muted-foreground hover:text-foreground px-3 py-2 rounded-full transition-all duration-200 hover:bg-muted text-sm font-medium"
                        >
                            {link.label}
                        </Link>
                    ))}
                    
                    {/* Community Dropdown */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button
                                className="relative flex items-center space-x-1.5 text-muted-foreground hover:text-foreground px-3 py-2 rounded-full transition-all duration-200 hover:bg-muted text-sm font-medium"
                                aria-label="Community menu"
                            >
                                Community
                                <ChevronDown className="w-3 h-3" />
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" className="w-48 p-2 bg-card border border-border shadow-xl rounded-xl">
                            {communityLinks.map((link) => (
                                <DropdownMenuItem key={link.href} asChild className="cursor-pointer rounded-lg py-2.5 focus:bg-muted">
                                    <Link href={link.href} className="flex items-center gap-3 font-medium">
                                        <link.icon className="w-4 h-4" />
                                        {link.label}
                                    </Link>
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </nav>

                {/* Desktop Auth Section */}
                <div className="hidden lg:flex items-center pl-2 ml-1 border-l border-border">
                    {status === "loading" ? (
                        <div className="w-8 h-8 rounded-full bg-gray-100 animate-pulse" />
                    ) : session?.user ? (
                        <div className="flex items-center gap-2">
                            <Link
                                href="/notifications"
                                className="p-2 text-muted-foreground hover:text-accent transition-colors rounded-full hover:bg-muted"
                                aria-label="View notifications"
                            >
                                <UnreadCountBadge />
                            </Link>
                            <ThemeToggle />
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <button
                                        className="flex items-center gap-2 px-2 py-1.5 rounded-full hover:bg-muted transition-all"
                                        aria-label="User menu"
                                    >
                                        <Avatar className="w-8 h-8 border-2 border-[#219EBC]">
                                            <AvatarImage src={session.user.image || ""} />
                                            <AvatarFallback className="bg-gradient-to-br from-[#219EBC] to-[#E9C46A] text-white text-xs font-bold">
                                                {session.user.name?.charAt(0) || "U"}
                                            </AvatarFallback>
                                        </Avatar>
                                        <span className="hidden md:block text-sm font-semibold text-foreground">
                                            {session.user.name?.split(" ")[0]}
                                        </span>
                                    </button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-64 p-2 bg-card border border-border shadow-xl rounded-2xl">
                                    <div className="px-4 py-3 border-b border-border mb-1">
                                        <p className="text-foreground font-black">{session.user.name}</p>
                                        <p className="text-muted-foreground text-xs truncate">{session.user.email}</p>
                                        <Badge className={`mt-2 font-black uppercase text-[10px] tracking-widest ${session.user.role === "ADMIN" ? "bg-orange-50 text-orange-600" : "bg-blue-50 text-[#219EBC]"
                                            }`}>
                                            {session.user.role === "ADMIN" ? "Admin Access" : "Student Member"}
                                        </Badge>
                                    </div>
                                    <DropdownMenuItem asChild className="cursor-pointer rounded-xl py-3 focus:bg-blue-50 focus:text-[#219EBC]">
                                        <Link href={dashboardLink} className="flex items-center gap-3 font-bold">
                                            <LayoutDashboard className="w-4 h-4" />
                                            My Dashboard
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem asChild className="cursor-pointer rounded-xl py-3 focus:bg-blue-50 focus:text-[#219EBC]">
                                        <Link href="/settings" className="flex items-center gap-3 font-bold">
                                            <Settings className="w-4 h-4" />
                                            Account Settings
                                        </Link>
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
                        <div className="flex items-center gap-2">
                            <Link href="/auth/login">
                                <button
                                    className="text-[#023047] border border-[#023047] hover:bg-[#023047]/5 font-semibold text-xs rounded-full px-4 py-2 transition-all"
                                    aria-label="Log in to your account"
                                >
                                    Log In
                                </button>
                            </Link>
                            <Link href="/auth/signup">
                                <button
                                    className="bg-gradient-to-r from-[#FF6B6B] to-[#FF8E53] hover:brightness-110 text-white font-semibold text-xs rounded-full px-4 py-2 transition-all shadow-md"
                                    aria-label="Join Velonx community"
                                >
                                    Join Now
                                </button>
                            </Link>
                        </div>
                    )}
                </div>

                {/* Mobile Navigation Trigger */}
                <div className="lg:hidden flex items-center gap-2 pl-2 ml-1 border-l border-border">
                    {session?.user && (
                        <Link href={dashboardLink} aria-label="Go to dashboard">
                            <Avatar className="w-8 h-8 border-2 border-[#219EBC]">
                                <AvatarImage src={displayAvatar} />
                                <AvatarFallback className="bg-[#219EBC] text-white text-xs">{session.user.name?.[0]}</AvatarFallback>
                            </Avatar>
                        </Link>
                    )}
                    <Sheet open={open} onOpenChange={setOpen}>
                        <SheetTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="text-muted-foreground hover:bg-muted rounded-full w-8 h-8"
                                aria-label="Open navigation menu"
                            >
                                <Menu className="w-5 h-5" />
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="right" className="bg-card border-l border-border w-[300px]">
                            <VisuallyHidden>
                                <SheetTitle>Navigation Menu</SheetTitle>
                            </VisuallyHidden>
                            <div className="flex flex-col gap-8 mt-10">
                                <Link href="/" onClick={() => setOpen(false)} className="px-4">
                                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#219EBC] via-[#4FC3F7] to-[#E9C46A] font-outfit font-bold text-3xl tracking-tight">
                                        Velonx
                                    </span>
                                </Link>
                                <nav className="flex flex-col gap-2">
                                    {navLinks.map((link) => (
                                        <Link
                                            key={link.href}
                                            href={link.href}
                                            onClick={() => setOpen(false)}
                                            className="px-6 py-3 text-lg font-black text-muted-foreground hover:text-accent hover:bg-muted rounded-2xl transition-all uppercase tracking-wide"
                                        >
                                            {link.label}
                                        </Link>
                                    ))}
                                    
                                    {/* Community Section */}
                                    <div className="mt-2 border-t border-border pt-2">
                                        <div className="px-6 py-2 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                                            Community
                                        </div>
                                        {communityLinks.map((link) => (
                                            <Link
                                                key={link.href}
                                                href={link.href}
                                                onClick={() => setOpen(false)}
                                                className="flex items-center gap-3 px-6 py-3 text-base font-bold text-muted-foreground hover:text-accent hover:bg-muted rounded-2xl transition-all"
                                            >
                                                <link.icon className="w-5 h-5" />
                                                {link.label}
                                            </Link>
                                        ))}
                                    </div>
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
        </header>
    );
}
