"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Edit2, Trash2, Loader2, Megaphone, Image as ImageIcon, ToggleLeft, ToggleRight, X, Check, Eye, MousePointerClick } from "lucide-react";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";
import { getCSRFToken } from "@/lib/utils/csrf";
import { useDragAndDrop } from "@/lib/hooks/useDragAndDrop";
import { BannerCard } from "@/components/banner/BannerPopup";

type Audience = "ALL" | "GUESTS" | "LOGGED_IN";
type Frequency = "ONCE" | "EVERY_SESSION" | "EVERY_VISIT";

interface Banner {
  id: string;
  title: string;
  message: string | null;
  imageUrl: string | null;
  ctaText: string | null;
  ctaUrl: string | null;
  isActive: boolean;
  audience: Audience;
  frequency: Frequency;
  pathPrefixes: string[];
  delaySeconds: number;
  closeOnBackdrop: boolean;
  priority: number;
  startsAt: string | null;
  endsAt: string | null;
  views: number;
  clicks: number;
  updatedAt: string;
}

const AUDIENCE_LABELS: Record<Audience, string> = {
  ALL: "Everyone",
  GUESTS: "Logged-out visitors",
  LOGGED_IN: "Logged-in users",
};

const FREQUENCY_LABELS: Record<Frequency, string> = {
  ONCE: "Once per visitor",
  EVERY_SESSION: "Once per browser session",
  EVERY_VISIT: "Every page load",
};

const emptyForm = {
  title: "",
  message: "",
  imageUrl: "",
  ctaText: "",
  ctaUrl: "",
  isActive: true,
  audience: "ALL" as Audience,
  frequency: "ONCE" as Frequency,
  pathPrefixes: "",
  delaySeconds: 2,
  closeOnBackdrop: true,
  priority: 0,
  startsAt: "",
  endsAt: "",
};

// ISO string -> value for <input type="datetime-local"> in the admin's local time
const toLocalInput = (iso: string | null) => {
  if (!iso) return "";
  const d = new Date(iso);
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
};

const inputClass = "w-full px-4 py-2.5 bg-background border border-border rounded-xl text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-[#226CE0]/50";
const labelClass = "text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1.5 block";

function scheduleStatus(b: Banner): { label: string; className: string } {
  const now = Date.now();
  if (!b.isActive) return { label: "Inactive", className: "text-muted-foreground" };
  if (b.startsAt && new Date(b.startsAt).getTime() > now) return { label: "Scheduled", className: "text-amber-500" };
  if (b.endsAt && new Date(b.endsAt).getTime() <= now) return { label: "Expired", className: "text-red-500" };
  return { label: "Live", className: "text-emerald-500" };
}

