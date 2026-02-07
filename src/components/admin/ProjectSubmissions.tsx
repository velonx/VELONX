"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Lightbulb, CheckCircle2, XCircle, Users, Code, Target } from "lucide-react";
import toast from "react-hot-toast";

interface ProjectSubmission {
  id: string;
  userId: string;
  status: string;
  reason: string;
  createdAt: string;
  user: {
    id: string;
    name: string;
    email: string;
    image?: string;
  };
}

export default function ProjectSubmissions() {
  const [submissions, setSubmissions] = useState<ProjectSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);

  const fetchSubmissions = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/requests?type=PROJECT_SUBMISSION&status=PENDING&pageSize=50');
      const data = await response.json();
      if (data.success) {
        setSubmissions(data.data);
      }
    } catch (error) {
      toast.error("Failed to load project submissions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const handleApprove = async (requestId: string, projectTitle: string) => {
    setProcessing(requestId);
    try {
      const response = await fetch('/api/admin/projects/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestId }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast.success(`Project "${projectTitle}" approved and created!`);
        fetchSubmissions();
      } else {
        toast.error(data.error?.message || 'Failed to approve project');
      }
    } catch (error) {
      toast.error('Failed to approve project');
    } finally {
      setProcessing(null);
    }
  };

  const handleReject = async (requestId: string, projectTitle: string) => {
    if (!confirm(`Are you sure you want to reject "${projectTitle}"?`)) {
      return;
    }

    setProcessing(requestId);
    try {
      const response = await fetch(`/api/admin/requests/${requestId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reject', reason: 'Project submission rejected by admin' }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast.success(`Project "${projectTitle}" rejected`);
        fetchSubmissions();
      } else {
        toast.error(data.error?.message || 'Failed to reject project');
      }
    } catch (error) {
      toast.error('Failed to reject project');
    } finally {
      setProcessing(null);
    }
  };

  if (loading) {
    return (
      <Card className="bg-white border-0 shadow-2xl shadow-black/[0.03] rounded-[48px] overflow-hidden">
        <CardHeader className="p-12 border-b border-gray-50">
          <h3 className="text-3xl font-black text-[#023047] mb-2 flex items-center gap-2">
            <Lightbulb className="w-8 h-8 text-orange-500" />
            Project Submissions
          </h3>
          <p className="text-gray-400">Review and approve student project ideas</p>
        </CardHeader>
        <CardContent className="p-12">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#219EBC] mx-auto mb-4"></div>
            <p className="text-gray-600">Loading submissions...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white border-0 shadow-2xl shadow-black/[0.03] rounded-[48px] overflow-hidden">
      <CardHeader className="p-12 border-b border-gray-50">
        <h3 className="text-3xl font-black text-[#023047] mb-2 flex items-center gap-2">
          <Lightbulb className="w-8 h-8 text-orange-500" />
          Project Submissions
        </h3>
        <p className="text-gray-400">Review and approve student project ideas</p>
      </CardHeader>
      <CardContent className="p-12">
        {submissions.length === 0 ? (
          <div className="text-center py-12">
            <Lightbulb className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-400 text-lg font-bold">No pending submissions</p>
            <p className="text-gray-400 text-sm mt-2">Project submissions will appear here</p>
          </div>
        ) : (
          <div className="space-y-6">
            {submissions.map((submission) => {
              const projectData = JSON.parse(submission.reason || '{}');
              
              return (
                <div 
                  key={submission.id} 
                  className="bg-gradient-to-br from-gray-50 to-white rounded-3xl p-8 border border-gray-100 hover:shadow-lg transition-all"
                >
                  <div className="flex items-start gap-6">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-400 to-pink-500 flex items-center justify-center text-white font-black text-2xl shadow-lg flex-shrink-0">
                      {submission.user?.name?.[0] || 'P'}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      {/* Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h4 className="text-2xl font-black text-[#023047] mb-2">{projectData.title}</h4>
                          <div className="flex items-center gap-3 text-sm text-gray-500">
                            <span className="flex items-center gap-1">
                              <Users className="w-4 h-4" />
                              {submission.user?.name}
                            </span>
                            <span>•</span>
                            <span>{new Date(submission.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <Badge className="bg-orange-50 text-orange-600 border-0 font-bold px-4 py-2">
                          {submission.status}
                        </Badge>
                      </div>

                      {/* Description */}
                      <div className="bg-white rounded-2xl p-6 mb-4 border border-gray-100">
                        <p className="text-gray-700 leading-relaxed">{projectData.description}</p>
                      </div>

                      {/* Tech Stack */}
                      {projectData.techStack && projectData.techStack.length > 0 && (
                        <div className="mb-4">
                          <div className="flex items-center gap-2 mb-3">
                            <Code className="w-4 h-4 text-[#219EBC]" />
                            <span className="text-sm font-bold text-gray-700">Tech Stack</span>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {projectData.techStack.map((tech: string, idx: number) => (
                              <Badge 
                                key={idx} 
                                className="bg-blue-50 text-blue-700 border-0 font-bold px-3 py-1"
                              >
                                {tech}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Goals */}
                      {projectData.goals && (
                        <div className="mb-4">
                          <div className="flex items-center gap-2 mb-3">
                            <Target className="w-4 h-4 text-green-600" />
                            <span className="text-sm font-bold text-gray-700">Project Goals</span>
                          </div>
                          <p className="text-sm text-gray-600 bg-green-50 rounded-xl p-4 border border-green-100">
                            {projectData.goals}
                          </p>
                        </div>
                      )}

                      {/* Team Size */}
                      {projectData.teamSize && (
                        <div className="mb-6">
                          <span className="text-sm text-gray-500">
                            Ideal Team Size: <span className="font-bold text-gray-700">{projectData.teamSize} members</span>
                          </span>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex gap-3">
                        <Button
                          onClick={() => handleApprove(submission.id, projectData.title)}
                          disabled={processing === submission.id}
                          className="flex-1 h-12 rounded-xl bg-green-500 hover:bg-green-600 text-white flex items-center justify-center gap-2 transition-all font-bold shadow-lg shadow-green-500/30"
                        >
                          <CheckCircle2 className="w-5 h-5" />
                          {processing === submission.id ? 'Approving...' : 'Approve Project'}
                        </Button>
                        <Button
                          onClick={() => handleReject(submission.id, projectData.title)}
                          disabled={processing === submission.id}
                          variant="outline"
                          className="flex-1 h-12 rounded-xl border-2 border-red-200 hover:bg-red-50 text-red-600 flex items-center justify-center gap-2 transition-all font-bold"
                        >
                          <XCircle className="w-5 h-5" />
                          Reject
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
