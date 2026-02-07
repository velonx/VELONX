"use client";

import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle } from "lucide-react";

interface User {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
}

interface UserRequest {
  id: string;
  user?: User;
  status: string;
}

interface UserListProps {
  userRequests: UserRequest[];
  onApprove: (id: string, name: string) => void;
  onReject: (id: string, name: string) => void;
}

export default function UserList({ userRequests, onApprove, onReject }: UserListProps) {
  return (
    <div className="bg-white rounded-[40px] border border-gray-50 shadow-xl shadow-black/[0.02] overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-gray-50/50 border-b border-gray-50">
              <th className="px-8 py-5 text-xs font-black text-gray-400 uppercase tracking-widest">Member</th>
              <th className="px-8 py-5 text-xs font-black text-gray-400 uppercase tracking-widest text-center">Status</th>
              <th className="px-8 py-5 text-xs font-black text-gray-400 uppercase tracking-widest text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {userRequests && userRequests.length > 0 ? (
              userRequests.map((r) => (
                <tr key={r.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center font-black text-[#219EBC]">
                        {r.user?.name?.[0] || 'U'}
                      </div>
                      <div>
                        <p className="font-bold text-[#023047]">{r.user?.name || 'Unknown'}</p>
                        <p className="text-xs text-gray-400">{r.user?.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-center">
                    <Badge className="bg-orange-50 text-orange-600 border-0 font-bold px-3 py-1 text-[10px]">
                      {r.status}
                    </Badge>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => onApprove(r.id, r.user?.name || 'User')} 
                        className="w-10 h-10 rounded-xl bg-green-50 hover:bg-green-100 text-green-600 flex items-center justify-center transition-all"
                      >
                        <CheckCircle2 className="w-5 h-5" />
                      </button>
                      <button 
                        onClick={() => onReject(r.id, r.user?.name || 'User')} 
                        className="w-10 h-10 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 flex items-center justify-center transition-all"
                      >
                        <XCircle className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={3} className="px-8 py-12 text-center text-gray-400">
                  No pending requests
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
