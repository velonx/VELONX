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
import { Menu, User, LogOut, LayoutDashboard, Settings } from "lucide-react";

const navLinks = [
    { href: "/events", label: "Events" },
    { href: "/projects", label: "Projects" },
    { href: "/resources", label: "Resources" },
    { href: "/mentors", label: "Mentors" },
    { href: "/career", label: "Career" },
    { href: "/leaderboard", label: "Leaderboard" },
];
export function Navbar() {
    const [open, setOpen] = useState(false);
    const { data: session, status } = useSession();

    const handleLogout = async () => {
        await signOut({ callbackUrl: "/" });
    };

    // Get dashboard link based on user role
    const dashboardLink = session?.user?.role === "admin"
        ? "/dashboard/admin"
        : "/dashboard/student";

    return (
        <header className="fixed top-0 left-0 right-0 z-50">
            <div className="mx-4 mt-4">
                <div className="bg-white/95 backdrop-blur-xl rounded-2xl border border-gray-200 shadow-sm">
                    <div className="container mx-auto px-6 h-20 flex items-center justify-between">
                        {/* Logo - Larger */}
                        <Link href="/" className="flex items-center gap-3 font-bold text-xl">
                            <img src="/logo.png" alt="Velonx Logo" className="h-20 w-auto" />
                        </Link>

                        {/* Desktop Navigation */}
                        <nav className="hidden lg:flex items-center gap-8 text-sm font-medium">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className="text-gray-600 hover:text-[#219EBC] transition-colors duration-300"
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
                                /* User is logged in - show avatar dropdown */
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <button className="flex items-center gap-3 px-4 py-2 rounded-full border border-gray-200 hover:border-[#219EBC] hover:bg-gray-50 transition-all">
                                            <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-[#219EBC]">
                                                {session.user.image ? (
                                                    <img
                                                        src={session.user.image}
                                                        alt={session.user.name || "User"}
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full bg-gradient-to-br from-[#219EBC] to-[#E9C46A] flex items-center justify-center text-white font-bold text-lg">
                                                        {session.user.name?.charAt(0) || "U"}
                                                    </div>
                                                )}

                                            </div>
                                            <div className="text-left">
                                                <div className="text-gray-900 text-sm font-semibold">
                                                    {session.user.name || "User"}
                                                </div>
                                                <div className="text-gray-500 text-xs truncate max-w-[150px]">
                                                    {session.user.email}
                                                </div>
                                            </div>
                                        </button>

                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-56 bg-white border border-gray-200 shadow-lg">
                                        <div className="px-3 py-2 border-b border-gray-100">
                                            <p className="text-gray-900 font-medium">{session.user.name}</p>
                                            <p className="text-gray-500 text-sm truncate">{session.user.email}</p>
                                            <span className={`inline-block mt-1 text-xs px-2 py-0.5 rounded-full ${session.user.role === "admin"
                                                ? "bg-[#E9C46A]/20 text-[#8B7A52]"
                                                : "bg-[#2A9D8F]/20 text-[#2A9D8F]"
                                                }`}>
                                                {session.user.role === "admin" ? "Admin" : "Student"}
                                            </span>
                                        </div>
                                        <DropdownMenuItem asChild className="cursor-pointer">
                                            <Link href={dashboardLink} className="flex items-center gap-2 text-gray-700">
                                                <LayoutDashboard className="w-4 h-4" />
                                                Dashboard
                                            </Link>
                                        </DropdownMenuItem>

                                        <DropdownMenuSeparator className="bg-gray-100" />
                                        <DropdownMenuItem
                                            onClick={handleLogout}
                                            className="cursor-pointer text-red-500 focus:text-red-500 focus:bg-red-50"
                                        >
                                            <LogOut className="w-4 h-4 mr-2" />
                                            Log Out
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            ) : (
                                /* User is not logged in - show login buttons */
                                <>
                                    <Link href="/auth/login">
                                        <button className="text-gray-600 hover:text-[#219EBC] font-medium px-4 py-2 transition-colors">
                                            Login
                                        </button>
                                    </Link>


                                    <Link href="/auth/signup">
                                        <button className="bg-[#219EBC] hover:bg-[#1a7a94] text-white font-semibold rounded-full px-6 py-2.5 text-sm shadow-lg shadow-[#219EBC]/20">
                                            Join Community
                                        </button>
                                    </Link>

                                </>
                            )}
                        </div>

                        {/* Mobile Menu */}
                        <Sheet open={open} onOpenChange={setOpen}>
                            <SheetTrigger asChild className="lg:hidden">
                                <Button variant="ghost" size="icon" className="text-gray-600">
                                    <Menu className="h-6 w-6" />

                                    <span className="sr-only">Toggle menu</span>
                                </Button>
                            </SheetTrigger>
                            <SheetContent side="right" className="w-[300px] sm:w-[400px] bg-[#0a0a0f]/95 backdrop-blur-xl border-white/10">
                                <div className="flex flex-col h-full">
                                    <div className="flex items-center justify-between mb-8">
                                        <Link href="/" onClick={() => setOpen(false)}>
                                            <img src="/logo.png" alt="Velonx Logo" className="h-14 w-auto" />
                                        </Link>
                                    </div>

                                    {/* Mobile User Info */}
                                    {session?.user && (
                                        <div className="flex items-center gap-3 p-4 rounded-xl bg-white/5 border border-white/10 mb-6">
                                            <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-blue-500/50">
                                                {session.user.image ? (
                                                    <img
                                                        src={session.user.image}
                                                        alt={session.user.name || "User"}
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full bg-gradient-to-br from-blue-500 to-violet-500 flex items-center justify-center text-white font-bold text-lg">
                                                        {session.user.name?.charAt(0) || "U"}
                                                    </div>
                                                )}
                                            </div>
                                            <div>
                                                <p className="text-white font-medium">{session.user.name}</p>
                                                <span className={`text-xs px-2 py-0.5 rounded-full ${session.user.role === "admin"
                                                    ? "bg-violet-500/20 text-violet-400"
                                                    : "bg-blue-500/20 text-blue-400"
                                                    }`}>
                                                    {session.user.role === "admin" ? "Admin" : "Student"}
                                                </span>
                                            </div>
                                        </div>
                                    )}

                                    <nav className="flex flex-col gap-2">
                                        {session?.user && (
                                            <Link
                                                href={dashboardLink}
                                                onClick={() => setOpen(false)}
                                                className="text-lg font-medium text-blue-400 transition-colors py-3 px-4 rounded-xl bg-blue-500/10 border border-blue-500/20"
                                            >
                                                Dashboard
                                            </Link>
                                        )}
                                        {navLinks.map((link) => (
                                            <Link
                                                key={link.href}
                                                href={link.href}
                                                onClick={() => setOpen(false)}
                                                className="text-lg font-medium text-gray-300 hover:text-blue-400 transition-colors py-3 px-4 rounded-xl hover:bg-white/5"
                                            >
                                                {link.label}
                                            </Link>
                                        ))}
                                    </nav>

                                    <div className="mt-auto pt-8 space-y-3">
                                        {session?.user ? (
                                            <button
                                                onClick={() => {
                                                    setOpen(false);
                                                    handleLogout();
                                                }}
                                                className="w-full border border-red-500/50 text-red-400 font-medium rounded-full py-3 hover:bg-red-500/10 transition-colors"
                                            >
                                                Log Out
                                            </button>
                                        ) : (
                                            <>
                                                <Link href="/auth/login" onClick={() => setOpen(false)}>
                                                    <button className="w-full outline-glow text-white font-medium rounded-full py-3">
                                                        Login
                                                    </button>
                                                </Link>
                                                <Link href="/auth/signup" onClick={() => setOpen(false)}>
                                                    <button className="w-full glow-button text-black font-semibold rounded-full py-3">
                                                        Join Community
                                                    </button>
                                                </Link>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </SheetContent>
                        </Sheet>
                    </div>
                </div>
            </div>
        </header >
    );
}

