"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { useEvents, useResources, useProjects } from "@/lib/api/hooks";
import type { Resource, Project } from "@/lib/api/types";
import {
  MapPin,
  Briefcase,
  Code2,
  GraduationCap,
  Trophy,
  BookOpen,
  UsersRound,
  Share2,
  Wallet,
  type LucideIcon,
} from "lucide-react";

// Structural pass only — visual design to be revisited later.
// Only tiles with a real image are shown; add more once you have art for them.
const HOME_TILES: { label: string; href: string; icon: LucideIcon; imageUrl: string }[] = [
  {
    label: "Internships",
    href: "/career?tab=internships",
    icon: Briefcase,
    imageUrl: "https://res.cloudinary.com/dypbafujn/image/upload/v1785153700/internship_uqdpnx.png",
  },
  {
    label: "Jobs",
    href: "/career",
    icon: Briefcase,
    imageUrl: "https://res.cloudinary.com/dypbafujn/image/upload/v1785153950/jobs_Background_Removed_jaqxzp.png",
  },
  {
    label: "Projects",
    href: "/projects",
    icon: Code2,
    imageUrl: "https://res.cloudinary.com/dypbafujn/image/upload/v1785153982/projects_q6vbrz.png",
  },
  {
    label: "Mentorship",
    href: "/mentors",
    icon: GraduationCap,
    imageUrl: "https://res.cloudinary.com/dypbafujn/image/upload/v1785154972/mentor_cs1wky.png",
  },
  {
    label: "Hackathons",
    href: "/events",
    icon: Trophy,
    imageUrl: "https://res.cloudinary.com/dypbafujn/image/upload/v1785153930/events_Background_Removed_mldvpl.png",
  },
  {
    label: "Community",
    href: "/community",
    icon: UsersRound,
    imageUrl: "https://res.cloudinary.com/dypbafujn/image/upload/v1785155132/community_j6lxu0.png",
  },
  {
    label: "Network",
    href: "/network",
    icon: Share2,
    imageUrl: "https://res.cloudinary.com/dypbafujn/image/upload/v1785153965/networking_Background_Removed_mxmdaj.png",
  },
  {
    label: "Resources",
    href: "/resources",
    icon: BookOpen,
    imageUrl: "https://res.cloudinary.com/dypbafujn/image/upload/v1785153989/resources_zxqiqs.png",
  },
];

interface Opportunity {
  id: string;
  slug?: string | null;
  title: string;
  company: string;
  location: string;
  salary?: string | null;
  imageUrl?: string | null;
}