export default function BannerManager() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editBanner, setEditBanner] = useState<Banner | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  const fetchBanners = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/banners");
      const json = await res.json();
      if (json.success) setBanners(json.data);
      else toast.error(json.error?.message || "Failed to load banners");
    } catch { toast.error("Failed to load banners"); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchBanners(); }, [fetchBanners]);

  const uploadImage = async (file: File) => {
    setUploadingImage(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("folder", "velonx/banners");
      const csrfToken = await getCSRFToken();
      const res = await fetch("/api/upload", { method: "POST", body: fd, headers: { "x-csrf-token": csrfToken } });
      const json = await res.json();
      if (json.success) { setForm(f => ({ ...f, imageUrl: json.url })); toast.success("Image uploaded"); }
      else toast.error(json.error?.message || "Upload failed");
    } catch { toast.error("Upload failed"); }
    finally { setUploadingImage(false); }
  };

  const { isDragging, dragHandlers } = useDragAndDrop((files) => {
    if (!uploadingImage && files[0]) uploadImage(files[0]);
  });

  const openCreate = () => { setEditBanner(null); setForm(emptyForm); setShowForm(true); };
  const openEdit = (b: Banner) => {
    setEditBanner(b);
    setForm({
      title: b.title,
      message: b.message || "",
      imageUrl: b.imageUrl || "",
      ctaText: b.ctaText || "",
      ctaUrl: b.ctaUrl || "",
      isActive: b.isActive,
      audience: b.audience,
      frequency: b.frequency,
      pathPrefixes: b.pathPrefixes.join(", "),
      delaySeconds: b.delaySeconds,
      closeOnBackdrop: b.closeOnBackdrop,
      priority: b.priority,
      startsAt: toLocalInput(b.startsAt),
      endsAt: toLocalInput(b.endsAt),
    });
    setShowForm(true);
  };

  const sendJson = async (url: string, method: string, body?: unknown) => {
    const csrfToken = await getCSRFToken();
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json", "x-csrf-token": csrfToken },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    return res.json();
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((form.ctaText.trim() === "") !== (form.ctaUrl.trim() === "")) {
      toast.error("Button text and link must both be set, or both left empty");
      return;
    }
    setSaving(true);
    try {
      const body = {
        title: form.title,
        message: form.message.trim() || null,
        imageUrl: form.imageUrl.trim() || null,
        ctaText: form.ctaText.trim() || null,
        ctaUrl: form.ctaUrl.trim() || null,
        isActive: form.isActive,
        audience: form.audience,
        frequency: form.frequency,
        pathPrefixes: form.pathPrefixes.split(",").map(p => p.trim()).filter(Boolean),
        delaySeconds: Number(form.delaySeconds),
        closeOnBackdrop: form.closeOnBackdrop,
        priority: Number(form.priority),
        startsAt: form.startsAt ? new Date(form.startsAt).toISOString() : null,
        endsAt: form.endsAt ? new Date(form.endsAt).toISOString() : null,
      };
      const json = editBanner
        ? await sendJson(`/api/admin/banners/${editBanner.id}`, "PUT", body)
        : await sendJson("/api/admin/banners", "POST", body);
      if (json.success) {
        toast.success(editBanner ? "Banner updated!" : "Banner created!");
        setShowForm(false);
        fetchBanners();
      } else {
        toast.error(json.error?.message || "Save failed");
      }
    } catch { toast.error("Save failed"); }
    finally { setSaving(false); }
  };

  const handleToggle = async (b: Banner) => {
    try {
      const json = await sendJson(`/api/admin/banners/${b.id}`, "PUT", { isActive: !b.isActive });
      if (json.success) { toast.success(b.isActive ? "Banner turned off" : "Banner turned on"); fetchBanners(); }
      else toast.error(json.error?.message || "Failed to update");
    } catch { toast.error("Failed to update"); }
  };

  const handleDelete = async (b: Banner) => {
    if (!window.confirm(`Delete banner "${b.title}"? This cannot be undone.`)) return;
    try {
      const json = await sendJson(`/api/admin/banners/${b.id}`, "DELETE");
      if (json.success) { toast.success("Banner deleted"); fetchBanners(); }
      else toast.error(json.error?.message || "Failed to delete");
    } catch { toast.error("Failed to delete"); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="heading-card text-2xl">Pop-up Banners</h3>
          <p className="text-muted-foreground text-sm">
            {banners.length} banners · {banners.filter(b => scheduleStatus(b).label === "Live").length} live · the highest-priority matching banner is shown first
          </p>
        </div>
        <Button onClick={openCreate} className="bg-linear-to-r from-[#226CE0] to-violet-600 text-white font-bold rounded-xl h-10 px-5 flex items-center gap-2 hover:opacity-90">
          <Plus className="w-4 h-4" /> New Banner
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-[#226CE0]" /></div>
      ) : (
        <div className="bg-card border border-border rounded-3xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="text-left text-xs font-bold text-muted-foreground uppercase tracking-widest px-6 py-4">Banner</th>
                  <th className="text-left text-xs font-bold text-muted-foreground uppercase tracking-widest px-4 py-4">Audience</th>
                  <th className="text-left text-xs font-bold text-muted-foreground uppercase tracking-widest px-4 py-4">Pages</th>
                  <th className="text-left text-xs font-bold text-muted-foreground uppercase tracking-widest px-4 py-4">Priority</th>
                  <th className="text-left text-xs font-bold text-muted-foreground uppercase tracking-widest px-4 py-4">Stats</th>
                  <th className="text-left text-xs font-bold text-muted-foreground uppercase tracking-widest px-4 py-4">Status</th>
                  <th className="text-right text-xs font-bold text-muted-foreground uppercase tracking-widest px-6 py-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {banners.map(b => {
                  const st = scheduleStatus(b);
                  return (
                    <tr key={b.id} className="hover:bg-muted/20 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl overflow-hidden bg-muted shrink-0">
                            {b.imageUrl
                              // eslint-disable-next-line @next/next/no-img-element
                              ? <img src={b.imageUrl} alt="" className="object-cover w-full h-full" />
                              : <div className="w-full h-full flex items-center justify-center"><Megaphone className="w-5 h-5 text-muted-foreground" /></div>}
                          </div>
                          <div>
                            <p className="font-bold text-foreground text-sm">{b.title}</p>
                            <p className="text-muted-foreground text-xs line-clamp-1 max-w-64">{b.message || "—"}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-xs font-bold bg-muted px-2 py-1 rounded-lg text-muted-foreground whitespace-nowrap">{AUDIENCE_LABELS[b.audience]}</span>
                        <p className="text-[10px] text-muted-foreground mt-1">{FREQUENCY_LABELS[b.frequency]}</p>
                      </td>
                      <td className="px-4 py-4 text-xs text-muted-foreground max-w-40">
                        {b.pathPrefixes.length ? b.pathPrefixes.join(", ") : "All pages"}
                      </td>
                      <td className="px-4 py-4 text-sm font-semibold text-foreground">{b.priority}</td>
                      <td className="px-4 py-4">
                        <div className="flex flex-col gap-1 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1"><Eye className="w-3.5 h-3.5" />{b.views.toLocaleString()} views</span>
                          <span className="flex items-center gap-1"><MousePointerClick className="w-3.5 h-3.5" />{b.clicks.toLocaleString()} clicks</span>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <button onClick={() => handleToggle(b)} className="flex items-center gap-1.5" title={b.isActive ? "Turn off" : "Turn on"}>
                          {b.isActive
                            ? <ToggleRight className="w-5 h-5 text-emerald-500" />
                            : <ToggleLeft className="w-5 h-5 text-muted-foreground" />}
                          <span className={`text-xs font-bold ${st.className}`}>{st.label}</span>
                        </button>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => openEdit(b)} aria-label="Edit banner" className="w-8 h-8 rounded-lg bg-muted hover:bg-[#226CE0]/10 hover:text-[#226CE0] flex items-center justify-center transition-colors"><Edit2 className="w-3.5 h-3.5" /></button>
                          <button onClick={() => handleDelete(b)} aria-label="Delete banner" className="w-8 h-8 rounded-lg bg-muted hover:bg-red-500/10 hover:text-red-500 flex items-center justify-center transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {banners.length === 0 && (
              <div className="text-center py-16 text-muted-foreground">
                <Megaphone className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p className="font-semibold">No banners yet. Create one to announce something site-wide.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
          <div className="bg-card border border-border rounded-3xl w-full max-w-5xl shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h3 className="text-lg font-black text-foreground">{editBanner ? "Edit Banner" : "New Pop-up Banner"}</h3>
              <button onClick={() => setShowForm(false)} aria-label="Close" className="w-8 h-8 rounded-xl bg-muted flex items-center justify-center hover:bg-muted/80"><X className="w-4 h-4" /></button>
            </div>
            <div className="grid lg:grid-cols-2 max-h-[80vh] overflow-y-auto">
              <form onSubmit={handleSave} className="p-6 space-y-4 lg:border-r border-border">
                <div>
                  <label className={labelClass}>Title *</label>
                  <input required minLength={2} maxLength={120} value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="e.g. Hackathon registrations are open!" className={inputClass} />
                </div>

                <div>
                  <label className={labelClass}>Message</label>
                  <textarea rows={3} maxLength={1000} value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} placeholder="Short description shown under the title" className={`${inputClass} resize-none`} />
                </div>

                <div>
                  <label className={labelClass}>Image (optional)</label>
                  <div className="flex items-center gap-3">
                    <div className="w-16 h-16 rounded-xl bg-muted flex items-center justify-center overflow-hidden shrink-0">
                      {form.imageUrl
                        // eslint-disable-next-line @next/next/no-img-element
                        ? <img src={form.imageUrl} alt="Preview" className="object-cover w-full h-full" />
                        : <ImageIcon className="w-6 h-6 text-muted-foreground" />}
                    </div>
                    <label className="flex-1 cursor-pointer" {...dragHandlers}>
                      <div className={`w-full h-10 border-2 border-dashed rounded-xl flex items-center justify-center text-sm transition-colors ${isDragging ? "border-[#226CE0] bg-[#226CE0]/10 text-[#226CE0]" : "border-border text-muted-foreground hover:border-[#226CE0] hover:text-[#226CE0]"}`}>
                        {uploadingImage ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Uploading...</> : isDragging ? "Drop image here" : "Click or drag to upload"}
                      </div>
                      <input type="file" accept="image/*" className="hidden" disabled={uploadingImage} onChange={e => { const file = e.target.files?.[0]; if (file) uploadImage(file); }} />
                    </label>
                    {form.imageUrl && (
                      <button type="button" onClick={() => setForm(f => ({ ...f, imageUrl: "" }))} className="text-xs font-bold text-red-500 hover:underline">Remove</button>
                    )}
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-1.5">Recommended: 16:9 landscape, max 5MB.</p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelClass}>Button text</label>
                    <input maxLength={40} value={form.ctaText} onChange={e => setForm(f => ({ ...f, ctaText: e.target.value }))} placeholder="Register now" className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Button link</label>
                    <input value={form.ctaUrl} onChange={e => setForm(f => ({ ...f, ctaUrl: e.target.value }))} placeholder="/events or https://…" className={inputClass} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelClass}>Audience</label>
                    <select value={form.audience} onChange={e => setForm(f => ({ ...f, audience: e.target.value as Audience }))} className={inputClass}>
                      {(Object.keys(AUDIENCE_LABELS) as Audience[]).map(a => <option key={a} value={a}>{AUDIENCE_LABELS[a]}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>Show</label>
                    <select value={form.frequency} onChange={e => setForm(f => ({ ...f, frequency: e.target.value as Frequency }))} className={inputClass}>
                      {(Object.keys(FREQUENCY_LABELS) as Frequency[]).map(fq => <option key={fq} value={fq}>{FREQUENCY_LABELS[fq]}</option>)}
                    </select>
                  </div>
                </div>

                <div>
                  <label className={labelClass}>Only on pages (optional)</label>
                  <input value={form.pathPrefixes} onChange={e => setForm(f => ({ ...f, pathPrefixes: e.target.value }))} placeholder="/home, /events  — leave empty for all pages" className={inputClass} />
                  <p className="text-[10px] text-muted-foreground mt-1.5">Comma-separated. &quot;/events&quot; also matches /events/123. Never shown on admin or login pages.</p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelClass}>Start (optional)</label>
                    <input type="datetime-local" value={form.startsAt} onChange={e => setForm(f => ({ ...f, startsAt: e.target.value }))} className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>End (optional)</label>
                    <input type="datetime-local" value={form.endsAt} onChange={e => setForm(f => ({ ...f, endsAt: e.target.value }))} className={inputClass} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelClass}>Delay (seconds)</label>
                    <input type="number" min={0} max={120} value={form.delaySeconds} onChange={e => setForm(f => ({ ...f, delaySeconds: Number(e.target.value) }))} className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Priority (-100 to 100)</label>
                    <input type="number" min={-100} max={100} value={form.priority} onChange={e => setForm(f => ({ ...f, priority: Number(e.target.value) }))} className={inputClass} />
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-6">
                  <div className="flex items-center gap-3">
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Active</label>
                    <button type="button" aria-pressed={form.isActive} onClick={() => setForm(f => ({ ...f, isActive: !f.isActive }))} className={`relative w-12 h-6 rounded-full transition-colors ${form.isActive ? "bg-emerald-500" : "bg-muted"}`}>
                      <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${form.isActive ? "left-7" : "left-1"}`} />
                    </button>
                  </div>
                  <div className="flex items-center gap-3">
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Close on outside click / Esc</label>
                    <button type="button" aria-pressed={form.closeOnBackdrop} onClick={() => setForm(f => ({ ...f, closeOnBackdrop: !f.closeOnBackdrop }))} className={`relative w-12 h-6 rounded-full transition-colors ${form.closeOnBackdrop ? "bg-emerald-500" : "bg-muted"}`}>
                      <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${form.closeOnBackdrop ? "left-7" : "left-1"}`} />
                    </button>
                  </div>
                </div>

                <Button type="submit" disabled={saving || uploadingImage} className="w-full h-11 bg-linear-to-r from-[#226CE0] to-violet-600 text-white font-bold rounded-xl hover:opacity-90">
                  {saving ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Saving...</> : <><Check className="w-4 h-4 mr-2" />{editBanner ? "Update Banner" : "Create Banner"}</>}
                </Button>
              </form>

              <div className="p-6 bg-muted/30 flex flex-col">
                <p className={labelClass}>Live preview</p>
                <div className="flex-1 flex items-center justify-center rounded-2xl bg-black/60 p-6 min-h-80">
                  <BannerCard
                    banner={{
                      title: form.title || "Your banner title",
                      message: form.message || null,
                      imageUrl: form.imageUrl || null,
                      ctaText: form.ctaText || null,
                      ctaUrl: form.ctaUrl || null,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
