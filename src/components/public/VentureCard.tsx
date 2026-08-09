"use client";

import Link from "next/link";
import { useState } from "react";
import { MapPin, IndianRupee, Ruler, Route } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { cn, formatNumber } from "@/lib/utils";
import type { Venture } from "@/types/database";

export interface VentureCardProps {
  venture: Venture;
}

/**
 * Luxury venture catalog card (Figma Home → VentureCard).
 */
export function VentureCard({ venture }: VentureCardProps) {
  const [hovered, setHovered] = useState(false);
  const available = venture.availablePlots ?? 0;
  const approval = venture.dtcpReraNumber
    ? `DTCP / RERA · ${venture.dtcpReraNumber}`
    : "Approved layout";

  const availabilityTone =
    available > 0 ? ("success" as const) : ("warning" as const);

  return (
    <article
      className={cn(
        "overflow-hidden rounded-card border border-white/10 bg-midnight shadow-glass transition-all duration-300",
        hovered &&
          "-translate-y-[3px] border-gold/20 shadow-[0_16px_48px_rgba(0,0,0,0.35)]"
      )}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="relative h-[230px] overflow-hidden bg-midnight">
        {venture.coverImageUrl || venture.svgLayoutUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={venture.coverImageUrl || venture.svgLayoutUrl || ""}
            alt={`${venture.title} layout`}
            className={cn(
              "h-full w-full transition-transform duration-[550ms]",
              venture.coverImageUrl
                ? "object-cover"
                : "object-contain bg-[#EEF2F8] p-4",
              hovered ? "scale-105" : "scale-100"
            )}
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-gradient-to-br from-midnight to-obsidian text-sm text-[#5C6B82]">
            Layout preview
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-obsidian/80 via-obsidian/15 to-transparent" />
        <div className="absolute left-4 top-4 flex flex-wrap gap-1.5">
          <Badge tone="neutral">{approval}</Badge>
          <Badge tone="gold">Live</Badge>
        </div>
        <div className="absolute bottom-4 left-4">
          <span className="font-mono text-[10.5px] tracking-[0.1em] text-gold/75">
            Active Portfolio
          </span>
        </div>
      </div>

      <div className="px-[22px] pb-5 pt-[22px]">
        <div className="mb-3.5 flex items-start justify-between gap-3">
          <div>
            <h3 className="font-display text-[19px] font-extrabold tracking-tight text-pearl">
              {venture.title}
            </h3>
            {venture.description ? (
              <p className="mt-1 line-clamp-2 text-[12.5px] text-[#8B97AD]">
                {venture.description}
              </p>
            ) : null}
            {venture.location ? (
              <p className="mt-1 flex items-center gap-1.5 text-[12.5px] text-[#8B97AD]">
                <MapPin className="h-3.5 w-3.5 shrink-0" />
                {venture.location}
              </p>
            ) : null}
          </div>
          <Badge tone={availabilityTone} dot>
            {formatNumber(available)} Available
          </Badge>
        </div>

        <div className="my-3.5 h-px bg-white/[0.07]" />

        <ul className="mb-[18px] space-y-1.5 text-[13px] text-[#8B97AD]">
          <li className="flex items-center gap-2">
            <IndianRupee className="h-3.5 w-3.5 text-gold" />
            {formatNumber(venture.totalPlots)} total plots
          </li>
          <li className="flex items-center gap-2">
            <Route className="h-3.5 w-3.5 text-gold" />
            Interactive SVG site layout
          </li>
          <li className="flex items-center gap-2">
            <Ruler className="h-3.5 w-3.5 text-gold" />
            {formatNumber(available)} of {formatNumber(venture.totalPlots)}{" "}
            plots open
          </li>
        </ul>

        <Link
          href={`/ventures/${venture.slug}`}
          className="btn-gold flex w-full items-center justify-center rounded-xl py-3 text-[13px]"
        >
          Explore Interactive Layout Map →
        </Link>
      </div>
    </article>
  );
}
