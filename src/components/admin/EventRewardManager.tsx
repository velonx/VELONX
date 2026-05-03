"use client";

import { useState, useEffect } from "react";
import { Trophy, Star, Gift, Medal, Zap, Award, Plus, Trash2, Pencil, Save, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import toast from "react-hot-toast";
import { secureFetch } from "@/lib/utils/csrf";

type IconType = "trophy" | "star" | "gift" | "certificate" | "medal" | "zap";

interface EventReward {
  id: string;
  eventId: string;
  title: string;
  description: string;
  iconType: IconType;
  rankRequired: number | null;
  quantity: number | null;
  order: number;
  createdAt: string;
}

interface Props {
  eventId: string;
}

const ICONS: { value: IconType; label: string; icon: React.ReactNode }[] = [
  { value: "trophy",      label: "Trophy",      icon: <Trophy className="w-4 h-4 text-[#FFB703]" /> },
  { value: "star",        label: "Star",        icon: <Star className="w-4 h-4 text-[#F9A8D4]" /> },
  { value: "gift",        label: "Gift",        icon: <Gift className="w-4 h-4 text-[#6EE7B7]" /> },
  { value: "certificate", label: "Certificate", icon: <Award className="w-4 h-4 text-[#219EBC]" /> },
  { value: "medal",       label: "Medal",       icon: <Medal className="w-4 h-4 text-orange-400" /> },
  { value: "zap",         label: "Zap",         icon: <Zap className="w-4 h-4 text-purple-400" /> },
];

const getIcon = (type: IconType, size = "w-5 h-5") => {
  switch (type) {
    case "trophy":      return <Trophy className={`${size} text-[#FFB703]`} />;
    case "star":        return <Star className={`${size} text-[#F9A8D4]`} />;
    case "gift":        return <Gift className={`${size} text-[#6EE7B7]`} />;
    case "certificate": return <Award className={`${size} text-[#219EBC]`} />;
    case "medal":       return <Medal className={`${size} text-orange-400`} />;
    case "zap":         return <Zap className={`${size} text-purple-400`} />;
  }
};

const emptyForm = {
  title: "",
  description: "",
  iconType: "trophy" as IconType,
  rankRequired: "",
  quantity: "",
  order: "0",
};

export default function EventRewardManager({ eventId }: Props) {
  const [rewards, setRewards] = useState<EventReward[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    fetchRewards();
  }, [eventId]);

  const fetchRewards = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/events/${eventId}/rewards`);
      const json = await res.json();
      if (json.success) setRewards(json.data);
    } catch {
      toast.error("Failed to load rewards");
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => {
    setEditingId(null);
    setForm({ ...emptyForm, order: String(rewards.length) });
    setShowForm(true);
  };

  const openEdit = (r: EventReward) => {
    setEditingId(r.id);
    setForm({
      title: r.title,
      description: r.description,
      iconType: r.iconType,
      rankRequired: r.rankRequired != null ? String(r.rankRequired) : "",
      quantity: r.quantity != null ? String(r.quantity) : "",
      order: String(r.order),
    });
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        title: form.title,
        description: form.description,
        iconType: form.iconType,
        rankRequired: form.rankRequired ? parseInt(form.rankRequired) : null,
        quantity: form.quantity ? parseInt(form.quantity) : null,
        order: parseInt(form.order) || 0,
      };

      if (editingId) {
        const res = await secureFetch(`/api/events/${eventId}/rewards/${editingId}`, {
          method: "PATCH",
          body: JSON.stringify(payload),
        });
        const json = await res.json();
        if (!json.success) throw new Error(json.error);
        toast.success("Reward updated");
      } else {
        const res = await secureFetch(`/api/events/${eventId}/rewards`, {
          method: "POST",
          body: JSON.stringify(payload),
        });
        const json = await res.json();
        if (!json.success) throw new Error(json.error);
        toast.success("Reward added");
      }
      setShowForm(false);
      setEditingId(null);
      fetchRewards();
    } catch (err: any) {
      toast.error(err.message || "Failed to save reward");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (rewardId: string) => {
    if (!confirm("Delete this reward?")) return;
    try {
      const res = await secureFetch(`/api/events/${eventId}/rewards/${rewardId}`, { method: "DELETE" });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      toast.success("Reward deleted");
      fetchRewards();
    } catch {
      toast.error("Failed to delete reward");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-bold text-foreground text-base">Event Rewards</h3>
          <p className="text-muted-foreground text-xs mt-0.5">Prizes displayed on the public event page</p>
        </div>
        <Button size="sm" onClick={openCreate} className="bg-[#219EBC] hover:bg-[#1a7a94] text-white rounded-lg gap-1.5">
          <Plus className="w-3.5 h-3.5" /> Add Reward
        </Button>
      </div>

      {/* Reward Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="rounded-2xl border border-border bg-muted/30 p-5 space-y-4">
          <div className="flex items-center justify-between mb-1">
            <p className="font-semibold text-sm text-foreground">{editingId ? "Edit Reward" : "New Reward"}</p>
            <button type="button" onClick={() => setShowForm(false)} className="text-muted-foreground hover:text-foreground">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label className="text-xs font-semibold">Title *</Label>
              <Input
                required value={form.title} placeholder="e.g. Certificate of Excellence"
                onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                className="h-9 text-sm rounded-lg"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-semibold">Icon</Label>
              <Select value={form.iconType} onValueChange={v => setForm(f => ({ ...f, iconType: v as IconType }))}>
                <SelectTrigger className="h-9 text-sm rounded-lg">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ICONS.map(ic => (
                    <SelectItem key={ic.value} value={ic.value}>
                      <span className="flex items-center gap-2">{ic.icon} {ic.label}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1">
            <Label className="text-xs font-semibold">Description *</Label>
            <Textarea
              required value={form.description} placeholder="Describe what participants receive..."
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              className="text-sm rounded-lg resize-none" rows={2}
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1">
              <Label className="text-xs font-semibold">Top N finishers only</Label>
              <Input
                type="number" min={1} value={form.rankRequired} placeholder="All"
                onChange={e => setForm(f => ({ ...f, rankRequired: e.target.value }))}
                className="h-9 text-sm rounded-lg"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-semibold">Max winners</Label>
              <Input
                type="number" min={1} value={form.quantity} placeholder="Unlimited"
                onChange={e => setForm(f => ({ ...f, quantity: e.target.value }))}
                className="h-9 text-sm rounded-lg"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-semibold">Display order</Label>
              <Input
                type="number" min={0} value={form.order}
                onChange={e => setForm(f => ({ ...f, order: e.target.value }))}
                className="h-9 text-sm rounded-lg"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-1">
            <Button type="submit" disabled={saving} size="sm" className="bg-[#219EBC] hover:bg-[#1a7a94] text-white rounded-lg gap-1.5">
              {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
              {saving ? "Saving..." : "Save Reward"}
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={() => setShowForm(false)} className="rounded-lg">Cancel</Button>
          </div>
        </form>
      )}

      {/* Rewards List */}
      {loading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
        </div>
      ) : rewards.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground text-sm border border-dashed border-border rounded-2xl">
          No rewards added yet. Click "Add Reward" to create one.
        </div>
      ) : (
        <div className="space-y-3">
          {rewards.map(r => (
            <div key={r.id} className="flex items-start gap-4 p-4 rounded-xl border border-border bg-card hover:border-[#219EBC]/30 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center flex-shrink-0">
                {getIcon(r.iconType)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-semibold text-sm text-foreground">{r.title}</p>
                  {r.rankRequired && (
                    <span className="text-[10px] bg-[#219EBC]/10 text-[#219EBC] px-2 py-0.5 rounded-full font-semibold">
                      Top {r.rankRequired}
                    </span>
                  )}
                  {r.quantity && (
                    <span className="text-[10px] bg-muted text-muted-foreground px-2 py-0.5 rounded-full font-semibold">
                      ×{r.quantity}
                    </span>
                  )}
                </div>
                <p className="text-muted-foreground text-xs mt-0.5 line-clamp-2">{r.description}</p>
              </div>
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <button onClick={() => openEdit(r)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
                  <Pencil className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => handleDelete(r.id)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-50 text-muted-foreground hover:text-red-500 transition-colors dark:hover:bg-red-950">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
