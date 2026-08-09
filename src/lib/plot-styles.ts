import type { PlotStatus } from "@/types/database";

export const PLOT_STATUS_COLOR: Record<PlotStatus, string> = {
  available: "#2E9E6B",
  reserved: "#C4923A",
  sold: "#C45A4A",
  blocked: "#5C6B82",
};

export const PLOT_STATUS_FILL: Record<PlotStatus, string> = {
  available: "rgba(46,158,107,0.20)",
  reserved: "rgba(196,146,58,0.20)",
  sold: "rgba(196,90,74,0.20)",
  blocked: "rgba(92,107,130,0.18)",
};

export const PLOT_STATUS_STROKE: Record<PlotStatus, string> = {
  available: "rgba(46,158,107,0.50)",
  reserved: "rgba(196,146,58,0.50)",
  sold: "rgba(196,90,74,0.50)",
  blocked: "rgba(92,107,130,0.45)",
};

export const PLOT_STATUS_CLASS: Record<PlotStatus, string> = {
  available: "status-available",
  reserved: "status-reserved",
  sold: "status-sold",
  blocked: "status-blocked",
};

export const PLOT_DOT_CLASS: Record<PlotStatus, string> = {
  available: "dot-available",
  reserved: "dot-reserved",
  sold: "dot-sold",
  blocked: "inline-block h-1.5 w-1.5 rounded-full bg-slate-light",
};

export function statusLabel(status: PlotStatus): string {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

/** e.g. "East Facing" or "North-West Corner" */
export function formatFacingLabel(
  facing: string | null | undefined
): string | null {
  if (!facing?.trim()) return null;
  const key = facing.trim().toLowerCase().replace(/-/g, "_");
  const map: Record<string, string> = {
    east: "East Facing",
    west: "West Facing",
    north: "North Facing",
    south: "South Facing",
    north_east: "North-East Corner",
    north_west: "North-West Corner",
    south_east: "South-East Corner",
    south_west: "South-West Corner",
  };
  return (
    map[key] ??
    `${facing
      .replace(/_/g, "-")
      .replace(/\b\w/g, (c) => c.toUpperCase())} Facing`
  );
}

export function whatsappEnquireUrl(opts: {
  plotNumber: string;
  ventureName?: string;
  phone?: string;
  areaLabel?: string;
}): string {
  const phone = (
    opts.phone ||
    process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ||
    "919876543210"
  ).replace(/\D/g, "");
  const areaBit = opts.areaLabel ? ` (${opts.areaLabel})` : "";
  const ventureBit = opts.ventureName ? ` in ${opts.ventureName}` : "";
  const text = encodeURIComponent(
    `Hi, I am interested in Plot #${opts.plotNumber}${areaBit}${ventureBit}. Please share availability and next steps.`
  );
  return `https://wa.me/${phone}?text=${text}`;
}
