"use client";

import { Card } from "@/components/ui/card";

interface UserMetricsProps {
  totalUsers?: number;
}

export default function UserMetrics({ totalUsers = 0 }: UserMetricsProps) {
  return (
    <Card className="bg-white border-0 rounded-[32px] p-8 shadow-sm border border-gray-50">
      <div className="text-center">
        <p className="text-4xl font-black text-[#023047] mb-2">{totalUsers}</p>
        <p className="text-gray-400 text-sm font-bold">Total Users</p>
      </div>
    </Card>
  );
}
