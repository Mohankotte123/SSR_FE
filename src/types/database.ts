/**
 * Shared domain types for Real Estate OS.
 * Align these with your backend / DB schema as it stabilizes.
 */

export type PlotStatus = "available" | "reserved" | "sold" | "blocked";

export type VentureStatus = "draft" | "active" | "archived";

export interface Venture {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  location: string | null;
  status: VentureStatus;
  svg_url: string | null;
  cover_image_url: string | null;
  total_plots: number;
  available_plots: number;
  created_at: string;
  updated_at: string;
}

export interface Plot {
  id: string;
  venture_id: string;
  plot_number: string;
  svg_element_id: string | null;
  status: PlotStatus;
  area_sqft: number | null;
  price: number | null;
  facing: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

export interface Booking {
  id: string;
  plot_id: string;
  venture_id: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string | null;
  amount: number | null;
  status: "pending" | "confirmed" | "cancelled";
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface GlobalAnalytics {
  total_ventures: number;
  active_ventures: number;
  total_plots: number;
  available_plots: number;
  reserved_plots: number;
  sold_plots: number;
  total_revenue: number;
  bookings_this_month: number;
  conversion_rate: number;
}

export interface VentureAnalytics {
  venture_id: string;
  venture_name: string;
  total_plots: number;
  available_plots: number;
  reserved_plots: number;
  sold_plots: number;
  blocked_plots: number;
  total_revenue: number;
  average_plot_price: number;
  bookings_count: number;
  occupancy_rate: number;
}

export interface VentureDetail extends Venture {
  plots: Plot[];
}

export interface CreateVenturePayload {
  name: string;
  slug: string;
  description?: string;
  location?: string;
  svg_file?: File | null;
}

export interface CreateBookingPayload {
  plot_id: string;
  venture_id: string;
  customer_name: string;
  customer_phone: string;
  customer_email?: string;
  amount?: number;
  notes?: string;
}

export interface ApiErrorBody {
  message: string;
  code?: string;
  details?: unknown;
}
