import Link from "next/link";

export function Footer() {
    return (
        <footer className="relative border-t border-gray-200 py-16 bg-white">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
                    {/* Brand */}
                    <div className="col-span-2 md:col-span-1">
                        <img src="/logo.png" alt="Velonx" className="h-12 w-auto mb-4" />
                        <p className="text-gray-500 text-sm leading-relaxed">
                            Bridging the Gap, Building Futures. A student-driven innovation community.
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="font-semibold mb-4 text-gray-900">Explore</h4>
                        <ul className="space-y-3 text-sm text-gray-500">
                            <li><Link href="/projects" className="hover:text-[#219EBC] transition-colors">Projects</Link></li>
                            <li><Link href="/events" className="hover:text-[#219EBC] transition-colors">Events</Link></li>
                            <li><Link href="/resources" className="hover:text-[#219EBC] transition-colors">Resources</Link></li>
                            <li><Link href="/leaderboard" className="hover:text-[#219EBC] transition-colors">Leaderboard</Link></li>
                        </ul>
                    </div>

                    {/* Community */}
                    <div>
                        <h4 className="font-semibold mb-4 text-gray-900">Community</h4>
                        <ul className="space-y-3 text-sm text-gray-500">
                            <li><Link href="/mentors" className="hover:text-[#219EBC] transition-colors">Find Mentors</Link></li>
                            <li><Link href="/career" className="hover:text-[#219EBC] transition-colors">Career Center</Link></li>
                            <li><Link href="/about" className="hover:text-[#219EBC] transition-colors">About Us</Link></li>
                            <li><Link href="/auth/signup" className="hover:text-[#219EBC] transition-colors">Join Us</Link></li>
                        </ul>
                    </div>

                    {/* Connect */}
                    <div>
                        <h4 className="font-semibold mb-4 text-gray-900">Connect</h4>
                        <ul className="space-y-3 text-sm text-gray-500">
                            <li><a href="#" className="hover:text-[#219EBC] transition-colors">Discord</a></li>
                            <li><a href="#" className="hover:text-[#219EBC] transition-colors">Twitter</a></li>
                            <li><a href="#" className="hover:text-[#219EBC] transition-colors">LinkedIn</a></li>
                            <li><a href="#" className="hover:text-[#219EBC] transition-colors">GitHub</a></li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-gray-200 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
                    <p className="text-sm text-gray-500">
                        &copy; {new Date().getFullYear()} Velonx Community. All rights reserved.
                    </p>
                    <div className="flex items-center gap-6 text-sm text-gray-500">
                        <Link href="#" className="hover:text-[#219EBC] transition-colors">Privacy Policy</Link>
                        <Link href="#" className="hover:text-[#219EBC] transition-colors">Terms of Service</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}

