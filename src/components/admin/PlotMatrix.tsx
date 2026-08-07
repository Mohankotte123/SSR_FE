"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { formatCurrency, formatNumber, cn } from "@/lib/utils";
import { PLOT_STATUS_COLOR, statusLabel } from "@/lib/plot-styles";
import type { Plot, PlotStatus } from "@/types/database";

export interface PlotMatrixProps {
  plots: Plot[];
  onSelectPlot?: (plot: Plot) => void;
}

/**
 * Tap-friendly plot inventory card grid (Figma PlotInventory).
 */
export function PlotMatrix({ plots, onSelectPlot }: PlotMatrixProps) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<PlotStatus | "all">("all");

  const filtered = useMemo(() => {
    return plots.filter((p) => {
      if (filter !== "all" && p.status !== filter) return false;
      if (
        search &&
        !`${p.plot_number} ${p.facing ?? ""}`.toLowerCase().includes(search.toLowerCase())
      ) {
        return false;
      }
      return true;
    });
  }, [plots, filter, search]);

  const counts = useMemo(
    () => ({
      available: plots.filter((p) => p.status === "available").length,
      reserved: plots.filter((p) => p.status === "reserved").length,
      sold: plots.filter((p) => p.status === "sold").length,
    }),
    [plots]
  );

  if (plots.length === 0) {
    return (
      <div className="rounded-card border border-dashed border-white/15 bg-midnight/50 px-4 py-12 text-center text-sm text-[#5C6B82]">
        No plots found for this venture.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-3.5">
        {(
          [
            { label: "Available", count: counts.available, tone: "success" as const },
            { label: "Reserved", count: counts.reserved, tone: "warning" as const },
            { label: "Sold", count: counts.sold, tone: "danger" as const },
            { label: "Total Plots", count: plots.length, tone: "gold" as const },
          ] as const
        ).map((s) => (
          <div
            key={s.label}
            className={cn(
              "flex items-center gap-3 rounded-[14px] border px-[22px] py-3.5",
              s.tone === "success" && "status-available",
              s.tone === "warning" && "status-reserved",
              s.tone === "danger" && "status-sold",
              s.tone === "gold" && "border-gold/20 bg-gold/10"
            )}
          >
            <span
              className={cn(
                "font-display text-[30px] font-extrabold leading-none",
                s.tone === "gold" && "text-gold"
              )}
            >
              {s.count}
            </span>
            <span className="text-[13px] font-semibold text-[#8B97AD]">
              {s.label}
            </span>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#5C6B82]" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search plot number…"
            className="h-11 w-[260px] rounded-[11px] border border-white/10 bg-obsidian/50 pl-10 pr-4 text-sm text-pearl outline-none placeholder:text-[#5C6B82] focus:border-gold/40"
          />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {(["all", "available", "reserved", "sold"] as const).map((f) => {
            const active = filter === f;
            const col =
              f === "all"
                ? "#B7A589"
                : f === "available"
                  ? "#2E9E6B"
                  : f === "reserved"
                    ? "#C4923A"
                    : "#C45A4A";
            return (
              <button
                key={f}
                type="button"
                onClick={() => setFilter(f)}
                className={cn(
                  "rounded-[10px] px-[18px] py-2.5 font-display text-[12.5px] font-bold transition",
                  !active && "bg-pearl/5 text-[#5C6B82]"
                )}
                style={
                  active
                    ? {
                        color: col,
                        backgroundColor: `${col}2E`,
                        outline: `1px solid ${col}66`,
                      }
                    : undefined
                }
              >
                {f === "all" ? "All Plots" : statusLabel(f)}
              </button>
            );
          })}
        </div>
        <span className="ml-auto text-[13px] text-slate-light">
          {filtered.length} of {plots.length} plots shown
        </span>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
        {filtered.map((plot) => {
          const color = PLOT_STATUS_COLOR[plot.status];
          return (
            <article
              key={plot.id}
              className="relative overflow-hidden rounded-2xl border bg-midnight p-5 shadow-glass transition hover:-translate-y-0.5"
              style={{ borderColor: `${color}38` }}
            >
              <div
                className="absolute inset-x-0 top-0 h-[3px]"
                style={{
                  background: `linear-gradient(90deg, ${color}, ${color}88)`,
                }}
              />

              <div className="mb-3.5 flex items-start justify-between gap-2 pt-1">
                <h3 className="font-display text-[22px] font-extrabold tracking-tight text-pearl">
                  Plot #{plot.plot_number}
                </h3>
                <Badge
                  tone={
                    plot.status === "available"
                      ? "success"
                      : plot.status === "reserved"
                        ? "warning"
                        : plot.status === "sold"
                          ? "danger"
                          : "neutral"
                  }
                  dot
                >
                  {statusLabel(plot.status)}
                </Badge>
              </div>

              <div className="mb-3 grid grid-cols-3 gap-2">
                {[
                  {
                    label: "Area",
                    val:
                      plot.area_sqft != null
                        ? `${formatNumber(plot.area_sqft)}`
                        : "—",
                  },
                  {
                    label: "Price",
                    val: formatCurrency(plot.price),
                  },
                  {
                    label: "Facing",
                    val: plot.facing ?? "—",
                  },
                ].map((s) => (
                  <div
                    key={s.label}
                    className="rounded-[9px] bg-obsidian/35 px-2.5 py-2"
                  >
                    <div className="mb-0.5 text-[9.5px] font-bold uppercase tracking-wider text-slate-light">
                      {s.label}
                    </div>
                    <div className="truncate font-mono text-[12.5px] text-pearl">
                      {s.val}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mb-3 flex items-center justify-between rounded-[10px] border border-gold/15 bg-gradient-to-br from-gold/[0.08] to-gold/[0.02] px-3 py-2.5">
                <span className="text-[11.5px] font-semibold text-[#5C6B82]">
                  Plot Value
                </span>
                <span className="gold-text font-display text-base font-extrabold">
                  {plot.price != null
                    ? `₹${(plot.price / 100000).toFixed(0)}L`
                    : "—"}
                </span>
              </div>

              {plot.status === "available" ? (
                <Button
                  className="w-full border border-plot-available/25 bg-plot-available/15 text-plot-available hover:bg-plot-available/25"
                  onClick={() => onSelectPlot?.(plot)}
                >
                  Mark Reserved / Add Booking
                </Button>
              ) : (
                <Button
                  variant="secondary"
                  className="w-full"
                  onClick={() => onSelectPlot?.(plot)}
                >
                  View record →
                </Button>
              )}
            </article>
          );
        })}
      </div>
    </div>
  );
}
