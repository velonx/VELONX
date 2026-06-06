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
    <div className="min-h-screen bg-background">
      {/* Page Hero */}
      <header className="page-hero">
        <div className="page-hero-bg"></div>
        <div className="container text-center py-16">
          <span className="section-label-redesign justify-center inline-flex mb-4">GAMIFIED REWARDS</span>
          <h1 className="display-1 text-5xl font-black text-foreground mb-4">
            Velonx <span className="title-accent">Swag Store</span>
          </h1>
          <p className="text-muted-foreground text-sm max-w-xl mx-auto leading-relaxed">
            Participate in learning events, showcase projects, assist community members, earn XP, and redeem premium swag.
          </p>
        </div>
      </header>

      {/* XP Wallet Banner */}
      <section className="py-4">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="coins-header">
            <div>
              <h2 className="text-lg font-bold text-foreground mb-1.5">Your Wallet &amp; XP Ledger</h2>
              <p className="text-xs text-muted-foreground max-w-lg leading-relaxed">
                You earn 50 XP for attending webinars, 100 for hackathons, 150 for projects, and 200 for winning coding competitions.
              </p>
            </div>
            <div className="coins-count-box">
              <div className="text-left">
                <div className="text-[10px] text-muted-foreground font-black uppercase tracking-wider">Balance</div>
                <div className="coins-num flex items-center gap-1.5">
                  {session
                    ? userXp !== null
                      ? `${userXp.toLocaleString()} XP`
                      : "..."
                    : "Not Signed In"
                  }
                </div>
              </div>
              <span className="text-2xl" role="img" aria-label="coin">🪙</span>
            </div>
          </div>
        </div>
      </section>

      {/* ─── PRODUCTS SECTION ──────────────────────────────────────── */}
      <section className="max-w-5xl mx-auto px-4 py-12">
        {/* Search & Filter Row */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-10">
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

            {/* Category Chips */}
            <div className="filter-chips">
              {CATEGORIES.map(cat => (
                <button
                  key={cat.value}
                  onClick={() => setActiveCategory(cat.value)}
                  className={`filter-chip ${activeCategory === cat.value ? "active" : ""}`}
                >
                  <span className="mr-1.5">{cat.emoji}</span>
                  {cat.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="swag-grid">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="card swag-card pointer-events-none border border-border bg-card/40 rounded-2xl p-4 flex flex-col gap-3">
                <Skeleton className="swag-img-container h-50 rounded-xl" />
                <Skeleton className="h-5 rounded w-3/4 mb-1 mt-4" />
                <Skeleton className="h-4 rounded w-full mb-3" />
                <Skeleton className="h-8 rounded w-1/2 mt-auto" />
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
          <div className="swag-grid">
            {filtered.map(item => {
              const canAfford = session && userXp !== null && userXp >= item.xpCost;
              const isOutOfStock = item.stock === 0;
              return (
                <div
                  key={item.id}
                  className={`card swag-card ${isOutOfStock ? "opacity-50" : ""}`}
                >
                  {isOutOfStock && (
                    <span className="badge badge-amber" style={{ position: "absolute", top: "12px", left: "12px", zIndex: 2 }}>
                      OUT OF STOCK
                    </span>
                  )}
                  {item.stock !== -1 && item.stock > 0 && item.stock <= 5 && (
                    <span className="badge badge-green" style={{ position: "absolute", top: "12px", left: "12px", zIndex: 2 }}>
                      ONLY {item.stock} LEFT!
                    </span>
                  )}
                  
                  <div className="swag-img-container">
                    {item.imageUrl ? (
                      <Image
                        src={item.imageUrl}
                        alt={item.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      />
                    ) : (
                      <span className="swag-graphic">{CATEGORY_ICONS[item.category] || "🎁"}</span>
                    )}
                  </div>

                  <h2 className="swag-title line-clamp-1">{item.name}</h2>
                  <p className="swag-desc line-clamp-2">{item.description}</p>

                  <div className="swag-price-box">
                    <span className="swag-coins">{item.xpCost.toLocaleString()} XP</span>
                    <button
                      onClick={() => handleRedeem(item)}
                      disabled={isOutOfStock || (!canAfford && !!session && userXp !== null)}
                      className={`btn-redesign ${
                        isOutOfStock || (!canAfford && !!session && userXp !== null)
                          ? "btn-redesign-secondary cursor-not-allowed text-xs py-2 px-3"
                          : "btn-redesign-primary text-xs py-2 px-3"
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
