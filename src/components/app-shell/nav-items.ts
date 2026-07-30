import {
  Home,
  LayoutDashboard,
  GraduationCap,
  Briefcase,
  Building2,
  Code2,
  Trophy,
  BookOpen,
  Newspaper,
  UsersRound,
  Share2,
  BarChart3,
  Gift,
  Settings,
  type LucideIcon,
} from "lucide-react";

export interface AppNavItem {
  label: string;
  href: string;
  /** Used to match the active route; defaults to `href` when omitted. */
  matchPrefix?: string;
  icon: LucideIcon;
}

export const APP_NAV_ITEMS: AppNavItem[] = [
  { label: "Home", href: "/home", icon: Home },
  { label: "Mentorship", href: "/mentors", icon: GraduationCap },
  { label: "Internships", href: "/career?tab=internships", matchPrefix: "/career", icon: Briefcase },
  { label: "Jobs", href: "/career", matchPrefix: "/career", icon: Building2 },
  { label: "Projects", href: "/projects", icon: Code2 },
  { label: "Hackathons", href: "/events", icon: Trophy },
  { label: "Resources", href: "/resources", icon: BookOpen },
  { label: "Blog", href: "/blog", matchPrefix: "/blog", icon: Newspaper },
  { label: "Community", href: "/community", icon: UsersRound },
  { label: "Network", href: "/network", icon: Share2 },
  { label: "Leaderboard", href: "/leaderboard", icon: BarChart3 },
  { label: "Swag", href: "/swag", icon: Gift },
  { label: "Settings", href: "/settings", icon: Settings },
  { label: "Dashboard", href: "/dashboard/student", icon: LayoutDashboard },
];

/** Route prefixes that render the persistent app shell (sidebar + top bar) for authenticated users. */
export const APP_SHELL_ROUTE_PREFIXES = [
  "/home",
  "/dashboard/student",
  "/career",
  "/events",
  "/projects",
  "/mentors",
  "/resources",
  "/blog",
  "/community",
  "/network",
  "/leaderboard",
  "/settings",
  "/messages",
  "/notifications",
  "/referrals",
  "/submit-project",
  "/apply-mentor",
  "/swag",
];

export function isAppShellRoute(pathname: string): boolean {
  if (pathname.startsWith("/dashboard/admin")) return false;
  return APP_SHELL_ROUTE_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
}
