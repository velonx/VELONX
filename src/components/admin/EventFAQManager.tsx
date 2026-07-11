"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Trash2, Pencil, Save, X, Loader2, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import toast from "react-hot-toast";
import { secureFetch } from "@/lib/utils/csrf";

interface EventFAQ {
  id: string;
  eventId: string;
  question: string;
  answer: string;
  order: number;
  createdAt: string;
}

interface Props {
  eventId: string;
}

const emptyForm = {
  question: "",
  answer: "",
  order: "0",
};

export default function EventFAQManager({ eventId }: Props) {
  const [faqs, setFaqs] = useState<EventFAQ[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);

  const fetchFaqs = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/events/${eventId}/faqs`);
      const json = await res.json();
      if (json.success) setFaqs(json.data);
    } catch {
      toast.error("Failed to load FAQs");
    } finally {
      setLoading(false);
    }
  }, [eventId]);

  useEffect(() => {
    fetchFaqs();
  }, [fetchFaqs]);

  const openCreate = () => {
    setEditingId(null);
    setForm({ ...emptyForm, order: String(faqs.length) });
    setShowForm(true);
  };

  const openEdit = (faq: EventFAQ) => {
    setEditingId(faq.id);
    setForm({
      question: faq.question,
      answer: faq.answer,
      order: String(faq.order),
    });
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
    setForm(emptyForm);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.question.trim() || !form.answer.trim()) {
      toast.error("Question and Answer are required");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        question: form.question,
        answer: form.answer,
        order: parseInt(form.order) || 0,
      };

      let res;
      if (editingId) {
        res = await secureFetch(`/api/events/${eventId}/faqs/${editingId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        res = await secureFetch(`/api/events/${eventId}/faqs`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      const json = await res.json();
      if (json.success) {
        toast.success(editingId ? "FAQ updated" : "FAQ created");
        closeForm();
        fetchFaqs();
      } else {
        toast.error(json.error || "Failed to save FAQ");
      }
    } catch {
      toast.error("Network error saving FAQ");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (faqId: string) => {
    if (!confirm("Are you sure you want to delete this FAQ?")) return;

    try {
      const res = await secureFetch(`/api/events/${eventId}/faqs/${faqId}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (json.success) {
        toast.success("FAQ deleted");
        fetchFaqs();
      } else {
        toast.error(json.error || "Failed to delete FAQ");
      }
    } catch {
      toast.error("Network error deleting FAQ");
    }
  };

  return (
    <div className="border border-border rounded-2xl p-5 bg-card/40 mt-4">
      <div className="flex items-center justify-between gap-3 mb-4">
        <h4 className="font-bold text-sm text-foreground flex items-center gap-2">
          <HelpCircle className="w-4 h-4 text-[#F0771A]" />
          Event FAQs ({faqs.length})
        </h4>
        {!showForm && (
          <Button onClick={openCreate} size="sm" className="bg-[#F0771A] hover:bg-[#F0771A]/90 text-white rounded-xl gap-1">
            <Plus className="w-3.5 h-3.5" /> Add FAQ
          </Button>
        )}
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="space-y-4 border border-border p-4 rounded-xl bg-card mb-4">
          <div className="flex items-center justify-between mb-2">
            <h5 className="font-bold text-xs uppercase tracking-wider text-muted-foreground">
              {editingId ? "Edit FAQ" : "New FAQ"}
            </h5>
            <Button type="button" variant="ghost" size="icon" onClick={closeForm} className="h-6 w-6" aria-label="Close form">
              <X className="w-4 h-4" />
            </Button>
          </div>

          <div className="space-y-2">
            <Label htmlFor="question">Question</Label>
            <Input
              id="question"
              placeholder="e.g. Is this a beginner-friendly program?"
              value={form.question}
              onChange={(e) => setForm({ ...form, question: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="answer">Answer</Label>
            <Textarea
              id="answer"
              placeholder="e.g. Yes. This is a beginner-level program..."
              rows={3}
              value={form.answer}
              onChange={(e) => setForm({ ...form, answer: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="order">Sort Order</Label>
            <Input
              id="order"
              type="number"
              value={form.order}
              onChange={(e) => setForm({ ...form, order: e.target.value })}
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={closeForm} disabled={saving} className="rounded-xl">
              Cancel
            </Button>
            <Button type="submit" disabled={saving} className="bg-[#F0771A] hover:bg-[#F0771A]/90 text-white rounded-xl gap-1">
              {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
              Save FAQ
            </Button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="flex justify-center py-6">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      ) : faqs.length === 0 ? (
        <p className="text-xs text-muted-foreground text-center py-4">No FAQs added to this event yet.</p>
      ) : (
        <div className="space-y-2.5">
          {faqs.map((faq) => (
            <div key={faq.id} className="flex items-start justify-between gap-4 p-3 rounded-xl border border-border bg-card/30">
              <div className="space-y-1 min-w-0">
                <p className="font-bold text-xs text-foreground truncate">
                  {faq.order}. {faq.question}
                </p>
                <p className="text-xs text-muted-foreground line-clamp-2">{faq.answer}</p>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <Button variant="ghost" size="icon" onClick={() => openEdit(faq)} className="h-7 w-7 text-muted-foreground hover:text-foreground" aria-label="Edit FAQ">
                  <Pencil className="w-3.5 h-3.5" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => handleDelete(faq.id)} className="h-7 w-7 text-destructive hover:text-destructive" aria-label="Delete FAQ">
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
