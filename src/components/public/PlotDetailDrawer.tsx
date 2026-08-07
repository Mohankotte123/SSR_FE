"use client";

import { CalendarDays, FileDown, MessageCircle } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Drawer } from "@/components/ui/Drawer";
import { formatCurrency, formatNumber } from "@/lib/utils";
import { statusLabel, whatsappEnquireUrl } from "@/lib/plot-styles";
import type { Plot, PlotStatus } from "@/types/database";

export interface PlotDetailDrawerProps {
  open: boolean;
  plot: Plot | null;
  onClose: () => void;
  onEnquire?: (plot: Plot) => void;
  ventureName?: string;
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
 * Glassmorphic plot detail drawer with WhatsApp deep-link CTA.
 */
export function PlotDetailDrawer({
  open,
  plot,
  onClose,
  onEnquire,
  ventureName,
}: PlotDetailDrawerProps) {
  const total = plot?.price ?? 0;
  const area = plot?.area_sqft;
  const rate =
    area && plot?.price
      ? Math.round(plot.price / (area > 0 ? area : 1))
      : null;

  const waUrl = plot
    ? whatsappEnquireUrl({
        plotNumber: plot.plot_number,
        ventureName,
      })
    : "#";

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title={plot ? `Plot #${plot.plot_number}` : "Plot"}
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
          <div className="grid grid-cols-2 gap-2.5">
            {[
              { label: "Facing", value: plot.facing ? `${plot.facing} Facing` : "—" },
              {
                label: "Area",
                value: area != null ? `${formatNumber(area)} Sq.Ft` : "—",
              },
              {
                label: "Base Rate",
                value: rate != null ? `${formatCurrency(rate)}/Sq.Ft` : "—",
              },
              {
                label: "SVG element",
                value: plot.svg_element_id ?? "—",
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
                {total
                  ? `₹${(total / 100000).toFixed(1)} Lakhs`
                  : "—"}
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
                { label: "Token Advance (Now)", pct: "5%", amt: Math.round(total * 0.05) },
                { label: "Agreement (30 days)", pct: "20%", amt: Math.round(total * 0.2) },
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

          <div className="flex flex-col gap-2.5">
            {plot.status === "available" ? (
              <>
                <a
                  href={waUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-[13px] bg-[#25D366] font-display text-sm font-bold text-white shadow-[0_4px_20px_rgba(37,211,102,0.28)] transition hover:brightness-110"
                  onClick={() => onEnquire?.(plot)}
                >
                  <MessageCircle className="h-4 w-4" />
                  Inquire via WhatsApp
                </a>
                <Button variant="primary" className="h-12 w-full rounded-[13px]">
                  <CalendarDays className="h-4 w-4" />
                  Schedule In-Person Site Visit
                </Button>
              </>
            ) : (
              <p className="text-sm text-[#5C6B82]">
                This plot is not available for booking.
              </p>
            )}
            <Button variant="ghost" className="w-full rounded-[13px]">
              <FileDown className="h-4 w-4" />
              Download Plot Brochure
            </Button>
          </div>
        </div>
      )}
    </Drawer>
  );
}
