"use client";

import { useEffect, useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { getBookingForPlot, updateBooking } from "@/lib/api";
import {
  bookingTimeLeft,
  formatCurrency,
  formatDate,
  formatDateTime,
  formatDecimal,
  num,
} from "@/lib/utils";
import { formatFacingLabel, statusLabel } from "@/lib/plot-styles";
import type { Booking, Plot } from "@/types/database";

export interface BookingRecordModalProps {
  open: boolean;
  plot: Plot | null;
  onClose: () => void;
  onUpdated?: (payload: { booking: Booking; plot: Plot }) => void;
}

/**
 * Booking record:
 * - Reserved: payments + mark sold + cancel reservation
 * - Sold with balance: payments only (collect dues)
 * - Sold fully paid: read-only summary
 * - Void sale (sold only): collapsed, requires confirmVoidSale
 */
export function BookingRecordModal({
  open,
  plot,
  onClose,
  onUpdated,
}: BookingRecordModalProps) {
  const [loading, setLoading] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [booking, setBooking] = useState<Booking | null>(null);
  const [paymentInput, setPaymentInput] = useState("");
  const [cancelReason, setCancelReason] = useState("");
  const [forfeitAdvance, setForfeitAdvance] = useState(false);
  const [showVoidSale, setShowVoidSale] = useState(false);

  useEffect(() => {
    if (!open || !plot) {
      setBooking(null);
      setError(null);
      setCancelReason("");
      setForfeitAdvance(false);
      setShowVoidSale(false);
      setPaymentInput("");
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);
    void getBookingForPlot(plot.id)
      .then((b) => {
        if (!cancelled) {
          setBooking(b);
          if (!b) {
            setError(
              plot.status === "blocked"
                ? "Blocked plots have no active booking. Unblock via Edit Details when ready."
                : "No active booking for this plot. Use Add Booking, or the booking was cancelled."
            );
          }
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Failed to load booking"
          );
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [open, plot]);

  const total = booking ? num(booking.totalAmount) : 0;
  const advance = booking ? num(booking.advancePaid) : 0;
  const balance = Math.max(0, total - advance);
  const timeLeft = booking ? bookingTimeLeft(booking.bookingDate) : null;
  const plotStatus = booking?.plot?.status ?? plot?.status;
  const isActive = booking?.status !== "cancelled";
  const isSold = plotStatus === "sold";
  const isReserved = plotStatus === "reserved";
  const canCollectPayment = isActive && balance > 0;
  const canCancelReservation = isActive && isReserved;
  const canVoidSale = isActive && isSold;

  async function runUpdate(body: Parameters<typeof updateBooking>[1]) {
    if (!booking) return;
    setPending(true);
    setError(null);
    try {
      const result = await updateBooking(booking.id, body);
      setBooking(result.booking);
      setPaymentInput("");
      onUpdated?.(result);
      if (body.cancel) {
        onClose();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Update failed");
    } finally {
      setPending(false);
    }
  }

  async function handleRecordPayment() {
    if (!booking || !canCollectPayment) return;
    const amount = Number(paymentInput);
    if (!Number.isFinite(amount) || amount <= 0) {
      setError("Enter a valid payment amount.");
      return;
    }
    const next = Math.min(total, advance + amount);
    await runUpdate({ advancePaid: next });
  }

  async function handleCancelReservation() {
    if (!booking || !canCancelReservation) return;
    const ok = window.confirm(
      `Cancel reservation for Plot #${plot?.plotNumber}?\n\nPlot becomes Available.\nThis booking is removed from executive & venture analytics.`
    );
    if (!ok) return;
    await runUpdate({
      cancel: true,
      cancelReason: cancelReason.trim() || null,
      forfeitedAdvance: forfeitAdvance,
    });
  }

  async function handleVoidSale() {
    if (!booking || !canVoidSale) return;
    const ok = window.confirm(
      `VOID SALE for Plot #${plot?.plotNumber}?\n\nThis reverses a sold plot back to Available and removes the deal from analytics.\nOnly use for genuine sale cancellations / legal unwind.`
    );
    if (!ok) return;
    await runUpdate({
      cancel: true,
      confirmVoidSale: true,
      cancelReason: cancelReason.trim() || "Sale voided",
      forfeitedAdvance: forfeitAdvance,
    });
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      subtitle="Client booking record"
      title={plot ? `Plot #${plot.plotNumber}` : "Booking"}
      className="max-w-[640px] bg-slate-900/80 backdrop-blur-md"
      footer={
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button variant="ghost" className="flex-1" onClick={onClose}>
            Close
          </Button>
          {booking && isActive && isReserved ? (
            <Button
              variant="gold"
              className="flex-[1.4]"
              disabled={pending}
              onClick={() =>
                void runUpdate({
                  settleFullPayment: balance > 0,
                  markPlotSold: true,
                })
              }
            >
              {pending
                ? "Saving…"
                : balance > 0
                  ? "Mark Sold + Settle Balance"
                  : "Mark Plot Sold"}
            </Button>
          ) : null}
        </div>
      }
    >
      {loading ? (
        <p className="text-sm text-[#5C6B82]">Loading booking details…</p>
      ) : error && !booking ? (
        <p className="text-sm text-plot-sold">{error}</p>
      ) : !booking ? (
        <p className="text-sm text-[#5C6B82]">No active booking on file.</p>
      ) : (
        <div className="max-h-[min(70vh,620px)] space-y-4 overflow-y-auto pr-1">
          <div className="flex flex-wrap items-center gap-2">
            <Badge
              tone={
                isSold
                  ? "danger"
                  : isReserved
                    ? "warning"
                    : "neutral"
              }
              dot
            >
              {statusLabel(plotStatus ?? "reserved")}
            </Badge>
            {isSold && balance > 0 ? (
              <Badge tone="warning">Balance due</Badge>
            ) : null}
            {isSold && balance <= 0 ? (
              <Badge tone="success">Fully paid</Badge>
            ) : null}
            {formatFacingLabel(
              booking.plot?.facing ?? plot?.facing,
              plot?.roadSides
            ) ? (
              <span className="rounded-lg border border-white/10 bg-obsidian/40 px-2.5 py-1 text-[11.5px] text-pearl">
                🧭{" "}
                {formatFacingLabel(
                  booking.plot?.facing ?? plot?.facing,
                  plot?.roadSides
                )}
              </span>
            ) : null}
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Info label="Customer" value={booking.customerName} mono={false} />
            <Info label="Phone" value={booking.customerPhone} />
            <Info label="Booking date" value={formatDate(booking.bookingDate)} />
            <Info
              label="Recorded at"
              value={formatDateTime(booking.createdAt)}
            />
            {isReserved || balance > 0 ? (
              <>
                <Info
                  label="Balance due by"
                  value={
                    timeLeft
                      ? `${formatDate(timeLeft.dueDate)} (${timeLeft.label})`
                      : "—"
                  }
                />
                <Info
                  label="Time left"
                  value={timeLeft?.label ?? "—"}
                  emphasize={timeLeft?.overdue}
                />
              </>
            ) : (
              <Info
                label="Sale status"
                value="Closed — fully settled"
                mono={false}
              />
            )}
          </div>

          <div className="rounded-[14px] border border-gold/20 bg-gradient-to-br from-gold/15 to-gold/[0.04] p-4">
            <div className="mb-3 grid grid-cols-3 gap-2 text-center">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-gold/70">
                  Total
                </p>
                <p className="font-mono text-sm font-bold text-pearl">
                  {formatCurrency(total)}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-gold/70">
                  Paid
                </p>
                <p className="font-mono text-sm font-bold text-plot-available">
                  {formatCurrency(advance)}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-gold/70">
                  Pending
                </p>
                <p className="font-mono text-sm font-bold text-plot-reserved">
                  {formatCurrency(balance)}
                </p>
              </div>
            </div>
            <p className="text-center text-[11px] text-[#5C6B82]">
              Rate {formatCurrency(num(booking.agreedRatePerSqYard))}/Sq.Yd
              {booking.plot?.areaGadhi != null
                ? ` · ${formatDecimal(num(booking.plot.areaGadhi))} Gadhi`
                : ""}
            </p>
          </div>

          {isReserved ? (
            <p className="rounded-xl border border-white/10 bg-obsidian/40 px-3.5 py-3 text-[12px] leading-relaxed text-[#8B97AD]">
              <span className="font-semibold text-pearl">Reserved: </span>
              Collect payments, then mark sold. Cancel reservation only if the
              customer backs out — that frees the plot and drops analytics.
            </p>
          ) : null}

          {isSold ? (
            <p className="rounded-xl border border-white/10 bg-obsidian/40 px-3.5 py-3 text-[12px] leading-relaxed text-[#8B97AD]">
              <span className="font-semibold text-pearl">Sold: </span>
              {balance > 0
                ? "Sale is recorded. Collect remaining balance below — cancel is hidden to avoid accidental inventory release."
                : "Sale is fully settled. This record is read-only except for rare void-sale recovery."}
            </p>
          ) : null}

          {booking.notes ? (
            <div>
              <p className="mb-1.5 text-[11px] font-bold uppercase tracking-[0.07em] text-[#5C6B82]">
                Agreement notes
              </p>
              <p className="rounded-xl border border-white/10 bg-obsidian/30 px-3.5 py-3 text-[12.5px] leading-relaxed text-pearl">
                {booking.notes}
              </p>
            </div>
          ) : null}

          {canCollectPayment ? (
            <div className="space-y-2.5 rounded-xl border border-white/10 bg-obsidian/30 p-3.5">
              <p className="text-[11px] font-bold uppercase tracking-[0.07em] text-[#5C6B82]">
                {isSold ? "Collect remaining balance" : "Record payment"}
              </p>
              <div className="flex flex-col gap-2 sm:flex-row">
                <Input
                  value={paymentInput}
                  onChange={(e) => setPaymentInput(e.target.value)}
                  placeholder={`Amount (max ${balance})`}
                  className="font-mono"
                />
                <Button
                  variant="secondary"
                  disabled={pending}
                  onClick={() => void handleRecordPayment()}
                >
                  Add payment
                </Button>
                <Button
                  variant="gold"
                  disabled={pending}
                  onClick={() => void runUpdate({ settleFullPayment: true })}
                >
                  Settle full
                </Button>
              </div>
            </div>
          ) : null}

          {isActive && balance <= 0 ? (
            <p className="text-sm text-plot-available">
              Fully paid — no pending balance on this booking.
            </p>
          ) : null}

          {canCancelReservation ? (
            <div className="space-y-2.5 rounded-xl border border-plot-sold/25 bg-plot-sold/5 p-3.5">
              <p className="text-[11px] font-bold uppercase tracking-[0.07em] text-plot-sold">
                Cancel reservation
              </p>
              <p className="text-[12px] leading-relaxed text-[#8B97AD]">
                Customer backed out before sale. Plot returns to Available and
                this booking leaves live analytics.
              </p>
              <Input
                label="Cancel reason (optional)"
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Customer cancelled / refund initiated…"
              />
              <label className="flex items-start gap-2 text-[12.5px] text-[#8B97AD]">
                <input
                  type="checkbox"
                  className="mt-0.5"
                  checked={forfeitAdvance}
                  onChange={(e) => setForfeitAdvance(e.target.checked)}
                />
                <span>
                  Mark advance as forfeited (audit only — still removed from live
                  analytics)
                </span>
              </label>
              <Button
                variant="secondary"
                className="w-full border-plot-sold/30 bg-plot-sold/10 text-plot-sold hover:bg-plot-sold/20"
                disabled={pending}
                onClick={() => void handleCancelReservation()}
              >
                {pending ? "Cancelling…" : "Cancel booking & free plot"}
              </Button>
            </div>
          ) : null}

          {canVoidSale ? (
            <div className="space-y-2.5 rounded-xl border border-white/10 bg-obsidian/20 p-3.5">
              {!showVoidSale ? (
                <button
                  type="button"
                  className="text-[12px] font-semibold text-[#5C6B82] underline-offset-2 hover:text-plot-sold hover:underline"
                  onClick={() => setShowVoidSale(true)}
                >
                  Need to void this sale? (rare)
                </button>
              ) : (
                <>
                  <p className="text-[11px] font-bold uppercase tracking-[0.07em] text-plot-sold">
                    Void sale
                  </p>
                  <p className="text-[12px] leading-relaxed text-[#8B97AD]">
                    Reverses sold → available and removes the deal from
                    analytics. Use only for legal unwind / admin correction.
                  </p>
                  <Input
                    label="Void reason"
                    value={cancelReason}
                    onChange={(e) => setCancelReason(e.target.value)}
                    placeholder="Sale cancelled / registration failed…"
                  />
                  <label className="flex items-start gap-2 text-[12.5px] text-[#8B97AD]">
                    <input
                      type="checkbox"
                      className="mt-0.5"
                      checked={forfeitAdvance}
                      onChange={(e) => setForfeitAdvance(e.target.checked)}
                    />
                    <span>Mark advance as forfeited (audit only)</span>
                  </label>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      className="flex-1"
                      onClick={() => setShowVoidSale(false)}
                    >
                      Keep sale
                    </Button>
                    <Button
                      variant="secondary"
                      className="flex-1 border-plot-sold/30 bg-plot-sold/10 text-plot-sold"
                      disabled={pending}
                      onClick={() => void handleVoidSale()}
                    >
                      {pending ? "Voiding…" : "Confirm void sale"}
                    </Button>
                  </div>
                </>
              )}
            </div>
          ) : null}

          {error ? <p className="text-sm text-plot-sold">{error}</p> : null}
        </div>
      )}
    </Modal>
  );
}

function Info({
  label,
  value,
  mono = true,
  emphasize,
}: {
  label: string;
  value: string;
  mono?: boolean;
  emphasize?: boolean;
}) {
  return (
    <div className="rounded-xl border border-white/[0.07] bg-obsidian/40 px-3.5 py-3">
      <div className="mb-1 text-[10.5px] font-semibold uppercase tracking-[0.07em] text-[#5C6B82]">
        {label}
      </div>
      <div
        className={`${mono ? "font-mono" : "font-display"} text-[13.5px] font-medium ${
          emphasize ? "text-plot-sold" : "text-pearl"
        }`}
      >
        {value}
      </div>
    </div>
  );
}
