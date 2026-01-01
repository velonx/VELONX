"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";

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

    return (
        <header className="fixed top-0 left-0 right-0 z-50">
            <div className="mx-4 mt-4">
                <div className="glass rounded-2xl">
                    <div className="container mx-auto px-6 h-20 flex items-center justify-between">
                        {/* Logo - Larger */}
                        <Link href="/" className="flex items-center gap-2 font-bold text-xl">
                            <img src="/logo.png" alt="Velonx Logo" className="h-16 w-auto" />
                        </Link>

                        {/* Desktop Navigation */}
                        <nav className="hidden lg:flex items-center gap-8 text-sm font-medium">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className="text-gray-400 hover:text-cyan-400 transition-colors duration-300"
                                >
                                    {link.label}
                                </Link>
                            ))}
                        </nav>

                        {/* Desktop Auth Buttons */}
                        <div className="hidden lg:flex items-center gap-4">
                            <Link href="/auth/login">
                                <button className="text-gray-300 hover:text-white font-medium px-4 py-2 transition-colors">
                                    Login
                                </button>
                            </Link>
                            <Link href="/auth/signup">
                                <button className="glow-button text-black font-semibold rounded-full px-6 py-2.5 text-sm">
                                    Join Community
                                </button>
                            </Link>
                        </div>

                        {/* Mobile Menu */}
                        <Sheet open={open} onOpenChange={setOpen}>
                            <SheetTrigger asChild className="lg:hidden">
                                <Button variant="ghost" size="icon" className="text-gray-300">
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

                                    <nav className="flex flex-col gap-2">
                                        {navLinks.map((link) => (
                                            <Link
                                                key={link.href}
                                                href={link.href}
                                                onClick={() => setOpen(false)}
                                                className="text-lg font-medium text-gray-300 hover:text-cyan-400 transition-colors py-3 px-4 rounded-xl hover:bg-white/5"
                                            >
                                                {link.label}
                                            </Link>
                                        ))}
                                    </nav>

                                    <div className="mt-auto pt-8 space-y-3">
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
                                    </div>
                                </div>
                            </SheetContent>
                        </Sheet>
                    </div>
                </div>
            </div>
        </header>
    );
}
