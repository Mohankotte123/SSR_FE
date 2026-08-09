"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Building2,
  CircleDollarSign,
  Grid3x3,
  TrendingUp,
  Plus,
} from "lucide-react";
import { MetricsCard } from "@/components/admin/MetricsCard";
import { ExportReportButton } from "@/components/admin/ExportReportButton";
import { Badge } from "@/components/ui/Badge";
import { getGlobalAnalytics } from "@/lib/api";
import { formatCurrency, formatNumber } from "@/lib/utils";
import type { GlobalAnalytics, Venture } from "@/types/database";

export function DashboardClient({ ventures }: { ventures: Venture[] }) {
  const [analytics, setAnalytics] = useState<GlobalAnalytics | null>(null);
  const [authHint, setAuthHint] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void getGlobalAnalytics().then((result) => {
      if (result.success) {
        setAnalytics(result.data);
        setAuthHint(null);
      } else {
        setAuthHint(result.error);
      }
      setLoading(false);
    });
  }, []);

  const sold = analytics?.plots.sold ?? 0;
  const reserved = analytics?.plots.reserved ?? 0;
  const available = analytics?.plots.available ?? 0;
  const blocked = analytics?.plots.blocked ?? 0;
  const totalPlots =
    analytics?.plots.total || sold + reserved + available + blocked || 1;
  const soldPct = Math.round((sold / totalPlots) * 100);
  const reservedPct = Math.round((reserved / totalPlots) * 100);
  const availablePct = Math.round((available / totalPlots) * 100);

  const realized = analytics?.financials.totalRealizedRevenue ?? 0;
  const advances = analytics?.financials.totalAdvanceCollected ?? 0;
  const pending = analytics?.financials.totalPendingReceivables ?? 0;
  const potential = analytics?.valuation.grossPotentialValue ?? 0;
  const conversion = totalPlots > 0 ? (sold + reserved) / totalPlots : 0;

  return (
    <div className="mx-auto max-w-[1280px] space-y-7">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="section-label mb-2">Executive Overview</p>
          <h1 className="font-display text-[28px] font-extrabold tracking-tight text-pearl">
            Analytics Dashboard
          </h1>
          <p className="mt-1 text-sm text-[#5C6B82]">
            Portfolio intelligence across all ventures
            {loading ? " · loading…" : ""}
          </p>
        </div>
        <div className="flex gap-2.5">
          <ExportReportButton />
          <Link
            href="/admin/ventures/new"
            className="btn-gold inline-flex h-[42px] items-center gap-1.5 rounded-[10px] px-[22px] text-[12.5px]"
          >
            <Plus className="h-3.5 w-3.5" />
            New Venture
          </Link>
        </div>
      </div>

      {authHint ? (
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
          Admin analytics unavailable: {authHint}. Sign in at{" "}
          <Link href="/admin/login" className="text-gold underline">
            /admin/login
          </Link>
          .
        </div>
      ) : null}

      <div className="grid gap-[18px] sm:grid-cols-2 xl:grid-cols-4">
        <MetricsCard
          label="Ventures"
          value={analytics?.ventures.total ?? ventures.length}
          hint={`${formatNumber(ventures.length)} listed publicly`}
          icon={Building2}
          accent="gold"
          trend="up"
        />
        <MetricsCard
          label="Available plots"
          value={available}
          hint={`${formatNumber(analytics?.plots.total ?? 0)} inventory`}
          icon={Grid3x3}
          accent="emerald"
          trend="neutral"
        />
        <MetricsCard
          label="Realized revenue"
          value={formatCurrency(realized)}
          hint={`Advances ${formatCurrency(advances)}`}
          icon={CircleDollarSign}
          accent="slate"
          trend="up"
        />
        <MetricsCard
          label="Commitment rate"
          value={`${(conversion * 100).toFixed(1)}%`}
          hint={`${formatNumber(sold)} sold · ${formatNumber(reserved)} reserved · ${formatNumber(blocked)} blocked · ${formatNumber(analytics?.leads.total ?? 0)} leads`}
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
            <Badge tone={analytics ? "success" : "neutral"}>
              {analytics ? "Live" : "Offline"}
            </Badge>
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
                n: sold,
              },
              {
                color: "#C4923A",
                bg: "rgba(255,171,0,0.10)",
                label: "Reserved",
                n: reserved,
              },
              {
                color: "#2E9E6B",
                bg: "rgba(0,200,83,0.10)",
                label: "Available",
                n: available,
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
                <div className="text-[11px] font-bold" style={{ color: s.color }}>
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
              label: "Gross potential",
              val: potential,
              color: "#B7A589",
              max: Math.max(potential, 1),
            },
            {
              label: "Realized revenue",
              val: realized,
              color: "#2E9E6B",
              max: Math.max(potential, realized, 1),
            },
            {
              label: "Pending receivables",
              val: pending,
              color: "#C4923A",
              max: Math.max(potential, pending, 1),
            },
          ].map((b) => (
            <div key={b.label} className="mb-3.5">
              <div className="mb-1.5 flex justify-between">
                <span className="text-[12.5px] text-[#8B97AD]">{b.label}</span>
                <span
                  className="font-mono text-[13px] font-medium"
                  style={{ color: b.color }}
                >
                  {formatCurrency(b.val)}
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
          Quick links · ventures
        </p>
        <div className="flex flex-wrap gap-2.5">
          {ventures.length === 0 ? (
            <p className="text-sm text-[#5C6B82]">No ventures yet.</p>
          ) : (
            ventures.map((v) => (
              <span key={v.id} className="flex flex-wrap gap-2">
                <Link
                  href={`/admin/ventures/${v.slug}/plots`}
                  className="rounded-[10px] border border-gold/20 bg-gold/10 px-4 py-2 font-display text-xs font-bold text-gold"
                >
                  {v.title} Inventory
                </Link>
                <Link
                  href={`/admin/ventures/${v.slug}/analytics`}
                  className="rounded-[10px] border border-white/10 bg-pearl/5 px-4 py-2 font-display text-xs font-bold text-[#8B97AD]"
                >
                  {v.title} Analytics
                </Link>
                <Link
                  href={`/ventures/${v.slug}`}
                  className="rounded-[10px] border border-white/10 bg-pearl/5 px-4 py-2 font-display text-xs font-bold text-[#8B97AD]"
                >
                  Public Map
                </Link>
              </span>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
