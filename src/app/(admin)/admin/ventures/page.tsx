import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, BarChart3, Grid3x3, MapPin, Plus } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { listVentures } from "@/lib/api";
import { formatNumber } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Ventures",
};

export const dynamic = "force-dynamic";

export default async function AdminVenturesPage() {
  const ventures = await listVentures();

  return (
    <div className="space-y-7">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <Link
            href="/admin/dashboard"
            className="mb-5 inline-flex items-center gap-1.5 rounded-full border border-gold/20 bg-gold/10 px-4 py-2 font-display text-[12.5px] font-bold text-gold"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Dashboard
          </Link>
          <p className="section-label mb-2">Portfolio</p>
          <h1 className="font-display text-[28px] font-extrabold tracking-tight text-pearl">
            Select a venture
          </h1>
          <p className="mt-1 text-sm text-[#5C6B82]">
            Open inventory or analytics for any published layout.
          </p>
        </div>
        <Link
          href="/admin/ventures/new"
          className="btn-gold inline-flex items-center gap-1.5 rounded-[10px] px-5 py-2.5 text-[12.5px]"
        >
          <Plus className="h-3.5 w-3.5" />
          Onboard New
        </Link>
      </div>

      {ventures.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-white/15 bg-midnight/40 px-6 py-12 text-center text-sm text-[#8B97AD]">
          No ventures yet.{" "}
          <Link href="/admin/ventures/new" className="text-gold hover:underline">
            Publish your first layout
          </Link>
          .
        </p>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {ventures.map((v) => (
            <li
              key={v.id}
              className="rounded-2xl border border-white/10 bg-midnight p-5"
            >
              <div className="mb-3 flex items-start justify-between gap-2">
                <div>
                  <h2 className="font-display text-lg font-extrabold text-pearl">
                    {v.title}
                  </h2>
                  <p className="mt-1 flex items-center gap-1.5 text-xs text-[#8B97AD]">
                    <MapPin className="h-3.5 w-3.5 shrink-0" />
                    {v.location}
                  </p>
                </div>
                <Badge tone="success" dot>
                  {formatNumber(v.availablePlots ?? 0)} avail.
                </Badge>
              </div>
              <p className="mb-4 font-mono text-[11px] text-[#5C6B82]">
                {v.slug} · {formatNumber(v.totalPlots)} plots
              </p>
              <div className="flex flex-wrap gap-2">
                <Link
                  href={`/admin/ventures/${v.slug}/plots`}
                  className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-[10px] border border-gold/20 bg-gold/10 px-3 py-2.5 font-display text-xs font-bold text-gold"
                >
                  <Grid3x3 className="h-3.5 w-3.5" />
                  Inventory
                </Link>
                <Link
                  href={`/admin/ventures/${v.slug}/analytics`}
                  className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-[10px] border border-white/10 bg-pearl/5 px-3 py-2.5 font-display text-xs font-bold text-[#8B97AD] hover:border-gold/30 hover:text-gold"
                >
                  <BarChart3 className="h-3.5 w-3.5" />
                  Analytics
                </Link>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
