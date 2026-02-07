"use client";

import ProjectJoinRequests from "@/components/dashboard/ProjectJoinRequests";

interface JoinRequestsProps {
  userId: string;
}

export default function JoinRequests({ userId }: JoinRequestsProps) {
  return (
    <section className="mb-12">
      <ProjectJoinRequests userId={userId} />
    </section>
  );
}
