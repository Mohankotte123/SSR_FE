"use client";

import { useRouter } from "next/navigation";
import type { Venture } from "@/types/database";

export interface VentureSwitcherProps {
  ventures: Venture[];
  currentSlug: string;
  /** Path suffix after /admin/ventures/[slug]/ — e.g. "plots" | "analytics" */
  section: "plots" | "analytics" | "edit";
}

/**
 * Jump between ventures while staying on inventory / analytics / edit.
 */
export function VentureSwitcher({
  ventures,
  currentSlug,
  section,
}: VentureSwitcherProps) {
  const router = useRouter();

  if (ventures.length === 0) return null;

  return (
    <label className="flex flex-col gap-1.5 sm:flex-row sm:items-center sm:gap-3">
      <span className="text-[11px] font-bold uppercase tracking-[0.07em] text-[#5C6B82]">
        Venture
      </span>
      <select
        value={currentSlug}
        onChange={(e) => {
          const slug = e.target.value;
          if (slug && slug !== currentSlug) {
            router.push(`/admin/ventures/${slug}/${section}`);
          }
        }}
        className="h-11 min-w-[220px] rounded-[11px] border border-white/10 bg-obsidian/50 px-3 text-sm text-pearl outline-none focus:border-gold/40"
      >
        {ventures.map((v) => (
          <option key={v.id} value={v.slug}>
            {v.title}
            {typeof v.availablePlots === "number"
              ? ` (${v.availablePlots} avail.)`
              : ""}
          </option>
        ))}
      </select>
    </label>
  );
}
