"use client";

import React from "react";
import { FloatingNav } from "@/components/ui/floating-navbar";
import { useSession } from "next-auth/react";
import Link from "next/link";
import {
  Home,
  Calendar,
  FolderKanban,
  BookOpen,
  Users,
  Briefcase,
  Trophy,
  User,
  LogIn,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

export default function FloatingNavbarDemo() {
  const { data: session } = useSession();

  const navItems = [
    {
      name: "Home",
      link: "/",
      icon: <Home className="h-4 w-4" />,
    },
    {
      name: "Events",
      link: "/events",
      icon: <Calendar className="h-4 w-4" />,
    },
    {
      name: "Projects",
      link: "/projects",
      icon: <FolderKanban className="h-4 w-4" />,
    },
    {
      name: "Resources",
      link: "/resources",
      icon: <BookOpen className="h-4 w-4" />,
    },
    {
      name: "Mentors",
      link: "/mentors",
      icon: <Users className="h-4 w-4" />,
    },
    {
      name: "Career",
      link: "/career",
      icon: <Briefcase className="h-4 w-4" />,
    },
    {
      name: "Leaderboard",
      link: "/leaderboard",
      icon: <Trophy className="h-4 w-4" />,
    },
  ];

  // Right side content based on auth state
  const rightContent = session?.user ? (
    <Link
      href={
        session.user.role === "ADMIN"
          ? "/dashboard/admin"
          : "/dashboard/student"
      }
      className="flex items-center gap-2 px-3 py-1.5 rounded-full hover:bg-blue-50/50 transition-all"
    >
      <Avatar className="w-7 h-7 border-2 border-[#219EBC]">
        <AvatarImage src={session.user.image || ""} />
        <AvatarFallback className="bg-gradient-to-br from-[#219EBC] to-[#E9C46A] text-white text-xs">
          {session.user.name?.charAt(0) || "U"}
        </AvatarFallback>
      </Avatar>
      <span className="hidden md:block text-sm font-medium text-gray-700">
        {session.user.name?.split(" ")[0]}
      </span>
    </Link>
  ) : (
    <Link href="/auth/login">
      <Button
        size="sm"
        className="bg-gradient-to-r from-[#219EBC] to-[#4FC3F7] hover:brightness-110 text-white rounded-full px-5 py-2 text-sm font-semibold shadow-md transition-all"
      >
        <LogIn className="h-4 w-4 mr-1.5" />
        <span className="hidden sm:inline">Login</span>
      </Button>
    </Link>
  );

  return (
    <div className="relative w-full">
      <FloatingNav navItems={navItems} rightContent={rightContent} />
      <DummyContent />
    </div>
  );
}

const DummyContent = () => {
  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-white via-blue-50/30 to-white relative">
      {/* Hero Section */}
      <div className="container mx-auto px-6 pt-32 pb-20">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-bold mb-6">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#219EBC] via-[#4FC3F7] to-[#E9C46A]">
              Scroll Down
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 mb-8">
            Watch the floating navbar appear as you scroll
          </p>
          <div className="inline-flex items-center gap-2 text-gray-500 animate-bounce">
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 14l-7 7m0 0l-7-7m7 7V3"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* Content Sections */}
      {[1, 2, 3, 4].map((section) => (
        <div
          key={section}
          className="container mx-auto px-6 py-20 border-t border-gray-100"
        >
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Section {section}
            </h2>
            <p className="text-gray-600 leading-relaxed mb-6">
              This is demo content to showcase the floating navbar behavior.
              Keep scrolling to see how the navbar appears when you scroll up
              and disappears when you scroll down. The navbar will only appear
              after you've scrolled past 5% of the page.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-6 bg-white rounded-2xl border border-gray-200 shadow-sm">
                <h3 className="font-semibold text-gray-900 mb-2">
                  Feature {section}.1
                </h3>
                <p className="text-sm text-gray-600">
                  Responsive design that works on all devices
                </p>
              </div>
              <div className="p-6 bg-white rounded-2xl border border-gray-200 shadow-sm">
                <h3 className="font-semibold text-gray-900 mb-2">
                  Feature {section}.2
                </h3>
                <p className="text-sm text-gray-600">
                  Smooth animations powered by Framer Motion
                </p>
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Scroll Back Up Section */}
      <div className="container mx-auto px-6 py-32 text-center">
        <h2 className="text-4xl font-bold text-gray-900 mb-4">
          Scroll Back Up
        </h2>
        <p className="text-xl text-gray-600 mb-8">
          The navbar will reveal itself as you scroll upward
        </p>
        <div className="inline-flex items-center gap-2 text-gray-500 animate-bounce">
          <svg
            className="w-6 h-6 rotate-180"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 14l-7 7m0 0l-7-7m7 7V3"
            />
          </svg>
        </div>
      </div>

      {/* Grid Background Effect */}
      <div className="fixed inset-0 -z-10 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
    </div>
  );
};
