import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { BrandEditorForm } from "@/components/admin/BrandEditorForm";
import { getBrand } from "@/lib/api";

export const metadata: Metadata = {
  title: "Brand CMS",
};

export const dynamic = "force-dynamic";

export default async function BrandCmsPage() {
  const brand = await getBrand();

  return (
    <div className="space-y-7">
      <div>
        <Link
          href="/admin/dashboard"
          className="mb-5 inline-flex items-center gap-1.5 rounded-full border border-gold/20 bg-gold/10 px-4 py-2 font-display text-[12.5px] font-bold text-gold"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Dashboard
        </Link>
        <p className="section-label mb-2">Brand / CMS</p>
        <h1 className="font-display text-[28px] font-extrabold tracking-tight text-pearl">
          Site brand settings
        </h1>
        <p className="mt-1 text-sm text-[#5C6B82]">
          Hero stats, contact block, and proprietor message.
        </p>
      </div>
      <BrandEditorForm initial={brand} />
    </div>
  );
}
