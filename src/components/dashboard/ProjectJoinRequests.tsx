"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FolderKanban, CheckCircle2, XCircle, Mail, Award, TrendingUp } from "lucide-react";
import toast from "react-hot-toast";

interface JoinRequest {
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
    xp: number;
    level: number;
  };
}

interface Project {
  id: string;
  title: string;
  description: string;
  techStack: string[];
  _count?: {
    members: number;
  };
}

export default function ProjectJoinRequests({ userId }: { userId: string }) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [joinRequests, setJoinRequests] = useState<Record<string, JoinRequest[]>>({});
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);

  const fetchProjectsAndRequests = async () => {
    setLoading(true);
    try {
      // Fetch projects owned by the user
      const projectsResponse = await fetch(`/api/projects?memberId=${userId}&pageSize=50`);
      const projectsData = await projectsResponse.json();
      
      if (projectsData.success) {
        const ownedProjects = projectsData.data.filter((p: any) => p.ownerId === userId);
        setProjects(ownedProjects);

        // Fetch join requests for each owned project
        const requestsMap: Record<string, JoinRequest[]> = {};
        
        for (const project of ownedProjects) {
          try {
            const requestsResponse = await fetch(`/api/projects/${project.id}/join-requests`);
            const requestsData = await requestsResponse.json();
            
            if (requestsData.success) {
              requestsMap[project.id] = requestsData.data;
            }
          } catch (error) {
            console.error(`Failed to fetch requests for project ${project.id}:`, error);
          }
        }
        
        setJoinRequests(requestsMap);
      }
    } catch (error) {
      toast.error("Failed to load projects");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchProjectsAndRequests();
    }
  }, [userId]);

  const handleApprove = async (requestId: string, userName: string, projectId: string) => {
    setProcessing(requestId);
    try {
      const response = await fetch(`/api/projects/join-requests/${requestId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'approve' }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast.success(`${userName} has been added to your project!`);
        fetchProjectsAndRequests();
      } else {
        toast.error(data.error?.message || 'Failed to approve request');
      }
    } catch (error) {
      toast.error('Failed to approve request');
    } finally {
      setProcessing(null);
    }
  };

  const handleReject = async (requestId: string, userName: string) => {
    if (!confirm(`Are you sure you want to reject ${userName}'s request?`)) {
      return;
    }

    setProcessing(requestId);
    try {
      const response = await fetch(`/api/projects/join-requests/${requestId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reject' }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast.success('Join request rejected');
        fetchProjectsAndRequests();
      } else {
        toast.error(data.error?.message || 'Failed to reject request');
      }
    } catch (error) {
      toast.error('Failed to reject request');
    } finally {
      setProcessing(null);
    }
  };

  if (loading) {
    return (
      <Card className="bg-white border-0 shadow-lg rounded-3xl overflow-hidden">
        <CardHeader className="p-8 border-b border-gray-100">
          <h3 className="text-2xl font-black text-[#023047] flex items-center gap-2">
            <FolderKanban className="w-6 h-6 text-[#219EBC]" />
            My Projects - Join Requests
          </h3>
          <p className="text-gray-400 text-sm mt-1">Manage who joins your projects</p>
        </CardHeader>
        <CardContent className="p-8">
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#219EBC] mx-auto mb-3"></div>
            <p className="text-gray-600 text-sm">Loading projects...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const projectsWithRequests = projects.filter(p => joinRequests[p.id]?.length > 0);

  if (projects.length === 0) {
    return (
      <Card className="bg-white border-0 shadow-lg rounded-3xl overflow-hidden">
        <CardHeader className="p-8 border-b border-gray-100">
          <h3 className="text-2xl font-black text-[#023047] flex items-center gap-2">
            <FolderKanban className="w-6 h-6 text-[#219EBC]" />
            My Projects - Join Requests
          </h3>
          <p className="text-gray-400 text-sm mt-1">Manage who joins your projects</p>
        </CardHeader>
        <CardContent className="p-8">
          <div className="text-center py-8">
            <FolderKanban className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-400 font-bold">You don't own any projects yet</p>
            <p className="text-gray-400 text-sm mt-1">Submit a project idea to get started!</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (projectsWithRequests.length === 0) {
    return (
      <Card className="bg-white border-0 shadow-lg rounded-3xl overflow-hidden">
        <CardHeader className="p-8 border-b border-gray-100">
          <h3 className="text-2xl font-black text-[#023047] flex items-center gap-2">
            <FolderKanban className="w-6 h-6 text-[#219EBC]" />
            My Projects - Join Requests
          </h3>
          <p className="text-gray-400 text-sm mt-1">Manage who joins your projects</p>
        </CardHeader>
        <CardContent className="p-8">
          <div className="text-center py-8">
            <CheckCircle2 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-400 font-bold">No pending join requests</p>
            <p className="text-gray-400 text-sm mt-1">You'll see requests here when students want to join your projects</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white border-0 shadow-lg rounded-3xl overflow-hidden">
      <CardHeader className="p-8 border-b border-gray-100">
        <h3 className="text-2xl font-black text-[#023047] flex items-center gap-2">
          <FolderKanban className="w-6 h-6 text-[#219EBC]" />
          My Projects - Join Requests
        </h3>
        <p className="text-gray-400 text-sm mt-1">Manage who joins your projects</p>
      </CardHeader>
      <CardContent className="p-8">
        <div className="space-y-6">
          {projectsWithRequests.map((project) => (
            <div key={project.id} className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
              {/* Project Header */}
              <div className="mb-4 pb-4 border-b border-gray-200">
                <h4 className="text-lg font-bold text-[#023047] mb-2">{project.title}</h4>
                <p className="text-sm text-gray-600 mb-3">{project.description}</p>
                <div className="flex flex-wrap gap-2">
                  {project.techStack.slice(0, 5).map((tech, idx) => (
                    <Badge key={idx} className="bg-white text-gray-700 border-0 text-xs">
                      {tech}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Join Requests */}
              <div className="space-y-3">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
                  Pending Requests ({joinRequests[project.id]?.length || 0})
                </p>
                
                {joinRequests[project.id]?.map((request) => (
                  <div 
                    key={request.id}
                    className="bg-white rounded-xl p-4 hover:shadow-md transition-all border border-gray-100"
                  >
                    <div className="flex items-center gap-4">
                      {/* User Avatar */}
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#219EBC] to-[#023047] flex items-center justify-center text-white font-black text-lg flex-shrink-0">
                        {request.user?.name?.[0] || 'U'}
                      </div>

                      {/* User Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h5 className="font-bold text-[#023047]">{request.user?.name}</h5>
                          <Badge className="bg-purple-50 text-purple-700 border-0 text-xs">
                            <Award className="w-3 h-3 mr-1" />
                            Level {request.user?.level}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <Mail className="w-3 h-3" />
                            {request.user?.email}
                          </span>
                          <span className="flex items-center gap-1">
                            <TrendingUp className="w-3 h-3" />
                            {request.user?.xp} XP
                          </span>
                        </div>
                        <p className="text-xs text-gray-400 mt-2">
                          Requested {new Date(request.createdAt).toLocaleDateString()}
                        </p>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2 flex-shrink-0">
                        <Button
                          onClick={() => handleApprove(request.id, request.user?.name, project.id)}
                          disabled={processing === request.id}
                          size="sm"
                          className="h-9 px-4 rounded-lg bg-green-500 hover:bg-green-600 text-white flex items-center gap-1 font-bold text-xs"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          {processing === request.id ? 'Adding...' : 'Accept'}
                        </Button>
                        <Button
                          onClick={() => handleReject(request.id, request.user?.name)}
                          disabled={processing === request.id}
                          size="sm"
                          variant="outline"
                          className="h-9 px-4 rounded-lg border-red-200 hover:bg-red-50 text-red-600 flex items-center gap-1 font-bold text-xs"
                        >
                          <XCircle className="w-4 h-4" />
                          Reject
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
