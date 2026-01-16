"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    LayoutDashboard,
    BarChart3,
    CheckSquare,
    Timer,
    Settings,
    Plus,
    Search,
    Bell,
    MoreHorizontal,
    CheckCircle2,
    Clock,
    CreditCard,
    Zap
} from "lucide-react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";

export default function StudentDashboard() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [activeTab, setActiveTab] = useState("Dashboard");

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/auth/login");
        }
    }, [status, router]);

    if (status === "loading") {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white">
                <div className="w-16 h-16 rounded-full border-4 border-[#219EBC] border-t-transparent animate-spin" />
            </div>
        );
    }

    if (!session) return null;

    const navItems = [
        { icon: LayoutDashboard, label: "Dashboard" },
        { icon: BarChart3, label: "Analytics" },
        { icon: CheckSquare, label: "Task List" },
        { icon: Timer, label: "Tracking" },
        { icon: Settings, label: "Setting" },
    ];

    const projects = [
        {
            title: "Web Development",
            tasks: 10,
            progress: 96,
            color: "bg-[#5E239D]",
            textColor: "text-white",
            users: ["/avatars/1.png", "/avatars/2.png", "/avatars/3.png"]
        },
        {
            title: "Mobile App Design",
            tasks: 12,
            progress: 46,
            color: "bg-[#7FD8D8]",
            textColor: "text-[#00443D]",
            users: ["/avatars/4.png", "/avatars/5.png"]
        },
        {
            title: "Facebook Brand UI Kit",
            tasks: 22,
            progress: 73,
            color: "bg-[#FF7F5C]",
            textColor: "text-white",
            users: ["/avatars/6.png", "/avatars/7.png", "/avatars/8.png"]
        },
    ];

    const tasks = [
        { title: "Mobile App", sub: "Prepare Figma file", completed: false, color: "bg-orange-400" },
        { title: "UX wireframes", sub: "Design UX wireframes", completed: false, color: "bg-purple-500" },
        { title: "Mobile App", sub: "Research", completed: true, color: "bg-teal-400" },
    ];

    const timeline = [
        {
            date: "Oct 20, 2021", items: [
                { time: "10:00", title: "Dribbble shot", sub: "Facebook Brand", color: "border-teal-400" },
                { time: "13:20", title: "Design", sub: "Task Managment", color: "border-orange-400" },
            ]
        },
        {
            date: "Oct 21, 2021", items: [
                { time: "10:00", title: "UX Research", sub: "Sleep App", color: "border-purple-500" },
                { time: "13:20", title: "Design", sub: "Task Managment", color: "border-orange-400" },
                { time: "10:00", title: "Dribbble shot", sub: "Meet Up", color: "border-teal-400" },
            ]
        },
        {
            date: "Oct 22, 2021", items: [
                { time: "10:00", title: "Dribbble shot", sub: "Meet Up", color: "border-teal-400" },
                { time: "11:00", title: "Design", sub: "Mobile App", color: "border-orange-400" },
            ]
        },
    ];

    return (
        <div className="flex min-h-screen bg-[#FDFCFB] pt-20">
            {/* Left Sidebar */}
            <aside className="w-80 bg-white border-r border-gray-100 flex flex-col p-8 fixed left-0 top-20 bottom-0 z-20">
                <div className="flex items-center gap-3 mb-12">
                    <div className="w-10 h-10 bg-gradient-to-br from-[#219EBC] to-[#023047] rounded-xl flex items-center justify-center text-white font-bold">V</div>
                    <span className="text-xl font-black text-[#023047]">Velonx</span>
                </div>

                <div className="mb-12">
                    <div className="relative inline-block mb-4">
                        <div className="w-20 h-20 rounded-full border-2 border-[#219EBC] p-1">
                            <img src={session.user?.image || "/avatars/default.png"} alt="User" className="w-full h-full rounded-full object-cover" />
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-md">
                            <Clock className="w-3 h-3 text-[#219EBC]" />
                        </div>
                    </div>
                    <h2 className="text-xl font-black text-[#023047] mb-1">{session.user?.name}</h2>
                    <p className="text-gray-400 text-sm font-medium">{session.user?.email}</p>
                </div>

                <nav className="flex-1 space-y-2">
                    {navItems.map((item) => (
                        <button
                            key={item.label}
                            onClick={() => setActiveTab(item.label)}
                            className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all font-bold ${activeTab === item.label
                                ? "bg-[#219EBC]/10 text-[#219EBC]"
                                : "text-gray-400 hover:bg-gray-50 hover:text-gray-600"
                                }`}
                        >
                            <item.icon className="w-5 h-5" />
                            {item.label}
                        </button>
                    ))}
                </nav>

                <div className="mt-auto relative">
                    <img src="/dashboard-pattern.png" className="absolute bottom-0 left-0 w-full opacity-10" />
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 ml-80 mr-96 p-12">
                {/* Header */}
                <header className="flex items-center justify-between mb-12">
                    <div>
                        <h1 className="text-3xl font-black text-[#023047] mb-2">Hello, {session.user?.name?.split(" ")[0]}</h1>
                        <p className="text-gray-400 font-medium tracking-tight">Today is {new Date().toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="relative group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#219EBC] transition-colors" />
                            <input
                                type="text"
                                placeholder="Search here..."
                                className="h-14 bg-white border border-gray-100 rounded-2xl pl-12 pr-6 w-64 shadow-sm focus:ring-2 focus:ring-[#219EBC] outline-none transition-all"
                            />
                        </div>
                        <Button className="h-14 px-8 bg-[#023047] hover:bg-black text-white font-black rounded-2xl shadow-xl shadow-[#023047]/20 flex items-center gap-2">
                            Add New Project <Plus className="w-5 h-5" />
                        </Button>
                    </div>
                </header>

                {/* Project Cards */}
                <div className="grid grid-cols-3 gap-6 mb-12">
                    {projects.map((project, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                        >
                            <Card className={`${project.color} ${project.textColor} border-0 rounded-[40px] p-8 h-full shadow-2xl shadow-black/5 hover:scale-[1.02] transition-transform`}>
                                <div className="flex justify-between items-start mb-6">
                                    <div className="flex -space-x-3">
                                        {[1, 2, 3].map((_, idx) => (
                                            <div key={idx} className="w-10 h-10 rounded-full border-2 border-white/20 bg-white/10 flex items-center justify-center text-[10px] font-bold">
                                                +{idx + 7}
                                            </div>
                                        ))}
                                    </div>
                                    <button className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                                        <MoreHorizontal className="w-5 h-5" />
                                    </button>
                                </div>
                                <h3 className="text-2xl font-black mb-6 leading-tight max-w-[150px]">{project.title}</h3>
                                <div className="space-y-4">
                                    <div className="flex justify-between text-sm font-bold opacity-80">
                                        <span>{project.tasks} tasks</span>
                                        <span>{project.progress}%</span>
                                    </div>
                                    <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                                        <div className="h-full bg-white rounded-full" style={{ width: `${project.progress}%` }} />
                                    </div>
                                </div>
                            </Card>
                        </motion.div>
                    ))}
                </div>

                <div className="grid grid-cols-12 gap-10">
                    {/* Tasks Section */}
                    <div className="col-span-7">
                        <h3 className="text-2xl font-black text-[#023047] mb-8">Tasks for today</h3>
                        <div className="space-y-4">
                            {tasks.map((task, i) => (
                                <div key={i} className="flex items-center gap-6 bg-white p-6 rounded-[32px] shadow-sm border border-gray-50 hover:shadow-md transition-all group">
                                    <div className={`w-1.5 h-12 rounded-full ${task.color}`} />
                                    <div className="flex-1">
                                        <h4 className="font-black text-[#023047]">{task.title}</h4>
                                        <p className="text-gray-400 text-sm font-medium">{task.sub}</p>
                                    </div>
                                    <button className={`w-8 h-8 rounded-full border-2 transition-all flex items-center justify-center ${task.completed ? "bg-[#219EBC] border-[#219EBC] text-white" : "border-gray-200 group-hover:border-[#219EBC]"
                                        }`}>
                                        {task.completed && <CheckCircle2 className="w-5 h-5" />}
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Stats Section */}
                    <div className="col-span-5">
                        <h3 className="text-2xl font-black text-[#023047] mb-8">Statistics</h3>
                        <div className="grid grid-cols-2 gap-4 mb-6">
                            <div className="bg-white p-6 rounded-[32px] border border-gray-50 shadow-sm text-center">
                                <p className="text-2xl font-black text-[#023047] mb-1">28 h</p>
                                <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">Tracked time</p>
                            </div>
                            <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm text-center">
                                <p className="text-2xl font-black text-[#023047] mb-1">18</p>
                                <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">Finished tasks</p>
                            </div>
                            <div className="col-span-2 bg-gray-50 border-2 border-dashed border-gray-200 p-6 rounded-[32px] flex flex-col items-center justify-center text-gray-400 hover:border-[#219EBC] hover:text-[#219EBC] transition-all cursor-pointer">
                                <Plus className="w-6 h-6 mb-2" />
                                <span className="font-bold text-sm">New widget</span>
                            </div>
                        </div>

                        {/* Pro Plan Card */}
                        <div className="bg-[#023047] text-white p-8 rounded-[40px] relative overflow-hidden group">
                            <div className="relative z-10">
                                <p className="text-2xl font-black mb-2">$9.99 <span className="text-sm font-normal text-white/50">p/m</span></p>
                                <h4 className="text-xl font-bold mb-2">Pro Plan</h4>
                                <p className="text-white/60 text-sm mb-6 max-w-[150px]">More productivity with premium!</p>
                                <button className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 transition-all flex items-center justify-center">
                                    <Plus className="w-5 h-5" />
                                </button>
                            </div>
                            <div className="absolute top-0 right-0 w-48 h-full bg-gradient-to-l from-[#219EBC]/20 to-transparent flex items-center justify-center group-hover:scale-110 transition-transform duration-700">
                                <Zap className="w-24 h-24 text-white/10 rotate-12" />
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Right Sidebar - Calendar */}
            <aside className="w-96 bg-[#FDF4ED] p-10 border-l border-gray-100 fixed right-0 top-20 bottom-0 z-20 overflow-y-auto">
                <div className="flex items-center justify-between mb-12">
                    <h2 className="text-2xl font-black text-[#023047]">Calendar</h2>
                    <button className="w-10 h-10 rounded-xl bg-white shadow-sm border border-gray-100 flex items-center justify-center text-gray-500 relative">
                        <Bell className="w-5 h-5" />
                        <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
                    </button>
                </div>

                <div className="space-y-12">
                    {timeline.map((section, idx) => (
                        <div key={idx}>
                            <div className="flex items-center justify-between mb-8">
                                <h3 className="text-sm font-bold text-gray-900">{section.date}</h3>
                                <button className="text-gray-300 hover:text-gray-500"><MoreHorizontal className="w-4 h-4" /></button>
                            </div>
                            <div className="space-y-8">
                                {section.items.map((item, i) => (
                                    <div key={i} className="flex gap-6 relative">
                                        <div className="text-sm font-black text-[#023047] w-12">{item.time}</div>
                                        <div className={`flex-1 border-l-4 ${item.color} pl-6 group cursor-pointer`}>
                                            <h4 className="text-sm font-black text-[#023047] mb-1 group-hover:text-[#219EBC] transition-colors">{item.title}</h4>
                                            <p className="text-gray-400 text-xs font-bold">{item.sub}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </aside>
        </div>
    );
}
