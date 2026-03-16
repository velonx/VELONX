"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, CheckCircle2, XCircle, Mail, Calendar, FileText, Loader2, Briefcase } from "lucide-react";

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
  // Parse application data if it's stored as JSON string
  const parseApplicationData = (application: MentorApplication) => {
    try {
      if (application.reason && application.reason.startsWith('{')) {
        return JSON.parse(application.reason);
      }
      return null;
    } catch {
      return null;
    }
  };

  return (
    <Card className="bg-background border-0 shadow-2xl shadow-black/[0.03] rounded-[48px] overflow-hidden">
      <CardHeader className="p-12 border-b border-border">
        <div className="flex items-center gap-3">
          <Users className="w-8 h-8 text-[#219EBC]" />
          <div>
            <CardTitle className="text-3xl font-bold text-foreground mb-1">
              Mentor Applications
            </CardTitle>
            <p className="text-muted-foreground">
              Review and approve mentor applications
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-12">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-[#219EBC]" />
          </div>
        ) : applications.length === 0 ? (
          <div className="text-center py-20">
            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-foreground mb-2">
              No pending applications
            </h3>
            <p className="text-muted-foreground">
              Mentor applications will appear here for review
            </p>
          </div>
        ) : (
          <div className="grid gap-6">
            {applications.map((application) => {
              const parsedData = parseApplicationData(application);
              const displayName = parsedData?.name || application.user?.name || 'Unknown User';
              const displayEmail = parsedData?.email || application.user?.email;
              
              return (
              <Card 
                key={application.id} 
                className="bg-muted/40 border-border rounded-2xl overflow-hidden hover:shadow-lg transition-shadow"
              >
                <CardContent className="p-6">
                  <div className="flex items-start gap-6">
                    {/* Avatar */}
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#219EBC] to-[#023047] flex items-center justify-center text-white font-bold text-xl flex-shrink-0">
                      {displayName[0]?.toUpperCase() || 'U'}
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      {/* Header */}
                      <div className="flex items-start justify-between gap-4 mb-4">
                        <div className="flex-1 min-w-0">
                          <h4 className="text-lg font-bold text-foreground mb-2">
                            {displayName}
                          </h4>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                            <Mail className="w-4 h-4 flex-shrink-0" />
                            <span className="truncate">{displayEmail}</span>
                          </div>
                          {parsedData?.company && (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Briefcase className="w-4 h-4 flex-shrink-0" />
                              <span className="truncate">{parsedData.company}</span>
                            </div>
                          )}
                        </div>
                        <Badge className="bg-orange-500/10 text-orange-600 border-orange-500/20 flex-shrink-0">
                          {application.status}
                        </Badge>
                      </div>
                      
                      {/* Expertise */}
                      {parsedData?.expertise && Array.isArray(parsedData.expertise) && parsedData.expertise.length > 0 && (
                        <div className="mb-4">
                          <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                            Expertise
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {parsedData.expertise.map((skill: string, idx: number) => (
                              <Badge key={idx} className="bg-[#219EBC]/10 text-[#219EBC] border-[#219EBC]/20 text-xs">
                                {skill}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {/* Bio */}
                      {parsedData?.bio && (
                        <div className="mb-4">
                          <div className="flex items-center gap-2 text-sm font-bold text-foreground mb-2">
                            <FileText className="w-4 h-4" />
                            Why they want to be a mentor
                          </div>
                          <div className="bg-background border border-border rounded-xl p-4">
                            <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                              {parsedData.bio}
                            </p>
                          </div>
                        </div>
                      )}
                      
                      {/* Experience */}
                      {parsedData?.yearsOfExperience && (
                        <div className="mb-4">
                          <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                            Years of Experience
                          </div>
                          <div className="text-sm font-bold text-foreground">
                            {parsedData.yearsOfExperience} years
                          </div>
                        </div>
                      )}
                      
                      {/* Footer */}
                      <div className="flex items-center justify-between gap-4 pt-4 border-t border-border">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Calendar className="w-4 h-4" />
                          <span>
                            Applied on {new Date(application.createdAt).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </span>
                        </div>
                        
                        <div className="flex gap-2">
                          <Button
                            onClick={() => onApprove(application.id, application.userId, displayName)}
                            size="sm"
                            className="bg-green-500 hover:bg-green-600 text-white rounded-xl"
                          >
                            <CheckCircle2 className="w-4 h-4 mr-2" />
                            Approve
                          </Button>
                          <Button
                            onClick={() => onReject(application.id, displayName)}
                            size="sm"
                            variant="outline"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50 rounded-xl border-red-200"
                          >
                            <XCircle className="w-4 h-4 mr-2" />
                            Reject
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )})}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
