"use client";

import { Card } from "@/components/ui/card";

interface EngagementMetricsProps {
  totalProjects?: number;
  totalEvents?: number;
}

export default function EngagementMetrics({ 
  totalProjects = 0, 
  totalEvents = 0 
}: EngagementMetricsProps) {
  return (
    <>
      <Card className="bg-white border-0 rounded-[32px] p-8 shadow-sm border border-gray-50">
        <div className="text-center">
          <p className="text-4xl font-black text-[#023047] mb-2">{totalProjects}</p>
          <p className="text-gray-400 text-sm font-bold">Total Projects</p>
        </div>
      </Card>
      <Card className="bg-white border-0 rounded-[32px] p-8 shadow-sm border border-gray-50">
        <div className="text-center">
          <p className="text-4xl font-black text-[#023047] mb-2">{totalEvents}</p>
          <p className="text-gray-400 text-sm font-bold">Total Events</p>
        </div>
      </Card>
    </>
  );
}
