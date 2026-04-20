"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Flag,
  ChevronDown,
  ChevronUp,
  Image as ImageIcon,
  Video,
  Filter,
  RefreshCw,
  CheckCircle2,
  Clock,
  XCircle,
  AlertCircle,
  Loader2,
  User,
} from "lucide-react";

/* ─── Types ─────────────────────────────────────── */
type ReportStatus = "OPEN" | "IN_REVIEW" | "RESOLVED" | "DISMISSED";
type ReportCategory =
  | "BUG"
  | "CONTENT_VIOLATION"
  | "HARASSMENT"
  | "SPAM"
  | "TECHNICAL_ISSUE"
  | "FEATURE_REQUEST"
  | "OTHER";

interface Report {
  id: string;
  category: ReportCategory;
  title: string;
  description: string;
  status: ReportStatus;
  photoUrls: string[];
  videoUrls: string[];
  adminNotes?: string;
  createdAt: string;
  resolvedAt?: string;
  user: { id: string; name: string; email: string; image?: string };
}

/* ─── Config ─────────────────────────────────────── */
const STATUS_CONFIG: Record<
  ReportStatus,
  { label: string; icon: React.ElementType; color: string; bg: string }
> = {
  OPEN: { label: "Open", icon: AlertCircle, color: "text-blue-600", bg: "bg-blue-100 dark:bg-blue-900/30" },
  IN_REVIEW: { label: "In Review", icon: Clock, color: "text-yellow-600", bg: "bg-yellow-100 dark:bg-yellow-900/30" },
  RESOLVED: { label: "Resolved", icon: CheckCircle2, color: "text-green-600", bg: "bg-green-100 dark:bg-green-900/30" },
  DISMISSED: { label: "Dismissed", icon: XCircle, color: "text-gray-500", bg: "bg-gray-100 dark:bg-gray-800" },
};

const CATEGORY_LABELS: Record<ReportCategory, string> = {
  BUG: "Bug Report",
  CONTENT_VIOLATION: "Content Violation",
  HARASSMENT: "Harassment",
  SPAM: "Spam",
  TECHNICAL_ISSUE: "Technical Issue",
  FEATURE_REQUEST: "Feature Request",
  OTHER: "Other",
};

