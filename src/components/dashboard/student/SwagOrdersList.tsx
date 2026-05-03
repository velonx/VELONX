"use client";

import { useState, useEffect } from "react";
import { Package, Truck, CheckCircle2, Clock, MapPin, Phone, ShoppingBag } from "lucide-react";
import { Card } from "@/components/ui/card";
import { format } from "date-fns";

interface SwagOrder {
  id: string;
  status: string;
  totalXp: number;
  fullName: string;
  phone: string;
  address: string;
  city: string;
  pincode: string;
  notes?: string;
  createdAt: string;
  item: {
    name: string;
    imageUrl: string | null;
    category: string;
  };
}

export default function SwagOrdersList() {
  const [orders, setOrders] = useState<SwagOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await fetch("/api/swag/orders/my");
        const json = await res.json();
        if (json.success) setOrders(json.data);
      } catch (err) {
        console.error("Failed to fetch swag orders:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "PENDING": return <Clock className="w-4 h-4 text-amber-500" />;
      case "SHIPPED": return <Truck className="w-4 h-4 text-blue-500" />;
      case "DELIVERED": return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case "CANCELLED": return <ShoppingBag className="w-4 h-4 text-red-500" />;
      default: return <Package className="w-4 h-4 text-slate-500" />;
    }
  };

  const getStatusBg = (status: string) => {
    switch (status) {
      case "PENDING": return "bg-amber-500/10 text-amber-500 border-amber-500/20";
      case "SHIPPED": return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      case "DELIVERED": return "bg-green-500/10 text-green-500 border-green-500/20";
      case "CANCELLED": return "bg-red-500/10 text-red-500 border-red-500/20";
      default: return "bg-slate-500/10 text-slate-500 border-slate-500/20";
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2].map((i) => (
          <Card key={i} className="p-6 bg-card border-border animate-pulse">
            <div className="flex gap-4">
              <div className="w-20 h-20 bg-muted rounded-xl" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-muted rounded w-1/4" />
                <div className="h-3 bg-muted rounded w-1/2" />
                <div className="h-3 bg-muted rounded w-1/3" />
              </div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <Card className="p-12 border-0 bg-muted/30 text-center rounded-[32px]">
        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
          <Package className="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 className="text-xl font-bold text-foreground mb-2">No Swag Orders Yet</h3>
        <p className="text-muted-foreground mb-6">Redeem your XP for awesome merchandise in the Swag Store!</p>
        <button 
          onClick={() => window.location.href = '/swag'}
          className="px-6 py-3 bg-[#219EBC] text-white rounded-2xl font-bold hover:shadow-lg hover:shadow-[#219EBC]/30 transition-all"
        >
          Go to Swag Store
        </button>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {orders.map((order) => (
        <Card key={order.id} className="overflow-hidden border-border bg-card rounded-[24px] shadow-sm hover:shadow-md transition-all">
          <div className="p-6">
            <div className="flex flex-col md:flex-row gap-6">
              {/* Item Image/Icon */}
              <div className="w-24 h-24 rounded-2xl bg-muted flex-shrink-0 overflow-hidden relative border border-border">
                {order.item.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={order.item.imageUrl} alt={order.item.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-3xl opacity-50">
                    🎁
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1">
                <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="text-lg font-bold text-foreground">{order.item.name}</h4>
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${getStatusBg(order.status)} flex items-center gap-1.5`}>
                        {getStatusIcon(order.status)}
                        {order.status}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground font-medium">
                      Ordered on {format(new Date(order.createdAt), "PPP")}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-black text-[#219EBC]">{order.totalXp} XP</p>
                    <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">Spent</p>
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-border">
                  <div className="flex items-start gap-3">
                    <MapPin className="w-4 h-4 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-xs font-bold text-foreground">Delivery Address</p>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {order.fullName}<br />
                        {order.address}, {order.city}<br />
                        {order.pincode}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Phone className="w-4 h-4 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-xs font-bold text-foreground">Contact Detail</p>
                      <p className="text-xs text-muted-foreground">{order.phone}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
