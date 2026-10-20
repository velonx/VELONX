"use client";

import { useState, useEffect, useCallback } from "react";
import { Upload, Edit2, Trash2, Loader2, Images, Eye, EyeOff, X, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";
import { getCSRFToken } from "@/lib/utils/csrf";
import { useDragAndDrop } from "@/lib/hooks/useDragAndDrop";

interface GalleryItem {
  id: string;
  imageUrl: string;
  title: string | null;
  caption: string | null;
  category: string | null;
  order: number;
  isActive: boolean;
}

const inputClass = "w-full px-4 py-2.5 bg-background border border-border rounded-xl text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-[#226CE0]/50";
const labelClass = "text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1.5 block";

export default function GalleryManager() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploadProgress, setUploadProgress] = useState<{ done: number; total: number } | null>(null);
  const [uploadCategory, setUploadCategory] = useState("");
  const [editItem, setEditItem] = useState<GalleryItem | null>(null);
  const [form, setForm] = useState({ title: "", caption: "", category: "", order: 0, isActive: true });
  const [saving, setSaving] = useState(false);
  const [galleryEnabled, setGalleryEnabled] = useState<boolean | null>(null);
  const [togglingGallery, setTogglingGallery] = useState(false);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/gallery");
      const json = await res.json();
      if (json.success) setItems(json.data);
      else toast.error(json.error?.message || "Failed to load gallery");
    } catch { toast.error("Failed to load gallery"); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  useEffect(() => {
    fetch("/api/admin/gallery/settings")
      .then(res => res.json())
      .then(json => { if (json.success) setGalleryEnabled(json.data.enabled); })
      .catch(() => toast.error("Failed to load gallery setting"));
  }, []);

  const sendJson = async (url: string, method: string, body?: unknown) => {
    const csrfToken = await getCSRFToken();
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json", "x-csrf-token": csrfToken },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    return res.json();
  };

  // Upload each file, then create a gallery entry for it at the end of the list
  const uploadFiles = async (files: File[]) => {
    const images = files.filter(f => f.type.startsWith("image/"));
    if (images.length === 0) { toast.error("Please choose image files"); return; }

    let nextOrder = items.length ? Math.max(...items.map(i => i.order)) + 1 : 0;
    let added = 0;
    setUploadProgress({ done: 0, total: images.length });
    for (const file of images) {
      try {
        const fd = new FormData();
        fd.append("file", file);
        fd.append("folder", "velonx/gallery");
        const csrfToken = await getCSRFToken();
        const res = await fetch("/api/upload", { method: "POST", body: fd, headers: { "x-csrf-token": csrfToken } });
        const up = await res.json();
        if (!up.success) { toast.error(`${file.name}: ${up.error?.message || "upload failed"}`); continue; }

        const json = await sendJson("/api/admin/gallery", "POST", {
          imageUrl: up.url,
          category: uploadCategory.trim() || null,
          order: nextOrder,
        });
        if (json.success) { added++; nextOrder++; }
        else toast.error(`${file.name}: ${json.error?.message || "save failed"}`);
      } catch { toast.error(`${file.name}: upload failed`); }
      finally { setUploadProgress(p => p && { ...p, done: p.done + 1 }); }
    }
    setUploadProgress(null);
    if (added) toast.success(`${added} photo${added === 1 ? "" : "s"} added to the gallery`);
    fetchItems();
  };

  const { isDragging, dragHandlers } = useDragAndDrop((files) => {
    if (!uploadProgress && files.length) uploadFiles(Array.from(files));
  });

  const openEdit = (item: GalleryItem) => {
    setEditItem(item);
    setForm({
      title: item.title || "",
      caption: item.caption || "",
      category: item.category || "",
      order: item.order,
      isActive: item.isActive,
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editItem) return;
    setSaving(true);
    try {
      const json = await sendJson(`/api/admin/gallery/${editItem.id}`, "PUT", {
        title: form.title.trim() || null,
        caption: form.caption.trim() || null,
        category: form.category.trim() || null,
        order: Number(form.order),
        isActive: form.isActive,
      });
      if (json.success) { toast.success("Photo updated!"); setEditItem(null); fetchItems(); }
      else toast.error(json.error?.message || "Save failed");
    } catch { toast.error("Save failed"); }
    finally { setSaving(false); }
  };

  const toggleGallery = async () => {
    if (galleryEnabled === null) return;
    setTogglingGallery(true);
    try {
      const json = await sendJson("/api/admin/gallery/settings", "PUT", { enabled: !galleryEnabled });
      if (json.success) { setGalleryEnabled(json.data.enabled); toast.success(json.message); }
      else toast.error(json.error?.message || "Failed to update");
    } catch { toast.error("Failed to update"); }
    finally { setTogglingGallery(false); }
  };

  const handleToggle = async (item: GalleryItem) => {
    try {
      const json = await sendJson(`/api/admin/gallery/${item.id}`, "PUT", { isActive: !item.isActive });
      if (json.success) { toast.success(item.isActive ? "Photo hidden" : "Photo visible"); fetchItems(); }
      else toast.error(json.error?.message || "Failed to update");
    } catch { toast.error("Failed to update"); }
  };

  const handleDelete = async (item: GalleryItem) => {
    if (!window.confirm(`Delete ${item.title ? `"${item.title}"` : "this photo"} from the gallery? This cannot be undone.`)) return;
    try {
      const json = await sendJson(`/api/admin/gallery/${item.id}`, "DELETE");
      if (json.success) { toast.success("Photo deleted"); fetchItems(); }
      else toast.error(json.error?.message || "Failed to delete");
    } catch { toast.error("Failed to delete"); }
  };

  const categories = Array.from(new Set(items.map(i => i.category).filter((c): c is string => !!c)));

  return (
    <div className="space-y-6">
      <div>
        <h3 className="heading-card text-2xl">Landing Page Gallery</h3>
        <p className="text-muted-foreground text-sm">
          {items.length} photos · {items.filter(i => i.isActive).length} visible
        </p>
      </div>

      <div className="bg-card border border-border rounded-3xl p-6 flex items-center justify-between gap-6">
        <div>
          <p className="font-bold text-foreground">Show gallery on landing page</p>
          <p className="text-muted-foreground text-sm">
            {galleryEnabled
              ? items.some(i => i.isActive)
                ? "The \"Life at Velonx\" section is live on the landing page."
                : "Switched on — upload at least one photo below for the section to appear."
              : "The gallery section is hidden from the landing page."}
          </p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={!!galleryEnabled}
          aria-label="Show gallery on landing page"
          disabled={galleryEnabled === null || togglingGallery}
          onClick={toggleGallery}
          className={`relative w-14 h-7 rounded-full transition-colors shrink-0 disabled:opacity-50 ${galleryEnabled ? "bg-emerald-500" : "bg-muted"}`}
        >
          <div className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow transition-transform ${galleryEnabled ? "left-8" : "left-1"}`} />
        </button>
      </div>

      <div className="bg-card border border-border rounded-3xl p-6 space-y-4">
        <div className="grid md:grid-cols-[1fr_16rem] gap-4 items-end">
          <label className="cursor-pointer" {...dragHandlers}>
            <div className={`w-full h-28 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center gap-2 text-sm transition-colors ${isDragging ? "border-[#226CE0] bg-[#226CE0]/10 text-[#226CE0]" : "border-border text-muted-foreground hover:border-[#226CE0] hover:text-[#226CE0]"}`}>
              {uploadProgress
                ? <><Loader2 className="w-6 h-6 animate-spin" />Uploading {Math.min(uploadProgress.done + 1, uploadProgress.total)} of {uploadProgress.total}...</>
                : <><Upload className="w-6 h-6" />{isDragging ? "Drop photos here" : "Click or drag photos to upload (multiple allowed)"}</>}
            </div>
            <input type="file" accept="image/*" multiple className="hidden" disabled={!!uploadProgress} onChange={e => { const files = Array.from(e.target.files ?? []); e.target.value = ""; if (files.length) uploadFiles(files); }} />
          </label>
          <div>
            <label className={labelClass}>Category for new photos</label>
            <input list="gallery-categories" maxLength={40} value={uploadCategory} onChange={e => setUploadCategory(e.target.value)} placeholder="e.g. Hackathons" className={inputClass} />
            <datalist id="gallery-categories">{categories.map(c => <option key={c} value={c} />)}</datalist>
          </div>
        </div>
        <p className="text-[10px] text-muted-foreground">Max 5MB per photo. Add titles and captions afterwards with the edit button.</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-[#226CE0]" /></div>
      ) : items.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground bg-card border border-border rounded-3xl">
          <Images className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="font-semibold">No photos yet. Upload some above to fill the landing-page gallery.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
          {items.map(item => (
            <div key={item.id} className={`group bg-card border border-border rounded-2xl overflow-hidden ${item.isActive ? "" : "opacity-50"}`}>
              <div className="relative aspect-[4/3] bg-muted">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={item.imageUrl} alt={item.title || ""} className="object-cover w-full h-full" />
                <div className="absolute top-2 right-2 flex gap-1.5 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
                  <button onClick={() => handleToggle(item)} aria-label={item.isActive ? "Hide photo" : "Show photo"} title={item.isActive ? "Hide" : "Show"} className="w-8 h-8 rounded-lg bg-black/60 text-white hover:bg-black/80 flex items-center justify-center">{item.isActive ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}</button>
                  <button onClick={() => openEdit(item)} aria-label="Edit photo" className="w-8 h-8 rounded-lg bg-black/60 text-white hover:bg-[#226CE0] flex items-center justify-center"><Edit2 className="w-3.5 h-3.5" /></button>
                  <button onClick={() => handleDelete(item)} aria-label="Delete photo" className="w-8 h-8 rounded-lg bg-black/60 text-white hover:bg-red-500 flex items-center justify-center"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
                {!item.isActive && <span className="absolute top-2 left-2 text-[10px] font-bold bg-black/70 text-white px-2 py-0.5 rounded-md">Hidden</span>}
              </div>
              <div className="p-3">
                <p className="text-sm font-bold text-foreground line-clamp-1">{item.title || <span className="text-muted-foreground font-normal italic">Untitled</span>}</p>
                <p className="text-[10px] text-muted-foreground">#{item.order}{item.category ? ` · ${item.category}` : ""}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {editItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
          <div className="bg-card border border-border rounded-3xl w-full max-w-3xl shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h3 className="text-lg font-black text-foreground">Edit Photo</h3>
              <button onClick={() => setEditItem(null)} aria-label="Close" className="w-8 h-8 rounded-xl bg-muted flex items-center justify-center hover:bg-muted/80"><X className="w-4 h-4" /></button>
            </div>
            <div className="grid md:grid-cols-2 max-h-[80vh] overflow-y-auto">
              <div className="p-6 bg-muted/30 flex items-center justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={editItem.imageUrl} alt="" className="rounded-2xl max-h-80 object-contain" />
              </div>
              <form onSubmit={handleSave} className="p-6 space-y-4">
                <div>
                  <label className={labelClass}>Title</label>
                  <input maxLength={120} value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="e.g. Hack Bhopal 2026 winners" className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Caption</label>
                  <textarea rows={3} maxLength={500} value={form.caption} onChange={e => setForm(f => ({ ...f, caption: e.target.value }))} placeholder="Shown when the photo is opened" className={`${inputClass} resize-none`} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelClass}>Category</label>
                    <input list="gallery-categories" maxLength={40} value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} placeholder="Hackathons" className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Order (lower first)</label>
                    <input type="number" min={-1000} max={1000} value={form.order} onChange={e => setForm(f => ({ ...f, order: Number(e.target.value) }))} className={inputClass} />
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Visible</label>
                  <button type="button" aria-pressed={form.isActive} onClick={() => setForm(f => ({ ...f, isActive: !f.isActive }))} className={`relative w-12 h-6 rounded-full transition-colors ${form.isActive ? "bg-emerald-500" : "bg-muted"}`}>
                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${form.isActive ? "left-7" : "left-1"}`} />
                  </button>
                </div>
                <Button type="submit" disabled={saving} className="w-full h-11 bg-linear-to-r from-[#226CE0] to-violet-600 text-white font-bold rounded-xl hover:opacity-90">
                  {saving ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Saving...</> : <><Check className="w-4 h-4 mr-2" />Save Photo</>}
                </Button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
