"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Minus, Plus, RotateCcw } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { cn, formatDecimal, num } from "@/lib/utils";
import {
  findPlotElement,
  paintPlotShape,
  sanitizeSvgMarkup,
} from "@/lib/svg-layout";
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
 * Inlines the uploaded SVG (via same-origin proxy) so plots are clickable.
 * Falls back to a generated plot grid when no SVG URL / fetch fails.
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
  const [svgMarkup, setSvgMarkup] = useState<string | null>(null);
  const [svgError, setSvgError] = useState<string | null>(null);
  const [svgLoading, setSvgLoading] = useState(false);
  const svgHostRef = useRef<HTMLDivElement>(null);
  const onPlotSelectRef = useRef(onPlotSelect);
  onPlotSelectRef.current = onPlotSelect;

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

  const plotsById = useMemo(() => {
    const map = new Map<string, Plot>();
    plots.forEach((p) => map.set(p.id, p));
    return map;
  }, [plots]);

  // Fetch + sanitize SVG (proxy prevents download / CORS blank embeds)
  useEffect(() => {
    if (!svgUrl) {
      setSvgMarkup(null);
      setSvgError(null);
      setSvgLoading(false);
      return;
    }

    let cancelled = false;
    const controller = new AbortController();

    async function load() {
      setSvgLoading(true);
      setSvgError(null);
      try {
        const proxy = `/svg-proxy?url=${encodeURIComponent(svgUrl!)}`;
        let res = await fetch(proxy, { signal: controller.signal });
        if (!res.ok) {
          // Fallback: direct fetch (public buckets often allow CORS)
          res = await fetch(svgUrl!, { signal: controller.signal });
        }
        if (!res.ok) {
          throw new Error(`Could not load layout (${res.status})`);
        }
        const text = await res.text();
        if (!text.includes("<svg")) {
          throw new Error("Layout file is not a valid SVG");
        }
        if (!cancelled) {
          setSvgMarkup(sanitizeSvgMarkup(text));
        }
      } catch (err) {
        if (cancelled || (err instanceof Error && err.name === "AbortError")) {
          return;
        }
        if (!cancelled) {
          setSvgMarkup(null);
          setSvgError(
            err instanceof Error ? err.message : "Failed to load layout SVG"
          );
        }
      } finally {
        if (!cancelled) setSvgLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [svgUrl]);

  // Inject markup once loaded (layout phase so paint effect sees nodes)
  useLayoutEffect(() => {
    const host = svgHostRef.current;
    if (!host) return;
    if (!svgMarkup) {
      host.innerHTML = "";
      return;
    }
    host.innerHTML = svgMarkup;
  }, [svgMarkup]);

  // Paint + bind clicks when plots / filters / selection change
  useEffect(() => {
    const host = svgHostRef.current;
    if (!host || !svgMarkup) return;

    const cleanups: Array<() => void> = [];

    plots.forEach((plot) => {
      const el = findPlotElement(host, plot);
      if (!el) return;

      const visible = visibleIds.has(plot.id);
      const selected = selectedPlotId === plot.id;
      const status = plot.status;

      paintPlotShape(el, {
        fill: visible
          ? PLOT_STATUS_COLOR[status]
          : "rgba(180,190,210,0.35)",
        stroke: selected
          ? "#1E2640"
          : visible
            ? "#ffffff"
            : "rgba(180,190,210,0.5)",
        strokeWidth: selected ? 3 : 1.5,
        opacity: visible ? 1 : 0.28,
        interactive: visible,
        selected,
        plotNumber: plot.plotNumber,
      });

      el.setAttribute("data-plot-id", plot.id);
      el.setAttribute("role", "button");
      el.setAttribute(
        "aria-label",
        `Plot ${plot.plotNumber}, ${statusLabel(status)}`
      );

      const onClick = (event: Event) => {
        event.preventDefault();
        event.stopPropagation();
        if (!visibleIds.has(plot.id)) return;
        onPlotSelectRef.current?.(plotsById.get(plot.id) ?? plot);
      };

      el.addEventListener("click", onClick);
      cleanups.push(() => el.removeEventListener("click", onClick));
    });

    return () => {
      cleanups.forEach((fn) => fn());
    };
  }, [svgMarkup, plots, plotsById, visibleIds, selectedPlotId]);

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
  const showInlineSvg = Boolean(svgUrl && svgMarkup && !svgError);
  const showFallbackGrid = !svgUrl || Boolean(svgError) || (!svgLoading && !svgMarkup);

  return (
    <div className={cn("flex flex-col overflow-hidden rounded-card", className)}>
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

      <div className="overflow-auto bg-[#0D1220] p-7">
        <div className="overflow-hidden rounded-[20px] border border-white/15 bg-[#EEF2F8] shadow-[0_8px_60px_rgba(0,0,0,0.5)]">
          {svgLoading ? (
            <div className="flex min-h-[420px] items-center justify-center text-sm text-[#5C6B82]">
              Loading site layout…
            </div>
          ) : null}

          {showInlineSvg ? (
            <div
              style={{
                transform: `scale(${zoom})`,
                transformOrigin: "top left",
                transition: "transform 0.25s cubic-bezier(.4,0,.2,1)",
              }}
              className="min-h-[420px] w-full p-3"
            >
              <div
                ref={svgHostRef}
                className="svg-layout-host w-full [&_svg]:h-auto [&_svg]:w-full"
                aria-label="Venture site layout"
              />
            </div>
          ) : null}

          {!svgLoading && showFallbackGrid ? (
            plots.length === 0 ? (
              <div className="flex min-h-[420px] items-center justify-center text-sm text-[#5C6B82]">
                {svgError
                  ? `Layout unavailable (${svgError}).`
                  : "No SVG layout uploaded — plot grid will appear when inventory loads."}
              </div>
            ) : (
              <>
                {svgError ? (
                  <p className="border-b border-slate-200 bg-amber-50 px-4 py-2 text-xs text-amber-800">
                    Could not inline SVG ({svgError}). Showing plot grid instead.
                  </p>
                ) : null}
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
              </>
            )
          ) : null}
        </div>

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
