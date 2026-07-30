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

  const formattedDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-8">
      <div>
        <h1 className="heading-section text-2xl md:text-3xl mb-1 flex items-center gap-2">
          Hello, {userName}! <span className="inline-block animate-bounce">👋</span>
        </h1>
        <p className="text-muted-foreground font-medium text-xs md:text-sm">
          Today is {formattedDate}
        </p>
      </div>
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
        <div className="relative group flex-1 sm:flex-initial">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-[#FF5D17] transition-colors w-4 h-4" />
          <input
            type="text"
            placeholder="Search projects..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="h-11 md:h-12 bg-white dark:bg-card border border-gray-100 dark:border-border rounded-2xl pl-11 pr-5 w-full sm:w-64 shadow-xs focus:ring-2 focus:ring-[#FF5D17] outline-none transition-all text-sm font-medium text-foreground"
          />
        </div>
        <Button 
          onClick={() => router.push('/submit-project')}
          className="h-11 md:h-12 px-6 bg-[#FF5D17] hover:bg-[#FF4500] text-white font-extrabold rounded-2xl shadow-lg shadow-[#FF5D17]/25 flex items-center justify-center gap-2 whitespace-nowrap transition-all hover:scale-[1.02] active:scale-98 cursor-pointer border-0"
        >
          <Plus className="w-5 h-5" />
          <span className="inline">Add New Project</span>
        </Button>
      </div>
    </header>
  );
}
