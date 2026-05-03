"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import {
  Zap, Package, Search, ChevronDown, Check, X,
  Gift, Truck, Sparkles, ShoppingBag
} from "lucide-react";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";
import SwagCheckoutModal from "@/components/swag/SwagCheckoutModal";
import { SwagOrderSuccess } from "@/components/swag/SwagOrderSuccess";

type SwagCategory = "ALL" | "NOTEBOOK" | "DIARY" | "BOTTLE" | "BAG" | "PLANT" | "LAMP" | "STATIONERY" | "APPAREL" | "OTHER";

interface SwagItem {
  id: string;
  name: string;
  description: string;
  imageUrl: string | null;
  category: string;
  xpCost: number;
  stock: number;
  isActive: boolean;
}

const CATEGORIES: { value: SwagCategory; label: string; emoji: string }[] = [
  { value: "ALL", label: "All Categories", emoji: "🛍️" },
  { value: "NOTEBOOK", label: "Notebook", emoji: "📓" },
  { value: "DIARY", label: "Diary", emoji: "📔" },
  { value: "BOTTLE", label: "Bottle", emoji: "🍶" },
  { value: "BAG", label: "Bag", emoji: "🎒" },
  { value: "PLANT", label: "Plant", emoji: "🪴" },
  { value: "LAMP", label: "Lamp", emoji: "💡" },
  { value: "STATIONERY", label: "Stationery", emoji: "✏️" },
  { value: "APPAREL", label: "Apparel", emoji: "👕" },
  { value: "OTHER", label: "Other", emoji: "🎁" },
];

const CATEGORY_GRADIENTS: Record<string, string> = {
  NOTEBOOK: "from-slate-800/40 to-slate-900/40",
  DIARY:    "from-slate-800/40 to-slate-900/40",
  BOTTLE:   "from-slate-800/40 to-slate-900/40",
  BAG:      "from-slate-800/40 to-slate-900/40",
  PLANT:    "from-slate-800/40 to-slate-900/40",
  LAMP:     "from-slate-800/40 to-slate-900/40",
  STATIONERY: "from-slate-800/40 to-slate-900/40",
  APPAREL:  "from-slate-800/40 to-slate-900/40",
  OTHER:    "from-slate-800/40 to-slate-900/40",
};

const CATEGORY_ICONS: Record<string, string> = {
  NOTEBOOK: "📓", DIARY: "📔", BOTTLE: "🍶", BAG: "🎒",
  PLANT: "🪴", LAMP: "💡", STATIONERY: "✏️", APPAREL: "👕", OTHER: "🎁",
};

