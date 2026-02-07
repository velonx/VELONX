"use client";

import { Users } from "lucide-react";
import UserList from "./UserList";
import { useUserActions } from "./UserActions";

interface UserRequest {
  id: string;
  user?: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
  };
  status: string;
}

interface UserManagementProps {
  userRequests: UserRequest[];
  onRefetch: () => void;
}

export default function UserManagement({ userRequests, onRefetch }: UserManagementProps) {
  const { handleRequestAction } = useUserActions({ onRefetch });

  return (
    <section>
      <h3 className="text-xl font-black text-[#023047] mb-6 flex items-center gap-2">
        <Users className="w-5 h-5 text-[#219EBC]" /> Pending Approvals
      </h3>
      <UserList
        userRequests={userRequests}
        onApprove={(id, name) => handleRequestAction(id, name, 'approve')}
        onReject={(id, name) => handleRequestAction(id, name, 'reject')}
      />
    </section>
  );
}
