"use client";

import Link from "next/link";
import { useState } from "react";
import { MapPin, IndianRupee, Ruler, Route } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { cn, formatCurrency, formatNumber } from "@/lib/utils";
import type { Venture } from "@/types/database";

export interface VentureCardProps {
  venture: Venture;
}

/**
 * Luxury venture catalog card (Figma Home → VentureCard).
 */
export function VentureCard({ venture }: VentureCardProps) {
  const [hovered, setHovered] = useState(false);
  const meta = (venture as Venture & { metadata?: Record<string, unknown> })
    .metadata;
  const approval =
    (meta?.approval as string | undefined) ||
    (venture.status === "active" ? "DTCP Approved" : "Draft");
  const phase = (meta?.phase as string | undefined) || "Active Portfolio";
  const priceHint = (meta?.starting_price as number | undefined) ?? null;

  const availabilityTone =
    venture.available_plots > 0 ? ("success" as const) : ("warning" as const);

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
        {venture.cover_image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={venture.cover_image_url}
            alt={venture.name}
            className={cn(
              "h-full w-full object-cover transition-transform duration-[550ms]",
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
          <Badge tone="gold">{venture.status}</Badge>
        </div>
        <div className="absolute bottom-4 left-4">
          <span className="font-mono text-[10.5px] tracking-[0.1em] text-gold/75">
            {phase}
          </span>
        </div>
      </div>

      <div className="px-[22px] pb-5 pt-[22px]">
        <div className="mb-3.5 flex items-start justify-between gap-3">
          <div>
            <h3 className="font-display text-[19px] font-extrabold tracking-tight text-pearl">
              {venture.name}
            </h3>
            {venture.location ? (
              <p className="mt-1 flex items-center gap-1.5 text-[12.5px] text-[#8B97AD]">
                <MapPin className="h-3.5 w-3.5 shrink-0" />
                {venture.location}
              </p>
            ) : null}
          </div>
          <Badge tone={availabilityTone} dot>
            {formatNumber(venture.available_plots)} Available
          </Badge>
        </div>

        <div className="my-3.5 h-px bg-white/[0.07]" />

        <ul className="mb-[18px] space-y-1.5 text-[13px] text-[#8B97AD]">
          <li className="flex items-center gap-2">
            <IndianRupee className="h-3.5 w-3.5 text-gold" />
            {priceHint != null
              ? `Starting ${formatCurrency(priceHint)} / Sq. Yd`
              : `${formatNumber(venture.total_plots)} total plots`}
          </li>
          <li className="flex items-center gap-2">
            <Route className="h-3.5 w-3.5 text-gold" />
            Interactive SVG site layout
          </li>
          <li className="flex items-center gap-2">
            <Ruler className="h-3.5 w-3.5 text-gold" />
            {formatNumber(venture.available_plots)} of{" "}
            {formatNumber(venture.total_plots)} plots open
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
