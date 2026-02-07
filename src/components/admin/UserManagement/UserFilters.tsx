"use client";

import { Search } from "lucide-react";

interface UserFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export default function UserFilters({ searchQuery, onSearchChange }: UserFiltersProps) {
  return (
    <div className="relative group">
      <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#219EBC] transition-colors" />
      <input
        type="text"
        placeholder="Search requests..."
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        className="h-12 bg-white border border-gray-100 rounded-xl pl-12 pr-6 w-48 shadow-sm focus:ring-2 focus:ring-[#219EBC] outline-none transition-all"
      />
    </div>
  );
}
