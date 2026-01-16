"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { MENTORS } from "@/lib/mock-data";
import { Search, Star, MessageCircle, Linkedin, Sparkles, Filter, Loader2, Calendar, ArrowRight } from "lucide-react";
import toast from "react-hot-toast";

export default function MentorsPage() {
    const [selectedTag, setSelectedTag] = useState("All");
    const [searchQuery, setSearchQuery] = useState("");
    const [connectingId, setConnectingId] = useState<number | null>(null);

    const tags = ["All", "Frontend", "Backend", "AI/ML", "Mobile", "DevOps", "Design"];

    const filteredMentors = MENTORS.filter(mentor => {
        const matchesTag = selectedTag === "All" || mentor.expertise.includes(selectedTag);
        const matchesSearch = mentor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            mentor.company.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesTag && matchesSearch;
    });

    const handleConnect = async (mentorId: number, mentorName: string) => {
        setConnectingId(mentorId);
        // Simulate connection
        await new Promise(resolve => setTimeout(resolve, 1500));
        toast.success(`Request sent to connect with ${mentorName}!`);
        setConnectingId(null);
    };

    const handleLinkedin = (mentorName: string) => {
        toast.success(`Opening ${mentorName}'s LinkedIn profile...`);
    };

    return (
        <div className="min-h-screen pt-24 bg-white">
            {/* Hero Section */}
            <section className="relative py-16 bg-gradient-to-b from-gray-50 to-white">
                <div className="container mx-auto px-4 relative z-10 text-center">
                    <div className="max-w-3xl mx-auto">
                        <div className="inline-flex items-center gap-2 rounded-full bg-[#E9C46A]/10 border border-[#E9C46A]/30 px-4 py-2 text-sm font-medium text-[#8B7A52] mb-6 mx-auto">
                            <Sparkles className="w-4 h-4" />
                            Mentorship Program
                        </div>
                        <h1 className="text-4xl md:text-6xl font-black mb-6 text-gray-900">
                            Connect with <span className="text-[#E9C46A]">Industry Mentors</span>
                        </h1>
                        <p className="text-gray-600 text-xl mb-8 max-w-2xl mx-auto">
                            Get guidance from experienced professionals who have been in your shoes and succeeded.
                        </p>
                        <div className="relative max-w-xl mx-auto">
                            <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <Input
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search mentors by name or expertise..."
                                className="pl-14 py-7 rounded-full bg-white border-gray-200 text-gray-900 placeholder:text-gray-400 text-lg shadow-sm focus:ring-2 focus:ring-[#E9C46A]/20"
                            />
                        </div>
                    </div>
                </div>
            </section>

            <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />

            {/* Filters */}
            <section className="py-8 bg-white border-b border-gray-100">
                <div className="container mx-auto px-4">
                    <div className="flex flex-wrap justify-center gap-3">
                        {tags.map((tag) => (
                            <Button
                                key={tag}
                                variant={selectedTag === tag ? "default" : "outline"}
                                onClick={() => setSelectedTag(tag)}
                                className={`rounded-full px-6 transition-all ${selectedTag === tag
                                    ? 'bg-[#219EBC] hover:bg-[#1a7a94] text-white border-[#219EBC]'
                                    : 'text-gray-700 hover:bg-gray-50 border-gray-300'
                                    }`}
                            >
                                {tag}
                            </Button>
                        ))}
                        <Button
                            variant="outline"
                            onClick={() => toast.success("More filters coming soon!")}
                            className="rounded-full border-gray-300 text-gray-700 hover:bg-gray-50"
                        >
                            <Filter className="w-4 h-4 mr-2" /> More Filters
                        </Button>
                    </div>
                </div>
            </section>

            {/* Mentors Grid */}
            <section className="py-16 animate-on-scroll bg-gray-50/50">
                <div className="container mx-auto px-4">
                    {filteredMentors.length > 0 ? (
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {filteredMentors.map((mentor, index) => (
                                <Card key={mentor.id} className="bg-white border border-gray-200 hover:border-[#219EBC] hover:shadow-xl transition-all group overflow-hidden flex flex-col">
                                    <div className={`h-2 ${index % 3 === 0 ? 'bg-[#E9C46A]' : index % 3 === 1 ? 'bg-[#219EBC]' : 'bg-[#F4A261]'}`} />
                                    <CardHeader>
                                        <div className="flex items-start gap-4">
                                            <Avatar className="w-16 h-16 border-2 border-gray-50 shadow-sm">
                                                <AvatarFallback className={`text-xl font-bold ${index % 3 === 0 ? 'bg-orange-50 text-orange-600' : index % 3 === 1 ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'}`}>
                                                    {mentor.name.split(' ').map(n => n[0]).join('')}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="flex-1">
                                                <CardTitle className="text-gray-900 text-lg group-hover:text-[#219EBC] transition-colors">{mentor.name}</CardTitle>
                                                <CardDescription className="text-gray-500 font-medium">{mentor.company}</CardDescription>
                                                <div className="flex items-center gap-1 mt-1">
                                                    <Star className="w-4 h-4 fill-[#E9C46A] text-[#E9C46A]" />
                                                    <span className="text-sm font-bold text-gray-700">{mentor.rating}</span>
                                                    <span className="text-gray-400 text-sm">• {mentor.sessions} sessions</span>
                                                </div>
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="flex-1">
                                        <div className="flex flex-wrap gap-2 mb-4">
                                            {mentor.expertise.map((skill) => (
                                                <Badge key={skill} className="bg-gray-100 text-gray-600 border-0 hover:bg-[#219EBC]/10 hover:text-[#219EBC] transition-colors">{skill}</Badge>
                                            ))}
                                        </div>
                                        <p className="text-gray-600 text-sm leading-relaxed">
                                            Available for 1:1 mentoring sessions. Helping students transition into high-impact tech roles at top companies.
                                        </p>
                                    </CardContent>
                                    <CardFooter className="gap-2 pt-0">
                                        <Button
                                            onClick={() => handleConnect(mentor.id, mentor.name)}
                                            disabled={connectingId === mentor.id}
                                            className="flex-1 bg-[#219EBC] hover:bg-[#1a7a94] text-white font-bold rounded-full py-6 shadow-md shadow-[#219EBC]/10"
                                        >
                                            {connectingId === mentor.id ? (
                                                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Sending...</>
                                            ) : (
                                                <><MessageCircle className="w-4 h-4 mr-2" /> Book Session</>
                                            )}
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            onClick={() => handleLinkedin(mentor.name)}
                                            className="rounded-full border-gray-300 text-gray-400 hover:text-blue-600 hover:border-blue-600 w-12 h-12"
                                        >
                                            <Linkedin className="w-5 h-5" />
                                        </Button>
                                    </CardFooter>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-20 bg-white rounded-3xl border border-gray-100 italic text-gray-500 shadow-sm">
                            No mentors found matching your search. Try different keywords!
                        </div>
                    )}
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 bg-white">
                <div className="container mx-auto px-4 max-w-4xl">
                    <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-10 text-center text-white relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-[#219EBC]/10 blur-3xl rounded-full -mr-20 -mt-20" />
                        <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#E9C46A]/10 blur-3xl rounded-full -ml-20 -mb-20" />

                        <h2 className="text-3xl font-bold mb-4 relative z-10">Want to become a Mentor?</h2>
                        <p className="text-gray-400 mb-8 max-w-xl mx-auto relative z-10 text-lg">
                            Share your knowledge and help the next generation of tech leaders. Join our elite pool of mentors today.
                        </p>
                        <Button
                            onClick={() => toast.success("Redirecting to application form...")}
                            className="bg-white hover:bg-gray-100 text-gray-900 font-bold rounded-full px-10 py-6 text-lg relative z-10"
                        >
                            Apply to Mentor <ArrowRight className="w-5 h-5 ml-2" />
                        </Button>
                    </div>
                </div>
            </section>
        </div>
    );
}
