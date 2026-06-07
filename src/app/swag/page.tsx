"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { Zap, Package, Search, ChevronDown, X, Gift, Truck, Sparkles } from 'lucide-react';
import toast from "react-hot-toast";
import SwagCheckoutModal from "@/components/swag/SwagCheckoutModal";
import { SwagOrderSuccess } from "@/components/swag/SwagOrderSuccess";
import { Skeleton } from "@/components/ui/skeleton";

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
    <div className="min-h-screen bg-background pb-20">
      {/* Page Hero */}
      <header className="relative pt-28 pb-12 overflow-hidden border-b border-border/30">
        <div className="container mx-auto px-4 max-w-5xl text-center relative z-10">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/20 bg-primary/5 text-xs font-semibold text-primary mb-4">
            <Sparkles className="w-3.5 h-3.5" /> GAMIFIED REWARDS
          </span>
          <h1 className="text-4xl sm:text-5xl font-black text-[#29292B] dark:text-[#FFFBDB] mb-4 tracking-tight leading-tight">
            Velonx <span className="text-primary">Swag Store</span>
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
            Participate in learning events, showcase projects, assist community members, earn XP, and redeem premium swag.
          </p>
        </div>
      </header>

      {/* XP Wallet Banner */}
      <section className="py-8">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="card-redesign card-glass-redesign flex flex-col md:flex-row justify-between items-center gap-6 p-6 sm:p-8">
            <div className="text-center md:text-left space-y-2">
              <h2 className="text-xl font-bold text-foreground">Your Wallet &amp; XP Ledger</h2>
              <p className="text-sm text-muted-foreground max-w-lg leading-relaxed">
                You earn 50 XP for attending webinars, 100 for hackathons, 150 for projects, and 200 for winning coding competitions.
              </p>
            </div>
            <div className="flex items-center gap-4 bg-muted/10 border border-border/40 p-4 px-6 rounded-2xl shrink-0 w-full md:w-auto justify-between md:justify-start">
              <div className="text-left space-y-1">
                <div className="text-[10px] text-muted-foreground font-black uppercase tracking-wider">Balance</div>
                <div className="flex items-center gap-1.5">
                  {session ? (
                    userXp !== null ? (
                      <span className="text-2xl sm:text-3xl font-black text-primary font-mono">{userXp.toLocaleString()} XP</span>
                    ) : (
                      <span className="text-2xl font-black text-muted-foreground animate-pulse">...</span>
                    )
                  ) : (
                    <span className="text-sm font-bold text-muted-foreground">Sign in to view XP</span>
                  )}
                </div>
              </div>
              <span className="text-3xl shrink-0" role="img" aria-label="coin">🪙</span>
            </div>
          </div>
        </div>
      </section>

      {/* ─── PRODUCTS SECTION ──────────────────────────────────────── */}
      <section className="max-w-5xl mx-auto px-4 py-6">
        {/* Search & Filter Row */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mb-10">
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
          <div className="relative w-full sm:w-64" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="w-full flex items-center justify-between px-4 py-3.5 rounded-2xl border border-border bg-muted/20 hover:bg-muted/30 text-foreground transition-all text-sm font-medium focus:outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/5"
            >
              <span className="flex items-center gap-2">
                <span className="text-base">{activeCategoryLabel?.emoji}</span>
                <span>{activeCategoryLabel?.label}</span>
              </span>
              <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${dropdownOpen ? "rotate-180" : ""}`} />
            </button>

            {dropdownOpen && (
              <div className="absolute left-0 right-0 mt-2 p-1.5 bg-card border border-border rounded-2xl shadow-xl z-50 max-h-80 overflow-y-auto">
                {CATEGORIES.map(cat => (
                  <button
                    key={cat.value}
                    onClick={() => {
                      setActiveCategory(cat.value);
                      setDropdownOpen(false);
                    }}
                    className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-left text-sm font-medium transition-colors hover:bg-muted/40 ${
                      activeCategory === cat.value ? "bg-primary/10 text-primary" : "text-foreground"
                    }`}
                  >
                    <span className="text-base">{cat.emoji}</span>
                    <span>{cat.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="card-redesign card-glass-redesign swag-card pointer-events-none flex flex-col justify-between gap-4">
                <div className="flex flex-col flex-1 gap-3">
                  <Skeleton className="w-full h-48 rounded-xl bg-muted/20" />
                  <Skeleton className="h-5 rounded w-3/4 mt-4 bg-muted/20" />
                  <Skeleton className="h-4 rounded w-full bg-muted/20" />
                  <Skeleton className="h-4 rounded w-5/6 bg-muted/20" />
                </div>
                <div className="flex justify-between items-center pt-4 border-t border-border/40 mt-6">
                  <Skeleton className="h-6 rounded w-1/3 bg-muted/20" />
                  <Skeleton className="h-8 rounded w-1/4 bg-muted/20" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-28 border border-dashed border-border/50 rounded-3xl bg-muted/5">
            <Package className="w-16 h-16 text-muted-foreground/20 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-muted-foreground/60 mb-2">No items found</h3>
            <p className="text-muted-foreground/40 text-sm">Try a different category or clear your search</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {filtered.map(item => {
              const canAfford = session && userXp !== null && userXp >= item.xpCost;
              const isOutOfStock = item.stock === 0;
              return (
                <div
                  key={item.id}
                  className={`card-redesign card-glass-redesign swag-card flex flex-col justify-between transition-all duration-300 group relative ${isOutOfStock ? "opacity-50" : ""}`}
                >
                  <div className="flex flex-col flex-1 relative">
                    {isOutOfStock && (
                      <span className="absolute top-3 left-3 z-10 px-2.5 py-1 rounded-lg bg-red-500/10 border border-red-500/25 text-[10px] font-extrabold uppercase tracking-wider text-red-500">
                        OUT OF STOCK
                      </span>
                    )}
                    {item.stock !== -1 && item.stock > 0 && item.stock <= 5 && (
                      <span className="absolute top-3 left-3 z-10 px-2.5 py-1 rounded-lg bg-orange-500/10 border border-orange-500/25 text-[10px] font-extrabold uppercase tracking-wider text-orange-500">
                        ONLY {item.stock} LEFT!
                      </span>
                    )}
                    
                    <div className="swag-img-container w-full h-48 rounded-xl bg-muted/15 border border-border/40 flex items-center justify-center mb-4 relative overflow-hidden">
                      {item.imageUrl ? (
                        <Image
                          src={item.imageUrl}
                          alt={item.name}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        />
                      ) : (
                        <span className="swag-graphic text-4xl group-hover:scale-115 transition-transform duration-500">{CATEGORY_ICONS[item.category] || "🎁"}</span>
                      )}
                    </div>

                    <h2 className="text-lg font-bold text-foreground mb-2 line-clamp-1 group-hover:text-primary transition-colors">{item.name}</h2>
                    <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2 mb-6 grow">{item.description}</p>
                  </div>

                  <div className="swag-price-box flex items-center justify-between pt-4 border-t border-border/40 mt-auto">
                    <span className="swag-coins font-mono text-base font-bold text-primary">{item.xpCost.toLocaleString()} XP</span>
                    <button
                      onClick={() => handleRedeem(item)}
                      disabled={isOutOfStock || (!canAfford && !!session && userXp !== null)}
                      className={`btn-redesign text-xs py-2 px-4 font-bold shadow-md cursor-pointer transition-all ${
                        isOutOfStock || (!canAfford && !!session && userXp !== null)
                          ? "btn-redesign-secondary cursor-not-allowed opacity-50"
                          : "btn-redesign-primary hover:scale-[1.03] active:scale-[0.97]"
                      }`}
                    >
                      {isOutOfStock
                        ? "Sold Out"
                        : !session
                        ? "Sign In"
                        : !canAfford && userXp !== null
                        ? `Need ${item.xpCost - userXp} XP`
                        : "Redeem"}
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
