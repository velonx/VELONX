"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Edit2, Trash2, Loader2, MessageSquareQuote, Image as ImageIcon, ToggleLeft, ToggleRight, X, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";
import { getCSRFToken } from "@/lib/utils/csrf";
import { useDragAndDrop } from "@/lib/hooks/useDragAndDrop";
import { TestimonialCardContent } from "@/components/cms/TestimonialCard";
import { TESTIMONIAL_ACCENTS, type TestimonialAccent } from "@/lib/validations/cms";

interface Testimonial {
  id: string;
  name: string;
  quote: string;
  badge: string | null;
  subtitle: string | null;
  avatarUrl: string | null;
  accent: TestimonialAccent;
  order: number;
  isActive: boolean;
}

const ACCENT_SWATCH: Record<TestimonialAccent, string> = {
  blue: "bg-[#226CE0]",
  orange: "bg-[#F0771A]",
  emerald: "bg-emerald-500",
  amber: "bg-amber-500",
  purple: "bg-purple-500",
  rose: "bg-rose-500",
};

const emptyForm = {
  name: "",
  quote: "",
  badge: "",
  subtitle: "",
  avatarUrl: "",
  accent: "blue" as TestimonialAccent,
  order: 0,
  isActive: true,
};

const inputClass = "w-full px-4 py-2.5 bg-background border border-border rounded-xl text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-[#226CE0]/50";
const labelClass = "text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1.5 block";

