"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { updatePlotStatus } from "@/lib/api";
import { formatDecimal, num } from "@/lib/utils";
import type { Plot } from "@/types/database";

export interface PlotEditModalProps {
  open: boolean;
  plot: Plot | null;
  onClose: () => void;
  onSaved?: (plot: Plot) => void;
}

/**
 * Edit 4-side dimensions + dual pricing; PATCH recalculates areas on backend.
 */
export function PlotEditModal({
  open,
  plot,
  onClose,
  onSaved,
}: PlotEditModalProps) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [eastDim, setEastDim] = useState("");
  const [westDim, setWestDim] = useState("");
  const [northDim, setNorthDim] = useState("");
  const [southDim, setSouthDim] = useState("");
  const [pricePerGadhi, setPricePerGadhi] = useState("");
  const [pricePerSqFt, setPricePerSqFt] = useState("");
  const [pricePerSqYard, setPricePerSqYard] = useState("");

  useEffect(() => {
    if (!plot || !open) return;
    setEastDim(plot.eastDim ?? "");
    setWestDim(plot.westDim ?? "");
    setNorthDim(plot.northDim ?? "");
    setSouthDim(plot.southDim ?? "");
    setPricePerGadhi(
      plot.pricePerGadhi != null && plot.pricePerGadhi !== ""
        ? String(plot.pricePerGadhi)
        : ""
    );
    setPricePerSqFt(
      plot.pricePerSqFt != null && plot.pricePerSqFt !== ""
        ? String(plot.pricePerSqFt)
        : ""
    );
    setPricePerSqYard(
      plot.pricePerSqYard != null ? String(plot.pricePerSqYard) : ""
    );
    setError(null);
  }, [plot, open]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!plot) return;

    setPending(true);
    setError(null);
    try {
      const body: Parameters<typeof updatePlotStatus>[1] = {
        eastDim: eastDim.trim() || null,
        westDim: westDim.trim() || null,
        northDim: northDim.trim() || null,
        southDim: southDim.trim() || null,
      };

      if (pricePerSqYard.trim()) {
        body.pricePerSqYard = Number(pricePerSqYard);
      }
      if (pricePerGadhi.trim()) {
        body.pricePerGadhi = Number(pricePerGadhi);
      } else {
        body.pricePerGadhi = null;
      }
      if (pricePerSqFt.trim()) {
        body.pricePerSqFt = Number(pricePerSqFt);
      } else {
        body.pricePerSqFt = null;
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
      subtitle="Dimensions & Pricing"
      title={plot ? `Edit Plot #${plot.plotNumber}` : "Edit plot"}
      className="max-w-[560px]"
      footer={
        <div className="flex gap-2.5">
          <Button variant="ghost" className="flex-1" onClick={onClose} disabled={pending}>
            Cancel
          </Button>
          <Button
            type="submit"
            form="plot-edit-form"
            variant="gold"
            className="flex-[2]"
            disabled={pending || !plot}
          >
            {pending ? "Saving…" : "Save & Recalculate Areas"}
          </Button>
        </div>
      }
    >
      {!plot ? (
        <p className="text-sm text-[#5C6B82]">No plot selected.</p>
      ) : (
        <form id="plot-edit-form" className="space-y-4" onSubmit={handleSubmit}>
          <p className="text-xs text-[#5C6B82]">
            Current:{" "}
            <span className="text-pearl">
              {formatDecimal(num(plot.areaGadhi))} Gadhi ·{" "}
              {formatDecimal(num(plot.areaSqFt))} Sq. Ft. ·{" "}
              {formatDecimal(num(plot.areaSqYards))} Sq. Yd
            </span>
            . Saving all four sides recalculates areas on the server.
          </p>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="East"
              value={eastDim}
              onChange={(e) => setEastDim(e.target.value)}
              placeholder="32'-8"
              className="font-mono"
            />
            <Input
              label="West"
              value={westDim}
              onChange={(e) => setWestDim(e.target.value)}
              placeholder="30'-1"
              className="font-mono"
            />
            <Input
              label="North"
              value={northDim}
              onChange={(e) => setNorthDim(e.target.value)}
              placeholder="45'"
              className="font-mono"
            />
            <Input
              label="South"
              value={southDim}
              onChange={(e) => setSouthDim(e.target.value)}
              placeholder="43'"
              className="font-mono"
            />
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <Input
              label="₹ / Gadhi"
              value={pricePerGadhi}
              onChange={(e) => setPricePerGadhi(e.target.value)}
              placeholder="120000"
              className="font-mono"
            />
            <Input
              label="₹ / Sq. Ft"
              value={pricePerSqFt}
              onChange={(e) => setPricePerSqFt(e.target.value)}
              placeholder="1667"
              className="font-mono"
            />
            <Input
              label="₹ / Sq. Yd"
              value={pricePerSqYard}
              onChange={(e) => setPricePerSqYard(e.target.value)}
              placeholder="15000"
              className="font-mono"
            />
          </div>

          {error ? <p className="text-sm text-plot-sold">{error}</p> : null}
        </form>
      )}
    </Modal>
  );
}
