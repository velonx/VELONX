"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FolderKanban, Trash2, Users, Search, ExternalLink } from "lucide-react";
import toast from "react-hot-toast";

interface AdminProject {
  id: string;
  title: string;
  description: string;
  status: string;
  createdAt: string;
  githubUrl?: string | null;
  liveUrl?: string | null;
  owner?: {
    id: string;
    name: string | null;
    email: string | null;
    image?: string | null;
  };
  _count?: {
    members: number;
  };
}

const STATUS_STYLES: Record<string, string> = {
  PLANNING: "bg-amber-50 text-amber-700",
  IN_PROGRESS: "bg-blue-50 text-blue-700",
  COMPLETED: "bg-green-50 text-green-700",
  ARCHIVED: "bg-gray-100 text-gray-600",
};

export default function ProjectManagement() {
  const [projects, setProjects] = useState<AdminProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/projects?pageSize=100");
      const data = await response.json();
      if (data.success) {
        setProjects(data.data);
      } else {
        toast.error(data.error?.message || "Failed to load projects");
      }
    } catch {
      toast.error("Failed to load projects");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleDelete = async (projectId: string, title: string) => {
    if (
      !confirm(
        `Delete "${title}"?\n\nThis permanently removes the project and all of its team members. This action cannot be undone.`
      )
    ) {
      return;
    }

    setDeleting(projectId);
    try {
      const { getCSRFToken } = await import("@/lib/utils/csrf");
      const csrfToken = await getCSRFToken();

      const response = await fetch(`/api/projects/${projectId}`, {
        method: "DELETE",
        headers: {
          "x-csrf-token": csrfToken,
        },
        credentials: "include",
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast.success(`Project "${title}" deleted`);
        setProjects((prev) => prev.filter((p) => p.id !== projectId));
      } else {
        toast.error(data.error?.message || "Failed to delete project");
      }
    } catch {
      toast.error("Failed to delete project");
    } finally {
      setDeleting(null);
    }
  };

  const filtered = projects.filter((p) => {
    const q = searchQuery.toLowerCase();
    return (
      p.title.toLowerCase().includes(q) ||
      (p.owner?.name || "").toLowerCase().includes(q) ||
      (p.owner?.email || "").toLowerCase().includes(q)
    );
  });

  return (
    <Card className="bg-white border-0 shadow-2xl shadow-black/3 rounded-[48px] overflow-hidden">
      <CardHeader className="p-12 border-b border-gray-50">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <CardTitle className="heading-card text-3xl mb-2 flex items-center gap-3">
              <FolderKanban className="w-8 h-8 text-[#226CE0]" />
              Project Management
            </CardTitle>
            <p className="text-gray-400">Browse and remove any project on the platform</p>
          </div>
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by title or owner"
              className="pl-11 h-12 w-72 rounded-xl border-gray-200"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-12">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#226CE0] mx-auto mb-4"></div>
            <p className="text-gray-600">Loading projects...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12">
            <FolderKanban className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-400 text-lg font-bold">
              {projects.length === 0 ? "No projects yet" : "No projects match your search"}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((project) => (
              <div
                key={project.id}
                className="flex items-start gap-5 bg-linear-to-br from-gray-50 to-white rounded-3xl p-6 border border-gray-100"
              >
                <div className="w-12 h-12 rounded-2xl bg-linear-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white font-black text-lg shadow-lg shrink-0">
                  {project.title?.[0]?.toUpperCase() || "P"}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 flex-wrap mb-1">
                    <h4 className="heading-card text-xl truncate">{project.title}</h4>
                    <Badge
                      className={`border-0 font-bold px-3 py-1 ${STATUS_STYLES[project.status] || "bg-gray-100 text-gray-600"}`}
                    >
                      {project.status?.replace("_", " ")}
                    </Badge>
                    {(project.githubUrl || project.liveUrl) && (
                      <a
                        href={project.liveUrl || project.githubUrl || "#"}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-400 hover:text-[#226CE0]"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 line-clamp-1 mb-2">{project.description}</p>
                  <div className="flex items-center gap-4 text-xs text-gray-400">
                    <span>
                      Owner:{" "}
                      <span className="font-bold text-gray-600">
                        {project.owner?.name || project.owner?.email || "Unknown"}
                      </span>
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5" />
                      {project._count?.members ?? 0} members
                    </span>
                    <span>{new Date(project.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>

                <Button
                  onClick={() => handleDelete(project.id, project.title)}
                  disabled={deleting === project.id}
                  variant="outline"
                  className="h-11 px-4 rounded-xl border-2 border-red-200 hover:bg-red-50 text-red-600 flex items-center gap-2 font-bold shrink-0"
                >
                  <Trash2 className="w-4 h-4" />
                  {deleting === project.id ? "Deleting..." : "Delete"}
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
