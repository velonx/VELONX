"use client";

import { Card } from "@/components/ui/card";
import { Sparkles } from "lucide-react";

export default function RecommendedCourses() {
  // Placeholder for future course recommendation feature
  return (
    <section className="mb-12">
      <h3 className="text-2xl font-black text-[#023047] mb-6">Recommended for You</h3>
      <Card className="bg-white border-0 rounded-[32px] p-12 text-center shadow-sm">
        <Sparkles className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h4 className="text-xl font-bold text-gray-900 mb-2">Personalized Recommendations</h4>
        <p className="text-gray-500">
          Course recommendations will appear here based on your interests
        </p>
      </Card>
    </section>
  );
}
