"use client";

export interface TestimonialData {
  id?: string;
  name: string;
  quote: string;
  badge: string | null;
  subtitle: string | null;
  avatarUrl: string | null;
  accent: string;
}

const ACCENT_STYLES: Record<string, { badge: string; avatar: string }> = {
  blue: { badge: "bg-primary/10 border border-primary/20 text-primary", avatar: "bg-primary/10 text-primary ring-primary/10" },
  orange: { badge: "bg-accent/10 border border-accent/20 text-accent", avatar: "bg-accent/10 text-accent ring-accent/10" },
  emerald: { badge: "bg-emerald-500/10 border border-emerald-500/20 text-emerald-600", avatar: "bg-emerald-500/10 text-emerald-600 ring-emerald-500/10" },
  amber: { badge: "bg-amber-500/10 border border-amber-500/20 text-amber-600", avatar: "bg-amber-500/10 text-amber-600 ring-amber-500/10" },
  purple: { badge: "bg-purple-500/10 border border-purple-500/20 text-purple-600", avatar: "bg-purple-500/10 text-purple-600 ring-purple-500/10" },
  rose: { badge: "bg-rose-500/10 border border-rose-500/20 text-rose-600", avatar: "bg-rose-500/10 text-rose-600 ring-rose-500/10" },
};

const initialsOf = (name: string) =>
  name.split(/\s+/).filter(Boolean).slice(0, 2).map(w => w[0]!.toUpperCase()).join("");

// Shown on the homepage until an admin adds testimonials in the dashboard
export const DEFAULT_TESTIMONIALS: TestimonialData[] = [
  {
    name: "Ritika Lodhi",
    badge: "Full Stack developer and vice president",
    quote: "I came from a no-name college in Bhopal. Velonx's project was a huge opportunity and it changed my life.",
    subtitle: "Barkatullah University · Co-founder @ Velonx",
    avatarUrl: null,
    accent: "emerald",
  },
  {
    name: "Rishi Pandey",
    badge: "Full Stack Developer and President of Velonx",
    quote: "The community on Velonx is unreal. Found my team and now we are building a startup together.",
    subtitle: "Barkatullah University · President @ Velonx",
    avatarUrl: null,
    accent: "amber",
  },
  {
    name: "Mahak Dangi",
    badge: "AI/ML Head and Vice president",
    quote: "I came from a no-name college in Bhopal. Velonx's project was a huge opportunity and it changed my life.",
    subtitle: "Barkatullah University · Co-founder @ Velonx",
    avatarUrl: null,
    accent: "purple",
  },
];

/** Inner content of a testimonial card — the caller supplies the card wrapper/animation. */
export function TestimonialCardContent({ t }: { t: TestimonialData }) {
  const style = ACCENT_STYLES[t.accent] ?? ACCENT_STYLES.blue;
  return (
    <>
      <div className="absolute top-4 right-6 text-7xl font-serif text-muted/10 font-bold select-none">&quot;</div>
      {t.badge && (
        <div className={`flex items-center gap-2 text-[10px] font-bold py-1 px-3.5 rounded-full w-fit mb-6 ${style.badge}`}>
          ✔ {t.badge}
        </div>
      )}
      <p className="text-muted-foreground text-sm italic leading-relaxed mb-8 relative z-10">&quot;{t.quote}&quot;</p>
      <div className="flex items-center gap-3 mt-auto">
        {t.avatarUrl
          // eslint-disable-next-line @next/next/no-img-element
          ? <img src={t.avatarUrl} alt={t.name} className="w-10 h-10 rounded-full object-cover ring-2 ring-border" />
          : <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-black ring-2 ${style.avatar}`}>{initialsOf(t.name) || "?"}</div>}
        <div>
          <h4 className="text-sm font-black">{t.name}</h4>
          {t.subtitle && <p className="text-[10px] text-muted-foreground">{t.subtitle}</p>}
        </div>
      </div>
    </>
  );
}
