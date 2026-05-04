"use client";

import { FloatingNav } from "@/components/ui/floating-navbar";
import { useSession } from "next-auth/react";
import Link from "next/link";
import {
  IconCalendar,
  IconFolder,
  IconBook,
  IconUsers,
  IconBriefcase,
  IconNews,
  IconTrophy,
  IconShoppingBag,
  IconLayoutDashboard,
} from "@tabler/icons-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

export default function FloatingNavDemo() {
  const { data: session } = useSession();

  // Get dashboard link based on user role
  const dashboardLink = session?.user?.role === "ADMIN"
    ? "/dashboard/admin"
    : "/dashboard/student";

  const navItems = [
    ...(session?.user ? [{
      name: "Dashboard",
      link: dashboardLink,
      icon: <IconLayoutDashboard className="h-4 w-4 text-[#219EBC]" />,
    }] : []),
    {
      name: "Events",
      link: "/events",
      icon: <IconCalendar className="h-4 w-4 text-muted-foreground" />,
    },
    {
      name: "Projects",
      link: "/projects",
      icon: <IconFolder className="h-4 w-4 text-muted-foreground" />,
    },
    {
      name: "Resources",
      link: "/resources",
      icon: <IconBook className="h-4 w-4 text-muted-foreground" />,
    },
    {
      name: "Mentors",
      link: "/mentors",
      icon: <IconUsers className="h-4 w-4 text-muted-foreground" />,
    },
    {
      name: "Career",
      link: "/career",
      icon: <IconBriefcase className="h-4 w-4 text-muted-foreground" />,
    },
    {
      name: "Blog",
      link: "/blog",
      icon: <IconNews className="h-4 w-4 text-muted-foreground" />,
    },
    {
      name: "Leaderboard",
      link: "/leaderboard",
      icon: <IconTrophy className="h-4 w-4 text-muted-foreground" />,
    },
    {
      name: "Swag",
      link: "/swag",
      icon: <IconShoppingBag className="h-4 w-4 text-muted-foreground" />,
    },
    {
      name: "Community",
      link: "/community",
      icon: <IconUsers className="h-4 w-4 text-muted-foreground" />,
    },
  ];

  // Desktop right side content based on auth state
  const rightContent = session?.user ? (
    <Link
      href={dashboardLink}
      className="flex items-center gap-2 px-2 py-1.5 rounded-full hover:bg-muted transition-all"
    >
      <Avatar className="w-8 h-8 border-2 border-[#219EBC] shrink-0">
        <AvatarImage src={session.user.image || ""} />
        <AvatarFallback className="bg-gradient-to-br from-[#219EBC] to-[#E9C46A] text-white text-xs font-bold">
          {session.user.name?.charAt(0) || "U"}
        </AvatarFallback>
      </Avatar>
      <span className="text-sm font-semibold text-foreground">
        {session.user.name?.split(" ")[0]}
      </span>
    </Link>
  ) : (
    <div className="flex items-center gap-2">
      <Link href="/auth/login">
        <button className="text-foreground border border-border hover:bg-muted font-semibold text-xs rounded-full px-4 py-2 transition-all whitespace-nowrap">
          Log In
        </button>
      </Link>
      <Link href="/auth/signup">
        <button className="bg-gradient-to-r from-[#FF6B6B] to-[#FF8E53] hover:brightness-110 text-white font-semibold text-xs rounded-full px-4 py-2 transition-all shadow-md whitespace-nowrap">
          Join Now
        </button>
      </Link>
    </div>
  );

  // Mobile avatar to show in navbar header (outside menu, like regular navbar)
  const mobileAvatar = session?.user ? (
    <Link href={dashboardLink} aria-label="Go to dashboard">
      <Avatar className="w-8 h-8 border-2 border-[#219EBC]">
        <AvatarImage src={session.user.image || ""} />
        <AvatarFallback className="bg-[#219EBC] text-white text-xs">
          {session.user.name?.[0]}
        </AvatarFallback>
      </Avatar>
    </Link>
  ) : null;

  // Mobile right side content (for Sheet drawer)
  const mobileRightContent = session?.user ? (
    <Link href={dashboardLink} className="w-full">
      <button className="w-full bg-[#219EBC] hover:bg-[#1a7a94] text-white rounded-2xl py-6 font-bold uppercase tracking-widest text-xs shadow-lg shadow-[#219EBC]/20">
        My Dashboard
      </button>
    </Link>
  ) : (
    <div className="space-y-3">
      <Link href="/auth/login">
        <button className="w-full bg-gray-900 hover:bg-black text-white rounded-2xl py-6 font-bold uppercase tracking-widest text-xs">
          Login
        </button>
      </Link>
      <Link href="/auth/signup">
        <button className="w-full bg-[#219EBC] hover:bg-[#1a7a94] text-white rounded-2xl py-6 font-bold uppercase tracking-widest text-xs shadow-lg shadow-[#219EBC]/20">
          Join Community
        </button>
      </Link>
    </div>
  );

  return (
    <FloatingNav
      navItems={navItems}
      rightContent={rightContent}
      mobileRightContent={mobileRightContent}
      mobileAvatar={mobileAvatar}
    />
  );
}
