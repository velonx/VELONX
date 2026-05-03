"use client";

import { CheckCircle, Package, MapPin, Zap, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  order: {
    id: string;
    xpSpent: number;
    fullName: string;
    phone: string;
    address: string;
    city: string;
    pincode: string;
    item: { name: string; category: string };
  };
  onClose: () => void;
}

const STATUS_STEPS = ["PENDING", "PROCESSING", "SHIPPED", "DELIVERED"];

export function SwagOrderSuccess({ order, onClose }: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
      <div className="bg-card border border-border rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-300">
        {/* Success header */}
        <div className="relative bg-gradient-to-br from-emerald-500 to-green-600 p-8 text-center">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center hover:bg-white/30 transition-colors"
          >
            <X className="w-4 h-4 text-white" />
          </button>
          <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-white/30">
            <CheckCircle className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-2xl font-black text-white mb-1">Order Placed! 🎉</h2>
          <p className="text-white/80 text-sm">Your swag is on its way</p>
        </div>

        {/* Order details */}
        <div className="p-6 space-y-4">
          {/* Item */}
          <div className="flex items-center gap-3 bg-muted/50 rounded-2xl p-4">
            <div className="w-10 h-10 bg-gradient-to-br from-[#219EBC] to-violet-600 rounded-xl flex items-center justify-center">
              <Package className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <p className="font-bold text-foreground text-sm">{order.item?.name}</p>
              <p className="text-muted-foreground text-xs">{order.item?.category}</p>
            </div>
            <div className="flex items-center gap-1 text-amber-500 font-black text-sm">
              <Zap className="w-3.5 h-3.5" />
              {order.xpSpent?.toLocaleString()}
            </div>
          </div>

          {/* Delivery */}
          <div className="bg-muted/30 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <MapPin className="w-4 h-4 text-[#219EBC]" />
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Delivery To</span>
            </div>
            <p className="font-bold text-foreground text-sm">{order.fullName}</p>
            <p className="text-muted-foreground text-sm">{order.phone}</p>
            <p className="text-muted-foreground text-sm mt-1">{order.address}, {order.city} - {order.pincode}</p>
          </div>

          {/* Order ID */}
          <div className="flex items-center justify-between text-xs text-muted-foreground bg-muted/30 rounded-xl px-4 py-2.5">
            <span className="font-semibold">Order ID</span>
            <span className="font-mono text-foreground">#{order.id.slice(-8).toUpperCase()}</span>
          </div>

          {/* Status pipeline */}
          <div className="flex items-center justify-between pt-1">
            {STATUS_STEPS.map((step, i) => (
              <div key={step} className="flex items-center flex-1">
                <div className="flex flex-col items-center gap-1">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${i === 0 ? "bg-[#219EBC] text-white" : "bg-muted text-muted-foreground"}`}>
                    {i + 1}
                  </div>
                  <span className={`text-[9px] font-bold uppercase tracking-wide ${i === 0 ? "text-[#219EBC]" : "text-muted-foreground"}`}>{step}</span>
                </div>
                {i < STATUS_STEPS.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-1 ${i === 0 ? "bg-[#219EBC]/30" : "bg-muted"}`} />
                )}
              </div>
            ))}
          </div>

          <Button
            onClick={onClose}
            className="w-full h-11 bg-gradient-to-r from-[#219EBC] to-violet-600 text-white font-bold rounded-xl hover:opacity-90"
          >
            Continue Shopping
          </Button>
        </div>
      </div>
    </div>
  );
}