export default function TestimonialManager() {
  const [items, setItems] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState<Testimonial | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/testimonials");
      const json = await res.json();
      if (json.success) setItems(json.data);
      else toast.error(json.error?.message || "Failed to load testimonials");
    } catch { toast.error("Failed to load testimonials"); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  const uploadImage = async (file: File) => {
    setUploadingImage(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("folder", "velonx/testimonials");
      const csrfToken = await getCSRFToken();
      const res = await fetch("/api/upload", { method: "POST", body: fd, headers: { "x-csrf-token": csrfToken } });
      const json = await res.json();
      if (json.success) { setForm(f => ({ ...f, avatarUrl: json.url })); toast.success("Photo uploaded"); }
      else toast.error(json.error?.message || "Upload failed");
    } catch { toast.error("Upload failed"); }
    finally { setUploadingImage(false); }
  };

  const { isDragging, dragHandlers } = useDragAndDrop((files) => {
    if (!uploadingImage && files[0]) uploadImage(files[0]);
  });

  const openCreate = () => {
    setEditItem(null);
    // New entries go to the end by default
    setForm({ ...emptyForm, order: items.length ? Math.max(...items.map(i => i.order)) + 1 : 0 });
    setShowForm(true);
  };
  const openEdit = (t: Testimonial) => {
    setEditItem(t);
    setForm({
      name: t.name,
      quote: t.quote,
      badge: t.badge || "",
      subtitle: t.subtitle || "",
      avatarUrl: t.avatarUrl || "",
      accent: t.accent,
      order: t.order,
      isActive: t.isActive,
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
    setSaving(true);
    try {
      const body = {
        name: form.name,
        quote: form.quote.trim().replace(/^["“]+|["”]+$/g, ""),
        badge: form.badge.trim() || null,
        subtitle: form.subtitle.trim() || null,
        avatarUrl: form.avatarUrl.trim() || null,
        accent: form.accent,
        order: Number(form.order),
        isActive: form.isActive,
      };
      const json = editItem
        ? await sendJson(`/api/admin/testimonials/${editItem.id}`, "PUT", body)
        : await sendJson("/api/admin/testimonials", "POST", body);
      if (json.success) {
        toast.success(editItem ? "Testimonial updated!" : "Testimonial added!");
        setShowForm(false);
        fetchItems();
      } else {
        toast.error(json.error?.message || "Save failed");
      }
    } catch { toast.error("Save failed"); }
    finally { setSaving(false); }
  };

  const handleToggle = async (t: Testimonial) => {
    try {
      const json = await sendJson(`/api/admin/testimonials/${t.id}`, "PUT", { isActive: !t.isActive });
      if (json.success) { toast.success(t.isActive ? "Hidden from homepage" : "Shown on homepage"); fetchItems(); }
      else toast.error(json.error?.message || "Failed to update");
    } catch { toast.error("Failed to update"); }
  };

  const handleDelete = async (t: Testimonial) => {
    if (!window.confirm(`Delete the testimonial from "${t.name}"? This cannot be undone.`)) return;
    try {
      const json = await sendJson(`/api/admin/testimonials/${t.id}`, "DELETE");
      if (json.success) { toast.success("Testimonial deleted"); fetchItems(); }
      else toast.error(json.error?.message || "Failed to delete");
    } catch { toast.error("Failed to delete"); }
  };

  const visibleCount = items.filter(i => i.isActive).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="heading-card text-2xl">Testimonials</h3>
          <p className="text-muted-foreground text-sm">
            {items.length} testimonials · {visibleCount} shown on the homepage
            {visibleCount === 0 && " · the built-in defaults are shown until you add one"}
          </p>
        </div>
        <Button onClick={openCreate} className="bg-linear-to-r from-[#226CE0] to-violet-600 text-white font-bold rounded-xl h-10 px-5 flex items-center gap-2 hover:opacity-90">
          <Plus className="w-4 h-4" /> New Testimonial
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
                  <th className="text-left text-xs font-bold text-muted-foreground uppercase tracking-widest px-6 py-4">Person</th>
                  <th className="text-left text-xs font-bold text-muted-foreground uppercase tracking-widest px-4 py-4">Quote</th>
                  <th className="text-left text-xs font-bold text-muted-foreground uppercase tracking-widest px-4 py-4">Order</th>
                  <th className="text-left text-xs font-bold text-muted-foreground uppercase tracking-widest px-4 py-4">Status</th>
                  <th className="text-right text-xs font-bold text-muted-foreground uppercase tracking-widest px-6 py-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {items.map(t => (
                  <tr key={t.id} className="hover:bg-muted/20 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full overflow-hidden bg-muted shrink-0 flex items-center justify-center">
                          {t.avatarUrl
                            // eslint-disable-next-line @next/next/no-img-element
                            ? <img src={t.avatarUrl} alt="" className="object-cover w-full h-full" />
                            : <span className={`w-3 h-3 rounded-full ${ACCENT_SWATCH[t.accent] ?? ACCENT_SWATCH.blue}`} />}
                        </div>
                        <div>
                          <p className="font-bold text-foreground text-sm">{t.name}</p>
                          <p className="text-muted-foreground text-xs line-clamp-1 max-w-56">{t.badge || t.subtitle || "—"}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-xs text-muted-foreground italic max-w-96"><span className="line-clamp-2">&quot;{t.quote}&quot;</span></td>
                    <td className="px-4 py-4 text-sm font-semibold text-foreground">{t.order}</td>
                    <td className="px-4 py-4">
                      <button onClick={() => handleToggle(t)} className="flex items-center gap-1.5" title={t.isActive ? "Hide" : "Show"}>
                        {t.isActive
                          ? <ToggleRight className="w-5 h-5 text-emerald-500" />
                          : <ToggleLeft className="w-5 h-5 text-muted-foreground" />}
                        <span className={`text-xs font-bold ${t.isActive ? "text-emerald-500" : "text-muted-foreground"}`}>{t.isActive ? "Visible" : "Hidden"}</span>
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => openEdit(t)} aria-label="Edit testimonial" className="w-8 h-8 rounded-lg bg-muted hover:bg-[#226CE0]/10 hover:text-[#226CE0] flex items-center justify-center transition-colors"><Edit2 className="w-3.5 h-3.5" /></button>
                        <button onClick={() => handleDelete(t)} aria-label="Delete testimonial" className="w-8 h-8 rounded-lg bg-muted hover:bg-red-500/10 hover:text-red-500 flex items-center justify-center transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {items.length === 0 && (
              <div className="text-center py-16 text-muted-foreground">
                <MessageSquareQuote className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p className="font-semibold">No testimonials yet. Add one to replace the homepage defaults.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
          <div className="bg-card border border-border rounded-3xl w-full max-w-5xl shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h3 className="text-lg font-black text-foreground">{editItem ? "Edit Testimonial" : "New Testimonial"}</h3>
              <button onClick={() => setShowForm(false)} aria-label="Close" className="w-8 h-8 rounded-xl bg-muted flex items-center justify-center hover:bg-muted/80"><X className="w-4 h-4" /></button>
            </div>
            <div className="grid lg:grid-cols-2 max-h-[80vh] overflow-y-auto">
              <form onSubmit={handleSave} className="p-6 space-y-4 lg:border-r border-border">
                <div>
                  <label className={labelClass}>Name *</label>
                  <input required minLength={2} maxLength={80} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Ritika Lodhi" className={inputClass} />
                </div>

                <div>
                  <label className={labelClass}>Quote *</label>
                  <textarea required minLength={10} maxLength={600} rows={4} value={form.quote} onChange={e => setForm(f => ({ ...f, quote: e.target.value }))} placeholder="What they said about Velonx (no quote marks needed)" className={`${inputClass} resize-none`} />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelClass}>Badge / role</label>
                    <input maxLength={80} value={form.badge} onChange={e => setForm(f => ({ ...f, badge: e.target.value }))} placeholder="Full Stack Developer" className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>College / company</label>
                    <input maxLength={120} value={form.subtitle} onChange={e => setForm(f => ({ ...f, subtitle: e.target.value }))} placeholder="Barkatullah University · SDE @ Google" className={inputClass} />
                  </div>
                </div>

                <div>
                  <label className={labelClass}>Photo (optional)</label>
                  <div className="flex items-center gap-3">
                    <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center overflow-hidden shrink-0">
                      {form.avatarUrl
                        // eslint-disable-next-line @next/next/no-img-element
                        ? <img src={form.avatarUrl} alt="Preview" className="object-cover w-full h-full" />
                        : <ImageIcon className="w-5 h-5 text-muted-foreground" />}
                    </div>
                    <label className="flex-1 cursor-pointer" {...dragHandlers}>
                      <div className={`w-full h-10 border-2 border-dashed rounded-xl flex items-center justify-center text-sm transition-colors ${isDragging ? "border-[#226CE0] bg-[#226CE0]/10 text-[#226CE0]" : "border-border text-muted-foreground hover:border-[#226CE0] hover:text-[#226CE0]"}`}>
                        {uploadingImage ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Uploading...</> : isDragging ? "Drop photo here" : "Click or drag to upload"}
                      </div>
                      <input type="file" accept="image/*" className="hidden" disabled={uploadingImage} onChange={e => { const file = e.target.files?.[0]; if (file) uploadImage(file); }} />
                    </label>
                    {form.avatarUrl && (
                      <button type="button" onClick={() => setForm(f => ({ ...f, avatarUrl: "" }))} className="text-xs font-bold text-red-500 hover:underline">Remove</button>
                    )}
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-1.5">Square photo works best. Without one, initials are shown.</p>
                </div>

                <div>
                  <label className={labelClass}>Colour</label>
                  <div className="flex items-center gap-2">
                    {TESTIMONIAL_ACCENTS.map(a => (
                      <button
                        key={a}
                        type="button"
                        title={a}
                        aria-label={`${a} colour`}
                        aria-pressed={form.accent === a}
                        onClick={() => setForm(f => ({ ...f, accent: a }))}
                        className={`w-8 h-8 rounded-full ${ACCENT_SWATCH[a]} transition-transform ${form.accent === a ? "ring-2 ring-offset-2 ring-offset-card ring-foreground scale-110" : "opacity-70 hover:opacity-100"}`}
                      />
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 items-end">
                  <div>
                    <label className={labelClass}>Order (lower first)</label>
                    <input type="number" min={-1000} max={1000} value={form.order} onChange={e => setForm(f => ({ ...f, order: Number(e.target.value) }))} className={inputClass} />
                  </div>
                  <div className="flex items-center gap-3 h-10">
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Visible</label>
                    <button type="button" aria-pressed={form.isActive} onClick={() => setForm(f => ({ ...f, isActive: !f.isActive }))} className={`relative w-12 h-6 rounded-full transition-colors ${form.isActive ? "bg-emerald-500" : "bg-muted"}`}>
                      <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${form.isActive ? "left-7" : "left-1"}`} />
                    </button>
                  </div>
                </div>

                <Button type="submit" disabled={saving || uploadingImage} className="w-full h-11 bg-linear-to-r from-[#226CE0] to-violet-600 text-white font-bold rounded-xl hover:opacity-90">
                  {saving ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Saving...</> : <><Check className="w-4 h-4 mr-2" />{editItem ? "Update Testimonial" : "Add Testimonial"}</>}
                </Button>
              </form>

              <div className="p-6 bg-muted/30 flex flex-col">
                <p className={labelClass}>Live preview</p>
                <div className="flex-1 flex items-center justify-center p-6 min-h-80">
                  <div className="card-redesign bg-card p-8 flex flex-col justify-between shadow-md relative overflow-hidden w-full max-w-sm min-h-64">
                    <TestimonialCardContent
                      t={{
                        name: form.name || "Student name",
                        quote: form.quote || "Their words about Velonx appear here.",
                        badge: form.badge || null,
                        subtitle: form.subtitle || null,
                        avatarUrl: form.avatarUrl || null,
                        accent: form.accent,
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
