"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Layout, PenTool, Calendar, Eye, Settings, ShieldCheck, Users, Activity, Flag, ShoppingBag, Mail } from 'lucide-react';
import toast from "react-hot-toast";
import { useUserRequests, usePlatformStats } from "@/lib/api/hooks";
import { adminApi } from "@/lib/api/client";
import Image from "next/image";

// Dynamic imports for large components to enable code splitting
const ProjectSubmissions = dynamic(() => import("@/components/admin/ProjectSubmissions"), {
    loading: () => <div className="flex items-center justify-center p-8"><div className="w-8 h-8 border-4 border-[#226CE0] border-t-transparent rounded-full animate-spin" /></div>
});
const CareerManagement = dynamic(() => import("@/components/admin/CareerManagement"), {
    loading: () => <div className="flex items-center justify-center p-8"><div className="w-8 h-8 border-4 border-[#226CE0] border-t-transparent rounded-full animate-spin" /></div>
});
const PerformanceMetrics = dynamic(() => import("@/components/admin/PerformanceMetrics"), {
    loading: () => <div className="flex items-center justify-center p-8"><div className="w-8 h-8 border-4 border-[#226CE0] border-t-transparent rounded-full animate-spin" /></div>
});
const UserManagement = dynamic(() => import("@/components/admin/UserManagement"), {
    loading: () => <div className="flex items-center justify-center p-8"><div className="w-8 h-8 border-4 border-[#226CE0] border-t-transparent rounded-full animate-spin" /></div>
});
const BlogManagement = dynamic(() => import("@/components/admin/ContentManagement").then(mod => ({ default: mod.BlogManagement })), {
    loading: () => <div className="flex items-center justify-center p-8"><div className="w-8 h-8 border-4 border-[#226CE0] border-t-transparent rounded-full animate-spin" /></div>
});
const ResourceManagement = dynamic(() => import("@/components/admin/ContentManagement").then(mod => ({ default: mod.ResourceManagement })), {
    loading: () => <div className="flex items-center justify-center p-8"><div className="w-8 h-8 border-4 border-[#226CE0] border-t-transparent rounded-full animate-spin" /></div>
});
const MentorApplications = dynamic(() => import("@/components/admin/MentorManagement").then(mod => ({ default: mod.MentorApplications })), {
    loading: () => <div className="flex items-center justify-center p-8"><div className="w-8 h-8 border-4 border-[#226CE0] border-t-transparent rounded-full animate-spin" /></div>
});
const MentorCRUD = dynamic(() => import("@/components/admin/MentorManagement").then(mod => ({ default: mod.MentorCRUD })), {
    loading: () => <div className="flex items-center justify-center p-8"><div className="w-8 h-8 border-4 border-[#226CE0] border-t-transparent rounded-full animate-spin" /></div>
});
const EventManagement = dynamic(() => import("@/components/admin/EventManagement"), {
    loading: () => <div className="flex items-center justify-center p-8"><div className="w-8 h-8 border-4 border-[#226CE0] border-t-transparent rounded-full animate-spin" /></div>
});
const AdminBookingApprovalPanel = dynamic(() => import("@/components/admin/AdminBookingApprovalPanel"), {
    loading: () => <div className="flex items-center justify-center p-8"><div className="w-8 h-8 border-4 border-[#226CE0] border-t-transparent rounded-full animate-spin" /></div>
});
const ReportsAdmin = dynamic(() => import("@/components/admin/ReportsAdmin").then(mod => ({ default: mod.ReportsAdmin })), {
    loading: () => <div className="flex items-center justify-center p-8"><div className="w-8 h-8 border-4 border-[#226CE0] border-t-transparent rounded-full animate-spin" /></div>
});
const SwagItemManager = dynamic(() => import("@/components/swag/admin/SwagItemManager"), {
    loading: () => <div className="flex items-center justify-center p-8"><div className="w-8 h-8 border-4 border-[#226CE0] border-t-transparent rounded-full animate-spin" /></div>
});
const SwagOrderTable = dynamic(() => import("@/components/swag/admin/SwagOrderTable"), {
    loading: () => <div className="flex items-center justify-center p-8"><div className="w-8 h-8 border-4 border-[#226CE0] border-t-transparent rounded-full animate-spin" /></div>
});
const VerificationManagement = dynamic(() => import("@/components/admin/VerificationManagement"), {
    loading: () => <div className="flex items-center justify-center p-8"><div className="w-8 h-8 border-4 border-[#226CE0] border-t-transparent rounded-full animate-spin" /></div>
});


