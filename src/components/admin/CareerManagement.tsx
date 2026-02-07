"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Video, Briefcase, GraduationCap, Plus, Edit, Trash2, CheckCircle, XCircle, Calendar, Clock, Mail, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

export default function CareerManagement() {
    const [activeTab, setActiveTab] = useState("mock-interviews");
    const [mockInterviews, setMockInterviews] = useState<any[]>([]);
    const [opportunities, setOpportunities] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [showOpportunityDialog, setShowOpportunityDialog] = useState(false);
    const [editingOpportunity, setEditingOpportunity] = useState<any | null>(null);
    const [showInterviewDialog, setShowInterviewDialog] = useState(false);
    const [selectedInterview, setSelectedInterview] = useState<any | null>(null);

    const [opportunityForm, setOpportunityForm] = useState({
        type: "INTERNSHIP",
        title: "",
        company: "",
        description: "",
        requirements: "",
        location: "",
        salary: "",
        duration: "",
        applyUrl: "",
        imageUrl: "",
        status: "ACTIVE",
    });

    const [interviewUpdateForm, setInterviewUpdateForm] = useState({
        status: "PENDING",
        scheduledDate: "",
        meetingLink: "",
        feedback: "",
    });

    useEffect(() => {
        if (activeTab === "mock-interviews") {
            fetchMockInterviews();
        } else if (activeTab === "internships") {
            fetchOpportunities("INTERNSHIP");
        } else if (activeTab === "jobs") {
            fetchOpportunities("JOB");
        }
    }, [activeTab]);

    const fetchMockInterviews = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/mock-interviews');
            const data = await response.json();
            if (data.success) {
                setMockInterviews(data.data);
            }
        } catch (error) {
            toast.error("Failed to load mock interviews");
        } finally {
            setLoading(false);
        }
    };

    const fetchOpportunities = async (type: string) => {
        setLoading(true);
        try {
            const response = await fetch(`/api/opportunities?type=${type}&status=all`);
            const data = await response.json();
            if (data.success) {
                setOpportunities(data.data);
            }
        } catch (error) {
            toast.error("Failed to load opportunities");
        } finally {
            setLoading(false);
        }
    };

    const handleCreateOpportunity = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const requirements = opportunityForm.requirements.split('\n').filter(r => r.trim());
            
            const response = await fetch('/api/opportunities', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...opportunityForm,
                    requirements,
                }),
            });

            const data = await response.json();

            if (response.ok && data.success) {
                toast.success("Opportunity created successfully!");
                setShowOpportunityDialog(false);
                resetOpportunityForm();
                fetchOpportunities(opportunityForm.type);
            } else {
                toast.error(data.error?.message || "Failed to create opportunity");
            }
        } catch (error) {
            toast.error("Failed to create opportunity");
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateOpportunity = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingOpportunity) return;

        setLoading(true);
        try {
            const requirements = opportunityForm.requirements.split('\n').filter(r => r.trim());
            
            const response = await fetch(`/api/opportunities/${editingOpportunity.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...opportunityForm,
                    requirements,
                }),
            });

            const data = await response.json();

            if (response.ok && data.success) {
                toast.success("Opportunity updated successfully!");
                setShowOpportunityDialog(false);
                setEditingOpportunity(null);
                resetOpportunityForm();
                fetchOpportunities(opportunityForm.type);
            } else {
                toast.error(data.error?.message || "Failed to update opportunity");
            }
        } catch (error) {
            toast.error("Failed to update opportunity");
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteOpportunity = async (id: string, type: string) => {
        if (!confirm("Are you sure you want to delete this opportunity?")) return;

        try {
            const response = await fetch(`/api/opportunities/${id}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                toast.success("Opportunity deleted successfully!");
                fetchOpportunities(type);
            } else {
                toast.error("Failed to delete opportunity");
            }
        } catch (error) {
            toast.error("Failed to delete opportunity");
        }
    };

    const handleUpdateInterview = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedInterview) return;

        setLoading(true);
        try {
            const response = await fetch(`/api/mock-interviews/${selectedInterview.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(interviewUpdateForm),
            });

            const data = await response.json();

            if (response.ok && data.success) {
                toast.success("Interview updated successfully!");
                setShowInterviewDialog(false);
                setSelectedInterview(null);
                fetchMockInterviews();
            } else {
                toast.error(data.error?.message || "Failed to update interview");
            }
        } catch (error) {
            toast.error("Failed to update interview");
        } finally {
            setLoading(false);
        }
    };

    const openEditOpportunity = (opportunity: any) => {
        setEditingOpportunity(opportunity);
        setOpportunityForm({
            type: opportunity.type,
            title: opportunity.title,
            company: opportunity.company,
            description: opportunity.description,
            requirements: opportunity.requirements.join('\n'),
            location: opportunity.location,
            salary: opportunity.salary || "",
            duration: opportunity.duration || "",
            applyUrl: opportunity.applyUrl,
            imageUrl: opportunity.imageUrl || "",
            status: opportunity.status,
        });
        setShowOpportunityDialog(true);
    };

    const openInterviewDialog = (interview: any) => {
        setSelectedInterview(interview);
        setInterviewUpdateForm({
            status: interview.status,
            scheduledDate: interview.scheduledDate ? new Date(interview.scheduledDate).toISOString().slice(0, 16) : "",
            meetingLink: interview.meetingLink || "",
            feedback: interview.feedback || "",
        });
        setShowInterviewDialog(true);
    };

    const resetOpportunityForm = () => {
        setOpportunityForm({
            type: "INTERNSHIP",
            title: "",
            company: "",
            description: "",
            requirements: "",
            location: "",
            salary: "",
            duration: "",
            applyUrl: "",
            imageUrl: "",
            status: "ACTIVE",
        });
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "PENDING": return "bg-yellow-50 text-yellow-600";
            case "APPROVED": return "bg-green-50 text-green-600";
            case "REJECTED": return "bg-red-50 text-red-600";
            case "SCHEDULED": return "bg-blue-50 text-blue-600";
            case "COMPLETED": return "bg-gray-50 text-gray-600";
            case "ACTIVE": return "bg-green-50 text-green-600";
            case "CLOSED": return "bg-gray-50 text-gray-600";
            case "DRAFT": return "bg-yellow-50 text-yellow-600";
            default: return "bg-gray-50 text-gray-600";
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">Career Management</h2>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="bg-gray-100">
                    <TabsTrigger value="mock-interviews" className="gap-2">
                        <Video className="w-4 h-4" /> Mock Interviews
                    </TabsTrigger>
                    <TabsTrigger value="internships" className="gap-2">
                        <GraduationCap className="w-4 h-4" /> Internships
                    </TabsTrigger>
                    <TabsTrigger value="jobs" className="gap-2">
                        <Briefcase className="w-4 h-4" /> Jobs
                    </TabsTrigger>
                </TabsList>

                {/* Mock Interviews Tab */}
                <TabsContent value="mock-interviews" className="space-y-4">
                    {loading ? (
                        <div className="flex justify-center py-12">
                            <Loader2 className="w-8 h-8 animate-spin text-[#219EBC]" />
                        </div>
                    ) : mockInterviews.length > 0 ? (
                        <div className="grid gap-4">
                            {mockInterviews.map((interview) => (
                                <Card key={interview.id} className="hover:shadow-md transition-shadow">
                                    <CardContent className="p-6">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1 space-y-2">
                                                <div className="flex items-center gap-3">
                                                    <Badge className={getStatusColor(interview.status)}>
                                                        {interview.status}
                                                    </Badge>
                                                    <span className="text-sm text-gray-500">
                                                        {interview.interviewType.replace(/_/g, ' ')}
                                                    </span>
                                                    <span className="text-sm text-gray-500">
                                                        • {interview.experienceLevel}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                                    <Mail className="w-4 h-4" />
                                                    {interview.email}
                                                </div>
                                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                                    <Calendar className="w-4 h-4" />
                                                    Preferred: {new Date(interview.preferredDate).toLocaleDateString()} at {interview.preferredTime}
                                                </div>
                                                {interview.scheduledDate && (
                                                    <div className="flex items-center gap-2 text-sm text-green-600 font-medium">
                                                        <CheckCircle className="w-4 h-4" />
                                                        Scheduled: {new Date(interview.scheduledDate).toLocaleString()}
                                                    </div>
                                                )}
                                            </div>
                                            <Button
                                                onClick={() => openInterviewDialog(interview)}
                                                variant="outline"
                                                size="sm"
                                            >
                                                <Edit className="w-4 h-4 mr-2" /> Manage
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <Card>
                            <CardContent className="p-12 text-center text-gray-500">
                                No mock interview applications yet
                            </CardContent>
                        </Card>
                    )}
                </TabsContent>

                {/* Internships Tab */}
                <TabsContent value="internships" className="space-y-4">
                    <Button
                        onClick={() => {
                            setEditingOpportunity(null);
                            resetOpportunityForm();
                            setOpportunityForm({ ...opportunityForm, type: "INTERNSHIP" });
                            setShowOpportunityDialog(true);
                        }}
                        className="bg-[#219EBC] hover:bg-[#1a7a94]"
                    >
                        <Plus className="w-4 h-4 mr-2" /> Add Internship
                    </Button>

                    {loading ? (
                        <div className="flex justify-center py-12">
                            <Loader2 className="w-8 h-8 animate-spin text-[#219EBC]" />
                        </div>
                    ) : opportunities.length > 0 ? (
                        <div className="grid gap-4">
                            {opportunities.map((opp) => (
                                <Card key={opp.id} className="hover:shadow-md transition-shadow">
                                    <CardContent className="p-6">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1 space-y-2">
                                                <div className="flex items-center gap-3">
                                                    <h3 className="font-bold text-lg text-gray-900">{opp.title}</h3>
                                                    <Badge className={getStatusColor(opp.status)}>
                                                        {opp.status}
                                                    </Badge>
                                                </div>
                                                <p className="text-gray-600">{opp.company} • {opp.location}</p>
                                                {opp.duration && <p className="text-sm text-gray-500">Duration: {opp.duration}</p>}
                                                {opp.salary && <p className="text-sm text-gray-500">Salary: {opp.salary}</p>}
                                            </div>
                                            <div className="flex gap-2">
                                                <Button
                                                    onClick={() => openEditOpportunity(opp)}
                                                    variant="outline"
                                                    size="sm"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </Button>
                                                <Button
                                                    onClick={() => handleDeleteOpportunity(opp.id, opp.type)}
                                                    variant="outline"
                                                    size="sm"
                                                    className="text-red-600 hover:text-red-700"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <Card>
                            <CardContent className="p-12 text-center text-gray-500">
                                No internships posted yet
                            </CardContent>
                        </Card>
                    )}
                </TabsContent>

                {/* Jobs Tab */}
                <TabsContent value="jobs" className="space-y-4">
                    <Button
                        onClick={() => {
                            setEditingOpportunity(null);
                            resetOpportunityForm();
                            setOpportunityForm({ ...opportunityForm, type: "JOB" });
                            setShowOpportunityDialog(true);
                        }}
                        className="bg-[#219EBC] hover:bg-[#1a7a94]"
                    >
                        <Plus className="w-4 h-4 mr-2" /> Add Job
                    </Button>

                    {loading ? (
                        <div className="flex justify-center py-12">
                            <Loader2 className="w-8 h-8 animate-spin text-[#219EBC]" />
                        </div>
                    ) : opportunities.length > 0 ? (
                        <div className="grid gap-4">
                            {opportunities.map((opp) => (
                                <Card key={opp.id} className="hover:shadow-md transition-shadow">
                                    <CardContent className="p-6">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1 space-y-2">
                                                <div className="flex items-center gap-3">
                                                    <h3 className="font-bold text-lg text-gray-900">{opp.title}</h3>
                                                    <Badge className={getStatusColor(opp.status)}>
                                                        {opp.status}
                                                    </Badge>
                                                </div>
                                                <p className="text-gray-600">{opp.company} • {opp.location}</p>
                                                {opp.salary && <p className="text-sm text-gray-500">Salary: {opp.salary}</p>}
                                            </div>
                                            <div className="flex gap-2">
                                                <Button
                                                    onClick={() => openEditOpportunity(opp)}
                                                    variant="outline"
                                                    size="sm"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </Button>
                                                <Button
                                                    onClick={() => handleDeleteOpportunity(opp.id, opp.type)}
                                                    variant="outline"
                                                    size="sm"
                                                    className="text-red-600 hover:text-red-700"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <Card>
                            <CardContent className="p-12 text-center text-gray-500">
                                No jobs posted yet
                            </CardContent>
                        </Card>
                    )}
                </TabsContent>
            </Tabs>

            {/* Opportunity Dialog */}
            <Dialog open={showOpportunityDialog} onOpenChange={setShowOpportunityDialog}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>
                            {editingOpportunity ? "Edit" : "Create"} {opportunityForm.type === "INTERNSHIP" ? "Internship" : "Job"}
                        </DialogTitle>
                    </DialogHeader>
                    <form onSubmit={editingOpportunity ? handleUpdateOpportunity : handleCreateOpportunity} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Title *</Label>
                                <Input
                                    value={opportunityForm.title}
                                    onChange={(e) => setOpportunityForm({ ...opportunityForm, title: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Company *</Label>
                                <Input
                                    value={opportunityForm.company}
                                    onChange={(e) => setOpportunityForm({ ...opportunityForm, company: e.target.value })}
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Description *</Label>
                            <Textarea
                                value={opportunityForm.description}
                                onChange={(e) => setOpportunityForm({ ...opportunityForm, description: e.target.value })}
                                rows={4}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Requirements (one per line) *</Label>
                            <Textarea
                                value={opportunityForm.requirements}
                                onChange={(e) => setOpportunityForm({ ...opportunityForm, requirements: e.target.value })}
                                rows={4}
                                placeholder="Bachelor's degree in CS&#10;2+ years experience&#10;Knowledge of React"
                                required
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Location *</Label>
                                <Input
                                    value={opportunityForm.location}
                                    onChange={(e) => setOpportunityForm({ ...opportunityForm, location: e.target.value })}
                                    placeholder="Remote / City, Country"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Salary</Label>
                                <Input
                                    value={opportunityForm.salary}
                                    onChange={(e) => setOpportunityForm({ ...opportunityForm, salary: e.target.value })}
                                    placeholder="$50k - $70k"
                                />
                            </div>
                        </div>

                        {opportunityForm.type === "INTERNSHIP" && (
                            <div className="space-y-2">
                                <Label>Duration</Label>
                                <Input
                                    value={opportunityForm.duration}
                                    onChange={(e) => setOpportunityForm({ ...opportunityForm, duration: e.target.value })}
                                    placeholder="3 months"
                                />
                            </div>
                        )}

                        <div className="space-y-2">
                            <Label>Application URL *</Label>
                            <Input
                                type="url"
                                value={opportunityForm.applyUrl}
                                onChange={(e) => setOpportunityForm({ ...opportunityForm, applyUrl: e.target.value })}
                                placeholder="https://company.com/apply"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Company Logo URL</Label>
                            <Input
                                type="url"
                                value={opportunityForm.imageUrl}
                                onChange={(e) => setOpportunityForm({ ...opportunityForm, imageUrl: e.target.value })}
                                placeholder="https://..."
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Status *</Label>
                            <select
                                value={opportunityForm.status}
                                onChange={(e) => setOpportunityForm({ ...opportunityForm, status: e.target.value })}
                                className="w-full flex h-10 rounded-md border border-gray-200 bg-white px-3 py-2 text-sm"
                            >
                                <option value="ACTIVE">Active</option>
                                <option value="CLOSED">Closed</option>
                                <option value="DRAFT">Draft</option>
                            </select>
                        </div>

                        <div className="flex gap-2 justify-end">
                            <Button type="button" variant="outline" onClick={() => setShowOpportunityDialog(false)}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={loading} className="bg-[#219EBC] hover:bg-[#1a7a94]">
                                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : editingOpportunity ? "Update" : "Create"}
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Interview Update Dialog */}
            <Dialog open={showInterviewDialog} onOpenChange={setShowInterviewDialog}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Manage Mock Interview</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleUpdateInterview} className="space-y-4">
                        <div className="space-y-2">
                            <Label>Status *</Label>
                            <select
                                value={interviewUpdateForm.status}
                                onChange={(e) => setInterviewUpdateForm({ ...interviewUpdateForm, status: e.target.value })}
                                className="w-full flex h-10 rounded-md border border-gray-200 bg-white px-3 py-2 text-sm"
                            >
                                <option value="PENDING">Pending</option>
                                <option value="APPROVED">Approved</option>
                                <option value="REJECTED">Rejected</option>
                                <option value="SCHEDULED">Scheduled</option>
                                <option value="COMPLETED">Completed</option>
                            </select>
                        </div>

                        <div className="space-y-2">
                            <Label>Scheduled Date & Time</Label>
                            <Input
                                type="datetime-local"
                                value={interviewUpdateForm.scheduledDate}
                                onChange={(e) => setInterviewUpdateForm({ ...interviewUpdateForm, scheduledDate: e.target.value })}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Meeting Link</Label>
                            <Input
                                type="url"
                                value={interviewUpdateForm.meetingLink}
                                onChange={(e) => setInterviewUpdateForm({ ...interviewUpdateForm, meetingLink: e.target.value })}
                                placeholder="https://meet.google.com/..."
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Feedback</Label>
                            <Textarea
                                value={interviewUpdateForm.feedback}
                                onChange={(e) => setInterviewUpdateForm({ ...interviewUpdateForm, feedback: e.target.value })}
                                rows={4}
                                placeholder="Interview feedback..."
                            />
                        </div>

                        <div className="flex gap-2 justify-end">
                            <Button type="button" variant="outline" onClick={() => setShowInterviewDialog(false)}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={loading} className="bg-[#219EBC] hover:bg-[#1a7a94]">
                                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Update"}
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
