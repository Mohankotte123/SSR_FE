"use client";

import { useEffect, useState } from "react";
import { PlotMatrix } from "@/components/admin/PlotMatrix";
import { BookingModal } from "@/components/admin/BookingModal";
import { BookingRecordModal } from "@/components/admin/BookingRecordModal";
import { PlotEditorModal } from "@/components/admin/PlotEditorModal";
import { createBooking, updatePlotStatus } from "@/lib/api";
import type { Booking, CreateBookingPayload, Plot } from "@/types/database";

export interface InventoryMatrixClientProps {
  ventureId: string;
  plots: Plot[];
}

/**
 * Client wrapper: booking create, booking record view, block, full plot editor.
 */
export function InventoryMatrixClient({
  ventureId,
  plots: initialPlots,
}: InventoryMatrixClientProps) {
  const [plots, setPlots] = useState(initialPlots);
  const [bookingTarget, setBookingTarget] = useState<Plot | null>(null);
  const [recordTarget, setRecordTarget] = useState<Plot | null>(null);
  const [editing, setEditing] = useState<Plot | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    if (!toast) return;
    const id = window.setTimeout(() => setToast(null), 3200);
    return () => window.clearTimeout(id);
  }, [toast]);

  function upsertPlot(plot: Plot) {
    setPlots((prev) =>
      prev.map((p) => (p.id === plot.id ? { ...p, ...plot } : p))
    );
  }

  async function handleBooking(payload: CreateBookingPayload) {
    const { plot } = await createBooking(payload);
    upsertPlot(plot);
    setToast(`Plot #${plot.plotNumber} reserved — booking saved.`);
  }

  async function handleBlock(plot: Plot) {
    const updated = await updatePlotStatus(plot.id, { status: "blocked" });
    upsertPlot(updated);
  }

  function handlePlotSaved(updated: Plot) {
    upsertPlot(updated);
    setToast(`Plot #${updated.plotNumber} updated successfully!`);
  }

  function handleRecordUpdated(payload: { booking: Booking; plot: Plot }) {
    upsertPlot(payload.plot);
    setRecordTarget((prev) =>
      prev && prev.id === payload.plot.id ? { ...prev, ...payload.plot } : prev
    );
    if (payload.booking.status === "cancelled") {
      setToast(
        `Booking cancelled for Plot #${payload.plot.plotNumber} — removed from analytics; plot is available.`
      );
      setRecordTarget(null);
      return;
    }
    const pendingBal =
      Math.max(
        0,
        Number(payload.booking.totalAmount) - Number(payload.booking.advancePaid)
      ) || 0;
    setToast(
      payload.plot.status === "sold"
        ? pendingBal > 0
          ? `Plot #${payload.plot.plotNumber} marked sold — collect remaining ${pendingBal.toLocaleString("en-IN")}.`
          : `Plot #${payload.plot.plotNumber} sold & fully settled.`
        : `Plot #${payload.plot.plotNumber} booking updated.`
    );
  }

  function handleSelectPlot(plot: Plot) {
    if (plot.status === "available") {
      setBookingTarget(plot);
      return;
    }
    if (plot.status === "reserved" || plot.status === "sold") {
      setRecordTarget(plot);
    }
  }

  return (
    <>
      <PlotMatrix
        plots={plots}
        onSelectPlot={handleSelectPlot}
        onBlockPlot={handleBlock}
        onEditPlot={setEditing}
      />
      <BookingModal
        open={!!bookingTarget}
        plot={bookingTarget}
        ventureId={ventureId}
        onClose={() => setBookingTarget(null)}
        onSubmit={handleBooking}
      />
      <BookingRecordModal
        open={!!recordTarget}
        plot={recordTarget}
        onClose={() => setRecordTarget(null)}
        onUpdated={handleRecordUpdated}
      />
      <PlotEditorModal
        open={!!editing}
        plot={editing}
        onClose={() => setEditing(null)}
        onSaved={handlePlotSaved}
      />

      {toast ? (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-6 left-1/2 z-[90] max-w-[min(92vw,420px)] -translate-x-1/2 rounded-[14px] border border-plot-available/30 bg-[#12201A]/95 px-5 py-3.5 text-center font-display text-sm font-semibold text-plot-available shadow-[0_16px_40px_rgba(0,0,0,0.45)] backdrop-blur-md"
        >
          {toast}
        </div>
      ) : null}
    </>
  );
}
