"use client";

import { useMemo, useState, type FormEvent } from "react";
import { Lock } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { formatCurrency, formatNumber } from "@/lib/utils";
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
 */
export function BookingModal({
  open,
  plot,
  ventureId,
  onClose,
  onSubmit,
}: BookingModalProps) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rate, setRate] = useState("");
  const [advance, setAdvance] = useState("");

  const area = plot?.area_sqft ?? 0;
  const rateNum = Number(rate) || (plot?.price && area ? Math.round(plot.price / area) : 0);
  const calculatedTotal = useMemo(() => rateNum * area, [rateNum, area]);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!plot) return;

    const form = new FormData(e.currentTarget);
    const payload: CreateBookingPayload = {
      plot_id: plot.id,
      venture_id: ventureId,
      customer_name: String(form.get("customer_name") || ""),
      customer_phone: String(form.get("customer_phone") || ""),
      customer_email: String(form.get("customer_email") || "") || undefined,
      amount: advance ? Number(advance) : calculatedTotal || undefined,
      notes: String(form.get("notes") || "") || undefined,
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
      title={plot ? `Lock Plot #${plot.plot_number}` : "Create booking"}
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
            disabled={pending || !plot}
          >
            <Lock className="h-3.5 w-3.5" />
            {pending ? "Saving…" : "Save Booking & Lock Plot"}
          </Button>
        </div>
      }
    >
      {!plot ? (
        <p className="text-sm text-[#5C6B82]">No plot selected.</p>
      ) : (
        <form id="booking-form" className="space-y-3.5" onSubmit={handleSubmit}>
          <p className="text-[13px] text-[#5C6B82]">
            {area ? `${formatNumber(area)} Sq.Ft` : "Area TBD"}
            {plot.facing ? ` · ${plot.facing} Facing` : ""}
          </p>

          <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
            <Input
              name="customer_name"
              label="Customer Full Name *"
              required
              placeholder="Legal name"
            />
            <Input
              name="customer_phone"
              label="Phone Number *"
              required
              placeholder="+91 98765 43210"
            />
            <Input
              name="rate"
              label="Agreed Rate (₹/Sq.Ft)"
              value={rate}
              onChange={(e) => setRate(e.target.value)}
              placeholder={rateNum ? String(rateNum) : "15000"}
              className="font-mono"
            />
            <Input
              name="amount"
              label="Token Advance Paid (₹)"
              value={advance}
              onChange={(e) => setAdvance(e.target.value)}
              placeholder="500000"
              className="font-mono"
            />
          </div>

          <Input
            name="customer_email"
            label="Email"
            type="email"
            placeholder="optional"
          />

          <div className="flex items-center justify-between rounded-[14px] border border-gold/20 bg-gradient-to-br from-gold/15 to-gold/[0.04] px-[18px] py-4">
            <div>
              <div className="mb-0.5 text-[10.5px] font-bold uppercase tracking-[0.07em] text-gold/65">
                Calculated Total Amount
              </div>
              <div className="text-xs text-[#5C6B82]">
                {formatNumber(area)} Sq.Ft × {formatCurrency(rateNum)}/Sq.Ft
              </div>
            </div>
            <div className="gold-text font-display text-2xl font-extrabold tracking-tight">
              {formatCurrency(calculatedTotal || plot.price)}
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
