import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { VentureExplorer } from "@/components/public/VentureExplorer";
import { getVentureBySlug } from "@/lib/mock-data";

interface VenturePageProps {
  params: Promise<{ slug: string }> | { slug: string };
}

async function resolveParams(
  params: VenturePageProps["params"]
): Promise<{ slug: string }> {
  return await Promise.resolve(params);
}

export async function generateMetadata({
  params,
}: VenturePageProps): Promise<Metadata> {
  const { slug } = await resolveParams(params);
  const venture = getVentureBySlug(slug);
  return {
    title: venture?.name ?? "Venture",
    description: venture?.description ?? undefined,
  };
}

export default async function VentureLayoutPage({ params }: VenturePageProps) {
  const { slug } = await resolveParams(params);
  const venture = getVentureBySlug(slug);

  if (!venture) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-obsidian pt-[72px]">
      <div className="glass-dark sticky top-[72px] z-40 flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.08] px-5 py-3.5 sm:px-7">
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 rounded-full border border-gold/20 bg-gold/10 px-4 py-2 font-display text-[13px] font-bold text-gold transition hover:bg-gold/15"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back
          </Link>
          <div className="hidden h-8 w-px bg-white/[0.08] sm:block" />
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="font-display text-[17px] font-extrabold tracking-tight text-pearl">
                {venture.name} — Layout Map
              </h1>
              <Badge tone={venture.status === "active" ? "success" : "neutral"}>
                {venture.status}
              </Badge>
            </div>
            {venture.location ? (
              <p className="mt-0.5 font-mono text-[11px] tracking-wide text-[#5C6B82]">
                {venture.location.toUpperCase()}
              </p>
            ) : null}
          </div>
        </div>
        <p className="text-sm text-[#8B97AD]">
          {venture.available_plots} / {venture.total_plots} available
        </p>
      </div>

      <div className="px-4 py-7 sm:px-7">
        {venture.description ? (
          <p className="mx-auto mb-5 max-w-3xl text-sm text-[#8B97AD]">
            {venture.description}
          </p>
        ) : null}
        <VentureExplorer venture={venture} />
      </div>
    </div>
  );
}
