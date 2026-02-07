"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Star } from "lucide-react";

export default function MentorReviews() {
  return (
    <Card className="bg-white border-0 shadow-2xl shadow-black/[0.03] rounded-[48px] overflow-hidden">
      <CardHeader className="p-12 border-b border-gray-50">
        <h3 className="text-3xl font-black text-[#023047] mb-2">Mentor Reviews</h3>
        <p className="text-gray-400">View and moderate mentor reviews</p>
      </CardHeader>
      <CardContent className="p-12">
        <div className="text-center py-12">
          <Star className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-400 text-lg font-bold">Review Management</p>
          <p className="text-gray-400 text-sm mt-2">Mentor reviews will be available here</p>
        </div>
      </CardContent>
    </Card>
  );
}
