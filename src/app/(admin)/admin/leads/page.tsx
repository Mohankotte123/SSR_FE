import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { LeadsTable } from "@/components/admin/LeadsTable";

export const metadata: Metadata = {
  title: "Leads",
};

export default function AdminLeadsPage() {
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
        <p className="section-label mb-2">CRM</p>
        <h1 className="font-display text-[28px] font-extrabold tracking-tight text-pearl">
          Leads
        </h1>
        <p className="mt-1 text-sm text-[#5C6B82]">
          Public inquiries from plot enquire / site-visit forms.
        </p>
      </div>
      <LeadsTable />
    </div>
  );
}
