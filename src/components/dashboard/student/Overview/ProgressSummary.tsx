"use client";

import { useRef } from "react";
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";
import {
  CheckCircle2,
  Calendar,
  Pencil,
  Github,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  FolderCode,
} from "lucide-react";

interface ProjectMemberUser {
  id: string;
  name: string | null;
  image: string | null;
}

interface Project {
  id: string;
  title: string;
  tasks: number;
  progress: number;
  color: string;
  textColor: string;
  status: string;
  completedAt?: string | null;
  ownerId?: string;
  githubUrl?: string | null;
  liveUrl?: string | null;
  logoUrl?: string | null;
  category?: string | null;
  techStack?: string[];
  owner?: ProjectMemberUser | null;
  members?: Array<{ user?: ProjectMemberUser }>;
}

interface ProgressSummaryProps {
  projects: Project[];
  searchQuery: string;
  onEdit?: (projectId: string) => void;
  currentUserId?: string;
}

const getProjectAvatars = (project: Project) => {
  const avatars: { id: string; name: string | null; image: string | null }[] = [];
  if (project.owner && project.owner.name) {
    avatars.push({ id: project.owner.id, name: project.owner.name, image: project.owner.image });
  }
  if (project.members) {
    project.members.forEach((m) => {
      if (m.user && m.user.name && !avatars.some((a) => a.id === m.user?.id)) {
        avatars.push({ id: m.user.id, name: m.user.name, image: m.user.image });
      }
    });
  }
  return avatars;
};

const formatCompletionDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

