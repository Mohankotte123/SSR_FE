"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ExternalLink, Map, MapPin, IndianRupee, Ruler, Route } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import {
  cn,
  formatNumber,
  toGoogleMapsEmbedUrl,
  toGoogleMapsOpenUrl,
} from "@/lib/utils";
import type { Venture } from "@/types/database";

export interface VentureCardProps {
  venture: Venture;
}

/**
 * Luxury venture catalog card (Figma Home → VentureCard).
 */
export function VentureCard({ venture }: VentureCardProps) {
  const [hovered, setHovered] = useState(false);
  const [mapsOpen, setMapsOpen] = useState(false);
  const [mapLoading, setMapLoading] = useState(true);
  const available = venture.availablePlots ?? 0;
  const mapsUrl = venture.googleMapsUrl?.trim() || null;

  const availabilityTone =
    available > 0 ? ("success" as const) : ("warning" as const);

  const embedSrc = mapsUrl
    ? toGoogleMapsEmbedUrl(mapsUrl, venture.location)
    : null;

  useEffect(() => {
    if (mapsOpen) setMapLoading(true);
  }, [mapsOpen]);

  function openMaps() {
    setMapLoading(true);
    setMapsOpen(true);
  }

  return (
    <>
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
            {mapsUrl ? (
              <button
                type="button"
                onClick={openMaps}
                className="view-map-btn inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 font-display text-[11px] font-bold tracking-wide text-gold-light backdrop-blur-md transition duration-300"
                aria-label={`View ${venture.title} on Google Maps`}
              >
                <Map className="view-map-icon h-3.5 w-3.5 text-gold" />
                View map
              </button>
            ) : null}
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
            <div className="min-w-0">
              <h3 className="font-display text-[19px] font-extrabold tracking-tight text-pearl">
                {venture.title}
              </h3>
              {venture.description ? (
                <p className="mt-1 line-clamp-2 text-[12.5px] text-[#8B97AD]">
                  {venture.description}
                </p>
              ) : null}
              {venture.location ? (
                <p className="mt-1.5 flex items-start gap-1.5 text-[12.5px] leading-snug text-[#8B97AD]">
                  <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 opacity-70" />
                  <span>{venture.location}</span>
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

      {mapsUrl && embedSrc ? (
        <Modal
          open={mapsOpen}
          onClose={() => setMapsOpen(false)}
          title={venture.title}
          subtitle={venture.location || "Location"}
          className="max-w-3xl"
          footer={
            <div className="flex flex-wrap items-center justify-between gap-3">
              <a
                href={toGoogleMapsOpenUrl(mapsUrl, venture.location)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-gold hover:underline"
              >
                Open in Google Maps
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
              <button
                type="button"
                onClick={() => setMapsOpen(false)}
                className="rounded-xl border border-white/10 bg-white/[0.06] px-4 py-2 text-sm font-semibold text-[#8B97AD] hover:text-pearl"
              >
                Close
              </button>
            </div>
          }
        >
          <div className="relative -mx-7 -my-5 aspect-[4/3] overflow-hidden bg-[#0E1428] sm:aspect-video">
            {mapLoading ? (
              <div
                className="absolute inset-0 z-10 flex flex-col bg-[#121A2E]"
                aria-busy="true"
                aria-label="Loading map"
              >
                <div className="h-full w-full animate-pulse bg-gradient-to-br from-[#1A2438] via-[#152033] to-[#0E1428]">
                  <div className="flex h-full flex-col justify-between p-5">
                    <div className="flex gap-2">
                      <div className="h-8 w-28 rounded-lg bg-white/10" />
                      <div className="h-8 w-8 rounded-lg bg-white/10" />
                    </div>
                    <div className="mx-auto flex flex-col items-center gap-2">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full border border-gold/30 bg-gold/10">
                        <Map className="h-5 w-5 text-gold/80" />
                      </div>
                      <p className="font-display text-xs font-semibold text-[#8B97AD]">
                        Loading map…
                      </p>
                    </div>
                    <div className="flex justify-end gap-2">
                      <div className="h-8 w-8 rounded-lg bg-white/10" />
                      <div className="h-8 w-8 rounded-lg bg-white/10" />
                    </div>
                  </div>
                </div>
              </div>
            ) : null}
            <iframe
              title={`${venture.title} location map`}
              src={mapsOpen ? embedSrc : undefined}
              className={cn(
                "h-full w-full border-0 transition-opacity duration-300",
                mapLoading ? "opacity-0" : "opacity-100"
              )}
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
              onLoad={() => setMapLoading(false)}
            />
          </div>
        </Modal>
      ) : null}
    </>
  );
}
