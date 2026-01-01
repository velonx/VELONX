import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

export default function Home() {
    return (
        <div className="flex flex-col">
            {/* Hero Section */}
            <section className="relative min-h-screen flex items-center pt-24 mesh-gradient-bg noise-overlay">
                {/* Floating Orbs - More subtle */}
                <div className="absolute top-32 right-[20%] w-[400px] h-[400px] orb orb-cyan opacity-60" style={{ animationDelay: '0s' }} />
                <div className="absolute top-[50%] right-[8%] w-[300px] h-[300px] orb orb-violet opacity-50" style={{ animationDelay: '2s' }} />
                <div className="absolute bottom-[15%] left-[5%] w-[250px] h-[250px] orb orb-yellow opacity-40" style={{ animationDelay: '4s' }} />

                <div className="container mx-auto px-4 md:px-6 relative z-10">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        {/* Left Content */}
                        <div className="space-y-6">
                            {/* Glowing Badge */}
                            <div className="inline-flex items-center gap-2 rounded-full glow-badge px-4 py-2 text-sm font-medium text-cyan-300">
                                <Sparkles className="w-4 h-4" />
                                <span>For Students, By Students</span>
                            </div>

                            {/* Main Headline - Reduced font size */}
                            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight leading-[1.15]">
                                <span className="gradient-text-cyan inline-block text-vanish-line-1">Student-driven</span>
                                <br />
                                <span className="text-white inline-block text-vanish-line-2">Innovating the Gap,</span>
                                <br />
                                <span className="gradient-text-yellow inline-block text-vanish-line-3">Building Futures</span>
                            </h1>

                            {/* Subtext */}
                            <p className="text-gray-400 text-base md:text-lg max-w-xl leading-relaxed">
                                Velonx is a tech community where learners build real projects, explore emerging technologies, and grow together through collaboration.
                            </p>

                            {/* Buttons */}
                            <div className="flex flex-wrap gap-4 pt-2">
                                <Link href="/auth/signup">
                                    <button className="glow-button text-black font-semibold rounded-full px-7 py-3.5 text-base flex items-center gap-2 transition-all">
                                        Join Community <ArrowRight className="w-5 h-5" />
                                    </button>
                                </Link>
                                <Link href="/projects">
                                    <button className="outline-glow text-white font-medium rounded-full px-7 py-3.5 text-base transition-all">
                                        Explore Projects
                                    </button>
                                </Link>
                            </div>
                        </div>

                        {/* Right Side - Glass Card */}
                        <div className="hidden lg:flex justify-end">
                            <div className="relative">
                                {/* Main Glass Card */}
                                <div className="w-80 glass-strong rounded-3xl p-6 card-3d border border-white/10 rotating-border scanline-hover">
                                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500 to-violet-600 flex items-center justify-center text-white text-3xl font-black mb-5 shadow-lg shadow-cyan-500/30">
                                        V
                                    </div>
                                    <h3 className="text-white text-lg font-bold mb-2">Welcome to Velonx</h3>
                                    <p className="text-gray-400 text-sm mb-5">Your journey to tech excellence starts here.</p>

                                    <div className="space-y-3 mb-6">
                                        <div className="flex items-center gap-3">
                                            <div className="w-2 h-2 rounded-full bg-cyan-400" />
                                            <span className="text-gray-300 text-sm">Build real projects</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="w-2 h-2 rounded-full bg-violet-400" />
                                            <span className="text-gray-300 text-sm">Learn from mentors</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="w-2 h-2 rounded-full bg-yellow-400" />
                                            <span className="text-gray-300 text-sm">Grow your network</span>
                                        </div>
                                    </div>

                                    {/* Stats */}
                                    <div className="flex justify-between text-center pt-4 border-t border-white/10">
                                        <div>
                                            <div className="text-xl font-bold gradient-text-cyan">1K+</div>
                                            <div className="text-xs text-gray-500">Members</div>
                                        </div>
                                        <div>
                                            <div className="text-xl font-bold gradient-text-violet">50+</div>
                                            <div className="text-xs text-gray-500">Projects</div>
                                        </div>
                                        <div>
                                            <div className="text-xl font-bold gradient-text-yellow">30+</div>
                                            <div className="text-xs text-gray-500">Events</div>
                                        </div>
                                    </div>
                                </div>

                                {/* Floating Mini Cards */}
                                <div className="absolute -top-6 -left-10 w-20 h-20 glass rounded-2xl flex items-center justify-center border border-white/10 glitch-hover" style={{ animation: 'float 4s ease-in-out infinite' }}>
                                    <span className="text-3xl">🚀</span>
                                </div>
                                <div className="absolute -bottom-4 -right-8 w-16 h-16 glass rounded-2xl flex items-center justify-center border border-white/10 pulse-glow-yellow" style={{ animation: 'float 5s ease-in-out infinite', animationDelay: '1s' }}>
                                    <span className="text-2xl">💡</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Divider */}
            <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

            {/* Stats Section - More defined */}
            <section className="relative py-16 bg-[#080810]">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        <div className="text-center p-6 rounded-2xl bg-white/[0.02] border border-white/5 stats-card-animated pulse-glow-cyan cursor-pointer">
                            <div className="text-3xl md:text-4xl font-black gradient-text-cyan mb-1">1000+</div>
                            <div className="text-gray-500 text-sm uppercase tracking-wider">Community Members</div>
                        </div>
                        <div className="text-center p-6 rounded-2xl bg-white/[0.02] border border-white/5 stats-card-animated pulse-glow-violet cursor-pointer">
                            <div className="text-3xl md:text-4xl font-black gradient-text-violet mb-1">50+</div>
                            <div className="text-gray-500 text-sm uppercase tracking-wider">Projects Built</div>
                        </div>
                        <div className="text-center p-6 rounded-2xl bg-white/[0.02] border border-white/5 stats-card-animated pulse-glow-yellow cursor-pointer">
                            <div className="text-3xl md:text-4xl font-black gradient-text-yellow mb-1">30+</div>
                            <div className="text-gray-500 text-sm uppercase tracking-wider">Events Hosted</div>
                        </div>
                        <div className="text-center p-6 rounded-2xl bg-white/[0.02] border border-white/5 stats-card-animated pulse-glow-cyan cursor-pointer">
                            <div className="text-3xl md:text-4xl font-black gradient-text-cyan mb-1">100%</div>
                            <div className="text-gray-500 text-sm uppercase tracking-wider">Free to Join</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Divider */}
            <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

            {/* Features Section - More defined with cards */}
            <section className="relative py-20 bg-[#0a0a0f]">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-14">
                        <h2 className="text-3xl md:text-4xl font-black mb-3">
                            <span className="gradient-text-cyan">Why</span> <span className="text-white">Join Velonx?</span>
                        </h2>
                        <p className="text-gray-400 max-w-xl mx-auto">
                            Everything you need to accelerate your tech journey.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
                        {[
                            { icon: "💻", title: "Real Projects", desc: "Build products that solve actual problems", color: "cyan" },
                            { icon: "🎓", title: "Expert Mentors", desc: "Learn from industry professionals", color: "violet" },
                            { icon: "📚", title: "Free Resources", desc: "Curated roadmaps and tutorials", color: "yellow" },
                            { icon: "🏆", title: "Gamification", desc: "Earn XP and climb leaderboards", color: "cyan" },
                        ].map((feature, i) => (
                            <div key={i} className={`glass rounded-2xl p-6 transition-all group cursor-pointer border border-white/5 feature-card-animated shimmer-card wave-underline ${feature.color === 'cyan' ? 'hover:border-cyan-500/50' :
                                feature.color === 'violet' ? 'hover:border-violet-500/50' :
                                    'hover:border-yellow-500/50'
                                }`}>
                                <div className="text-4xl mb-4 feature-icon inline-block">{feature.icon}</div>
                                <h3 className={`text-white text-lg font-bold mb-2 transition-colors ${feature.color === 'cyan' ? 'group-hover:text-cyan-400' :
                                    feature.color === 'violet' ? 'group-hover:text-violet-400' :
                                        'group-hover:text-yellow-400'
                                    }`}>{feature.title}</h3>
                                <p className="text-gray-500 text-sm">{feature.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Divider */}
            <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

            {/* CTA Section - More defined */}
            <section className="relative py-20 bg-[#080810] overflow-hidden">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] orb orb-violet opacity-20" />

                <div className="container mx-auto px-4 relative z-10 text-center">
                    <div className="max-w-2xl mx-auto p-10 rounded-3xl bg-white/[0.02] border border-white/5 breathing-glow tilt-hover gradient-border-hover">
                        <h2 className="text-3xl md:text-4xl font-black mb-4">
                            <span className="text-white">Ready to</span> <span className="gradient-text-yellow">Start Building?</span>
                        </h2>
                        <p className="text-gray-400 mb-8">
                            Join thousands of students who are already building the future.
                        </p>
                        <div className="flex flex-wrap justify-center gap-4">
                            <Link href="/auth/signup">
                                <button className="glow-button-yellow text-black font-semibold rounded-full px-8 py-3.5 text-base transition-all">
                                    Get Started Free
                                </button>
                            </Link>
                            <Link href="/events">
                                <button className="outline-glow text-white font-medium rounded-full px-8 py-3.5 text-base transition-all">
                                    Browse Events
                                </button>
                            </Link>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
