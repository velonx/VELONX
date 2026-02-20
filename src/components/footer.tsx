import Link from "next/link";
import { Twitter, Linkedin, Github, Facebook, Share2 } from "lucide-react";

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
                        <div className="flex items-center">
                            <button
                                className="font-outfit relative overflow-hidden justify-center flex w-36 h-12 rounded-3xl text-white bg-blue-600 cursor-pointer transition-all duration-[5000ms] ease-in-out group hover:rounded-lg"
                            >
                                <span
                                    className="absolute inset-0 flex items-center justify-center gap-2 text-md transition-all duration-300 ease-in-out translate-y-0 group-hover:-translate-y-10 group-hover:opacity-0"
                                >
                                    <span>Share</span>
                                    <Share2 className="w-5 h-5" />
                                </span>
                                <span
                                    className="absolute inset-0 flex gap-5 items-center justify-center px-7 opacity-0 transition-opacity ease-in-out group-hover:opacity-100"
                                >
                                    <a
                                        href="#"
                                        className="transition-transform text-lg duration-200 ease-in-out translate-y-10 group-hover:translate-y-0 hover:text-white/80"
                                    >
                                        <Twitter className="w-5 h-5" />
                                    </a>
                                    <a
                                        href="#"
                                        className="transition-transform text-lg duration-200 ease-in-out translate-y-10 group-hover:translate-y-0 group-hover:delay-75 hover:text-white/80"
                                    >
                                        <Facebook className="w-5 h-5" />
                                    </a>
                                    <a
                                        href="#"
                                        className="transition-transform text-lg duration-200 ease-in-out translate-y-10 group-hover:translate-y-0 group-hover:delay-150 hover:text-white/80"
                                    >
                                        <Linkedin className="w-5 h-5" />
                                    </a>
                                </span>
                            </button>
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

