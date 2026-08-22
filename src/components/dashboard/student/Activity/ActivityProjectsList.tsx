"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  FolderOpen,
  Plus,
  Github,
  ExternalLink,
  Pencil,
  CheckCircle2,
  Clock,
  Users,
  Code2,
  Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import JoinRequests from "@/components/dashboard/student/Projects/JoinRequests";

interface ActivityProjectsListProps {
  projects: any[];
  currentUserId?: string;
  onEditProject?: (project: any) => void;
}

export default function ActivityProjectsList({
  projects,
  currentUserId,
  onEditProject,
}: ActivityProjectsListProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "IN_PROGRESS" | "COMPLETED">("ALL");

  const filteredProjects = useMemo(() => {
    return projects.filter((p) => {
      const matchesSearch =
        p.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.techStack?.some((t: string) => t.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesStatus =
        statusFilter === "ALL" ? true : p.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [projects, searchQuery, statusFilter]);

  const counts = useMemo(() => {
    return {
      all: projects.length,
      inProgress: projects.filter((p) => p.status === "IN_PROGRESS").length,
      completed: projects.filter((p) => p.status === "COMPLETED").length,
    };
  }, [projects]);

  return (
    <div className="space-y-6">
      {/* Search & Filter Header (Unstop style) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Status Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <button
            onClick={() => setStatusFilter("ALL")}
            className={`px-4 py-2 rounded-xl font-bold text-xs transition-all cursor-pointer whitespace-nowrap ${
              statusFilter === "ALL"
                ? "bg-[#F0771A] text-white shadow-md shadow-[#F0771A]/20"
                : "bg-card border border-border/70 text-muted-foreground hover:bg-muted/50"
            }`}
          >
            All Projects ({counts.all})
          </button>
          <button
            onClick={() => setStatusFilter("IN_PROGRESS")}
            className={`px-4 py-2 rounded-xl font-bold text-xs transition-all cursor-pointer whitespace-nowrap ${
              statusFilter === "IN_PROGRESS"
                ? "bg-[#F0771A] text-white shadow-md shadow-[#F0771A]/20"
                : "bg-card border border-border/70 text-muted-foreground hover:bg-muted/50"
            }`}
          >
            In Progress ({counts.inProgress})
          </button>
          <button
            onClick={() => setStatusFilter("COMPLETED")}
            className={`px-4 py-2 rounded-xl font-bold text-xs transition-all cursor-pointer whitespace-nowrap ${
              statusFilter === "COMPLETED"
                ? "bg-[#F0771A] text-white shadow-md shadow-[#F0771A]/20"
                : "bg-card border border-border/70 text-muted-foreground hover:bg-muted/50"
            }`}
          >
            Completed ({counts.completed})
          </button>
        </div>

        {/* Search Bar + Create Button */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-10 pl-9 pr-4 rounded-xl bg-card border border-border/70 text-xs font-medium focus:ring-2 focus:ring-[#F0771A] outline-none"
            />
          </div>
          <Button
            onClick={() => router.push("/submit-project")}
            className="h-10 px-4 rounded-xl bg-[#F0771A] hover:bg-[#e0650d] text-white font-bold text-xs shrink-0 flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" /> Create
          </Button>
        </div>
      </div>

      {/* Projects List (Unstop List Card Format) */}
      {filteredProjects.length === 0 ? (
        <div className="rounded-3xl bg-muted/20 border border-dashed border-border/80 p-12 text-center">
          <FolderOpen className="w-12 h-12 text-muted-foreground/50 mx-auto mb-3" />
          <h4 className="text-base font-extrabold text-foreground mb-1">
            {searchQuery ? "No matching projects found" : "No projects in this category"}
          </h4>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto mb-5">
            {searchQuery
              ? "Try adjusting your search terms or status filter."
              : "Get started by building a project or collaborating with fellow students."}
          </p>
          <Button
            onClick={() => router.push("/submit-project")}
            className="rounded-xl bg-[#F0771A] hover:bg-[#e0650d] text-white font-bold text-xs"
          >
            <Plus className="w-4 h-4 mr-1" /> Add New Project
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredProjects.map((project) => {
            const isOwner = project.ownerId === currentUserId;
            const memberCount = project._count?.members || project.members?.length || 1;

            return (
              <div
                key={project.id}
                className="group bg-card border border-border/70 rounded-2xl p-5 hover:border-[#F0771A]/50 hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-5"
              >
                {/* Left: Icon & Details */}
                <div className="flex items-start gap-4 min-w-0 flex-1">
                  <div className="w-14 h-14 rounded-2xl bg-linear-to-br from-purple-500/10 to-[#F0771A]/10 border border-border/60 flex items-center justify-center shrink-0 text-xl font-bold">
                    {project.logoUrl ? (
                      <img
                        src={project.logoUrl}
                        alt=""
                        className="w-9 h-9 object-contain rounded-lg"
                      />
                    ) : (
                      <Code2 className="w-7 h-7 text-[#F0771A]" />
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span
                        className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                          project.status === "COMPLETED"
                            ? "bg-emerald-500/10 text-emerald-500"
                            : "bg-[#F0771A]/10 text-[#F0771A]"
                        }`}
                      >
                        {project.status === "COMPLETED" ? "Completed" : "In Progress"}
                      </span>

                      {project.category && (
                        <span className="text-[10px] font-bold text-muted-foreground uppercase px-2 py-0.5 rounded-full bg-muted">
                          {project.category}
                        </span>
                      )}

                      {isOwner && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                          Owner
                        </span>
                      )}
                    </div>

                    <h3 className="text-base font-extrabold text-foreground leading-snug truncate group-hover:text-[#F0771A] transition-colors">
                      {project.title}
                    </h3>

                    {project.description && (
                      <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                        {project.description}
                      </p>
                    )}

                    <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground mt-3 font-semibold">
                      <span className="flex items-center gap-1">
                        <Users className="w-3.5 h-3.5 text-muted-foreground/70" />
                        {memberCount} {memberCount === 1 ? "Member" : "Members"}
                      </span>

                      {project.completedAt && (
                        <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Done{" "}
                          {new Date(project.completedAt).toLocaleDateString("en-US", {
                            month: "short",
                            year: "numeric",
                          })}
                        </span>
                      )}

                      {project.techStack && project.techStack.length > 0 && (
                        <div className="hidden sm:flex items-center gap-1.5">
                          {project.techStack.slice(0, 3).map((tech: string) => (
                            <span
                              key={tech}
                              className="text-[10px] px-2 py-0.5 rounded-md bg-muted/60 text-muted-foreground"
                            >
                              {tech}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-2 self-end md:self-center shrink-0 pt-3 md:pt-0 border-t md:border-t-0 border-border/40 w-full md:w-auto justify-end">
                  {project.githubUrl && (
                    <a
                      href={project.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="h-9 px-3 rounded-xl bg-muted/60 hover:bg-muted text-foreground flex items-center gap-1.5 text-xs font-bold transition-colors"
                      title="GitHub Repository"
                    >
                      <Github className="w-3.5 h-3.5" /> Code
                    </a>
                  )}

                  {project.liveUrl && (
                    <a
                      href={project.liveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="h-9 px-3 rounded-xl bg-muted/60 hover:bg-muted text-foreground flex items-center gap-1.5 text-xs font-bold transition-colors"
                      title="Live Demo"
                    >
                      <ExternalLink className="w-3.5 h-3.5" /> Demo
                    </a>
                  )}

                  {isOwner && onEditProject && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onEditProject(project)}
                      className="h-9 px-3 rounded-xl text-xs font-bold"
                    >
                      <Pencil className="w-3.5 h-3.5 mr-1" /> Edit
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Join Requests Section for project owners */}
      {currentUserId && (
        <div className="pt-6 border-t border-border/60" id="join-requests">
          <JoinRequests userId={currentUserId} />
        </div>
      )}
    </div>
  );
}
