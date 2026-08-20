"use client";

import { useMemo, useState, type FormEvent } from "react";
import { Lock } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import {
  formatCurrency,
  formatDecimal,
  formatGadhiSqFt,
  formatNumber,
  num,
  plotTotal,
  ratePerGadhiFromSqYard,
} from "@/lib/utils";
import type { CreateBookingPayload, Plot } from "@/types/database";

export interface BookingModalProps {
  open: boolean;
  plot: Plot | null;
  ventureId: string;
  onClose: () => void;
  onSubmit?: (payload: CreateBookingPayload) => Promise<void> | void;
}

/**
 * Frosted glass booking modal with advance / total calculations.
 * Booking API still uses agreedRatePerSqYard × areaSqYards.
 */
export function BookingModal({
  open,
  plot,
  onClose,
  onSubmit,
}: BookingModalProps) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rate, setRate] = useState("");
  const [advance, setAdvance] = useState("");

  const area = plot ? num(plot.areaSqYards) : 0;
  const gadhi = plot ? num(plot.areaGadhi) : 0;
  const defaultRate = plot ? num(plot.pricePerSqYard) : 0;
  const rateNum = Number(rate) || defaultRate;
  const calculatedTotal = useMemo(() => rateNum * area, [rateNum, area]);
  const equivGadhiRate = useMemo(
    () => (rateNum > 0 ? ratePerGadhiFromSqYard(rateNum) : 0),
    [rateNum]
  );

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!plot) return;

    const form = new FormData(e.currentTarget);
    const advancePaid = advance ? Number(advance) : 0;
    if (!rateNum || advancePaid < 0) {
      setError("Enter a valid agreed rate and advance.");
      return;
    }

    const payload: CreateBookingPayload = {
      plotId: plot.id,
      customerName: String(form.get("customerName") || ""),
      customerPhone: String(form.get("customerPhone") || ""),
      agreedRatePerSqYard: rateNum,
      advancePaid,
      notes: String(form.get("notes") || "") || undefined,
      bookingDate: new Date().toISOString().slice(0, 10),
    };

    try {
      setPending(true);
      setError(null);
      await onSubmit?.(payload);
      onClose();
      setRate("");
      setAdvance("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create booking");
    } finally {
      setPending(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      subtitle="Booking & Lock"
      title={plot ? `Lock Plot #${plot.plotNumber}` : "Create booking"}
      className="max-w-[540px]"
      footer={
        <div className="flex gap-2.5">
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
            form="booking-form"
            variant="gold"
            className="flex-[2.5]"
            disabled={pending || !plot || plot.status !== "available"}
          >
            <Lock className="h-3.5 w-3.5" />
            {pending ? "Saving…" : "Save Booking & Lock Plot"}
          </Button>
        </div>
      }
    >
      {!plot ? (
        <p className="text-sm text-[#5C6B82]">No plot selected.</p>
      ) : plot.status !== "available" ? (
        <p className="text-sm text-[#5C6B82]">
          Plot #{plot.plotNumber} is {plot.status} and cannot be booked.
        </p>
      ) : (
        <form id="booking-form" className="space-y-3.5" onSubmit={handleSubmit}>
          <p className="text-[13px] text-[#5C6B82]">
            {formatGadhiSqFt(plot)}
            {area > 0 ? ` · ${formatDecimal(area)} Sq. Yd` : ""}
            {plot.facing
              ? ` · ${String(plot.facing).replace(/_/g, "-")} Facing`
              : ""}
          </p>

          <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
            <Input
              name="customerName"
              label="Customer Full Name *"
              required
              placeholder="Legal name"
            />
            <Input
              name="customerPhone"
              label="Phone Number *"
              required
              placeholder="+91 …"
            />
            <Input
              name="rate"
              label="Agreed Rate (₹/Sq. Yd)"
              value={rate}
              onChange={(e) => setRate(e.target.value)}
              placeholder={defaultRate ? String(defaultRate) : "15000"}
              className="font-mono"
            />
            <Input
              name="amount"
              label="Token Advance Paid (₹)"
              value={advance}
              onChange={(e) => setAdvance(e.target.value)}
              placeholder="50000"
              className="font-mono"
              required
            />
          </div>

          {equivGadhiRate > 0 && gadhi > 0 ? (
            <p className="text-xs text-[#5C6B82]">
              ≈ {formatCurrency(equivGadhiRate)}/Gadhi ·{" "}
              {formatDecimal(gadhi)} Gadhi
            </p>
          ) : null}

          <div className="flex items-center justify-between rounded-[14px] border border-gold/20 bg-gradient-to-br from-gold/15 to-gold/[0.04] px-[18px] py-4">
            <div>
              <div className="mb-0.5 text-[10.5px] font-bold uppercase tracking-[0.07em] text-gold/65">
                Calculated Total Amount
              </div>
              <div className="text-xs text-[#5C6B82]">
                {formatNumber(area)} Sq. Yd × {formatCurrency(rateNum)}/Sq. Yd
              </div>
            </div>
            <div className="gold-text font-display text-2xl font-extrabold tracking-tight">
              {formatCurrency(calculatedTotal || plotTotal(plot))}
            </div>
          </div>

          <div>
            <label className="mb-2 block text-[11px] font-bold uppercase tracking-[0.07em] text-[#5C6B82]">
              Agreement Terms
            </label>
            <textarea
              name="notes"
              rows={3}
              defaultValue="Balance amount payable within 6 months from date of booking. Registration charges applicable separately. Layout is DTCP approved."
              className="w-full resize-y rounded-[11px] border border-white/10 bg-obsidian/50 px-4 py-3 text-[12.5px] leading-relaxed text-pearl outline-none focus:border-gold/40"
            />
          </div>

          {error ? <p className="text-sm text-plot-sold">{error}</p> : null}
        </form>
      )}
    </Modal>
  );
}
