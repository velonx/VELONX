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
    <header className="flex items-center justify-between mb-12">
      <div>
        <h1 className="text-3xl font-black text-[#023047] mb-2">Hello, {userName}</h1>
        <p className="text-gray-400 font-medium tracking-tight">
          Today is {new Date().toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </p>
      </div>
      <div className="flex items-center gap-4">
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#219EBC] transition-colors" />
          <input
            type="text"
            placeholder="Search projects..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="h-14 bg-white border border-gray-100 rounded-2xl pl-12 pr-6 w-64 shadow-sm focus:ring-2 focus:ring-[#219EBC] outline-none transition-all"
          />
        </div>
        <Button 
          onClick={() => router.push('/submit-project')}
          className="h-14 px-8 bg-[#023047] hover:bg-black text-white font-black rounded-2xl shadow-xl shadow-[#023047]/20 flex items-center gap-2"
        >
          Add New Project <Plus className="w-5 h-5" />
        </Button>
      </div>
    </header>
  );
}