export default function AdminDashboard() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [activeTab, setActiveTab] = useState("management");

    // Mentor management state
    const [mentorApplications, setMentorApplications] = useState<any[]>([]);
    const [loadingApplications, setLoadingApplications] = useState(false);

    // Fetch real data from API
    const { data: userRequests, loading: requestsLoading, refetch: refetchRequests } = useUserRequests({
        status: 'PENDING',
        pageSize: 10
    });
    const { data: platformStats, loading: statsLoading } = usePlatformStats();

    // Fetch mentor applications when mentor tab is active
    useEffect(() => {
        if (activeTab === "mentors") {
            fetchMentorApplications();
        }
    }, [activeTab]);

    const fetchMentorApplications = async () => {
        setLoadingApplications(true);
        try {
            const response = await fetch('/api/admin/requests?type=MENTOR_APPLICATION&status=PENDING&pageSize=50');
            const data = await response.json();
            if (data.success) {
                setMentorApplications(data.data);
            }
        } catch (error) {
            toast.error("Failed to load mentor applications");
        } finally {
            setLoadingApplications(false);
        }
    };

    const handleApproveMentorApplication = async (requestId: string, userId: string, userName: string) => {
        try {
            await adminApi.approveRequest(requestId);
            toast.success(`Mentor application for "${userName}" approved!`);
            fetchMentorApplications();
        } catch (error) {
            toast.error("Failed to approve application");
        }
    };

    const handleRejectMentorApplication = async (requestId: string, userName: string) => {
        try {
            await adminApi.rejectRequest(requestId, 'Application rejected by admin');
            toast.success(`Mentor application for "${userName}" rejected.`);
            fetchMentorApplications();
        } catch (error) {
            toast.error("Failed to reject application");
        }
    };

    const [sendingEmails, setSendingEmails] = useState<Record<string, boolean>>({});

    const handleResendVerification = async (email: string) => {
        setSendingEmails((prev) => ({ ...prev, [email]: true }));
        try {
            const response = await fetch('/api/admin/verifications/resend', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email }),
            });
            const data = await response.json();
            if (data.success) {
                toast.success(`Verification email sent to ${email}`);
            } else {
                toast.error(data.error || "Failed to send email");
            }
        } catch (error) {
            toast.error("An error occurred. Please try again.");
        } finally {
            setSendingEmails((prev) => ({ ...prev, [email]: false }));
        }
    };

    useEffect(() => {
        if (status === "loading") return;

        if (status === "unauthenticated") {
            router.push("/auth/login");
        } else if (status === "authenticated" && session?.user?.role !== "ADMIN") {
            router.push("/dashboard/student");
        }
    }, [status, session, router]);

    if (status === "loading") {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#226CE0] mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Loading...</p>
                </div>
            </div>
        );
    }

    if (status === "unauthenticated" || session?.user?.role !== "ADMIN") {
        return null;
    }

    const navItems = [
        { icon: Layout, label: "Management", value: "management" },
        { icon: Users, label: "Mentors", value: "mentors" },
        { icon: Calendar, label: "Events", value: "events" },
        { icon: ShoppingBag, label: "Swag Store", value: "swag" },
        { icon: Flag, label: "Reports", value: "reports" },
        { icon: PenTool, label: "Blog Authoring", value: "blog" },
        { icon: ShieldCheck, label: "Verifications", value: "verifications" },
        { icon: Activity, label: "Performance", value: "performance" },
        { icon: Settings, label: "Platform Info", value: "platform" },
    ];

    return (
        <div className="flex min-h-screen bg-background pt-20">
            {/* Left Sidebar */}
            <aside className="w-80 bg-[#1A234A] flex flex-col p-8 fixed left-0 top-20 bottom-0 z-20 text-white">
                <div className="flex items-center gap-3 mb-12">
                    <div className="w-10 h-10 bg-background/10 rounded-xl flex items-center justify-center text-white font-bold border border-white/20">A</div>
                    <span className="text-xl font-black tracking-tight">Admin Console</span>
                </div>

                <div className="mb-12">
                    <div className="relative inline-block mb-4">
                        <div className="w-20 h-20 rounded-full border-2 border-[#226CE0] p-1">
                            <Image src={session.user?.image || "/avatars/admin.png"} alt="Admin" width={80} height={80} className="w-full h-full rounded-full object-cover" />
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-[#226CE0] rounded-full flex items-center justify-center shadow-md">
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
                            onClick={() => setActiveTab(item.value)}
                            className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all font-bold ${activeTab === item.value
                                ? "bg-card/10 text-[#226CE0]"
                                : "text-white/50 hover:bg-card/5 hover:text-white"
                                }`}
                        >
                            <item.icon className="w-5 h-5" />
                            {item.label}
                        </button>
                    ))}
                </nav>

                <div className="mt-auto">
                    <div className="bg-background/5 p-6 rounded-3xl border border-white/10">
                        <p className="text-xs font-bold text-white/40 uppercase tracking-widest mb-3">System Healthy</p>
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                            <span className="text-sm font-bold">Latency: 24ms</span>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 ml-80 p-12">
                <header className="flex items-center justify-between mb-12">
                    <div>
                        <h1 className="text-3xl font-bold text-foreground mb-2">Command Center</h1>
                        <p className="text-muted-foreground font-medium tracking-tight">Managing the Velonx Ecosystem</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <Button onClick={() => router.push("/")} className="h-14 px-8 bg-background border border-border text-foreground font-bold rounded-2xl shadow-sm hover:bg-muted flex items-center gap-2">
                            View Site <Eye className="w-5 h-5" />
                        </Button>
                    </div>
                </header>

                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <div className="flex justify-between items-center mb-8">
                        <TabsList className="bg-background p-1 rounded-2xl border border-border shadow-sm">
                            <TabsTrigger value="management" className="px-8 py-3 rounded-xl data-[state=active]:bg-[#1A234A] data-[state=active]:text-white font-bold text-sm">Review Center</TabsTrigger>
                            <TabsTrigger value="reports" className="px-8 py-3 rounded-xl data-[state=active]:bg-red-500 data-[state=active]:text-white font-bold text-sm flex items-center gap-2">
                                <Flag className="w-4 h-4" />Reports
                            </TabsTrigger>
                            <TabsTrigger value="blog" className="px-8 py-3 rounded-xl data-[state=active]:bg-[#1A234A] data-[state=active]:text-white font-bold text-sm">Post Blog</TabsTrigger>
                            <TabsTrigger value="career" className="px-8 py-3 rounded-xl data-[state=active]:bg-[#1A234A] data-[state=active]:text-white font-bold text-sm">Career</TabsTrigger>
                            <TabsTrigger value="resources" className="px-8 py-3 rounded-xl data-[state=active]:bg-[#1A234A] data-[state=active]:text-white font-bold text-sm">Resources</TabsTrigger>
                            <TabsTrigger value="verifications" className="px-8 py-3 rounded-xl data-[state=active]:bg-[#1A234A] data-[state=active]:text-white font-bold text-sm">Verifications</TabsTrigger>
                        </TabsList>
                    </div>

                    <TabsContent value="management" className="space-y-12">
                        {/* Booking Approvals */}
                        <AdminBookingApprovalPanel />

                        {/* User Management */}
                        <UserManagement
                            userRequests={userRequests || []}
                            onRefetch={refetchRequests}
                        />



                        {/* Project Submissions */}
                        <ProjectSubmissions />
                    </TabsContent>

                    <TabsContent value="mentors" className="space-y-12">
                        {/* Mentor CRUD Management */}
                        <MentorCRUD />

                        {/* Mentor Applications */}
                        <MentorApplications
                            applications={mentorApplications}
                            loading={loadingApplications}
                            onApprove={handleApproveMentorApplication}
                            onReject={handleRejectMentorApplication}
                        />
                    </TabsContent>

                    <TabsContent value="events" className="space-y-12">
                        <EventManagement />
                    </TabsContent>

                    <TabsContent value="swag" className="space-y-10">
                        <div>
                            <h2 className="text-2xl font-bold text-foreground mb-1">Swag Store</h2>
                            <p className="text-muted-foreground text-sm mb-8">Manage merchandise catalog and fulfill student orders</p>
                            <div className="space-y-10">
                                <SwagItemManager />
                                <div className="border-t border-border pt-10">
                                    <h3 className="text-xl font-bold text-foreground mb-6">Order Management</h3>
                                    <SwagOrderTable />
                                </div>
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="reports" className="space-y-8">
                        <ReportsAdmin />
                    </TabsContent>

                    <TabsContent value="blog">
                        <BlogManagement />
                    </TabsContent>

                    <TabsContent value="career">
                        <CareerManagement />
                    </TabsContent>

                    <TabsContent value="resources">
                        <ResourceManagement />
                    </TabsContent>

                    <TabsContent value="verifications">
                        <VerificationManagement />
                    </TabsContent>

                    <TabsContent value="performance">
                        <PerformanceMetrics />
                    </TabsContent>

                    <TabsContent value="platform">
                        <Card className="bg-background border-0 shadow-2xl shadow-black/3 rounded-[48px] overflow-hidden">
                            <CardHeader className="p-12 border-b border-gray-50">
                                <h3 className="text-3xl font-bold text-foreground mb-2">Platform Information</h3>
                                <p className="text-muted-foreground">System status and configuration</p>
                            </CardHeader>
                            <CardContent className="p-12">
                                <div className="space-y-6">
                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="bg-muted p-6 rounded-2xl">
                                            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2">Total Users</p>
                                            <p className="text-3xl font-bold text-foreground">{platformStats?.totalUsers ?? 0}</p>
                                        </div>
                                        <div className="bg-muted p-6 rounded-2xl">
                                            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2">Total Events</p>
                                            <p className="text-3xl font-bold text-foreground">{platformStats?.totalEvents ?? 0}</p>
                                        </div>
                                        <div className="bg-muted p-6 rounded-2xl">
                                            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2">Total Projects</p>
                                            <p className="text-3xl font-bold text-foreground">{platformStats?.totalProjects ?? 0}</p>
                                        </div>
                                        <div className="bg-muted p-6 rounded-2xl">
                                            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2">Total Mentors</p>
                                            <p className="text-3xl font-bold text-foreground">{platformStats?.totalMentors ?? 0}</p>
                                        </div>
                                        <div className="bg-muted p-6 rounded-2xl">
                                            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2">Pending Requests</p>
                                            <p className="text-3xl font-bold text-foreground">{platformStats?.pendingRequests ?? 0}</p>
                                        </div>
                                        <div className="bg-muted p-6 rounded-2xl">
                                            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2">System Status</p>
                                            <div className="flex items-center gap-2 mt-2">
                                                <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
                                                <span className="text-lg font-bold text-green-600">Healthy</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Unverified Users Breakdown */}
                                    <div className="border-t border-border pt-8 mt-8">
                                        <h4 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
                                            <ShieldCheck className="w-5 h-5 text-orange-500" /> Unverified Users Breakdown
                                        </h4>
                                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                            <div className="bg-muted/50 p-6 rounded-2xl border border-border/50">
                                                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2">Unverified (Email)</p>
                                                <p className="text-3xl font-bold text-foreground">{platformStats?.unverifiedStats?.email ?? 0}</p>
                                            </div>
                                            <div className="bg-muted/50 p-6 rounded-2xl border border-border/50">
                                                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2">Unverified (Google)</p>
                                                <p className="text-3xl font-bold text-foreground">{platformStats?.unverifiedStats?.google ?? 0}</p>
                                            </div>
                                            <div className="bg-muted/50 p-6 rounded-2xl border border-border/50">
                                                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2">Unverified (GitHub)</p>
                                                <p className="text-3xl font-bold text-foreground">{platformStats?.unverifiedStats?.github ?? 0}</p>
                                            </div>
                                            <div className="bg-orange-50/10 dark:bg-orange-950/10 p-6 rounded-2xl border border-orange-500/20">
                                                <p className="text-xs font-bold text-orange-500 uppercase tracking-widest mb-2">Total Unverified</p>
                                                <p className="text-3xl font-bold text-orange-600 dark:text-orange-400">{platformStats?.unverifiedStats?.total ?? 0}</p>
                                            </div>
                                        </div>

                                        {/* Unverified Credentials Users List */}
                                        {platformStats?.unverifiedStats?.users && platformStats.unverifiedStats.users.length > 0 && (
                                            <div className="mt-8 border border-border rounded-3xl overflow-hidden bg-background">
                                                <div className="px-6 py-4 bg-muted/20 border-b border-border">
                                                    <h5 className="font-bold text-[#1A234A] dark:text-white flex items-center gap-2">
                                                        <Mail className="w-4 h-4 text-[#226CE0]" /> Unverified Credentials Users List
                                                    </h5>
                                                    <p className="text-xs text-muted-foreground mt-0.5">Contact or resend verification link to users registered via email</p>
                                                </div>
                                                <div className="divide-y divide-border max-h-96 overflow-y-auto">
                                                    {platformStats.unverifiedStats.users.map((user) => (
                                                        <div key={user.id} className="p-5 flex items-center justify-between hover:bg-muted/10 transition-colors">
                                                            <div className="flex flex-col gap-1">
                                                                <p className="font-bold text-[#1A234A] dark:text-white">{user.name || "Anonymous"}</p>
                                                                <p className="text-sm text-muted-foreground font-medium">{user.email}</p>
                                                                <p className="text-[10px] text-gray-400">Registered on: {new Date(user.createdAt).toLocaleDateString()}</p>
                                                            </div>
                                                            <Button
                                                                onClick={() => handleResendVerification(user.email)}
                                                                disabled={sendingEmails[user.email]}
                                                                className="h-10 px-4 bg-[#226CE0] hover:bg-[#334DAF] text-white font-bold rounded-xl transition-all shadow-sm flex items-center gap-1.5"
                                                            >
                                                                <Mail className="w-4 h-4" />
                                                                {sendingEmails[user.email] ? "Sending..." : "Resend Email"}
                                                            </Button>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </main>
        </div>
    );
}
