"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import {
    Users,
    Lightbulb,
    BarChart3,
    CheckCircle,
    XCircle,
    Clock,
    Sparkles,
    TrendingUp,
    Calendar,
    Eye,
    Download,
    Search,
    MoreHorizontal,
    Mail,
    ShieldCheck,
    FileText,
    Image,
    Layout,
    PenTool,
    Send,
    Bell,
    ArrowLeft,
    CheckCircle2,
    Settings
} from "lucide-react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";

export default function AdminDashboard() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [activeTab, setActiveTab] = useState("Management");

    const [requests, setRequests] = useState([
        { id: 1, name: "Alice Johnson", email: "alice@college.edu", date: "2024-12-28", status: "pending" },
        { id: 2, name: "Bob Smith", email: "bob@uni.edu", date: "2024-12-27", status: "pending" },
        { id: 3, name: "Carol Davis", email: "carol@tech.edu", date: "2024-12-26", status: "pending" },
    ]);

    const [ideas, setIdeas] = useState([
        { id: 1, title: "AI Resume Builder", author: "John Doe", date: "2024-12-28", status: "pending" },
        { id: 2, title: "Campus Marketplace", author: "Jane Smith", date: "2024-12-27", status: "pending" },
    ]);

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/auth/login");
        } else if (status === "authenticated" && session?.user?.role !== "admin") {
            router.push("/dashboard/student");
        }
    }, [status, session, router]);

    const handleRequestAction = (id: number, name: string, action: 'approve' | 'reject') => {
        setRequests(requests.map(r => r.id === id ? { ...r, status: action === 'approve' ? 'approved' : 'rejected' } : r));
        toast.success(`User "${name}" ${action === 'approve' ? 'approved' : 'rejected'} successfully.`);
    };

    const handleIdeaAction = (id: number, title: string, action: 'approve' | 'reject') => {
        setIdeas(ideas.map(i => i.id === id ? { ...i, status: action === 'approve' ? 'approved' : 'rejected' } : i));
        toast.success(`Project idea "${title}" ${action === 'approve' ? 'approved' : 'rejected'} successfully.`);
    };

    if (status === "loading") {
        return (
            <div className="min-h-screen pt-24 flex items-center justify-center bg-white">
                <div className="w-16 h-16 rounded-full border-4 border-[#219EBC] border-t-transparent animate-spin" />
            </div>
        );
    }

    if (!session || session.user?.role !== "admin") return null;

    const navItems = [
        { icon: Layout, label: "Management" },
        { icon: PenTool, label: "Blog Authoring" },
        { icon: BarChart3, label: "Analytics" },
        { icon: Settings, label: "Platform Info" },
    ];

    const platformStats = [
        { label: "Active Members", value: "1,247", change: "+12%", color: "border-[#7FD8D8]" },
        { label: "Project Ideas", value: "15", change: "+3", color: "border-[#FF7F5C]" },
        { label: "Blog Posts", value: "32", change: "+5", color: "border-[#5E239D]" },
    ];

    return (
        <div className="flex min-h-screen bg-[#FDFCFB] pt-20">
            {/* Left Sidebar */}
            <aside className="w-80 bg-[#023047] flex flex-col p-8 fixed left-0 top-20 bottom-0 z-20 text-white">
                <div className="flex items-center gap-3 mb-12">
                    <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center text-white font-bold border border-white/20">A</div>
                    <span className="text-xl font-black tracking-tight">Admin Console</span>
                </div>

                <div className="mb-12">
                    <div className="relative inline-block mb-4">
                        <div className="w-20 h-20 rounded-full border-2 border-[#219EBC] p-1">
                            <img src={session.user?.image || "/avatars/admin.png"} alt="Admin" className="w-full h-full rounded-full object-cover" />
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-[#219EBC] rounded-full flex items-center justify-center shadow-md">
                            <ShieldCheck className="w-3 h-3 text-white" />
                        </div>
                    </div>
                    <h2 className="text-xl font-black mb-1">{session.user?.name}</h2>
                    <p className="text-white/50 text-sm font-medium">{session.user?.email}</p>
                </div>

                <nav className="flex-1 space-y-2">
                    {navItems.map((item) => (
                        <button
                            key={item.label}
                            onClick={() => setActiveTab(item.label)}
                            className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all font-bold ${activeTab === item.label
                                ? "bg-white/10 text-[#219EBC]"
                                : "text-white/50 hover:bg-white/5 hover:text-white"
                                }`}
                        >
                            <item.icon className="w-5 h-5" />
                            {item.label}
                        </button>
                    ))}
                </nav>

                <div className="mt-auto">
                    <div className="bg-white/5 p-6 rounded-3xl border border-white/10">
                        <p className="text-xs font-bold text-white/40 uppercase tracking-widest mb-3">System Healthy</p>
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                            <span className="text-sm font-bold">Latency: 24ms</span>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 ml-80 mr-96 p-12">
                <header className="flex items-center justify-between mb-12">
                    <div>
                        <h1 className="text-3xl font-black text-[#023047] mb-2">Command Center</h1>
                        <p className="text-gray-400 font-medium tracking-tight">Managing the Velonx Ecosystem</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <Button onClick={() => router.push("/")} className="h-14 px-8 bg-white border border-gray-100 text-[#023047] font-black rounded-2xl shadow-sm hover:bg-gray-50 flex items-center gap-2">
                            View Site <Eye className="w-5 h-5" />
                        </Button>
                    </div>
                </header>

                <Tabs defaultValue="management" className="w-full">
                    <div className="flex justify-between items-center mb-8">
                        <TabsList className="bg-white p-1 rounded-2xl border border-gray-100 shadow-sm">
                            <TabsTrigger value="management" className="px-8 py-3 rounded-xl data-[state=active]:bg-[#023047] data-[state=active]:text-white font-black text-sm">Review Center</TabsTrigger>
                            <TabsTrigger value="blog" className="px-8 py-3 rounded-xl data-[state=active]:bg-[#023047] data-[state=active]:text-white font-black text-sm">Post Blog</TabsTrigger>
                        </TabsList>
                        <div className="relative group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#219EBC] transition-colors" />
                            <input
                                type="text"
                                placeholder="Search requests..."
                                className="h-12 bg-white border border-gray-100 rounded-xl pl-12 pr-6 w-48 shadow-sm focus:ring-2 focus:ring-[#219EBC] outline-none transition-all"
                            />
                        </div>
                    </div>

                    <TabsContent value="management" className="space-y-12">
                        {/* Member Requests */}
                        <section>
                            <h3 className="text-xl font-black text-[#023047] mb-6 flex items-center gap-2">
                                <Users className="w-5 h-5 text-[#219EBC]" /> Pending Approvals
                            </h3>
                            <div className="bg-white rounded-[40px] border border-gray-50 shadow-xl shadow-black/[0.02] overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead>
                                            <tr className="bg-gray-50/50 border-b border-gray-50">
                                                <th className="px-8 py-5 text-xs font-black text-gray-400 uppercase tracking-widest">Member</th>
                                                <th className="px-8 py-5 text-xs font-black text-gray-400 uppercase tracking-widest text-center">Status</th>
                                                <th className="px-8 py-5 text-xs font-black text-gray-400 uppercase tracking-widest text-right">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-50">
                                            {requests.map((r) => (
                                                <tr key={r.id} className="hover:bg-gray-50/50 transition-colors">
                                                    <td className="px-8 py-6">
                                                        <div className="flex items-center gap-4">
                                                            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center font-black text-[#219EBC]">{r.name[0]}</div>
                                                            <div>
                                                                <p className="font-bold text-[#023047]">{r.name}</p>
                                                                <p className="text-xs text-gray-400">{r.email}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-8 py-6 text-center">
                                                        <Badge className={`${r.status === 'approved' ? 'bg-green-50 text-green-600' : 'bg-orange-50 text-orange-600'} border-0 font-bold px-3 py-1 text-[10px]`}>
                                                            {r.status.toUpperCase()}
                                                        </Badge>
                                                    </td>
                                                    <td className="px-8 py-6 text-right">
                                                        <div className="flex items-center justify-end gap-2">
                                                            <button onClick={() => handleRequestAction(r.id, r.name, 'approve')} className="w-10 h-10 rounded-xl bg-green-50 hover:bg-green-100 text-green-600 flex items-center justify-center transition-all"><CheckCircle2 className="w-5 h-5" /></button>
                                                            <button onClick={() => handleRequestAction(r.id, r.name, 'reject')} className="w-10 h-10 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 flex items-center justify-center transition-all"><XCircle className="w-5 h-5" /></button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </section>

                        {/* Project Ideas */}
                        <section>
                            <h3 className="text-xl font-black text-[#023047] mb-6 flex items-center gap-2">
                                <Lightbulb className="w-5 h-5 text-orange-500" /> Community Submissions
                            </h3>
                            <div className="grid grid-cols-2 gap-6">
                                {ideas.map((idea) => (
                                    <Card key={idea.id} className="bg-white border-0 rounded-[32px] p-8 shadow-sm hover:shadow-md transition-all border border-gray-50">
                                        <div className="flex justify-between items-start mb-6">
                                            <Badge className="bg-[#219EBC]/10 text-[#219EBC] border-0">NEW IDEA</Badge>
                                            <span className="text-xs font-bold text-gray-400">{idea.date}</span>
                                        </div>
                                        <h4 className="text-xl font-black text-[#023047] mb-2">{idea.title}</h4>
                                        <p className="text-gray-400 text-sm mb-8">Authored by <span className="text-[#023047] font-bold">{idea.author}</span></p>
                                        <div className="flex gap-3">
                                            <Button className="flex-1 bg-[#023047] text-white rounded-xl font-bold h-12" onClick={() => handleIdeaAction(idea.id, idea.title, 'approve')}>Approve</Button>
                                            <Button variant="outline" className="flex-1 rounded-xl font-bold h-12 border-gray-100 text-gray-400" onClick={() => handleIdeaAction(idea.id, idea.title, 'reject')}>Reject</Button>
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        </section>
                    </TabsContent>

                    <TabsContent value="blog">
                        <Card className="bg-white border-0 shadow-2xl shadow-black/[0.03] rounded-[48px] overflow-hidden">
                            <CardHeader className="p-12 border-b border-gray-50">
                                <h3 className="text-3xl font-black text-[#023047] mb-2">Publish New Article</h3>
                                <p className="text-gray-400">Content reaches over 5,000 community members.</p>
                            </CardHeader>
                            <CardContent className="p-12">
                                <form className="space-y-8" onSubmit={(e) => {
                                    e.preventDefault();
                                    toast.success("Blog published successfully! 🚀");
                                }}>
                                    <div className="grid grid-cols-2 gap-8">
                                        <div className="space-y-3">
                                            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Title</label>
                                            <Input placeholder="Enter title..." className="h-14 bg-gray-50 border-0 rounded-2xl" />
                                        </div>
                                        <div className="space-y-3">
                                            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Category</label>
                                            <select className="flex h-14 w-full rounded-2xl border-0 bg-gray-50 px-6 py-2 text-sm focus:ring-2 focus:ring-[#219EBC] outline-none">
                                                <option>Technology</option>
                                                <option>Development</option>
                                                <option>Community</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Cover Image URL</label>
                                        <Input placeholder="https://unsplash.com/..." className="h-14 bg-gray-50 border-0 rounded-2xl" />
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Article Content</label>
                                        <textarea className="w-full bg-gray-50 border-0 rounded-[32px] p-8 min-h-[300px] outline-none focus:ring-2 focus:ring-[#219EBC] transition-all" placeholder="Write something inspiring..."></textarea>
                                    </div>
                                    <Button type="submit" className="w-full h-16 bg-[#219EBC] hover:bg-[#1a7a94] text-white font-black rounded-[24px] text-lg shadow-xl shadow-[#219EBC]/20">
                                        Publish Live <Send className="w-5 h-5 ml-2" />
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </main>

            {/* Right Sidebar */}
            <aside className="w-96 bg-[#FDF4ED] p-10 border-l border-gray-100 fixed right-0 top-20 bottom-0 z-20 overflow-y-auto">
                <div className="flex items-center justify-between mb-12">
                    <h2 className="text-2xl font-black text-[#023047]">Performance</h2>
                    <button className="w-10 h-10 rounded-xl bg-white shadow-sm border border-gray-100 flex items-center justify-center text-gray-500">
                        <MoreHorizontal className="w-5 h-5" />
                    </button>
                </div>

                <div className="space-y-8">
                    {platformStats.map((stat, i) => (
                        <div key={i} className={`bg-white p-8 rounded-[40px] border-l-8 ${stat.color} shadow-sm border-y border-r border-gray-50`}>
                            <div className="flex justify-between items-start mb-2">
                                <h4 className="text-gray-400 text-xs font-bold uppercase tracking-widest">{stat.label}</h4>
                                <Badge className="bg-green-50 text-green-600 border-0 font-bold">{stat.change}</Badge>
                            </div>
                            <p className="text-4xl font-black text-[#023047]">{stat.value}</p>
                        </div>
                    ))}

                    <div className="bg-[#5E239D] p-10 rounded-[48px] text-white relative overflow-hidden group">
                        <div className="relative z-10">
                            <h3 className="text-2xl font-black mb-4">Quick Actions</h3>
                            <div className="space-y-3">
                                <button className="w-full flex items-center justify-between p-4 bg-white/10 hover:bg-white/20 rounded-2xl transition-all font-bold text-sm">
                                    <span>Manage Events</span>
                                    <Calendar className="w-4 h-4" />
                                </button>
                                <button className="w-full flex items-center justify-between p-4 bg-white/10 hover:bg-white/20 rounded-2xl transition-all font-bold text-sm">
                                    <span>User Database</span>
                                    <Users className="w-4 h-4" />
                                </button>
                                <button className="w-full flex items-center justify-between p-4 bg-white/10 hover:bg-white/20 rounded-2xl transition-all font-bold text-sm">
                                    <span>System Logs</span>
                                    <ShieldCheck className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="bg-[#023047] p-10 rounded-[48px] text-white relative overflow-hidden group">
                        <div className="relative z-10">
                            <h3 className="text-2xl font-black mb-4">Export Reports</h3>
                            <p className="text-white/70 text-sm mb-8 leading-relaxed">Generate complete platform analytics for the current month.</p>
                            <Button className="w-full bg-white text-[#023047] hover:bg-gray-50 font-black rounded-2xl py-6 shadow-xl" onClick={() => toast.success("Preparing export...")}>
                                Download CSV <Download className="w-5 h-5 ml-2" />
                            </Button>
                        </div>
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform duration-700" />
                    </div>
                </div>
            </aside>
        </div>
    );
}
