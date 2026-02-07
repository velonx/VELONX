"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, CheckCircle2, XCircle, Mail } from "lucide-react";

interface MentorApplication {
  id: string;
  userId: string;
  status: string;
  reason?: string;
  createdAt: string;
  user?: {
    name?: string;
    email: string;
  };
}

interface MentorApplicationsProps {
  applications: MentorApplication[];
  loading: boolean;
  onApprove: (requestId: string, userId: string, userName: string) => void;
  onReject: (requestId: string, userName: string) => void;
}

export default function MentorApplications({ 
  applications, 
  loading, 
  onApprove, 
  onReject 
}: MentorApplicationsProps) {
  return (
    <Card className="bg-white border-0 shadow-2xl shadow-black/[0.03] rounded-[48px] overflow-hidden">
      <CardHeader className="p-12 border-b border-gray-50">
        <h3 className="text-3xl font-black text-[#023047] mb-2">Mentor Applications</h3>
        <p className="text-gray-400">Review and approve mentor applications</p>
      </CardHeader>
      <CardContent className="p-12">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#219EBC] mx-auto mb-4"></div>
            <p className="text-gray-600">Loading applications...</p>
          </div>
        ) : applications.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-400 text-lg font-bold">No pending applications</p>
            <p className="text-gray-400 text-sm mt-2">Mentor applications will appear here</p>
          </div>
        ) : (
          <div className="space-y-4">
            {applications.map((application) => (
              <div 
                key={application.id} 
                className="bg-gray-50 rounded-2xl p-6 hover:bg-gray-100 transition-all"
              >
                <div className="flex items-start gap-6">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#219EBC] to-[#023047] flex items-center justify-center text-white font-black text-2xl shadow-lg">
                    {application.user?.name?.[0] || 'U'}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="text-lg font-bold text-[#023047] mb-1">{application.user?.name || 'Unknown'}</h4>
                        <p className="text-sm text-gray-500 flex items-center gap-2">
                          <Mail className="w-4 h-4" />
                          {application.user?.email}
                        </p>
                      </div>
                      <Badge className="bg-orange-50 text-orange-600 border-0 font-bold">
                        {application.status}
                      </Badge>
                    </div>
                    {application.reason && (
                      <p className="text-sm text-gray-600 mt-3 p-4 bg-white rounded-xl">
                        {application.reason}
                      </p>
                    )}
                    <div className="flex items-center gap-4 mt-4">
                      <span className="text-xs text-gray-400">
                        Applied: {new Date(application.createdAt).toLocaleDateString()}
                      </span>
                      <div className="ml-auto flex gap-2">
                        <button
                          onClick={() => onApprove(application.id, application.userId, application.user?.name || 'User')}
                          className="px-6 h-10 rounded-xl bg-green-50 hover:bg-green-100 text-green-600 flex items-center gap-2 transition-all font-bold"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          Approve
                        </button>
                        <button
                          onClick={() => onReject(application.id, application.user?.name || 'User')}
                          className="px-6 h-10 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 flex items-center gap-2 transition-all font-bold"
                        >
                          <XCircle className="w-4 h-4" />
                          Reject
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