export default function SwagPage() {
  const { data: session } = useSession();
  const [items, setItems] = useState<SwagItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<SwagCategory>("ALL");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [userXp, setUserXp] = useState<number | null>(null);
  const [selectedItem, setSelectedItem] = useState<SwagItem | null>(null);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [successOrder, setSuccessOrder] = useState<any>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const url = activeCategory === "ALL"
        ? "/api/swag/items"
        : `/api/swag/items?category=${activeCategory}`;
      const res = await fetch(url);
      const json = await res.json();
      if (json.success) setItems(json.data);
    } catch { toast.error("Failed to load swag items"); }
    finally { setLoading(false); }
  }, [activeCategory]);

  const fetchUserXp = useCallback(async () => {
    if (!session?.user) return;
    try {
      const res = await fetch("/api/user/profile");
      const json = await res.json();
      if (json.success) setUserXp(json.data.xp ?? 0);
    } catch {}
  }, [session]);

  useEffect(() => { fetchItems(); }, [fetchItems]);
  useEffect(() => { fetchUserXp(); }, [fetchUserXp]);

  const filtered = items.filter(item =>
    item.name.toLowerCase().includes(search.toLowerCase()) ||
    item.description.toLowerCase().includes(search.toLowerCase())
  );

  const handleRedeem = (item: SwagItem) => {
    if (!session) { toast.error("Please sign in to redeem swag"); return; }
    setSelectedItem(item);
    setCheckoutOpen(true);
  };

  const handleOrderSuccess = (order: any) => {
    setCheckoutOpen(false);
    setSelectedItem(null);
    setSuccessOrder(order);
    fetchUserXp();
    fetchItems();
  };

  const activeCategoryLabel = CATEGORIES.find(c => c.value === activeCategory);

  return (
    <div className="min-h-screen bg-background transition-colors duration-300">
      {/* ─── HERO ──────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden min-h-[500px] flex items-center pt-20 border-b border-border">
        {/* Background layers */}
        <div className="absolute inset-0 bg-background" />
        
        {/* Subtle glows - Adjusted for theme responsiveness */}
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] pointer-events-none opacity-50" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-muted/20 rounded-full blur-[120px] pointer-events-none opacity-50" />
        
        {/* Dot grid - Adaptive opacity */}
        <div
          className="absolute inset-0 opacity-[0.03] dark:opacity-[0.02] pointer-events-none"
          style={{
            backgroundImage: "radial-gradient(circle, currentColor 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />

        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-12 w-full py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

            {/* ── LEFT: Content ── */}
            <div className="space-y-8">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-border bg-muted/50 backdrop-blur-sm">
                <Sparkles className="w-3.5 h-3.5 text-muted-foreground" />
                <span className="text-muted-foreground text-[10px] font-black uppercase tracking-[0.2em]">
                  Premium Swag · XP Rewards
                </span>
              </div>

              {/* Headline */}
              <div className="space-y-4">
                <h1 className="font-black leading-[1] tracking-tight text-foreground" style={{ fontFamily: "var(--font-space-grotesk)", fontSize: "clamp(3.5rem,7vw,5rem)" }}>
                  Velonx<br />
                  <span className="text-muted-foreground/30">Swag Store</span>
                </h1>
                <p className="text-muted-foreground text-lg leading-relaxed max-w-lg font-medium">
                  Exclusive merchandise for the Velonx community. 
                  Redeem your hard-earned XP for high-quality student essentials.
                </p>
              </div>

              {/* XP Balance card - Theme Responsive */}
              <div
                className="inline-flex items-center gap-5 px-8 py-5 rounded-[2rem] border border-border shadow-2xl transition-all"
                style={{ background: "var(--card)", backdropFilter: "blur(40px)" }}
              >
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20 flex-shrink-0 shadow-inner">
                  <Zap className="w-7 h-7 text-primary" />
                </div>
                <div>
                  <p className="text-muted-foreground text-[10px] font-black uppercase tracking-[0.25em] mb-1">Available XP</p>
                  <p className="text-foreground font-black text-3xl tracking-tighter" style={{ fontFamily: "var(--font-space-grotesk)" }}>
                    {session
                      ? userXp !== null
                        ? <span>{userXp.toLocaleString()}</span>
                        : "..."
                      : <span className="text-muted-foreground/40 text-lg font-bold">Sign in</span>
                    }
                  </p>
                </div>
              </div>

              {/* Mini stat pills */}
              <div className="flex flex-wrap gap-4">
                {[
                  { icon: Gift,      label: "42+ Items" },
                  { icon: Truck,     label: "Global Shipping" },
                ].map(({ icon: Icon, label }) => (
                  <div key={label} className="flex items-center gap-2.5 px-5 py-2.5 rounded-2xl border border-border bg-muted/30">
                    <Icon className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground text-xs font-bold uppercase tracking-wider">{label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* ── RIGHT: Hero image Container ── */}
            <div className="relative group">
              <div className="absolute -inset-4 bg-gradient-to-tr from-primary/5 to-transparent rounded-[3rem] blur-2xl opacity-50 pointer-events-none" />
              <div className="relative aspect-square w-full max-w-[500px] mx-auto rounded-[3rem] border border-border bg-card/50 flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-muted/20 to-transparent" />
                <Image
                  src="/swag-hero.webp" 
                  alt="Swag Hero"
                  fill
                  className="object-contain p-8 group-hover:scale-110 transition-transform duration-700"
                  priority
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── PRODUCTS SECTION ──────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-6 lg:px-12 py-16">
        {/* Search & Filter Row */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-12">
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto flex-1">
            {/* Search Input */}
            <div className="relative w-full sm:max-w-md group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/40 group-focus-within:text-muted-foreground transition-colors" />
              <input
                type="text"
                placeholder="Search premium swag..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-11 pr-10 py-3.5 rounded-2xl border border-border text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/5 transition-all text-sm font-medium bg-muted/20"
              />
              {search && (
                <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground/40 hover:text-muted-foreground transition-colors">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Category Dropdown */}
            <div ref={dropdownRef} className="relative w-full sm:w-fit">
              <button
                onClick={() => setDropdownOpen(o => !o)}
                className="w-full sm:w-fit flex items-center justify-between gap-4 px-5 py-3.5 rounded-2xl border border-border text-foreground font-bold text-sm transition-all hover:bg-muted group bg-muted/20"
              >
                <div className="flex items-center gap-3">
                  <span className="text-base grayscale group-hover:grayscale-0 transition-all">{activeCategoryLabel?.emoji}</span>
                  <span className="tracking-wide uppercase text-[11px]">{activeCategoryLabel?.label}</span>
                </div>
                <ChevronDown className={`w-4 h-4 text-muted-foreground/50 transition-transform ${dropdownOpen ? "rotate-180" : ""}`} />
              </button>

              {dropdownOpen && (
                <div
                  className="absolute top-full left-0 mt-3 w-full sm:w-64 rounded-[2rem] border border-border shadow-2xl z-50 overflow-hidden py-2 bg-popover"
                >
                  <div className="px-4 py-2 border-b border-border mb-2">
                    <p className="text-muted-foreground/40 text-[9px] font-black uppercase tracking-[0.2em]">Filter by Category</p>
                  </div>
                  <div className="max-h-72 overflow-y-auto custom-scrollbar">
                    {CATEGORIES.map(cat => (
                      <button
                        key={cat.value}
                        onClick={() => { setActiveCategory(cat.value); setDropdownOpen(false); }}
                        className={`w-full flex items-center gap-4 px-5 py-3 text-xs font-bold uppercase tracking-widest transition-all hover:bg-muted ${
                          activeCategory === cat.value
                            ? "text-primary bg-primary/5"
                            : "text-muted-foreground"
                        }`}
                      >
                        <span className={`text-base ${activeCategory === cat.value ? "" : "grayscale opacity-50"}`}>{cat.emoji}</span>
                        <span className="flex-1 text-left">{cat.label}</span>
                        {activeCategory === cat.value && <div className="w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_10px_rgba(33,158,188,0.5)]" />}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
             <div className="h-px w-8 bg-border hidden lg:block" />
             <p className="text-muted-foreground/40 text-[10px] font-black uppercase tracking-[0.2em] whitespace-nowrap">
              {filtered.length} Results {activeCategory !== "ALL" && <span className="text-muted-foreground/60">/ {activeCategoryLabel?.label}</span>}
            </p>
          </div>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="rounded-3xl overflow-hidden animate-pulse border border-border bg-muted/20">
                <div className="aspect-square bg-muted/40" />
                <div className="p-5 space-y-3">
                  <div className="h-4 bg-muted/40 rounded-xl w-3/4" />
                  <div className="h-3 bg-muted/40 rounded-xl w-full" />
                  <div className="h-3 bg-muted/40 rounded-xl w-1/2" />
                  <div className="h-10 bg-muted/40 rounded-xl mt-4" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-28">
            <Package className="w-16 h-16 text-muted-foreground/10 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-muted-foreground/50 mb-2">No items found</h3>
            <p className="text-muted-foreground/30 text-sm">Try a different category or clear your search</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filtered.map(item => {
              const canAfford = session && userXp !== null && userXp >= item.xpCost;
              const isOutOfStock = item.stock === 0;
              const gradient = CATEGORY_GRADIENTS[item.category] || "from-slate-800/40 to-slate-900/40";

              return (
                <div
                  key={item.id}
                  className={`group rounded-3xl overflow-hidden flex flex-col border border-border transition-all duration-300 hover:-translate-y-1 hover:border-primary/20 hover:shadow-xl hover:shadow-primary/5 bg-card ${isOutOfStock ? "opacity-50" : ""}`}
                >
                  {/* Image */}
                  <div className={`relative aspect-square bg-gradient-to-br ${gradient} overflow-hidden`}>
                    {item.imageUrl ? (
                      <Image
                        src={item.imageUrl}
                        alt={item.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-6xl">
                        {CATEGORY_ICONS[item.category] || "🎁"}
                      </div>
                    )}

                    {/* XP badge */}
                    <div
                      className="absolute top-3 right-3 text-white text-xs font-black px-3 py-1.5 rounded-xl flex items-center gap-1 border border-white/10"
                      style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)" }}
                    >
                      <Zap className="w-3 h-3 text-amber-400" />
                      {item.xpCost.toLocaleString()}
                    </div>

                    {/* Stock badge */}
                    {item.stock !== -1 && item.stock > 0 && item.stock <= 5 && (
                      <div className="absolute top-3 left-3 bg-red-500/90 text-white text-[10px] font-bold px-2 py-1 rounded-lg backdrop-blur-sm">
                        Only {item.stock} left!
                      </div>
                    )}
                    {isOutOfStock && (
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-sm">
                        <span className="text-white font-bold px-4 py-2 rounded-xl text-sm border border-white/10" style={{ background: "rgba(0,0,0,0.7)" }}>Out of Stock</span>
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="p-5 flex flex-col flex-1">
                    <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground mb-2 block">{item.category}</span>
                    <h3 className="font-bold text-foreground text-base mb-1 leading-tight line-clamp-1">{item.name}</h3>
                    <p className="text-muted-foreground text-xs leading-relaxed line-clamp-2 flex-1 mb-4">{item.description}</p>

                    <button
                      onClick={() => handleRedeem(item)}
                      disabled={isOutOfStock || (!canAfford && !!session && userXp !== null)}
                      className={`w-full h-10 rounded-xl font-bold text-sm transition-all ${
                        isOutOfStock || (!canAfford && !!session && userXp !== null)
                          ? "bg-muted text-muted-foreground cursor-not-allowed border border-border"
                          : "bg-primary text-primary-foreground hover:opacity-90 hover:scale-[1.02] active:scale-95 shadow-lg shadow-primary/20"
                      }`}
                    >
                      {isOutOfStock
                        ? "Out of Stock"
                        : !session
                        ? "Sign in to Redeem"
                        : !canAfford && userXp !== null
                        ? `Need ${(item.xpCost - userXp).toLocaleString()} more XP`
                        : "Redeem Now"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Checkout Modal */}
      {checkoutOpen && selectedItem && (
        <SwagCheckoutModal
          item={selectedItem}
          userXp={userXp ?? 0}
          onClose={() => { setCheckoutOpen(false); setSelectedItem(null); }}
          onSuccess={handleOrderSuccess}
        />
      )}

      {/* Order Success */}
      {successOrder && (
        <SwagOrderSuccess
          order={successOrder}
          onClose={() => setSuccessOrder(null)}
        />
      )}
    </div>
  );
}
