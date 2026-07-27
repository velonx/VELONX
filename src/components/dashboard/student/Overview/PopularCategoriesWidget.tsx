"use client";

import Link from "next/link";
import { CATEGORY_COLORS, ProjectCategory } from "@/lib/types/project-page.types";

const FEATURED_CATEGORIES: ProjectCategory[] = [
  "WEB_DEV",
  "AI_ML",
  "MOBILE",
  "DATA_SCIENCE",
  "DEVOPS",
  "DESIGN",
];

export default function PopularCategoriesWidget() {
  return (
    <section className="mb-8">
      <h2 className="text-lg font-black text-foreground tracking-tight mb-4">Popular Categories</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {FEATURED_CATEGORIES.map((category) => {
          const config = CATEGORY_COLORS[category];
          return (
            <Link
              key={category}
              href={`/projects?category=${category}`}
              className="rounded-2xl border border-border/60 bg-card p-4 text-center hover:-translate-y-0.5 hover:shadow-md transition-all"
            >
              <span
                className="inline-flex w-9 h-9 rounded-xl items-center justify-center mb-2 font-black text-sm"
                style={{ backgroundColor: `${config.color}1A`, color: config.color }}
              >
                {config.label.charAt(0)}
              </span>
              <p className="text-xs font-bold text-foreground truncate">{config.label}</p>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
