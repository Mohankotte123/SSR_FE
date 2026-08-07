"use client";

import { useState } from "react";
import { PlotMatrix } from "@/components/admin/PlotMatrix";
import { BookingModal } from "@/components/admin/BookingModal";
import type { CreateBookingPayload, Plot } from "@/types/database";

export interface InventoryMatrixClientProps {
  ventureId: string;
  plots: Plot[];
}

/**
 * Client wrapper: matrix selection → booking modal (UI-only, no API).
 */
export function InventoryMatrixClient({
  ventureId,
  plots: initialPlots,
}: InventoryMatrixClientProps) {
  const [plots, setPlots] = useState(initialPlots);
  const [selected, setSelected] = useState<Plot | null>(null);

  async function handleBooking(payload: CreateBookingPayload) {
    // Static UI demo — update local state only
    setPlots((prev) =>
      prev.map((p) =>
        p.id === payload.plot_id
          ? { ...p, status: "reserved" as const, updated_at: new Date().toISOString() }
          : p
      )
    );
  }

  return (
    <>
      <PlotMatrix plots={plots} onSelectPlot={setSelected} />
      <BookingModal
        open={!!selected}
        plot={selected}
        ventureId={ventureId}
        onClose={() => setSelected(null)}
        onSubmit={handleBooking}
      />
    </>
  );
}
