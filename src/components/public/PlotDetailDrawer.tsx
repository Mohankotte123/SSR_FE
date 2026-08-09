"use client";

import { useState } from "react";
import { CalendarDays, FileDown, MessageCircle } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Drawer } from "@/components/ui/Drawer";
import { Input } from "@/components/ui/Input";
import { createLead } from "@/lib/api";
import {
  formatCurrency,
  formatDecimal,
  formatGadhiSqFt,
  formatNumber,
  hasPlotDimensions,
  num,
  plotTotal,
} from "@/lib/utils";
import { statusLabel, whatsappEnquireUrl } from "@/lib/plot-styles";
import type { Plot, PlotStatus } from "@/types/database";

export interface PlotDetailDrawerProps {
  open: boolean;
  plot: Plot | null;
  onClose: () => void;
  ventureId: string;
  ventureName?: string;
  brochurePdfUrl?: string | null;
}

const badgeTone: Record<
  PlotStatus,
  "success" | "warning" | "danger" | "neutral"
> = {
  available: "success",
  reserved: "warning",
  sold: "danger",
  blocked: "neutral",
};

/**
 * Glassmorphic plot detail drawer — Gadhi / Sq.Ft primary metrics + leads.
 */
export function PlotDetailDrawer({
  open,
  plot,
  onClose,
  ventureId,
  ventureName,
  brochurePdfUrl,
}: PlotDetailDrawerProps) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const total = plot ? plotTotal(plot) : 0;
  const gadhi = plot ? num(plot.areaGadhi) : 0;
  const sqFt = plot ? num(plot.areaSqFt) : 0;
  const sqYd = plot ? num(plot.areaSqYards) : 0;
  const rateGadhi = plot ? num(plot.pricePerGadhi) : 0;
  const rateSqYd = plot ? num(plot.pricePerSqYard) : 0;
  const areaLabel = plot ? formatGadhiSqFt(plot) : "";

  const waUrl = plot
    ? whatsappEnquireUrl({
        plotNumber: plot.plotNumber,
        ventureName,
        areaLabel: areaLabel !== "—" ? areaLabel : undefined,
      })
    : "#";

  async function submitLead(kind: "whatsapp" | "visit") {
    if (!plot) return;
    if (!name.trim() || !phone.trim()) {
      setError("Name and phone are required.");
      return;
    }

    setPending(true);
    setError(null);
    setFeedback(null);
    try {
      await createLead({
        ventureId,
        plotNumber: plot.plotNumber,
        name: name.trim(),
        phone: phone.trim(),
        message:
          message.trim() ||
          (kind === "visit"
            ? `Schedule site visit for plot ${plot.plotNumber} (${areaLabel})`
            : `Interested in plot ${plot.plotNumber} (${areaLabel})`),
      });
      setFeedback(
        kind === "visit"
          ? "Site visit request submitted. We’ll call you shortly."
          : "Enquiry saved. Opening WhatsApp…"
      );
      if (kind === "whatsapp") {
        window.open(waUrl, "_blank", "noopener,noreferrer");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit enquiry");
    } finally {
      setPending(false);
    }
  }

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title={plot ? `Plot #${plot.plotNumber}` : "Plot"}
      headerExtra={
        plot ? (
          <Badge tone={badgeTone[plot.status]} dot className="text-[13px]">
            {statusLabel(plot.status)}
          </Badge>
        ) : null
      }
    >
      {!plot ? (
        <p className="text-sm text-[#5C6B82]">
          Select a plot on the layout to view details.
        </p>
      ) : (
        <div className="space-y-[18px]">
          <div className="glass-gold rounded-[14px] p-[18px]">
            <div className="mb-1.5 text-[10.5px] font-bold uppercase tracking-[0.08em] text-gold/70">
              Plot size
            </div>
            <div className="gold-text font-display text-[26px] font-extrabold leading-tight tracking-tight">
              {gadhi > 0
                ? `${formatDecimal(gadhi)} Gadhi`
                : formatGadhiSqFt(plot)}
            </div>
            {sqFt > 0 ? (
              <p className="mt-1.5 font-mono text-sm text-pearl">
                {formatDecimal(sqFt)} Sq. Ft.
              </p>
            ) : null}
            {sqYd > 0 ? (
              <p className="mt-1 font-mono text-xs text-[#8B97AD]">
                {formatDecimal(sqYd)} Sq. Yds.
              </p>
            ) : null}
          </div>

          {hasPlotDimensions(plot) ? (
            <div>
              <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.07em] text-[#5C6B82]">
                Boundary dimensions
              </p>
              <div className="grid grid-cols-2 gap-2.5">
                {[
                  { label: "East", value: plot.eastDim },
                  { label: "West", value: plot.westDim },
                  { label: "North", value: plot.northDim },
                  { label: "South", value: plot.southDim },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="rounded-xl border border-white/[0.07] bg-obsidian/40 px-3.5 py-3"
                  >
                    <div className="mb-1 text-[10.5px] font-semibold uppercase tracking-[0.07em] text-[#5C6B82]">
                      {item.label}
                    </div>
                    <div className="font-mono text-[13.5px] font-medium text-pearl">
                      {item.value}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          <div className="grid grid-cols-2 gap-2.5">
            {[
              {
                label: "Facing",
                value: plot.facing
                  ? `${String(plot.facing).replace(/_/g, "-")} Facing`
                  : "—",
              },
              {
                label: "Rate / Gadhi",
                value:
                  rateGadhi > 0
                    ? `${formatCurrency(rateGadhi)}/Gadhi`
                    : "—",
              },
              {
                label: "Rate / Sq. Yd",
                value:
                  rateSqYd > 0 ? `${formatCurrency(rateSqYd)}/Sq. Yd` : "—",
              },
              {
                label: "Road",
                value:
                  plot.roadWidthFt != null
                    ? `${formatNumber(num(plot.roadWidthFt))} ft`
                    : "—",
              },
            ].map((item) => (
              <div
                key={item.label}
                className="rounded-xl border border-white/[0.07] bg-obsidian/40 px-3.5 py-3"
              >
                <div className="mb-1 text-[10.5px] font-semibold uppercase tracking-[0.07em] text-[#5C6B82]">
                  {item.label}
                </div>
                <div className="font-mono text-[13.5px] font-medium text-pearl">
                  {item.value}
                </div>
              </div>
            ))}

            <div className="glass-gold col-span-2 rounded-[14px] p-[18px]">
              <div className="mb-1.5 text-[10.5px] font-bold uppercase tracking-[0.08em] text-gold/70">
                Total Estimated Cost
              </div>
              <div className="gold-text font-display text-[30px] font-extrabold leading-none tracking-tight">
                {total ? `₹${(total / 100000).toFixed(1)} Lakhs` : "—"}
              </div>
              <div className="mt-1.5 font-mono text-xs text-[#8B97AD]">
                {formatCurrency(total)} total
              </div>
            </div>
          </div>

          {total > 0 ? (
            <div className="rounded-xl border border-white/[0.07] bg-obsidian/30 px-4 py-3.5">
              <div className="mb-2.5 text-[11px] font-semibold uppercase tracking-[0.07em] text-[#5C6B82]">
                Typical Payment Structure
              </div>
              {[
                {
                  label: "Token Advance (Now)",
                  pct: "5%",
                  amt: Math.round(total * 0.05),
                },
                {
                  label: "Agreement (30 days)",
                  pct: "20%",
                  amt: Math.round(total * 0.2),
                },
                {
                  label: "Balance at Registration",
                  pct: "75%",
                  amt: Math.round(total * 0.75),
                },
              ].map((row) => (
                <div
                  key={row.label}
                  className="flex items-center justify-between border-b border-white/[0.05] py-1.5 last:border-0"
                >
                  <span className="text-xs text-[#8B97AD]">
                    {row.label}{" "}
                    <span className="text-[#5C6B82]">({row.pct})</span>
                  </span>
                  <span className="font-mono text-[12.5px] font-medium text-pearl">
                    {formatCurrency(row.amt)}
                  </span>
                </div>
              ))}
            </div>
          ) : null}

          {plot.status === "available" ? (
            <div className="space-y-3 rounded-xl border border-white/[0.07] bg-obsidian/40 p-4">
              <p className="text-[11px] font-bold uppercase tracking-[0.07em] text-[#5C6B82]">
                Your details
              </p>
              <Input
                label="Name *"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your full name"
              />
              <Input
                label="Phone *"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 …"
              />
              <Input
                label="Message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Optional note"
              />
              {error ? <p className="text-sm text-plot-sold">{error}</p> : null}
              {feedback ? (
                <p className="text-sm text-plot-available">{feedback}</p>
              ) : null}
            </div>
          ) : null}

          <div className="flex flex-col gap-2.5">
            {plot.status === "available" ? (
              <>
                <Button
                  variant="primary"
                  className="h-12 w-full rounded-[13px] bg-[#25D366] text-white hover:brightness-110"
                  disabled={pending}
                  onClick={() => submitLead("whatsapp")}
                >
                  <MessageCircle className="h-4 w-4" />
                  {pending ? "Sending…" : "Inquire via WhatsApp"}
                </Button>
                <Button
                  variant="primary"
                  className="h-12 w-full rounded-[13px]"
                  disabled={pending}
                  onClick={() => submitLead("visit")}
                >
                  <CalendarDays className="h-4 w-4" />
                  Schedule In-Person Site Visit
                </Button>
              </>
            ) : (
              <p className="text-sm text-[#5C6B82]">
                This plot is not available for booking.
              </p>
            )}
            {brochurePdfUrl ? (
              <a
                href={brochurePdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-[13px] border border-white/10 bg-pearl/5 font-display text-sm font-semibold text-[#8B97AD] hover:border-gold/30 hover:text-gold"
              >
                <FileDown className="h-4 w-4" />
                Download Plot Brochure
              </a>
            ) : (
              <Button variant="ghost" className="w-full rounded-[13px]" disabled>
                <FileDown className="h-4 w-4" />
                Brochure unavailable
              </Button>
            )}
          </div>
        </div>
      )}
    </Drawer>
  );
}
