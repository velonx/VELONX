"use client";

import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import {
  Flag,
  Upload,
  X,
  Image as ImageIcon,
  Video,
  CheckCircle2,
  AlertCircle,
  Loader2,
  FileText,
} from "lucide-react";

/* ─── Types ─────────────────────────────────────────────── */
type ReportCategory =
  | "BUG"
  | "CONTENT_VIOLATION"
  | "HARASSMENT"
  | "SPAM"
  | "TECHNICAL_ISSUE"
  | "FEATURE_REQUEST"
  | "OTHER";

interface MediaPreview {
  id: string;
  file: File;
  previewUrl: string;
  type: "image" | "video";
  uploading: boolean;
  uploaded: boolean;
  cloudUrl?: string;
  error?: string;
}

interface ReportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

/* ─── Helpers ────────────────────────────────────────────── */
const CATEGORY_LABELS: Record<ReportCategory, string> = {
  BUG: "🐛 Bug Report",
  CONTENT_VIOLATION: "⚠️ Content Violation",
  HARASSMENT: "🛡️ Harassment",
  SPAM: "🚫 Spam",
  TECHNICAL_ISSUE: "⚙️ Technical Issue",
  FEATURE_REQUEST: "💡 Feature Request",
  OTHER: "📝 Other",
};

const IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"];
const VIDEO_TYPES = ["video/mp4", "video/quicktime", "video/webm"];
const IMAGE_SIZE_LIMIT = 5 * 1024 * 1024;
const VIDEO_SIZE_LIMIT = 50 * 1024 * 1024;

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

