"use client";

import { useMemo, useState } from "react";
import { Minus, Plus, RotateCcw } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { cn, formatDecimal, num } from "@/lib/utils";
import {
  PLOT_STATUS_COLOR,
  PLOT_STATUS_FILL,
  PLOT_STATUS_STROKE,
  statusLabel,
} from "@/lib/plot-styles";
import type { Plot, PlotStatus } from "@/types/database";

export interface SVGLayoutViewerProps {
  svgUrl: string | null;
  plots: Plot[];
  selectedPlotId?: string | null;
  onPlotSelect?: (plot: Plot) => void;
  className?: string;
  ventureName?: string;
  ventureLocation?: string | null;
}

type StatusFilter = PlotStatus | "all";

/**
 * Interactive SVG layout viewer with status fills, filters, and zoom.
 * Falls back to a generated plot grid when no SVG URL / element binding exists.
 */
export function SVGLayoutViewer({
  svgUrl,
  plots,
  selectedPlotId,
  onPlotSelect,
  className,
  ventureName,
  ventureLocation,
}: SVGLayoutViewerProps) {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [facingFilter, setFacingFilter] = useState<string>("all");
  const [zoom, setZoom] = useState(1);

  const counts = useMemo(
    () => ({
      available: plots.filter((p) => p.status === "available").length,
      reserved: plots.filter((p) => p.status === "reserved").length,
      sold: plots.filter((p) => p.status === "sold").length,
      blocked: plots.filter((p) => p.status === "blocked").length,
    }),
    [plots]
  );

  const facings = useMemo(() => {
    const set = new Set<string>();
    plots.forEach((p) => {
      if (p.facing) set.add(p.facing);
    });
    return Array.from(set);
  }, [plots]);

  const visibleIds = useMemo(() => {
    return new Set(
      plots
        .filter((p) => {
          if (statusFilter !== "all" && p.status !== statusFilter) return false;
          if (facingFilter !== "all" && p.facing !== facingFilter) return false;
          return true;
        })
        .map((p) => p.id)
    );
  }, [plots, statusFilter, facingFilter]);

  const layoutPlots = useMemo(() => {
    const cols = 5;
    const cellW = 110;
    const cellH = 76;
    const gapX = 12;
    const gapY = 40;
    const originX = 48;
    const originY = 48;

    return plots.map((plot, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      return {
        plot,
        x: originX + col * (cellW + gapX),
        y: originY + row * (cellH + gapY),
        w: cellW,
        h: cellH,
      };
    });
  }, [plots]);

  const svgHeight = Math.max(420, 48 + Math.ceil(plots.length / 5) * 116 + 60);

  return (
    <div className={cn("flex flex-col overflow-hidden rounded-card", className)}>
      {/* Legend strip */}
      <div className="glass-dark flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.08] px-5 py-3.5">
        <div>
          {ventureName ? (
            <p className="font-display text-[15px] font-extrabold text-pearl">
              {ventureName} — Layout Map
            </p>
          ) : null}
          {ventureLocation ? (
            <p className="font-mono text-[11px] tracking-wide text-[#5C6B82]">
              {ventureLocation.toUpperCase()}
            </p>
          ) : null}
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge tone="success" dot>
            Available: {counts.available}
          </Badge>
          <Badge tone="warning" dot>
            Reserved: {counts.reserved}
          </Badge>
          <Badge tone="danger" dot>
            Sold: {counts.sold}
          </Badge>
          <Badge tone="neutral" dot>
            Blocked: {counts.blocked}
          </Badge>
        </div>
      </div>

      {/* Filters + zoom */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.06] bg-[#151B30] px-5 py-3">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="mr-1 text-[11.5px] font-semibold text-[#5C6B82]">
            STATUS
          </span>
          {(["all", "available", "reserved", "sold", "blocked"] as const).map((s) => {
            const active = statusFilter === s;
            const color =
              s === "all"
                ? "#B7A589"
                : s === "available"
                  ? "#2E9E6B"
                  : s === "reserved"
                    ? "#C4923A"
                    : s === "sold"
                      ? "#C45A4A"
                      : "#5C6B82";
            return (
              <button
                key={s}
                type="button"
                onClick={() => setStatusFilter(s)}
                className={cn(
                  "rounded-full px-[15px] py-1.5 font-display text-xs font-bold transition",
                  active ? "outline outline-1" : "bg-pearl/5 text-[#5C6B82]"
                )}
                style={
                  active
                    ? {
                        color,
                        backgroundColor: `${color}33`,
                        outlineColor: `${color}66`,
                      }
                    : undefined
                }
              >
                {s === "all" ? "All" : statusLabel(s)}
              </button>
            );
          })}

          {facings.length > 0 ? (
            <>
              <span className="mx-1.5 h-5 w-px bg-white/10" />
              <span className="mr-1 text-[11.5px] font-semibold text-[#5C6B82]">
                FACING
              </span>
              <button
                type="button"
                onClick={() => setFacingFilter("all")}
                className={cn(
                  "rounded-full px-[15px] py-1.5 font-display text-xs font-bold",
                  facingFilter === "all"
                    ? "bg-gold/15 text-gold outline outline-1 outline-gold/30"
                    : "bg-pearl/5 text-[#5C6B82]"
                )}
              >
                All Facing
              </button>
              {facings.map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setFacingFilter(f)}
                  className={cn(
                    "rounded-full px-[15px] py-1.5 font-display text-xs font-bold",
                    facingFilter === f
                      ? "bg-gold/15 text-gold outline outline-1 outline-gold/30"
                      : "bg-pearl/5 text-[#5C6B82]"
                  )}
                >
                  {f}
                </button>
              ))}
            </>
          ) : null}
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            aria-label="Zoom out"
            onClick={() => setZoom((z) => Math.max(z - 0.15, 0.5))}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-midnight/80 text-pearl"
          >
            <Minus className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => setZoom(1)}
            className="h-8 rounded-lg border border-white/10 bg-midnight/80 px-3 font-mono text-[11.5px] text-[#8B97AD]"
          >
            {Math.round(zoom * 100)}%
          </button>
          <button
            type="button"
            aria-label="Zoom in"
            onClick={() => setZoom((z) => Math.min(z + 0.15, 2))}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-midnight/80 text-pearl"
          >
            <Plus className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => setZoom(1)}
            className="flex h-8 items-center gap-1 rounded-lg border border-white/10 bg-midnight/80 px-3 font-display text-[11.5px] font-semibold text-[#8B97AD]"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Reset
          </button>
        </div>
      </div>

      {/* Canvas */}
      <div className="overflow-auto bg-[#0D1220] p-7">
        {svgUrl ? (
          <div className="overflow-hidden rounded-[20px] border border-white/15 bg-[#EEF2F8] shadow-[0_8px_60px_rgba(0,0,0,0.5)]">
            <div
              style={{
                transform: `scale(${zoom})`,
                transformOrigin: "top left",
                transition: "transform 0.25s cubic-bezier(.4,0,.2,1)",
              }}
            >
              <object
                data={svgUrl}
                type="image/svg+xml"
                className="block min-h-[420px] w-full"
                aria-label="Venture site layout"
              />
            </div>
            {/* Hit list when SVG path binding is not yet wired */}
            <div className="border-t border-slate-200 bg-white/90 p-3 backdrop-blur-md">
              <p className="mb-2 font-mono text-[10px] uppercase tracking-wider text-[#5C6B82]">
                Select plot
              </p>
              <ul className="flex max-h-28 flex-wrap gap-2 overflow-y-auto">
                {plots.map((plot) => {
                  const hidden = !visibleIds.has(plot.id);
                  return (
                    <li key={plot.id}>
                      <button
                        type="button"
                        disabled={hidden}
                        onClick={() => onPlotSelect?.(plot)}
                        className={cn(
                          "rounded-md border px-2 py-1 text-xs font-bold",
                          selectedPlotId === plot.id
                            ? "border-transparent text-white"
                            : "border-slate-200 bg-white text-midnight",
                          hidden && "opacity-30"
                        )}
                        style={
                          selectedPlotId === plot.id
                            ? { background: PLOT_STATUS_COLOR[plot.status] }
                            : undefined
                        }
                      >
                        {plot.plotNumber}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        ) : (
          <div className="overflow-hidden rounded-[20px] border border-white/15 bg-[#EEF2F8] shadow-[0_8px_60px_rgba(0,0,0,0.5)]">
            {plots.length === 0 ? (
              <div className="flex min-h-[420px] items-center justify-center text-sm text-[#5C6B82]">
                No SVG layout uploaded — plot grid will appear when inventory loads.
              </div>
            ) : (
              <svg
                viewBox={`0 0 700 ${svgHeight}`}
                className="block w-full"
                style={{
                  transform: `scale(${zoom})`,
                  transformOrigin: "top left",
                  transition: "transform 0.25s cubic-bezier(.4,0,.2,1)",
                }}
              >
                <rect width="700" height={svgHeight} fill="#E8EDF5" />
                <rect
                  x="16"
                  y="16"
                  width="668"
                  height={svgHeight - 64}
                  rx="4"
                  fill="none"
                  stroke="#B0BAD0"
                  strokeWidth="2"
                  strokeDasharray="8 4"
                />
                <rect
                  x="0"
                  y={svgHeight - 32}
                  width="700"
                  height="32"
                  fill="#D4E8D0"
                  opacity="0.8"
                />
                <text
                  x="350"
                  y={svgHeight - 12}
                  textAnchor="middle"
                  fill="#6A9E6A"
                  fontSize="9"
                  fontFamily="var(--font-mono)"
                  fontWeight="600"
                >
                  GREEN BELT — COMMON OPEN SPACE
                </text>

                {layoutPlots.map(({ plot, x, y, w, h }) => {
                  const hidden = !visibleIds.has(plot.id);
                  const selected = selectedPlotId === plot.id;
                  const status = plot.status;
                  return (
                    <g
                      key={plot.id}
                      onClick={() => onPlotSelect?.(plot)}
                      className="cursor-pointer"
                      style={{ opacity: hidden ? 0.28 : 1 }}
                    >
                      <rect
                        x={x}
                        y={y}
                        width={w}
                        height={h}
                        rx={5}
                        fill={
                          hidden
                            ? "rgba(180,190,210,0.15)"
                            : PLOT_STATUS_FILL[status]
                        }
                        stroke={
                          hidden
                            ? "rgba(180,190,210,0.25)"
                            : selected
                              ? PLOT_STATUS_COLOR[status]
                              : PLOT_STATUS_STROKE[status]
                        }
                        strokeWidth={selected ? 2.5 : 1.5}
                        style={{
                          filter: selected
                            ? `drop-shadow(0 0 10px ${PLOT_STATUS_COLOR[status]}80)`
                            : hidden
                              ? "none"
                              : `drop-shadow(0 0 4px ${PLOT_STATUS_COLOR[status]}30)`,
                        }}
                      />
                      <text
                        x={x + w / 2}
                        y={y + h / 2 - 4}
                        textAnchor="middle"
                        fill={hidden ? "#8090A8" : "#1E2640"}
                        fontSize="12.5"
                        fontWeight="800"
                        fontFamily="var(--font-display)"
                        style={{ pointerEvents: "none" }}
                      >
                        #{plot.plotNumber}
                      </text>
                      <text
                        x={x + w / 2}
                        y={y + h / 2 + 12}
                        textAnchor="middle"
                        fill={hidden ? "#607088" : "rgba(30,38,64,0.65)"}
                        fontSize="7.5"
                        fontFamily="var(--font-mono)"
                        style={{ pointerEvents: "none" }}
                      >
                        {num(plot.areaGadhi) > 0
                          ? `${formatDecimal(num(plot.areaGadhi))} G`
                          : num(plot.areaSqYards) > 0
                            ? `${formatDecimal(num(plot.areaSqYards))} yd`
                            : plot.facing || status}
                      </text>
                      <circle
                        cx={x + w - 10}
                        cy={y + 10}
                        r={4}
                        fill={hidden ? "#8090A8" : PLOT_STATUS_COLOR[status]}
                        style={{ pointerEvents: "none" }}
                      />
                    </g>
                  );
                })}
              </svg>
            )}
          </div>
        )}

        <div className="mt-3.5 flex flex-wrap justify-center gap-5 text-[12.5px] text-[#8B97AD]">
          {(["available", "reserved", "sold", "blocked"] as PlotStatus[]).map((s) => (
            <div key={s} className="flex items-center gap-2 font-semibold capitalize">
              <span
                className="h-3.5 w-3.5 rounded-[3px]"
                style={{
                  background: PLOT_STATUS_FILL[s],
                  border: `1.5px solid ${PLOT_STATUS_STROKE[s]}`,
                }}
              />
              {s}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
