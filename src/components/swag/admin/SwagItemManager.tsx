"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Edit2, Trash2, Loader2, Package, Zap, Image as ImageIcon, ToggleLeft, ToggleRight, X, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import toast from "react-hot-toast";

const CATEGORIES = ["NOTEBOOK", "DIARY", "BOTTLE", "BAG", "PLANT", "LAMP", "STATIONERY", "APPAREL", "OTHER"];

interface SwagItem {
  id: string;
  name: string;
  description: string;
  imageUrl: string | null;
  category: string;
  xpCost: number;
  stock: number;
  isActive: boolean;
  _count?: { orders: number };
}

const emptyForm = { name: "", description: "", category: "NOTEBOOK", xpCost: 500, stock: -1, isActive: true, imageUrl: "" };

export default function SwagItemManager() {
  const [items, setItems] = useState<SwagItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState<SwagItem | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/swag/items");
      const json = await res.json();
      if (json.success) setItems(json.data);
    } catch { toast.error("Failed to load items"); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  const openCreate = () => { setEditItem(null); setForm(emptyForm); setShowForm(true); };
  const openEdit = (item: SwagItem) => {
    setEditItem(item);
    setForm({ name: item.name, description: item.description, category: item.category, xpCost: item.xpCost, stock: item.stock, isActive: item.isActive, imageUrl: item.imageUrl || "" });
    setShowForm(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingImage(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("folder", "velonx/swag");
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const json = await res.json();
      if (json.success) { setForm(f => ({ ...f, imageUrl: json.url })); toast.success("Image uploaded"); }
      else toast.error(json.error?.message || "Upload failed");
    } catch { toast.error("Upload failed"); }
    finally { setUploadingImage(false); }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const url = editItem ? `/api/admin/swag/items/${editItem.id}` : "/api/admin/swag/items";
      const method = editItem ? "PUT" : "POST";
      const body = { ...form, imageUrl: form.imageUrl || null, stock: Number(form.stock), xpCost: Number(form.xpCost) };
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const json = await res.json();
      if (json.success) {
        toast.success(editItem ? "Item updated!" : "Item created!");
        setShowForm(false);
        fetchItems();
      } else { toast.error(json.error?.message || "Save failed"); }
    } catch { toast.error("Save failed"); }
    finally { setSaving(false); }
  };

  const handleToggle = async (item: SwagItem) => {
    try {
      const res = await fetch(`/api/admin/swag/items/${item.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !item.isActive }),
      });
      const json = await res.json();
      if (json.success) { toast.success(item.isActive ? "Item deactivated" : "Item activated"); fetchItems(); }
    } catch { toast.error("Failed to update"); }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold text-foreground">Swag Catalog</h3>
          <p className="text-muted-foreground text-sm">{items.length} items · {items.filter(i => i.isActive).length} active</p>
        </div>
        <Button onClick={openCreate} className="bg-gradient-to-r from-[#219EBC] to-violet-600 text-white font-bold rounded-xl h-10 px-5 flex items-center gap-2 hover:opacity-90">
          <Plus className="w-4 h-4" /> Add Item
        </Button>
      </div>

      {/* Items table */}
      {loading ? (
        <div className="flex items-center justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-[#219EBC]" /></div>
      ) : (
        <div className="bg-card border border-border rounded-3xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="text-left text-xs font-bold text-muted-foreground uppercase tracking-widest px-6 py-4">Item</th>
                  <th className="text-left text-xs font-bold text-muted-foreground uppercase tracking-widest px-4 py-4">Category</th>
                  <th className="text-left text-xs font-bold text-muted-foreground uppercase tracking-widest px-4 py-4">XP Cost</th>
                  <th className="text-left text-xs font-bold text-muted-foreground uppercase tracking-widest px-4 py-4">Stock</th>
                  <th className="text-left text-xs font-bold text-muted-foreground uppercase tracking-widest px-4 py-4">Orders</th>
                  <th className="text-left text-xs font-bold text-muted-foreground uppercase tracking-widest px-4 py-4">Status</th>
                  <th className="text-right text-xs font-bold text-muted-foreground uppercase tracking-widest px-6 py-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {items.map(item => (
                  <tr key={item.id} className="hover:bg-muted/20 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl overflow-hidden bg-muted flex-shrink-0">
                          {item.imageUrl
                            ? <Image src={item.imageUrl} alt={item.name} width={40} height={40} className="object-cover w-full h-full" />
                            : <div className="w-full h-full flex items-center justify-center"><Package className="w-5 h-5 text-muted-foreground" /></div>
                          }
                        </div>
                        <div>
                          <p className="font-bold text-foreground text-sm">{item.name}</p>
                          <p className="text-muted-foreground text-xs line-clamp-1 max-w-[200px]">{item.description}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4"><span className="text-xs font-bold bg-muted px-2 py-1 rounded-lg text-muted-foreground">{item.category}</span></td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-1 text-amber-500 font-bold text-sm"><Zap className="w-3.5 h-3.5" />{item.xpCost.toLocaleString()}</div>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`text-sm font-bold ${item.stock === -1 ? "text-emerald-500" : item.stock === 0 ? "text-red-500" : item.stock <= 5 ? "text-amber-500" : "text-foreground"}`}>
                        {item.stock === -1 ? "∞ Unlimited" : item.stock === 0 ? "Out of Stock" : `${item.stock} left`}
                      </span>
                    </td>
                    <td className="px-4 py-4"><span className="text-sm font-semibold text-foreground">{item._count?.orders ?? 0}</span></td>
                    <td className="px-4 py-4">
                      <button onClick={() => handleToggle(item)} className="flex items-center gap-1.5">
                        {item.isActive
                          ? <><ToggleRight className="w-5 h-5 text-emerald-500" /><span className="text-xs font-bold text-emerald-500">Active</span></>
                          : <><ToggleLeft className="w-5 h-5 text-muted-foreground" /><span className="text-xs font-bold text-muted-foreground">Inactive</span></>
                        }
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => openEdit(item)} className="w-8 h-8 rounded-lg bg-muted hover:bg-[#219EBC]/10 hover:text-[#219EBC] flex items-center justify-center transition-colors"><Edit2 className="w-3.5 h-3.5" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {items.length === 0 && (
              <div className="text-center py-16 text-muted-foreground">
                <Package className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p className="font-semibold">No swag items yet. Add your first one!</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
          <div className="bg-card border border-border rounded-3xl w-full max-w-lg shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h3 className="text-lg font-black text-foreground">{editItem ? "Edit Item" : "Add Swag Item"}</h3>
              <button onClick={() => setShowForm(false)} className="w-8 h-8 rounded-xl bg-muted flex items-center justify-center hover:bg-muted/80"><X className="w-4 h-4" /></button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              {/* Image upload */}
              <div>
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1.5 block">Product Image</label>
                <div className="flex items-center gap-3">
                  <div className="w-16 h-16 rounded-xl bg-muted flex items-center justify-center overflow-hidden flex-shrink-0">
                    {form.imageUrl
                      ? <Image src={form.imageUrl} alt="Preview" width={64} height={64} className="object-cover w-full h-full" />
                      : <ImageIcon className="w-6 h-6 text-muted-foreground" />
                    }
                  </div>
                  <label className="flex-1 cursor-pointer">
                    <div className="w-full h-10 border-2 border-dashed border-border rounded-xl flex items-center justify-center text-sm text-muted-foreground hover:border-[#219EBC] hover:text-[#219EBC] transition-colors">
                      {uploadingImage ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Uploading...</> : "Click to upload image"}
                    </div>
                    <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={uploadingImage} />
                  </label>
                </div>
              </div>

              {/* Name */}
              <div>
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1.5 block">Name *</label>
                <input required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Premium Velonx Notebook" className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-[#219EBC]/50" />
              </div>

              {/* Description */}
              <div>
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1.5 block">Description *</label>
                <textarea required rows={2} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Brief product description..." className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-[#219EBC]/50 resize-none" />
              </div>

              {/* Category + XP Cost */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1.5 block">Category</label>
                  <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-[#219EBC]/50">
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1.5 block">XP Cost *</label>
                  <input required type="number" min={1} value={form.xpCost} onChange={e => setForm(f => ({ ...f, xpCost: Number(e.target.value) }))} className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-[#219EBC]/50" />
                </div>
              </div>

              {/* Stock */}
              <div>
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1.5 block">Stock (-1 = unlimited)</label>
                <input type="number" min={-1} value={form.stock} onChange={e => setForm(f => ({ ...f, stock: Number(e.target.value) }))} className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-[#219EBC]/50" />
              </div>

              {/* Active toggle */}
              <div className="flex items-center gap-3">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Active</label>
                <button type="button" onClick={() => setForm(f => ({ ...f, isActive: !f.isActive }))} className={`relative w-12 h-6 rounded-full transition-colors ${form.isActive ? "bg-emerald-500" : "bg-muted"}`}>
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${form.isActive ? "left-7" : "left-1"}`} />
                </button>
              </div>

              <Button type="submit" disabled={saving} className="w-full h-11 bg-gradient-to-r from-[#219EBC] to-violet-600 text-white font-bold rounded-xl hover:opacity-90">
                {saving ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Saving...</> : <><Check className="w-4 h-4 mr-2" />{editItem ? "Update Item" : "Create Item"}</>}
              </Button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