function ProjectCardContent({
  project,
  onEdit,
  currentUserId,
  isSingle = false,
}: {
  project: Project;
  onEdit?: (id: string) => void;
  currentUserId?: string;
  isSingle?: boolean;
}) {
  const avatars = getProjectAvatars(project);
  const isDarkText = project.textColor.includes("text-[#00443D]");
  const avatarBorder = isDarkText
    ? "border-[#00443D]/20 bg-[#00443D]/10"
    : "border-white/30 bg-white/20";

  return (
    <div className="flex flex-col h-full justify-between min-h-55">
      <div>
        {/* Header: Avatars/Icon on left, Action controls & status on right */}
        <div className="flex justify-between items-start mb-6 gap-3">
          <div className="flex items-center">
            {avatars.length > 0 ? (
              <div className="flex -space-x-2.5 items-center">
                {avatars.slice(0, 3).map((avatar, idx) => (
                  <div key={avatar.id || idx} title={avatar.name || "Member"}>
                    {avatar.image ? (
                      <img
                        src={avatar.image}
                        alt={avatar.name || "Member avatar"}
                        className={`w-9 h-9 rounded-full object-cover border-2 ${avatarBorder}`}
                      />
                    ) : (
                      <div
                        className={`w-9 h-9 rounded-full border-2 ${avatarBorder} backdrop-blur-sm flex items-center justify-center text-[11px] font-extrabold uppercase`}
                      >
                        {avatar.name
                          ? avatar.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")
                              .slice(0, 2)
                          : "U"}
                      </div>
                    )}
                  </div>
                ))}
                {avatars.length > 3 && (
                  <div
                    className={`w-9 h-9 rounded-full border-2 ${avatarBorder} backdrop-blur-sm flex items-center justify-center text-[10px] font-extrabold`}
                  >
                    +{avatars.length - 3}
                  </div>
                )}
              </div>
            ) : project.logoUrl ? (
              <img
                src={project.logoUrl}
                alt={project.title}
                className={`w-10 h-10 rounded-xl object-contain border ${avatarBorder} p-1`}
              />
            ) : (
              <div
                className={`w-10 h-10 rounded-2xl border ${avatarBorder} flex items-center justify-center backdrop-blur-sm`}
              >
                <FolderCode className="w-5 h-5 opacity-90" />
              </div>
            )}
          </div>

          {/* Action links & Status badge */}
          <div className="flex items-center gap-1.5 flex-wrap justify-end">
            {project.status === "COMPLETED" && (
              <div className="bg-white/20 backdrop-blur-sm rounded-full px-3 py-1 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span className="text-xs font-bold">Completed</span>
              </div>
            )}

            {project.githubUrl && (
              <a
                href={project.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                aria-label="GitHub repository"
                title="GitHub repository"
              >
                <Github className="w-4 h-4" />
              </a>
            )}

            {project.liveUrl && (
              <a
                href={project.liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                aria-label="Live demo"
                title="Live demo"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            )}

            {onEdit && project.ownerId === currentUserId && (
              <button
                onClick={() => onEdit(project.id)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/30 flex items-center justify-center transition-colors"
                aria-label="Edit project"
                title="Edit project"
              >
                <Pencil className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Category & Title */}
        <div className="mb-6">
          {project.category && (
            <span className="inline-block text-[11px] font-extrabold tracking-wider uppercase opacity-80 mb-1.5 px-2.5 py-0.5 rounded-full bg-current/10">
              {project.category}
            </span>
          )}
          <h3
            className={`${
              isSingle ? "text-2xl sm:text-3xl" : "text-xl sm:text-2xl"
            } font-black leading-tight tracking-tight`}
          >
            {project.title}
          </h3>
        </div>

        {/* Completion Date */}
        {project.status === "COMPLETED" && project.completedAt && (
          <div className="mb-4 flex items-center gap-2 text-sm font-bold opacity-90">
            <Calendar className="w-4 h-4" />
            <span>Completed on {formatCompletionDate(project.completedAt)}</span>
          </div>
        )}
      </div>

      {/* Progress & Members Footer */}
      <div className="space-y-3 pt-4">
        <div className="flex justify-between text-sm font-bold opacity-80">
          <span>
            {project.tasks} {project.tasks === 1 ? "member" : "members"}
          </span>
          <span>{project.progress}%</span>
        </div>
        <div className="h-2 bg-white/20 rounded-full overflow-hidden">
          <div
            className="h-full bg-white rounded-full transition-all duration-500"
            style={{ width: `${project.progress}%` }}
          />
        </div>
      </div>
    </div>
  );
}

export default function ProgressSummary({
  projects,
  searchQuery,
  onEdit,
  currentUserId,
}: ProgressSummaryProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const filteredProjects = projects.filter((project) =>
    project.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleScroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = direction === "left" ? -350 : 350;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  if (filteredProjects.length === 0) {
    return (
      <div className="col-span-full text-center py-12 text-muted-foreground bg-muted/30 rounded-3xl mb-12 border border-dashed border-border">
        {searchQuery
          ? `No projects found matching "${searchQuery}"`
          : "No projects found. Create one to get started!"}
      </div>
    );
  }

  // Single Project View: Render full-width featured card
  if (filteredProjects.length === 1) {
    const project = filteredProjects[0];
    return (
      <div className="mb-12 w-full">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card
            className={`${project.color} ${project.textColor} border-0 rounded-4xl sm:rounded-[40px] p-6 sm:p-8 w-full shadow-2xl shadow-black/5 hover:scale-[1.005] transition-transform relative`}
          >
            <ProjectCardContent
              project={project}
              onEdit={onEdit}
              currentUserId={currentUserId}
              isSingle={true}
            />
          </Card>
        </motion.div>
      </div>
    );
  }

  // Multiple Projects View: Render scrollable carousel container
  return (
    <div className="mb-12 space-y-3">
      <div className="flex items-center justify-between px-1">
        <span className="text-xs font-semibold text-muted-foreground">
          {filteredProjects.length} Projects • Scroll horizontally to explore
        </span>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => handleScroll("left")}
            className="w-8 h-8 rounded-full bg-muted/80 hover:bg-muted flex items-center justify-center text-foreground transition-colors shadow-sm"
            aria-label="Scroll left"
            title="Scroll left"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleScroll("right")}
            className="w-8 h-8 rounded-full bg-muted/80 hover:bg-muted flex items-center justify-center text-foreground transition-colors shadow-sm"
            aria-label="Scroll right"
            title="Scroll right"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="flex gap-6 overflow-x-auto snap-x snap-mandatory pb-4 pt-1 px-1 scrollbar-thin scrollbar-thumb-muted-foreground/20 hover:scrollbar-thumb-muted-foreground/40 scroll-smooth"
      >
        {filteredProjects.map((project, i) => (
          <motion.div
            key={project.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.08 }}
            className="w-75 sm:w-85 shrink-0 snap-start"
          >
            <Card
              className={`${project.color} ${project.textColor} border-0 rounded-4xl sm:rounded-[40px] p-7 h-full shadow-2xl shadow-black/5 hover:scale-[1.02] transition-transform relative`}
            >
              <ProjectCardContent
                project={project}
                onEdit={onEdit}
                currentUserId={currentUserId}
                isSingle={false}
              />
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
