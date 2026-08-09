import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { VentureEditForm } from "@/components/admin/VentureEditForm";
import { getVentureBySlug } from "@/lib/api";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

interface EditPageProps {
  params: Promise<{ id: string }> | { id: string };
}

async function resolveParams(
  params: EditPageProps["params"]
): Promise<{ id: string }> {
  return await Promise.resolve(params);
}

export async function generateMetadata({
  params,
}: EditPageProps): Promise<Metadata> {
  const { id } = await resolveParams(params);
  return { title: `Edit · ${id}` };
}

export default async function VentureEditPage({ params }: EditPageProps) {
  const { id } = await resolveParams(params);
  const venture = await getVentureBySlug(id);
  if (!venture) notFound();

  return (
    <div className="space-y-7">
      <div>
        <Link
          href={`/admin/ventures/${id}/plots`}
          className="mb-5 inline-flex items-center gap-1.5 rounded-full border border-gold/20 bg-gold/10 px-4 py-2 font-display text-[12.5px] font-bold text-gold"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Inventory
        </Link>
        <p className="section-label mb-2">Venture Management</p>
        <h1 className="font-display text-[28px] font-extrabold tracking-tight text-pearl">
          Edit {venture.title}
        </h1>
        <p className="mt-1 text-sm text-[#5C6B82]">
          Update copy, media, and brochure (PATCH multipart).
        </p>
      </div>
      <VentureEditForm venture={venture} />
    </div>
  );
}
