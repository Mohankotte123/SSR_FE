"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { MetricsCard } from "@/components/admin/MetricsCard";
import { VentureSwitcher } from "@/components/admin/VentureSwitcher";
import { Badge } from "@/components/ui/Badge";
import { getVentureAnalytics } from "@/lib/api";
import { formatCurrency, formatNumber, num } from "@/lib/utils";
import type { Venture, VentureAnalytics } from "@/types/database";

export function VentureAnalyticsClient({
  id,
  ventures,
}: {
  id: string;
  ventures: Venture[];
}) {
  const [analytics, setAnalytics] = useState<VentureAnalytics | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    setError(null);
    setAnalytics(null);
    void getVentureAnalytics(id).then((result) => {
      if (result.success) setAnalytics(result.data);
      else setError(result.error);
      setLoading(false);
    });
  }, [id]);

  const currentSlug = analytics?.venture.slug ?? id;

  if (loading) {
    return (
      <div className="space-y-6">
        <Link
          href="/admin/ventures"
          className="inline-flex items-center gap-1.5 rounded-full border border-gold/20 bg-gold/10 px-4 py-2 font-display text-[12.5px] font-bold text-gold"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          All ventures
        </Link>
        <VentureSwitcher
          ventures={ventures}
          currentSlug={id}
          section="analytics"
        />
        <p className="text-sm text-[#8B97AD]">Loading venture analytics…</p>
      </div>
    );
  }

  if (error || !analytics) {
    return (
      <div className="space-y-6">
        <Link
          href="/admin/ventures"
          className="inline-flex items-center gap-1.5 rounded-full border border-gold/20 bg-gold/10 px-4 py-2 font-display text-[12.5px] font-bold text-gold"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          All ventures
        </Link>
        <VentureSwitcher
          ventures={ventures}
          currentSlug={id}
          section="analytics"
        />
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
          {error || "Unavailable"}.{" "}
          <Link href="/admin/login" className="text-gold underline">
            Sign in
          </Link>{" "}
          to load venture analytics.
        </div>
      </div>
    );
  }

  const by = analytics.inventory.byStatus;
  const committed = by.reserved + by.sold;
  const blocked = by.blocked ?? 0;
  const occupancy =
    analytics.inventory.totalPlots > 0
      ? committed / analytics.inventory.totalPlots
      : 0;
  const avgPlot =
    analytics.inventory.totalPlots > 0
      ? Math.round(
          num(analytics.valuation.potentialValue) /
            analytics.inventory.totalPlots
        )
      : 0;

  return (
    <div className="space-y-8">
      <div>
        <Link
          href="/admin/ventures"
          className="mb-5 inline-flex items-center gap-1.5 rounded-full border border-gold/20 bg-gold/10 px-4 py-2 font-display text-[12.5px] font-bold text-gold"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          All ventures
        </Link>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="section-label mb-2">Venture Intelligence</p>
            <h1 className="font-display text-[28px] font-extrabold tracking-tight text-pearl">
              {analytics.venture.title}
            </h1>
            <p className="mt-1 text-sm text-[#5C6B82]">
              {analytics.venture.location} · live inventory & financials
            </p>
          </div>
          <VentureSwitcher
            ventures={ventures}
            currentSlug={currentSlug}
            section="analytics"
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricsCard
          label="Occupancy"
          value={`${(occupancy * 100).toFixed(1)}%`}
          hint={`${formatNumber(committed)} committed`}
          accent="gold"
          trend="up"
        />
        <MetricsCard
          label="Available"
          value={by.available}
          hint={`${formatNumber(analytics.inventory.totalPlots)} total · ${formatNumber(blocked)} blocked`}
          accent="emerald"
        />
        <MetricsCard
          label="Realized value"
          value={formatCurrency(num(analytics.valuation.realizedValue))}
          hint={`Potential ${formatCurrency(num(analytics.valuation.potentialValue))} · avg ${formatCurrency(avgPlot)}`}
          accent="slate"
          trend="up"
        />
        <MetricsCard
          label="Leads"
          value={analytics.leads.total}
          hint={`${formatNumber(by.reserved)} reserved · advances ${formatCurrency(num(analytics.financials.advanceCollected))}`}
          accent="amber"
        />
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <div className="rounded-2xl border border-white/[0.08] bg-midnight p-5">
          <h2 className="mb-4 font-display text-sm font-bold text-pearl">
            Recent bookings
          </h2>
          {analytics.previews.recentBookings.length === 0 ? (
            <p className="text-sm text-[#5C6B82]">No bookings yet.</p>
          ) : (
            <ul className="space-y-3">
              {analytics.previews.recentBookings.map((b) => (
                <li
                  key={b.id}
                  className="flex items-start justify-between gap-3 border-b border-white/[0.06] pb-3 last:border-0"
                >
                  <div>
                    <p className="font-display text-sm font-bold text-pearl">
                      {b.customerName}
                    </p>
                    <p className="text-xs text-[#5C6B82]">
                      Plot #{b.plot.plotNumber} · {b.customerPhone}
                    </p>
                  </div>
                  <div className="text-right">
                    <Badge
                      tone={
                        b.plot.status === "reserved" ? "warning" : "danger"
                      }
                    >
                      {b.plot.status}
                    </Badge>
                    <p className="mt-1 font-mono text-xs text-gold">
                      {formatCurrency(num(b.totalAmount))}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-2xl border border-white/[0.08] bg-midnight p-5">
          <h2 className="mb-4 font-display text-sm font-bold text-pearl">
            Recent leads
          </h2>
          {analytics.previews.recentLeads.length === 0 ? (
            <p className="text-sm text-[#5C6B82]">No leads yet.</p>
          ) : (
            <ul className="space-y-3">
              {analytics.previews.recentLeads.map((l) => (
                <li
                  key={l.id}
                  className="border-b border-white/[0.06] pb-3 last:border-0"
                >
                  <p className="font-display text-sm font-bold text-pearl">
                    {l.name}
                  </p>
                  <p className="text-xs text-[#5C6B82]">
                    {l.phone}
                    {l.plotNumber ? ` · Plot #${l.plotNumber}` : ""}
                  </p>
                  {l.message ? (
                    <p className="mt-1 text-xs text-[#8B97AD]">{l.message}</p>
                  ) : null}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="flex gap-2.5">
        <Link
          href={`/admin/ventures/${currentSlug}/plots`}
          className="rounded-[10px] border border-white/10 bg-pearl/5 px-5 py-2.5 font-display text-[12.5px] font-bold text-[#8B97AD] hover:border-gold/30 hover:text-gold"
        >
          Open Inventory Matrix →
        </Link>
      </div>
    </div>
  );
}
