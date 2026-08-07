import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { VentureUploadForm } from "@/components/admin/VentureUploadForm";

export const metadata: Metadata = {
  title: "Onboard Venture",
};

export default function OnboardVenturePage() {
  return (
    <div className="mx-auto max-w-[1200px] space-y-8">
      <div>
        <Link
          href="/admin/dashboard"
          className="mb-5 inline-flex items-center gap-1.5 rounded-full border border-gold/20 bg-gold/10 px-4 py-2 font-display text-[12.5px] font-bold text-gold"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Dashboard
        </Link>
        <p className="section-label mb-2">Venture Management</p>
        <h1 className="font-display text-[28px] font-extrabold tracking-tight text-pearl">
          Onboard New Land Venture
        </h1>
        <p className="mt-1.5 text-sm text-[#5C6B82]">
          Complete all fields and upload the CAD blueprint to auto-extract plot
          IDs.
        </p>
      </div>
      <VentureUploadForm />
    </div>
  );
}
