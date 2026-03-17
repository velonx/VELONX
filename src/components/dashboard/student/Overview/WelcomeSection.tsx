"use client";

import { Search, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

interface WelcomeSectionProps {
  userName: string;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export default function WelcomeSection({ userName, searchQuery, onSearchChange }: WelcomeSectionProps) {
  const router = useRouter();

  return (
    <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-12">
      <div>
        <h1 className="text-xl md:text-2xl font-bold text-foreground mb-1">Hello, {userName}</h1>
        <p className="text-muted-foreground font-medium tracking-tight text-xs md:text-sm">
          Today is {new Date().toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </p>
      </div>
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
        <div className="relative group flex-1 sm:flex-initial">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-[#219EBC] transition-colors" />
          <input
            type="text"
            placeholder="Search projects..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="h-12 md:h-14 bg-white border border-gray-100 rounded-2xl pl-12 pr-6 w-full sm:w-64 shadow-sm focus:ring-2 focus:ring-[#219EBC] outline-none transition-all"
          />
        </div>
        <Button 
          onClick={() => router.push('/submit-project')}
          className="h-12 md:h-14 px-6 md:px-8 bg-[#023047] hover:bg-black text-white font-black rounded-2xl shadow-xl shadow-[#023047]/20 flex items-center justify-center gap-2 whitespace-nowrap"
        >
          <span className="hidden sm:inline">Add New Project</span>
          <span className="sm:hidden">Add Project</span>
          <Plus className="w-5 h-5" />
        </Button>
      </div>
    </header>
  );
}
