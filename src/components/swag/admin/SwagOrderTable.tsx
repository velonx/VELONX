"use client";

import { useState, useEffect, useCallback } from "react";
import { Package, Zap, MapPin, Phone, User, ChevronDown, Loader2, Eye, X } from "lucide-react";
import Image from "next/image";
import toast from "react-hot-toast";
import { secureFetch } from "@/lib/utils/csrf";

const STATUSES = ["ALL", "PENDING", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"];

const STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  PROCESSING: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  SHIPPED: "bg-violet-500/10 text-violet-600 border-violet-500/20",
  DELIVERED: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  CANCELLED: "bg-red-500/10 text-red-600 border-red-500/20",
};

interface Order {
  id: string;
  xpSpent: number;
  quantity: number;
  status: string;
  fullName: string;
  phone: string;
  address: string;
  city: string;
  pincode: string;
  notes?: string;
  createdAt: string;
  user: { id: string; name: string; email: string; image?: string };
  item: { id: string; name: string; imageUrl?: string; category: string };
}

export default function SwagOrderTable() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [viewOrder, setViewOrder] = useState<Order | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const url = filterStatus === "ALL" ? "/api/admin/swag/orders" : `/api/admin/swag/orders?status=${filterStatus}`;
      const res = await fetch(url);
      const json = await res.json();
      if (json.success) { setOrders(json.data.orders); setStats(json.data.stats); }
    } catch { toast.error("Failed to load orders"); }
    finally { setLoading(false); }
  }, [filterStatus]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const updateStatus = async (orderId: string, status: string) => {
    setUpdatingId(orderId);
    try {
      const res = await secureFetch(`/api/admin/swag/orders/${orderId}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const json = await res.json();
      if (json.success) { toast.success(`Order marked as ${status}`); fetchOrders(); if (viewOrder?.id === orderId) setViewOrder(null); }
      else toast.error(json.error?.message || json.error || "Update failed");
    } catch { toast.error("Update failed"); }
    finally { setUpdatingId(null); }
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[
            { label: "Total", value: stats.total, color: "text-foreground" },
            { label: "Pending", value: stats.pending, color: "text-amber-500" },
            { label: "Processing", value: stats.processing, color: "text-blue-500" },
            { label: "Shipped", value: stats.shipped, color: "text-violet-500" },
            { label: "XP Redeemed", value: `${(stats.totalXpRedeemed || 0).toLocaleString()}`, color: "text-[#219EBC]" },
          ].map(s => (
            <div key={s.label} className="bg-card border border-border rounded-2xl p-4">
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">{s.label}</p>
              <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Filter */}
      <div className="flex gap-2 flex-wrap">
        {STATUSES.map(s => (
          <button key={s} onClick={() => setFilterStatus(s)} className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${filterStatus === s ? "bg-[#023047] text-white border-[#023047]" : "bg-card border-border text-muted-foreground hover:text-foreground"}`}>
            {s}
          </button>
        ))}
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-[#219EBC]" /></div>
      ) : (
        <div className="bg-card border border-border rounded-3xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  {["Order ID", "Student", "Item", "XP", "Status", "Date", "Actions"].map(h => (
                    <th key={h} className="text-left text-xs font-bold text-muted-foreground uppercase tracking-widest px-5 py-4">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {orders.map(order => (
                  <tr key={order.id} className="hover:bg-muted/20 transition-colors">
                    <td className="px-5 py-4 font-mono text-xs text-muted-foreground">#{order.id.slice(-8).toUpperCase()}</td>
                    <td className="px-5 py-4">
                      <div>
                        <p className="font-bold text-foreground text-sm">{order.user?.name}</p>
                        <p className="text-muted-foreground text-xs">{order.user?.email}</p>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-muted overflow-hidden flex-shrink-0">
                          {order.item?.imageUrl
                            ? <Image src={order.item.imageUrl} alt={order.item.name} width={32} height={32} className="object-cover w-full h-full" />
                            : <div className="w-full h-full flex items-center justify-center"><Package className="w-4 h-4 text-muted-foreground" /></div>
                          }
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-foreground line-clamp-1">{order.item?.name}</p>
                          <p className="text-xs text-muted-foreground">{order.item?.category}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1 text-amber-500 font-bold text-sm"><Zap className="w-3 h-3" />{order.xpSpent.toLocaleString()}</div>
                    </td>
                    <td className="px-5 py-4">
                      <select
                        value={order.status}
                        onChange={e => updateStatus(order.id, e.target.value)}
                        disabled={updatingId === order.id || order.status === "CANCELLED" || order.status === "DELIVERED"}
                        className={`text-xs font-bold px-3 py-1.5 rounded-lg border cursor-pointer focus:outline-none ${STATUS_COLORS[order.status] || ""} ${updatingId === order.id ? "opacity-50" : ""}`}
                      >
                        {["PENDING", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"].map(s => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-5 py-4 text-xs text-muted-foreground whitespace-nowrap">
                      {new Date(order.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                    </td>
                    <td className="px-5 py-4">
                      <button onClick={() => setViewOrder(order)} className="w-8 h-8 rounded-lg bg-muted hover:bg-[#219EBC]/10 hover:text-[#219EBC] flex items-center justify-center transition-colors">
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {orders.length === 0 && (
              <div className="text-center py-16 text-muted-foreground">
                <Package className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p className="font-semibold">No orders found</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Delivery detail modal */}
      {viewOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
          <div className="bg-card border border-border rounded-3xl w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-border">
              <div>
                <h3 className="text-lg font-black text-foreground">Order Details</h3>
                <p className="text-xs text-muted-foreground font-mono">#{viewOrder.id.slice(-8).toUpperCase()}</p>
              </div>
              <button onClick={() => setViewOrder(null)} className="w-8 h-8 rounded-xl bg-muted flex items-center justify-center hover:bg-muted/80"><X className="w-4 h-4" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className={`inline-flex px-3 py-1 rounded-lg text-xs font-bold border ${STATUS_COLORS[viewOrder.status]}`}>{viewOrder.status}</div>

              <div className="bg-muted/30 rounded-2xl p-4 space-y-2">
                <div className="flex items-center gap-2 text-[#219EBC] mb-2"><User className="w-4 h-4" /><span className="text-xs font-bold uppercase tracking-widest">Student</span></div>
                <p className="font-bold text-foreground">{viewOrder.user?.name}</p>
                <p className="text-muted-foreground text-sm">{viewOrder.user?.email}</p>
              </div>

              <div className="bg-muted/30 rounded-2xl p-4 space-y-2">
                <div className="flex items-center gap-2 text-[#219EBC] mb-2"><MapPin className="w-4 h-4" /><span className="text-xs font-bold uppercase tracking-widest">Delivery</span></div>
                <p className="font-bold text-foreground">{viewOrder.fullName}</p>
                <div className="flex items-center gap-1.5 text-muted-foreground text-sm"><Phone className="w-3.5 h-3.5" />{viewOrder.phone}</div>
                <p className="text-muted-foreground text-sm">{viewOrder.address}</p>
                <p className="text-muted-foreground text-sm">{viewOrder.city} - {viewOrder.pincode}</p>
                {viewOrder.notes && <p className="text-muted-foreground text-xs italic">Note: {viewOrder.notes}</p>}
              </div>

              <div className="bg-muted/30 rounded-2xl p-4">
                <div className="flex items-center gap-2 text-[#219EBC] mb-2"><Package className="w-4 h-4" /><span className="text-xs font-bold uppercase tracking-widest">Item</span></div>
                <p className="font-bold text-foreground">{viewOrder.item?.name}</p>
                <div className="flex items-center gap-1 text-amber-500 font-bold text-sm mt-1"><Zap className="w-3.5 h-3.5" />{viewOrder.xpSpent.toLocaleString()} XP</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
