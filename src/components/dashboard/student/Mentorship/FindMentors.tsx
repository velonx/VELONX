"use client";

import { Button } from "@/components/ui/button";
import { Calendar, Plus, Users } from "lucide-react";
import { useRouter } from "next/navigation";

interface FindMentorsProps {
  sessionCount: number;
}

export default function FindMentors({ sessionCount }: FindMentorsProps) {
  const router = useRouter();

  return (
    <section className="mb-12">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-black text-[#023047] flex items-center gap-2">
            <Calendar className="w-6 h-6 text-[#219EBC]" />
            My Mentor Sessions
          </h2>
          <p className="text-gray-500 text-sm mt-1">
            View and manage your mentorship sessions
          </p>
        </div>
        <Button
          onClick={() => router.push('/mentors')}
          className="bg-[#219EBC] hover:bg-[#1a7a94] text-white font-bold rounded-xl"
        >
          <Plus className="w-4 h-4 mr-2" />
          Book New Session
        </Button>
      </div>
    </section>
  );
}