/* ─── Component ──────────────────────────────────── */
export function ReportsAdmin() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState<ReportStatus | "ALL">("ALL");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);
  const [notesMap, setNotesMap] = useState<Record<string, string>>({});

  const fetchReports = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/reports?pageSize=50");
      const data = await res.json();
      if (!data.success) throw new Error(data.error?.message);
      setReports(data.data);
      const initialNotes: Record<string, string> = {};
      for (const r of data.data as Report[]) {
        initialNotes[r.id] = r.adminNotes || "";
      }
      setNotesMap(initialNotes);
    } catch (e: any) {
      setError(e.message || "Failed to load reports");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const updateReport = async (
    id: string,
    status?: ReportStatus,
    adminNotes?: string
  ) => {
    setUpdating(id);
    try {
      const { getCSRFToken } = await import("@/lib/utils/csrf");
      const csrfToken = await getCSRFToken();
      const res = await fetch(`/api/reports/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-csrf-token": csrfToken,
        },
        body: JSON.stringify({ status, adminNotes }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error?.message);
      setReports((prev) =>
        prev.map((r) => (r.id === id ? { ...r, ...data.data } : r))
      );
    } catch (e: any) {
      alert(e.message || "Failed to update report");
    } finally {
      setUpdating(null);
    }
  };

  const filtered =
    statusFilter === "ALL"
      ? reports
      : reports.filter((r) => r.status === statusFilter);

  const counts = {
    ALL: reports.length,
    OPEN: reports.filter((r) => r.status === "OPEN").length,
    IN_REVIEW: reports.filter((r) => r.status === "IN_REVIEW").length,
    RESOLVED: reports.filter((r) => r.status === "RESOLVED").length,
    DISMISSED: reports.filter((r) => r.status === "DISMISSED").length,
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-2xl flex items-center justify-center">
            <Flag className="w-6 h-6 text-red-500" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-foreground">Reports</h2>
            <p className="text-muted-foreground text-sm">
              {reports.length} total report{reports.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={fetchReports}
          className="rounded-xl gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </Button>
      </div>

      {/* Status filter tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {(["ALL", "OPEN", "IN_REVIEW", "RESOLVED", "DISMISSED"] as const).map(
          (s) => {
            const config = s !== "ALL" ? STATUS_CONFIG[s] : null;
            return (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                  statusFilter === s
                    ? "bg-[#219EBC] text-white shadow-md shadow-[#219EBC]/30"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                {config && <config.icon className="w-4 h-4" />}
                {s === "ALL" ? "All" : STATUS_CONFIG[s].label}
                <span
                  className={`px-2 py-0.5 rounded-full text-xs font-black ${
                    statusFilter === s
                      ? "bg-white/20"
                      : "bg-background text-foreground"
                  }`}
                >
                  {counts[s]}
                </span>
              </button>
            );
          }
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-4 text-red-600 dark:text-red-400 text-sm mb-6">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-10 h-10 animate-spin text-[#219EBC]" />
        </div>
      )}

      {/* Empty */}
      {!loading && !error && filtered.length === 0 && (
        <Card className="border-0 rounded-[24px] p-12 text-center bg-muted/50">
          <Flag className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-foreground font-bold">No reports found</p>
          <p className="text-muted-foreground text-sm mt-1">
            {statusFilter !== "ALL"
              ? "No reports match this filter."
              : "No reports have been submitted yet."}
          </p>
        </Card>
      )}

      {/* Report list */}
      {!loading && (
        <div className="space-y-4">
          {filtered.map((report) => {
            const isExpanded = expandedId === report.id;
            const statusInfo = STATUS_CONFIG[report.status];
            const StatusIcon = statusInfo.icon;

            return (
              <Card
                key={report.id}
                className="border border-border rounded-[24px] overflow-hidden bg-card"
              >
                {/* Row header */}
                <button
                  className="w-full text-left p-6 flex items-start gap-4 hover:bg-muted/30 transition-colors"
                  onClick={() => setExpandedId(isExpanded ? null : report.id)}
                >
                  {/* Status dot */}
                  <div
                    className={`mt-1 w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${statusInfo.bg}`}
                  >
                    <StatusIcon className={`w-4 h-4 ${statusInfo.color}`} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="text-xs font-bold px-2 py-0.5 bg-muted rounded-full text-muted-foreground">
                        {CATEGORY_LABELS[report.category]}
                      </span>
                      <span
                        className={`text-xs font-bold px-2 py-0.5 rounded-full ${statusInfo.bg} ${statusInfo.color}`}
                      >
                        {statusInfo.label}
                      </span>
                      {report.photoUrls.length > 0 && (
                        <span className="text-xs flex items-center gap-1 text-muted-foreground">
                          <ImageIcon className="w-3 h-3" />
                          {report.photoUrls.length}
                        </span>
                      )}
                      {report.videoUrls.length > 0 && (
                        <span className="text-xs flex items-center gap-1 text-muted-foreground">
                          <Video className="w-3 h-3" />
                          {report.videoUrls.length}
                        </span>
                      )}
                    </div>
                    <p className="font-black text-foreground truncate">{report.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <User className="w-3 h-3 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">
                        {report.user.name || report.user.email}
                      </span>
                      <span className="text-xs text-muted-foreground">·</span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(report.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4 text-muted-foreground shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
                  )}
                </button>

                {/* Expanded content */}
                {isExpanded && (
                  <div className="px-6 pb-6 border-t border-border pt-4 space-y-5">
                    {/* Description */}
                    <div>
                      <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                        Description
                      </p>
                      <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                        {report.description}
                      </p>
                    </div>

                    {/* Photos */}
                    {report.photoUrls.length > 0 && (
                      <div>
                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1">
                          <ImageIcon className="w-3 h-3" />
                          Photos ({report.photoUrls.length})
                        </p>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                          {report.photoUrls.map((url, i) => (
                            <a
                              key={i}
                              href={url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="rounded-xl overflow-hidden border border-border hover:opacity-80 transition-opacity aspect-video block"
                            >
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={url}
                                alt={`Attachment ${i + 1}`}
                                className="w-full h-full object-cover"
                              />
                            </a>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Videos */}
                    {report.videoUrls.length > 0 && (
                      <div>
                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1">
                          <Video className="w-3 h-3" />
                          Videos ({report.videoUrls.length})
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {report.videoUrls.map((url, i) => (
                            <video
                              key={i}
                              src={url}
                              controls
                              className="w-full rounded-xl border border-border"
                            />
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Admin notes */}
                    <div>
                      <label
                        htmlFor={`notes-${report.id}`}
                        className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 block"
                      >
                        Admin Notes
                      </label>
                      <textarea
                        id={`notes-${report.id}`}
                        value={notesMap[report.id] ?? ""}
                        onChange={(e) =>
                          setNotesMap((prev) => ({
                            ...prev,
                            [report.id]: e.target.value,
                          }))
                        }
                        placeholder="Add internal notes..."
                        rows={3}
                        className="w-full px-4 py-3 bg-muted border border-border rounded-2xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#219EBC] transition-all resize-none"
                      />
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap gap-3">
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={updating === report.id}
                        onClick={() =>
                          updateReport(report.id, "IN_REVIEW", notesMap[report.id])
                        }
                        className="rounded-xl border-yellow-300 text-yellow-600 hover:bg-yellow-50"
                      >
                        <Clock className="w-4 h-4 mr-2" />
                        Mark In Review
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={updating === report.id}
                        onClick={() =>
                          updateReport(report.id, "RESOLVED", notesMap[report.id])
                        }
                        className="rounded-xl border-green-300 text-green-600 hover:bg-green-50"
                      >
                        <CheckCircle2 className="w-4 h-4 mr-2" />
                        Resolve
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={updating === report.id}
                        onClick={() =>
                          updateReport(report.id, "DISMISSED", notesMap[report.id])
                        }
                        className="rounded-xl border-gray-300 text-gray-500 hover:bg-gray-50"
                      >
                        <XCircle className="w-4 h-4 mr-2" />
                        Dismiss
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={updating === report.id}
                        onClick={() =>
                          updateReport(report.id, undefined, notesMap[report.id])
                        }
                        className="rounded-xl ml-auto"
                      >
                        {updating === report.id ? (
                          <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        ) : null}
                        Save Notes
                      </Button>
                    </div>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
