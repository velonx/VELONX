"use client";

import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";
import { CheckCircle2, Calendar, Pencil, Github, ExternalLink } from "lucide-react";

interface Project {
  id: string;
  title: string;
  tasks: number;
  progress: number;
  color: string;
  textColor: string;
  users: string[];
  status: string;
  completedAt?: string | null;
  ownerId?: string;
  githubUrl?: string | null;
  liveUrl?: string | null;
}

interface ProgressSummaryProps {
  projects: Project[];
  searchQuery: string;
  onEdit?: (projectId: string) => void;
  currentUserId?: string;
}

export default function ProgressSummary({ projects, searchQuery, onEdit, currentUserId }: ProgressSummaryProps) {
  const filteredProjects = projects.filter(project =>
    project.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatCompletionDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
      {filteredProjects.length > 0 ? (
        filteredProjects.map((project, i) => (
          <motion.div
            key={project.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className={`${project.color} ${project.textColor} border-0 rounded-[40px] p-8 h-full shadow-2xl shadow-black/5 hover:scale-[1.02] transition-transform relative`}>
              {/* Completion Badge */}
              {project.status === 'COMPLETED' && (
                <div className="absolute top-6 right-6 bg-white/20 backdrop-blur-sm rounded-full px-3 py-1.5 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  <span className="text-xs font-bold">Completed</span>
                </div>
              )}
              
              <div className="flex justify-between items-start mb-6">
                <div className="flex -space-x-3">
                  {[1, 2, 3].map((_, idx) => (
                    <div key={idx} className="w-10 h-10 rounded-full border-2 border-white/20 bg-white/10 flex items-center justify-center text-[10px] font-bold">
                      +{idx + 7}
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-1">
                  {project.githubUrl && (
                    <a
                      href={project.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={e => e.stopPropagation()}
                      className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                      aria-label="GitHub repository"
                    >
                      <Github className="w-4 h-4" />
                    </a>
                  )}
                  {project.liveUrl && (
                    <a
                      href={project.liveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={e => e.stopPropagation()}
                      className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                      aria-label="Live demo"
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
              
              <h3 className="text-2xl font-black mb-6 leading-tight max-w-[150px]">{project.title}</h3>
              
              {/* Completion Date */}
              {project.status === 'COMPLETED' && project.completedAt && (
                <div className="mb-4 flex items-center gap-2 text-sm font-bold opacity-90">
                  <Calendar className="w-4 h-4" />
                  <span>Completed on {formatCompletionDate(project.completedAt)}</span>
                </div>
              )}
              
              <div className="space-y-4">
                <div className="flex justify-between text-sm font-bold opacity-80">
                  <span>{project.tasks} members</span>
                  <span>{project.progress}%</span>
                </div>
                <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                  <div className="h-full bg-white rounded-full" style={{ width: `${project.progress}%` }} />
                </div>
              </div>
            </Card>
          </motion.div>
        ))
      ) : (
        <div className="col-span-1 sm:col-span-2 lg:col-span-3 text-center py-12 text-gray-400">
          {searchQuery ? `No projects found matching "${searchQuery}"` : 'No projects found. Create one to get started!'}
        </div>
      )}
    </div>
  );
}
