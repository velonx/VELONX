"use client";

import { adminApi } from "@/lib/api/client";
import toast from "react-hot-toast";

interface UserActionsProps {
  onRefetch: () => void;
}

export function useUserActions({ onRefetch }: UserActionsProps) {
  const handleRequestAction = async (id: string, name: string, action: 'approve' | 'reject') => {
    try {
      if (action === 'approve') {
        await adminApi.approveRequest(id);
      } else {
        await adminApi.rejectRequest(id, 'Rejected by admin');
      }
      toast.success(`User "${name}" ${action === 'approve' ? 'approved' : 'rejected'} successfully.`);
      onRefetch();
    } catch (error) {
      toast.error(`Failed to ${action} user request`);
    }
  };

  return { handleRequestAction };
}
