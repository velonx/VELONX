"use client";

import { useState } from "react";
import { X, Zap, MapPin, Phone, User, FileText, Loader2, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import toast from "react-hot-toast";
import { secureFetch } from "@/lib/utils/csrf";

interface SwagItem {
  id: string;
  name: string;
  description: string;
  imageUrl: string | null;
  category: string;
  xpCost: number;
  stock: number;
}

interface Props {
  item: SwagItem;
  userXp: number;
  onClose: () => void;
  onSuccess: (order: any) => void;
}

export default function SwagCheckoutModal({ item, userXp, onClose, onSuccess }: Props) {
  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    address: "",
    city: "",
    pincode: "",
    notes: "",
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.fullName.trim() || form.fullName.length < 2) e.fullName = "Full name is required";
    if (!form.phone.trim() || form.phone.length < 7) e.phone = "Valid phone number required";
    if (!form.address.trim() || form.address.length < 5) e.address = "Delivery address is required";
    if (!form.city.trim()) e.city = "City is required";
    if (!form.pincode.trim() || form.pincode.length < 4) e.pincode = "Valid pincode is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const res = await secureFetch("/api/swag/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemId: item.id, quantity: 1, ...form }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        toast.error(json.error?.message || json.error || "Failed to place order");
        return;
      }
      onSuccess(json.data);
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const xpAfter = userXp - item.xpCost;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
      <div className="bg-card border border-border rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div>
            <h2 className="text-xl font-black text-foreground">Confirm Redemption</h2>
            <p className="text-sm text-muted-foreground mt-0.5">Enter your delivery details</p>
          </div>
          <button onClick={onClose} className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors">
            <X className="w-4 h-4 text-foreground" />
          </button>
        </div>

        {/* Item summary */}
        <div className="p-6 border-b border-border">
          <div className="flex items-center gap-4 bg-muted/50 rounded-2xl p-4">
            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-[#219EBC] to-violet-600 overflow-hidden flex-shrink-0 flex items-center justify-center">
              {item.imageUrl
                ? <Image src={item.imageUrl} alt={item.name} width={64} height={64} className="object-cover w-full h-full" />
                : <Package className="w-8 h-8 text-white" />
              }
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-foreground truncate">{item.name}</h3>
              <p className="text-muted-foreground text-sm">{item.category}</p>
            </div>
            <div className="text-right flex-shrink-0">
              <div className="flex items-center gap-1 text-amber-500 font-black">
                <Zap className="w-4 h-4" />
                {item.xpCost.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                After: <span className={xpAfter < 0 ? "text-red-500" : "text-foreground font-bold"}>{xpAfter.toLocaleString()} XP</span>
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
          {/* Full Name */}
          <div>
            <label className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1.5">
              <User className="w-3 h-3" /> Full Name *
            </label>
            <input
              type="text"
              placeholder="Your full name"
              value={form.fullName}
              onChange={e => setForm(f => ({ ...f, fullName: e.target.value }))}
              className={`w-full px-4 py-3 bg-background border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#219EBC]/50 transition-all text-sm ${errors.fullName ? "border-red-500" : "border-border"}`}
            />
            {errors.fullName && <p className="text-red-500 text-xs mt-1">{errors.fullName}</p>}
          </div>

          {/* Phone */}
          <div>
            <label className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1.5">
              <Phone className="w-3 h-3" /> Phone Number *
            </label>
            <input
              type="tel"
              placeholder="+91 98765 43210"
              value={form.phone}
              onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
              className={`w-full px-4 py-3 bg-background border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#219EBC]/50 transition-all text-sm ${errors.phone ? "border-red-500" : "border-border"}`}
            />
            {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
          </div>

          {/* Address */}
          <div>
            <label className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1.5">
              <MapPin className="w-3 h-3" /> Delivery Address *
            </label>
            <textarea
              placeholder="Street address, flat no., landmark..."
              value={form.address}
              onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
              rows={2}
              className={`w-full px-4 py-3 bg-background border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#219EBC]/50 transition-all text-sm resize-none ${errors.address ? "border-red-500" : "border-border"}`}
            />
            {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address}</p>}
          </div>

          {/* City + Pincode */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1.5 block">City *</label>
              <input
                type="text"
                placeholder="City"
                value={form.city}
                onChange={e => setForm(f => ({ ...f, city: e.target.value }))}
                className={`w-full px-4 py-3 bg-background border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#219EBC]/50 transition-all text-sm ${errors.city ? "border-red-500" : "border-border"}`}
              />
              {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city}</p>}
            </div>
            <div>
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1.5 block">Pincode *</label>
              <input
                type="text"
                placeholder="400001"
                value={form.pincode}
                onChange={e => setForm(f => ({ ...f, pincode: e.target.value }))}
                className={`w-full px-4 py-3 bg-background border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#219EBC]/50 transition-all text-sm ${errors.pincode ? "border-red-500" : "border-border"}`}
              />
              {errors.pincode && <p className="text-red-500 text-xs mt-1">{errors.pincode}</p>}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1.5">
              <FileText className="w-3 h-3" /> Notes (Optional)
            </label>
            <input
              type="text"
              placeholder="Any delivery instructions..."
              value={form.notes}
              onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
              className="w-full px-4 py-3 bg-background border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#219EBC]/50 transition-all text-sm"
            />
          </div>

          {/* Submit */}
          <Button
            type="submit"
            disabled={loading}
            className="w-full h-12 bg-gradient-to-r from-[#219EBC] to-violet-600 text-white font-bold rounded-xl hover:opacity-90 transition-all text-sm mt-2"
          >
            {loading ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Processing...</>
            ) : (
              <><Zap className="w-4 h-4 mr-2" /> Confirm & Redeem {item.xpCost.toLocaleString()} XP</>
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
