import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, MapPin, PlayCircle } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { VentureExplorer } from "@/components/public/VentureExplorer";
import { getVentureBySlug } from "@/lib/api";

export const dynamic = "force-dynamic";

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
  const venture = await getVentureBySlug(slug);
  return {
    title: venture?.title ?? "Venture",
    description: venture
      ? `${venture.title} · ${venture.location}`
      : undefined,
  };
}

export default async function VentureLayoutPage({ params }: VenturePageProps) {
  const { slug } = await resolveParams(params);
  const venture = await getVentureBySlug(slug);

  if (!venture) {
    notFound();
  }

  const available = venture.availablePlots ?? 0;

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
                {venture.title} — Layout Map
              </h1>
              <Badge tone="success">Live</Badge>
              {venture.dtcpReraNumber ? (
                <Badge tone="gold">{venture.dtcpReraNumber}</Badge>
              ) : null}
            </div>
            {venture.location ? (
              <p className="mt-0.5 font-mono text-[11px] tracking-wide text-[#5C6B82]">
                {venture.location.toUpperCase()}
              </p>
            ) : null}
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {venture.googleMapsUrl ? (
            <a
              href={venture.googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm text-[#8B97AD] hover:text-gold"
            >
              <MapPin className="h-3.5 w-3.5" />
              Maps
            </a>
          ) : null}
          {venture.youtubeVideoUrl ? (
            <a
              href={venture.youtubeVideoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm text-[#8B97AD] hover:text-gold"
            >
              <PlayCircle className="h-3.5 w-3.5" />
              Video
            </a>
          ) : null}
          <p className="text-sm text-[#8B97AD]">
            {available} / {venture.totalPlots} available
          </p>
        </div>
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
