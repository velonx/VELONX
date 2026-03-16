"use client";

import { Card } from "@/components/ui/card";
import { Map } from "lucide-react";

export default function LearningPath() {
  // Placeholder for future learning path feature
  return (
    <section className="mb-12">
      <h3 className="text-2xl font-black text-foreground mb-6">Learning Path</h3>
      <Card className="bg-white border-0 rounded-[32px] p-12 text-center shadow-sm">
        <Map className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
        <h4 className="text-xl font-bold text-foreground mb-2">Your Learning Journey</h4>
        <p className="text-muted-foreground">
          Track your progress through structured learning paths
        </p>
      </Card>
    </section>
  );
}