/* ─── Component ──────────────────────────────────────────── */
export function ReportDialog({ open, onOpenChange, onSuccess }: ReportDialogProps) {
  const [category, setCategory] = useState<ReportCategory>("BUG");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [mediaPreviews, setMediaPreviews] = useState<MediaPreview[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  /* ── Reset ── */
  const reset = () => {
    setCategory("BUG");
    setTitle("");
    setDescription("");
    setMediaPreviews([]);
    setSubmitError("");
    setSubmitted(false);
    setDragOver(false);
  };

  const handleClose = () => {
    if (!submitting) {
      reset();
      onOpenChange(false);
    }
  };

  /* ── Media handling ── */
  const addFiles = useCallback(
    (files: FileList | File[]) => {
      const arr = Array.from(files);
      const currentPhotos = mediaPreviews.filter((m) => m.type === "image").length;
      const currentVideos = mediaPreviews.filter((m) => m.type === "video").length;

      for (const file of arr) {
        const isImage = IMAGE_TYPES.includes(file.type);
        const isVideo = VIDEO_TYPES.includes(file.type);

        if (!isImage && !isVideo) {
          alert(`"${file.name}" is not a supported format. Use JPEG/PNG/WebP/GIF or MP4/MOV/WebM.`);
          continue;
        }
        if (isImage && file.size > IMAGE_SIZE_LIMIT) {
          alert(`"${file.name}" exceeds 5 MB limit.`);
          continue;
        }
        if (isVideo && file.size > VIDEO_SIZE_LIMIT) {
          alert(`"${file.name}" exceeds 50 MB limit.`);
          continue;
        }
        if (isImage && currentPhotos >= 5) {
          alert("Maximum 5 photos per report.");
          continue;
        }
        if (isVideo && currentVideos >= 2) {
          alert("Maximum 2 videos per report.");
          continue;
        }

        const previewUrl = URL.createObjectURL(file);
        const id = uid();
        setMediaPreviews((prev) => [
          ...prev,
          {
            id,
            file,
            previewUrl,
            type: isImage ? "image" : "video",
            uploading: false,
            uploaded: false,
          },
        ]);
      }
    },
    [mediaPreviews]
  );

  const removeMedia = (id: string) => {
    setMediaPreviews((prev) => {
      const target = prev.find((m) => m.id === id);
      if (target) URL.revokeObjectURL(target.previewUrl);
      return prev.filter((m) => m.id !== id);
    });
  };

  const uploadMedia = async (preview: MediaPreview): Promise<string> => {
    setMediaPreviews((prev) =>
      prev.map((m) => (m.id === preview.id ? { ...m, uploading: true, error: undefined } : m))
    );

    try {
      const { getCSRFToken } = await import("@/lib/utils/csrf");
      const csrfToken = await getCSRFToken();

      const formData = new FormData();
      formData.append("file", preview.file);
      formData.append(
        "folder",
        preview.type === "video" ? "velonx/reports/videos" : "velonx/reports/photos"
      );

      const res = await fetch("/api/upload", {
        method: "POST",
        headers: { "x-csrf-token": csrfToken },
        body: formData,
      });

      const data = await res.json();
      if (!data.success) throw new Error(data.error?.message || "Upload failed");

      setMediaPreviews((prev) =>
        prev.map((m) =>
          m.id === preview.id
            ? { ...m, uploading: false, uploaded: true, cloudUrl: data.url }
            : m
        )
      );
      return data.url as string;
    } catch (err: any) {
      setMediaPreviews((prev) =>
        prev.map((m) =>
          m.id === preview.id ? { ...m, uploading: false, error: err.message } : m
        )
      );
      throw err;
    }
  };

  /* ── Submit ── */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError("");

    if (!title.trim()) return setSubmitError("Please enter a title.");
    if (!description.trim()) return setSubmitError("Please enter a description.");

    setSubmitting(true);

    try {
      // Upload all unuploaded media first
      const toUpload = mediaPreviews.filter((m) => !m.uploaded && !m.error);
      for (const m of toUpload) {
        await uploadMedia(m);
      }

      // Gather URLs from state snapshot
      const latestPreviews = await new Promise<MediaPreview[]>((resolve) => {
        setMediaPreviews((prev) => {
          resolve(prev);
          return prev;
        });
      });

      const photoUrls = latestPreviews
        .filter((m) => m.type === "image" && m.cloudUrl)
        .map((m) => m.cloudUrl as string);
      const videoUrls = latestPreviews
        .filter((m) => m.type === "video" && m.cloudUrl)
        .map((m) => m.cloudUrl as string);

      const { getCSRFToken } = await import("@/lib/utils/csrf");
      const csrfToken = await getCSRFToken();

      const res = await fetch("/api/reports", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-csrf-token": csrfToken,
        },
        body: JSON.stringify({ category, title, description, photoUrls, videoUrls }),
      });

      const data = await res.json();
      if (!data.success) throw new Error(data.error?.message || "Submission failed");

      setSubmitted(true);
      onSuccess?.();
    } catch (err: any) {
      setSubmitError(err.message || "Failed to submit report. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  /* ── Drag-and-drop ── */
  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    addFiles(e.dataTransfer.files);
  };

  /* ── Render ── */
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="report-dialog-title"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Panel */}
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-card border border-border rounded-[28px] shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-card/95 backdrop-blur-md border-b border-border px-8 py-5 flex items-center justify-between rounded-t-[28px] z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
              <Flag className="w-5 h-5 text-red-500" />
            </div>
            <div>
              <h2
                id="report-dialog-title"
                className="text-lg font-black text-foreground"
              >
                Submit a Report
              </h2>
              <p className="text-xs text-muted-foreground">
                Help us keep the community safe
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            disabled={submitting}
            className="w-8 h-8 rounded-full hover:bg-muted flex items-center justify-center transition-colors text-muted-foreground hover:text-foreground"
            aria-label="Close dialog"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="px-8 py-6">
          {/* ── Success State ── */}
          {submitted ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-6 animate-bounce">
                <CheckCircle2 className="w-10 h-10 text-green-500" />
              </div>
              <h3 className="text-2xl font-black text-foreground mb-2">
                Report Submitted!
              </h3>
              <p className="text-muted-foreground mb-8 max-w-sm">
                Thank you for helping us improve VELONX. Our team will review your
                report and take appropriate action.
              </p>
              <Button
                onClick={handleClose}
                className="bg-[#219EBC] hover:bg-[#1a7a94] text-white font-bold rounded-2xl px-8"
              >
                Done
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Category */}
              <div>
                <label
                  htmlFor="report-category"
                  className="block text-sm font-bold text-foreground mb-2"
                >
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  id="report-category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value as ReportCategory)}
                  className="w-full px-4 py-3 bg-muted border border-border rounded-2xl text-sm font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-[#219EBC] transition-all"
                >
                  {(Object.keys(CATEGORY_LABELS) as ReportCategory[]).map((cat) => (
                    <option key={cat} value={cat}>
                      {CATEGORY_LABELS[cat]}
                    </option>
                  ))}
                </select>
              </div>

              {/* Title */}
              <div>
                <label
                  htmlFor="report-title"
                  className="block text-sm font-bold text-foreground mb-2"
                >
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  id="report-title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Brief summary of the issue..."
                  maxLength={120}
                  className="w-full px-4 py-3 bg-muted border border-border rounded-2xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#219EBC] transition-all"
                />
                <p className="text-xs text-muted-foreground mt-1 text-right">
                  {title.length}/120
                </p>
              </div>

              {/* Description */}
              <div>
                <label
                  htmlFor="report-description"
                  className="block text-sm font-bold text-foreground mb-2"
                >
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="report-description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the issue in detail. Include steps to reproduce, what you expected vs. what happened, etc."
                  rows={4}
                  maxLength={2000}
                  className="w-full px-4 py-3 bg-muted border border-border rounded-2xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#219EBC] transition-all resize-none"
                />
                <p className="text-xs text-muted-foreground mt-1 text-right">
                  {description.length}/2000
                </p>
              </div>

              {/* Media Upload Zone */}
              <div>
                <label className="block text-sm font-bold text-foreground mb-2">
                  Attachments{" "}
                  <span className="text-muted-foreground font-normal">
                    (optional — up to 5 photos, 2 videos)
                  </span>
                </label>

                {/* Drop Zone */}
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragOver(true);
                  }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={onDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`relative border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
                    dragOver
                      ? "border-[#219EBC] bg-[#219EBC]/5"
                      : "border-border hover:border-[#219EBC]/50 hover:bg-muted/50"
                  }`}
                >
                  <div className="flex flex-col items-center gap-2">
                    <div className="flex gap-2">
                      <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                        <ImageIcon className="w-5 h-5 text-blue-500" />
                      </div>
                      <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center">
                        <Video className="w-5 h-5 text-purple-500" />
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-foreground">
                        {dragOver ? "Drop files here" : "Drag & drop or click to upload"}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Photos: JPEG, PNG, WebP, GIF (max 5 MB)
                        <br />
                        Videos: MP4, MOV, WebM (max 50 MB)
                      </p>
                    </div>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="rounded-xl mt-1 pointer-events-none"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Browse Files
                    </Button>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/jpeg,image/jpg,image/png,image/webp,image/gif,video/mp4,video/quicktime,video/webm"
                    onChange={(e) => addFiles(e.target.files!)}
                    className="hidden"
                  />
                </div>

                {/* Previews */}
                {mediaPreviews.length > 0 && (
                  <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {mediaPreviews.map((m) => (
                      <div
                        key={m.id}
                        className="relative group rounded-2xl overflow-hidden border border-border bg-muted aspect-video"
                      >
                        {m.type === "image" ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={m.previewUrl}
                            alt="Preview"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <video
                            src={m.previewUrl}
                            className="w-full h-full object-cover"
                            muted
                            playsInline
                          />
                        )}

                        {/* Overlay */}
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <button
                            type="button"
                            onClick={() => removeMedia(m.id)}
                            className="w-8 h-8 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center text-white transition-colors"
                            aria-label="Remove attachment"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Status badges */}
                        {m.uploading && (
                          <div className="absolute top-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded-lg flex items-center gap-1">
                            <Loader2 className="w-3 h-3 animate-spin" />
                            Uploading…
                          </div>
                        )}
                        {m.uploaded && (
                          <div className="absolute top-2 left-2 bg-green-500 text-white text-xs px-2 py-1 rounded-lg flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            Uploaded
                          </div>
                        )}
                        {m.error && (
                          <div className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded-lg flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            Failed
                          </div>
                        )}

                        {/* Type badge */}
                        <div className="absolute bottom-2 right-2">
                          {m.type === "video" ? (
                            <Video className="w-4 h-4 text-white drop-shadow" />
                          ) : (
                            <ImageIcon className="w-4 h-4 text-white drop-shadow" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Error message */}
              {submitError && (
                <div className="flex items-center gap-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-4 text-red-600 dark:text-red-400 text-sm">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {submitError}
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                  disabled={submitting}
                  className="flex-1 rounded-2xl font-bold"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={submitting || !title.trim() || !description.trim()}
                  className="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold rounded-2xl shadow-lg shadow-red-500/20 transition-all"
                >
                  {submitting ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Submitting…
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      Submit Report
                    </span>
                  )}
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
