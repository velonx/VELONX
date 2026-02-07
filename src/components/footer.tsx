import Link from "next/link";
import { Twitter, Linkedin, Github } from "lucide-react";

export function Footer() {
    return (
        <footer className="relative border-t border-border py-20 bg-background">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-2 md:grid-cols-12 gap-12 mb-16">
                    {/* Brand */}
                    <div className="col-span-2 md:col-span-4">
                        <div className="flex items-center gap-2 mb-6">
                            <img src="/logo.png" alt="Velonx" className="h-8 w-auto" />
                            <span className="text-foreground font-outfit font-bold text-xl tracking-tight">Velonx</span>
                        </div>
                        <p className="text-muted-foreground text-sm leading-relaxed max-w-sm mb-8">
                            Empowering the next generation of tech leaders through community, collaboration, and innovation.
                        </p>
                        <div className="flex items-center gap-4 text-muted-foreground">
                            <a href="#" className="hover:text-[#219EBC] transition-colors"><Twitter className="w-5 h-5" /></a>
                            <a href="#" className="hover:text-[#219EBC] transition-colors"><Linkedin className="w-5 h-5" /></a>
                            <a href="#" className="hover:text-[#219EBC] transition-colors"><Github className="w-5 h-5" /></a>
                        </div>
                    </div>

                    {/* Platform */}
                    <div className="col-span-1 md:col-span-2 md:ml-auto">
                        <h4 className="font-bold mb-6 text-foreground">Platform</h4>
                        <ul className="space-y-4 text-sm text-muted-foreground font-medium">
                            <li><Link href="/events" className="hover:text-[#219EBC] transition-colors">Events</Link></li>
                            <li><Link href="/projects" className="hover:text-[#219EBC] transition-colors">Projects</Link></li>
                            <li><Link href="/resources" className="hover:text-[#219EBC] transition-colors">Resources</Link></li>
                            <li><Link href="/mentors" className="hover:text-[#219EBC] transition-colors">Mentorship</Link></li>
                            <li><Link href="/career" className="hover:text-[#219EBC] transition-colors">Job Board</Link></li>
                            <li><Link href="/leaderboard" className="hover:text-[#219EBC] transition-colors">Leaderboard</Link></li>
                        </ul>
                    </div>

                    {/* Company */}
                    <div className="col-span-1 md:col-span-2 md:ml-auto">
                        <h4 className="font-bold mb-6 text-foreground">Company</h4>
                        <ul className="space-y-4 text-sm text-muted-foreground font-medium">
                            <li><Link href="/about" className="hover:text-[#219EBC] transition-colors">About Us</Link></li>
                            <li><Link href="/career" className="hover:text-[#219EBC] transition-colors">Careers</Link></li>
                            <li><Link href="/blog" className="hover:text-[#219EBC] transition-colors">Blog</Link></li>
                            <li><Link href="/contact" className="hover:text-[#219EBC] transition-colors">Contact</Link></li>
                        </ul>
                    </div>

                    {/* Resources */}
                    <div className="col-span-1 md:col-span-2 md:ml-auto">
                        <h4 className="font-bold mb-6 text-foreground">Resources</h4>
                        <ul className="space-y-4 text-sm text-muted-foreground font-medium">
                            <li><Link href="/docs" className="hover:text-[#219EBC] transition-colors">Documentation</Link></li>
                            <li><Link href="/help" className="hover:text-[#219EBC] transition-colors">Help Center</Link></li>
                            <li><Link href="/community-guidelines" className="hover:text-[#219EBC] transition-colors">Community Guidelines</Link></li>
                            <li><Link href="/privacy" className="hover:text-[#219EBC] transition-colors">Privacy Policy</Link></li>
                            <li><Link href="/terms" className="hover:text-[#219EBC] transition-colors">Terms of Service</Link></li>
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

