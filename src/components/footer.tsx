"use client";

import Link from "next/link";
import Image from "next/image";
import { Linkedin, Github, Instagram } from "lucide-react";
import { usePathname } from "next/navigation";

export function Footer() {
    const pathname = usePathname();
    const isAuth = pathname?.startsWith("/auth");

    if (isAuth) {
        return null; // Do not render footer on auth pages
    }

    return (
        <footer className="relative border-t border-border py-20 bg-background">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-2 md:grid-cols-12 gap-12 mb-16">
                    {/* Brand */}
                    <div className="col-span-2 md:col-span-4">
                        <div className="flex items-center gap-2 mb-6">
                            <Image src="/logo.webp" alt="Velonx" width={32} height={32} className="h-8 w-auto" />
                            <span className="text-foreground font-outfit font-bold text-xl tracking-tight">Velonx</span>
                        </div>
                        <p className="text-muted-foreground text-sm leading-relaxed max-w-sm mb-8">
                            Empowering the next generation of tech leaders through community, collaboration, and innovation.
                        </p>
                        <div className="flex items-center gap-4 mt-6">
                            <a href="https://github.com/velonx-in" target="_blank" rel="noopener noreferrer" aria-label="GitHub" className="text-muted-foreground hover:text-primary transition-colors">
                                <Github className="w-5 h-5" />
                            </a>
                            <a href="https://www.linkedin.com/company/velonx-in/" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="text-muted-foreground hover:text-primary transition-colors">
                                <Linkedin className="w-5 h-5" />
                            </a>
                            <a href="https://www.instagram.com/velonx.in?igsh=MW05aWtjdmpncG4xdA==" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="text-muted-foreground hover:text-primary transition-colors">
                                <Instagram className="w-5 h-5" />
                            </a>
                            <a href="https://x.com/velonx_in" target="_blank" rel="noopener noreferrer" aria-label="X (Twitter)" className="text-muted-foreground hover:text-primary transition-colors">
                                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                                </svg>
                            </a>
                        </div>
                    </div>

                    {/* Platform */}
                    <div className="col-span-1 md:col-span-2 md:ml-auto">
                        <h4 className="font-bold mb-6 text-foreground">Platform</h4>
                        <ul className="space-y-4 text-sm text-muted-foreground font-medium">
                            <li><Link href="/events" className="hover:text-primary transition-colors">Events</Link></li>
                            <li><Link href="/projects" className="hover:text-primary transition-colors">Projects</Link></li>
                            <li><Link href="/resources" className="hover:text-primary transition-colors">Resources</Link></li>
                            <li><Link href="/mentors" className="hover:text-primary transition-colors">Mentorship</Link></li>
                            <li><Link href="/career" className="hover:text-primary transition-colors">Job Board</Link></li>
                            <li><Link href="/leaderboard" className="hover:text-primary transition-colors">Leaderboard</Link></li>
                        </ul>
                    </div>

                    {/* Resources */}
                    <div className="col-span-1 md:col-span-2 md:ml-auto">
                        <h4 className="font-bold mb-6 text-foreground">Resources</h4>
                        <ul className="space-y-4 text-sm text-muted-foreground font-medium">
                            <li><Link href="/career" className="hover:text-primary transition-colors">Careers</Link></li>
                            <li><Link href="/blog" className="hover:text-primary transition-colors">Blog</Link></li>
                            <li><Link href="/contact" className="hover:text-primary transition-colors">Contact</Link></li>
                        </ul>
                    </div>

                    {/* Company */}
                    <div className="col-span-1 md:col-span-2 md:ml-auto">
                        <h4 className="font-bold mb-6 text-foreground">Company</h4>
                        <ul className="space-y-4 text-sm text-muted-foreground font-medium">
                            <li><Link href="/about" className="hover:text-primary transition-colors">About Us</Link></li>
                            <li><Link href="/community-guidelines" className="hover:text-primary transition-colors">Community Guidelines</Link></li>
                            <li><Link href="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
                            <li><Link href="/terms" className="hover:text-primary transition-colors">Terms of Service</Link></li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-border pt-8 text-center">
                    <p className="text-xs text-muted-foreground font-medium">
                        &copy; {new Date().getFullYear()} Velonx Inc. All rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    );
}

