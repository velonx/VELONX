/**
 * Shared mock job data for both server-side rendering and client-side hydration.
 * 
 * These are showcase listings used to demonstrate the career platform.
 * They are imported by both the server component (page.tsx) for SSR
 * and the client component (CareerDetailClient.tsx) for interactivity.
 */

export interface MockJob {
  id: string;
  type: "INTERNSHIP" | "JOB";
  title: string;
  company: string;
  imageUrl: string | null;
  logoText: string;
  logoColor: string;
  salary: string;
  location: string;
  duration: string;
  exp: string;
  badge: string;
  badgeClass: string;
  stack: string[];
  about: string;
  description: string;
  responsibilities: string[];
  requirements: string[];
  applyUrl: string;
  status: "ACTIVE" | "CLOSED";
  deadline: string | null;
  /** Short description for meta tags */
  metaDesc: string;
  /** ISO date string for schema.org datePosted */
  datePosted: string;
  /** ISO date string for schema.org validThrough */
  validThrough: string;
}

export const MOCK_JOBS: Record<string, MockJob> = {};

/** Common tech keywords for auto-detecting tech stack from job descriptions */
export const COMMON_TECH = [
  'React', 'Next.js', 'TypeScript', 'JavaScript', 'HTML', 'CSS', 'Tailwind',
  'Node.js', 'Express', 'Go', 'Golang', 'Python', 'PyTorch', 'TensorFlow', 'LLMs',
  'Kotlin', 'Android', 'Java', 'Swift', 'iOS', 'Flutter', 'React Native',
  'PostgreSQL', 'MongoDB', 'SQL', 'Docker', 'Kubernetes', 'AWS', 'CI/CD',
  'Figma', 'UI/UX', 'Design Systems', 'Machine Learning', 'Deep Learning',
  'Git', 'GitHub', 'Web Performance', 'LCP', 'Vite'
];

export const PRECOMPILED_TECH_REGEXES = COMMON_TECH.map(tech => {
  const escaped = tech.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
  return { tech, regex: new RegExp(`\\b${escaped}\\b`, 'i') };
});

/** Extract tech stack tags from a job object */
export function getTechStack(job: any): string[] {
  if (job.stack && job.stack.length > 0) return job.stack;
  
  const tags = new Set<string>();
  const searchStr = `${job.title} ${job.about || job.description || ""} ${(job.requirements || []).join(' ')}`.toLowerCase();
  
  for (const { tech, regex } of PRECOMPILED_TECH_REGEXES) {
    if (regex.test(searchStr)) {
      tags.add(tech);
    }
  }
  
  if (searchStr.includes('next.js') || searchStr.includes('nextjs')) tags.add('Next.js');
  if (searchStr.includes('node.js') || searchStr.includes('nodejs')) tags.add('Node.js');
  
  const result = Array.from(tags);
  return result.length > 0 ? result.slice(0, 6) : ['Developer', 'Engineering'];
}

/** Determine if a job/opportunity is currently open for applications */
export function isJobOpen(job: { status?: string; deadline?: string | null }): boolean {
  if (job.status === 'CLOSED') return false;
  if (job.deadline && new Date(job.deadline) < new Date()) return false;
  return job.status === 'ACTIVE';
}
