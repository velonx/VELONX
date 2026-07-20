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
  MoreHorizontal,
  Plus,
  Vote,
  Camera,
  BarChart3,
  Sparkles,
} from "lucide-react";
import { useRouter } from "next/navigation";

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

/** Get a nice icon for project card based on title/index */
function getProjectIcon(title: string, index: number) {
  const t = title.toLowerCase();
  if (t.includes('election') || t.includes('vote')) return <Vote className="w-7 h-7 text-purple-600" />;
  if (t.includes('reminder') || t.includes('shot') || t.includes('photo')) return <Camera className="w-7 h-7 text-teal-600" />;
  if (t.includes('gen') || t.includes('fin') || t.includes('chart') || t.includes('data')) return <BarChart3 className="w-7 h-7 text-orange-600" />;
  
  if (index % 3 === 0) return <Vote className="w-7 h-7 text-purple-600" />;
  if (index % 3 === 1) return <Camera className="w-7 h-7 text-teal-600" />;
  return <BarChart3 className="w-7 h-7 text-orange-600" />;
}

function ProjectCardContent({
  project,
  index = 0,
  onEdit,
  currentUserId,
  isSingle = false,
}: {
  project: Project;
  index?: number;
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
        {/* Header: Avatars on left, Action buttons / options on right */}
        <div className="flex justify-between items-center mb-5 gap-2">
          <div className="flex items-center">
            {avatars.length > 0 ? (
              <div className="flex -space-x-2.5 items-center">
                {avatars.slice(0, 3).map((avatar, idx) => (
                  <div key={avatar.id || idx} title={avatar.name || "Member"}>
                    {avatar.image ? (
                      <img
                        src={avatar.image}
                        alt={avatar.name || "Member avatar"}
                        className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full object-cover border-2 ${avatarBorder}`}
                      />
                    ) : (
                      <div
                        className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full border-2 ${avatarBorder} backdrop-blur-sm flex items-center justify-center text-[11px] font-extrabold uppercase`}
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
                    className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full border-2 ${avatarBorder} backdrop-blur-sm flex items-center justify-center text-[10px] font-extrabold`}
                  >
                    +{avatars.length - 3}
                  </div>
                )}
              </div>
            ) : (
              // Mock style +7 +8 +9 fallback circles if no real member avatars
              <div className="flex -space-x-2.5 items-center">
                {[7, 8, 9].map((num) => (
                  <div
                    key={num}
                    className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full border-2 ${avatarBorder} backdrop-blur-sm flex items-center justify-center text-[10px] font-extrabold`}
                  >
                    +{num}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Action links & More menu icon */}
          <div className="flex items-center gap-1">
            {project.status === "COMPLETED" && (
              <div className="bg-white/20 backdrop-blur-sm rounded-full px-2.5 py-0.5 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span className="text-[11px] font-bold">Done</span>
              </div>
            )}

            {project.githubUrl && (
              <a
                href={project.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                title="GitHub repository"
              >
                <Github className="w-3.5 h-3.5" />
              </a>
            )}

            {project.liveUrl && (
              <a
                href={project.liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                title="Live demo"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}

            {onEdit && project.ownerId === currentUserId && (
              <button
                onClick={() => onEdit(project.id)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/30 flex items-center justify-center transition-colors"
                title="Edit project"
              >
                <Pencil className="w-3.5 h-3.5" />
              </button>
            )}

            <button
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors opacity-80 hover:opacity-100"
              title="More options"
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* White Rounded Square Icon Container */}
        <div className="w-14 h-14 rounded-2xl bg-white shadow-md flex items-center justify-center mb-5">
          {project.logoUrl ? (
            <img src={project.logoUrl} alt="" className="w-8 h-8 object-contain" />
          ) : (
            getProjectIcon(project.title, index)
          )}
        </div>

        {/* Category & Title */}
        <div>
          {project.category && (
            <span className="inline-block text-[11px] font-extrabold tracking-wider uppercase opacity-80 mb-1 px-2.5 py-0.5 rounded-full bg-current/10">
              {project.category}
            </span>
          )}
          <h3
            className={`${
              isSingle ? "text-2xl sm:text-3xl" : "text-xl sm:text-2xl"
            } font-black leading-tight tracking-tight mb-4`}
          >
            {project.title}
          </h3>
        </div>

        {/* Completion Date */}
        {project.status === "COMPLETED" && project.completedAt && (
          <div className="mb-4 flex items-center gap-2 text-xs font-bold opacity-90">
            <Calendar className="w-3.5 h-3.5" />
            <span>Completed on {formatCompletionDate(project.completedAt)}</span>
          </div>
        )}
      </div>

      {/* Progress & Members Footer */}
      <div className="space-y-2.5 pt-4">
        <div className="flex justify-between text-xs font-extrabold opacity-90">
          <span>
            {project.tasks} {project.tasks === 1 ? "members" : "members"}
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
  const router = useRouter();

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
      <div className="col-span-full text-center py-12 text-muted-foreground bg-muted/30 rounded-3xl mb-12 border border-dashed border-border flex flex-col items-center justify-center gap-3">
        <Sparkles className="w-8 h-8 text-muted-foreground/60" />
        <p className="font-semibold text-sm">
          {searchQuery
            ? `No projects found matching "${searchQuery}"`
            : "No projects found. Create one to get started!"}
        </p>
        <button
          onClick={() => router.push('/submit-project')}
          className="mt-2 px-5 py-2.5 bg-[#FF5D17] text-white font-bold text-xs rounded-xl shadow-md hover:bg-[#FF4500] transition-all cursor-pointer"
        >
          + Create First Project
        </button>
      </div>
    );
  }

  return (
    <div className="mb-12 space-y-3">
      {filteredProjects.length > 3 && (
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-semibold text-muted-foreground">
            {filteredProjects.length} Projects • Scroll horizontally to explore
          </span>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => handleScroll("left")}
              className="w-8 h-8 rounded-full bg-muted/80 hover:bg-muted flex items-center justify-center text-foreground transition-colors shadow-xs cursor-pointer"
              aria-label="Scroll left"
              title="Scroll left"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleScroll("right")}
              className="w-8 h-8 rounded-full bg-muted/80 hover:bg-muted flex items-center justify-center text-foreground transition-colors shadow-xs cursor-pointer"
              aria-label="Scroll right"
              title="Scroll right"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

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
              className={`${project.color} ${project.textColor} border-0 rounded-4xl sm:rounded-[40px] p-6 sm:p-7 h-full shadow-2xl shadow-black/5 hover:scale-[1.02] transition-transform relative`}
            >
              <ProjectCardContent
                project={project}
                index={i}
                onEdit={onEdit}
                currentUserId={currentUserId}
                isSingle={filteredProjects.length === 1}
              />
            </Card>
          </motion.div>
        ))}

        {/* Create New Project Dashed Card */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: filteredProjects.length * 0.08 }}
          className="w-75 sm:w-85 shrink-0 snap-start"
        >
          <div
            onClick={() => router.push('/submit-project')}
            className="border-2 border-dashed border-blue-200 hover:border-[#FF5D17] bg-white dark:bg-card/50 rounded-4xl sm:rounded-[40px] p-6 sm:p-7 flex flex-col items-center justify-center text-center cursor-pointer transition-all hover:scale-[1.02] shadow-xs h-full min-h-55 group"
          >
            <div className="w-14 h-14 rounded-full bg-purple-50 dark:bg-purple-900/20 text-[#7C3AED] group-hover:bg-[#FF5D17] group-hover:text-white flex items-center justify-center mb-3 transition-colors shadow-xs">
              <Plus className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-foreground mb-1">Create New Project</h4>
            <p className="text-xs font-semibold text-muted-foreground max-w-44 leading-relaxed">
              Start building something amazing
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
