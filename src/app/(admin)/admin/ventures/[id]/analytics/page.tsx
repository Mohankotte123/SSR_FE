import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { MetricsCard } from "@/components/admin/MetricsCard";
import { getVentureAnalytics } from "@/lib/mock-data";
import { formatCurrency, formatNumber } from "@/lib/utils";

interface AnalyticsPageProps {
  params: Promise<{ id: string }> | { id: string };
}

async function resolveParams(
  params: AnalyticsPageProps["params"]
): Promise<{ id: string }> {
  return await Promise.resolve(params);
}

export async function generateMetadata({
  params,
}: AnalyticsPageProps): Promise<Metadata> {
  const { id } = await resolveParams(params);
  return { title: `Analytics · ${id}` };
}

export default async function VentureAnalyticsPage({
  params,
}: AnalyticsPageProps) {
  const { id } = await resolveParams(params);
  const analytics = getVentureAnalytics(id);

  return (
    <div className="space-y-8">
      <div>
        <Link
          href="/admin/dashboard"
          className="mb-5 inline-flex items-center gap-1.5 rounded-full border border-gold/20 bg-gold/10 px-4 py-2 font-display text-[12.5px] font-bold text-gold"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Dashboard
        </Link>
        <p className="section-label mb-2">Venture Intelligence</p>
        <h1 className="font-display text-[28px] font-extrabold tracking-tight text-pearl">
          {analytics.venture_name}
        </h1>
        <p className="mt-1 text-sm text-[#5C6B82]">
          Single-venture performance and occupancy · static demo data
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricsCard
          label="Occupancy"
          value={`${(analytics.occupancy_rate * 100).toFixed(1)}%`}
          hint={`${formatNumber(analytics.sold_plots + analytics.reserved_plots)} committed`}
          accent="gold"
          trend="up"
        />
        <MetricsCard
          label="Available"
          value={analytics.available_plots}
          hint={`${formatNumber(analytics.total_plots)} total · ${formatNumber(analytics.blocked_plots)} blocked`}
          accent="emerald"
        />
        <MetricsCard
          label="Revenue"
          value={formatCurrency(analytics.total_revenue)}
          hint={`Avg plot ${formatCurrency(analytics.average_plot_price)}`}
          accent="slate"
          trend="up"
        />
        <MetricsCard
          label="Bookings"
          value={analytics.bookings_count}
          hint={`${formatNumber(analytics.reserved_plots)} reserved`}
          accent="amber"
        />
      </div>

      <div className="flex gap-2.5">
        <Link
          href={`/admin/ventures/${id}/plots`}
          className="rounded-[10px] border border-white/10 bg-pearl/5 px-5 py-2.5 font-display text-[12.5px] font-bold text-[#8B97AD] hover:border-gold/30 hover:text-gold"
        >
          Open Inventory Matrix →
        </Link>
      </div>
    </div>
  );
}
