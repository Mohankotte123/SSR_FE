"use client";

import { useState } from "react";
import { PlotMatrix } from "@/components/admin/PlotMatrix";
import { BookingModal } from "@/components/admin/BookingModal";
import { PlotEditModal } from "@/components/admin/PlotEditModal";
import { createBooking, updatePlotStatus } from "@/lib/api";
import type { CreateBookingPayload, Plot } from "@/types/database";

export interface InventoryMatrixClientProps {
  ventureId: string;
  plots: Plot[];
}

/**
 * Client wrapper: matrix selection → booking / block / edit APIs.
 */
export function InventoryMatrixClient({
  ventureId,
  plots: initialPlots,
}: InventoryMatrixClientProps) {
  const [plots, setPlots] = useState(initialPlots);
  const [selected, setSelected] = useState<Plot | null>(null);
  const [editing, setEditing] = useState<Plot | null>(null);

  async function handleBooking(payload: CreateBookingPayload) {
    const { plot } = await createBooking(payload);
    setPlots((prev) => prev.map((p) => (p.id === plot.id ? plot : p)));
  }

  async function handleBlock(plot: Plot) {
    const updated = await updatePlotStatus(plot.id, { status: "blocked" });
    setPlots((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
  }

  function handleSaved(updated: Plot) {
    setPlots((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
  }

  return (
    <>
      <PlotMatrix
        plots={plots}
        onSelectPlot={setSelected}
        onBlockPlot={handleBlock}
        onEditPlot={setEditing}
      />
      <BookingModal
        open={!!selected}
        plot={selected}
        ventureId={ventureId}
        onClose={() => setSelected(null)}
        onSubmit={handleBooking}
      />
      <PlotEditModal
        open={!!editing}
        plot={editing}
        onClose={() => setEditing(null)}
        onSaved={handleSaved}
      />
    </>
  );
}
