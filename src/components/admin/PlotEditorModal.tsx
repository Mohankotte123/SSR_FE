"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { updatePlotStatus } from "@/lib/api";
import { cn, formatDecimal, num } from "@/lib/utils";
import { PLOT_STATUS_COLOR, statusLabel } from "@/lib/plot-styles";
import type { Plot, PlotStatus, UpdatePlotPayload } from "@/types/database";

export interface PlotEditorModalProps {
  open: boolean;
  plot: Plot | null;
  onClose: () => void;
  onSaved?: (plot: Plot) => void;
}

type Cardinal = "east" | "west" | "north" | "south";

const ROAD_OPTIONS: Array<{ value: Cardinal; label: string }> = [
  { value: "east", label: "East" },
  { value: "west", label: "West" },
  { value: "north", label: "North" },
  { value: "south", label: "South" },
];

const STATUS_OPTIONS: PlotStatus[] = [
  "available",
  "reserved",
  "sold",
  "blocked",
];

function roadsFromPlot(
  roadSides: string | null | undefined,
  facing: string | null | undefined
): Record<Cardinal, boolean> {
  const base: Record<Cardinal, boolean> = {
    east: false,
    west: false,
    north: false,
    south: false,
  };
  const fromSides = (roadSides ?? "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
  if (fromSides.length > 0) {
    for (const s of fromSides) {
      if (s in base) base[s as Cardinal] = true;
    }
    return base;
  }
  const f = (facing ?? "").toLowerCase().replace(/-/g, "_");
  if (f === "north_east") {
    base.north = true;
    base.east = true;
  } else if (f === "north_west") {
    base.north = true;
    base.west = true;
  } else if (f === "south_east") {
    base.south = true;
    base.east = true;
  } else if (f === "south_west") {
    base.south = true;
    base.west = true;
  } else if (f === "east" || f === "west" || f === "north" || f === "south") {
    base[f] = true;
  } else {
    base.east = true;
  }
  return base;
}

/**
 * Full plot details editor — facing, road, 4-side dims, pricing, status.
 * PATCH /api/plots/:id/status recalculates areas when dims change.
 */
export function PlotEditorModal({
  open,
  plot,
  onClose,
  onSaved,
}: PlotEditorModalProps) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [roadSides, setRoadSides] = useState<Record<Cardinal, boolean>>({
    east: false,
    west: false,
    north: false,
    south: false,
  });
  const [roadWidthFt, setRoadWidthFt] = useState("");
  const [eastDim, setEastDim] = useState("");
  const [westDim, setWestDim] = useState("");
  const [northDim, setNorthDim] = useState("");
  const [southDim, setSouthDim] = useState("");
  const [pricePerGadhi, setPricePerGadhi] = useState("");
  const [pricePerSqYard, setPricePerSqYard] = useState("");
  const [status, setStatus] = useState<PlotStatus>("available");

  useEffect(() => {
    if (!plot || !open) return;
    setRoadSides(roadsFromPlot(plot.roadSides, plot.facing));
    setRoadWidthFt(
      plot.roadWidthFt != null && plot.roadWidthFt !== ""
        ? String(plot.roadWidthFt)
        : "30"
    );
    setEastDim(plot.eastDim ?? "");
    setWestDim(plot.westDim ?? "");
    setNorthDim(plot.northDim ?? "");
    setSouthDim(plot.southDim ?? "");
    setPricePerGadhi(
      plot.pricePerGadhi != null && plot.pricePerGadhi !== ""
        ? String(plot.pricePerGadhi)
        : ""
    );
    setPricePerSqYard(
      plot.pricePerSqYard != null ? String(plot.pricePerSqYard) : ""
    );
    setStatus(plot.status);
    setError(null);
  }, [plot, open]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!plot) return;

    setPending(true);
    setError(null);
    try {
      const selected = (Object.keys(roadSides) as Cardinal[]).filter(
        (k) => roadSides[k]
      );
      if (selected.length === 0) {
        throw new Error("Select at least one road side for facing.");
      }

      const body: UpdatePlotPayload = {
        status,
        eastDim: eastDim.trim() || null,
        westDim: westDim.trim() || null,
        northDim: northDim.trim() || null,
        southDim: southDim.trim() || null,
        roadSides: selected.join(","),
      };

      if (roadWidthFt.trim() !== "") {
        const road = Number(roadWidthFt);
        if (!Number.isFinite(road) || road < 0) {
          throw new Error("Road width must be a non-negative number.");
        }
        body.roadWidthFt = Math.round(road);
      }

      if (pricePerSqYard.trim()) {
        const n = Number(pricePerSqYard);
        if (!Number.isFinite(n) || n < 0) {
          throw new Error("Price per Sq. Yard must be a valid number.");
        }
        body.pricePerSqYard = n;
      }

      if (pricePerGadhi.trim()) {
        const n = Number(pricePerGadhi);
        if (!Number.isFinite(n) || n < 0) {
          throw new Error("Price per Gadhi must be a valid number.");
        }
        body.pricePerGadhi = n;
      } else {
        body.pricePerGadhi = null;
      }

      const updated = await updatePlotStatus(plot.id, body);
      onSaved?.(updated);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update plot");
    } finally {
      setPending(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      subtitle="Plot Details & Facing"
      title={plot ? `Edit Plot #${plot.plotNumber}` : "Edit plot"}
      className="max-w-[640px] bg-slate-900/80 backdrop-blur-md"
      footer={
        <div className="flex flex-col gap-2.5 sm:flex-row">
          <Button
            variant="ghost"
            className="flex-1"
            onClick={onClose}
            disabled={pending}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            form="plot-editor-form"
            variant="gold"
            className="flex-[2]"
            disabled={pending || !plot}
          >
            {pending ? "Saving…" : "Save Plot Details"}
          </Button>
        </div>
      }
    >
      {!plot ? (
        <p className="text-sm text-[#5C6B82]">No plot selected.</p>
      ) : (
        <form
          id="plot-editor-form"
          className="max-h-[min(70vh,640px)] space-y-5 overflow-y-auto pr-1"
          onSubmit={handleSubmit}
        >
          <p className="text-xs text-[#5C6B82]">
            Current area:{" "}
            <span className="font-mono text-pearl">
              {formatDecimal(num(plot.areaGadhi))} Gadhi ·{" "}
              {formatDecimal(num(plot.areaSqFt))} Sq. Ft. ·{" "}
              {formatDecimal(num(plot.areaSqYards))} Sq. Yd
            </span>
            . Updating all four sides recalculates areas on the server.
          </p>

          <div className="space-y-3">
            <div>
              <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.07em] text-[#5C6B82]">
                Roads this plot faces
              </p>
              <p className="mb-2.5 text-[11px] text-[#5C6B82]">
                Select every road that touches the plot (1–3 sides).
              </p>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {ROAD_OPTIONS.map((opt) => (
                  <label
                    key={opt.value}
                    className={cn(
                      "flex cursor-pointer items-center gap-2 rounded-[11px] border px-3 py-2.5 text-[12.5px] font-semibold",
                      roadSides[opt.value]
                        ? "border-gold/40 bg-gold/10 text-gold"
                        : "border-white/10 bg-pearl/5 text-[#8B97AD]"
                    )}
                  >
                    <input
                      type="checkbox"
                      className="accent-gold"
                      checked={roadSides[opt.value]}
                      onChange={(e) =>
                        setRoadSides((prev) => ({
                          ...prev,
                          [opt.value]: e.target.checked,
                        }))
                      }
                    />
                    {opt.label}
                  </label>
                ))}
              </div>
            </div>

            <Input
              label="Road Width (Ft)"
              type="number"
              min={0}
              step={1}
              value={roadWidthFt}
              onChange={(e) => setRoadWidthFt(e.target.value)}
              placeholder="35"
              className="font-mono"
            />
          </div>

          <div>
            <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.07em] text-[#5C6B82]">
              4-Side Dimensions
            </p>
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="East Dim"
                value={eastDim}
                onChange={(e) => setEastDim(e.target.value)}
                placeholder={`32'-8"`}
                className="font-mono"
              />
              <Input
                label="West Dim"
                value={westDim}
                onChange={(e) => setWestDim(e.target.value)}
                placeholder={`30'-1"`}
                className="font-mono"
              />
              <Input
                label="North Dim"
                value={northDim}
                onChange={(e) => setNorthDim(e.target.value)}
                placeholder="45'"
                className="font-mono"
              />
              <Input
                label="South Dim"
                value={southDim}
                onChange={(e) => setSouthDim(e.target.value)}
                placeholder="43'"
                className="font-mono"
              />
            </div>
          </div>

          <div>
            <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.07em] text-[#5C6B82]">
              Pricing Override
            </p>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Input
                label="Price per Gadhi (₹)"
                value={pricePerGadhi}
                onChange={(e) => setPricePerGadhi(e.target.value)}
                placeholder="120000"
                className="font-mono"
              />
              <Input
                label="Price per Sq. Yard (₹)"
                value={pricePerSqYard}
                onChange={(e) => setPricePerSqYard(e.target.value)}
                placeholder="15000"
                className="font-mono"
              />
            </div>
          </div>

          <div>
            <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.07em] text-[#5C6B82]">
              Status
            </p>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {STATUS_OPTIONS.map((s) => {
                const active = status === s;
                const color = PLOT_STATUS_COLOR[s];
                return (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setStatus(s)}
                    className={cn(
                      "rounded-[11px] px-3 py-2.5 font-display text-[12.5px] font-bold transition",
                      !active && "bg-pearl/5 text-[#5C6B82]"
                    )}
                    style={
                      active
                        ? {
                            color,
                            backgroundColor: `${color}2E`,
                            outline: `1px solid ${color}66`,
                          }
                        : undefined
                    }
                  >
                    {statusLabel(s)}
                  </button>
                );
              })}
            </div>
            {status === "sold" ? (
              <p className="mt-2 text-[11px] leading-relaxed text-[#8B97AD]">
                Prefer{" "}
                <span className="text-pearl">
                  View booking record → Mark Sold + Settle
                </span>
                . Sold requires an active booking.
              </p>
            ) : null}
            {status === "reserved" && plot?.status === "sold" ? (
              <p className="mt-2 text-[11px] leading-relaxed text-plot-sold">
                Cannot demote sold → reserved here. Use{" "}
                <span className="text-pearl">Void sale</span> on the booking
                record if needed.
              </p>
            ) : null}
            {status === "available" &&
            (plot?.status === "reserved" || plot?.status === "sold") ? (
              <p className="mt-2 text-[11px] leading-relaxed text-plot-sold">
                To free this plot, open{" "}
                <span className="text-pearl">View booking record</span> and
                cancel / void — not a bare Available flip.
              </p>
            ) : null}
            {status === "reserved" && plot?.status === "available" ? (
              <p className="mt-2 text-[11px] leading-relaxed text-[#8B97AD]">
                Reserved must be created via{" "}
                <span className="text-pearl">Add Booking</span> (customer +
                advance).
              </p>
            ) : null}
          </div>

          {error ? <p className="text-sm text-plot-sold">{error}</p> : null}
        </form>
      )}
    </Modal>
  );
}
