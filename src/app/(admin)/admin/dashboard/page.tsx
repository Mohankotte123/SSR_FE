import type { Metadata } from "next";
import Link from "next/link";
import {
  Building2,
  CircleDollarSign,
  Grid3x3,
  TrendingUp,
  Download,
  Plus,
} from "lucide-react";
import { MetricsCard } from "@/components/admin/MetricsCard";
import { Badge } from "@/components/ui/Badge";
import { MOCK_GLOBAL_ANALYTICS } from "@/lib/mock-data";
import { formatCurrency, formatNumber } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Admin Dashboard",
};

export default function AdminDashboardPage() {
  const analytics = MOCK_GLOBAL_ANALYTICS;

  const total =
    analytics.sold_plots + analytics.reserved_plots + analytics.available_plots ||
    1;
  const soldPct = Math.round((analytics.sold_plots / total) * 100);
  const reservedPct = Math.round((analytics.reserved_plots / total) * 100);
  const availablePct = Math.max(0, 100 - soldPct - reservedPct);

  return (
    <div className="mx-auto max-w-[1280px] space-y-7">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="section-label mb-2">Executive Overview</p>
          <h1 className="font-display text-[28px] font-extrabold tracking-tight text-pearl">
            Analytics Dashboard
          </h1>
          <p className="mt-1 text-sm text-[#5C6B82]">
            Portfolio intelligence across all ventures · static demo data
          </p>
        </div>
        <div className="flex gap-2.5">
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-[10px] border border-white/10 bg-pearl/5 px-5 py-2.5 font-display text-[12.5px] font-semibold text-[#8B97AD]"
          >
            <Download className="h-3.5 w-3.5" />
            Export Report
          </button>
          <Link
            href="/admin/ventures/new"
            className="btn-gold inline-flex items-center gap-1.5 rounded-[10px] px-[22px] py-2.5 text-[12.5px]"
          >
            <Plus className="h-3.5 w-3.5" />
            New Venture
          </Link>
        </div>
      </div>

      <div className="grid gap-[18px] sm:grid-cols-2 xl:grid-cols-4">
        <MetricsCard
          label="Active ventures"
          value={analytics.active_ventures}
          hint={`${formatNumber(analytics.total_ventures)} total`}
          icon={Building2}
          accent="gold"
          trend="up"
        />
        <MetricsCard
          label="Available plots"
          value={analytics.available_plots}
          hint={`${formatNumber(analytics.total_plots)} inventory`}
          icon={Grid3x3}
          accent="emerald"
          trend="neutral"
        />
        <MetricsCard
          label="Revenue"
          value={formatCurrency(analytics.total_revenue)}
          hint={`${formatNumber(analytics.bookings_this_month)} bookings this month`}
          icon={CircleDollarSign}
          accent="slate"
          trend="up"
        />
        <MetricsCard
          label="Conversion rate"
          value={`${(analytics.conversion_rate * 100).toFixed(1)}%`}
          hint={`${formatNumber(analytics.sold_plots)} sold · ${formatNumber(analytics.reserved_plots)} reserved`}
          icon={TrendingUp}
          accent="amber"
          trend="up"
        />
      </div>

      <div className="grid gap-5 lg:grid-cols-[1fr_1fr]">
        <div className="rounded-2xl border border-white/[0.08] bg-midnight p-6">
          <div className="mb-[18px] flex items-start justify-between">
            <div>
              <h2 className="font-display text-[15px] font-bold text-pearl">
                Inventory Distribution
              </h2>
              <p className="mt-1 font-mono text-[11px] text-[#5C6B82]">
                LIVE STOCK ACROSS PORTFOLIO
              </p>
            </div>
            <Badge tone="neutral">Demo</Badge>
          </div>

          <div className="mb-[18px] flex h-[22px] gap-0.5 overflow-hidden rounded-lg">
            {[
              { pct: soldPct, color: "#C45A4A", label: "Sold" },
              { pct: reservedPct, color: "#C4923A", label: "Reserved" },
              { pct: availablePct, color: "#2E9E6B", label: "Available" },
            ]
              .filter((s) => s.pct > 0)
              .map((seg) => (
                <div
                  key={seg.label}
                  className="flex items-center justify-center"
                  style={{
                    flex: seg.pct,
                    background: `linear-gradient(90deg, ${seg.color}CC, ${seg.color})`,
                    boxShadow: `0 0 8px ${seg.color}40`,
                  }}
                >
                  <span className="text-[11px] font-extrabold text-white drop-shadow">
                    {seg.pct}%
                  </span>
                </div>
              ))}
          </div>

          <div className="grid grid-cols-3 gap-3">
            {[
              {
                color: "#C45A4A",
                bg: "rgba(255,61,0,0.10)",
                label: "Sold",
                n: analytics.sold_plots,
              },
              {
                color: "#C4923A",
                bg: "rgba(255,171,0,0.10)",
                label: "Reserved",
                n: analytics.reserved_plots,
              },
              {
                color: "#2E9E6B",
                bg: "rgba(0,200,83,0.10)",
                label: "Available",
                n: analytics.available_plots,
              },
            ].map((s) => (
              <div
                key={s.label}
                className="rounded-[10px] px-3 py-2.5 text-center"
                style={{ background: s.bg }}
              >
                <div
                  className="font-display text-lg font-extrabold"
                  style={{ color: s.color }}
                >
                  {s.n}
                </div>
                <div
                  className="text-[11px] font-bold"
                  style={{ color: s.color }}
                >
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-white/[0.08] bg-midnight p-6">
          <h2 className="font-display text-[15px] font-bold text-pearl">
            Revenue Realization
          </h2>
          <p className="mb-5 mt-1 font-mono text-[11px] text-[#5C6B82]">
            AGAINST TOTAL PORTFOLIO ACTIVITY
          </p>
          {[
            {
              label: "Total revenue",
              val: analytics.total_revenue,
              color: "#B7A589",
              max: Math.max(analytics.total_revenue, 1),
            },
            {
              label: "Bookings this month",
              val: analytics.bookings_this_month,
              color: "#2E9E6B",
              max: Math.max(analytics.bookings_this_month * 2, 1),
              isCount: true,
            },
            {
              label: "Conversion",
              val: analytics.conversion_rate * 100,
              color: "#C4923A",
              max: 100,
              isPct: true,
            },
          ].map((b) => (
            <div key={b.label} className="mb-3.5">
              <div className="mb-1.5 flex justify-between">
                <span className="text-[12.5px] text-[#8B97AD]">{b.label}</span>
                <span
                  className="font-mono text-[13px] font-medium"
                  style={{ color: b.color }}
                >
                  {"isPct" in b && b.isPct
                    ? `${b.val.toFixed(1)}%`
                    : "isCount" in b && b.isCount
                      ? formatNumber(b.val)
                      : formatCurrency(b.val)}
                </span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-pearl/[0.06]">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${Math.min(100, (b.val / b.max) * 100)}%`,
                    background: b.color,
                    boxShadow: `0 0 10px ${b.color}50`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-white/[0.08] bg-midnight p-5">
        <p className="mb-3 font-display text-sm font-bold text-pearl">
          Quick links · demo inventory
        </p>
        <div className="flex flex-wrap gap-2.5">
          <Link
            href="/admin/ventures/1/plots"
            className="rounded-[10px] border border-gold/20 bg-gold/10 px-4 py-2 font-display text-xs font-bold text-gold"
          >
            Grand Palms Inventory
          </Link>
          <Link
            href="/admin/ventures/1/analytics"
            className="rounded-[10px] border border-white/10 bg-pearl/5 px-4 py-2 font-display text-xs font-bold text-[#8B97AD]"
          >
            Grand Palms Analytics
          </Link>
          <Link
            href="/ventures/grand-palms"
            className="rounded-[10px] border border-white/10 bg-pearl/5 px-4 py-2 font-display text-xs font-bold text-[#8B97AD]"
          >
            Public Layout Map
          </Link>
        </div>
      </div>
    </div>
  );
}
