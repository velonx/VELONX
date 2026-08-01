"use client";

import ProjectJoinRequests from "@/components/dashboard/ProjectJoinRequests";

interface JoinRequestsProps {
  userId: string;
}

export default function JoinRequests({ userId }: JoinRequestsProps) {
  return (
    <section id="join-requests" className="mb-12 scroll-mt-24">
      <ProjectJoinRequests userId={userId} />
    </section>
  );
}
