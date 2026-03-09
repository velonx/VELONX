import { Shield, Heart, Users, MessageCircle, AlertTriangle, CheckCircle, XCircle, BookOpen } from "lucide-react";

// Enable ISR with revalidation every 7 days (604800 seconds)
export const revalidate = 604800;

export default function CommunityGuidelinesPage() {
    return (
        <div className="min-h-screen pt-24 bg-background">
            {/* Hero Section */}
            <section className="relative py-16 bg-background overflow-hidden">
                <div className="container mx-auto px-4 relative z-10 text-center">
                    <div className="max-w-4xl mx-auto">
                        <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 border border-primary/20 px-4 py-2 text-sm font-medium text-primary mb-6 mx-auto">
                            <Shield className="w-4 h-4" />
                            Community Standards
                        </div>
                        <h1 className="text-4xl md:text-6xl font-black mb-6 text-foreground">
                            Community <span className="text-primary">Guidelines</span>
                        </h1>
                        <p className="text-muted-foreground text-xl mb-8 max-w-2xl mx-auto">
                            Building a respectful, inclusive, and supportive community for all members.
                        </p>
                    </div>
                </div>
            </section>

            <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent" />

            {/* Core Values */}
            <section className="py-16 bg-background">
                <div className="container mx-auto px-4 max-w-6xl">
                    <h2 className="text-3xl font-bold text-foreground mb-8 text-center">Our Core Values</h2>
                    <div className="grid md:grid-cols-3 gap-8 mb-16">
                        <div className="text-center p-6 bg-primary/5 border border-primary/10 rounded-3xl">
                            <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center mx-auto mb-4">
                                <Heart className="w-8 h-8 text-primary-foreground" />
                            </div>
                            <h3 className="text-xl font-bold text-foreground mb-2">Respect</h3>
                            <p className="text-muted-foreground">Treat everyone with kindness and consideration</p>
                        </div>
                        <div className="text-center p-6 bg-secondary/10 border border-secondary/10 rounded-3xl">
                            <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mx-auto mb-4">
                                <Users className="w-8 h-8 text-primary-foreground" />
                            </div>
                            <h3 className="text-xl font-bold text-foreground mb-2">Inclusivity</h3>
                            <p className="text-muted-foreground">Welcome and support members from all backgrounds</p>
                        </div>
                        <div className="text-center p-6 bg-emerald-500/5 border border-emerald-500/10 rounded-3xl">
                            <div className="w-16 h-16 rounded-full bg-emerald-600 flex items-center justify-center mx-auto mb-4">
                                <BookOpen className="w-8 h-8 text-white" />
                            </div>
                            <h3 className="text-xl font-bold text-foreground mb-2">Learning</h3>
                            <p className="text-muted-foreground">Foster growth and knowledge sharing</p>
                        </div>
                    </div>

                    {/* Guidelines Sections */}
                    <div className="space-y-12">
                        {/* Do's */}
                        <div className="bg-emerald-500/5 rounded-3xl p-8 border-2 border-emerald-500/20">
                            <div className="flex items-center gap-3 mb-6">
                                <CheckCircle className="w-8 h-8 text-emerald-500" />
                                <h3 className="text-2xl font-bold text-foreground">Do&apos;s - What We Encourage</h3>
                            </div>
                            <ul className="space-y-4">
                                {[
                                    ["Be Respectful:", "Treat all members with courtesy and respect, regardless of their skill level or background."],
                                    ["Help Others:", "Share your knowledge and assist fellow members when they need help."],
                                    ["Give Constructive Feedback:", "Provide helpful, actionable feedback that helps others improve."],
                                    ["Collaborate:", "Work together on projects and share resources with the community."],
                                    ["Credit Others:", "Always give credit when using someone else's work or ideas."],
                                    ["Stay On Topic:", "Keep discussions relevant to technology, learning, and professional development."],
                                    ["Report Issues:", "If you see inappropriate behavior, report it to moderators."],
                                ].map(([label, text], i) => (
                                    <li key={i} className="flex items-start gap-3">
                                        <CheckCircle className="w-5 h-5 text-emerald-500 mt-1 flex-shrink-0" />
                                        <div>
                                            <strong className="text-foreground">{label}</strong>
                                            <span className="text-muted-foreground"> {text}</span>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Don'ts */}
                        <div className="bg-destructive/5 rounded-3xl p-8 border-2 border-destructive/20">
                            <div className="flex items-center gap-3 mb-6">
                                <XCircle className="w-8 h-8 text-destructive" />
                                <h3 className="text-2xl font-bold text-foreground">Don&apos;ts - What&apos;s Not Allowed</h3>
                            </div>
                            <ul className="space-y-4">
                                {[
                                    ["No Harassment:", "Bullying, harassment, or discrimination of any kind will not be tolerated."],
                                    ["No Hate Speech:", "Content that promotes hatred or violence against individuals or groups is prohibited."],
                                    ["No Spam:", "Don't post repetitive content, excessive self-promotion, or irrelevant links."],
                                    ["No Plagiarism:", "Don't claim others' work as your own. Always give proper attribution."],
                                    ["No Inappropriate Content:", "Keep content professional and appropriate for all ages."],
                                    ["No Cheating:", "Don't share solutions to assignments or help others cheat on assessments."],
                                    ["No Personal Attacks:", "Criticize ideas, not people. Keep discussions professional and constructive."],
                                ].map(([label, text], i) => (
                                    <li key={i} className="flex items-start gap-3">
                                        <XCircle className="w-5 h-5 text-destructive mt-1 flex-shrink-0" />
                                        <div>
                                            <strong className="text-foreground">{label}</strong>
                                            <span className="text-muted-foreground"> {text}</span>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Communication Guidelines */}
                        <div className="bg-primary/5 rounded-3xl p-8 border-2 border-primary/15">
                            <div className="flex items-center gap-3 mb-6">
                                <MessageCircle className="w-8 h-8 text-primary" />
                                <h3 className="text-2xl font-bold text-foreground">Communication Best Practices</h3>
                            </div>
                            <ul className="space-y-4">
                                {[
                                    ["Be Clear and Concise:", "Express your thoughts clearly and avoid unnecessary jargon."],
                                    ["Use Proper Formatting:", "Format code properly and use appropriate channels for different topics."],
                                    ["Search Before Asking:", "Check if your question has been answered before posting."],
                                    ["Be Patient:", "Remember that everyone is learning. Give others time to respond."],
                                ].map(([label, text], i) => (
                                    <li key={i} className="flex items-start gap-3">
                                        <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center mt-1 flex-shrink-0">
                                            <span className="text-primary-foreground text-xs font-bold">{i + 1}</span>
                                        </div>
                                        <div>
                                            <strong className="text-foreground">{label}</strong>
                                            <span className="text-muted-foreground"> {text}</span>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Consequences */}
                        <div className="bg-amber-500/5 rounded-3xl p-8 border-2 border-amber-500/20">
                            <div className="flex items-center gap-3 mb-6">
                                <AlertTriangle className="w-8 h-8 text-amber-500" />
                                <h3 className="text-2xl font-bold text-foreground">Consequences of Violations</h3>
                            </div>
                            <p className="text-muted-foreground mb-4">Violations of these guidelines may result in:</p>
                            <ul className="space-y-3 text-foreground">
                                {[
                                    ["First Offense:", "Warning and guidance on proper behavior"],
                                    ["Second Offense:", "Temporary suspension from community activities"],
                                    ["Severe/Repeated Offenses:", "Permanent ban from the platform"],
                                ].map(([label, text], i) => (
                                    <li key={i} className="flex items-start gap-2">
                                        <span className="font-bold text-amber-500">•</span>
                                        <span><strong className="text-foreground">{label}</strong> <span className="text-muted-foreground">{text}</span></span>
                                    </li>
                                ))}
                            </ul>
                            <p className="text-muted-foreground mt-4 italic">
                                Note: Severe violations (harassment, hate speech, threats) may result in immediate permanent ban.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Contact Section */}
            <section className="py-16 bg-muted/20 border-t border-border">
                <div className="container mx-auto px-4 max-w-4xl text-center">
                    <h2 className="text-3xl font-bold text-foreground mb-4">Questions or Concerns?</h2>
                    <p className="text-muted-foreground mb-8 text-lg">
                        If you have questions about these guidelines or need to report a violation, please contact our moderation team.
                    </p>
                    <a
                        href="/contact"
                        className="inline-block bg-primary hover:bg-primary/90 text-primary-foreground font-bold px-8 py-4 rounded-full transition-colors"
                    >
                        Contact Support
                    </a>
                </div>
            </section>

            {/* Last Updated */}
            <section className="py-8 bg-background border-t border-border">
                <div className="container mx-auto px-4 text-center">
                    <p className="text-muted-foreground text-sm">
                        Last Updated: January 2026 | These guidelines are subject to change
                    </p>
                </div>
            </section>
        </div>
    );
}