function useOpportunities(type: "INTERNSHIP" | "JOB") {
  const [data, setData] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/opportunities?type=${type}`)
      .then((res) => res.json())
      .then((json) => {
        if (!cancelled && json.success) setData((json.data || []).slice(0, 8));
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [type]);

  return { data, loading };
}

function Row({
  title,
  viewAllHref,
  loading,
  isEmpty,
  emptyContent,
  children,
}: {
  title: string;
  viewAllHref: string;
  loading: boolean;
  isEmpty: boolean;
  emptyContent: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="mb-10">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-black text-foreground tracking-tight">{title}</h2>
        <Link href={viewAllHref} className="text-xs font-bold text-primary hover:underline">
          View all
        </Link>
      </div>

      {loading ? (
        <div className="flex gap-4 overflow-x-auto pb-2">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="shrink-0 w-64 h-40 rounded-2xl bg-muted/50 animate-pulse" />
          ))}
        </div>
      ) : isEmpty ? (
        <div className="rounded-2xl border border-border/60 bg-card p-8 text-center">
          <p className="text-muted-foreground text-sm">{emptyContent}</p>
        </div>
      ) : (
        <div className="flex gap-4 overflow-x-auto pb-2 snap-x snap-mandatory">{children}</div>
      )}
    </section>
  );
}

function OpportunityCard({ item }: { item: Opportunity }) {
  return (
    <Link
      href={`/career/${item.slug || item.id}`}
      className="shrink-0 w-64 snap-start rounded-2xl border border-border/60 bg-card p-4 hover:shadow-md transition-shadow"
    >
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex flex-col gap-1.5 min-w-0">
          {item.salary && (
            <p className="text-xs font-bold text-emerald-600 flex items-center gap-1">
              <Wallet className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">{item.salary}</span>
            </p>
          )}
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">{item.location}</span>
          </p>
        </div>
        <span className="w-16 h-16 rounded-xl bg-muted flex items-center justify-center overflow-hidden shrink-0">
          {item.imageUrl ? (
            <Image src={item.imageUrl} alt={item.company} width={64} height={64} className="object-contain w-full h-full p-1.5" />
          ) : (
            <Briefcase className="w-6 h-6 text-muted-foreground" />
          )}
        </span>
      </div>
      <p className="text-sm font-bold text-foreground line-clamp-2 mb-1">{item.title}</p>
      <p className="text-xs text-muted-foreground truncate">{item.company}</p>
    </Link>
  );
}

function ResourceCard({ resource }: { resource: Resource }) {
  return (
    <Link
      href={`/resources/${resource.id}`}
      className="shrink-0 w-64 snap-start rounded-2xl border border-border/60 bg-card overflow-hidden hover:shadow-md transition-shadow"
    >
      <div className="relative w-full h-28 bg-muted">
        {resource.imageUrl ? (
          <Image src={resource.imageUrl} alt={resource.title} fill className="object-cover" sizes="256px" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs font-bold">
            {resource.type}
          </div>
        )}
      </div>
      <div className="p-4">
        <p className="text-[10px] font-extrabold uppercase text-primary mb-1">
          {resource.category.replace(/_/g, " ")}
        </p>
        <p className="text-sm font-bold text-foreground line-clamp-2">{resource.title}</p>
      </div>
    </Link>
  );
}

function ProjectCard({ project }: { project: Project }) {
  return (
    <Link
      href="/projects"
      className="shrink-0 w-64 snap-start rounded-2xl border border-border/60 bg-card p-4 hover:shadow-md transition-shadow"
    >
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex flex-wrap gap-1.5 min-w-0">
          {project.techStack?.slice(0, 3).map((tech) => (
            <span key={tech} className="px-2 py-0.5 rounded-full bg-muted text-[10px] font-bold text-muted-foreground">
              {tech}
            </span>
          ))}
        </div>
        <span className="w-16 h-16 rounded-xl bg-primary/10 text-primary flex items-center justify-center overflow-hidden shrink-0">
          {project.logoUrl ? (
            <Image src={project.logoUrl} alt={project.title} width={64} height={64} className="object-cover w-full h-full" />
          ) : (
            <Code2 className="w-6 h-6" />
          )}
        </span>
      </div>
      <p className="text-sm font-bold text-foreground line-clamp-2">{project.title}</p>
    </Link>
  );
}

export default function HomePage() {
  const { data: session } = useSession();

  const { data: events, loading: eventsLoading } = useEvents({ status: "UPCOMING", pageSize: 8 });
  const { data: internships, loading: internshipsLoading } = useOpportunities("INTERNSHIP");
  const { data: jobs, loading: jobsLoading } = useOpportunities("JOB");
  const { data: projects, loading: projectsLoading } = useProjects({ pageSize: 8 });
  const { data: resources, loading: resourcesLoading } = useResources({ pageSize: 8 });

  return (
    <div className="container px-4 md:px-8 pb-16">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-foreground tracking-tight">
          Welcome back, {session?.user?.name?.split(" ")[0] || "Builder"}
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Jump into projects, mentorship, events, and more.
        </p>
      </div>

      {/* Action Tiles */}
      <section className="mb-10">
        <div className="flex gap-4 overflow-x-auto pb-2">
          {HOME_TILES.map((tile) => {
            const Icon = tile.icon;
            const imageUrl = tile.imageUrl;
            return (
              <Link
                key={tile.href + tile.label}
                href={tile.href}
                className="relative shrink-0 w-40 h-44 rounded-3xl bg-primary/10 p-4 overflow-hidden hover:-translate-y-0.5 hover:shadow-md transition-all"
              >
                <div className="absolute -top-8 -right-8 w-24 h-24 rounded-full bg-white/50 dark:bg-white/10 blur-2xl pointer-events-none" />
                <p className="relative text-sm font-extrabold text-foreground text-center leading-tight mb-2">
                  {tile.label}
                </p>
                <div className="relative w-full h-24 flex items-end justify-center">
                  {imageUrl ? (
                    <Image
                      src={imageUrl}
                      alt={tile.label}
                      width={110}
                      height={96}
                      className="w-auto h-full object-contain"
                    />
                  ) : (
                    <Icon className="w-10 h-10 text-primary" />
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      <Row
        title="Featured"
        viewAllHref="/events"
        loading={eventsLoading}
        isEmpty={!events || events.length === 0}
        emptyContent={
          <>
            No featured events right now.{" "}
            <Link href="/events" className="text-primary font-bold hover:underline">
              Browse all events
            </Link>
          </>
        }
      >
        {events?.map((event) => {
          const posterSrc = event.posterUrl || event.imageUrl;
          return (
          <Link
            key={event.id}
            href={`/events/${event.slug || event.id}`}
            className="relative shrink-0 w-56 h-80 snap-start rounded-2xl overflow-hidden bg-muted hover:shadow-md transition-shadow"
          >
            {posterSrc ? (
              <Image src={posterSrc} alt={event.title} fill className="object-cover" sizes="224px" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs font-bold">
                {event.type}
              </div>
            )}
            <div className="absolute inset-x-0 bottom-0 p-4 pt-10 bg-gradient-to-t from-black/85 via-black/40 to-transparent">
              <p className="text-[11px] font-bold text-white/90 flex items-center gap-1 mb-1">
                <MapPin className="w-3 h-3" />
                {event.location || "Online"}
              </p>
              <h3 className="text-sm font-bold text-white line-clamp-2">{event.title}</h3>
            </div>
          </Link>
          );
        })}
      </Row>

      <Row
        title="Internships"
        viewAllHref="/career?tab=internships"
        loading={internshipsLoading}
        isEmpty={internships.length === 0}
        emptyContent="No internships listed right now."
      >
        {internships.map((item) => (
          <OpportunityCard key={item.id} item={item} />
        ))}
      </Row>

      <Row
        title="Jobs"
        viewAllHref="/career"
        loading={jobsLoading}
        isEmpty={jobs.length === 0}
        emptyContent="No jobs listed right now."
      >
        {jobs.map((item) => (
          <OpportunityCard key={item.id} item={item} />
        ))}
      </Row>

      <Row
        title="Projects"
        viewAllHref="/projects"
        loading={projectsLoading}
        isEmpty={!projects || projects.length === 0}
        emptyContent="No projects to explore yet."
      >
        {projects?.map((project) => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </Row>

      <Row
        title="Resources"
        viewAllHref="/resources"
        loading={resourcesLoading}
        isEmpty={!resources || resources.length === 0}
        emptyContent="No resources published yet."
      >
        {resources?.map((resource) => (
          <ResourceCard key={resource.id} resource={resource} />
        ))}
      </Row>
    </div>
  );
}
