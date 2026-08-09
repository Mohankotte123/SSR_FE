import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { InventoryMatrixClient } from "@/components/admin/InventoryMatrixClient";
import { VentureSwitcher } from "@/components/admin/VentureSwitcher";
import { getVentureBySlug, listPlots, listVentures } from "@/lib/api";

export const dynamic = "force-dynamic";

interface PlotsPageProps {
  params: Promise<{ id: string }> | { id: string };
}

async function resolveParams(
  params: PlotsPageProps["params"]
): Promise<{ id: string }> {
  return await Promise.resolve(params);
}

export async function generateMetadata({
  params,
}: PlotsPageProps): Promise<Metadata> {
  const { id } = await resolveParams(params);
  return { title: `Inventory · ${id}` };
}

export default async function InventoryMatrixPage({ params }: PlotsPageProps) {
  const { id } = await resolveParams(params);
  const [venture, plots, ventures] = await Promise.all([
    getVentureBySlug(id),
    listPlots(id),
    listVentures(),
  ]);

  const ventureId = venture?.id ?? id;
  const title = venture?.title ?? id;
  const currentSlug = venture?.slug ?? id;

  return (
    <div className="space-y-7">
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
            <p className="section-label mb-2">Inventory Management</p>
            <h1 className="font-display text-[26px] font-extrabold tracking-tight text-pearl">
              {title}
            </h1>
            <p className="mt-1 text-[13px] text-[#5C6B82]">
              <span className="font-mono text-[#8B97AD]">{currentSlug}</span> ·{" "}
              {plots.length} total plots
            </p>
          </div>
          <div className="flex flex-wrap items-end gap-3">
            <VentureSwitcher
              ventures={ventures}
              currentSlug={currentSlug}
              section="plots"
            />
            <Link
              href={`/admin/ventures/${currentSlug}/edit`}
              className="rounded-[10px] border border-white/10 bg-pearl/5 px-[18px] py-2.5 font-display text-[12.5px] font-bold text-[#8B97AD]"
            >
              Edit Venture
            </Link>
            <Link
              href={`/admin/ventures/${currentSlug}/analytics`}
              className="rounded-[10px] border border-gold/20 bg-gold/10 px-[18px] py-2.5 font-display text-[12.5px] font-bold text-gold"
            >
              View Analytics
            </Link>
          </div>
        </div>
      </div>
      <InventoryMatrixClient ventureId={ventureId} plots={plots} />
    </div>
  );
}
