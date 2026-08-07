import type {
  GlobalAnalytics,
  Plot,
  Venture,
  VentureAnalytics,
  VentureDetail,
} from "@/types/database";

const now = "2026-08-07T10:00:00.000Z";

export const MOCK_VENTURES: Venture[] = [
  {
    id: "v-grand-palms",
    slug: "grand-palms",
    name: "Grand Palms Venture",
    description:
      "DTCP-approved layout on Ongole Bypass with 40ft & 30ft blacktop roads and interactive plot availability.",
    location: "Ongole Bypass · Prakasam Dist.",
    status: "active",
    svg_url: null,
    cover_image_url:
      "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=780&h=480&fit=crop&auto=format",
    total_plots: 15,
    available_plots: 7,
    created_at: now,
    updated_at: now,
  },
  {
    id: "v-lakeview",
    slug: "lakeview-residency",
    name: "Lakeview Residency",
    description:
      "RERA-approved lakeside community with premium facing plots and clear title deeds.",
    location: "Chirala Road · Bapatla Dist.",
    status: "active",
    svg_url: null,
    cover_image_url:
      "https://images.unsplash.com/photo-1416331108676-a22ccb276e35?w=780&h=480&fit=crop&auto=format",
    total_plots: 12,
    available_plots: 5,
    created_at: now,
    updated_at: now,
  },
  {
    id: "v-sunrise",
    slug: "sunrise-gardens",
    name: "Sunrise Gardens",
    description:
      "NH-16 frontage venture with limited inventory and high-visibility corner plots.",
    location: "NH-16 Frontage · Nellore",
    status: "active",
    svg_url: null,
    cover_image_url:
      "https://images.unsplash.com/photo-1628744448840-55bdb2497bd4?w=780&h=480&fit=crop&auto=format",
    total_plots: 10,
    available_plots: 3,
    created_at: now,
    updated_at: now,
  },
];

function buildPlots(ventureId: string, count: number): Plot[] {
  const statuses = [
    "available",
    "reserved",
    "sold",
    "available",
    "available",
    "sold",
    "available",
    "reserved",
    "sold",
    "available",
    "available",
    "sold",
    "available",
    "reserved",
    "available",
  ] as const;
  const facings = ["East", "West", "North", "North-East", "South"];

  return Array.from({ length: count }, (_, i) => {
    const n = 101 + i;
    const area = i % 3 === 2 ? 2420 : 2000;
    const rate = 1500;
    return {
      id: `${ventureId}-plot-${n}`,
      venture_id: ventureId,
      plot_number: String(n),
      svg_element_id: `plot-${n}`,
      status: statuses[i % statuses.length],
      area_sqft: area,
      price: area * rate,
      facing: facings[i % facings.length],
      metadata: { road: i % 2 === 0 ? "40 Feet Road" : "30 Feet Road" },
      created_at: now,
      updated_at: now,
    };
  });
}

export const MOCK_PLOTS_BY_VENTURE: Record<string, Plot[]> = {
  "v-grand-palms": buildPlots("v-grand-palms", 15),
  "v-lakeview": buildPlots("v-lakeview", 12),
  "v-sunrise": buildPlots("v-sunrise", 10),
  // Admin routes use numeric/id path segments — alias common demo ids
  "grand-palms": buildPlots("v-grand-palms", 15),
  "1": buildPlots("v-grand-palms", 15),
};

export function getVentureBySlug(slug: string): VentureDetail | null {
  const venture = MOCK_VENTURES.find((v) => v.slug === slug);
  if (!venture) return null;
  return {
    ...venture,
    plots: MOCK_PLOTS_BY_VENTURE[venture.id] ?? [],
  };
}

export function getPlotsForVenture(id: string): Plot[] {
  if (MOCK_PLOTS_BY_VENTURE[id]) return MOCK_PLOTS_BY_VENTURE[id];
  const bySlug = MOCK_VENTURES.find((v) => v.slug === id || v.id === id);
  if (bySlug) return MOCK_PLOTS_BY_VENTURE[bySlug.id] ?? [];
  return MOCK_PLOTS_BY_VENTURE["v-grand-palms"] ?? [];
}

export const MOCK_GLOBAL_ANALYTICS: GlobalAnalytics = {
  total_ventures: 4,
  active_ventures: 3,
  total_plots: 78,
  available_plots: 31,
  reserved_plots: 12,
  sold_plots: 35,
  total_revenue: 42000000,
  bookings_this_month: 6,
  conversion_rate: 0.336,
};

export function getVentureAnalytics(id: string): VentureAnalytics {
  const venture =
    MOCK_VENTURES.find((v) => v.id === id || v.slug === id) ?? MOCK_VENTURES[0];
  const plots = getPlotsForVenture(venture.id);
  const available = plots.filter((p) => p.status === "available").length;
  const reserved = plots.filter((p) => p.status === "reserved").length;
  const sold = plots.filter((p) => p.status === "sold").length;
  const blocked = plots.filter((p) => p.status === "blocked").length;
  const revenue = plots
    .filter((p) => p.status === "sold" || p.status === "reserved")
    .reduce((sum, p) => sum + (p.price ?? 0), 0);

  return {
    venture_id: venture.id,
    venture_name: venture.name,
    total_plots: plots.length,
    available_plots: available,
    reserved_plots: reserved,
    sold_plots: sold,
    blocked_plots: blocked,
    total_revenue: revenue,
    average_plot_price:
      plots.length > 0
        ? Math.round(
            plots.reduce((sum, p) => sum + (p.price ?? 0), 0) / plots.length
          )
        : 0,
    bookings_count: reserved + sold,
    occupancy_rate: plots.length ? (sold + reserved) / plots.length : 0,
  };
}
